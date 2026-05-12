## 1. Backend — Módulo Admin Base

- [x] 1.1 Crear `backend/modules/admin/__init__.py` y `backend/modules/admin/schemas.py` con schemas: UsuarioListRead, UsuarioUpdateAdmin, RolUpdateRequest, EstadoUpdateRequest, MetricasResumen, VentasPorPeriodo, TopProducto, PedidosPorEstado
- [x] 1.2 Crear `backend/modules/admin/service.py` con AdminService: listar_usuarios (con búsqueda y filtro), editar_usuario, cambiar_rol, activar_desactivar, obtener_metricas_resumen, obtener_ventas, obtener_top_productos, obtener_pedidos_por_estado
- [x] 1.3 Crear `backend/modules/admin/router.py` con endpoints:
  - `GET /api/v1/admin/usuarios` — listar usuarios (búsqueda, filtro por rol, paginación)
  - `PUT /api/v1/admin/usuarios/{id}` — editar datos de usuario
  - `PUT /api/v1/admin/usuarios/{id}/rol` — cambiar rol
  - `PATCH /api/v1/admin/usuarios/{id}/estado` — activar/desactivar
  - `GET /api/v1/admin/metricas/resumen` — KPIs
  - `GET /api/v1/admin/metricas/ventas` — ventas por período
  - `GET /api/v1/admin/metricas/productos-top` — top productos
  - `GET /api/v1/admin/metricas/pedidos-por-estado` — distribución
- [x] 1.4 Registrar el router admin en `backend/app.py` con prefijo `/api/v1/admin`

## 2. Frontend — Layout Admin y Routing

- [x] 2.1 Crear layout admin `frontend/src/widgets/AdminLayout.tsx` con sidebar vertical y slot para contenido
- [x] 2.2 Crear sidebar con secciones dinámicas según rol: Dashboard, Usuarios (solo ADMIN), Pedidos (ADMIN/PEDIDOS), Catálogo (ADMIN/STOCK), Stock (ADMIN/STOCK)
- [x] 2.3 Crear guard `frontend/src/shared/guards/AdminRoute.tsx` que verifique rol (ADMIN, STOCK, PEDIDOS) según la ruta
- [x] 2.4 Agregar rutas `/admin/*` en `frontend/src/app/router.tsx` con lazy loading y AdminLayout
- [x] 2.5 Agregar link al panel admin en el header para usuarios con rol ADMIN/STOCK/PEDIDOS

## 3. Frontend — Dashboard con recharts

- [x] 3.1 Crear hook `useAdmin` en `frontend/src/shared/api/admin.ts` con TanStack Query: useMetricasResumen, useVentasPeriodo, useTopProductos, usePedidosPorEstado
- [x] 3.2 Crear `DashboardPage` en `frontend/src/pages/admin/DashboardPage.tsx` con 4 tarjetas KPI (ventas, pedidos, usuarios, ticket promedio)
- [x] 3.3 Implementar LineChart de recharts para evolución de ventas con selector de granularidad (día/semana/mes)
- [x] 3.4 Implementar BarChart de recharts para top 10 productos más vendidos
- [x] 3.5 Implementar PieChart de recharts para distribución de pedidos por estado
- [x] 3.6 Agregar filtro de rango de fechas que refresque todos los gráficos

## 4. Frontend — Admin Usuarios

- [x] 4.1 Crear hook `useAdminUsuarios` en `frontend/src/shared/api/admin.ts` con useUsuarios (listar), useEditarUsuario, useCambiarRol, useToggleEstado
- [x] 4.2 Crear `AdminUsuariosPage` en `frontend/src/pages/admin/UsuariosPage.tsx` con tabla paginada, buscador y filtro por rol
- [x] 4.3 Implementar modal de edición de usuario (nombre, email, rol) con validación
- [x] 4.4 Implementar modal de confirmación para desactivar usuario + validación de auto-desactivación

## 5. Frontend — Admin Pedidos

- [x] 5.1 Crear `AdminPedidosPage` en `frontend/src/pages/admin/PedidosPage.tsx` con tabla paginada de todos los pedidos (reutilizar hooks existentes de pedidos)
- [x] 5.2 Implementar selector de cambio de estado FSM con solo transiciones válidas
- [x] 5.3 Implementar modal de motivo de cancelación (obligatorio si estado = CANCELADO)
- [x] 5.4 Mostrar timeline de historial en detalle de pedido

## 6. Frontend — Admin Stock/Catálogo

- [x] 6.1 Crear `AdminStockPage` en `frontend/src/pages/admin/StockPage.tsx` con tabla de productos con stock, precio y toggle de disponibilidad
- [x] 6.2 Implementar inline edit de stock (editar valor directamente en tabla)
- [x] 6.3 Implementar toggle de disponibilidad con confirmación
- [x] 6.4 Destacar visualmente productos con stock < 5 (texto rojo)

## 7. Verificación

- [x] 7.1 Verificar que el sidebar muestra secciones según el rol autenticado
- [x] 7.2 Verificar que los endpoints de usuarios solo accesibles por ADMIN
- [x] 7.3 Verificar que el dashboard carga KPIs y gráficos correctamente
- [x] 7.4 Verificar que el cambio de estado de pedido valida FSM
- [x] 7.5 Verificar que desactivar usuario lo impide de loguearse
