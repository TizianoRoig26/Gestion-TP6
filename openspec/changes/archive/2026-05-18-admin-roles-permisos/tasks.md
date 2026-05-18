## 1. Backend: GET /auth/me devolver roles

- [x] 1.1 En `backend/modules/auth/router.py`, modificar `get_me` para obtener `roles = auth_service.get_user_roles(user.id)` e incluirlos en el `UserResponse`

## 2. Frontend: RoleGuard con soporte dual

- [x] 2.1 Modificar `frontend/src/shared/guards/RoleGuard.tsx` para aceptar `children?: React.ReactNode` opcional
- [x] 2.2 Si recibe `children`, renderizar `{children}` en lugar de `<Outlet />`
- [x] 2.3 Mantener la pantalla 403 para usuarios sin permiso

## 3. Frontend: Protección por ruta en router.tsx

- [x] 3.1 Importar `RoleGuard` en `frontend/src/app/router.tsx`
- [x] 3.2 Envolver cada ruta admin con `<RoleGuard allowedRoles={[...]}>`:
  - `/admin/usuarios` → `["ADMIN"]`
  - `/admin/pedidos` → `["ADMIN", "PEDIDOS"]`
  - `/admin/catalogo` → `["ADMIN", "STOCK"]`
  - `/admin/stock` → `["ADMIN", "STOCK"]`
  - `/admin` (dashboard) → sin RoleGuard adicional (ya cubierto por AdminRoute)
- [x] 3.3 Verificar que el router compile sin errores
