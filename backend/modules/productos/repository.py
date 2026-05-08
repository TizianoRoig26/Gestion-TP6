"""
Productos Repository - Data access layer for products
"""
from datetime import datetime
from typing import Optional, List

from sqlmodel import Session, select, func

from db.models import Producto, ProductoCategoria, ProductoIngrediente, Categoria, Ingrediente


class ProductoRepository:
    """Repository for Producto operations."""

    def __init__(self, session: Session):
        self.session = session

    def get_all(
        self,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        alergeno_id: Optional[int] = None,
        solo_disponibles: bool = True,
        page: int = 1,
        page_size: int = 12,
    ) -> tuple[list[Producto], int]:
        """
        Get products with filters and pagination.
        Returns (items, total_count).
        """
        # Base query
        query = select(Producto).distinct()
        count_query = select(func.count(Producto.id).distinct())

        # Joins for filtering
        if categoria_id is not None:
            query = query.join(ProductoCategoria, ProductoCategoria.producto_id == Producto.id)
            count_query = count_query.join(ProductoCategoria, ProductoCategoria.producto_id == Producto.id)

        if alergeno_id is not None:
            query = (
                query.join(ProductoIngrediente, ProductoIngrediente.producto_id == Producto.id)
            )
            count_query = (
                count_query.join(ProductoIngrediente, ProductoIngrediente.producto_id == Producto.id)
            )

        # Conditions
        conditions = [Producto.eliminado_en.is_(None)]

        if solo_disponibles:
            conditions.append(Producto.disponible == True)

        if search:
            conditions.append(Producto.nombre.ilike(f"%{search}%"))

        if categoria_id is not None:
            conditions.append(ProductoCategoria.categoria_id == categoria_id)

        if alergeno_id is not None:
            conditions.append(ProductoIngrediente.ingrediente_id == alergeno_id)

        # Apply conditions
        for condition in conditions:
            query = query.where(condition)
            count_query = count_query.where(condition)

        # Count total
        total = self.session.exec(count_query).one()

        # Apply pagination
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size).order_by(Producto.nombre)

        items = list(self.session.exec(query))

        return items, total

    def get_by_id(self, producto_id: int) -> Optional[Producto]:
        """Get product by ID (including soft-deleted)."""
        return self.session.get(Producto, producto_id)

    def get_active_by_id(self, producto_id: int) -> Optional[Producto]:
        """Get active product by ID (excluding soft-deleted)."""
        statement = (
            select(Producto)
            .where(Producto.id == producto_id)
            .where(Producto.eliminado_en.is_(None))
        )
        return self.session.exec(statement).first()

    def get_categorias(self, producto_id: int) -> list[Categoria]:
        """Get categories associated with a product."""
        statement = (
            select(Categoria)
            .join(ProductoCategoria, ProductoCategoria.categoria_id == Categoria.id)
            .where(ProductoCategoria.producto_id == producto_id)
            .where(Categoria.eliminado_en.is_(None))
        )
        return list(self.session.exec(statement))

    def get_ingredientes(self, producto_id: int) -> list[tuple[Ingrediente, bool]]:
        """
        Get ingredients associated with a product, with removible flag.
        Returns list of (Ingrediente, es_removible).
        """
        statement = (
            select(Ingrediente, ProductoIngrediente.es_removible)
            .join(ProductoIngrediente, ProductoIngrediente.ingrediente_id == Ingrediente.id)
            .where(ProductoIngrediente.producto_id == producto_id)
            .where(Ingrediente.eliminado_en.is_(None))
        )
        results = self.session.exec(statement).all()
        return [(row[0], row[1]) for row in results]

    def set_categorias(self, producto_id: int, categoria_ids: list[int]) -> None:
        """Replace all category associations for a product."""
        # Remove existing
        old = self.session.exec(
            select(ProductoCategoria).where(ProductoCategoria.producto_id == producto_id)
        ).all()
        for item in old:
            self.session.delete(item)

        # Add new
        for cat_id in categoria_ids:
            self.session.add(ProductoCategoria(producto_id=producto_id, categoria_id=cat_id))

        self.session.flush()

    def set_ingredientes(self, producto_id: int, ingrediente_ids: list[int]) -> None:
        """Replace all ingredient associations for a product."""
        # Remove existing
        old = self.session.exec(
            select(ProductoIngrediente).where(ProductoIngrediente.producto_id == producto_id)
        ).all()
        for item in old:
            self.session.delete(item)

        # Add new
        for ing_id in ingrediente_ids:
            self.session.add(ProductoIngrediente(
                producto_id=producto_id,
                ingrediente_id=ing_id,
                es_removible=True,
            ))

        self.session.flush()

    def create(self, producto: Producto) -> Producto:
        """Create a new product."""
        self.session.add(producto)
        self.session.flush()
        self.session.refresh(producto)
        return producto

    def update(self, producto: Producto) -> Producto:
        """Update an existing product."""
        self.session.add(producto)
        self.session.flush()
        self.session.refresh(producto)
        return producto

    def soft_delete(self, producto: Producto) -> None:
        """Soft delete a product."""
        producto.eliminado_en = datetime.utcnow()
        self.session.add(producto)
        self.session.flush()
