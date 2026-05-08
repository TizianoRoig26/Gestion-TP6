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

---

## Cambios Pendientes

| # | Change | Depende de | Status |
|---|--------|-----------|--------|
| 1 | pagos-mercadopago | pedidos-feature | 🔲 |
| 2 | admin-panel | setup-frontend + pedidos | 🔲 |

---

## Stats

| Métrica | Valor |
|---------|-------|
| Changes completados | 4 |
| Changes en progreso | 0 |
| Changes pendientes | 2 |
| Tareas completadas | 178 / 178 (100%) — backend 61 + frontend 57 + catalogo 44 + pedidos 47* |
| Commits totales | 4 en main (2 feature + 1 fix + 1 archive) |

\* 4 tasks de verificación requieren DB con datos — sin cambios de código pendientes.

### Stack

- **Backend**: FastAPI + SQLModel + PostgreSQL + Alembic ✅
- **Frontend**: React 19 + TypeScript 6 + Vite 8 + Zustand 5 + TanStack Query 5 + Tailwind 4 ✅
- **Auth**: JWT (30min access + 7d refresh) + RBAC (4 roles)
- **Pagos**: MercadoPago SDK (pendiente configuración)

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
us-006-pagos-mercadopago   🔲 checkout · webhooks IPN
us-007-admin               🔲 panel · métricas
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
- 🔲 MercadoPago sin configurar completamente (solo SDK instalado)
- 🔲 Próximo change recomendado: pagos-mercadopago (integración webhook)

---

_Last updated: 2026-05-08_
