"""
Admin Router - Admin panel endpoints
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from core.database import get_session
from core.dependencies import get_current_user, require_role
from db.models import Usuario
from modules.admin.schemas import UsuarioUpdateAdmin, RolUpdateRequest, EstadoUpdateRequest
from modules.admin.service import AdminService

router = APIRouter()


@router.get("/usuarios")
def listar_usuarios(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    busqueda: Optional[str] = Query(None),
    rol: Optional[str] = Query(None),
    current_user: Usuario = Depends(require_role("ADMIN")),
    session: Session = Depends(get_session),
):
    """Listar todos los usuarios del sistema (solo ADMIN)."""
    service = AdminService(session)
    return service.listar_usuarios(page=page, page_size=page_size, busqueda=busqueda, rol=rol)


@router.put("/usuarios/{user_id}")
def editar_usuario(
    user_id: int,
    data: UsuarioUpdateAdmin,
    current_user: Usuario = Depends(require_role("ADMIN")),
    session: Session = Depends(get_session),
):
    """Editar datos de un usuario."""
    service = AdminService(session)
    return service.editar_usuario(user_id, data.model_dump(exclude_none=True))


@router.put("/usuarios/{user_id}/rol")
def cambiar_rol(
    user_id: int,
    data: RolUpdateRequest,
    current_user: Usuario = Depends(require_role("ADMIN")),
    session: Session = Depends(get_session),
):
    """Cambiar rol de un usuario."""
    service = AdminService(session)
    return service.cambiar_rol(user_id, data.rol_codigo, admin_user_id=current_user.id)


@router.patch("/usuarios/{user_id}/estado")
def toggle_estado(
    user_id: int,
    data: EstadoUpdateRequest,
    current_user: Usuario = Depends(require_role("ADMIN")),
    session: Session = Depends(get_session),
):
    """Activar o desactivar un usuario."""
    service = AdminService(session)
    return service.toggle_estado(user_id, data.activo, admin_user_id=current_user.id)


# =============================================================================
# METRICS ENDPOINTS
# =============================================================================


@router.get("/metricas/resumen")
def metricas_resumen(
    desde: Optional[str] = Query(None, description="Fecha desde (YYYY-MM-DD)"),
    hasta: Optional[str] = Query(None, description="Fecha hasta (YYYY-MM-DD)"),
    current_user: Usuario = Depends(require_role("ADMIN")),
    session: Session = Depends(get_session),
):
    """Obtener resumen de métricas del dashboard."""
    service = AdminService(session)
    return service.obtener_metricas_resumen(desde=desde, hasta=hasta)


@router.get("/metricas/ventas")
def metricas_ventas(
    desde: str = Query(..., description="Fecha desde (YYYY-MM-DD)"),
    hasta: str = Query(..., description="Fecha hasta (YYYY-MM-DD)"),
    granularidad: str = Query("dia", pattern="^(dia|semana|mes)$"),
    current_user: Usuario = Depends(require_role("ADMIN")),
    session: Session = Depends(get_session),
):
    """Obtener ventas agregadas por período."""
    service = AdminService(session)
    return service.obtener_ventas(desde=desde, hasta=hasta, granularidad=granularidad)


@router.get("/metricas/productos-top")
def metricas_top_productos(
    top: int = Query(10, ge=1, le=50),
    desde: Optional[str] = Query(None, description="Fecha desde (YYYY-MM-DD)"),
    hasta: Optional[str] = Query(None, description="Fecha hasta (YYYY-MM-DD)"),
    current_user: Usuario = Depends(require_role("ADMIN")),
    session: Session = Depends(get_session),
):
    """Obtener top productos más vendidos."""
    service = AdminService(session)
    return service.obtener_top_productos(top=top, desde=desde, hasta=hasta)


@router.get("/metricas/pedidos-por-estado")
def metricas_pedidos_estado(
    desde: Optional[str] = Query(None, description="Fecha desde (YYYY-MM-DD)"),
    hasta: Optional[str] = Query(None, description="Fecha hasta (YYYY-MM-DD)"),
    current_user: Usuario = Depends(require_role("ADMIN")),
    session: Session = Depends(get_session),
):
    """Obtener distribución de pedidos por estado."""
    service = AdminService(session)
    return service.obtener_pedidos_por_estado(desde=desde, hasta=hasta)
