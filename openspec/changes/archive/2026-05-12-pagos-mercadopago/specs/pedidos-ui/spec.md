# Capability: pedidos-ui

## Descripción
Delta spec: cambios en la UI de pedidos requeridos por la integración de pagos MercadoPago.

## MODIFIED Requirements

### Requirement: Checkout con formulario de pago MercadoPago
El checkout existente se extiende para incluir el formulario de pago con tarjeta tokenizada de MercadoPago después de la creación del pedido.

#### Scenario: Checkout con pago
- **WHEN** un cliente autenticado confirma el pedido en checkout
- **THEN** se envía POST /api/pedidos para crear el pedido
- **THEN** si la creación es exitosa, se muestra el formulario CardPayment de MercadoPago para procesar el pago
- **THEN** el cliente ingresa datos de tarjeta (tokenizados en browser)
- **THEN** se envía POST /api/v1/pagos/crear con pedido_id y card_token
- **THEN** se redirige a la pantalla de confirmación/pago

#### Scenario: Pago con efectivo
- **WHEN** un cliente selecciona "Efectivo" como forma de pago
- **THEN** NO se muestra el formulario CardPayment
- **THEN** el pedido se crea en estado PENDIENTE sin pago MP
- **THEN** se redirige a confirmación con mensaje "Pagás al recibir"

### Requirement: Pantalla de confirmación con estado de pago
La pantalla de confirmación de pedido se extiende para mostrar el estado del pago en tiempo real.

#### Scenario: Pedido con pago MP creado
- **WHEN** un pedido con MercadoPago se crea exitosamente
- **THEN** se redirige a la nueva pantalla de pago/confirmación con polling de estado
- **THEN** se muestra "Procesando pago..." mientras se espera el webhook

#### Scenario: Pedido con efectivo creado
- **WHEN** un pedido con efectivo se crea exitosamente
- **THEN** se muestra la pantalla de confirmación simple con mensaje "Pagás al recibir el pedido"
- **THEN** se incluye botón "Ver detalle del pedido"
