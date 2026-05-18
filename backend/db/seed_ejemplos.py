"""
Seed Ejemplos - More example data for a complete-looking site
Adds: Carnes, Pastas, Postres categories + products
"""
from datetime import datetime
from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from sqlmodel import Session, select
from core.database import engine
from db.models import (
    Categoria, Producto, Ingrediente,
    ProductoCategoria, ProductoIngrediente,
)


def _get_categoria_id(session: Session, nombre: str) -> int | None:
    cat = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
    return cat.id if cat else None


def _get_ingrediente_id(session: Session, nombre: str) -> int | None:
    ing = session.exec(select(Ingrediente).where(Ingrediente.nombre == nombre)).first()
    return ing.id if ing else None


def seed_categorias(session: Session):
    """Add new categories under Comidas."""
    comidas_id = _get_categoria_id(session, "Comidas")

    nuevas = [
        {"nombre": "Carnes", "descripcion": "Carnes vacunas y aviar", "padre_id": comidas_id},
        {"nombre": "Pastas", "descripcion": "Pastas frescas artesanales", "padre_id": comidas_id},
        {"nombre": "Postres", "descripcion": "Postres y dulces", "padre_id": comidas_id},
    ]

    for cat_data in nuevas:
        existing = session.exec(select(Categoria).where(Categoria.nombre == cat_data["nombre"])).first()
        if not existing:
            cat = Categoria(**cat_data)
            session.add(cat)
            session.flush()
            print(f"  + Categoría: {cat_data['nombre']}")
        else:
            print(f"  = Categoría ya existe: {cat_data['nombre']}")

    session.commit()
    print("[OK] Categorías adicionales seeded")


def seed_ingredientes(session: Session):
    """Add new ingredients."""
    nuevos = [
        {"nombre": "Crema", "descripcion": "Crema de leche", "es_alergeno": True},
        {"nombre": "Chocolate", "descripcion": "Chocolate amargo y con leche", "es_alergeno": False},
        {"nombre": "Vainilla", "descripcion": "Extracto de vainilla", "es_alergeno": False},
        {"nombre": "Dulce de Leche", "descripcion": "Dulce de leche tradicional", "es_alergeno": False},
        {"nombre": "Albahaca", "descripcion": "Albahaca fresca", "es_alergeno": False},
        {"nombre": "Ajo", "descripcion": "Ajo fresco", "es_alergeno": False},
        {"nombre": "Cebolla", "descripcion": "Cebolla fresca", "es_alergeno": False},
    ]

    for ing_data in nuevos:
        existing = session.exec(
            select(Ingrediente).where(Ingrediente.nombre == ing_data["nombre"])
        ).first()
        if not existing:
            ing = Ingrediente(**ing_data)
            session.add(ing)
            print(f"  + Ingrediente: {ing_data['nombre']}")
        else:
            print(f"  = Ingrediente ya existe: {ing_data['nombre']}")

    session.commit()
    print("[OK] Ingredientes adicionales seeded")


def seed_productos(session: Session):
    """Add new products."""
    productos_data = [
        # ── Carnes ──
        {
            "nombre": "Milanesa Napolitana",
            "descripcion": "Milanesa de carne vacuna con salsa de tomate, jamón y queso fundido, acompañada de papas fritas",
            "precio_base": 1350.0,
            "stock_cantidad": 20,
            "disponible": True,
            "imagen_url": None,
            "categorias": ["Carnes"],
            "ingredientes": ["Carne Vacuna", "Tomate", "Queso", "Huevo", "Gluten"],
        },
        {
            "nombre": "Bife de Chorizo",
            "descripcion": "Bife de chorizo premium 300g con guarnición a elección (ensalada o papas)",
            "precio_base": 2200.0,
            "stock_cantidad": 10,
            "disponible": True,
            "imagen_url": None,
            "categorias": ["Carnes"],
            "ingredientes": ["Carne Vacuna"],
        },
        {
            "nombre": "Pechuga de Pollo Grillada",
            "descripcion": "Pechuga de pollo grillada con ensalada verde y arroz",
            "precio_base": 1150.0,
            "stock_cantidad": 15,
            "disponible": True,
            "imagen_url": None,
            "categorias": ["Carnes"],
            "ingredientes": ["Pollo", "Lechuga", "Tomate"],
        },
        # ── Pastas ──
        {
            "nombre": "Spaghetti Bolognese",
            "descripcion": "Spaghetti con salsa bolognese casera y queso parmesano",
            "precio_base": 1100.0,
            "stock_cantidad": 18,
            "disponible": True,
            "imagen_url": None,
            "categorias": ["Pastas"],
            "ingredientes": ["Gluten", "Carne Vacuna", "Tomate", "Queso", "Ajo", "Cebolla"],
        },
        {
            "nombre": "Ñoquis de Papa con Salsa",
            "descripcion": "Ñoquis de papa artesanales con salsa de tomate y albahaca",
            "precio_base": 1050.0,
            "stock_cantidad": 15,
            "disponible": True,
            "imagen_url": None,
            "categorias": ["Pastas"],
            "ingredientes": ["Gluten", "Tomate", "Albahaca", "Queso"],
        },
        {
            "nombre": "Lasagna Clásica",
            "descripcion": "Lasagna con capas de pasta, carne, salsa bechamel y queso gratinado",
            "precio_base": 1250.0,
            "stock_cantidad": 12,
            "disponible": True,
            "imagen_url": None,
            "categorias": ["Pastas"],
            "ingredientes": ["Gluten", "Carne Vacuna", "Lácteos", "Tomate", "Queso"],
        },
        # ── Postres ──
        {
            "nombre": "Tiramisú Casero",
            "descripcion": "Tiramisú artesanal con mascarpone, café y cacao",
            "precio_base": 650.0,
            "stock_cantidad": 10,
            "disponible": True,
            "imagen_url": None,
            "categorias": ["Postres"],
            "ingredientes": ["Lácteos", "Huevo", "Gluten", "Chocolate"],
        },
        {
            "nombre": "Cheesecake de Frutos Rojos",
            "descripcion": "Cheesecake cremoso con salsa de frutos rojos",
            "precio_base": 700.0,
            "stock_cantidad": 8,
            "disponible": True,
            "imagen_url": None,
            "categorias": ["Postres"],
            "ingredientes": ["Lácteos", "Gluten", "Huevo"],
        },
        {
            "nombre": "Helado Artesanal 2 bochas",
            "descripcion": "Dos bochas de helado artesanal a elección (chocolate, dulce de leche, vainilla)",
            "precio_base": 450.0,
            "stock_cantidad": 30,
            "disponible": True,
            "imagen_url": None,
            "categorias": ["Postres"],
            "ingredientes": ["Lácteos", "Chocolate", "Dulce de Leche", "Vainilla"],
        },
        {
            "nombre": "Flan con Dulce de Leche",
            "descripcion": "Flan casero con dulce de leche y crema",
            "precio_base": 550.0,
            "stock_cantidad": 12,
            "disponible": True,
            "imagen_url": None,
            "categorias": ["Postres"],
            "ingredientes": ["Huevo", "Lácteos", "Dulce de Leche", "Crema", "Vainilla"],
        },
    ]

    for prod_data in productos_data:
        existing = session.exec(
            select(Producto).where(Producto.nombre == prod_data["nombre"])
        ).first()
        if existing:
            print(f"  = Producto ya existe: {prod_data['nombre']}")
            continue

        categoria_nombres = prod_data.pop("categorias", [])
        ingrediente_nombres = prod_data.pop("ingredientes", [])

        producto = Producto(**prod_data)
        session.add(producto)
        session.flush()
        session.refresh(producto)
        print(f"  + Producto: {prod_data['nombre']} (${prod_data['precio_base']})")

        # Link categories
        for cat_nombre in categoria_nombres:
            cat_id = _get_categoria_id(session, cat_nombre)
            if cat_id:
                session.add(ProductoCategoria(producto_id=producto.id, categoria_id=cat_id))

        # Link ingredients
        for ing_nombre in ingrediente_nombres:
            ing_id = _get_ingrediente_id(session, ing_nombre)
            if ing_id:
                session.add(ProductoIngrediente(
                    producto_id=producto.id, ingrediente_id=ing_id, es_removible=True
                ))

    session.commit()
    print("[OK] Productos adicionales seeded")


def run_seed():
    """Run all extra seeds."""
    with Session(engine) as session:
        print("Seeding additional example data...")
        seed_categorias(session)
        seed_ingredientes(session)
        seed_productos(session)
        print("\n[OK] Seed de ejemplos completado!")


if __name__ == "__main__":
    run_seed()
