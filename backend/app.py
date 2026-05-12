"""
Food Store - FastAPI Application
"""
from fastapi import FastAPI, Request
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
from core.limiter import limiter
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded

app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Rate limit exceeded. Try again later.",
        },
    )


# ===========================================
# Exception Handlers
# ===========================================
register_exception_handlers(app)


# ===========================================
# Routers
# ===========================================
# Import routers here after creating modules
from modules.auth.router import router as auth_router
from modules.categorias.router import router as categorias_router
from modules.ingredientes.router import router as ingredientes_router
from modules.productos.router import router as productos_router
from modules.pedidos.router import router as pedidos_router, admin_router as pedidos_admin_router
from modules.pagos.router import router as pagos_router
from modules.admin.router import router as admin_router

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(categorias_router, prefix="/api/v1/categorias", tags=["categorias"])
app.include_router(ingredientes_router, prefix="/api/v1/ingredientes", tags=["ingredientes"])
app.include_router(productos_router, prefix="/api/v1/productos", tags=["productos"])
app.include_router(pedidos_router, prefix="/api/v1/pedidos", tags=["pedidos"])
app.include_router(pedidos_admin_router, prefix="/api/v1/admin/pedidos", tags=["admin-pedidos"])
app.include_router(pagos_router, prefix="/api/v1/pagos", tags=["pagos"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["admin"])


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
