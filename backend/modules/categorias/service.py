"""
Categorías Service - Business logic for categories
"""
from typing import Optional, List

from fastapi import HTTPException, status
from sqlmodel import Session

from db.models import Categoria
from modules.categorias.repository import CategoriaRepository
from core.exceptions import ConflictException


class CategoriaService:
    """Service for category operations."""

    def __init__(self, session: Session):
        self.session = session
        self.repo = CategoriaRepository(session)

    def get_all(self) -> list[dict]:
        """Get all categories as flat tree (with nivel for frontend)."""
        return self.repo.get_tree()

    def get_by_id(self, categoria_id: int) -> Categoria:
        """Get active category by ID."""
        categoria = self.repo.get_active_by_id(categoria_id)
        if not categoria:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada",
            )
        return categoria

    def get_subcategorias(self, categoria_id: int) -> list[Categoria]:
        """Get direct subcategories of a category."""
        # Verify parent exists
        parent = self.repo.get_active_by_id(categoria_id)
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada",
            )
        return self.repo.get_subcategorias(categoria_id)

    def create(self, data: dict) -> Categoria:
        """Create a new category."""
        # If padre_id is set, verify parent exists
        if data.get("padre_id"):
            parent = self.repo.get_active_by_id(data["padre_id"])
            if not parent:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Categoría padre no encontrada",
                )

        categoria = Categoria(**data)
        categoria = self.repo.create(categoria)
        self.session.commit()
        return categoria

    def update(self, categoria_id: int, data: dict) -> Categoria:
        """Update a category."""
        categoria = self.repo.get_by_id(categoria_id)
        if not categoria or categoria.eliminado_en:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada",
            )

        # Update fields
        update_data = data.model_dump(exclude_unset=True)

        # Validate padre_id cycle
        if "padre_id" in update_data and update_data["padre_id"] is not None:
            if update_data["padre_id"] == categoria_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Una categoría no puede ser su propio padre",
                )

            # Check if new parent exists
            new_parent = self.repo.get_active_by_id(update_data["padre_id"])
            if not new_parent:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Categoría padre no encontrada",
                )

            # Check for cycles
            if self.repo.has_cycle(categoria_id, update_data["padre_id"]):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="La jerarquía generaría un ciclo",
                )

        for field, value in update_data.items():
            setattr(categoria, field, value)

        categoria = self.repo.update(categoria)
        self.session.commit()
        return categoria

    def soft_delete(self, categoria_id: int) -> None:
        """Soft delete a category."""
        categoria = self.repo.get_by_id(categoria_id)
        if not categoria or categoria.eliminado_en:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada",
            )

        # Check for active subcategories
        if self.repo.has_children(categoria_id):
            raise ConflictException(
                "No se puede eliminar: la categoría tiene subcategorías activas"
            )

        # Check for active products
        if self.repo.has_products(categoria_id):
            raise ConflictException(
                "No se puede eliminar: la categoría tiene productos activos"
            )

        self.repo.soft_delete(categoria)
        self.session.commit()
