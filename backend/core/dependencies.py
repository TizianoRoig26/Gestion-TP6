"""
Dependency Injections para autenticación y autorización
"""
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlmodel import Session, select

from core.config import settings
from core.database import get_session
from db.models import Usuario

# HTTP Bearer token security
security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    session: Session = Depends(get_session),
) -> Usuario:
    """
    Dependency que retorna el usuario actual basado en el JWT token.
    
    Uso:
        @router.get("/protected")
        def protected_route(user: Usuario = Depends(get_current_user)):
            return {"user": user.email}
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación requerido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido: sin usuario",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user from database (exclude soft-deleted)
    user = session.get(Usuario, user_id)
    if user is None or user.eliminado_en is not None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.credo_activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo",
        )

    return user


def get_current_active_user(
    user: Usuario = Depends(get_current_user),
) -> Usuario:
    """
    Dependency que verifica que el usuario esté activo.
    """
    return user


def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    session: Session = Depends(get_session),
) -> Optional[Usuario]:
    """
    Dependency opcional - retorna el usuario si hay token, None si no.
    
    Uso:
        @router.get("/public")
        def public_route(user: Optional[Usuario] = Depends(get_current_user_optional)):
            if user:
                return {"user": user.email}
            return {"user": None}
    """
    if credentials is None:
        return None

    try:
        return get_current_user(credentials, session)
    except HTTPException:
        return None


# =============================================================================
# RBAC - Require Role Factory
# =============================================================================
def require_role(*allowed_roles: str):
    """
    Factory que crea una dependency para verificar roles.
    
    Uso:
        @router.get("/admin-only")
        def admin_only(user: Usuario = Depends(require_role("ADMIN"))):
            return {"admin": True}
        
        # Múltiples roles
        @router.get("/staff")
        def staff_route(user: Usuario = Depends(require_role("ADMIN", "STOCK", "PEDIDOS"))):
            return {"staff": True}
    """

    def role_checker(
        user: Usuario = Depends(get_current_user),
        session: Session = Depends(get_session),
    ) -> Usuario:
        # Get user roles from database
        from db.models import UsuarioRol, Rol

        statement = (
            select(Rol.codigo)
            .select_from(UsuarioRol)
            .join(Rol, UsuarioRol.rol_codigo == Rol.codigo)
            .where(UsuarioRol.usuario_id == user.id)
        )
        result = session.exec(statement)
        user_roles = result.all()

        # Check if user has any of the allowed roles
        for allowed in allowed_roles:
            if allowed in user_roles:
                return user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Acceso denegado. Roles requeridos: {', '.join(allowed_roles)}",
        )

    return role_checker


# Shortcuts para roles comunes
def require_admin(user: Usuario = Depends(get_current_user)) -> Usuario:
    """Dependency que requiere rol ADMIN."""
    return require_role("ADMIN")(user)


def require_staff(user: Usuario = Depends(get_current_user)) -> Usuario:
    """Dependency que requiere rol ADMIN, STOCK, o PEDIDOS."""
    return require_role("ADMIN", "STOCK", "PEDIDOS")(user)