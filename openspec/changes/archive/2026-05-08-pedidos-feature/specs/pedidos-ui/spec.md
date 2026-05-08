# Capability: pedidos-ui

## Descripción
Interfaz de usuario para el flujo completo de pedidos: carrito de compras, checkout, listado de pedidos del cliente, detalle de pedido con timeline visual de estados.

## ADDED Requirements

### Requirement: Carrito de compras persistente
El sistema SHALL mostrar el carrito de compras con todos los productos agregados, sus cantidades, personalización y totales, persistiendo los datos en localStorage.

#### Scenario: Vista del carrito
- **WHEN** un cliente accede a `/carrito`
- **THEN** ve la lista de items con nombre, cantidad, precio unitario, subtotal, ingredientes excluidos, y el total general
- **THEN** ve el costo de envío separado

#### Scenario: Carrito vacío
- **WHEN** el carrito no tiene items
- **THEN** se muestra un mensaje "Tu carrito está vacío" con un botón/link "Ver catálogo"

#### Scenario: Modificar cantidad
- **WHEN** un cliente cambia la cantidad de un item en el carrito
- **THEN** se actualiza el subtotal del item y el total general
- **THEN** si la cantidad llega a 0, el item se elimina

#### Scenario: Eliminar item
- **WHEN** un cliente elimina un item del carrito
- **THEN** el item desaparece y se recalcula el total

#### Scenario: Persistencia
- **WHEN** un cliente cierra el navegador y vuelve a abrirlo
- **THEN** los items del carrito se mantienen (Zustand persist con localStorage)

### Requirement: Checkout con confirmación
El sistema SHALL guiar al cliente a través del proceso de checkout: revisión del carrito, selección de dirección, y confirmación del pedido.

#### Scenario: Iniciar checkout
- **WHEN** un cliente autenticado hace clic en "Ir a pagar" desde el carrito
- **THEN** se redirige a `/checkout` donde ve el resumen del pedido

#### Scenario: Cliente no autenticado
- **WHEN** un usuario no autenticado intenta ir al checkout
- **THEN** se redirige al login con un mensaje "Debés iniciar sesión para continuar"

#### Scenario: Confirmar pedido
- **WHEN** un cliente confirma el pedido en checkout
- **THEN** se envía POST /api/pedidos con los datos del carrito
- **THEN** si la creación es exitosa, se vacía el carrito y se redirige a confirmación

#### Scenario: Error de stock en checkout
- **WHEN** al confirmar el pedido algún producto no tiene stock suficiente
- **THEN** se muestra un error indicando qué producto y cuánto stock disponible hay
- **THEN** se sugiere modificar la cantidad o eliminar el producto

### Requirement: Pantalla de confirmación de pedido
El sistema SHALL mostrar una pantalla de confirmación cuando el pedido se crea exitosamente.

#### Scenario: Pedido creado
- **WHEN** un pedido se crea exitosamente
- **THEN** se muestra pantalla de confirmación con: número de pedido, resumen de items, total, dirección, estado "PENDIENTE - Esperando pago"
- **THEN** se incluye botón "Ver detalle del pedido"
- **THEN** se incluye botón "Ir al catálogo"

### Requirement: Listado de pedidos del cliente
El sistema SHALL mostrar un listado paginado de los pedidos del cliente con su estado actual.

#### Scenario: Listado de pedidos
- **WHEN** un cliente autenticado accede a `/mis-pedidos`
- **THEN** ve una lista de sus pedidos ordenados por fecha descendente
- **THEN** cada pedido muestra: número, fecha, estado (con badge de color), total, cantidad de items

#### Scenario: Filtro por estado
- **WHEN** un cliente selecciona un filtro de estado
- **THEN** el listado se filtra para mostrar solo pedidos en ese estado

#### Scenario: Sin pedidos
- **WHEN** un cliente no tiene pedidos
- **THEN** se muestra "No tenés pedidos todavía" con link al catálogo

### Requirement: Detalle de pedido con timeline
El sistema SHALL mostrar el detalle completo de un pedido incluyendo un timeline visual de los estados recorridos.

#### Scenario: Detalle del pedido
- **WHEN** un cliente autenticado accede a `/mis-pedidos/{id}`
- **THEN** ve: datos del pedido (número, fecha, total), dirección snapshot, items con precios snapshot, estado actual

#### Scenario: Timeline visual
- **WHEN** un cliente ve el detalle de su pedido
- **THEN** ve un timeline horizontal o vertical con todos los estados, marcando los completados, el actual (destacado), y los pendientes (atenuados)
- **THEN** cada paso del timeline muestra el timestamp y el actor que realizó la transición

#### Scenario: Cancelación
- **WHEN** un pedido está en PENDIENTE
- **THEN** el cliente ve un botón "Cancelar pedido" con confirmación

### Requirement: Navegación e integración
El sistema SHALL integrar las nuevas pantallas en la navegación global del sitio.

#### Scenario: Link al carrito
- **WHEN** un cliente ve el header
- **THEN** ve un icono/badge de carrito con el conteo de items (desde cartStore)

#### Scenario: Link a mis pedidos
- **WHEN** un cliente autenticado ve el header o menú
- **THEN** ve un link "Mis Pedidos"

#### Scenario: Badge de cantidad
- **WHEN** hay items en el carrito
- **THEN** el icono del carrito en el header muestra un badge con la cantidad total de items
