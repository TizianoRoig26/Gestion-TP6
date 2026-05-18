## Context

El panel de administración de Food Store implementa RBAC con 4 roles: ADMIN, STOCK, PEDIDOS, CLIENT. El sidebar del admin ya filtra las secciones visibles según el rol del usuario. Sin embargo, existen dos brechas:

1. El endpoint `GET /auth/me` (usado al recargar la página para restaurar sesión) no devuelve los `roles` del usuario — siempre retorna array vacío.
2. El `AdminRoute` en el router protege todas las rutas admin con el mismo conjunto de roles `["ADMIN", "STOCK", "PEDIDOS"]`, permitiendo que un usuario STOCK acceda a `/admin/usuarios` escribiendo la URL directamente.

Adicionalmente, `RoleGuard` solo funciona como layout route (renderiza `<Outlet />`), no como wrapper de componentes.

## Goals / Non-Goals

**Goals:**
- `GET /auth/me` debe devolver los roles del usuario autenticado
- Cada ruta admin debe tener protección granular según el rol requerido
- `RoleGuard` debe funcionar tanto como layout route como wrapper de componentes
- Un usuario sin permiso para una ruta específica debe ver pantalla 403

**Non-Goals:**
- No se modifican los permisos del backend (ya están correctos con `require_role`)
- No se agregan nuevos roles ni se modifica el modelo de datos
- No se cambia la lógica del sidebar (ya filtra correctamente)

## Decisions

### ADR-01: RoleGuard con soporte dual (Outlet + children)

**Decisión**: Modificar `RoleGuard` para que acepte `children` opcional. Si recibe `children`, renderiza `{children}`; si no, renderiza `<Outlet />`.

**Alternativa considerada**: Anidar layout routes con `RoleGuard` por cada grupo de rutas.

**Por qué esta opción**: Es más simple y evita nesting excesivo en el router. Permite usar `RoleGuard` como wrapper de componentes directamente en la definición de rutas.

### ADR-02: Protección por ruta individual en router.tsx

**Decisión**: Envolver cada elemento de ruta admin con `<RoleGuard allowedRoles={[...]}>` como wrapper.

**Alternativa considerada**: Mover la lógica de permisos a `AdminLayout`.

**Por qué esta opción**: El guard a nivel ruta previene el acceso antes de que el componente se monte, incluso si el usuario navega directamente por URL. Es más seguro que depender solo del sidebar.

### ADR-03: roles en GET /auth/me

**Decisión**: Agregar `roles = auth_service.get_user_roles(user.id)` al endpoint `get_me`, igual que ya se hace en login, register y refresh.

**Alternativa considerada**: Extraer roles del JWT (el token ya los contiene).

**Por qué esta opción**: Consistencia con los otros endpoints de auth. Además, si el rol cambia (por ejemplo, otro ADMIN se lo cambió), el JWT aún tendría el rol viejo hasta que expire. Consultar de la DB siempre da el valor actual.

## Risks / Trade-offs

- **[Bajo] RoleGuard como wrapper**: Si un componente necesita ser envuelto y también tiene children propios, podría haber conflictos. Mitigación: solo se usa como wrapper para elementos de ruta, no para componentes anidados.
- **[Bajo] Cache de authStore**: El usuario persiste en localStorage con roles. Si otro admin le cambia el rol mientras está logueado, no lo verá hasta que refresque o haga un nuevo login. Esto es aceptable y consistente con el diseño actual.
