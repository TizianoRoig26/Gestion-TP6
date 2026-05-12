"""
Pagos Router - Payment endpoints
"""
from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from core.database import get_session
from core.dependencies import get_current_user, require_role
from db.models import Usuario
from modules.pagos.schemas import PagoCreate, WebhookNotification
from modules.pagos.service import PagoService

router = APIRouter()


def _get_user_roles(session: Session, user: Usuario) -> list[str]:
    """Get user role codes."""
    from modules.auth.repository import UsuarioRepository
    return UsuarioRepository(session).get_roles(user.id)


@router.post("/crear", status_code=status.HTTP_201_CREATED)
def crear_pago(
    data: PagoCreate,
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Crear un pago con MercadoPago.
    
    - Requiere autenticación (rol CLIENT)
    - Recibe pedido_id y card_token (tokenizado por SDK frontend)
    - Retorna PagoResponse con estado del pago
    
    Los datos de tarjeta nunca pasan por el servidor (PCI SAQ-A).
    El card_token es generado por @mercadopago/sdk-react en el browser.
    """
    service = PagoService(session)
    return service.crear_pago(
        pedido_id=data.pedido_id,
        card_token=data.card_token,
        usuario_id=current_user.id,
    )


@router.post("/webhook", status_code=status.HTTP_200_OK)
def webhook_pago(
    notification: dict,
    session: Session = Depends(get_session),
):
    """
    Webhook IPN de MercadoPago.
    
    - Endpoint público (MercadoPago envía notificaciones)
    - Recibe notificaciones de tipo "payment"
    - Verifica el pago contra la API de MP
    - Actualiza estado del pago y del pedido
    - Siempre responde 200 para evitar reintentos de MP
    """
    service = PagoService(session)
    return service.procesar_webhook(notification)


@router.get("/{pedido_id}", status_code=status.HTTP_200_OK)
def obtener_pago(
    pedido_id: int,
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Obtener estado del pago de un pedido.
    
    - Requiere autenticación
    - El cliente solo puede ver sus propios pagos
    - ADMIN puede ver cualquier pago
    - Retorna PagoResponse
    """
    roles = _get_user_roles(session, current_user)
    service = PagoService(session)
    return service.obtener_pago_por_pedido(
        pedido_id=pedido_id,
        usuario_id=current_user.id,
        roles=roles,
    )
