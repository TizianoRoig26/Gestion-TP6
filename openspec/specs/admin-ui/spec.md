# Capability: admin-ui

## Descripción
Interfaz de usuario del panel de administración: layout con sidebar, dashboard con gráficos recharts, páginas CRUD de usuarios, pedidos y catálogo/stock.

## ADDED Requirements

### Requirement: Layout admin con sidebar
El sistema SHALL mostrar un layout de administración con sidebar de navegación persistente, separado del layout público.

#### Scenario: Sidebar con secciones
- **WHEN** un ADMIN accede a `/admin/*`
- **THEN** ve un sidebar vertical con: Dashboard, Usuarios, Pedidos, Catálogo, Stock
- **THEN** la sección activa está destacada visualmente

#### Scenario: Sidebar por rol
- **WHEN** un usuario con rol STOCK accede a `/admin/*`
- **THEN** el sidebar solo muestra: Dashboard, Catálogo, Stock
- **WHEN** un usuario con rol PEDIDOS accede a `/admin/*`
- **THEN** el sidebar solo muestra: Dashboard, Pedidos

### Requirement: Dashboard con KPIs y gráficos
El sistema SHALL mostrar un dashboard con indicadores clave y gráficos visuales usando recharts.

#### Scenario: KPIS
- **WHEN** un ADMIN accede al dashboard (`/admin`)
- **THEN** ve 4 tarjetas de KPI: Ventas totales (período), Pedidos totales, Usuarios registrados, Ticket promedio
- **THEN** cada KPI muestra el valor numérico y una breve etiqueta

#### Scenario: Gráfico de ventas por período
- **WHEN** un ADMIN ve el dashboard
- **THEN** ve un LineChart de recharts con la evolución de ventas
- **THEN** puede cambiar la granularidad: día/semana/mes
- **THEN** puede seleccionar un rango de fechas

#### Scenario: Gráfico top productos
- **WHEN** un ADMIN ve el dashboard
- **THEN** ve un BarChart horizontal con los top 10 productos más vendidos
- **THEN** cada barra muestra nombre, cantidad vendida e ingreso

#### Scenario: Gráfico pedidos por estado
- **WHEN** un ADMIN ve el dashboard
- **THEN** ve un PieChart con la distribución de pedidos por estado
- **THEN** cada sección muestra código de estado y cantidad

#### Scenario: Estados de carga
- **WHEN** los datos del dashboard están cargando
- **THEN** se muestran skeleton loaders en lugar de los gráficos
- **WHEN** hay un error al cargar datos
- **THEN** se muestra un mensaje de error

### Requirement: Página de Usuarios (Admin)
El sistema SHALL mostrar una página para gestionar usuarios del sistema.

#### Scenario: Listado de usuarios
- **WHEN** un ADMIN accede a `/admin/usuarios`
- **THEN** ve una tabla con: nombre, email, roles, activo (badge), fecha registro
- **THEN** puede buscar por nombre o email
- **THEN** puede filtrar por rol
- **THEN** la tabla está paginada

#### Scenario: Editar usuario
- **WHEN** un ADMIN hace clic en "Editar" en un usuario
- **THEN** se abre un modal con datos del usuario
- **THEN** puede cambiar nombre, email
- **THEN** puede cambiar el rol (selector)
- **THEN** al guardar, se actualiza la tabla

#### Scenario: Desactivar/Activar usuario
- **WHEN** un ADMIN hace clic en "Desactivar" en un usuario activo
- **THEN** se muestra un modal de confirmación
- **THEN** al confirmar, se desactiva y se actualiza la tabla
- **WHEN** un ADMIN hace clic en "Activar" en un usuario inactivo
- **THEN** se activa sin confirmación adicional

#### Scenario: Confirmación antes de desactivar
- **WHEN** un ADMIN intenta desactivar su propia cuenta
- **THEN** se muestra un mensaje de error: "No puedes desactivar tu propia cuenta"

### Requirement: Página de Pedidos (Admin)
El sistema SHALL mostrar una página para gestionar todos los pedidos del sistema.

#### Scenario: Listado de pedidos
- **WHEN** un ADMIN o Gestor de Pedidos accede a `/admin/pedidos`
- **THEN** ve una tabla con: ID, cliente, estado (badge color), total, fecha
- **THEN** puede filtrar por estado
- **THEN** puede buscar por ID o nombre de cliente
- **THEN** la tabla está paginada

#### Scenario: Cambiar estado de pedido
- **WHEN** un ADMIN o Gestor de Pedidos hace clic en "Cambiar estado"
- **THEN** se muestra un selector con solo los estados válidos según la FSM
- **THEN** si es CANCELADO, se solicita motivo obligatorio si el estado lo requiere
- **THEN** al confirmar, se actualiza el estado y se refresca la tabla

#### Scenario: Detalle de pedido
- **WHEN** un ADMIN hace clic en un pedido
- **THEN** ve el detalle completo: items, historial de estados (timeline)

### Requirement: Página de Catálogo/Stock (Admin)
El sistema SHALL mostrar una página para gestionar el catálogo y stock de productos.

#### Scenario: Listado de productos con stock
- **WHEN** un ADMIN o Gestor de Stock accede a `/admin/stock`
- **THEN** ve una tabla con: producto, categoría, stock actual, disponible (badge), precio
- **THEN** el stock se muestra en rojo si es menor a 5

#### Scenario: Actualizar stock
- **WHEN** un ADMIN o Gestor de Stock hace clic en el campo de stock
- **THEN** puede editar el valor directamente (inline edit)
- **THEN** al confirmar, se actualiza vía PATCH /productos/{id}/stock

#### Scenario: Toggle disponibilidad
- **WHEN** un ADMIN o Gestor de Stock hace clic en "Habilitar/Deshabilitar"
- **THEN** se muestra confirmación antes de cambiar
- **THEN** se actualiza vía PATCH /productos/{id} con { disponible }
- **THEN** el cambio se refleja inmediatamente en la UI

## Reglas de Negocio

- RN-AU01: El sidebar muestra secciones según el rol del usuario
- RN-AU02: Los datos del dashboard se refrescan al cambiar filtros de fecha
- RN-AU03: Los cambios de estado de pedido validan la FSM
- RN-AU04: La desactivación de usuario requiere confirmación explícita
- RN-AU05: El stock bajo (< 5) se destaca visualmente en rojo
