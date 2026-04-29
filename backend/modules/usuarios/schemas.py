"""
Usuarios Schemas - Pydantic models for user management
"""
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class UsuarioBase(BaseModel):
    """Base schema with common user fields."""
    nombre: str = Field(min_length=2, max_length=200)
    email: EmailStr
    telefono: Optional[str] = Field(default=None, max_length=20)


class UsuarioCreate(UsuarioBase):
    """Schema for creating a new user (admin only)."""
    password: str = Field(min_length=8)
    roles: List[str] = Field(default=["CLIENT"])

    model_config = {
        "json_schema_extra": {
            "example": {
                "nombre": "María García",
                "email": "maria@example.com",
                "password": "securePass123",
                "telefono": "+5491187654321",
                "roles": ["CLIENT"]
            }
        }
    }


class UsuarioUpdate(BaseModel):
    """Schema for updating user profile."""
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=200)
    email: Optional[EmailStr] = None
    telefono: Optional[str] = Field(default=None, max_length=20)
    password: Optional[str] = Field(default=None, min_length=8)

    model_config = {
        "json_schema_extra": {
            "example": {
                "nombre": "María García Actualizado",
                "telefono": "+5491187654399"
            }
        }
    }


class UsuarioRead(UsuarioBase):
    """Schema for reading user data (without password)."""
    id: int
    creado_en: datetime
    actualizado_en: Optional[datetime] = None
    roles: List[str] = []

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": 1,
                "nombre": "María García",
                "email": "maria@example.com",
                "telefono": "+5491187654321",
                "creado_en": "2026-04-27T10:00:00",
                "actualizado_en": None,
                "roles": ["CLIENT"]
            }
        }
    }


class UsuarioWithDirecciones(UsuarioRead):
    """Schema for reading user with their delivery addresses."""
    direcciones: List["DireccionRead"] = []

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": 1,
                "nombre": "María García",
                "email": "maria@example.com",
                "telefono": "+5491187654321",
                "creado_en": "2026-04-27T10:00:00",
                "actualizado_en": None,
                "roles": ["CLIENT"],
                "direcciones": []
            }
        }
    }


# Import DireccionRead to avoid circular import - will be set by direcciones module
def set_direccion_read_schema(schema):
    """Set the DireccionRead schema reference to avoid circular imports."""
    UsuarioWithDirecciones.model_fields['direcciones'].annotation = List[schema]
