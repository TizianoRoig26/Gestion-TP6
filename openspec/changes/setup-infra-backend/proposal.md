## Why

El proyecto Food Store necesita una base sólida para comenzar el desarrollo. Sin una infraestructura configurada (FastAPI, PostgreSQL, estructura de módulos), no es posible implementar ninguna funcionalidad. El backend es la foundation sobre la que se construirán todas las features.

## What Changes

- **Scaffolding del proyecto backend** con estructura feature-first
- **Configuración de FastAPI** con CORS, rate limiting, routers
- **SQLModel + Alembic** para modelos y migraciones
- **Patrones base**: BaseRepository[T], UnitOfWork, get_current_user, require_role
- **9 módulos feature-first**: auth, usuarios, direcciones, categorias, productos, ingredientes, pedidos, pagos, admin
- **Seed data**: Roles, EstadosPedido, FormasPago, usuario admin

## Capabilities

### New Capabilities
- **backend-infra**: Infraestructura base del backend que habilita todas las demás capabilities
  - Define la arquitectura de capas (Router → Service → UoW → Repository → Model)
  - Establece los patrones de desarrollo (UoW, Repository genérico, autenticación)
- **auth**: Sistema de autenticación JWT y RBAC
  - Login, registro, refresh, logout
  - 4 roles: ADMIN, STOCK, PEDIDOS, CLIENT

### Modified Capabilities
- Ninguna (es el primer change, no hay capabilities previas)

## Impact

- **Backend**: Nueva estructura en `/backend`
- **Database**: Tablas definidas en SQLModel, migraciones con Alembic
- **API**: Endpoints base documentados en Swagger (`/docs`)

## Definition of Done

- [ ] `uvicorn main:app --reload` funcionando
- [ ] Swagger accesible en `/docs`
- [ ]迁移 con Alembic creando todas las tablas
- [ ] Seed data cargando Roles, Estados, FormasPago
- [ ] 9 módulos feature-first creados
- [ ] BaseRepository y UnitOfWork funcionando
- [ ] get_current_user y require_role implementados