"""
Pagos Service - Business logic for MercadoPago payments
"""
import uuid
from typing import Optional, Any

import mercadopago
from fastapi import HTTPException, status
from sqlmodel import Session

from core.config import settings
from db.models import Pago, Pedido, HistorialEstadoPedido
from modules.pagos.repository import PagoRepository
from modules.pedidos.repository import PedidoRepository


class PagoService:
    """Service for payment operations with MercadoPago SDK."""

    def __init__(self, session: Session):
        self.session = session
        self.repo = PagoRepository(session)
        self.sdk = mercadopago.SDK(settings.mp_access_token)

    def crear_pago(self, pedido_id: int, card_token: str, usuario_id: int) -> dict[str, Any]:
        """
        Create a payment with MercadoPago.
        
        Steps:
        1. Validate pedido exists and belongs to user
        2. Validate pedido is in PENDIENTE state
        3. Generate idempotency_key UUID
        4. Call MercadoPago SDK payment.create()
        5. Register Pago in database
        """
        # Validate pedido
        pedido = self.session.get(Pedido, pedido_id)
        if not pedido or pedido.eliminado_en:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido no encontrado",
            )
        
        if pedido.usuario_id != usuario_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para pagar este pedido",
            )
        
        if pedido.estado_codigo != "PENDIENTE":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El pedido está en estado {pedido.estado_codigo}. Solo se pueden pagar pedidos en estado PENDIENTE.",
            )
        
        # Check for existing payment with same pedido_id (in non-terminal state)
        existing_pago = self.repo.get_by_pedido_id(pedido_id)
        if existing_pago and existing_pago.mp_status not in ("rejected", "cancelled"):
            # There's already an active payment for this pedido
            if existing_pago.mp_status == "approved":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Este pedido ya tiene un pago aprobado",
                )
            # For pending/in_process, return existing
            return self._build_pago_response(existing_pago)
        
        # Generate idempotency key
        idempotency_key = str(uuid.uuid4())
        external_reference = f"pedido_{pedido_id}"
        
        # Call MercadoPago SDK
        try:
            payment_data = {
                "transaction_amount": float(pedido.total),
                "token": card_token,
                "description": f"Food Store - Pedido #{pedido_id}",
                "installments": 1,
                "payment_method_id": "visa",
                "payer": {
                    "email": "test@test.com",
                },
                "external_reference": external_reference,
            }
            
            # Use idempotency_key in header
            result = self.sdk.payment().create(payment_data, {"x-idempotency-key": idempotency_key})
            
            if result["status"] == 201:
                mp_response = result["response"]
                mp_payment_id = mp_response.get("id")
                mp_status = mp_response.get("status", "pending")
                
                # Register payment in database
                pago = Pago(
                    pedido_id=pedido_id,
                    monto=float(pedido.total),
                    mp_payment_id=mp_payment_id,
                    mp_status=mp_status,
                    external_reference=external_reference,
                    idempotency_key=idempotency_key,
                )
                
                try:
                    self.repo.create_pago(pago)
                    self.session.commit()
                    self.session.refresh(pago)
                except Exception:
                    self.session.rollback()
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Error al registrar el pago en la base de datos",
                    )
                
                # If already approved, transition the pedido
                if mp_status == "approved":
                    self._transicionar_pedido(pedido_id, pago.id)
                
                return self._build_pago_response(pago)
            else:
                # Payment rejected by MP
                mp_response = result.get("response", {})
                mp_status = mp_response.get("status", "rejected")
                status_detail = mp_response.get("status_detail", "Pago rechazado")
                
                # Register rejected payment (if we have an ID, otherwise use fallback)
                mp_payment_id = mp_response.get("id")
                
                pago = Pago(
                    pedido_id=pedido_id,
                    monto=float(pedido.total),
                    mp_payment_id=mp_payment_id,
                    mp_status=mp_status,
                    external_reference=external_reference,
                    idempotency_key=idempotency_key,
                )
                self.repo.create_pago(pago)
                self.session.commit()
                self.session.refresh(pago)
                
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail={
                        "message": "Pago rechazado",
                        "status_detail": status_detail,
                        "mp_status": mp_status,
                    },
                )
                
        except HTTPException:
            raise
        except Exception as e:
            self.session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al procesar el pago: {str(e)}",
            )

    def procesar_webhook(self, notification: dict) -> dict[str, str]:
        """
        Process MercadoPago IPN webhook notification.
        
        Steps:
        1. Validate notification has type and data.id
        2. Consult GET /v1/payments/{mp_payment_id} to verify status
        3. Update mp_status in database
        4. If approved: transition pedido PENDIENTE → CONFIRMADO
        """
        notification_type = notification.get("type")
        data = notification.get("data", {})
        mp_payment_id = data.get("id") if data else None
        
        if not notification_type or not mp_payment_id:
            return {"status": "ok", "detail": "Notificación ignorada: sin type o data.id"}
        
        # Only process payment notifications
        if notification_type != "payment":
            return {"status": "ok", "detail": f"Notificación ignorada: type={notification_type}"}
        
        try:
            # Consult API MP to verify payment status
            result = self.sdk.payment().get(mp_payment_id)
            if result["status"] != 200:
                return {"status": "ok", "detail": "No se pudo verificar el pago en MP"}
            
            mp_response = result["response"]
            mp_status = mp_response.get("status", "pending")
            
            # Find payment in our database
            pago = self.repo.get_by_mp_payment_id(mp_payment_id)
            if not pago:
                # Payment not in our system - could be from another source
                return {"status": "ok", "detail": "Pago no encontrado en BD"}
            
            old_status = pago.mp_status
            
            # Update payment status
            pago.mp_status = mp_status
            self.repo.update(pago)
            
            # If newly approved, transition pedido
            if mp_status == "approved" and old_status != "approved":
                self._transicionar_pedido(pago.pedido_id, pago.id)
            
            self.session.commit()
            
            return {"status": "ok", "detail": f"Pago {mp_payment_id} actualizado a {mp_status}"}
            
        except Exception as e:
            self.session.rollback()
            # Log error but return 200 to MP (MP will retry)
            return {"status": "ok", "detail": f"Error procesando webhook: {str(e)}"}

    def obtener_pago_por_pedido(self, pedido_id: int, usuario_id: int, roles: list[str]) -> dict:
        """
        Get payment by pedido_id.
        Only the owner or ADMIN can view.
        """
        pedido = self.session.get(Pedido, pedido_id)
        if not pedido or pedido.eliminado_en:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido no encontrado",
            )
        
        # Check permissions
        is_admin = "ADMIN" in roles
        if pedido.usuario_id != usuario_id and not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para ver el pago de este pedido",
            )
        
        pago = self.repo.get_by_pedido_id(pedido_id)
        if not pago:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No se encontró un pago para este pedido",
            )
        
        return self._build_pago_response(pago)

    def _transicionar_pedido(self, pedido_id: int, pago_id: int) -> None:
        """
        Transition pedido from PENDIENTE to CONFIRMADO.
        Called when payment is approved (from crear_pago or webhook).
        """
        pedido = self.session.get(Pedido, pedido_id)
        if not pedido or pedido.eliminado_en:
            return
        
        if pedido.estado_codigo != "PENDIENTE":
            return  # Already confirmed or cancelled
        
        # Decrement stock atomically
        pedido_repo = PedidoRepository(self.session)
        detalles = pedido_repo.get_detalles(pedido_id)
        for det in detalles:
            pedido_repo.decrementar_stock(det.producto_id, det.cantidad)
        
        # Update pedido state
        from datetime import datetime
        pedido.estado_codigo = "CONFIRMADO"
        pedido.actualizado_en = datetime.utcnow()
        self.session.add(pedido)
        
        # Register history entry
        historial = HistorialEstadoPedido(
            pedido_id=pedido_id,
            estado_desde="PENDIENTE",
            estado_hacia="CONFIRMADO",
            usuario_id=None,  # System action
            observacion=f"Pago #{pago_id} aprobado vía MercadoPago",
        )
        self.session.add(historial)

    def _build_pago_response(self, pago: Pago) -> dict[str, Any]:
        """Build PagoResponse dict from Pago model."""
        return {
            "id": pago.id,
            "pedido_id": pago.pedido_id,
            "monto": pago.monto,
            "mp_payment_id": pago.mp_payment_id,
            "mp_status": pago.mp_status,
            "external_reference": pago.external_reference,
            "creado_en": pago.creado_en.isoformat() if pago.creado_en else None,
        }
