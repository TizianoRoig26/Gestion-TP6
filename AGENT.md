# AGENTS.MD - FOOD STORE SYSTEM

> Este archivo es la **Fuente de Verdad Operativa** para Agentes de IA.
> Define el contexto, la arquitectura y las reglas de negocio basadas en la Especificación Técnica v5.0 (SDD).

---
## Reglas de sincronizacion
Antes de Realizar un change:
engram sync -import
y verificar si no hay ninguna memoria relevante
Cuando termine un change realizar un:
engram sync
para poder compartir la memoria usada para dicho change 
tambien actualiza docs/changeslog.md con el change actual y actualiza el progreso recorrido al igual que en AGENT.md

## 1. Contexto del Sistema

Food Store es una plataforma **full-stack para comercio electrónico de alimentos**.

| Campo | Valor |
|-------|-------|
| **Metodología** | Spec-Driven Development (SDD) y Feature-First |
| **Backend** | FastAPI, SQLModel, PostgreSQL, Alembic |
| **Frontend** | React, TypeScript, Vite, Tailwind CSS |
| **Estado** | Backend setup-infra-backend ✅ completado (61/61 tasks) — Frontend pendiente |

---

## 2. Definición de la Arquitectura (Source of Truth)

### Backend (Capas Unidireccionales)

El flujo de dependencias es: **Router -> Service -> Unit of Work (UoW) -> Repository -> Model**.

| Capa | Responsabilidad |
|------|----------------|
| **Router** | Validación de Schemas Pydantic y delegación. No contiene lógica. |
| **Service** | Lógica de negocio stateless. Orquesta via UoW. Lanza HTTPException. |
| **Unit of Work (UoW)** | Gestiona la transacción atómica. Es el único que hace commit/rollback. |
| **Repository** | Consultas a base de datos heredando de BaseRepository[T]. |
| **Model** | Definición de tablas SQLModel. |

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

### Dominio de Pedidos y FSM (Máquina de Estados)

* **Estados**: PENDIENTE, CONFIRMADO, EN_PREPARACION, EN_CAMINO, ENTREGADO, CANCELADO.
* **RN-01**: No se permiten saltos de estado ni retrocesos.
* **RN-02**: La transición PENDIENTE a CONFIRMADO es automática vía Webhook de MercadoPago.
* **RN-03**: Al pasar a CONFIRMADO, se decrementa stock de forma atómica.
* **RN-05**: El motivo es obligatorio si el estado es CANCELADO.
* **Snapshot Pattern**: Se debe copiar el precio y dirección al crear el pedido para garantizar inmutabilidad histórica.

### Seguridad y Auth

* **Doble Token**: Access JWT (30 min) y Refresh Token (7 días) con rotación obligatoria.
* **RBAC**: Roles ADMIN, STOCK, PEDIDOS, CLIENT.
* **Rate Limiting**: Máximo 5 intentos fallidos de login por IP en 15 minutos.
* **PCI DSS**: Los datos de tarjetas nunca tocan el servidor (tokenización en frontend).

### Base de Datos

* **Soft Delete**: Todas las tablas deben incluir `creado_en`, `actualizado_en` y `eliminado_en` (nullable).
* **Timestamps**: Todos los registros tienen `creado_en` y `actualizado_en`.

---

## 4. Estándares de Código para el Agente

| Lenguaje | Convención |
|----------|------------|
| **Backend (Python)** | snake_case: `my_function`, `user_id`. Clases: PascalCase: `UserService`, `AuthRouter` |
| **Frontend (TypeScript)** | camelCase: `userName`, `getUser`. Componentes: PascalCase: `UserCard` |

### Commits (Convencional)

```
feat: add user registration
fix: resolve login issue
docs: update API documentation
chore: setup alembic
refactor: extract BaseRepository
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

## 5. Changelog (Registro de Cambios)

| Fecha | Agente | Cambio Realizado | Estado |
| :--- | :--- | :--- | :--- |
| 2026-04-27 | Claude | Configuración inicial del proyecto Food Store | Completado |
| 2026-05-05 | Claude | **setup-infra-backend** — 61/61 tasks completadas, archivado | ✅ Completado |
| 2026-05-06 | Claude | CHANGELOG.md creado (root) + docs/changeslog.md actualizado | Completado |

### Detalle de setup-infra-backend (61 tareas)

| Sección | Tareas | Estado |
|---------|--------|--------|
| 1. Configuración Inicial | 1.1–1.4 | ✅ |
| 2. Módulo Core | 2.1–2.5 | ✅ |
| 3. Unit of Work y Repository | 3.1–3.4 | ✅ |
| 4. Modelos SQLModel (ERD v5) | 4.1–4.4 | ✅ |
| 5. Schemas Pydantic | 5.1–5.4 | ✅ |
| 6. Alembic y Migraciones | 6.1–6.5 | ✅ |
| 7. Seed Data | 7.1–7.6 | ✅ |
| 8. Auth — Registro y Login | 8.1–8.7 | ✅ |
| 9. Auth — Refresh y Logout | 9.1–9.4 | ✅ |
| 10. Protección de Rutas | 10.1–10.5 | ✅ |
| 11. Rate Limiting | 11.1–11.3 | ✅ |
| 12. Swagger y Documentación | 12.1–12.3 | ✅ |
| 13. Verificación Final | 13.1–13.7 | ✅ |

---

## 6. Instrucciones de Memoria Próxima

> ⚠️ **REGLAS OBLIGATORIAS** — No omitir nunca:

* [ ] Siempre verificar `docs/Historias_de_usuario.md` antes de proponer cambios en los services.
* [ ] Al modificar un modelo, generar la migración de Alembic correspondiente.
* [ ] **No omitir nunca el patrón Unit of Work** en operaciones de escritura.
* [ ] Verificar JWT tokens con `python-jose` (no PyJWT directo).
* [ ] No hardcodear valores — usar `core/config.py` Settings.
* [ ] rate limiting en `/login` endpoint con slowapi.

---

## Commands

### OPSX

```bash
# Ver cambios activos
openspec list --json

# Ver estado de un change específico
openspec status --change <nombre> --json

# Implementar tareas
/opsx:apply <nombre-change>

# Archivar change completado
/opsx:archive <nombre-change>
```

### Backend Desarrollo

```bash
# Instalar dependencias
pip install -r requirements.txt

# Copiar configuración
cp .env.example .env
# Editar .env con DATABASE_URL y SECRET_KEY

# Generar migraciones
alembic revision --autogenerate -m "init"

# Aplicar migraciones
alembic upgrade head

# Ejecutar seed
python -m db.seed

# Servidor desarrollo
uvicorn main:app --reload --port 8000
```

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

## Activos en Desarrollo

| Change | Progreso | Pending |
|--------|----------|---------|
| setup-infra-backend | ✅ 100% (archivado) | — |
| setup-frontend | 🔲 0% | Infraestructura completa |
| catalogo-crud | 🔲 0% | Depende de setup-frontend |
| pedidos-feature | 🔲 0% | Depende de catalogo-crud |
| pagos-mercadopago | 🔲 0% | Depende de pedidos-feature |
| admin-panel | 🔲 0% | Depende de setup+pedidos |

---

## Skills Disponibles

### Core OPSX

| Skill | Descripción |
|-------|-------------|
| `openspec-explore` | Modo exploración - thinking partner |
| `openspec-propose` | Crear changes con proposal/design/tasks |
| `openspec-apply-change` | Implementar tareas de un change |
| `openspec-archive-change` | Archivar change completado |

### Ecosystem (Instaladas)

| Skill | Installs | Uso |
|-------|----------|-----|
| `fastapi-templates` | 15.2K | Backend FastAPI patterns |
| `postgresql-optimization` | 10.9K | PostgreSQL queries |
| `python-testing-patterns` | 17.5K | Pytest patterns |
| `vercel-react-best-practices` | 353.8K | React patterns |
| `webapp-testing` | 56.6K | Playwright E2E |
| `multi-stage-dockerfile` | 11.8K | Docker configs |

---

_Last updated: 2026-05-06_
_Created: AGENTS.md v1.0 - SDD v5.0 compliant_