## Context

El proyecto Food Store necesita infraestructura backend antes de implementar cualquier feature. Actualmente el directorio `backend/` está vacío (solo `.gitkeep` y `.env.example`). 

**Requisitos del proyecto:**
- Stack: FastAPI + SQLModel + PostgreSQL + Alembic
- Arquitectura: Feature-first con Unit of Work
- PostgreSQL local ya disponible

**Restricciones:**
- Solo desarrollo local (no deploy aún)
- Cumplir con specs de `docs/Integrador.md`

## Goals / Non-Goals

**Goals:**
- ✅ Backend configurado con FastAPI funcionando
- ✅ Estructura feature-first con 9 módulos
- ✅ SQLModel + Alembic con todas las tablas del ERD v5
- ✅ Unit of Work y BaseRepository implementados
- ✅ Autenticación JWT básica (login + register)
- ✅ Seed data cargando Roles, EstadosPedido, FormasPago

**Non-Goals:**
- ❌ Frontend (separado en otro change)
- ❌ MercadoPago real (solo mock/sandbox config)
- ❌ Deploy a producción
- ❌ Testing覆盖率 > 60% (przóximo change)

## Decisions

### D1: Estructura de Capas
**Decisión:** Arquitectura Router → Service → Unit of Work → Repository → Model

**Alternativas evaluadas:**
- ❌ Controller único (monolítico) — no escala
- ✅ Capas separadas — testable, mantenible

**Justificación:** La spec de Integrador sección 2.1 especifica este patrón.

### D2: ORM
**Decisión:** SQLModel (no SQLAlchemy puro)

**Alternativas evaluadas:**
- ❌ SQLAlchemy 2.0 — más verboso, duplicación con Pydantic
- ✅ SQLModel — integración nativa con Pydantic

**Justificación:** Spec técnica lo especifica. Creador es autor de FastAPI.

### D3: Autenticación JWT
**Decisión:** python-jose con HS256

**Alternativas evaluadas:**
- ❌ PyJWT — menos features
- ✅ python-jose — más maduro para FastAPI

**Justificación:** Biblioteca estándar, integración con FastAPI/security.

### D4: Rate Limiting
**Decisión:** slowapi (adaptador de Flask-Limiter para FastAPI)

**Alternativas evaluadas:**
- ❌ Redis — overkill para desarrollo local
- ✅ slowapi in-memory — suficiente

**Justificación:** RN-AU06 requiere 5 intentos/15min. slowapi cumple.

### D5: Estructura de Módulos
**Decisión:** Feature-first con 9 módulos

```
backend/
├── core/                    # Configuración compartida
│   ├── config.py
│   ├── database.py
│   ├── security.py
│   ├── uow.py
│   └── exceptions.py
├── modules/
│   ├── auth/                # Login, register, refresh, logout
│   ├── usuarios/            # CRUD usuarios
│   ├── direcciones/        # Direcciones cliente
│   ├── categorias/         # Categorías jerárquicas
│   ├── productos/          # CRUD productos
│   ├── ingredientes/       # CRUD ingredientes
│   ├── pedidos/           # CRUD pedidos + FSM
│   ├── pagos/              # MercadoPago
│   └── admin/              # Dashboard
├── app.py                   # FastAPI app
└── main.py                  # Entry point
```

**Justificación:** Spec Integrador sección 2.2 especifica feature-first.

### D6: Base de Datos
**Decisión:** PostgreSQL local en la URL que provea el usuario

**Alternativas evaluadas:**
- ❌ SQLite — no soporta CTE recursivas para categorías
- ✅ PostgreSQL — cumple todos los requisitos

**Justificación:** ERD v5 requiere CTE recursivas. PostgreSQL es requerido.

## Risks / Trade-offs

| Risk | Probabilidad | Impacto | Mitigación |
|------|--------------|---------|-----------|
| PostgreSQL no inicia | Baja | Alta | Docker compose provided |
| Migraciones fallan | Media | Media | Script seed idempotente |
| Cyclic import modules | Media | Baja | careful con imports |
| Rate limit memory-full | Baja | Baja | Redis (futuro) |

## Migration Plan

```bash
# 1. Instalar dependencias
pip install -r requirements.txt

# 2. Configurar .env
cp .env.example .env
# Editar DATABASE_URL

# 3. Correr migraciones
alembic upgrade head

# 4. Cargar seed
python -m db.seed

# 5. Iniciar servidor
uvicorn main:app --reload
```

**Rollback:** `alembic downgrade -1` para cada migración.

## Open Questions

1. **Q:** ¿Usar async (SQLModel async) o sync?
   - **A:** Sync por ahora (más simple, mejor documentación)
   - Revisar cambia a async en futuro si performance lo requiere

2. **Q:** ¿Dónde guardar Secrets?
   - **A:** `.env` (NO commiteado a git)
   - `.env.example` commiteado con valores dummy

3. **Q:** ¿Testing framework?
   - **A:** pytest (skills installs incluyen python-testing-patterns)
   - Coverage > 60% objetivo del change de testing