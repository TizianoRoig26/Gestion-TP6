"""
Auth Repository - Data access layer for authentication
"""
from typing import Optional

from sqlmodel import Session, select

from db.models import Usuario, RefreshToken, UsuarioRol


class UsuarioRepository:
    """Repository for Usuario operations."""
    
    def __init__(self, session: Session):
        self.session = session
    
    def get_by_id(self, user_id: int) -> Optional[Usuario]:
        """Get user by ID."""
        return self.session.get(Usuario, user_id)
    
    def get_by_email(self, email: str) -> Optional[Usuario]:
        """Get user by email."""
        return self.session.exec(
            select(Usuario).where(Usuario.email == email)
        ).first()
    
    def create(self, usuario: Usuario) -> Usuario:
        """Create a new user."""
        self.session.add(usuario)
        self.session.flush()
        self.session.refresh(usuario)
        return usuario
    
    def get_roles(self, user_id: int) -> list[str]:
        """Get user's roles."""
        return list(
            self.session.exec(
                select(UsuarioRol.rol_codigo).where(UsuarioRol.usuario_id == user_id)
            ).all()
        )


class RefreshTokenRepository:
    """Repository for RefreshToken operations."""
    
    def __init__(self, session: Session):
        self.session = session
    
    def create(self, token: RefreshToken) -> RefreshToken:
        """Create a new refresh token."""
        self.session.add(token)
        self.session.flush()
        self.session.refresh(token)
        return token
    
    def get_by_token_hash(self, token_hash: str) -> Optional[RefreshToken]:
        """Get refresh token by hash."""
        return self.session.exec(
            select(RefreshToken).where(RefreshToken.token == token_hash)
        ).first()
    
    def revoke(self, token: RefreshToken) -> None:
        """Revoke a refresh token."""
        from datetime import datetime
        token.revoked_at = datetime.utcnow()
        self.session.add(token)
        self.session.flush()
