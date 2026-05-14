"""
Pagos Schemas - Pydantic models for MercadoPago payments
"""
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime


class PagoCreate(BaseModel):
    """Schema for creating a payment."""
    pedido_id: int
    card_token: str = Field(..., min_length=1, description="Token de tarjeta generado por MercadoPago SDK")
    payment_method_id: Optional[str] = Field(default=None, description="ID del método de pago desde el SDK de MP (visa, master, etc.)")


class PagoResponse(BaseModel):
    """Schema for payment response."""
    id: int
    pedido_id: int
    monto: float
    mp_payment_id: Optional[int] = None
    mp_status: str
    external_reference: str
    creado_en: datetime

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": 1,
                "pedido_id": 1,
                "monto": 1751.00,
                "mp_payment_id": 123456789,
                "mp_status": "approved",
                "external_reference": "pedido_1",
                "creado_en": "2026-05-11T19:00:00"
            }
        }
    }


class WebhookNotification(BaseModel):
    """Schema for MercadoPago IPN webhook notification."""
    type: Optional[str] = Field(default=None, description="Tipo de notificación: payment, merchant_order, etc.")
    data: Optional[dict] = Field(default=None, description="Datos de la notificación")
