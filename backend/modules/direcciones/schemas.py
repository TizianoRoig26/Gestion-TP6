"""
Direcciones Schemas - Pydantic models for delivery addresses
"""
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime


class DireccionBase(BaseModel):
    """Base schema with common address fields."""
    alias: Optional[str] = Field(default=None, max_length=50)
    linea1: str = Field(min_length=5, max_length=200)
    linea2: Optional[str] = Field(default=None, max_length=200)
    ciudad: str = Field(min_length=2, max_length=100)
    codigo_postal: str = Field(min_length=4, max_length=20)
    referencia: Optional[str] = Field(default=None, max_length=300)
    es_predeterminada: bool = Field(default=False)


class DireccionCreate(DireccionBase):
    """Schema for creating a new address."""
    usuario_id: int

    model_config = {
        "json_schema_extra": {
            "example": {
                "usuario_id": 1,
                "alias": "Casa",
                "linea1": "Av. Corrientes 1234",
                "linea2": "Piso 5, Depto B",
                "ciudad": "Buenos Aires",
                "codigo_postal": "C1043AAZ",
                "referencia": "Frente al teatro",
                "es_predeterminada": True
            }
        }
    }


class DireccionUpdate(BaseModel):
    """Schema for updating an address."""
    alias: Optional[str] = Field(default=None, max_length=50)
    linea1: Optional[str] = Field(default=None, min_length=5, max_length=200)
    linea2: Optional[str] = Field(default=None, max_length=200)
    ciudad: Optional[str] = Field(default=None, min_length=2, max_length=100)
    codigo_postal: Optional[str] = Field(default=None, min_length=4, max_length=20)
    referencia: Optional[str] = Field(default=None, max_length=300)
    es_predeterminada: Optional[bool] = None


class DireccionRead(DireccionBase):
    """Schema for reading address data."""
    id: int
    usuario_id: int
    creado_en: datetime
    actualizado_en: Optional[datetime] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": 1,
                "usuario_id": 1,
                "alias": "Casa",
                "linea1": "Av. Corrientes 1234",
                "linea2": "Piso 5, Depto B",
                "ciudad": "Buenos Aires",
                "codigo_postal": "C1043AAZ",
                "referencia": "Frente al teatro",
                "es_predeterminada": True,
                "creado_en": "2026-04-27T10:00:00",
                "actualizado_en": None
            }
        }
    }
