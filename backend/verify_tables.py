"""
Script to verify tables created in PostgreSQL
Task 6.5: Verify tables created in PostgreSQL
"""
from core.config import settings
from sqlalchemy import create_engine, inspect

def verify_tables():
    print("=" * 60)
    print("VERIFYING TABLES - TASK 6.5")
    print("=" * 60)
    
    engine = create_engine(settings.database_url)
    inspector = inspect(engine)
    
    tables = sorted(inspector.get_table_names())
    
    if not tables:
        print("[FAIL] No tables found in database!")
        return False
    
    print(f"\nFound {len(tables)} tables:")
    for table in tables:
        print(f"  [OK] {table}")
    
    # Verify expected tables (based on ERD v5)
    expected_tables = [
        'categorias', 'estados_pedido', 'formas_pago', 'ingredientes',
        'productos', 'roles', 'usuarios', 'direcciones_entrega',
        'productos_categorias', 'productos_ingredientes',
        'refresh_tokens', 'usuarios_roles', 'pedidos', 'detalles_pedido',
        'historial_estados_pedido', 'pagos', 'detalles_pedido_ingredientes_removidos'
    ]
    
    print("\nVerifying expected tables:")
    all_present = True
    for expected in expected_tables:
        if expected in tables:
            print(f"  [OK] {expected}")
        else:
            print(f"  [MISSING] {expected}")
            all_present = False
    
    print("\n" + "=" * 60)
    if all_present:
        print("TASK 6.5 COMPLETED SUCCESSFULLY")
        print("All expected tables are present in the database")
    else:
        print("TASK 6.5 FAILED - Some tables are missing")
    print("=" * 60)
    
    return all_present

if __name__ == "__main__":
    verify_tables()
