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

## [0.2.0] - 2026-05-07

### Added — Frontend base (`setup-frontend`)

#### Infraestructura frontend
- **Vite 8** + **React 19** + **TypeScript 6** con strict mode + SWC
- **Tailwind CSS v4** con engine nativo
- Arquitectura **Feature-Sliced Design** (6 capas)

#### Estado cliente con Zustand 5
- `authStore`: persistencia con partialize (access token, refresh token, user)
- `cartStore`: persistencia en localStorage con items, cantidades, personalización
- `paymentStore`: estado transitorio de checkout
- `uiStore`: preferencias de UI con persistencia selectiva

#### Estado servidor con TanStack Query 5
- QueryClientProvider con defaults optimizados (staleTime, retry, refetchOnWindowFocus)
- Hooks para datos de servidor con invalidación automática

#### Red y autenticación
- **Axios** centralizado con interceptores:
  - Bearer token automático desde authStore
  - Refresh automático con cola de requests (evita refreshes duplicados)
  - Logout automático en 401 después de refresh fallido
  - Error mapping con mensajes en español
- Route guards: `ProtectedRoute` (redirect a /login), `PublicOnlyRoute` (redirect a /), `RoleGuard` (por rol)

#### UI base
- Toast system para notificaciones
- ErrorBoundary global con fallback
- UI primitives (Button, Input, LoadingSpinner)
- Layout: Header + Sidebar + Footer con outlet

---

## [0.3.0] - 2026-05-07

### Added — Catálogo CRUD completo (`catalogo-crud`)

#### Backend
- **Categorías**: CRUD con jerarquía padre-hijo, validación anti-ciclos
- **Productos**: CRUD con stock, imágenes múltiples, relación con categorías e ingredientes
- **Ingredientes**: CRUD con precio adicional, categoría de ingrediente

#### Frontend
- **CatalogPage**: Grid de productos con filtro por categoría, loading/empty/error states
- **ProductDetailPage**: Imagen, descripción, selector de cantidad, personalización (excluir ingredientes), botón "Agregar al carrito"
- **Lazy loading** con React.lazy + Suspense + PageSkeleton
- Integración con cartStore (Zustand + persist)

---

## [0.4.0] - 2026-05-08

### Added — Feature completo de pedidos (`pedidos-feature`)

#### Backend — Módulo pedidos (17 tareas)
- **PedidoRepository**: CRUD con paginación, filtros, stock con SELECT FOR UPDATE, historial append-only
- **PedidoService**: FSM engine con 6 estados, transiciones validadas por rol, side-effects atómicos (decrementar/restaurar stock)
- **Endpoints cliente** (`/api/v1/pedidos/`):
  - `POST /` — Crear pedido atómico con snapshots de precio y dirección
  - `GET /` — Listar mis pedidos (paginado, filtro por estado)
  - `GET /{id}` — Detalle de pedido propio
  - `POST /{id}/cancelar` — Cancelar pedido (cliente, desde PENDIENTE)
  - `GET /{id}/historial` — Historial de estados
- **Endpoints admin** (`/api/v1/admin/pedidos/`):
  - `GET /` — Listar todos los pedidos (filtros: estado, fechas, búsqueda)
  - `GET /{id}` — Detalle de cualquier pedido
  - `PATCH /{id}/estado` — Cambiar estado (FSM con roles)
  - `GET /{id}/historial` — Historial de cualquier pedido

#### Frontend — Flujo de pedidos (30 tareas)
- **CartPage**: Carrito persistente con modificación de cantidades, eliminación, resumen de totales, estado vacío
- **CheckoutPage**: Formulario de dirección, selección de forma de pago, confirmación, manejo de errores de stock
- **OrderConfirmationPage**: Pantalla de éxito con resumen, botones "Ver detalle" e "Ir al catálogo"
- **OrdersPage**: Listado paginado con filtro por estado, OrderCard con badge de color, empty state
- **OrderDetailPage**: Detalle completo con items, totales, dirección snapshot, timeline visual FSM, modal de cancelación con motivo obligatorio
- **OrderTimeline**: Timeline visual con nodos numbered/checkmark/X, timestamp, actor
- **OrderStatusBadge**: Badge con colores semánticos por estado
- **Routing**: Lazy loading con React.lazy + Suspense para todas las páginas nuevas, rutas protegidas
- **Header**: Badge de carrito con cantidad, link "Mis Pedidos" (solo autenticado), menú de usuario con nombre y cerrar sesión

### Fixed
- **SELECT FOR UPDATE** en decrementar/restaurar stock — prevenía lost updates bajo concurrencia crítica
- **Endpoint cliente de cancelación** — `POST /pedidos/{id}/cancelar` para que clientes puedan cancelar desde PENDIENTE sin requerir roles admin
- **direccion_snapshot** — ahora se usa correctamente desde el request body (antes solo se generaba desde DB)

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
