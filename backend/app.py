"""
Food Store - FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from core.config import settings
from core.database import engine, create_db_and_tables
from core.exceptions import register_exception_handlers


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events handler."""
    # Startup: create tables
    create_db_and_tables()
    yield
    # Shutdown: cleanup if needed


# Create FastAPI app
app = FastAPI(
    title="Food Store API",
    description="API for Food Store E-Commerce Platform",
    version="1.0.0",
    docs="/docs",
    redoc="/redoc",
    lifespan=lifespan,
)

# ===========================================
# CORS Middleware
# ===========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===========================================
# Rate Limiting (slowapi)
# ===========================================
try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceededError
    from slowapi.extensions import limit

    # Setup limiter
    limiter = Limiter(key_func=get_remote_address)
    app.state.limiter = limiter

    # rate_limit_exceeded handler
    @app.exception_handler(RateLimitExceededError)
    async def rate_limit_handler(request, exc):
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=429,
            content={
                "detail": f"Rate limit exceeded: {exc.detail}",
                "retry_after": exc.retry_after,
            },
        )

except ImportError:
    # slowapi not installed, skip rate limiting
    limiter = None


# ===========================================
# Exception Handlers
# ===========================================
register_exception_handlers(app)


# ===========================================
# Routers
# ===========================================
# Import routers here after creating modules
from modules.auth.router import router as auth_router

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])


# ===========================================
# Health Check
# ===========================================
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "app": "Food Store API"}


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Food Store API",
        "docs": "/docs",
        "redoc": "/redoc"
    }