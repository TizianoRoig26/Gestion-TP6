## Why

El catálogo de productos es el núcleo del e-commerce. Sin una interfaz que permita navegar productos, explorar categorías y ver detalles, la aplicación no cumple su función principal. Este cambio implementa tanto la API backend como la UI frontend del catálogo, completando el eslabón faltante entre la infraestructura ya montada y una experiencia de usuario real.

## What Changes

### Backend (nuevos módulos)
- **Módulo `categorias`**: CRUD completo con jerarquía padre-hijo (FK autoreferencial), validación anti-ciclos, soft delete con protección de productos activos
- **Módulo `ingredientes`**: CRUD completo con flag `es_alergeno`, soft delete
- **Módulo `productos`**: CRUD completo con precio NUMERIC, stock >= 0, disponible, asociación a múltiples categorías e ingredientes
- Endpoints públicos (solo lectura) para clientes: listar productos disponibles, ver detalle, filtrar por categoría/alérgenos
- Endpoints protegidos (ADMIN/STOCK) para gestión: crear, editar, eliminar, gestionar stock
- Registro de rutas en `app.py`

### Frontend (nuevas páginas y componentes)
- **Página de listado de productos**: grilla responsiva con cards, paginación, búsqueda por nombre, filtros por categoría y alérgenos
- **Página de detalle de producto**: imagen, descripción, precio, ingredientes con etiqueta de alérgenos, selector de cantidad, botón "Agregar al carrito"
- **Navegación por categorías**: árbol jerárquico en sidebar, breadcrumbs, filtro por categoría activa
- **Estados de carga y vacío**: skeletons, empty states, error handling con TanStack Query
- Conexión con `cartStore` de Zustand para agregar al carrito desde detalle

### General
- Seed data actualizado con categorías, ingredientes y productos de ejemplo
- Migraciones Alembic (ya existen desde setup-infra-backend, verificar consistencia)

## Capabilities

### New Capabilities
- `catalogo-api`: API REST de catálogo — CRUD de productos, categorías e ingredientes con jerarquía, filtros y control de stock
- `catalogo-ui`: Interfaz de usuario del catálogo — listado con búsqueda/filtros, detalle de producto, navegación jerárquica por categorías

### Modified Capabilities
- *(ninguna — `catalogo` spec existe como documento pero no como capability implementada)*

## Impact

### Backend
- **Nuevos archivos**: `modules/categorias/{schemas,service,repository,router}.py`, `modules/ingredientes/{schemas,service,repository,router}.py`, `modules/productos/{schemas,service,repository,router}.py`
- **Modificaciones**: `app.py` (registrar nuevos routers), `db/seed.py` (datos de ejemplo), `db/models.py` (ya existe, verificar)
- **Dependencias**: `core/base_repository.py`, `core/uow.py`, `core/dependencies.py` (ya existentes)
- **Roles requeridos**: ADMIN y STOCK para gestión, CLIENT y público para consulta

### Frontend
- **Nuevos archivos**: ~15 archivos entre pages, features, widgets, entities
- **Modificaciones**: `app/router.tsx` (nuevas rutas), `widgets/Header.tsx` (link a catálogo)
- **Dependencias**: TanStack Query (ya configurado), Zustand cartStore (ya configurado), Axios api instance (ya configurada)
- **Sin nuevas dependencias npm**

### API
- Prefijo: `/api/v1/categorias`, `/api/v1/ingredientes`, `/api/v1/productos`
- Endpoints públicos (GET) sin autenticación para `disponible=true`
- Endpoints de gestión protegidos por RBAC

## Dependencias

- `setup-infra-backend` ✅ (core, modelos, auth funcionando — requiere completar módulos backend de catálogo)
- `setup-frontend` ✅ (FSD, stores, api client, router — frontend listo para nuevas páginas)

## Definition of Done

- [ ] Backend: CRUD categorías funcionando (crear, listar jerárquico, editar, soft delete con validación)
- [ ] Backend: CRUD ingredientes funcionando con flag es_alergeno
- [ ] Backend: CRUD productos funcionando con precio, stock, múltiples categorías e ingredientes
- [ ] Backend: Productos disponibles visibles sin autenticación
- [ ] Backend: Gestión (crear/editar/eliminar) protegida por rol ADMIN/STOCK
- [ ] Backend: Seed data actualizado con ejemplos reales
- [ ] Frontend: Listado de productos con grilla responsiva, búsqueda y filtros
- [ ] Frontend: Detalle de producto con ingredientes, alérgenos y agregar al carrito
- [ ] Frontend: Navegación jerárquica por categorías (sidebar + breadcrumbs)
- [ ] Frontend: Estados de carga, vacío y error consistentes
- [ ] Frontend: Conexión con cartStore funcional
- [ ] Build exitoso: `npm run build` (frontend) + `uvicorn main:app` (backend) sin errores

## Historias de Usuario

| ID | Descripción |
|----|-------------|
| US-007 | Crear categoría |
| US-008 | Listar categorías jerárquicas |
| US-009 | Editar categoría |
| US-010 | Eliminar categoría (soft delete) |
| US-011 | Crear ingrediente |
| US-012 | Listar ingredientes |
| US-013 | Editar ingrediente |
| US-014 | Eliminar ingrediente |
| US-015 | Crear producto |
| US-016 | Asociar producto a categorías |
| US-017 | Asociar ingredientes a producto |
| US-018 | Listar productos del catálogo |
| US-019 | Ver detalle de producto |
| US-020 | Editar producto |
| US-021 | Gestionar stock |
| US-022 | Eliminar producto |
| US-023 | Filtrar productos por alérgenos |
