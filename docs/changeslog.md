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

## Cambios Pendientes

| # | Change | Depende de | Status |
|---|--------|-----------|--------|
| 1 | catalogo-crud | setup-frontend | 🔲 |
| 2 | pedidos-feature | catalogo-crud | 🔲 |
| 3 | pagos-mercadopago | pedidos-feature | 🔲 |
| 4 | admin-panel | setup-frontend + pedidos | 🔲 |

---

## Stats

| Métrica | Valor |
|---------|-------|
| Changes completados | 2 |
| Changes en progreso | 0 |
| Changes pendientes | 4 |
| Tareas completadas | 118 / 118 (100%) — backend 61 + frontend 57 |

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
us-002-categorias          🔲 catálogo jerárquico
us-003-productos           🔲 CRUD · stock · ingredientes
us-004-carrito             🔲 estado client-side con Zustand
us-005-pedidos             🔲 UoW · FSM · audit trail
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
- 🔲 MercadoPago sin configurar completamente (solo SDK instalado)
- 🔲 Próximo change recomendado: catalogo-crud

---

_Last updated: 2026-05-07_
