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

## Cambios Pendientes

| # | Change | Depende de | Status |
|---|--------|-----------|--------|
| 1 | setup-frontend | setup-infra-backend | 🔲 |
| 2 | catalogo-crud | setup-infra-backend | 🔲 |
| 3 | pedidos-feature | catalogo-crud | 🔲 |
| 4 | pagos-mercadopago | pedidos-feature | 🔲 |
| 5 | admin-panel | setup-infra-backend + pedidos | 🔲 |

---

## Stats

| Métrica | Valor |
|---------|-------|
| Changes completados | 1 |
| Changes en progreso | 0 |
| Changes pendientes | 5 |
| Tareas completadas | 61 / 61 (100%) |

### Stack

- **Backend**: FastAPI + SQLModel + PostgreSQL + Alembic
- **Frontend**: React + TypeScript + Vite (pendiente)
- **Auth**: JWT (30min access + 7d refresh) + RBAC (4 roles)
- **Pagos**: MercadoPago SDK (pendiente configuración)

---

## Orden de Implementación

```
us-000-setup               ✅ infraestructura base (Sprint 0)
us-001-auth                ✅ JWT · RBAC · refresh tokens
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
- 🔲 Frontend aún no iniciado
- 🔲 MercadoPago sin configurar (solo SDK instalado)

---

_Last updated: 2026-05-06_
