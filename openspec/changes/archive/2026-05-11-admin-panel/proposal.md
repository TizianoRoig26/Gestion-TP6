## Why

El sistema no tiene un panel de administración centralizado. Los roles ADMIN, STOCK y PEDIDOS existen en el backend con sus permisos, pero no hay una interfaz unificada donde administrar usuarios, ver métricas del negocio, gestionar pedidos y controlar el catálogo. Sin este panel, la experiencia de administración del sistema es inexistente — no hay dashboards, no hay gestión de usuarios desde UI, no hay visibilidad de métricas del negocio.

## What Changes

- **Backend — Nuevo módulo `backend/modules/admin/`**: endpoints para gestión de usuarios (listar, editar rol, desactivar) y endpoints de métricas/dashboard (resumen, ventas por período, top productos, pedidos por estado)
- **Backend — `app.py`**: registrar el router admin (`/api/v1/admin/`)
- **Frontend — Layout Admin**: sidebar de navegación con menú basado en roles (ADMIN ve todo, STOCK ve catálogo, PEDIDOS ve pedidos)
- **Frontend — Dashboard**: KPIs + gráficos recharts (ventas por período, top productos, distribución de pedidos)
- **Frontend — Admin Usuarios**: listado con búsqueda, edición de rol, activar/desactivar
- **Frontend — Admin Pedidos**: listado completo, cambio de estado FSM, detalle (usando endpoints admin existentes)
- **Frontend — Admin Catálogo/Stock**: gestión de productos, stock, disponibilidad (TA: usa endpoints existentes)
- **Frontend — Routing protegido**: ruta `/admin/*` con guard que verifica rol ADMIN/STOCK/PEDIDOS según la sección

## Capabilities

### New Capabilities
- `admin-api`: Backend module para administración — CRUD de usuarios + endpoints de métricas/dashboard
- `admin-ui`: Frontend — Layout admin con sidebar, dashboard con recharts, páginas CRUD de usuarios/pedidos/catálogo

### Modified Capabilities
- `pedidos-api`: Los endpoints admin de pedidos ya existen (`/api/v1/admin/pedidos/`), no requieren cambios
- `frontend-auth`: El ruteo frontend necesita nuevas rutas protegidas `/admin/*` con guards basados en rol

## Impact

- **Backend**: Nuevo módulo `backend/modules/admin/` con schemas, service y router para usuarios + métricas
- **Frontend**: Nuevo layout admin, nuevas páginas (Dashboard, Usuarios, Pedidos, Catálogo/Stock), nuevos hooks TanStack Query, recharts como dependencia (ya está en package.json spec)
- **Ruteo**: Nuevas rutas `/admin/*` protegidas por rol
- **Historias de Usuario**: US-053, US-054, US-055 (Admin Usuarios), US-056, US-057, US-058, US-059 (Dashboard/Métricas), US-064, US-065 (Catálogo/Pedidos Admin)
- **Dependencias**: Los endpoints de pedidos y catálogo ya existen en backend; solo se necesita UI admin
