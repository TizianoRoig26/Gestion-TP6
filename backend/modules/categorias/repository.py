"""
Categorías Repository - Data access layer for categories
"""
from datetime import datetime
from typing import Optional, List

from sqlmodel import Session, select, text

from db.models import Categoria


class CategoriaRepository:
    """Repository for Categoria operations."""

    def __init__(self, session: Session):
        self.session = session

    def get_all(self) -> list[Categoria]:
        """Get all active categories (not soft-deleted), ordered by nombre."""
        statement = (
            select(Categoria)
            .where(Categoria.eliminado_en.is_(None))
            .order_by(Categoria.nombre)
        )
        return list(self.session.exec(statement))

    def get_by_id(self, categoria_id: int) -> Optional[Categoria]:
        """Get category by ID (including soft-deleted)."""
        return self.session.get(Categoria, categoria_id)

    def get_active_by_id(self, categoria_id: int) -> Optional[Categoria]:
        """Get active category by ID (excluding soft-deleted)."""
        statement = (
            select(Categoria)
            .where(Categoria.id == categoria_id)
            .where(Categoria.eliminado_en.is_(None))
        )
        return self.session.exec(statement).first()

    def get_root_categories(self) -> list[Categoria]:
        """Get root categories (no padre_id), excluding soft-deleted."""
        statement = (
            select(Categoria)
            .where(Categoria.padre_id.is_(None))
            .where(Categoria.eliminado_en.is_(None))
            .order_by(Categoria.nombre)
        )
        return list(self.session.exec(statement))

    def get_subcategorias(self, padre_id: int) -> list[Categoria]:
        """Get direct subcategories of a category."""
        statement = (
            select(Categoria)
            .where(Categoria.padre_id == padre_id)
            .where(Categoria.eliminado_en.is_(None))
            .order_by(Categoria.nombre)
        )
        return list(self.session.exec(statement))

    def get_tree(self) -> list[dict]:
        """
        Get full category tree using recursive CTE.
        Returns all active categories with nivel (depth).
        """
        sql = text("""
            WITH RECURSIVE categoria_tree AS (
                -- Base case: root categories
                SELECT id, nombre, descripcion, imagen, padre_id, 0 as nivel
                FROM categorias
                WHERE padre_id IS NULL AND eliminado_en IS NULL

                UNION ALL

                -- Recursive case: children
                SELECT c.id, c.nombre, c.descripcion, c.imagen, c.padre_id, ct.nivel + 1
                FROM categorias c
                INNER JOIN categoria_tree ct ON c.padre_id = ct.id
                WHERE c.eliminado_en IS NULL
            )
            SELECT id, nombre, descripcion, imagen, padre_id, nivel
            FROM categoria_tree
            ORDER BY nivel, nombre
        """)

        result = self.session.execute(sql)
        rows = result.fetchall()

        return [
            {
                "id": row.id,
                "nombre": row.nombre,
                "descripcion": row.descripcion,
                "imagen": row.imagen,
                "padre_id": row.padre_id,
                "nivel": row.nivel,
            }
            for row in rows
        ]

    def has_children(self, categoria_id: int) -> bool:
        """Check if category has active children."""
        statement = (
            select(Categoria.id)
            .where(Categoria.padre_id == categoria_id)
            .where(Categoria.eliminado_en.is_(None))
            .limit(1)
        )
        return self.session.exec(statement).first() is not None

    def has_products(self, categoria_id: int) -> bool:
        """Check if category has active products associated."""
        from db.models import ProductoCategoria, Producto
        statement = (
            select(ProductoCategoria.id)
            .join(Producto, ProductoCategoria.producto_id == Producto.id)
            .where(ProductoCategoria.categoria_id == categoria_id)
            .where(Producto.eliminado_en.is_(None))
            .limit(1)
        )
        return self.session.exec(statement).first() is not None

    def has_cycle(self, categoria_id: int, nuevo_padre_id: int) -> bool:
        """
        Check if setting padre_id would create a cycle.
        Returns True if nuevo_padre_id is a descendant of categoria_id.
        """
        sql = text("""
            WITH RECURSIVE ancestros AS (
                SELECT id, padre_id
                FROM categorias
                WHERE id = :nuevo_padre_id

                UNION ALL

                SELECT c.id, c.padre_id
                FROM categorias c
                INNER JOIN ancestros a ON c.id = a.padre_id
            )
            SELECT id FROM ancestros WHERE id = :categoria_id
        """)
        result = self.session.execute(
            sql, {"categoria_id": categoria_id, "nuevo_padre_id": nuevo_padre_id}
        )
        return result.fetchone() is not None

    def create(self, categoria: Categoria) -> Categoria:
        """Create a new category."""
        self.session.add(categoria)
        self.session.flush()
        self.session.refresh(categoria)
        return categoria

    def update(self, categoria: Categoria) -> Categoria:
        """Update an existing category."""
        self.session.add(categoria)
        self.session.flush()
        self.session.refresh(categoria)
        return categoria

    def soft_delete(self, categoria: Categoria) -> None:
        """Soft delete a category."""
        categoria.eliminado_en = datetime.utcnow()
        self.session.add(categoria)
        self.session.flush()
