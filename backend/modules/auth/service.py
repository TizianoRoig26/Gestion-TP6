"""
Auth Service - Business logic for authentication
"""
import hashlib
from datetime import datetime, timedelta
from typing import Optional
import uuid

from sqlmodel import Session

from core.config import settings
from core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from core.exceptions import UnauthorizedException, ConflictException
from modules.auth.repository import UsuarioRepository, RefreshTokenRepository
from db.models import Usuario, RefreshToken, UsuarioRol


def hash_token(token: str) -> str:
    """Hash a token using SHA-256 for database storage."""
    return hashlib.sha256(token.encode('utf-8')).hexdigest()


class AuthService:
    """Authentication service."""
    
    def __init__(self, session: Session):
        self.session = session
        self.usuario_repo = UsuarioRepository(session)
        self.token_repo = RefreshTokenRepository(session)
    
    def register(self, nombre: str, email: str, password: str, telefono: Optional[str] = None) -> tuple[Usuario, str, str]:
        """Register a new user."""
        # Check if email exists
        existing = self.usuario_repo.get_by_email(email)
        if existing:
            raise ConflictException("Email already registered")
        
        # Create user
        usuario = Usuario(
            nombre=nombre,
            email=email,
            password_hash=hash_password(password),
            telefono=telefono
        )
        usuario = self.usuario_repo.create(usuario)
        
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
        usuario = self.usuario_repo.get_by_email(email)
        if not usuario or not verify_password(password, usuario.password_hash):
            raise UnauthorizedException("Invalid email or password")
        
        # Check if deleted
        if usuario.eliminado_en:
            raise UnauthorizedException("Account deleted")
        
        # Check if active
        if not usuario.credo_activo:
            raise UnauthorizedException("User inactive")
        
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
        usuario = self.usuario_repo.get_by_id(int(user_id))
        if not usuario or usuario.eliminado_en:
            raise UnauthorizedException("User not found")
        
        # Check if active
        if not usuario.credo_activo:
            raise UnauthorizedException("User inactive")
        
        # Check if token is valid and not revoked in DB
        token_hash = hash_token(refresh_token)
        print(f"[DEBUG] Refresh token received: {refresh_token[:50]}...")
        print(f"[DEBUG] Hash calculated: {token_hash[:50]}...")
        
        db_token = self.token_repo.get_by_token_hash(token_hash)
        print(f"[DEBUG] DB token found: {db_token is not None}")
        
        if db_token:
            print(f"[DEBUG] DB token usuario_id: {db_token.usuario_id}")
            print(f"[DEBUG] Payload user_id: {usuario.id}")
            print(f"[DEBUG] Revoked at: {db_token.revoked_at}")
        
        if not db_token or db_token.revoked_at or db_token.usuario_id != usuario.id:
            raise UnauthorizedException("Refresh token revoked or invalid")
        
        # Revoke old token (rotation)
        self.token_repo.revoke(db_token)
        self.session.commit()  # ¡IMPORTANTE: Guardar revocación!
        
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
        token_hash = hash_token(refresh_token)
        db_token = self.token_repo.get_by_token_hash(token_hash)
        
        if db_token and db_token.usuario_id == int(user_id):
            self.token_repo.revoke(db_token)
    
    def _create_tokens(self, usuario: Usuario) -> dict[str, str]:
        """Create access and refresh tokens."""
        # Get user roles
        roles = self.usuario_repo.get_roles(usuario.id)
        
        # Access token
        access_token = create_access_token(
            {"sub": str(usuario.id), "email": usuario.email, "roles": roles}
        )
        
        # Refresh token (JWT)
        refresh_token = create_refresh_token({"sub": str(usuario.id)})
        
        # Store refresh token hash in DB
        token_hash = hash_token(refresh_token)
        db_refresh = RefreshToken(
            token=token_hash,
            usuario_id=usuario.id,
            expires_at=datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
        )
        self.token_repo.create(db_refresh)
        self.session.commit()  # ¡IMPORTANTE: commit para guardar en DB!
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
        }
    
    def get_user_roles(self, user_id: int) -> list[str]:
        """Get user's roles."""
        return self.usuario_repo.get_roles(user_id)
