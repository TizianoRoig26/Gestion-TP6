# Capability: Pagos (MercadoPago)

## Descripción
Integración con MercadoPago Checkout API con webhook IPN para confirmación automática.

## Historias de Usuario
- US-045: Realizar pago con MercadoPago
- US-046: Confirmación automática por webhook
- US-047: Ver estado del pago
- US-048: Reintentar pago

## Stack Tecnológico
- mercadopago SDK Python (backend)
- @mercadopago/sdk-js (frontend)
- Webhook/IPN para notificaciones

## Reglas de Negocio
- RN-PA01: Tokenización en browser (PCI DSS SAQ-A)
- RN-PA02: idempotency_key evitar duplicados
- RN-PA03: Webhook responde rápido (200)
- RN-PA04: Verificar estado en API MP
- RN-PA05: approved → PENDIENTE→CONFIRMADO automático
- RN-PA06: rejected → pedido permanece PENDIENTE
- RN-PA07: pending/in_process → actualizar estado pago
- RN-PA08: Múltiples intentos por pedido

## Flujo de Pago
```
1. Frontend tokeniza tarjeta (SDK JS)
2. Frontend envía card_token al backend
3. Backend crea preferencia con idempotency_key
4. Backend registra pago en tabla
5. MP procesa pago
6. MP envía webhook IPN
7. Backend verifica en API MP
8. Si approved: transiciona pedido
```

## Dependencias
- pedidos.md (para vincular pago a pedido)

## Definition of Done
- [ ] Checkout funciona con tarjeta tokenizada
- [ ] Webhook procesa notificaciones
- [ ] Transición automática PENDIENTE→CONFIRMADO
- [ ] Múltiples intentos por pedido
- [ ] PCI DSS SAQ-A compliance

## Recursos
- docs/Descripcion.md (sección 8 - API REST, módulo Pagos)
- docs/Historias_de_usuario.md (EPIC 08)
- docs/Integrador.md (sección 8)