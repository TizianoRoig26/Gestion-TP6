"""
Productos Router - Product endpoints
"""
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from core.database import get_session
from core.dependencies import get_current_user, get_current_user_optional, require_role
from db.models import Usuario
from modules.productos.schemas import (
    ProductoCreate,
    ProductoUpdate,
    ProductoStockUpdate,
    ProductoRead,
    PaginatedResponse,
)
from modules.productos.service import ProductoService

router = APIRouter()


@router.get("/", response_model=PaginatedResponse)
def list_productos(
    search: Optional[str] = Query(None, description="Búsqueda por nombre"),
    categoria_id: Optional[int] = Query(None, description="Filtrar por categoría"),
    alergeno_id: Optional[int] = Query(None, description="Filtrar por alérgeno"),
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(12, ge=1, le=100, description="Items por página"),
    current_user: Optional[Usuario] = Depends(get_current_user_optional),
    session: Session = Depends(get_session),
):
    """
    Listar productos del catálogo.
    
    - Sin autenticación: solo productos disponibles
    - Con autenticación ADMIN/STOCK: todos los productos
    - Filtros: search (ILIKE nombre), categoria_id, alergeno_id
    - Paginación: page, page_size (default 12, max 100)
    """
    # Check if user has admin/stock role (via DB)
    admin = False
    if current_user:
        from modules.auth.repository import UsuarioRepository
        roles = UsuarioRepository(session).get_roles(current_user.id)
        admin = any(r in ["ADMIN", "STOCK"] for r in roles)

    service = ProductoService(session)
    return service.list_products(
        search=search,
        categoria_id=categoria_id,
        alergeno_id=alergeno_id,
        admin=admin,
        page=page,
        page_size=page_size,
    )


@router.get("/{producto_id}", response_model=ProductoRead)
def get_producto(
    producto_id: int,
    session: Session = Depends(get_session),
):
    """Obtener detalle completo de un producto con categorías e ingredientes."""
    service = ProductoService(session)
    return service.get_by_id(producto_id)


@router.post("/", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def create_producto(
    data: ProductoCreate,
    session: Session = Depends(get_session),
    _: Usuario = Depends(require_role("ADMIN", "STOCK")),
):
    """Crear un nuevo producto (requiere ADMIN o STOCK)."""
    service = ProductoService(session)
    return service.create(data.model_dump())


@router.patch("/{producto_id}", response_model=ProductoRead)
def update_producto(
    producto_id: int,
    data: ProductoUpdate,
    session: Session = Depends(get_session),
    _: Usuario = Depends(require_role("ADMIN", "STOCK")),
):
    """Actualizar un producto (requiere ADMIN o STOCK)."""
    service = ProductoService(session)
    return service.update(producto_id, data.model_dump(exclude_unset=True))


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def update_producto_stock(
    producto_id: int,
    data: ProductoStockUpdate,
    session: Session = Depends(get_session),
    _: Usuario = Depends(require_role("ADMIN", "STOCK")),
):
    """Actualizar stock de un producto (requiere ADMIN o STOCK)."""
    service = ProductoService(session)
    return service.update_stock(producto_id, data.stock_cantidad)


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_producto(
    producto_id: int,
    session: Session = Depends(get_session),
    _: Usuario = Depends(require_role("ADMIN", "STOCK")),
):
    """Eliminar un producto (soft delete, requiere ADMIN o STOCK)."""
    service = ProductoService(session)
    service.soft_delete(producto_id)
