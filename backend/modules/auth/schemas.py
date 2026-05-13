"""
Auth Schemas - Pydantic models for authentication
"""
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
import re


class LoginRequest(BaseModel):
    """Login request schema."""
    email: EmailStr
    password: str = Field(min_length=8)

    model_config = {"json_schema_extra": {"example": {"email": "user@example.com", "password": "password123"}}}


class RegisterRequest(BaseModel):
    """Register request schema."""
    nombre: str = Field(min_length=2, max_length=200)
    email: EmailStr
    password: str = Field(min_length=8)
    telefono: Optional[str] = Field(default=None, max_length=20)

    @field_validator("password")
    @classmethod
    def password_must_be_strong(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "nombre": "Juan Pérez",
                "email": "juan@example.com",
                "password": "securePassword123",
                "telefono": "+5491112345678"
            }
        }
    }


class TokenResponse(BaseModel):
    """Token response schema."""
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int  # seconds

    model_config = {"json_schema_extra": {"example": {"access_token": "eyJ...", "refresh_token": "...", "token_type": "Bearer", "expires_in": 1800}}}


class AuthResponse(TokenResponse):
    """Login/Register response with user data."""
    user: "UserResponse"

    model_config = {"json_schema_extra": {"example": {
        "access_token": "eyJ...",
        "refresh_token": "...",
        "token_type": "Bearer",
        "expires_in": 1800,
        "user": {"id": 1, "nombre": "Admin", "email": "admin@foodstore.com", "roles": ["ADMIN"]},
    }}}


class UserResponse(BaseModel):
    """User response schema."""
    id: int
    nombre: str
    email: EmailStr
    telefono: Optional[str] = None
    credo_activo: bool = True
    roles: list[str] = []
    creado_en: Optional[str] = None

    model_config = {"json_schema_extra": {"example": {"id": 1, "nombre": "Juan Pérez", "email": "juan@example.com", "roles": ["CLIENT"]}}}


class RefreshRequest(BaseModel):
    """Refresh token request schema."""
    refresh_token: str


class LogoutRequest(BaseModel):
    """Logout request schema."""
    refresh_token: str