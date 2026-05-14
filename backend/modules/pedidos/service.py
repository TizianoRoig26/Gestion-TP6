"""
Pedidos Service - Business logic for orders with FSM
"""
from datetime import datetime
from typing import Optional

from fastapi import HTTPException, status

from db.models import (
    Pedido,
    DetallePedido,
    DetallePedidoIngredienteRemovido,
    HistorialEstadoPedido,
    EstadoPedido,
    FormaPago,
    DireccionEntrega,
    Usuario,
)
from modules.pedidos.repository import PedidoRepository
from modules.pedidos.schemas import CambioEstadoRequest
from typing import Any


# =============================================================================
# FSM - Finite State Machine Configuration
# =============================================================================

# Map of valid transitions: current_state -> [allowed_next_states]
TRANSICIONES_PERMITIDAS = {
    "PENDIENTE": ["CONFIRMADO", "CANCELADO"],
    "CONFIRMADO": ["EN_PREPARACION", "CANCELADO"],
    "EN_PREPARACION": ["EN_CAMINO", "CANCELADO"],
    "EN_CAMINO": ["ENTREGADO"],
    "ENTREGADO": [],       # terminal
    "CANCELADO": [],       # terminal
}

# Roles allowed per transition
# Format: (from_state, to_state) -> [allowed_role_codes]
# CLIENT = owner of the order
TRANSICIONES_ROLES = {
    ("PENDIENTE", "CONFIRMADO"): ["PEDIDOS", "ADMIN"],  # Admin manual + webhook MP
    ("PENDIENTE", "CANCELADO"): ["CLIENT", "PEDIDOS", "ADMIN"],
    ("CONFIRMADO", "EN_PREPARACION"): ["PEDIDOS", "ADMIN"],
    ("CONFIRMADO", "CANCELADO"): ["PEDIDOS", "ADMIN"],
    ("EN_PREPARACION", "EN_CAMINO"): ["PEDIDOS", "ADMIN"],
    ("EN_PREPARACION", "CANCELADO"): ["ADMIN"],  # Solo ADMIN
    ("EN_CAMINO", "ENTREGADO"): ["PEDIDOS", "ADMIN"],
}

ESTADOS_TERMINALES = {"ENTREGADO", "CANCELADO"}

# Estados que requieren motivo de cancelación
ESTADOS_CANCELABLES_CON_MOTIVO = {"PENDIENTE", "CONFIRMADO", "EN_PREPARACION"}


def es_transicion_valida(estado_actual: str, estado_nuevo: str) -> bool:
    """Check if a state transition is valid according to FSM."""
    permitidos = TRANSICIONES_PERMITIDAS.get(estado_actual, [])
    return estado_nuevo in permitidos


def tiene_permiso_transicion(estado_actual: str, estado_nuevo: str, usuario: Usuario, roles: list[str], es_owner: bool = False) -> bool:
    """
    Check if user has permission to perform a state transition.
    
    Args:
        estado_actual: Current order state
        estado_nuevo: Target order state
        usuario: The user performing the action
        roles: User's role codes
        es_owner: Whether the user owns the order (for CLIENT role)
    """
    roles_permitidos = TRANSICIONES_ROLES.get((estado_actual, estado_nuevo), [])
    
    # If CLIENT is allowed AND user is the owner
    if "CLIENT" in roles_permitidos and es_owner:
        return True
    
    # Check if user has any of the required roles
    for rol in roles:
        if rol in roles_permitidos:
            return True
    
    return False


def necesita_motivo_cancelacion(estado_actual: str) -> bool:
    """Check if cancellation requires a reason."""
    return estado_actual in ESTADOS_CANCELABLES_CON_MOTIVO


# =============================================================================
# SERVICE
# =============================================================================

class PedidoService:
    """Service for order operations."""

    def __init__(self, session):
        self.session = session
        self.repo = PedidoRepository(session)

    # -------------------------------------------------------------------------
    # ORDER CREATION
    # -------------------------------------------------------------------------

    def crear_pedido(
        self,
        usuario_id: int,
        data: dict,
    ) -> dict[str, Any]:
        """
        Create a new order atomically with stock validation.
        
        Steps:
        1. Validate stock for all items (SELECT FOR UPDATE)
        2. Create Pedido with snapshots
        3. Create DetallePedido for each item
        4. Create DetallePedidoIngredienteRemovido for customizations
        5. Register initial history entry
        6. Commit transaction
        """
        detalles_data = data.pop("detalles", [])
        
        if not detalles_data:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="El pedido debe tener al menos un detalle",
            )

        # Validate stock first
        items_to_check = [
            (d["producto_id"], d["cantidad"])
            for d in detalles_data
        ]
        stock_errors = self.repo.validar_stock(items_to_check)
        
        if stock_errors:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "message": "Stock insuficiente para algunos productos",
                    "errors": stock_errors,
                },
            )

        try:
            # Calculate total
            subtotal_items = 0
            for d in detalles_data:
                subtotal_items += d.get("subtotal", 0) or (d["cantidad"] * 0)
            
            costo_envio = data.get("costo_envio", 50.0)
            total = subtotal_items + costo_envio

            # Get address snapshot — from request body (text input) or from DB address
            direccion_snapshot = data.get("direccion_snapshot")
            direccion_id = data.get("direccion_id")
            if not direccion_snapshot and direccion_id:
                direccion = self.repo.get_direccion(direccion_id)
                if direccion:
                    direccion_snapshot = (
                        f"{direccion.linea1}"
                        f"{', ' + direccion.linea2 if direccion.linea2 else ''}"
                        f", {direccion.ciudad}"
                        f" ({direccion.codigo_postal})"
                    )

            # Create Pedido
            pedido = Pedido(
                usuario_id=usuario_id,
                estado_codigo="PENDIENTE",
                direccion_id=direccion_id,
                forma_pago_codigo=data["forma_pago_codigo"],
                total=total,
                costo_envio=costo_envio,
                direccion_snapshot=direccion_snapshot,
            )
            pedido = self.repo.create_pedido(pedido)

            # Create DetallePedido for each item
            for d in detalles_data:
                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=d["producto_id"],
                    cantidad=d["cantidad"],
                    precio_snapshot=d.get("precio_snapshot", 0),
                    nombre_snapshot=d.get("nombre_snapshot", ""),
                    subtotal=d.get("subtotal", 0),
                )
                detalle = self.repo.create_detalle(detalle)

                # Create DetallePedidoIngredienteRemovido for customizations
                personalizacion = d.get("personalizacion") or d.get("ingredientes_excluidos", [])
                if personalizacion:
                    for ing_id in personalizacion:
                        self.repo.add_ingrediente_removido(
                            DetallePedidoIngredienteRemovido(
                                detalle_pedido_id=detalle.id,
                                ingrediente_id=ing_id,
                            )
                        )

            # Register initial history entry
            historial = HistorialEstadoPedido(
                pedido_id=pedido.id,
                estado_desde=None,
                estado_hacia="PENDIENTE",
                usuario_id=usuario_id,
                observacion="Pedido creado",
            )
            self.repo.add_historial(historial)

            # Commit transaction
            self.repo.commit()
            self.session.refresh(pedido)

            return self._build_pedido_read(pedido)

        except HTTPException:
            self.repo.rollback()
            raise
        except Exception as e:
            self.repo.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al crear el pedido: {str(e)}",
            )

    # -------------------------------------------------------------------------
    # STATE TRANSITIONS (FSM)
    # -------------------------------------------------------------------------

    def cambiar_estado(
        self,
        pedido_id: int,
        nuevo_estado: str,
        usuario: Usuario,
        roles: list[str],
        observacion: Optional[str] = None,
        es_owner: bool = False,
    ) -> dict[str, Any]:
        """
        Change order state with FSM validation and side effects.
        
        Side effects:
        - PENDIENTE -> CONFIRMADO: decrement stock
        - CONFIRMADO -> CANCELADO: restore stock
        """
        pedido = self.repo.get_by_id(pedido_id)
        if not pedido or pedido.eliminado_en:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido no encontrado",
            )

        estado_actual = pedido.estado_codigo

        # Validate FSM transition
        if not es_transicion_valida(estado_actual, nuevo_estado):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Transición inválida: {estado_actual} → {nuevo_estado}. "
                       f"Transiciones permitidas desde {estado_actual}: "
                       f"{', '.join(TRANSICIONES_PERMITIDAS.get(estado_actual, []))}",
            )

        # Validate role permissions
        if not tiene_permiso_transicion(estado_actual, nuevo_estado, usuario, roles, es_owner):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para realizar esta transición",
            )

        # Validate motivo for cancellations
        if nuevo_estado == "CANCELADO" and necesita_motivo_cancelacion(estado_actual):
            if not observacion:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Motivo de cancelación es obligatorio",
                )

        # Execute side effects
        try:
            if nuevo_estado == "CONFIRMADO" and estado_actual == "PENDIENTE":
                # Decrement stock atomically
                detalles = self.repo.get_detalles(pedido_id)
                for det in detalles:
                    self.repo.decrementar_stock(det.producto_id, det.cantidad)

            elif nuevo_estado == "CANCELADO" and estado_actual == "CONFIRMADO":
                # Restore stock atomically
                detalles = self.repo.get_detalles(pedido_id)
                for det in detalles:
                    self.repo.restaurar_stock(det.producto_id, det.cantidad)

            # Update order state
            self.repo.update_estado(pedido, nuevo_estado)

            # Register history
            historial = HistorialEstadoPedido(
                pedido_id=pedido_id,
                estado_desde=estado_actual,
                estado_hacia=nuevo_estado,
                usuario_id=usuario.id,
                observacion=observacion or f"Transición: {estado_actual} → {nuevo_estado}",
            )
            self.repo.add_historial(historial)

            self.repo.commit()
            self.session.refresh(pedido)

            return self._build_pedido_read(pedido)

        except HTTPException:
            self.repo.rollback()
            raise
        except Exception as e:
            self.repo.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al cambiar estado: {str(e)}",
            )

    # -------------------------------------------------------------------------
    # QUERIES - CLIENT
    # -------------------------------------------------------------------------

    def listar_mis_pedidos(
        self,
        usuario_id: int,
        estado_codigo: Optional[str] = None,
        page: int = 1,
        page_size: int = 10,
    ) -> dict:
        """List current user's orders with pagination."""
        items, total = self.repo.get_by_user(
            usuario_id=usuario_id,
            estado_codigo=estado_codigo,
            page=page,
            page_size=page_size,
        )

        pages = max(1, (total + page_size - 1) // page_size)

        return {
            "items": [self._build_pedido_resumen(p) for p in items],
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": pages,
        }

    def obtener_pedido(self, pedido_id: int, usuario_id: int, roles: list[str]) -> dict[str, Any]:
        """Get order detail with ownership validation."""
        pedido = self.repo.get_by_id(pedido_id)
        if not pedido or pedido.eliminado_en:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido no encontrado",
            )

        # Only owner or admin/pedidos can view
        is_admin = any(r in ["ADMIN", "PEDIDOS"] for r in roles)
        if pedido.usuario_id != usuario_id and not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para ver este pedido",
            )

        return self._build_pedido_read(pedido)

    # -------------------------------------------------------------------------
    # QUERIES - ADMIN
    # -------------------------------------------------------------------------

    def listar_todos_pedidos(
        self,
        estado_codigo: Optional[str] = None,
        fecha_desde: Optional[datetime] = None,
        fecha_hasta: Optional[datetime] = None,
        busqueda: Optional[str] = None,
        page: int = 1,
        page_size: int = 10,
    ) -> dict:
        """List all orders (admin) with filters and pagination."""
        items, total = self.repo.get_all(
            estado_codigo=estado_codigo,
            fecha_desde=fecha_desde,
            fecha_hasta=fecha_hasta,
            busqueda=busqueda,
            page=page,
            page_size=page_size,
        )

        pages = max(1, (total + page_size - 1) // page_size)

        return {
            "items": [self._build_pedido_resumen(p) for p in items],
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": pages,
        }

    def obtener_pedido_admin(self, pedido_id: int) -> dict[str, Any]:
        """Get any order detail (admin, no ownership check)."""
        pedido = self.repo.get_by_id(pedido_id)
        if not pedido or pedido.eliminado_en:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido no encontrado",
            )

        return self._build_pedido_read(pedido)

    # -------------------------------------------------------------------------
    # HISTORY
    # -------------------------------------------------------------------------

    def obtener_historial(self, pedido_id: int, usuario_id: int, roles: list[str]) -> list[dict]:
        """Get order status history with ownership validation."""
        pedido = self.repo.get_by_id(pedido_id)
        if not pedido or pedido.eliminado_en:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido no encontrado",
            )

        # Only owner or admin/pedidos can view history
        is_admin = any(r in ["ADMIN", "PEDIDOS"] for r in roles)
        if pedido.usuario_id != usuario_id and not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para ver el historial de este pedido",
            )

        historial = self.repo.get_historial(pedido_id)
        return [
            {
                "id": h.id,
                "pedido_id": h.pedido_id,
                "estado_desde": h.estado_desde,
                "estado_hacia": h.estado_hacia,
                "usuario_id": h.usuario_id,
                "observacion": h.observacion,
                "creado_en": h.creado_en.isoformat() if h.creado_en else None,
            }
            for h in historial
        ]

    # -------------------------------------------------------------------------
    # HELPERS - Build response DTOs
    # -------------------------------------------------------------------------

    def _build_pedido_resumen(self, pedido: Pedido) -> dict:
        """Build a summary response for order lists."""
        detalles = self.repo.get_detalles(pedido.id)
        return {
            "id": pedido.id,
            "usuario_id": pedido.usuario_id,
            "estado_codigo": pedido.estado_codigo,
            "total": pedido.total,
            "costo_envio": pedido.costo_envio,
            "items_count": len(detalles),
            "creado_en": pedido.creado_en.isoformat() if pedido.creado_en else None,
            "actualizado_en": pedido.actualizado_en.isoformat() if pedido.actualizado_en else None,
        }

    def _build_pedido_read(self, pedido: Pedido) -> dict:
        """Build a full order detail response."""
        # Load estado
        estado = self.repo.get_estado(pedido.estado_codigo)
        estado_dict = {
            "codigo": estado.codigo,
            "nombre": estado.nombre,
            "descripcion": estado.descripcion,
            "es_terminal": estado.es_terminal,
        } if estado else None

        # Load forma_pago
        forma_pago = self.repo.get_forma_pago(pedido.forma_pago_codigo)
        fp_dict = {
            "codigo": forma_pago.codigo,
            "nombre": forma_pago.nombre,
            "habilitado": forma_pago.habilitado,
        } if forma_pago else None

        # Load detalles
        detalles = self.repo.get_detalles(pedido.id)
        detalles_list = []
        for d in detalles:
            ingredientes = self.repo.get_ingredientes_removidos(d.id)
            detalles_list.append({
                "id": d.id,
                "pedido_id": d.pedido_id,
                "producto_id": d.producto_id,
                "cantidad": d.cantidad,
                "precio_snapshot": d.precio_snapshot,
                "nombre_snapshot": d.nombre_snapshot,
                "subtotal": d.subtotal,
                "personalizacion": [ing.ingrediente_id for ing in ingredientes],
            })

        return {
            "id": pedido.id,
            "usuario_id": pedido.usuario_id,
            "estado_codigo": pedido.estado_codigo,
            "direccion_id": pedido.direccion_id,
            "forma_pago_codigo": pedido.forma_pago_codigo,
            "total": pedido.total,
            "costo_envio": pedido.costo_envio,
            "direccion_snapshot": pedido.direccion_snapshot,
            "creado_en": pedido.creado_en.isoformat() if pedido.creado_en else None,
            "actualizado_en": pedido.actualizado_en.isoformat() if pedido.actualizado_en else None,
            "detalles": detalles_list,
            "estado": estado_dict,
            "forma_pago": fp_dict,
        }
