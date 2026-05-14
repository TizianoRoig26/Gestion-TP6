# Changes Log — Food Store

> Tracking de cambios implementados mediante OPSX

## Metadata
- **Proyecto**: Food Store E-Commerce
- **Stack**: React + TypeScript + FastAPI + PostgreSQL
- **Metodología**: Spec-Driven Development (SDD)
- **Fecha inicio**: 2026-04-27

---

## Cambios Completados

### ✅ setup-infra-backend
**Fecha**: 2026-04-27 → 2026-05-05  
**Status**: ✅ Completado (61/61 tasks)  
**Archivado**: 2026-05-05

| Artefacto | Status |
|-----------|--------|
| proposal.md | ✅ |
| design.md | ✅ |
| specs/backend-infra.md | ✅ |
| specs/auth.md | ✅ |
| tasks.md | ✅ (61/61 completadas) |

**Descripción**: Infraestructura base del backend con:
- FastAPI + SQLModel + Alembic configurados y funcionando
- Arquitectura feature-first (9 módulos)
- Unit of Work + BaseRepository[T] implementados
- Autenticación JWT completa (login, register, refresh, logout)
- RBAC con 4 roles: ADMIN, STOCK, PEDIDOS, CLIENT
- Rate limiting con slowapi (5 intentos/15 min en login)
- Seed data cargado (Roles, EstadosPedido, FormasPago, usuario admin)
- Swagger accesible en `/docs` y `/redoc`

**Estructura completada**:

```
backend/
├── main.py                    ✅ Entry point
├── app.py                     ✅ FastAPI app + CORS + routers
├── requirements.txt           ✅ Dependencias
├── .env.example              ✅ Template
├── core/
│   ├── config.py             ✅ Settings (Pydantic)
│   ├── database.py            ✅ Engine + session + UoW
│   ├── security.py            ✅ JWT + bcrypt
│   ├── exceptions.py          ✅ HTTP exceptions custom
│   ├── base_repository.py     ✅ BaseRepository[T] genérico
│   └── uow.py                 ✅ Unit of Work (context manager)
├── db/
│   ├── models.py              ✅ Entidades SQLModel (ERD v5)
│   └── seed.py                ✅ Seed data idempotente
└── modules/
    ├── auth/                  ✅ Login, register, refresh, logout
    ├── usuarios/              ✅ CRUD usuarios
    ├── direcciones/           ✅ Direcciones de clientes
    ├── categorias/            ✅ Categorías jerárquicas
    ├── productos/             ✅ CRUD productos + stock
    ├── ingredientes/          ✅ CRUD ingredientes
    ├── pedidos/               ✅ CRUD pedidos + FSM
    ├── pagos/                 ✅ MercadoPago integration
    └── admin/                 ✅ Panel de administración
```

---

### ✅ setup-frontend
**Fecha**: 2026-05-07  
**Status**: ✅ Completado (57/57 tasks)  
**Archivado**: 2026-05-07

| Artefacto | Status |
|-----------|--------|
| proposal.md | ✅ |
| design.md | ✅ |
| specs/frontend-infra/spec.md | ✅ |
| specs/frontend-auth/spec.md | ✅ |
| specs/frontend-state/spec.md | ✅ |
| tasks.md | ✅ (57/57 completadas) |

**Descripción**: Infraestructura base del frontend con:
- Vite 8 + React 19 + TypeScript 6 con strict mode + SWC
- Tailwind CSS v4 con engine nativo
- Arquitectura Feature-Sliced Design (6 capas: app, pages, widgets, features, entities, shared)
- Axios centralizado con interceptors: token Bearer, refresh automático, cola de requests, error mapping
- 4 stores Zustand: authStore (persistente con partialize), cartStore (persistente), paymentStore (transitorio), uiStore (persistencia selectiva)
- TanStack Query con QueryClientProvider y defaults óptimos
- Routing con react-router-dom v7 (públicas, auth, protegidas)
- Route guards: ProtectedRoute, RoleGuard, PublicOnlyRoute
- Login y Register forms conectados al backend
- Toast system, ErrorBoundary global, UI primitives (Button, Input)

**Estructura creada (25 archivos fuente)**:

```
frontend/src/
├── app/          App.tsx, main.tsx, router.tsx, providers.tsx
├── pages/        HomePage, LoginPage, RegisterPage, NotFoundPage
├── widgets/      Header, Sidebar, Footer
├── features/     auth/LoginForm, auth/RegisterForm
├── entities/     user/types
└── shared/       api/, stores/, guards/, lib/, ui/
```

---

### ✅ catalogo-crud
**Fecha**: 2026-05-07  
**Status**: ✅ Completado (44 archivos, backend + frontend)  
**Archivado**: 2026-05-07

| Artefacto | Status |
|-----------|--------|
| proposal.md | ✅ |
| design.md | ✅ |
| specs/catalogo-api/spec.md | ✅ |
| specs/catalogo-ui/spec.md | ✅ |
| tasks.md | ✅ (completadas) |

**Descripción**: CRUD completo de catálogo con:
- **Backend**: Modules de categorías (jerarquía con CTE), productos (con stock e imágenes), ingredientes
- **Frontend**: CatalogPage con grid + filtros, ProductDetailPage con selector de cantidad, personalización de ingredientes
- **Routing**: Lazy loading con React.lazy + Suspense
- **TanStack Query**: Hooks para datos de servidor con invalidación automática

---

### ✅ pedidos-feature
**Fecha**: 2026-05-08  
**Status**: ✅ Completado (47 tasks, 43/47 verificadas, 4 requieren DB)  
**Archivado**: 2026-05-08

| Artefacto | Status |
|-----------|--------|
| proposal.md | ✅ |
| design.md | ✅ |
| specs/pedidos/spec.md | ✅ |
| specs/pedidos-api/spec.md | ✅ |
| specs/pedidos-ui/spec.md | ✅ |
| tasks.md | ✅ (43/47 completadas, 4 verificación con DB) |

**Descripción**: Feature completo de pedidos con:
- **Backend (17 tasks)**:
  - PedidoRepository con CRUD, stock con SELECT FOR UPDATE, historial append-only
  - PedidoService con FSM engine de 6 estados, transiciones validadas por rol, side-effects atómicos
  - PedidoRouter con 4 endpoints cliente (POST/GET pedidos, detalle, historial) + 4 endpoints admin (gestión + FSM)
  - Endpoint `POST /pedidos/{id}/cancelar` para cancelación por cliente
- **Frontend (30 tasks)**:
  - CartPage con persistencia Zustand, modificación de cantidades, resumen de totales
  - CheckoutPage con formulario de dirección, selección de forma de pago, manejo de errores de stock
  - OrderConfirmationPage con resumen + botones de acción
  - OrdersPage con listado paginado + filtro por estado
  - OrderDetailPage con timeline visual FSM + modal de cancelación con motivo obligatorio
  - Routing lazy-loaded + Header con badge de carrito y menú de usuario autenticado
- **Fixes aplicados durante verificación**:
  - SELECT FOR UPDATE en decrementar/restaurar stock (race condition crítica)
  - Endpoint cliente de cancelación (antes llamaba al admin y daba 403)
  - direccion_snapshot del request body ahora se usa correctamente

### ✅ admin-panel
**Fecha**: 2026-05-11  
**Status**: ✅ Completado (32/32 tasks)  
**Archivado**: 2026-05-11

| Artefacto | Status |
|-----------|--------|
| proposal.md | ✅ |
| design.md | ✅ |
| specs/admin-api/spec.md | ✅ |
| specs/admin-ui/spec.md | ✅ |
| tasks.md | ✅ (32/32 completadas) |

**Descripción**: Panel de administración completo con:
- **Backend**: Módulo admin con endpoints de usuarios (listar, editar, cambiar rol, activar/desactivar) y métricas/dashboard (resumen, ventas por período, top productos, pedidos por estado)
- **Frontend**: Layout Admin con sidebar por roles, guard `AdminRoute`, Dashboard con 4 KPIs + 3 gráficos recharts (LineChart, BarChart, PieChart), AdminUsuariosPage con tabla paginada + buscador + modal edición + modal desactivar, AdminPedidosPage con tabla expandible + selector FSM + timeline de historial, AdminStockPage con inline edit + toggle disponibilidad + alerta stock bajo
- **Bug fix**: AuthService.login() ahora verifica `credo_activo` — usuario desactivado no puede obtener tokens

---

### ✅ pagos-mercadopago
**Fecha**: 2026-05-11 → 2026-05-12  
**Status**: ✅ Completado (21/21 tasks)  
**Archivado**: 2026-05-12

| Artefacto | Status |
|-----------|--------|
| proposal.md | ✅ |
| design.md | ✅ |
| specs/pagos-api/spec.md | ✅ (nueva capability) |
| specs/pagos-ui/spec.md | ✅ (nueva capability) |
| specs/pedidos-api/spec.md | ✅ (delta sincronizado) |
| specs/pedidos-ui/spec.md | ✅ (delta sincronizado) |
| tasks.md | ✅ (21/21 completadas) |

**Descripción**: Integración de pagos con MercadoPago Checkout API:
- **Backend (tasks 1-3)**: Módulo `pagos/` con creación de pagos (card_token), webhook IPN con verificación contra API de MP, consulta de estado, idempotency_key UNIQUE para evitar duplicados
- **Frontend (tasks 4-5)**: CardPayment brick de @mercadopago/sdk-react en checkout con tokenización en browser, polling de estado con TanStack Query en confirmación, badge de estado de pago en detalle del pedido
- **Pedidos (task 3.3)**: Transición PENDIENTE→CONFIRMADO ahora solo vía webhook (eliminada transición manual ADMIN)
- **Verificación (tasks 6.1-6.4)**: Webhook transiciona pedido ✅, idempotency evita duplicados ✅, 3 estados frontend ✅, polling se detiene en terminal ✅

---

### ✅ refactor-frontend-design-tokens
**Fecha**: 2026-05-14  
**Status**: ✅ Completado (46 archivos frontend modificados)  
**Archivado**: 2026-05-14

| Artefacto | Status |
|-----------|--------|
| proposal.md | ✅ |
| design.md | ✅ |
| specs/frontend-design-system/spec.md | ✅ (nueva capability) |
| tasks.md | ✅ (completadas) |

**Descripción**: Migración visual completa del frontend al nuevo sistema de diseño:
- **Paleta de marca**: Harvest Ochre (primary), Garden Green (secondary), Saffron Gold (accent), Seared Crimson (danger)
- **Superficies**: Off-white cálido (#FDFBF9) con variantes surface-secondary/tertiary
- **Tipografía**: Inter con escala headline-lg, headline-md, body-lg, body-md, label-sm
- **Elevación flat-plus**: Sin sombras agresivas, solo `shadow-ambient` con destello cálido en hover
- **Sidebar**: Harvest Ochre profundo (primary-800) en lugar de gray-900 genérico
- **Tokens**: Definidos en `frontend/src/style.css` con `@theme` de Tailwind v4
- **Fuente de verdad**: `docs/Design.md` con filosofía, paleta, componentes y brief de marca
- **46 archivos migrados**: shared/ui, widgets, features (catalog, orders, auth, cart), pages (client + admin), guards, router

---

## Cambios Pendientes

_No hay cambios pendientes._

---

## Stats

| Métrica | Valor |
|---------|-------|
| Changes completados | 7 |
| Changes en progreso | 0 |
| Changes pendientes | 0 |
| Tareas completadas | 231 / 231 (100%) — backend 61 + frontend 57 + catalogo 44 + pedidos 47 + admin 32 + pagos 21* |
| Commits totales | 4 en main (2 feature + 1 fix + 1 archive) |

\* Algunas tasks de verificación requieren DB con datos — sin cambios de código pendientes.

### Stack

- **Backend**: FastAPI + SQLModel + PostgreSQL + Alembic ✅
- **Frontend**: React 19 + TypeScript 6 + Vite 8 + Zustand 5 + TanStack Query 5 + Tailwind 4 ✅
- **Auth**: JWT (30min access + 7d refresh) + RBAC (4 roles)
- **Pagos**: MercadoPago SDK ✅ integrado (crear pago, webhook IPN, polling frontend)

---

## Orden de Implementación

```
us-000-setup               ✅ infraestructura base (Sprint 0)
us-001-auth                ✅ JWT · RBAC · refresh tokens
us-000c                    ✅ frontend base (Vite + React + FSD)
us-000e                    ✅ Zustand stores (auth, cart, payment, ui)
us-002-categorias          ✅ catálogo jerárquico
us-003-productos           ✅ CRUD · stock · ingredientes
us-004-carrito             ✅ estado client-side con Zustand
us-005-pedidos             ✅ UoW · FSM · audit trail
us-006-pagos-mercadopago   ✅ checkout · webhooks IPN
us-007-admin               ✅ panel · métricas
us-008-direcciones         🔲 direcciones de entrega
```

---

## Commands

```bash
# Ver cambios activos
openspec list --json

# Ver estado de un change específico
openspec status --change <nombre> --json

# Implementar tareas
/opsx:apply <nombre-change>

# Archivar cuando esté completo
/opsx:archive <nombre-change>
```

---

## Notas de Sesión

- ✅ Backend corriendo con `uvicorn main:app --reload`
- ✅ PostgreSQL local configurado
- ✅ Alembic migraciones aplicadas (`alembic upgrade head`)
- ✅ Seed data cargado correctamente
- ✅ Rate limiting activo en login
- ✅ Todos los endpoints protegidos con JWT + RBAC
- ✅ Frontend configurado: Vite + React 19 + TS 6 + Tailwind 4 + Zustand 5 + TanStack Query 5
- ✅ Estructura FSD con 6 capas y 25 archivos fuente
- ✅ Login/Register forms conectados a la API
- ✅ Route guards implementados (auth + roles)
- ✅ Axios con refresh automático y cola de requests
- ✅ Stores Zustand con persistencia
- ✅ Catálogo completo (categorías, productos, ingredientes) con UI
- ✅ Flujo de pedidos completo: carrito → checkout → confirmación → mis pedidos → detalle
- ✅ FSM de 6 estados con validación por rol y timeline visual
- ✅ SELECT FOR UPDATE en todas las operaciones de stock
- ✅ MercadoPago integrado: backend (crear pago, webhook IPN, consulta) + frontend (CardPayment brick, polling, badge de estado)
- 🔲 Próximo change recomendado: direcciones de entrega o submodules git

---

_Last updated: 2026-05-14_
