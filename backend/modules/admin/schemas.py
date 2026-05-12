"""
Admin Schemas - Pydantic models for admin panel
"""
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


class UsuarioListRead(BaseModel):
    """Schema for user list items."""
    id: int
    nombre: str
    email: str
    roles: List[str] = []
    activo: bool
    creado_en: Optional[datetime] = None


class UsuarioUpdateAdmin(BaseModel):
    """Schema for admin updating user data."""
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=200)
    email: Optional[str] = Field(default=None)


class RolUpdateRequest(BaseModel):
    """Schema for changing user role."""
    rol_codigo: str = Field(min_length=2, max_length=20)


class EstadoUpdateRequest(BaseModel):
    """Schema for activating/deactivating user."""
    activo: bool


class UsuarioPageResponse(BaseModel):
    """Paginated response for user list."""
    items: List[UsuarioListRead]
    total: int
    page: int
    page_size: int
    pages: int


# ===========================================
# METRICS SCHEMAS
# ===========================================

class MetricasResumen(BaseModel):
    """Dashboard summary metrics."""
    total_ventas: float = 0
    cantidad_pedidos: int = 0
    cantidad_usuarios: int = 0
    ticket_promedio: float = 0


class VentasPorPeriodo(BaseModel):
    """Sales data aggregated by period."""
    fecha: str
    monto_total: float
    cantidad_pedidos: int


class TopProducto(BaseModel):
    """Top selling product."""
    producto_id: int
    nombre: str
    cantidad_total: int
    ingreso_total: float


class PedidosPorEstado(BaseModel):
    """Order distribution by state."""
    estado_codigo: str
    estado_nombre: str
    cantidad: int
