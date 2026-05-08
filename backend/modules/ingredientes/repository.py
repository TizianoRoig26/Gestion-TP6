"""
Ingredientes Repository - Data access layer for ingredients
"""
from datetime import datetime
from typing import Optional

from sqlmodel import Session, select

from db.models import Ingrediente


class IngredienteRepository:
    """Repository for Ingrediente operations."""

    def __init__(self, session: Session):
        self.session = session

    def get_all(self, solo_alergenos: bool = False) -> list[Ingrediente]:
        """Get active ingredients, optionally only allergens."""
        statement = select(Ingrediente).where(Ingrediente.eliminado_en.is_(None))

        if solo_alergenos:
            statement = statement.where(Ingrediente.es_alergeno == True)

        statement = statement.order_by(Ingrediente.nombre)
        return list(self.session.exec(statement))

    def get_by_id(self, ingrediente_id: int) -> Optional[Ingrediente]:
        """Get ingredient by ID (including soft-deleted)."""
        return self.session.get(Ingrediente, ingrediente_id)

    def get_active_by_id(self, ingrediente_id: int) -> Optional[Ingrediente]:
        """Get active ingredient by ID (excluding soft-deleted)."""
        statement = (
            select(Ingrediente)
            .where(Ingrediente.id == ingrediente_id)
            .where(Ingrediente.eliminado_en.is_(None))
        )
        return self.session.exec(statement).first()

    def get_by_nombre(self, nombre: str) -> Optional[Ingrediente]:
        """Get ingredient by name (including soft-deleted)."""
        statement = select(Ingrediente).where(Ingrediente.nombre == nombre)
        return self.session.exec(statement).first()

    def create(self, ingrediente: Ingrediente) -> Ingrediente:
        """Create a new ingredient."""
        self.session.add(ingrediente)
        self.session.flush()
        self.session.refresh(ingrediente)
        return ingrediente

    def update(self, ingrediente: Ingrediente) -> Ingrediente:
        """Update an existing ingredient."""
        self.session.add(ingrediente)
        self.session.flush()
        self.session.refresh(ingrediente)
        return ingrediente

    def soft_delete(self, ingrediente: Ingrediente) -> None:
        """Soft delete an ingredient."""
        ingrediente.eliminado_en = datetime.utcnow()
        self.session.add(ingrediente)
        self.session.flush()
