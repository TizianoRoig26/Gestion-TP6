"""
Pedidos Router - Order endpoints (public + admin)
"""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from core.database import get_session
from core.dependencies import get_current_user, require_role
from db.models import Usuario
from modules.pedidos.schemas import CambioEstadoRequest
from modules.pedidos.service import PedidoService

# Client-facing router
router = APIRouter()

# Admin router
admin_router = APIRouter()


def _get_user_roles(session: Session, user: Usuario) -> list[str]:
    """Get user role codes."""
    from modules.auth.repository import UsuarioRepository
    return UsuarioRepository(session).get_roles(user.id)


# =============================================================================
# CLIENT ENDPOINTS - /api/v1/pedidos
# =============================================================================


@router.get("/")
def list_mis_pedidos(
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(10, ge=1, le=50, description="Items por página"),
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Listar mis pedidos (cliente autenticado).
    
    - Solo retorna pedidos del usuario autenticado
    - Filtro opcional por estado
    - Paginado, ordenado por fecha descendente
    """
    service = PedidoService(session)
    return service.listar_mis_pedidos(
        usuario_id=current_user.id,
        estado_codigo=estado,
        page=page,
        page_size=page_size,
    )


@router.get("/{pedido_id}")
def get_mi_pedido(
    pedido_id: int,
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Obtener detalle de un pedido propio.
    
    - Solo el dueño del pedido puede verlo
    - Incluye detalles, estado, forma de pago, dirección snapshot
    """
    roles = _get_user_roles(session, current_user)
    service = PedidoService(session)
    return service.obtener_pedido(
        pedido_id=pedido_id,
        usuario_id=current_user.id,
        roles=roles,
    )


@router.post("/", status_code=status.HTTP_201_CREATED)
def crear_pedido(
    data: dict,
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Crear un nuevo pedido desde el carrito.
    
    - Requiere autenticación
    - Valida stock atómicamente (SELECT FOR UPDATE)
    - Crea snapshots de precio y dirección
    - Registra historial inicial
    - Vacía el carrito en frontend (se hace del lado del cliente)
    
    Body:
    ```json
    {
        "direccion_id": 1,
        "forma_pago_codigo": "MERCADOPAGO",
        "costo_envio": 50.0,
        "detalles": [
            {
                "producto_id": 5,
                "cantidad": 2,
                "personalizacion": [3]
            }
        ]
    }
    ```
    """
    service = PedidoService(session)
    return service.crear_pedido(
        usuario_id=current_user.id,
        data=data,
    )


@router.post("/{pedido_id}/cancelar", status_code=status.HTTP_200_OK)
def cancelar_mi_pedido(
    pedido_id: int,
    data: CambioEstadoRequest,
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Cancelar un pedido propio (cliente).
    
    - Solo permite cancelar desde estado PENDIENTE
    - El motivo de cancelación es obligatorio
    - Desde CONFIRMADO/CANCELADO usar el endpoint admin
    """
    roles = _get_user_roles(session, current_user)
    service = PedidoService(session)
    return service.cambiar_estado(
        pedido_id=pedido_id,
        nuevo_estado="CANCELADO",
        usuario=current_user,
        roles=roles,
        observacion=data.observacion,
        es_owner=True,
    )


@router.get("/{pedido_id}/historial")
def get_historial_pedido(
    pedido_id: int,
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Obtener historial de estados de un pedido propio.
    
    - Solo el dueño del pedido puede ver su historial
    - Retorna lista cronológica de transiciones
    """
    roles = _get_user_roles(session, current_user)
    service = PedidoService(session)
    return service.obtener_historial(
        pedido_id=pedido_id,
        usuario_id=current_user.id,
        roles=roles,
    )


# =============================================================================
# ADMIN ENDPOINTS - /api/v1/admin/pedidos
# =============================================================================


@admin_router.get("/")
def list_todos_pedidos(
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    desde: Optional[str] = Query(None, description="Fecha desde (YYYY-MM-DD)"),
    hasta: Optional[str] = Query(None, description="Fecha hasta (YYYY-MM-DD)"),
    busqueda: Optional[str] = Query(None, description="Buscar por nombre de cliente o ID"),
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(10, ge=1, le=50, description="Items por página"),
    current_user: Usuario = Depends(require_role("PEDIDOS", "ADMIN")),
    session: Session = Depends(get_session),
):
    """
    Listar todos los pedidos (gestión).
    
    - Requiere rol PEDIDOS o ADMIN
    - Filtros: estado, rango de fechas, búsqueda
    - Paginado
    """
    # Parse dates
    fecha_desde = None
    fecha_hasta = None
    if desde:
        fecha_desde = datetime.strptime(desde, "%Y-%m-%d")
    if hasta:
        fecha_hasta = datetime.strptime(hasta + " 23:59:59", "%Y-%m-%d %H:%M:%S")

    service = PedidoService(session)
    return service.listar_todos_pedidos(
        estado_codigo=estado,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        busqueda=busqueda,
        page=page,
        page_size=page_size,
    )


@admin_router.get("/{pedido_id}")
def get_pedido_admin(
    pedido_id: int,
    current_user: Usuario = Depends(require_role("PEDIDOS", "ADMIN")),
    session: Session = Depends(get_session),
):
    """
    Obtener detalle de cualquier pedido (gestión).
    
    - Requiere rol PEDIDOS o ADMIN
    - Incluye datos del cliente, items, historial de estados
    """
    service = PedidoService(session)
    return service.obtener_pedido_admin(pedido_id=pedido_id)


@admin_router.patch("/{pedido_id}/estado")
def cambiar_estado_pedido(
    pedido_id: int,
    data: CambioEstadoRequest,
    current_user: Usuario = Depends(require_role("PEDIDOS", "ADMIN")),
    session: Session = Depends(get_session),
):
    """
    Cambiar estado de un pedido (FSM).
    
    - Requiere rol PEDIDOS o ADMIN (algunas transiciones solo ADMIN)
    - Valida la transición contra la FSM
    - Ejecuta side-effects (stock, historial)
    
    Transiciones permitidas:
    - PENDIENTE → CONFIRMADO (solo automático vía webhook MercadoPago)
    - PENDIENTE → CANCELADO
    - CONFIRMADO → EN_PREPARACION
    - CONFIRMADO → CANCELADO
    - EN_PREPARACION → EN_CAMINO
    - EN_PREPARACION → CANCELADO (solo ADMIN)
    - EN_CAMINO → ENTREGADO
    """
    roles = _get_user_roles(session, current_user)
    service = PedidoService(session)
    return service.cambiar_estado(
        pedido_id=pedido_id,
        nuevo_estado=data.estado_codigo,
        usuario=current_user,
        roles=roles,
        observacion=data.observacion,
    )


@admin_router.get("/{pedido_id}/historial")
def get_historial_admin(
    pedido_id: int,
    current_user: Usuario = Depends(require_role("PEDIDOS", "ADMIN")),
    session: Session = Depends(get_session),
):
    """
    Obtener historial de estados de cualquier pedido (gestión).
    
    - Requiere rol PEDIDOS o ADMIN
    - Retorna lista cronológica de transiciones
    """
    roles = _get_user_roles(session, current_user)
    service = PedidoService(session)
    return service.obtener_historial(
        pedido_id=pedido_id,
        usuario_id=current_user.id,
        roles=roles,
    )
