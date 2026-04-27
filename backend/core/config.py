"""
Core Configuration Module
"""
from functools import lru_cache

from pydantic import EmailStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ===========================================
    # Database
    # ===========================================
    database_url: str = "postgresql://postgres:postgres@localhost:5432/foodstore"

    # ===========================================
    # Security
    # ===========================================
    secret_key: str = "your-secret-key-here-min-32-characters-long!!"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # ===========================================
    # CORS
    # ===========================================
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # ===========================================
    # MercadoPago
    # ===========================================
    mp_access_token: str = "TEST-xxx"
    mp_public_key: str = "TEST-xxx"
    mp_notification_url: str = "http://localhost:8000/api/v1/pagos/webhook"

    # ===========================================
    # Admin
    # ===========================================
    admin_email: EmailStr = "admin@foodstore.com"
    admin_password: str = "Admin1234!"

    # ===========================================
    # Rate Limiting
    # ===========================================
    login_rate_limit_max: int = 5
    login_rate_limit_window_minutes: int = 15


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Convenience accessor
settings = get_settings()