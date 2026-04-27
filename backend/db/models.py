"""
DB Models - Food Store Entity Definitions
Based on ERD v5 from specs
"""
from datetime import datetime
from typing import Optional, List

from sqlmodel import Field, Relationship, SQLModel


# ===================================================
# DOMINIO 1: IDENTIDAD Y ACCESO
# ===================================================

class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=200)
    email: str = Field(max_length=254, unique=True, index=True)
    password_hash: str = Field(max_length=60)
    telefono: Optional[str] = Field(default=None, max_length=20)
    creado_en: datetime = Field(default_factory=datetime.utcnow)
    actualizado_en: Optional[datetime] = Field(default=None)
    eliminado_en: Optional[datetime] = Field(default=None)


class Rol(SQLModel, table=True):
    __tablename__ = "roles"

    id: Optional[int] = Field(default=None, primary_key=True)
    codigo: str = Field(max_length=20, unique=True)
    nombre: str = Field(max_length=100)
    descripcion: Optional[str] = Field(default=None)


class UsuarioRol(SQLModel, table=True):
    __tablename__ = "usuarios_roles"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuarios.id")
    rol_codigo: str = Field(max_length=20, foreign_key="roles.codigo")
    asignado_por_id: Optional[int] = Field(default=None, foreign_key="usuarios.id")
    creado_en: datetime = Field(default_factory=datetime.utcnow)


class RefreshToken(SQLModel, table=True):
    __tablename__ = "refresh_tokens"

    id: Optional[int] = Field(default=None, primary_key=True)
    token: str = Field(max_length=64, unique=True, index=True)
    usuario_id: int = Field(foreign_key="usuarios.id")
    expires_at: datetime
    revoked_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class DireccionEntrega(SQLModel, table=True):
    __tablename__ = "direcciones_entrega"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuarios.id")
    alias: Optional[str] = Field(default=None, max_length=50)
    linea1: str
    linea2: Optional[str] = Field(default=None)
    ciudad: str = Field(max_length=100)
    codigo_postal: str = Field(max_length=20)
    referencia: Optional[str] = Field(default=None)
    es_predeterminada: bool = Field(default=False)
    creado_en: datetime = Field(default_factory=datetime.utcnow)
    actualizado_en: Optional[datetime] = Field(default=None)
    eliminado_en: Optional[datetime] = Field(default=None)


# ===================================================
# DOMINIO 2: CATÁLOGO DE PRODUCTOS
# ===================================================

class Categoria(SQLModel, table=True):
    __tablename__ = "categorias"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100)
    descripcion: Optional[str] = Field(default=None)
    imagen: Optional[str] = Field(default=None)
    padre_id: Optional[int] = Field(default=None, foreign_key="categorias.id")
    creado_en: datetime = Field(default_factory=datetime.utcnow)
    actualizado_en: Optional[datetime] = Field(default=None)
    eliminado_en: Optional[datetime] = Field(default=None)


class Producto(SQLModel, table=True):
    __tablename__ = "productos"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=200)
    descripcion: Optional[str] = Field(default=None)
    imagen_url: Optional[str] = Field(default=None)
    precio_base: float = Field(ge=0)
    stock_cantidad: int = Field(default=0, ge=0)
    disponible: bool = Field(default=True)
    creado_en: datetime = Field(default_factory=datetime.utcnow)
    actualizado_en: Optional[datetime] = Field(default=None)
    eliminado_en: Optional[datetime] = Field(default=None)


class Ingrediente(SQLModel, table=True):
    __tablename__ = "ingredientes"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100, unique=True)
    descripcion: Optional[str] = Field(default=None)
    es_alergeno: bool = Field(default=False)
    creado_en: datetime = Field(default_factory=datetime.utcnow)
    eliminado_en: Optional[datetime] = Field(default=None)


class ProductoCategoria(SQLModel, table=True):
    __tablename__ = "productos_categorias"

    id: Optional[int] = Field(default=None, primary_key=True)
    producto_id: int = Field(foreign_key="productos.id")
    categoria_id: int = Field(foreign_key="categorias.id")


class ProductoIngrediente(SQLModel, table=True):
    __tablename__ = "productos_ingredientes"

    id: Optional[int] = Field(default=None, primary_key=True)
    producto_id: int = Field(foreign_key="productos.id")
    ingrediente_id: int = Field(foreign_key="ingredientes.id")
    es_removible: bool = Field(default=True)


class FormaPago(SQLModel, table=True):
    __tablename__ = "formas_pago"

    codigo: str = Field(max_length=20, primary_key=True)
    nombre: str = Field(max_length=100)
    habilitado: bool = Field(default=True)


# ===================================================
# DOMINIO 3: VENTAS, PAGOS Y TRAZABILIDAD
# ===================================================

class EstadoPedido(SQLModel, table=True):
    __tablename__ = "estados_pedido"

    codigo: str = Field(max_length=20, primary_key=True)
    nombre: str = Field(max_length=100)
    descripcion: Optional[str] = Field(default=None)
    es_terminal: bool = Field(default=False)


class Pedido(SQLModel, table=True):
    __tablename__ = "pedidos"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuarios.id")
    estado_codigo: str = Field(max_length=20, foreign_key="estados_pedido.codigo")
    direccion_id: Optional[int] = Field(default=None, foreign_key="direcciones_entrega.id")
    forma_pago_codigo: str = Field(max_length=20, foreign_key="formas_pago.codigo")
    total: float = Field(ge=0)
    costo_envio: float = Field(default=50.0, ge=0)
    direccion_snapshot: Optional[str] = Field(default=None)
    creado_en: datetime = Field(default_factory=datetime.utcnow)
    actualizado_en: Optional[datetime] = Field(default=None)
    eliminado_en: Optional[datetime] = Field(default=None)


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalles_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id")
    producto_id: int = Field(foreign_key="productos.id")
    cantidad: int = Field(ge=1)
    precio_snapshot: float = Field(ge=0)
    nombre_snapshot: str = Field(max_length=200)
    subtotal: float = Field(ge=0)
    personalizacion: Optional[List[int]] = Field(default=None)


class HistorialEstadoPedido(SQLModel, table=True):
    __tablename__ = "historial_estados_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id")
    estado_desde: Optional[str] = Field(default=None, max_length=20)
    estado_hacia: str = Field(max_length=20)
    usuario_id: Optional[int] = Field(default=None, foreign_key="usuarios.id")
    observacion: Optional[str] = Field(default=None, max_length=500)
    creado_en: datetime = Field(default_factory=datetime.utcnow)


class Pago(SQLModel, table=True):
    __tablename__ = "pagos"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id")
    monto: float = Field(ge=0)
    mp_payment_id: Optional[int] = Field(default=None)
    mp_status: str = Field(max_length=30)
    external_reference: str = Field(max_length=100)
    idempotency_key: str = Field(max_length=100, unique=True)
    creado_en: datetime = Field(default_factory=datetime.utcnow)