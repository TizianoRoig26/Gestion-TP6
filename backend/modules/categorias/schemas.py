"""
Categorías Schemas - Pydantic models for category management
"""
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


class CategoriaBase(BaseModel):
    """Base schema with common category fields."""
    nombre: str = Field(min_length=1, max_length=100)
    descripcion: Optional[str] = Field(default=None)
    imagen: Optional[str] = Field(default=None)


class CategoriaCreate(CategoriaBase):
    """Schema for creating a category."""
    padre_id: Optional[int] = Field(default=None)


class CategoriaUpdate(BaseModel):
    """Schema for updating a category."""
    nombre: Optional[str] = Field(default=None, min_length=1, max_length=100)
    descripcion: Optional[str] = Field(default=None)
    imagen: Optional[str] = Field(default=None)
    padre_id: Optional[int] = Field(default=None)


class CategoriaRead(CategoriaBase):
    """Schema for reading a category (flat, without children)."""
    id: int
    padre_id: Optional[int] = None
    nivel: int = 0
    creado_en: datetime
    actualizado_en: Optional[datetime] = None

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "nombre": "Bebidas",
                "descripcion": "Bebidas en general",
                "padre_id": None,
                "nivel": 0,
                "creado_en": "2026-05-07T10:00:00",
            }
        }
    }


class CategoriaWithSubcategorias(CategoriaRead):
    """Schema for reading a category with nested subcategories."""
    subcategorias: List["CategoriaWithSubcategorias"] = []

    model_config = {
        "from_attributes": True,
    }
