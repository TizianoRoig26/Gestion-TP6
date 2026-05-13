"""
Auth Router - Authentication endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session

from core.database import get_session
from core.dependencies import get_current_user, require_role
from core.exceptions import UnauthorizedException, ConflictException
from core.limiter import limiter
from modules.auth.schemas import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    AuthResponse,
    UserResponse,
    RefreshRequest,
    LogoutRequest
)
from modules.auth.service import AuthService
from db.models import Usuario

router = APIRouter()


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, session: Session = Depends(get_session)):
    """Register a new user."""
    try:
        auth_service = AuthService(session)
        usuario, access_token, refresh_token = auth_service.register(
            nombre=request.nombre,
            email=request.email,
            password=request.password,
            telefono=request.telefono
        )

        roles = auth_service.get_user_roles(usuario.id)

        return AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="Bearer",
            expires_in=1800,
            user=UserResponse(
                id=usuario.id,
                nombre=usuario.nombre,
                email=usuario.email,
                telefono=usuario.telefono,
                roles=roles,
            )
        )
    except ConflictException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.post("/login", response_model=AuthResponse)
@limiter.limit("5/15 minutes")
def login(request: Request, login_data: LoginRequest, session: Session = Depends(get_session)):
    """Login user. Rate limited: 5 attempts per 15 minutes."""
    try:
        auth_service = AuthService(session)
        usuario, access_token, refresh_token = auth_service.login(
            email=login_data.email,
            password=login_data.password
        )

        roles = auth_service.get_user_roles(usuario.id)

        return AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="Bearer",
            expires_in=1800,
            user=UserResponse(
                id=usuario.id,
                nombre=usuario.nombre,
                email=usuario.email,
                telefono=usuario.telefono,
                roles=roles,
            )
        )
    except UnauthorizedException as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/refresh", response_model=AuthResponse)
def refresh(request: RefreshRequest, session: Session = Depends(get_session)):
    """Refresh access token."""
    try:
        auth_service = AuthService(session)
        usuario, access_token, refresh_token = auth_service.refresh(request.refresh_token)

        roles = auth_service.get_user_roles(usuario.id)

        return AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="Bearer",
            expires_in=1800,
            user=UserResponse(
                id=usuario.id,
                nombre=usuario.nombre,
                email=usuario.email,
                telefono=usuario.telefono,
                roles=roles,
            )
        )
    except UnauthorizedException as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(request: LogoutRequest, session: Session = Depends(get_session)):
    """Logout user."""
    auth_service = AuthService(session)
    auth_service.logout(request.refresh_token)
    return None


@router.get("/me", response_model=UserResponse)
def get_me(user: Usuario = Depends(get_current_user)):
    """Get current user info."""
    return UserResponse(
        id=user.id,
        email=user.email,
        nombre=user.nombre,
        telefono=user.telefono,
        credo_activo=user.credo_activo,
        creado_en=str(user.creado_en),
    )


@router.get("/admin-only", status_code=200)
def admin_only(user: Usuario = Depends(require_role("ADMIN"))):
    """Test endpoint - Admin only."""
    return {"message": "Admin access granted", "user": user.email}