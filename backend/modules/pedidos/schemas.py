"""
Pedidos Schemas - Pydantic models for orders management
"""
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


# ===================================================
# SCHEMAS PARA ESTADOS DE PEDIDO
# ===================================================

class EstadoPedidoBase(BaseModel):
    """Base schema for order states."""
    codigo: str = Field(min_length=2, max_length=20)
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: Optional[str] = None
    es_terminal: bool = Field(default=False)


class EstadoPedidoRead(EstadoPedidoBase):
    """Schema for reading order states."""

    model_config = {
        "json_schema_extra": {
            "example": {
                "codigo": "PENDIENTE",
                "nombre": "Pendiente de confirmación",
                "descripcion": "El pedido fue creado y espera confirmación",
                "es_terminal": False
            }
        }
    }


# ===================================================
# SCHEMAS PARA FORMAS DE PAGO
# ===================================================

class FormaPagoBase(BaseModel):
    """Base schema for payment methods."""
    codigo: str = Field(min_length=2, max_length=20)
    nombre: str = Field(min_length=2, max_length=100)
    habilitado: bool = Field(default=True)


class FormaPagoRead(FormaPagoBase):
    """Schema for reading payment methods."""

    model_config = {
        "json_schema_extra": {
            "example": {
                "codigo": "MERCADOPAGO",
                "nombre": "MercadoPago",
                "habilitado": True
            }
        }
    }


# ===================================================
# SCHEMAS PARA DETALLES DE PEDIDO
# ===================================================

class DetallePedidoBase(BaseModel):
    """Base schema for order details."""
    producto_id: int
    cantidad: int = Field(ge=1)
    precio_snapshot: float = Field(ge=0)
    nombre_snapshot: str = Field(max_length=200)
    subtotal: float = Field(ge=0)
    personalizacion: Optional[List[int]] = Field(default=None, description="Lista de IDs de ingredientes removidos")


class DetallePedidoCreate(DetallePedidoBase):
    """Schema for creating order details."""
    pass


class DetallePedidoRead(DetallePedidoBase):
    """Schema for reading order details."""
    id: int
    pedido_id: int

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": 1,
                "pedido_id": 1,
                "producto_id": 5,
                "cantidad": 2,
                "precio_snapshot": 850.50,
                "nombre_snapshot": "Hamburguesa Clásica",
                "subtotal": 1701.00,
                "personalizacion": [3]  # Remove onion (id 3)
            }
        }
    }


# ===================================================
# SCHEMAS PARA PEDIDOS
# ===================================================

class PedidoBase(BaseModel):
    """Base schema with common order fields."""
    usuario_id: int
    estado_codigo: str = Field(default="PENDIENTE", max_length=20)
    direccion_id: Optional[int] = None
    forma_pago_codigo: str = Field(max_length=20)
    costo_envio: float = Field(default=50.0, ge=0)
    direccion_snapshot: Optional[str] = Field(default=None, description="Dirección serializada al momento del pedido")


class PedidoCreate(PedidoBase):
    """Schema for creating a new order."""
    detalles: List[DetallePedidoCreate] = Field(min_length=1)

    @property
    def total(self) -> float:
        """Calculate total from details + shipping."""
        subtotal = sum(d.subtotal for d in self.detalles)
        return subtotal + self.costo_envio

    model_config = {
        "json_schema_extra": {
            "example": {
                "usuario_id": 1,
                "estado_codigo": "PENDIENTE",
                "direccion_id": 1,
                "forma_pago_codigo": "MERCADOPAGO",
                "costo_envio": 50.0,
                "detalles": [
                    {
                        "producto_id": 5,
                        "cantidad": 2,
                        "precio_snapshot": 850.50,
                        "nombre_snapshot": "Hamburguesa Clásica",
                        "subtotal": 1701.00,
                        "personalizacion": [3]
                    }
                ]
            }
        }
    }


class PedidoUpdate(BaseModel):
    """Schema for updating an order (mainly status changes)."""
    estado_codigo: Optional[str] = Field(default=None, max_length=20)
    direccion_id: Optional[int] = None
    forma_pago_codigo: Optional[str] = Field(default=None, max_length=20)
    costo_envio: Optional[float] = Field(default=None, ge=0)


class PedidoRead(PedidoBase):
    """Schema for reading order data."""
    id: int
    total: float
    creado_en: datetime
    actualizado_en: Optional[datetime] = None
    detalles: List[DetallePedidoRead] = []
    estado: Optional[EstadoPedidoRead] = None
    forma_pago: Optional[FormaPagoRead] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": 1,
                "usuario_id": 1,
                "estado_codigo": "PENDIENTE",
                "direccion_id": 1,
                "forma_pago_codigo": "MERCADOPAGO",
                "total": 1751.00,
                "costo_envio": 50.0,
                "direccion_snapshot": "Av. Corrientes 1234, Buenos Aires",
                "creado_en": "2026-04-27T19:00:00",
                "actualizado_en": None,
                "detalles": [],
                "estado": {"codigo": "PENDIENTE", "nombre": "Pendiente"},
                "forma_pago": {"codigo": "MERCADOPAGO", "nombre": "MercadoPago"}
            }
        }
    }


class PedidoWithUsuario(PedidoRead):
    """Schema for reading order with user data."""
    usuario: Optional["UsuarioRead"] = None


# ===================================================
# SCHEMAS PARA HISTORIAL DE ESTADOS
# ===================================================

class HistorialEstadoPedidoRead(BaseModel):
    """Schema for reading order status history."""
    id: int
    pedido_id: int
    estado_desde: Optional[str] = None
    estado_hacia: str
    usuario_id: Optional[int] = None
    observacion: Optional[str] = Field(default=None, max_length=500)
    creado_en: datetime

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": 1,
                "pedido_id": 1,
                "estado_desde": None,
                "estado_hacia": "PENDIENTE",
                "usuario_id": 1,
                "observacion": "Pedido creado",
                "creado_en": "2026-04-27T19:00:00"
            }
        }
    }


# Import UsuarioRead forward reference to avoid circular imports
def set_usuario_read_schema(schema):
    """Set the UsuarioRead schema reference to avoid circular imports."""
    PedidoWithUsuario.model_fields['usuario'].annotation = Optional[schema]
