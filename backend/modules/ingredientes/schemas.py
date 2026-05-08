"""
Ingredientes Schemas - Pydantic models for ingredient management
"""
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime


class IngredienteBase(BaseModel):
    """Base schema with common ingredient fields."""
    nombre: str = Field(min_length=1, max_length=100)
    descripcion: Optional[str] = Field(default=None)
    es_alergeno: bool = Field(default=False)


class IngredienteCreate(IngredienteBase):
    """Schema for creating an ingredient."""
    pass


class IngredienteUpdate(BaseModel):
    """Schema for updating an ingredient."""
    nombre: Optional[str] = Field(default=None, min_length=1, max_length=100)
    descripcion: Optional[str] = Field(default=None)
    es_alergeno: Optional[bool] = None


class IngredienteRead(IngredienteBase):
    """Schema for reading an ingredient."""
    id: int
    creado_en: datetime
    eliminado_en: Optional[datetime] = None

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "nombre": "Gluten",
                "descripcion": "Proteína presente en trigo, cebada y centeno",
                "es_alergeno": True,
                "creado_en": "2026-05-07T10:00:00",
            }
        }
    }
