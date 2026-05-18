# Capability: admin-api

## Descripción
API REST para el panel de administración: gestión de usuarios (listar, editar rol, activar/desactivar) y endpoints de métricas/dashboard con datos agregados del sistema.

## ADDED Requirements

### Requirement: Listar usuarios (Admin)
El sistema SHALL permitir a un ADMIN listar todos los usuarios del sistema con filtros y paginación.

#### Scenario: Listado paginado
- **WHEN** un ADMIN envía `GET /api/v1/admin/usuarios?page=1&page_size=20`
- **THEN** el sistema retorna una lista paginada con: id, nombre, email, roles, activo, creado_en
- **THEN** incluye total de registros para paginación

#### Scenario: Búsqueda por nombre o email
- **WHEN** un ADMIN envía `GET /api/v1/admin/usuarios?busqueda=luca`
- **THEN** el sistema filtra usuarios cuyo nombre o email contengan "luca"

#### Scenario: Filtro por rol
- **WHEN** un ADMIN envía `GET /api/v1/admin/usuarios?rol=CLIENT`
- **THEN** el sistema retorna solo usuarios con ese rol

#### Scenario: Sin permisos
- **WHEN** un usuario sin rol ADMIN intenta listar usuarios
- **THEN** el sistema retorna 403 Forbidden

### Requirement: Editar usuario (Admin)
El sistema SHALL permitir a un ADMIN modificar los datos y roles de cualquier usuario.

#### Scenario: Editar datos básicos
- **WHEN** un ADMIN envía `PUT /api/v1/admin/usuarios/{id}` con nombre, email
- **THEN** el sistema actualiza los datos del usuario

#### Scenario: Cambiar rol
- **WHEN** un ADMIN envía `PUT /api/v1/admin/usuarios/{id}/rol` con rol_codigo
- **THEN** el sistema asigna el nuevo rol al usuario

#### Scenario: Último ADMIN
- **WHEN** un ADMIN intenta quitar el rol ADMIN al último usuario con ese rol
- **THEN** el sistema rechaza con error 400: "No se puede eliminar el último administrador"

### Requirement: Desactivar/Activar usuario
El sistema SHALL permitir a un ADMIN desactivar o activar un usuario.

#### Scenario: Desactivar usuario
- **WHEN** un ADMIN envía `PATCH /api/v1/admin/usuarios/{id}/estado` con activo=false
- **THEN** el sistema marca credo_activo=false en el usuario
- **THEN** el usuario no puede loguearse más

#### Scenario: Activar usuario
- **WHEN** un ADMIN envía `PATCH /api/v1/admin/usuarios/{id}/estado` con activo=true
- **THEN** el sistema marca credo_activo=true
- **THEN** el usuario puede loguearse nuevamente

#### Scenario: Auto-desactivación
- **WHEN** un ADMIN intenta desactivarse a sí mismo
- **THEN** el sistema rechaza con error 400: "No puedes desactivar tu propia cuenta"

### Requirement: Dashboard — Resumen de métricas
El sistema SHALL proveer un endpoint con métricas generales del sistema.

#### Scenario: Obtener resumen
- **WHEN** un ADMIN envía `GET /api/v1/admin/metricas/resumen?desde=2026-01-01&hasta=2026-12-31`
- **THEN** el sistema retorna: total_ventas, cantidad_pedidos, cantidad_usuarios, ticket_promedio

#### Scenario: Sin filtro de fechas
- **WHEN** un ADMIN envía `GET /api/v1/admin/metricas/resumen` sin parámetros de fecha
- **THEN** el sistema usa el mes actual como período por defecto

### Requirement: Dashboard — Ventas por período
El sistema SHALL proveer datos de ventas agregados por día/semana/mes para gráficos de evolución.

#### Scenario: Ventas por día
- **WHEN** un ADMIN envía `GET /api/v1/admin/metricas/ventas?desde=...&hasta=...&granularidad=dia`
- **THEN** el sistema retorna array de { fecha, monto_total, cantidad_pedidos } agrupado por día usando DATE_TRUNC

#### Scenario: Ventas por mes
- **WHEN** un ADMIN envía `GET /api/v1/admin/metricas/ventas?granularidad=mes`
- **THEN** el sistema retorna datos agregados por mes

### Requirement: Dashboard — Top productos
El sistema SHALL proveer un ranking de los productos más vendidos.

#### Scenario: Top 10 productos
- **WHEN** un ADMIN envía `GET /api/v1/admin/metricas/productos-top?top=10&desde=...&hasta=...`
- **THEN** el sistema retorna array de { producto_id, nombre, cantidad_total, ingreso_total } ordenado por cantidad descendente

#### Scenario: Sin productos vendidos
- **WHEN** no hay pedidos en el período
- **THEN** el sistema retorna array vacío

### Requirement: Dashboard — Pedidos por estado
El sistema SHALL proveer la distribución de pedidos agrupados por estado.

#### Scenario: Distribución de estados
- **WHEN** un ADMIN envía `GET /api/v1/admin/metricas/pedidos-por-estado?desde=...&hasta=...`
- **THEN** el sistema retorna array de { estado_codigo, estado_nombre, cantidad } para todos los estados con al menos un pedido

### Requirement: Obtener perfil actual con roles
El sistema SHALL devolver los roles del usuario autenticado al consultar su perfil.

#### Scenario: Perfil con roles después de login
- **WHEN** un usuario autenticado envía `GET /api/v1/auth/me`
- **THEN** el sistema retorna sus datos incluyendo `roles: ["ADMIN"]` (o el rol que tenga asignado)
- **THEN** el array `roles` refleja los roles actuales en base de datos

#### Scenario: Rol actualizado después de cambio
- **WHEN** un ADMIN cambia el rol de un usuario
- **AND** ese usuario hace `GET /api/v1/auth/me`
- **THEN** el sistema retorna el nuevo rol (no el del JWT anterior)

## Reglas de Negocio

- RN-AD01: Solo rol ADMIN puede acceder a endpoints de usuarios y métricas
- RN-AD02: No se puede desactivar el último ADMIN del sistema
- RN-AD03: No se puede desactivar la propia cuenta
- RN-AD04: Las métricas usan solo pedidos en estados confirmados/entregados para cálculos de ventas
