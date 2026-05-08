"""
Database Seed - Initial data for Food Store
"""
from datetime import datetime

from sqlmodel import Session, select

from core.database import engine
from core.security import hash_password
from db.models import (
    Rol, FormaPago, EstadoPedido, Usuario, UsuarioRol,
    Categoria, Ingrediente, Producto, ProductoCategoria, ProductoIngrediente,
)


def seed_roles(session: Session):
    """Seed roles."""
    roles_data = [
        {"codigo": "ADMIN", "nombre": "Administrador", "descripcion": "Acceso total al sistema"},
        {"codigo": "STOCK", "nombre": "Gestor de Stock", "descripcion": "Gestión de productos y stock"},
        {"codigo": "PEDIDOS", "nombre": "Gestor de Pedidos", "descripcion": "Gestión del ciclo de pedidos"},
        {"codigo": "CLIENT", "nombre": "Cliente", "descripcion": "Usuario final"},
    ]
    
    for role_data in roles_data:
        # Check if exists by codigo (not by id)
        existing = session.exec(select(Rol).where(Rol.codigo == role_data["codigo"])).first()
        if not existing:
            role = Rol(**role_data)
            session.add(role)
    
    session.commit()
    print("[OK] Roles seeded")


def seed_estados_pedido(session: Session):
    """Seed estados de pedido."""
    estados_data = [
        {"codigo": "PENDIENTE", "nombre": "Pendiente", "descripcion": "Pedido creado, esperando pago", "es_terminal": False},
        {"codigo": "CONFIRMADO", "nombre": "Confirmado", "descripcion": "Pago procesado", "es_terminal": False},
        {"codigo": "EN_PREPARACION", "nombre": "En Preparación", "descripcion": "En proceso de preparación", "es_terminal": False},
        {"codigo": "EN_CAMINO", "nombre": "En Camino", "descripcion": "Despachado", "es_terminal": False},
        {"codigo": "ENTREGADO", "nombre": "Entregado", "descripcion": "Entregado al cliente", "es_terminal": True},
        {"codigo": "CANCELADO", "nombre": "Cancelado", "descripcion": "Pedido cancelado", "es_terminal": True},
    ]
    
    for estado_data in estados_data:
        existing = session.get(EstadoPedido, estado_data["codigo"])
        if not existing:
            estado = EstadoPedido(**estado_data)
            session.add(estado)
    
    session.commit()
    print("[OK] Estados de pedido seeded")


def seed_formas_pago(session: Session):
    """Seed formas de pago."""
    formas_data = [
        {"codigo": "MERCADOPAGO", "nombre": "MercadoPago", "habilitado": True},
        {"codigo": "EFECTIVO", "nombre": "Efectivo", "habilitado": True},
    ]
    
    for forma_data in formas_data:
        existing = session.get(FormaPago, forma_data["codigo"])
        if not existing:
            forma = FormaPago(**forma_data)
            session.add(forma)
    
    session.commit()
    print("[OK] Formas de pago seeded")


def seed_admin_user(session: Session):
    """Seed admin user."""
    from core.config import settings
    
    # Check if admin exists
    statement = select(Usuario).where(Usuario.email == settings.admin_email)
    existing = session.exec(statement).first()
    
    if not existing:
        # Create admin user
        admin = Usuario(
            nombre="Admin",
            email=settings.admin_email,
            password_hash=hash_password(settings.admin_password),
        )
        session.add(admin)
        session.commit()
        session.refresh(admin)
        
        # Assign ADMIN role
        usuario_rol = UsuarioRol(
            usuario_id=admin.id,
            rol_codigo="ADMIN",
            asignado_por_id=admin.id
        )
        session.add(usuario_rol)
        session.commit()
        
        print(f"[OK] Admin user created: {settings.admin_email}")
    else:
        print("[OK] Admin user already exists")


def seed_categorias(session: Session):
    """Seed categorías jerárquicas."""
    categorias_data = [
        {"nombre": "Bebidas", "descripcion": "Bebidas en general"},
        {"nombre": "Comidas", "descripcion": "Platos preparados"},
        {"nombre": "Snacks", "descripcion": "Snacks y picoteo"},
        {"nombre": "Gaseosas", "descripcion": "Bebidas carbonatadas", "padre_nombre": "Bebidas"},
        {"nombre": "Aguas", "descripcion": "Agas mineral y saborizadas", "padre_nombre": "Bebidas"},
        {"nombre": "Jugos", "descripcion": "Jugos naturales y envasados", "padre_nombre": "Bebidas"},
        {"nombre": "Pizzas", "descripcion": "Pizzas tradicionales y especiales", "padre_nombre": "Comidas"},
        {"nombre": "Hamburguesas", "descripcion": "Hamburguesas artesanales", "padre_nombre": "Comidas"},
        {"nombre": "Ensaladas", "descripcion": "Ensaladas frescas", "padre_nombre": "Comidas"},
    ]

    # First pass: create root categories
    created = {}
    for cat_data in categorias_data:
        padre_nombre = cat_data.pop("padre_nombre", None)
        nombre = cat_data["nombre"]

        existing = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
        if not existing:
            categoria = Categoria(**cat_data)
            session.add(categoria)
            session.flush()
            session.refresh(categoria)
            created[nombre] = categoria
        else:
            created[nombre] = existing

    # Second pass: set parent relationships
    for cat_data in [
        {"nombre": "Gaseosas", "padre_nombre": "Bebidas"},
        {"nombre": "Aguas", "padre_nombre": "Bebidas"},
        {"nombre": "Jugos", "padre_nombre": "Bebidas"},
        {"nombre": "Pizzas", "padre_nombre": "Comidas"},
        {"nombre": "Hamburguesas", "padre_nombre": "Comidas"},
        {"nombre": "Ensaladas", "padre_nombre": "Comidas"},
    ]:
        hijo = created.get(cat_data["nombre"])
        padre = created.get(cat_data["padre_nombre"])
        if hijo and padre and hijo.padre_id is None:
            hijo.padre_id = padre.id
            session.add(hijo)

    session.commit()
    print("[OK] Categorías seeded")


def seed_ingredientes(session: Session):
    """Seed ingredientes."""
    ingredientes_data = [
        {"nombre": "Gluten", "descripcion": "Proteína presente en trigo, cebada y centeno", "es_alergeno": True},
        {"nombre": "Lácteos", "descripcion": "Leche y derivados lácteos", "es_alergeno": True},
        {"nombre": "Maní", "descripcion": "Maní y derivados", "es_alergeno": True},
        {"nombre": "Soja", "descripcion": "Soja y derivados", "es_alergeno": True},
        {"nombre": "Huevo", "descripcion": "Huevo y derivados", "es_alergeno": True},
        {"nombre": "Pescado", "descripcion": "Pescado y derivados", "es_alergeno": False},
        {"nombre": "Carne Vacuna", "descripcion": "Carne de res", "es_alergeno": False},
        {"nombre": "Pollo", "descripcion": "Carne de pollo", "es_alergeno": False},
        {"nombre": "Queso", "descripcion": "Queso varios tipos", "es_alergeno": False},
        {"nombre": "Lechuga", "descripcion": "Lechuga fresca", "es_alergeno": False},
        {"nombre": "Tomate", "descripcion": "Tomate fresco", "es_alergeno": False},
        {"nombre": "Azúcar", "descripcion": "Azúcar refinada", "es_alergeno": False},
    ]

    for ing_data in ingredientes_data:
        existing = session.exec(
            select(Ingrediente).where(Ingrediente.nombre == ing_data["nombre"])
        ).first()
        if not existing:
            ingrediente = Ingrediente(**ing_data)
            session.add(ingrediente)

    session.commit()
    print("[OK] Ingredientes seeded")


def _get_categoria_id(session: Session, nombre: str) -> int:
    """Helper to get category id by name."""
    cat = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
    return cat.id if cat else None


def _get_ingrediente_id(session: Session, nombre: str) -> int:
    """Helper to get ingredient id by name."""
    ing = session.exec(select(Ingrediente).where(Ingrediente.nombre == nombre)).first()
    return ing.id if ing else None


def seed_productos(session: Session):
    """Seed productos con categorías e ingredientes."""
    productos_data = [
        {
            "nombre": "Coca Cola 500ml",
            "descripcion": "Gaseosa sabor cola 500ml",
            "precio_base": 250.0,
            "stock_cantidad": 100,
            "disponible": True,
            "categorias": ["Gaseosas"],
            "ingredientes": ["Azúcar"],
        },
        {
            "nombre": "Coca Cola Zero 500ml",
            "descripcion": "Gaseosa sabor cola sin azúcar 500ml",
            "precio_base": 260.0,
            "stock_cantidad": 80,
            "disponible": True,
            "categorias": ["Gaseosas"],
            "ingredientes": [],
        },
        {
            "nombre": "Agua Mineral 1L",
            "descripcion": "Agua mineral natural 1 litro",
            "precio_base": 180.0,
            "stock_cantidad": 150,
            "disponible": True,
            "categorias": ["Aguas"],
            "ingredientes": [],
        },
        {
            "nombre": "Agua Saborizada Limón 500ml",
            "descripcion": "Agua saborizada con jugo de limón 500ml",
            "precio_base": 200.0,
            "stock_cantidad": 60,
            "disponible": True,
            "categorias": ["Aguas"],
            "ingredientes": ["Azúcar"],
        },
        {
            "nombre": "Jugo de Naranja Natural 500ml",
            "descripcion": "Jugo exprimido natural de naranja 500ml",
            "precio_base": 350.0,
            "stock_cantidad": 40,
            "disponible": True,
            "categorias": ["Jugos"],
            "ingredientes": [],
        },
        {
            "nombre": "Pizza Mozzarella Grande",
            "descripcion": "Pizza grande de mozzarella con salsa de tomate",
            "precio_base": 1200.0,
            "stock_cantidad": 20,
            "disponible": True,
            "categorias": ["Pizzas"],
            "ingredientes": ["Gluten", "Lácteos", "Queso", "Tomate"],
        },
        {
            "nombre": "Pizza Napolitana Grande",
            "descripcion": "Pizza grande con mozzarella, rodajas de tomate y ajo",
            "precio_base": 1350.0,
            "stock_cantidad": 15,
            "disponible": True,
            "categorias": ["Pizzas"],
            "ingredientes": ["Gluten", "Lácteos", "Queso", "Tomate"],
        },
        {
            "nombre": "Pizza Sin TACC Chica",
            "descripcion": "Pizza chica sin gluten, base de harina de arroz",
            "precio_base": 1100.0,
            "stock_cantidad": 10,
            "disponible": True,
            "categorias": ["Pizzas"],
            "ingredientes": ["Lácteos", "Queso", "Tomate"],
        },
        {
            "nombre": "Hamburguesa Clásica",
            "descripcion": "Hamburguesa de carne vacuna con lechuga, tomate y queso cheddar",
            "precio_base": 950.0,
            "stock_cantidad": 25,
            "disponible": True,
            "categorias": ["Hamburguesas"],
            "ingredientes": ["Gluten", "Carne Vacuna", "Lechuga", "Tomate", "Queso"],
        },
        {
            "nombre": "Hamburguesa de Pollo",
            "descripcion": "Hamburguesa de pollo grillé con verduras frescas",
            "precio_base": 850.0,
            "stock_cantidad": 20,
            "disponible": True,
            "categorias": ["Hamburguesas"],
            "ingredientes": ["Gluten", "Pollo", "Lechuga", "Tomate"],
        },
        {
            "nombre": "Ensalada Caesar",
            "descripcion": "Ensalada con lechuga, crutones, queso parmesano y aderezo Caesar",
            "precio_base": 750.0,
            "stock_cantidad": 15,
            "disponible": True,
            "categorias": ["Ensaladas"],
            "ingredientes": ["Gluten", "Lácteos", "Lechuga", "Huevo"],
        },
        {
            "nombre": "Ensalada Mediterránea",
            "descripcion": "Ensalada con tomate, queso fresco, aceitunas y albahaca",
            "precio_base": 700.0,
            "stock_cantidad": 18,
            "disponible": True,
            "categorias": ["Ensaladas"],
            "ingredientes": ["Lácteos", "Tomate"],
        },
        {
            "nombre": "Papas Fritas Grandes",
            "descripcion": "Papas fritas crocantes, porción grande",
            "precio_base": 450.0,
            "stock_cantidad": 50,
            "disponible": True,
            "categorias": ["Snacks"],
            "ingredientes": [],
        },
        {
            "nombre": "Nachos con Queso",
            "descripcion": "Nachos de maíz con queso cheddar fundido",
            "precio_base": 550.0,
            "stock_cantidad": 30,
            "disponible": True,
            "categorias": ["Snacks"],
            "ingredientes": ["Lácteos", "Queso"],
        },
    ]

    for prod_data in productos_data:
        existing = session.exec(
            select(Producto).where(Producto.nombre == prod_data["nombre"])
        ).first()
        if existing:
            continue

        categoria_nombres = prod_data.pop("categorias", [])
        ingrediente_nombres = prod_data.pop("ingredientes", [])

        producto = Producto(**prod_data)
        session.add(producto)
        session.flush()
        session.refresh(producto)

        # Associate categories
        for cat_nombre in categoria_nombres:
            cat_id = _get_categoria_id(session, cat_nombre)
            if cat_id:
                session.add(ProductoCategoria(
                    producto_id=producto.id,
                    categoria_id=cat_id,
                ))

        # Associate ingredients
        for ing_nombre in ingrediente_nombres:
            ing_id = _get_ingrediente_id(session, ing_nombre)
            if ing_id:
                session.add(ProductoIngrediente(
                    producto_id=producto.id,
                    ingrediente_id=ing_id,
                    es_removible=True,
                ))

    session.commit()
    print("[OK] Productos seeded")


def run_seed():
    """Run all seeds."""
    with Session(engine) as session:
        print("Starting seed...")
        
        seed_roles(session)
        seed_estados_pedido(session)
        seed_formas_pago(session)
        seed_admin_user(session)
        seed_categorias(session)
        seed_ingredientes(session)
        seed_productos(session)
        
        print("\n[OK] Seed completed!")


if __name__ == "__main__":
    run_seed()