"""
Ingredientes Router - Ingredient endpoints
"""
from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from core.database import get_session
from core.dependencies import get_current_user, require_role
from db.models import Usuario
from modules.ingredientes.schemas import IngredienteCreate, IngredienteUpdate, IngredienteRead
from modules.ingredientes.service import IngredienteService

router = APIRouter()


@router.get("/", response_model=list[IngredienteRead])
def list_ingredientes(
    solo_alergenos: bool = False,
    session: Session = Depends(get_session),
):
    """
    Listar ingredientes activos.
    - ?solo_alergenos=true: solo ingredientes marcados como alérgenos
    """
    service = IngredienteService(session)
    return service.get_all(solo_alergenos=solo_alergenos)


@router.get("/{ingrediente_id}", response_model=IngredienteRead)
def get_ingrediente(
    ingrediente_id: int,
    session: Session = Depends(get_session),
):
    """Obtener detalle de un ingrediente."""
    service = IngredienteService(session)
    return service.get_by_id(ingrediente_id)


@router.post("/", response_model=IngredienteRead, status_code=status.HTTP_201_CREATED)
def create_ingrediente(
    data: IngredienteCreate,
    session: Session = Depends(get_session),
    _: Usuario = Depends(require_role("ADMIN", "STOCK")),
):
    """Crear un nuevo ingrediente (requiere ADMIN o STOCK)."""
    service = IngredienteService(session)
    return service.create(data.model_dump())


@router.patch("/{ingrediente_id}", response_model=IngredienteRead)
def update_ingrediente(
    ingrediente_id: int,
    data: IngredienteUpdate,
    session: Session = Depends(get_session),
    _: Usuario = Depends(require_role("ADMIN", "STOCK")),
):
    """Actualizar un ingrediente (requiere ADMIN o STOCK)."""
    service = IngredienteService(session)
    return service.update(ingrediente_id, data.model_dump(exclude_unset=True))


@router.delete("/{ingrediente_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ingrediente(
    ingrediente_id: int,
    session: Session = Depends(get_session),
    _: Usuario = Depends(require_role("ADMIN", "STOCK")),
):
    """Eliminar un ingrediente (soft delete, requiere ADMIN o STOCK)."""
    service = IngredienteService(session)
    service.soft_delete(ingrediente_id)
