# AGENTS.md — Food Store System (SDD v5.0)

> **Fuente de Verdad Operativa** para Agentes de IA.
> 
> Define contexto, arquitectura, reglas de negocio y workflow de memoria.
> Leer **antes** de cada change. Sincronizar **después** con `engram sync`.

---

## Workflow de Sincronización (Obligatorio)

**ANTES de iniciar un change:**
```powershell
engram sync -import
```
- Importa memoria de sesiones previas
- Verifica contexto relevante en `/memories/`
- Consulta historial en `docs/changeslog.md`

**AL FINALIZAR un change:**
```powershell
engram sync
```
- Exporta aprendizajes y decisiones a memoria
- Actualiza `docs/changeslog.md` con descripción y estado
- Sincroniza progreso en `AGENTS.md` (tabla "Roadmap de Desarrollo")

## 1. Contexto del Sistema

Food Store es una plataforma **full-stack de e-commerce de alimentos**.

| Aspecto | Descripción |
|--------|-------------|
| **Metodología** | Spec-Driven Development (SDD) + Feature-First + Memory-Driven |
| **Backend** | FastAPI 0.111+, SQLModel 0.0.19+, PostgreSQL 14+, Alembic 1.13+ |
| **Frontend** | React 18+, TypeScript 5+, Vite, Tailwind CSS 4 |
| **Estado General** | ✅ Backend (78/78 tasks) — ✅ Frontend (100/100 tasks) |

---

## 2. Definición de la Arquitectura (Source of Truth)

### Backend (Capas Unidireccionales)

El flujo de dependencias es: **Router -> Service -> Unit of Work (UoW) -> Repository -> Model**.

| Capa | Responsabilidad | Ejemplo |
|------|-----------------|---------|
| **Router** | Validación de request (Pydantic), delegación a Service | `@app.post("/users")` valida entrada |
| **Service** | Lógica de negocio (stateless), orquesta vía UoW, lanza HTTPException | `UserService.create_user()` |
| **Unit of Work** | Transacción atómica, commit/rollback (único responsable) | `async with uow: uow.users.add(...)` |
| **Repository** | Queries DB heredando `BaseRepository[T]`, sin lógica business | `UserRepository.find_by_email()` |
| **Model** | Tablas SQLModel + soft delete fields | `class Usuario(SQLModel, table=True)` |

### Frontend (Feature-Sliced Design - FSD)

* **Capas**: App -> Pages -> Widgets -> Features -> Entities -> Shared.
* **Gestión de Estado**:
    * **Zustand**: Estado del cliente (Carrito, Auth, UI).
    * **TanStack Query**: Estado del servidor (Sincronización de datos).

### Estructura de Archivos

```
backend/
├── main.py                    # Entry point (uvicorn)
├── app.py                     # FastAPI app (CORS, routes)
├── requirements.txt           # Dependencias
├── .env.example               # Template variables
├── core/
│   ├── config.py              # Settings (Pydantic)
│   ├── database.py            # Engine + Session + UoW
│   ├── security.py            # JWT + bcrypt
│   ├── exceptions.py          # HTTP exceptions custom
│   ├── base_repository.py     # BaseRepository[T] genérico
│   └── uow.py                 # Unit of Work (context manager)
├── db/
│   ├── models.py              # Entidades SQLModel (ERD v5)
│   └── seed.py                # Seed data idempotente
├── alembic/                   # Migraciones Alembic
│   ├── env.py                 # Configuración de migraciones
│   └── versions/              # Scripts de migración
└── modules/
    ├── auth/                  # ✅ Login, register, refresh, logout
    │   ├── schemas.py
    │   ├── service.py
    │   ├── router.py
    │   └── repository.py
    ├── usuarios/              # ✅ CRUD usuarios
    ├── direcciones/           # ✅ Direcciones de clientes
    ├── categorias/            # ✅ Categorías jerárquicas
    ├── productos/             # ✅ CRUD productos + stock
    ├── ingredientes/          # ✅ CRUD ingredientes
    ├── pedidos/               # ✅ CRUD pedidos + FSM
    ├── pagos/                 # ✅ MercadoPago integration
    └── admin/                 # ✅ Panel de administración
```

---

## 3. Reglas de Negocio Críticas (Hard Constraints)

### Dominio de Pedidos (Máquina de Estados)

**Estados válidos:**
```
PENDIENTE → CONFIRMADO → EN_PREPARACION → EN_CAMINO → ENTREGADO
    ↓ (cualquier momento)
  CANCELADO
```

| Regla | Descripción |
|-------|-------------|
| **RN-01** | Prohibidos saltos de estado y retrocesos (transiciones lineales) |
| **RN-02** | PENDIENTE → CONFIRMADO es automático vía Webhook MercadoPago |
| **RN-03** | Transición a CONFIRMADO: decrementar stock de forma atómica |
| **RN-04** | Campo `motivo_cancelacion` es obligatorio si estado = CANCELADO |
| **RN-05** | Snapshot: copiar precio + dirección al crear pedido (inmutabilidad histórica) |

### Seguridad y Autenticación

| Aspecto | Requisito |
|--------|----------|
| **Tokens** | Access JWT (30 min) + Refresh Token (7 días) con rotación |
| **RBAC** | Roles: ADMIN, STOCK, PEDIDOS, CLIENT |
| **Brute Force** | Máx 5 intentos fallidos/IP en 15 min (implementar rate limiting) |
| **PCI DSS** | Datos de tarjeta NUNCA en servidor — tokenizar en frontend |

### Base de Datos

| Patrón | Detalles |
|--------|---------|
| **Soft Delete** | Todas las tablas: `creado_en`, `actualizado_en`, `eliminado_en` (NULL por defecto) |
| **Timestamps** | Todo registro: `creado_en` (no nullable) y `actualizado_en` (auto-update) |
| **Índices** | Indexar claves foráneas y campos de búsqueda frecuente |
| **Constraints** | Usar ON DELETE CASCADE solo cuando sea apropiado |

---

## 4. Estándares de Código

### Naming Conventions

| Contexto | Patrón | Ejemplo |
|----------|--------|---------|
| **Backend functions** | snake_case | `create_user()`, `get_order_by_id()` |
| **Backend classes** | PascalCase | `UserService`, `AuthRouter`, `OrderRepository` |
| **Backend constants** | UPPER_SNAKE_CASE | `MAX_LOGIN_ATTEMPTS`, `TOKEN_EXPIRY_MINUTES` |
| **Frontend functions** | camelCase | `getUserData()`, `handleSubmit()` |
| **Frontend components** | PascalCase | `UserCard`, `OrderList`, `AuthProvider` |
| **Frontend constants** | UPPER_SNAKE_CASE | `API_BASE_URL`, `PAGE_SIZE` |

### Conventional Commits

```
feat: add user registration endpoint
fix: resolve JWT token expiry validation
refactor: extract BaseRepository pattern
docs: update API authentication flow
test: add unit tests for OrderService
chore: update dependencies
```

### Dependencias del Proyecto

| Paquete | Versión | Propósito |
|--------|---------|----------|
| fastapi | 0.111+ | Framework |
| sqlmodel | 0.0.19+ | ORM |
| alembic | 1.13+ | Migraciones |
| slowapi | 0.1.9 | Rate limiting |
| python-jose | 3.3.0 | JWT |
| bcrypt | 4.1+ | Hashing |
| mercadopago | 2.2+ | Pagos |
| uvicorn | 0.27+ | Servidor |

---

## 5. Changelog

| Fecha | Agente | Cambio | Estado |
| :--- | :--- | :--- | :--- |
| 2026-04-27 | Claude | Configuración inicial del proyecto | ✅ |
| 2026-05-05 | Claude | **setup-infra-backend** — 61/61 tasks + archivado | ✅ |
| 2026-05-06 | Claude | CHANGELOG.md + docs/changeslog.md | ✅ |
| 2026-05-07 | Claude | Mejora AGENTS.md: claridad + reglas sincronización | ✅ |
| 2026-05-07 | Claude | **setup-frontend** — 57/57 tasks + archivado | ✅ |
| 2026-05-07 | Claude | **catalogo-crud** — 44 archivos, backend + frontend + archivado | ✅ |
| 2026-05-08 | Claude | **pedidos-feature** — 47 tasks, backend FSM + frontend completo + archivado | ✅ |

### Detalles: pedidos-feature (47 tareas)

| Sección | Tareas | Estado |
|---------|--------|--------|
| 1. Backend — PedidoRepository | 1.1–1.6 | ✅ |
| 2. Backend — PedidoService (FSM) | 2.1–2.7 | ✅ |
| 3. Backend — PedidoRouter + Integración | 3.1–3.4 | ✅ |
| 4. Frontend — API Hooks y Entities | 4.1–4.2 | ✅ |
| 5. Frontend — Carrito (CartPage) | 5.1–5.4 | ✅ |
| 6. Frontend — Checkout | 6.1–6.4 | ✅ |
| 7. Frontend — Confirmación | 7.1–7.2 | ✅ |
| 8. Frontend — Listado de Pedidos | 8.1–8.4 | ✅ |
| 9. Frontend — Detalle de Pedido | 9.1–9.4 | ✅ |
| 10. Frontend — Routing y Navegación | 10.1–10.3 | ✅ |
| 11. Verificación Final | 11.1–11.3 (4 restantes requieren DB) | ✅ |

---

## 6. Reglas Obligatorias (Non-Negotiable)

⚠️ **ANTES de escribir código:**

| Regla | Aplicación |
|-------|------------|
| **RG-01** | Siempre revisar `docs/Historias_de_usuario.md` antes de modificar services |
| **RG-02** | Todo cambio en models → generar migración Alembic inmediatamente |
| **RG-03** | Operaciones de escritura **DEBEN** usar patrón Unit of Work |
| **RG-04** | JWT: usar `python-jose` (NUNCA PyJWT directo) |
| **RG-05** | Configuración: usar `core/config.py` Settings (NUNCA hardcodear) |
| **RG-06** | Rate limiting obligatorio en `/login` endpoint con `slowapi` |

---

## Variables de Entorno Requeridas

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/foodstore
SECRET_KEY=your-secret-key-min-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:5173
MP_ACCESS_TOKEN=TEST-xxx
MP_PUBLIC_KEY=TEST-xxx
LOGIN_RATE_LIMIT_MAX=5
LOGIN_RATE_LIMIT_WINDOW_MINUTES=15
```

---

## Roadmap de Desarrollo

| # | Change | Estado | Dependencia | Descripción |
|---|--------|--------|-------------|-------------|
| 1 | setup-infra-backend | ✅ 100% | — | 61/61 tasks completadas (archivado) |
| 2 | setup-frontend | ✅ 100% | (1) | Vite, TypeScript, Zustand, TanStack Query (archivado) |
| 3 | catalogo-crud | ✅ 100% | (2) | CRUD productos/categorías en UI (archivado) |
| 4 | pedidos-feature | ✅ 100% | (3) | Carrito, checkout, FSM visual (archivado) |
| 5 | pagos-mercadopago | 🔲 0% | (4) | Integración MercadoPago webhooks |
| 6 | admin-panel | 🔲 0% | (4) | Dashboard admin, reportes, stock mgmt |

---

## Skills Disponibles (Agent Toolkit)

| Skill | Propósito | Trigger |
|-------|----------|---------|
| `fastapi-templates` | Backend patterns | Nuevo endpoint, Service setup |
| `postgresql-optimization` | PostgreSQL advanced | Complex queries, performance |
| `python-testing-patterns` | Pytest + mocking | Testing backend |
| `vercel-react-best-practices` | React optimization | Component performance |
| `webapp-testing` | Playwright E2E | Testing frontend |
| `sdd-apply` | Implementar changes | `openspec apply` |
| `sdd-propose` | Proponer changes | Nuevo feature |

## Cómo Usar Este Documento

1. **Antes de cada change**: lee AGENTS.md + ejecuta `engram sync -import`
2. **Durante implementación**: verifica reglas en Secciones 3 y 6
3. **Al finalizar**: ejecuta `engram sync` + actualiza Changelog
4. **Para duda arquitectónica**: consulta Sección 2 (Backend layers)

---

_Last updated: 2026-05-08_
_Version: AGENTS.md v2.0 - SDD v5.0 compliant_
_Sync status: Memory-driven workflow activated_