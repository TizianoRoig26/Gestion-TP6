"""
Auth Service - Business logic for authentication
"""
from datetime import datetime, timedelta
from typing import Optional
import uuid

from sqlmodel import Session, select

from core.config import settings
from core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from core.exceptions import UnauthorizedException, ConflictException
from db.models import Usuario, RefreshToken, UsuarioRol


class AuthService:
    """Authentication service."""
    
    def __init__(self, session: Session):
        self.session = session
    
    def register(self, nombre: str, email: str, password: str, telefono: Optional[str] = None) -> tuple[Usuario, str, str]:
        """Register a new user."""
        # Check if email exists
        existing = self.session.exec(select(Usuario).where(Usuario.email == email)).first()
        if existing:
            raise ConflictException("Email already registered")
        
        # Create user
        usuario = Usuario(
            nombre=nombre,
            email=email,
            password_hash=hash_password(password),
            telefono=telefono
        )
        self.session.add(usuario)
        self.session.commit()
        self.session.refresh(usuario)
        
        # Auto-assign CLIENT role
        usuario_rol = UsuarioRol(
            usuario_id=usuario.id,
            rol_codigo="CLIENT"
        )
        self.session.add(usuario_rol)
        self.session.commit()
        
        # Generate tokens
        tokens = self._create_tokens(usuario)
        
        return usuario, tokens["access_token"], tokens["refresh_token"]
    
    def login(self, email: str, password: str) -> tuple[Usuario, str, str]:
        """Login user."""
        # Find user
        usuario = self.session.exec(select(Usuario).where(Usuario.email == email)).first()
        if not usuario or not verify_password(password, usuario.password_hash):
            raise UnauthorizedException("Invalid email or password")
        
        # Check if deleted
        if usuario.eliminado_en:
            raise UnauthorizedException("Account deleted")
        
        # Generate tokens
        tokens = self._create_tokens(usuario)
        
        return usuario, tokens["access_token"], tokens["refresh_token"]
    
    def refresh(self, refresh_token: str) -> tuple[Usuario, str, str]:
        """Refresh tokens with rotation."""
        # Decode token
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid refresh token")
        
        user_id = payload.get("sub")
        if not user_id:
            raise UnauthorizedException("Invalid token payload")
        
        # Find user
        usuario = self.session.get(Usuario, user_id)
        if not usuario or usuario.eliminado_en:
            raise UnauthorizedException("User not found")
        
        # Check if token is valid and not revoked in DB
        token_hash = hash(refresh_token)
        db_token = self.session.exec(
            select(RefreshToken).where(
                RefreshToken.token == token_hash,
                RefreshToken.usuario_id == user_id,
                RefreshToken.revoked_at == None
            )
        ).first()
        
        if not db_token:
            raise UnauthorizedException("Refresh token revoked or invalid")
        
        # Revoke old token (rotation)
        db_token.revoked_at = datetime.utcnow()
        
        # Create new tokens
        tokens = self._create_tokens(usuario)
        
        return usuario, tokens["access_token"], tokens["refresh_token"]
    
    def logout(self, refresh_token: str) -> None:
        """Logout user by revoking refresh token."""
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            return  # Silently ignore invalid token
        
        user_id = payload.get("sub")
        if not user_id:
            return
        
        # Find and revoke token
        token_hash = hash(refresh_token)
        db_token = self.session.exec(
            select(RefreshToken).where(
                RefreshToken.token == token_hash,
                RefreshToken.usuario_id == user_id
            )
        ).first()
        
        if db_token:
            db_token.revoked_at = datetime.utcnow()
            self.session.commit()
    
    def _create_tokens(self, usuario: Usuario) -> dict[str, str]:
        """Create access and refresh tokens."""
        # Get user roles
        roles = self.session.exec(
            select(UsuarioRol.rol_codigo).where(UsuarioRol.usuario_id == usuario.id)
        ).all()
        
        # Access token
        access_token = create_access_token(
            {"sub": str(usuario.id), "email": usuario.email, "roles": roles}
        )
        
        # Refresh token
        refresh_token_value = str(uuid.uuid4())
        refresh_token = create_refresh_token({"sub": str(usuario.id)})
        
        # Store refresh token in DB
        token_hash = hash(refresh_token_value)
        db_refresh = RefreshToken(
            token=token_hash,
            usuario_id=usuario.id,
            expires_at=datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
        )
        self.session.add(db_refresh)
        self.session.commit()
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token_value,
        }
    
    def get_user_roles(self, user_id: int) -> list[str]:
        """Get user's roles."""
        roles = self.session.exec(
            select(UsuarioRol.rol_codigo).where(UsuarioRol.usuario_id == user_id)
        ).all()
        return roles