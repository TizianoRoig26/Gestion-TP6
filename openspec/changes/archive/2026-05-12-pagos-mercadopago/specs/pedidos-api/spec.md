# Capability: pedidos-api

## Descripción
Delta spec: cambios en la API de pedidos requeridos por la integración de pagos MercadoPago.

## MODIFIED Requirements

### Requirement: Transición PENDIENTE→CONFIRMADO automática vía webhook
La transición PENDIENTE→CONFIRMADO ahora es realizada automáticamente por el webhook de MercadoPago cuando el pago es aprobado. Se elimina la restricción temporal que permitía a ADMIN hacer esta transición manualmente.

#### Scenario: Webhook confirma pedido
- **WHEN** el webhook de MercadoPago notifica un pago approved para un pedido PENDIENTE
- **THEN** el sistema transiciona el pedido a CONFIRMADO y decrementa el stock atómicamente (vía UoW)

#### Scenario: Admin ya no puede confirmar manualmente
- **WHEN** un ADMIN envía PATCH con estado_codigo=CONFIRMADO sobre un pedido PENDIENTE
- **THEN** el sistema rechaza con error 400 indicando que la transición PENDIENTE→CONFIRMADO solo puede ocurrir automáticamente vía webhook

## Reglas de Negocio Modificadas

- RN-FS02: ~~PENDIENTE→CONFIRMADO solo automático (temporal: solo ADMIN)~~ → PENDIENTE→CONFIRMADO solo automático vía webhook de MercadoPago. Ningún rol puede hacer esta transición manualmente.
