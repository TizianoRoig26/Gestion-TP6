# Capability: pagos-api

## Descripción
API REST para procesar pagos con MercadoPago Checkout API, incluyendo creación de pagos con token, notificaciones webhook IPN, y consulta de estado de pagos.

## ADDED Requirements

### Requirement: Crear pago con tarjeta tokenizada
El sistema SHALL procesar un pago utilizando un card_token generado por el SDK de MercadoPago en el frontend, registrando la transacción en la tabla Pago con idempotency_key.

#### Scenario: Pago exitoso
- **WHEN** un cliente autenticado envía `POST /api/v1/pagos/crear` con `pedido_id` y `card_token`
- **THEN** el sistema genera un UUID como idempotency_key
- **THEN** el sistema llama a MercadoPago SDK `payment.create()` con el card_token, idempotency_key en header, y external_reference = pedido_id
- **THEN** el sistema registra el Pago en BD con mp_payment_id, mp_status, external_reference, idempotency_key (vía UoW)
- **THEN** el sistema retorna PagoResponse con id, mp_payment_id, mp_status, monto

#### Scenario: Pago duplicado (misma idempotency_key)
- **WHEN** un cliente envía dos requests con el mismo pedido_id
- **THEN** el segundo request detecta que ya existe un pago con esa idempotency_key
- **THEN** el sistema rechaza con error 409 Conflict

#### Scenario: Token inválido
- **WHEN** el card_token es inválido o expiró
- **THEN** MercadoPago rechaza el pago
- **THEN** el sistema registra el Pago con mp_status=rejected
- **THEN** el sistema retorna error 402 Payment Required con detalle del rechazo

#### Scenario: Pedido no encontrado
- **WHEN** el pedido_id no existe o no pertenece al usuario autenticado
- **THEN** el sistema retorna error 404 Not Found

### Requirement: Webhook IPN
El sistema SHALL exponer un endpoint público que reciba notificaciones IPN de MercadoPago, verifique el pago contra la API de MP, y actualice el estado del pedido.

#### Scenario: Notificación de pago approved
- **WHEN** MercadoPago envía `POST /api/v1/pagos/webhook` con `type=payment` y `data.id` = mp_payment_id
- **THEN** el sistema consulta `GET /v1/payments/{mp_payment_id}` a la API de MP para verificar el estado real
- **THEN** si el estado es "approved", el sistema actualiza mp_status en tabla Pago
- **THEN** el sistema avanza el Pedido asociado de PENDIENTE a CONFIRMADO vía UoW (decrementando stock atómicamente)
- **THEN** el sistema retorna HTTP 200 con `{"status": "ok"}`

#### Scenario: Notificación de pago rejected
- **WHEN** MercadoPago envía webhook con `type=payment` y estado real "rejected"
- **THEN** el sistema actualiza mp_status en tabla Pago
- **THEN** el pedido permanece en PENDIENTE
- **THEN** el sistema retorna HTTP 200

#### Scenario: Notificación de pago pending
- **WHEN** MercadoPago envía webhook con estado real "pending" o "in_process"
- **THEN** el sistema actualiza mp_status en tabla Pago
- **THEN** el pedido permanece en PENDIENTE
- **THEN** el sistema retorna HTTP 200

#### Scenario: Notificación sin payment_id
- **WHEN** MercadoPago envía webhook sin `data.id`
- **THEN** el sistema ignora la notificación y retorna HTTP 200

#### Scenario: Notificación con type no payment
- **WHEN** MercadoPago envía webhook con `type` diferente de "payment" (ej: merchant_order)
- **THEN** el sistema ignora la notificación y retorna HTTP 200

### Requirement: Consultar estado de pago
El sistema SHALL permitir consultar el estado de un pago asociado a un pedido.

#### Scenario: Consulta exitosa
- **WHEN** un cliente autenticado (propietario) o ADMIN envía `GET /api/v1/pagos/{pedido_id}`
- **THEN** el sistema retorna PagoResponse con datos del pago (mp_payment_id, mp_status, monto, creado_en)

#### Scenario: Pedido sin pago
- **WHEN** el pedido no tiene ningún pago registrado
- **THEN** el sistema retorna 404 Not Found

#### Scenario: Pedido de otro usuario
- **WHEN** un cliente consulta un pedido que no le pertenece
- **THEN** el sistema retorna 403 Forbidden

## Reglas de Negocio

- RN-PA01: Tokenización en browser (PCI DSS SAQ-A) — el backend nunca recibe datos de tarjeta
- RN-PA02: idempotency_key UUID evita duplicados (unique constraint en BD)
- RN-PA03: Webhook responde rápido (200) sin bloquear
- RN-PA04: El webhook verifica estado real contra API de MP antes de actuar
- RN-PA05: mp_status=approved → pedido PENDIENTE→CONFIRMADO automático (decrementa stock)
- RN-PA06: mp_status=rejected → pedido permanece PENDIENTE
- RN-PA07: mp_status=pending/in_process → pedido permanece PENDIENTE
- RN-PA08: Múltiples intentos de pago por pedido permitidos (nuevo idempotency_key cada vez)
