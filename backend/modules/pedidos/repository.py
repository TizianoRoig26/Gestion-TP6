"""
Pedidos Repository - Data access layer for orders
"""
from datetime import datetime
from typing import Optional, List

from sqlmodel import Session, select, func
from sqlalchemy import text

from db.models import (
    Pedido,
    DetallePedido,
    DetallePedidoIngredienteRemovido,
    HistorialEstadoPedido,
    EstadoPedido,
    FormaPago,
    Producto,
    DireccionEntrega,
)


class PedidoRepository:
    """Repository for Pedido operations."""

    def __init__(self, session: Session):
        self.session = session

    # =========================================================================
    # READ OPERATIONS
    # =========================================================================

    def get_by_id(self, pedido_id: int) -> Optional[Pedido]:
        """Get order by ID (includes soft-deleted)."""
        return self.session.get(Pedido, pedido_id)

    def get_by_user(
        self,
        usuario_id: int,
        estado_codigo: Optional[str] = None,
        page: int = 1,
        page_size: int = 10,
    ) -> tuple[list[Pedido], int]:
        """
        Get orders by user with pagination and optional status filter.
        Returns (items, total_count).
        """
        query = select(Pedido)
        count_query = select(func.count(Pedido.id))

        conditions = [Pedido.usuario_id == usuario_id, Pedido.eliminado_en.is_(None)]

        if estado_codigo:
            conditions.append(Pedido.estado_codigo == estado_codigo)

        for cond in conditions:
            query = query.where(cond)
            count_query = count_query.where(cond)

        # Count total
        total = self.session.exec(count_query).one()

        # Paginate
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size).order_by(Pedido.creado_en.desc())

        items = list(self.session.exec(query))

        return items, total

    def get_all(
        self,
        estado_codigo: Optional[str] = None,
        fecha_desde: Optional[datetime] = None,
        fecha_hasta: Optional[datetime] = None,
        busqueda: Optional[str] = None,
        page: int = 1,
        page_size: int = 10,
    ) -> tuple[list[Pedido], int]:
        """
        Get all orders (admin) with filters and pagination.
        Returns (items, total_count).
        """
        from db.models import Usuario

        query = select(Pedido)
        count_query = select(func.count(Pedido.id))

        conditions = [Pedido.eliminado_en.is_(None)]

        if estado_codigo:
            conditions.append(Pedido.estado_codigo == estado_codigo)

        if fecha_desde:
            conditions.append(Pedido.creado_en >= fecha_desde)

        if fecha_hasta:
            conditions.append(Pedido.creado_en <= fecha_hasta)

        if busqueda:
            # Search by pedido id or user name
            query = query.join(Usuario, Usuario.id == Pedido.usuario_id)
            count_query = count_query.join(Usuario, Usuario.id == Pedido.usuario_id)
            conditions.append(
                Usuario.nombre.ilike(f"%{busqueda}%")
                | text("CAST(pedidos.id AS TEXT) LIKE :busqueda").bindparams(busqueda=f"%{busqueda}%")
            )

        for cond in conditions:
            query = query.where(cond)
            count_query = count_query.where(cond)

        total = self.session.exec(count_query).one()

        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size).order_by(Pedido.creado_en.desc())

        items = list(self.session.exec(query))

        return items, total

    def get_historial(self, pedido_id: int) -> list[HistorialEstadoPedido]:
        """Get status history for an order, ordered chronologically."""
        statement = (
            select(HistorialEstadoPedido)
            .where(HistorialEstadoPedido.pedido_id == pedido_id)
            .order_by(HistorialEstadoPedido.creado_en.asc())
        )
        return list(self.session.exec(statement))

    def get_detalles(self, pedido_id: int) -> list[DetallePedido]:
        """Get order details for an order."""
        statement = (
            select(DetallePedido)
            .where(DetallePedido.pedido_id == pedido_id)
        )
        return list(self.session.exec(statement))

    def get_ingredientes_removidos(self, detalle_pedido_id: int) -> list[DetallePedidoIngredienteRemovido]:
        """Get removed ingredients for an order detail."""
        statement = (
            select(DetallePedidoIngredienteRemovido)
            .where(DetallePedidoIngredienteRemovido.detalle_pedido_id == detalle_pedido_id)
        )
        return list(self.session.exec(statement))

    def get_estado(self, codigo: str) -> Optional[EstadoPedido]:
        """Get order state by code."""
        return self.session.get(EstadoPedido, codigo)

    def get_forma_pago(self, codigo: str) -> Optional[FormaPago]:
        """Get payment method by code."""
        return self.session.get(FormaPago, codigo)

    def get_direccion(self, direccion_id: int) -> Optional[DireccionEntrega]:
        """Get delivery address by ID."""
        return self.session.get(DireccionEntrega, direccion_id)

    # =========================================================================
    # STOCK VALIDATION (SELECT FOR UPDATE)
    # =========================================================================

    def validar_stock(self, items: list[tuple[int, int]]) -> list[dict]:
        """
        Validate stock for a list of (producto_id, cantidad) tuples.
        Uses SELECT FOR UPDATE to prevent race conditions.
        Returns list of errors (empty if all valid).
        Each error: {"producto_id": int, "nombre": str, "disponible": int, "solicitado": int}
        """
        errors = []
        for producto_id, cantidad in items:
            # Use SELECT FOR UPDATE to lock the row
            statement = (
                select(Producto)
                .where(Producto.id == producto_id)
                .with_for_update()
            )
            producto = self.session.exec(statement).first()

            if not producto:
                errors.append({
                    "producto_id": producto_id,
                    "nombre": "Producto no encontrado",
                    "disponible": 0,
                    "solicitado": cantidad,
                })
                continue

            if not producto.disponible or producto.eliminado_en is not None:
                errors.append({
                    "producto_id": producto_id,
                    "nombre": producto.nombre,
                    "disponible": 0,
                    "solicitado": cantidad,
                })
                continue

            if producto.stock_cantidad < cantidad:
                errors.append({
                    "producto_id": producto_id,
                    "nombre": producto.nombre,
                    "disponible": producto.stock_cantidad,
                    "solicitado": cantidad,
                })

        return errors

    # =========================================================================
    # WRITE OPERATIONS
    # =========================================================================

    def create_pedido(self, pedido: Pedido) -> Pedido:
        """Create a new order."""
        self.session.add(pedido)
        self.session.flush()
        self.session.refresh(pedido)
        return pedido

    def create_detalle(self, detalle: DetallePedido) -> DetallePedido:
        """Create an order detail."""
        self.session.add(detalle)
        self.session.flush()
        self.session.refresh(detalle)
        return detalle

    def add_ingrediente_removido(self, item: DetallePedidoIngredienteRemovido) -> None:
        """Add a removed ingredient record."""
        self.session.add(item)

    def update_estado(self, pedido: Pedido, nuevo_estado: str) -> None:
        """Update order status."""
        pedido.estado_codigo = nuevo_estado
        pedido.actualizado_en = datetime.utcnow()
        self.session.add(pedido)
        self.session.flush()

    def add_historial(self, historial: HistorialEstadoPedido) -> None:
        """Add a status history record (append-only)."""
        self.session.add(historial)
        self.session.flush()

    def _get_producto_with_lock(self, producto_id: int) -> Optional[Producto]:
        """Get product row with SELECT FOR UPDATE to prevent race conditions."""
        from sqlmodel import select
        stmt = (
            select(Producto)
            .where(Producto.id == producto_id)
            .with_for_update()
        )
        return self.session.exec(stmt).first()

    def decrementar_stock(self, producto_id: int, cantidad: int) -> None:
        """Decrement product stock atomically with row lock."""
        producto = self._get_producto_with_lock(producto_id)
        if producto:
            producto.stock_cantidad -= cantidad
            self.session.add(producto)
            self.session.flush()

    def restaurar_stock(self, producto_id: int, cantidad: int) -> None:
        """Restore product stock atomically with row lock."""
        producto = self._get_producto_with_lock(producto_id)
        if producto:
            producto.stock_cantidad += cantidad
            self.session.add(producto)
            self.session.flush()

    def commit(self) -> None:
        """Commit the current transaction."""
        self.session.commit()

    def rollback(self) -> None:
        """Rollback the current transaction."""
        self.session.rollback()
