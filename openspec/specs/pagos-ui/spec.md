# Capability: pagos-ui

## Descripción
Componentes de interfaz para el flujo de pago con MercadoPago: formulario de tarjeta tokenizado, estados de pago con feedback visual, y polling de confirmación.

## ADDED Requirements

### Requirement: Formulario de pago con tarjeta tokenizada
El sistema SHALL mostrar un formulario de pago con tarjeta utilizando `@mercadopago/sdk-react` (CardPayment) que tokeniza los datos en el browser sin enviarlos al servidor.

#### Scenario: Renderizar formulario de tarjeta
- **WHEN** un cliente llega al checkout y selecciona MercadoPago como forma de pago
- **THEN** se renderiza el componente CardPayment de @mercadopago/sdk-react con la public_key desde VITE_MP_PUBLIC_KEY
- **THEN** el formulario muestra campos de: número de tarjeta, fecha de vencimiento, CVV, nombre del titular
- **THEN** los datos de tarjeta NUNCA pasan por el servidor de Food Store

#### Scenario: Tokenización exitosa
- **WHEN** el cliente completa los datos de tarjeta válidos
- **THEN** el SDK genera un card_token
- **THEN** el frontend envía POST /api/v1/pagos/crear con pedido_id y card_token
- **THEN** el paymentStore transiciona a "processing"

#### Scenario: Error de tokenización
- **WHEN** el SDK rechaza los datos de tarjeta (CVV inválido, fecha vencida, etc.)
- **THEN** se muestra el error del SDK debajo del campo correspondiente
- **THEN** el cliente puede corregir y reintentar

#### Scenario: Error de pago (rechazado)
- **WHEN** el backend retorna error 402 (Payment Required) con detalle de rechazo
- **THEN** paymentStore transiciona a "error" con el mensaje de rechazo
- **THEN** se muestra el mensaje de error y un botón "Reintentar"
- **THEN** el cliente puede intentar con otra tarjeta

### Requirement: Pantalla de confirmación con polling de estado
El sistema SHALL mostrar el estado del pago después de crear el pedido, con polling automático para detectar la confirmación vía webhook.

#### Scenario: Pago en proceso
- **WHEN** el pago se envió pero aún no hay respuesta del webhook
- **THEN** se muestra "Procesando pago..." con un spinner
- **THEN** el frontend hace polling GET /api/v1/pagos/{pedido_id} cada 5 segundos (TanStack Query refetchInterval)
- **THEN** se muestra mensaje "No cierres esta página mientras se procesa el pago"

#### Scenario: Pago aprobado
- **WHEN** el polling detecta mp_status=approved
- **THEN** se muestra pantalla de éxito con: check verde, "¡Pago aprobado!", número de pedido, total
- **THEN** se muestra botón "Ver detalle del pedido" → /mis-pedidos/{id}
- **THEN** el polling se detiene

#### Scenario: Pago rechazado
- **WHEN** el polling detecta mp_status=rejected
- **THEN** se muestra pantalla de error con: icono de error, "Pago rechazado", detalle del rechazo
- **THEN** se muestra botón "Reintentar pago"
- **THEN** el polling se detiene

#### Scenario: Pago pendiente (efectivo)
- **WHEN** el polling detecta mp_status=pending (pago en efectivo no acreditado aún)
- **THEN** se muestra "Pago pendiente — Si pagaste en efectivo, esperá a que se acredite"
- **THEN** el polling continúa cada 10 segundos con un contador de intentos

### Requirement: Estados de pago en detalle del pedido
El sistema SHALL mostrar el estado del pago en la pantalla de detalle del pedido.

#### Scenario: Badge de estado de pago
- **WHEN** un cliente ve el detalle de su pedido en /mis-pedidos/{id}
- **THEN** se muestra un badge con el estado del pago (aprobado/rechazado/pendiente) con color semántico
- **THEN** si el pago fue aprobado, se muestra mp_payment_id como referencia

#### Scenario: Reintentar pago desde detalle
- **WHEN** el pago fue rechazado o cancelado y el pedido sigue en PENDIENTE
- **THEN** se muestra un botón "Reintentar pago" que redirige al checkout con el carrito reconstruido o permite nuevo pago

## Reglas de Negocio

- RN-PU01: Los datos de tarjeta nunca pasan por el servidor (PCI SAQ-A)
- RN-PU02: Polling cada 5 segundos mientras el pago está en proceso
- RN-PU03: El polling se detiene cuando el pago llega a estado terminal (approved/rejected)
- RN-PU04: El badge de pago en detalle usa colores semánticos (verde/rojo/amarillo)
