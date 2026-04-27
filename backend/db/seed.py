"""
Database Seed - Initial data for Food Store
"""
from datetime import datetime

from sqlmodel import Session, select

from core.database import engine
from core.security import hash_password
from db.models import Rol, FormaPago, EstadoPedido, Usuario, UsuarioRol


def seed_roles(session: Session):
    """Seed roles."""
    roles_data = [
        {"codigo": "ADMIN", "nombre": "Administrador", "descripcion": "Acceso total al sistema"},
        {"codigo": "STOCK", "nombre": "Gestor de Stock", "descripcion": "Gestión de productos y stock"},
        {"codigo": "PEDIDOS", "nombre": "Gestor de Pedidos", "descripcion": "Gestión del ciclo de pedidos"},
        {"codigo": "CLIENT", "nombre": "Cliente", "descripcion": "Usuario final"},
    ]
    
    for role_data in roles_data:
        # Check if exists
        existing = session.get(Rol, role_data["codigo"])
        if not existing:
            role = Rol(**role_data)
            session.add(role)
    
    session.commit()
    print("✓ Roles seeded")


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
    print("✓ Estados de pedido seeded")


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
    print("✓ Formas de pago seeded")


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
        
        print(f"✓ Admin user created: {settings.admin_email}")
    else:
        print("✓ Admin user already exists")


def run_seed():
    """Run all seeds."""
    with Session(engine) as session:
        print("Starting seed...")
        
        seed_roles(session)
        seed_estados_pedido(session)
        seed_formas_pago(session)
        seed_admin_user(session)
        
        print("\n✅ Seed completed!")


if __name__ == "__main__":
    run_seed()