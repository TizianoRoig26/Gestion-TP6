## MODIFIED Requirements

### Requirement: Sidebar por rol
El sistema SHALL mostrar secciones del sidebar según el rol del usuario. Las rutas también SHALL estar protegidas a nivel de navegación.

#### Scenario: Sidebar por rol
- **WHEN** un usuario con rol STOCK accede a `/admin/*`
- **THEN** el sidebar solo muestra: Dashboard, Catálogo, Stock
- **WHEN** un usuario con rol PEDIDOS accede a `/admin/*`
- **THEN** el sidebar solo muestra: Dashboard, Pedidos

#### Scenario: Protección de ruta por rol
- **WHEN** un usuario con rol STOCK navega a `/admin/usuarios`
- **THEN** el sistema muestra pantalla 403 "No tenés permisos para esta acción"
- **WHEN** un usuario con rol PEDIDOS navega a `/admin/stock`
- **THEN** el sistema muestra pantalla 403

#### Scenario: Acceso permitido por ruta
- **WHEN** un usuario con rol ADMIN navega a `/admin/usuarios`
- **THEN** el sistema muestra la página de gestión de usuarios
- **WHEN** un usuario con rol STOCK navega a `/admin/stock`
- **THEN** el sistema muestra la página de stock
- **WHEN** un usuario con rol PEDIDOS navega a `/admin/pedidos`
- **THEN** el sistema muestra la página de gestión de pedidos

## ADDED Requirements

### Requirement: RoleGuard como wrapper de componentes
El sistema SHALL proveer un componente `RoleGuard` que funcione tanto como layout route como wrapper de componentes.

#### Scenario: Uso como wrapper
- **WHEN** se usa `<RoleGuard allowedRoles={["ADMIN"]}><Componente /></RoleGuard>`
- **THEN** renderiza `<Componente />` solo si el usuario tiene rol ADMIN
- **THEN** muestra pantalla 403 si no tiene permiso
