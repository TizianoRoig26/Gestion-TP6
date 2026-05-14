"""
Ingredientes Service - Business logic for ingredients
"""
from typing import Optional

from fastapi import HTTPException, status
from sqlmodel import Session

from db.models import Ingrediente
from modules.ingredientes.repository import IngredienteRepository
from core.exceptions import ConflictException


class IngredienteService:
    """Service for ingredient operations."""

    def __init__(self, session: Session):
        self.session = session
        self.repo = IngredienteRepository(session)

    def get_all(self, solo_alergenos: bool = False) -> list[Ingrediente]:
        """Get all active ingredients."""
        return self.repo.get_all(solo_alergenos=solo_alergenos)

    def get_by_id(self, ingrediente_id: int) -> Ingrediente:
        """Get active ingredient by ID."""
        ingrediente = self.repo.get_active_by_id(ingrediente_id)
        if not ingrediente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ingrediente no encontrado",
            )
        return ingrediente

    def create(self, data: dict) -> Ingrediente:
        """Create a new ingredient."""
        # Check unique name
        existing = self.repo.get_by_nombre(data["nombre"])
        if existing:
            if existing.eliminado_en:
                # If soft-deleted, reactivate by removing eliminado_en
                existing.eliminado_en = None
                existing.es_alergeno = data.get("es_alergeno", False)
                existing.descripcion = data.get("descripcion")
                existing = self.repo.update(existing)
                self.session.commit()
                return existing
            raise ConflictException(
                f"Ya existe un ingrediente con el nombre '{data['nombre']}'"
            )

        ingrediente = Ingrediente(**data)
        ingrediente = self.repo.create(ingrediente)
        self.session.commit()
        return ingrediente

    def update(self, ingrediente_id: int, data: dict) -> Ingrediente:
        """Update an ingredient."""
        ingrediente = self.repo.get_by_id(ingrediente_id)
        if not ingrediente or ingrediente.eliminado_en:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ingrediente no encontrado",
            )

        # Check unique name if changing name
        if "nombre" in data and data["nombre"] != ingrediente.nombre:
            existing = self.repo.get_by_nombre(data["nombre"])
            if existing and existing.id != ingrediente_id:
                raise ConflictException(
                    f"Ya existe un ingrediente con el nombre '{data['nombre']}'"
                )

        for field, value in data.items():
            setattr(ingrediente, field, value)

        ingrediente = self.repo.update(ingrediente)
        self.session.commit()
        return ingrediente

    def soft_delete(self, ingrediente_id: int) -> None:
        """Soft delete an ingredient."""
        ingrediente = self.repo.get_by_id(ingrediente_id)
        if not ingrediente or ingrediente.eliminado_en:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ingrediente no encontrado",
            )

        self.repo.soft_delete(ingrediente)
        self.session.commit()
