"""
Auth Router - Authentication endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session

from core.database import get_session
from core.dependencies import get_current_user
from core.exceptions import UnauthorizedException, ConflictException
from modules.auth.schemas import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
    RefreshRequest,
    LogoutRequest
)
from modules.auth.service import AuthService
from db.models import Usuario

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
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

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="Bearer",
            expires_in=1800
        )
    except ConflictException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


# Rate limiting: 5 attempts per 15 minutes
# Applied via endpoint decorator
def rate_limit_login(request: Request):
    """Rate limiting for login endpoint."""
    from core.config import settings
    from slowapi import Limiter
    from slowapi.util import get_remote_address

    if not hasattr(request.app.state, "limiter") or request.app.state.limiter is None:
        # Rate limiting not configured
        return

    limiter: Limiter = request.app.state.limiter
    key = get_remote_address(request)

    # Check rate limit
    if limiter._check_request_limit(request, key) is False:
        from slowapi.errors import RateLimitExceededError
        raise RateLimitExceededError(
            detail=f"Rate limit exceeded. Max {settings.login_rate_limit_max} attempts per {settings.login_rate_limit_window_minutes} minutes."
        )


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, req: Request, session: Session = Depends(get_session)):
    """Login user."""
    # Apply rate limiting
    rate_limit_login(req)

    try:
        auth_service = AuthService(session)
        usuario, access_token, refresh_token = auth_service.login(
            email=request.email,
            password=request.password
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="Bearer",
            expires_in=1800
        )
    except UnauthorizedException as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/refresh", response_model=TokenResponse)
def refresh(request: RefreshRequest, session: Session = Depends(get_session)):
    """Refresh access token."""
    try:
        auth_service = AuthService(session)
        usuario, access_token, refresh_token = auth_service.refresh(request.refresh_token)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="Bearer",
            expires_in=1800
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
        apellido=user.apellido,
        telefono=user.telefono,
        credo_activo=user.credo_activo,
        creado_en=user.creado_en,
    )