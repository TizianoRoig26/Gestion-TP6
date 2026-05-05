# Spec: backend-infra

## Descripción
Infraestructura base del backend de Food Store con arquitectura de capas feature-first.

## Arquitectura de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE PETICIONES                     │
└─────────────────────────────────────────────────────────────┘

  Router (HTTP)
     │
     ▼
  Service (lógica de negocio)
     │
     ▼
  Unit of Work (transacción)
     │
     ▼
  Repository (acceso a datos)
     │
     ▼
  Model (SQLModel → PostgreSQL)
```

## Componentes Principales

### Core
- `core/config.py`: Lectura de variables de entorno
- `core/database.py`: Engine SQLModel, session factory
- `core/security.py`: JWT, hashing bcrypt
- `core/uow.py`: Unit of Work (context manager)
- `core/exceptions.py`: Custom exceptions (RFC 7807)

### Módulos Feature-First
Cada módulo tiene:
- `model.py`: Entidad SQLModel
- `schemas.py`: Pydantic schemas (Create/Update/Read)
- `repository.py`: Repositorio específico
- `service.py`: Lógica de negocio
- `router.py`: Endpoints HTTP

### Módulos
| Módulo | Función |
|-------|--------|
| auth | Login, register, refresh, logout |
| usuarios | CRUD usuarios, asignación roles |
| direcciones | CRUD direcciones cliente |
| categorias | CRUD categorías jerárquicas |
| productos | CRUD productos |
| ingredientes | CRUD ingredientes |
| pedidos | CRUD pedidos + FSM |
| pagos | MercadoPago |
| admin | Dashboard |

## Unit of Work

```python
# Uso típico
async with UnitOfWork() as uow:
    await uow.pedidos.create(...)
    await uow.detalles.create(...)
# Commit automático al salir
# Rollback si excepción
```

## BaseRepository[T]

```python
class BaseRepository(Generic[T]):
    async def get_by_id(id) -> T | None
    async def list_all(skip, limit, filters) -> list[T]
    async def create(obj) -> T
    async def update(id, data) -> T
    async def soft_delete(id)
```

## Autenticación

```python
# get_current_user: extrae usuario del JWT
# require_role(roles): verifica rol
# refresh con rotación
```

## Reglas de Implementación

1. **Nunca** Service hace `session.commit()` — lo hace UoW
2. **Nunca** Router contiene lógica de negocio
3. **Siempre** usar tipos de Pydantic (no SQLModel directo)
4. **Siempre** soft delete (no hard delete)
5. **Siempre** timestamps (creado_en, actualizado_en)

## Definition of Done

- [ ] Struktur folder mengikuti pattern di atas
- [ ] Semua modul bisa di-import
- [ ] Unit of Work berfungsi dengan commit/rollback
- [ ] BaseRepository bisa di-extend