"""
Core Database Module
"""
from typing import Any, Generic, List, Optional, TypeVar

from sqlmodel import SQLModel, create_engine, Session, select, func

from core.config import settings

# Create engine (use connect_args for PostgreSQL)
engine = create_engine(
    settings.database_url,
    echo=settings.model_config.get("echo", False),
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)


def create_db_and_tables():
    """Create database and all tables."""
    import db.models  # noqa: F401 - Import to register models
    SQLModel.metadata.create_all(engine)


def get_session() -> Session:
    """Get a database session (for dependency injection)."""
    with Session(engine) as session:
        yield session


def get_engine():
    """Get the database engine."""
    return engine


# =============================================================================
# BaseRepository - Generic Repository Pattern
# =============================================================================
ModelType = TypeVar("ModelType", bound=SQLModel)


class BaseRepository(Generic[ModelType]):
    """
    Generic repository providing common database operations.
    
    Follows the AGENT.md architecture: UoW -> Repository -> Model
    """

    def __init__(self, model: type[ModelType], session: Session):
        self.model = model
        self.session = session

    # -------------------------------------------------------------------------
    # Read Operations
    # -------------------------------------------------------------------------
    def get(self, id: int) -> Optional[ModelType]:
        """Get entity by ID (excludes soft-deleted)."""
        return self.session.get(self.model, id)

    def get_by_id(self, id: int) -> Optional[ModelType]:
        """Get entity by ID including soft-deleted."""
        statement = select(self.model).where(self.model.id == id)
        return self.session.exec(statement).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Get all entities (excludes soft-deleted)."""
        statement = (
            select(self.model)
            .where(self.model.eliminado_en.is_(None))
            .offset(skip)
            .limit(limit)
        )
        return list(self.session.exec(statement))

    def count(self) -> int:
        """Count entities (excludes soft-deleted)."""
        statement = (
            select(func.count())
            .select_from(self.model)
            .where(self.model.eliminado_en.is_(None))
        )
        return self.session.exec(statement).one()

    def exists(self, id: int) -> bool:
        """Check if entity exists (excludes soft-deleted)."""
        statement = (
            select(self.model.id)
            .where(self.model.id == id)
            .where(self.model.eliminado_en.is_(None))
        )
        return self.session.exec(statement).first() is not None

    # -------------------------------------------------------------------------
    # Write Operations (Unit of Work pattern)
    # -------------------------------------------------------------------------
    def create(self, entity: ModelType) -> ModelType:
        """Create new entity."""
        self.session.add(entity)
        self.session.flush()
        return entity

    def update(self, entity: ModelType) -> ModelType:
        """Update existing entity."""
        self.session.add(entity)
        self.session.flush()
        return entity

    def delete(self, id: int, soft: bool = True) -> bool:
        """
        Delete entity by ID.
        
        Args:
            id: Entity ID
            soft: If True, soft delete (sets eliminado_en). If False, hard delete.
        """
        entity = self.session.get(self.model, id)
        if not entity:
            return False

        if soft:
            from datetime import datetime

            entity.eliminado_en = datetime.utcnow()
            self.session.add(entity)
            self.session.flush()
        else:
            self.session.delete(entity)
            self.session.flush()

        return True

    def refresh(self, entity: ModelType) -> ModelType:
        """Refresh entity from database."""
        self.session.refresh(entity)
        return entity

    # -------------------------------------------------------------------------
    # Query Helpers
    # -------------------------------------------------------------------------
    def find_by(
        self,
        skip: int = 0,
        limit: int = 100,
        **filters: Any,
    ) -> List[ModelType]:
        """Find entities by field filters."""
        statement = select(self.model).where(self.model.eliminado_en.is_(None))

        for field, value in filters.items():
            if hasattr(self.model, field):
                statement = statement.where(getattr(self.model, field) == value)

        statement = statement.offset(skip).limit(limit)
        return list(self.session.exec(statement))

    def find_one_by(self, **filters: Any) -> Optional[ModelType]:
        """Find single entity by field filters."""
        entities = self.find_by(limit=1, **filters)
        return entities[0] if entities else None