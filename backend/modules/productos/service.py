"""
Productos Service - Business logic for products
"""
from typing import Optional

from fastapi import HTTPException, status
from sqlmodel import Session

from db.models import Producto
from modules.productos.repository import ProductoRepository
from modules.productos.schemas import (
    ProductoListRead,
    ProductoRead,
    CategoriaInfo,
    IngredienteInfo,
    PaginatedResponse,
)
from core.exceptions import ConflictException


class ProductoService:
    """Service for product operations."""

    def __init__(self, session: Session):
        self.session = session
        self.repo = ProductoRepository(session)

    def list_products(
        self,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        alergeno_id: Optional[int] = None,
        admin: bool = False,
        page: int = 1,
        page_size: int = 12,
    ) -> PaginatedResponse:
        """List products with filters and pagination."""
        solo_disponibles = not admin

        items, total = self.repo.get_all(
            search=search,
            categoria_id=categoria_id,
            alergeno_id=alergeno_id,
            solo_disponibles=solo_disponibles,
            page=page,
            page_size=page_size,
        )

        # Build response with categories
        producto_list = []
        for p in items:
            categorias = self.repo.get_categorias(p.id)
            producto_list.append(
                ProductoListRead(
                    id=p.id,
                    nombre=p.nombre,
                    descripcion=p.descripcion,
                    imagen_url=p.imagen_url,
                    precio_base=p.precio_base,
                    stock_cantidad=p.stock_cantidad,
                    disponible=p.disponible,
                    creado_en=p.creado_en,
                    categorias=[CategoriaInfo(id=c.id, nombre=c.nombre) for c in categorias],
                )
            )

        pages = max(1, (total + page_size - 1) // page_size)

        return PaginatedResponse(
            items=producto_list,
            total=total,
            page=page,
            page_size=page_size,
            pages=pages,
        )

    def get_by_id(self, producto_id: int) -> ProductoRead:
        """Get full product detail by ID."""
        producto = self.repo.get_active_by_id(producto_id)
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado",
            )

        # Load relationships
        categorias = self.repo.get_categorias(producto_id)
        ingredientes_data = self.repo.get_ingredientes(producto_id)

        return ProductoRead(
            id=producto.id,
            nombre=producto.nombre,
            descripcion=producto.descripcion,
            imagen_url=producto.imagen_url,
            precio_base=producto.precio_base,
            stock_cantidad=producto.stock_cantidad,
            disponible=producto.disponible,
            creado_en=producto.creado_en,
            categorias=[CategoriaInfo(id=c.id, nombre=c.nombre) for c in categorias],
            ingredientes=[
                IngredienteInfo(id=ing.id, nombre=ing.nombre, es_alergeno=ing.es_alergeno, es_removible=removible)
                for ing, removible in ingredientes_data
            ],
        )

    def create(self, data: dict) -> Producto:
        """Create a new product with associations."""
        categoria_ids = data.pop("categoria_ids", [])
        ingrediente_ids = data.pop("ingrediente_ids", [])

        producto = Producto(**data)
        producto = self.repo.create(producto)

        # Set associations
        if categoria_ids:
            self.repo.set_categorias(producto.id, categoria_ids)
        if ingrediente_ids:
            self.repo.set_ingredientes(producto.id, ingrediente_ids)

        self.session.commit()
        self.session.refresh(producto)
        return producto

    def update(self, producto_id: int, data: dict) -> Producto:
        """Update a product."""
        producto = self.repo.get_by_id(producto_id)
        if not producto or producto.eliminado_en:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado",
            )

        # Extract association fields
        categoria_ids = data.pop("categoria_ids", None)
        ingrediente_ids = data.pop("ingrediente_ids", None)

        # Update scalar fields
        for field, value in data.items():
            setattr(producto, field, value)

        producto = self.repo.update(producto)

        # Update associations if provided
        if categoria_ids is not None:
            self.repo.set_categorias(producto_id, categoria_ids)
        if ingrediente_ids is not None:
            self.repo.set_ingredientes(producto_id, ingrediente_ids)

        if categoria_ids is not None or ingrediente_ids is not None:
            self.session.commit()
            self.session.refresh(producto)

        return producto

    def update_stock(self, producto_id: int, stock_cantidad: int) -> Producto:
        """Update product stock."""
        producto = self.repo.get_by_id(producto_id)
        if not producto or producto.eliminado_en:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado",
            )

        producto.stock_cantidad = stock_cantidad
        return self.repo.update(producto)

    def soft_delete(self, producto_id: int) -> None:
        """Soft delete a product."""
        producto = self.repo.get_by_id(producto_id)
        if not producto or producto.eliminado_en:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado",
            )

        self.repo.soft_delete(producto)
