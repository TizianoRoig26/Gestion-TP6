# Changelog

Todos los cambios notables en este proyecto se documentan en este archivo.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).
Este proyecto utiliza versionado semántico ([SemVer](https://semver.org/lang/es/)).

---

## [0.1.0] - 2026-05-05

### Added — Infraestructura base del backend (`setup-infra-backend`)

#### Configuración del proyecto
- Scaffolding del proyecto backend con arquitectura **feature-first**
- Entry point con **FastAPI** + configuración de CORS + registro de routers
- Configuración centralizada con Pydantic Settings (`core/config.py`)
- **Rate limiting** con slowapi (5 intentos/15 min en login)
- Documentación Swagger accesible en `/docs` y `/redoc`

#### Base de datos y modelos
- **SQLModel** como ORM con integración nativa Pydantic
- **Alembic** para gestión de migraciones
- Modelo de datos completo (ERD v5) con:
  - Soft delete (`eliminado_en`)
  - Timestamps (`creado_en`, `actualizado_en`)
  - Foreign keys y constraints
- **Seed data** idempotente:
  - 4 Roles: ADMIN, STOCK, PEDIDOS, CLIENT
  - 6 Estados de Pedido
  - Formas de Pago
  - Usuario admin por defecto

#### Patrones arquitectónicos
- Arquitectura en capas: **Router → Service → Unit of Work → Repository → Model**
- **Unit of Work** como context manager (commit/rollback automático)
- **BaseRepository[T]** genérico con operaciones CRUD y soft delete
- Excepciones HTTP custom centralizadas

#### Autenticación y seguridad
- **JWT** con python-jose (HS256)
- Hash de contraseñas con bcrypt
- **RBAC** con 4 roles configurables
- Endpoints de autenticación:
  - `POST /auth/register` — registro de usuarios
  - `POST /auth/login` — login con tokens (access + refresh)
  - `POST /auth/refresh` — rotación de refresh tokens
  - `POST /auth/logout` — invalidación de sesión
  - `GET /auth/me` — perfil del usuario autenticado
- Dependencias de protección:
  - `get_current_user` — valida token de acceso
  - `require_role` — factory para protección por rol (403 si no corresponde)

#### Módulos feature-first (9 módulos)
| Módulo | Funcionalidad |
|--------|--------------|
| `auth` | Login, registro, refresh, logout, JWT |
| `usuarios` | CRUD de usuarios |
| `direcciones` | Direcciones de clientes |
| `categorias` | Categorías jerárquicas (CTE recursivas) |
| `productos` | CRUD de productos con stock |
| `ingredientes` | CRUD de ingredientes |
| `pedidos` | CRUD de pedidos + FSM (máquina de estados) |
| `pagos` | Integración MercadoPago |
| `admin` | Panel de administración |

---

## Formato

### Added
- Nuevas funcionalidades.

### Changed
- Cambios en funcionalidades existentes.

### Deprecated
- Funcionalidades que se eliminarán en futuras versiones.

### Removed
- Funcionalidades eliminadas.

### Fixed
- Corrección de bugs.

### Security
- Cambios relacionados con seguridad.
