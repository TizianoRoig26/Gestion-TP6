"""
Script to clean all tables from the database (Development only!)
Run this to reset the database before running migrations fresh.
"""
from core.config import settings
from sqlalchemy import create_engine, inspect, text, MetaData

def clean_database():
    """Drop all tables from the database."""
    print(f"Connecting to: {settings.database_url}")
    engine = create_engine(settings.database_url)
    
    # Get all table names
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    print(f"Found tables: {tables}")
    
    if not tables:
        print("No tables to drop.")
        return
    
    # Drop all tables using MetaData reflection (handles foreign keys properly)
    metadata = MetaData()
    metadata.reflect(bind=engine)
    
    with engine.begin() as conn:
        # Disable foreign key checks for PostgreSQL
        conn.execute(text('SET session_replication_role = replica;'))
        
        # Drop all tables
        metadata.drop_all(bind=conn)
        
        # Re-enable foreign key checks
        conn.execute(text('SET session_replication_role = DEFAULT;'))
    
    print("All tables dropped successfully!")
    
    # Verify cleanup
    inspector = inspect(engine)
    remaining = inspector.get_table_names()
    if remaining:
        print(f"Warning: Some tables remain: {remaining}")
    else:
        print("Database is clean!")

if __name__ == "__main__":
    print("=" * 60)
    print("CLEANING DATABASE (DEVELOPMENT ONLY)")
    print("=" * 60)
    clean_database()
    print("=" * 60)
