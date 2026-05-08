"""
Categorías Router - Category endpoints
"""
from typing import Optional

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from core.database import get_session
from core.dependencies import get_current_user, get_current_user_optional, require_role
from db.models import Usuario
from modules.categorias.schemas import CategoriaCreate, CategoriaUpdate, CategoriaRead
from modules.categorias.service import CategoriaService

router = APIRouter()


@router.get("/", response_model=list[dict])
def list_categorias(
    raiz: bool = False,
    session: Session = Depends(get_session),
):
    """
    Listar categorías activas.
    - Por defecto: devuelve árbol completo con nivel de profundidad
    - ?raiz=true: solo categorías raíz (sin padre)
    """
    service = CategoriaService(session)
    if raiz:
        from modules.categorias.repository import CategoriaRepository
        repo = CategoriaRepository(session)
        return repo.get_root_categories()
    return service.get_all()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def get_categoria(
    categoria_id: int,
    session: Session = Depends(get_session),
):
    """Obtener detalle de una categoría."""
    service = CategoriaService(session)
    return service.get_by_id(categoria_id)


@router.get("/{categoria_id}/subcategorias", response_model=list[CategoriaRead])
def get_subcategorias(
    categoria_id: int,
    session: Session = Depends(get_session),
):
    """Obtener subcategorías directas de una categoría."""
    service = CategoriaService(session)
    return service.get_subcategorias(categoria_id)


@router.post("/", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def create_categoria(
    data: CategoriaCreate,
    session: Session = Depends(get_session),
    _: Usuario = Depends(require_role("ADMIN", "STOCK")),
):
    """Crear una nueva categoría (requiere ADMIN o STOCK)."""
    service = CategoriaService(session)
    return service.create(data.model_dump())


@router.patch("/{categoria_id}", response_model=CategoriaRead)
def update_categoria(
    categoria_id: int,
    data: CategoriaUpdate,
    session: Session = Depends(get_session),
    _: Usuario = Depends(require_role("ADMIN", "STOCK")),
):
    """Actualizar una categoría (requiere ADMIN o STOCK)."""
    service = CategoriaService(session)
    return service.update(categoria_id, data)


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_categoria(
    categoria_id: int,
    session: Session = Depends(get_session),
    _: Usuario = Depends(require_role("ADMIN", "STOCK")),
):
    """Eliminar una categoría (soft delete, requiere ADMIN o STOCK)."""
    service = CategoriaService(session)
    service.soft_delete(categoria_id)
