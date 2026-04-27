"""Initial migration - create all tables

Revision ID: 001_initial
Revises: 
Create Date: 2026-04-27

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import DateTime, func

# revision identifiers, used by Alembic.
revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create all tables at once using SQLModel metadata
    # Import all models to register them with SQLModel.metadata
    from db.models import (
        Rol,
        Usuario,
        UsuarioRol,
        RefreshToken,
        Categoria,
        Producto,
        Ingrediente,
        ProductoCategoria,
        ProductoIngrediente,
        DireccionEntrega,
        FormaPago,
        EstadoPedido,
        Pedido,
        DetallePedido,
        HistorialEstadoPedido,
        Pago,
    )

    # Create enums first
    op.execute("CREATE TYPE IF NOT EXISTS rol_nombre AS ENUM ('ADMIN', 'STOCK', 'PEDIDOS', 'CLIENT')")
    op.execute(
        "CREATE TYPE IF NOT EXISTS estado_pedido_nombre AS ENUM "
        "('PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO')"
    )

    # Create tables
    op.create_table(
        "roles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nombre", sa.Enum("ADMIN", "STOCK", "PEDIDOS", "CLIENT", name="rol_nombre"), nullable=False),
        sa.Column("descripcion", sa.String(255), nullable=True),
        sa.Column("creado_en", DateTime(timezone=True), server_default=func.now(), nullable=False),
        sa.Column("actualizado_en", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False),
        sa.Column("eliminado_en", DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("nombre"),
    )

    op.create_table(
        "usuarios",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("nombre", sa.String(100), nullable=False),
        sa.Column("apellido", sa.String(100), nullable=False),
        sa.Column("telefono", sa.String(20), nullable=True),
        sa.Column("credo_activo", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("creado_en", DateTime(timezone=True), server_default=func.now(), nullable=False),
        sa.Column("actualizado_en", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False),
        sa.Column("eliminado_en", DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index(op.f("ix_usuarios_email"), "usuarios", ["email"], unique=True)

    op.create_table(
        "usuario_roles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=False),
        sa.Column("rol_id", sa.Integer(), nullable=False),
        sa.Column("creado_en", DateTime(timezone=True), server_default=func.now(), nullable=False),
        sa.Column("actualizado_en", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False),
        sa.Column("eliminado_en", DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"]),
        sa.ForeignKeyConstraint(["rol_id"], ["roles.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_usuario_roles_usuario_id"), "usuario_roles", ["usuario_id"], unique=False)
    op.create_index(op.f("ix_usuario_roles_rol_id"), "usuario_roles", ["rol_id"], unique=False)

    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=False),
        sa.Column("token", sa.String(500), nullable=False),
        sa.Column("expira_en", sa.DateTime(timezone=True), nullable=False),
        sa.Column("creado_en", DateTime(timezone=True), server_default=func.now(), nullable=False),
        sa.Column("actualizado_en", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False),
        sa.Column("eliminado_en", DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_refresh_tokens_usuario_id"), "refresh_tokens", ["usuario_id"], unique=False)
    op.create_index(op.f("ix_refresh_tokens_token"), "refresh_tokens", ["token"], unique=True)

    op.create_table(
        "categorias",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nombre", sa.String(100), nullable=False),
        sa.Column("descripcion", sa.Text(), nullable=True),
        sa.Column("categoria_padre_id", sa.Integer(), nullable=True),
        sa.Column("activo", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("creado_en", DateTime(timezone=True), server_default=func.now(), nullable=False),
        sa.Column("actualizado_en", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False),
        sa.Column("eliminado_en", DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["categoria_padre_id"], ["categorias.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("nombre"),
    )

    op.create_table(
        "productos",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nombre", sa.String(255), nullable=False),
        sa.Column("descripcion", sa.Text(), nullable=True),
        sa.Column("precio", sa.Numeric(10, 2), nullable=False),
        sa.Column("stock", sa.Integer(), server_default="0", nullable=False),
        sa.Column("imagen_url", sa.String(500), nullable=True),
        sa.Column("activo", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("creado_en", DateTime(timezone=True), server_default=func.now(), nullable=False),
        sa.Column("actualizado_en", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False),
        sa.Column("eliminado_en", DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "ingredientes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nombre", sa.String(100), nullable=False),
        sa.Column("descripcion", sa.Text(), nullable=True),
        sa.Column("es_alergenico", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("creado_en", DateTime(timezone=True), server_default=func.now(), nullable=False),
        sa.Column("actualizado_en", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False),
        sa.Column("eliminado_en", DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("nombre"),
    )

    op.create_table(
        "producto_categorias",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("producto_id", sa.Integer(), nullable=False),
        sa.Column("categoria_id", sa.Integer(), nullable=False),
        sa.Column("creado_en", DateTime(timezone=True), server_default=func.now(), nullable=False),
        sa.Column("actualizado_en", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False),
        sa.Column("eliminado_en", DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["producto_id"], ["productos.id"]),
        sa.ForeignKeyConstraint(["categoria_id"], ["categorias.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "producto_ingredientes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("producto_id", sa.Integer(), nullable=False),
        sa.Column("ingrediente_id", sa.Integer(), nullable=False),
        sa.Column("cantidad", sa.String(50), nullable=True),
        sa.Column("creado_en", DateTime(timezone=True), server_default=func.now(), nullable=False),
        sa.Column("actualizado_en", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False),
        sa.Column("eliminado_en", DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["producto_id"], ["productos.id"]),
        sa.ForeignKeyConstraint(["ingrediente_id"], ["ingredientes.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "direcciones_entrega",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=False),
        sa.Column("direccion", sa.String(500), nullable=False),
        sa.Column("ciudad", sa.String(100), nullable=False),
        sa.Column("provincia", sa.String(100), nullable=False),
        sa.Column("codigo_postal", sa.String(20), nullable=False),
        sa.Column("pais", sa.String(50), server_default="Argentina", nullable=False),
        sa.Column("es_principal", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("creado_en", DateTime(timezone=True), server_default=func.now(), nullable=False),
        sa.Column("actualizado_en", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False),
        sa.Column("eliminado_en", DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "formas_pago",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nombre", sa.String(50), nullable=False),
        sa.Column("descripcion", sa.String(255), nullable=True),
        sa.Column("activo", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("creado_en", DateTime(timezone=True), server_default=func.now(), nullable=False),
        sa.Column("actualizado_en", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False),
        sa.Column("eliminado_en", DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("nombre"),
    )

    op.create_table(
        "estados_pedido",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nombre", sa.Enum("PENDIENTE", "CONFIRMADO", "EN_PREPARACION", "EN_CAMINO", "ENTREGADO", "CANCELADO", name="estado_pedido_nombre"), nullable=False),
        sa.Column("descripcion", sa.String(255), nullable=True),
        sa.Column("creado_en", DateTime(timezone=True), server_default=func.now(), nullable=False),
        sa.Column("actualizado_en", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False),
        sa.Column("eliminado_en", DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("nombre"),
    )

    op.create_table(
        "pedidos",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=False),
        sa.Column("direccion_entrega_id", sa.Integer(), nullable=False),
        sa.Column("forma_pago_id", sa.Integer(), nullable=False),
        sa.Column("estado_pedido_id", sa.Integer(), nullable=False),
        sa.Column("numero_pedido", sa.String(20), nullable=False),
        sa.Column("total", sa.Numeric(10, 2), nullable=False),
        sa.Column("observaciones", sa.Text(), nullable=True),
        sa.Column("creado_en", DateTime(timezone=True), server_default=func.now(), nullable=False),
        sa.Column("actualizado_en", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False),
        sa.Column("eliminado_en", DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"]),
        sa.ForeignKeyConstraint(["direccion_entrega_id"], ["direcciones_entrega.id"]),
        sa.ForeignKeyConstraint(["forma_pago_id"], ["formas_pago.id"]),
        sa.ForeignKeyConstraint(["estado_pedido_id"], ["estados_pedido.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_pedidos_numero_pedido"), "pedidos", ["numero_pedido"], unique=True)

    op.create_table(
        "detalles_pedido",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("pedido_id", sa.Integer(), nullable=False),
        sa.Column("producto_id", sa.Integer(), nullable=False),
        sa.Column("producto_nombre", sa.String(255), nullable=False),
        sa.Column("producto_precio", sa.Numeric(10, 2), nullable=False),
        sa.Column("cantidad", sa.Integer(), nullable=False),
        sa.Column("subtotal", sa.Numeric(10, 2), nullable=False),
        sa.Column("creado_en", DateTime(timezone=True), server_default=func.now(), nullable=False),
        sa.Column("actualizado_en", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False),
        sa.Column("eliminado_en", DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["pedido_id"], ["pedidos.id"]),
        sa.ForeignKeyConstraint(["producto_id"], ["productos.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "historial_estados_pedido",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("pedido_id", sa.Integer(), nullable=False),
        sa.Column("estado_pedido_id", sa.Integer(), nullable=False),
        sa.Column("comentario", sa.Text(), nullable=True),
        sa.Column("creado_en", DateTime(timezone=True), server_default=func.now(), nullable=False),
        sa.Column("eliminado_en", DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["pedido_id"], ["pedidos.id"]),
        sa.ForeignKeyConstraint(["estado_pedido_id"], ["estados_pedido.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "pagos",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("pedido_id", sa.Integer(), nullable=False),
        sa.Column("forma_pago_id", sa.Integer(), nullable=False),
        sa.Column("monto", sa.Numeric(10, 2), nullable=False),
        sa.Column("estado", sa.String(50), nullable=False),
        sa.Column("payment_id", sa.String(255), nullable=True),
        sa.Column("payment_status", sa.String(50), nullable=True),
        sa.Column("merchant_order_id", sa.String(255), nullable=True),
        sa.Column("creado_en", DateTime(timezone=True), server_default=func.now(), nullable=False),
        sa.Column("actualizado_en", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False),
        sa.Column("eliminado_en", DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["pedido_id"], ["pedidos.id"]),
        sa.ForeignKeyConstraint(["forma_pago_id"], ["formas_pago.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    """Drop all tables"""
    op.drop_table("pagos")
    op.drop_table("historial_estados_pedido")
    op.drop_table("detalles_pedido")
    op.drop_table("pedidos")
    op.drop_table("estados_pedido")
    op.drop_table("formas_pago")
    op.drop_table("direcciones_entrega")
    op.drop_table("producto_ingredientes")
    op.drop_table("producto_categorias")
    op.drop_table("ingredientes")
    op.drop_table("productos")
    op.drop_table("categorias")
    op.drop_table("refresh_tokens")
    op.drop_table("usuario_roles")
    op.drop_table("usuarios")
    op.drop_table("roles")

    op.execute("DROP TYPE IF EXISTS estado_pedido_nombre")
    op.execute("DROP TYPE IF EXISTS rol_nombre")