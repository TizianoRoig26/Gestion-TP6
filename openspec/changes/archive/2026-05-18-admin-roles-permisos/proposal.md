## Why

El panel de administración ya permite cambiar roles de usuarios y el sidebar filtra secciones por rol. Sin embargo, hay dos problemas: (1) el endpoint `GET /auth/me` no devuelve los roles del usuario, lo que rompe la sesión al recargar la página, y (2) las rutas del panel admin no tienen protección por ruta individual — un usuario con rol STOCK puede acceder a `/admin/usuarios` escribiendo la URL aunque el sidebar no lo muestre.

Este cambio cierra ambas brechas para que la visibilidad por rol sea completa: a nivel UI y a nivel ruta.

## What Changes

- **GET /auth/me**: Agregar `roles` al response del endpoint, obteniéndolos via `get_user_roles()`
- **RoleGuard.tsx**: Modificar para que funcione tanto como layout route (Outlet) como wrapper de componentes (children)
- **router.tsx**: Agregar `RoleGuard` por ruta admin para proteger según rol específico:
  - `/admin/usuarios` → solo ADMIN
  - `/admin/pedidos` → ADMIN, PEDIDOS
  - `/admin/catalogo` → ADMIN, STOCK
  - `/admin/stock` → ADMIN, STOCK
  - `/admin` (dashboard) → ADMIN, STOCK, PEDIDOS

## Capabilities

### New Capabilities
- `admin-roles-permisos`: Protección de rutas admin por rol específico (backend + frontend)

### Modified Capabilities
- `admin-api`: El endpoint `GET /auth/me` ahora incluye `roles` en el response
- `admin-ui`: Las rutas del panel admin tienen guard por rol además del sidebar condicional

## Impact

- **Backend**: `modules/auth/router.py` — agregar `roles` al `UserResponse` en `get_me`
- **Frontend**: `shared/guards/RoleGuard.tsx` — soporte para children wrapper
- **Frontend**: `app/router.tsx` — RoleGuard por cada ruta admin
- **Docs**: `openspec/specs/admin-api/spec.md` y `admin-ui/spec.md` — delta specs

## Historias de Usuario

- HU-ADMIN: Como ADMIN quiero que al recargar la página mis roles se mantengan para no perder acceso al panel
- HU-ADMIN: Como ADMIN quiero que cada rol (STOCK, PEDIDOS) solo pueda acceder a sus rutas correspondientes, incluso escribiendo la URL directamente
- HU-ADMIN: Como STOCK quiero recibir un 403 si intento acceder a `/admin/usuarios`

## Dependencias

- Ninguna. Este cambio es autónomo y cierra funcionalidad ya implementada parcialmente.

## Definition of Done

- [ ] `GET /auth/me` devuelve `roles` del usuario autenticado
- [ ] `RoleGuard` funciona como wrapper (acepta children)
- [ ] Cada ruta admin tiene `RoleGuard` con los roles permitidos
- [ ] Un usuario STOCK recibe pantalla 403 al navegar a `/admin/usuarios`
- [ ] La sesión no pierde roles al recargar la página
- [ ] Delta specs creadas para admin-api y admin-ui
