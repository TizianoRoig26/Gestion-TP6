"""
Productos Schemas - Pydantic models for product management
"""
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from datetime import datetime


# ===================================================
# Nested schemas for product relationships
# ===================================================

class CategoriaInfo(BaseModel):
    """Minimal category info for product display."""
    id: int
    nombre: str

    model_config = {"from_attributes": True}


class IngredienteInfo(BaseModel):
    """Minimal ingredient info for product display."""
    id: int
    nombre: str
    es_alergeno: bool
    es_removible: bool = True

    model_config = {"from_attributes": True}


# ===================================================
# Product schemas
# ===================================================

class ProductoBase(BaseModel):
    """Base schema with common product fields."""
    nombre: str = Field(min_length=1, max_length=200)
    descripcion: Optional[str] = Field(default=None)
    imagen_url: Optional[str] = Field(default=None)
    precio_base: float = Field(ge=0)
    disponible: bool = Field(default=True)


class ProductoCreate(ProductoBase):
    """Schema for creating a product with associations."""
    stock_cantidad: int = Field(default=0, ge=0)
    categoria_ids: List[int] = Field(default_factory=list)
    ingrediente_ids: List[int] = Field(default_factory=list)

    @field_validator("precio_base")
    @classmethod
    def validate_precio(cls, v: float) -> float:
        if v < 0:
            raise ValueError("El precio base no puede ser negativo")
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "nombre": "Coca Cola 500ml",
                "descripcion": "Gaseosa sabor cola 500ml",
                "precio_base": 250.0,
                "stock_cantidad": 100,
                "disponible": True,
                "categoria_ids": [1, 2],
                "ingrediente_ids": [1],
            }
        }
    }


class ProductoUpdate(BaseModel):
    """Schema for updating a product."""
    nombre: Optional[str] = Field(default=None, min_length=1, max_length=200)
    descripcion: Optional[str] = Field(default=None)
    imagen_url: Optional[str] = Field(default=None)
    precio_base: Optional[float] = Field(default=None, ge=0)
    disponible: Optional[bool] = None
    categoria_ids: Optional[List[int]] = None
    ingrediente_ids: Optional[List[int]] = None


class ProductoStockUpdate(BaseModel):
    """Schema for updating product stock."""
    stock_cantidad: int = Field(ge=0)

    @field_validator("stock_cantidad")
    @classmethod
    def validate_stock(cls, v: int) -> int:
        if v < 0:
            raise ValueError("El stock no puede ser negativo")
        return v


class ProductoListRead(ProductoBase):
    """Schema for reading a product in list context (summary)."""
    id: int
    stock_cantidad: int = 0
    creado_en: datetime
    categorias: List[CategoriaInfo] = []

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "nombre": "Coca Cola 500ml",
                "descripcion": "Gaseosa sabor cola 500ml",
                "precio_base": 250.0,
                "stock_cantidad": 100,
                "disponible": True,
                "imagen_url": None,
                "categorias": [{"id": 1, "nombre": "Bebidas"}],
                "creado_en": "2026-05-07T10:00:00",
            }
        }
    }


class ProductoRead(ProductoListRead):
    """Schema for reading a product with full details."""
    ingredientes: List[IngredienteInfo] = []


class PaginatedResponse(BaseModel):
    """Generic paginated response."""
    items: List[ProductoListRead]
    total: int
    page: int
    page_size: int
    pages: int
