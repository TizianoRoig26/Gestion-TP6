## Context

El módulo de pedidos ya está implementado con su FSM de 6 estados, pero la transición PENDIENTE→CONFIRMADO está actualmente restringida solo a ADMIN como reemplazo temporal. El modelo de datos `Pago` existe en `db/models.py` con campos para mp_payment_id, external_reference e idempotency_key. La SDK `mercadopago==2.4.0` y las variables de entorno (`MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`, `MP_NOTIFICATION_URL`) ya están configuradas.

Lo que falta es la capa de integración completa: backend module con service que use el SDK, router con endpoints REST y webhook IPN, y frontend con tokenización PCI-compliant vía `@mercadopago/sdk-react`.

## Goals / Non-Goals

**Goals:**
- Implementar módulo backend `pagos/` con schemas, repository, service (SDK MP) y router
- Crear endpoint `POST /api/v1/pagos/crear` para procesar pagos con card_token tokenizado
- Crear endpoint `POST /api/v1/pagos/webhook` para recibir notificaciones IPN de MercadoPago
- Crear endpoint `GET /api/v1/pagos/{pedido_id}` para consultar estado del pago
- Integrar `@mercadopago/sdk-react` en el checkout para tokenización browser-side
- Implementar polling del estado de pago desde la pantalla de confirmación
- Transicionar pedido PENDIENTE→CONFIRMADO automáticamente vía webhook
- Manejar todos los estados de pago MP: approved, pending, rejected, in_process, cancelled

**Non-Goals:**
- No se implementan otros medios de pago (solo MercadoPago Checkout API)
- No se implementa suscripciones ni pagos recurrentes
- No se implementa refunds/devoluciones de pago
- No se implementa QR ni punto de venta presencial
- No se migran datos existentes (no hay pagos previos)

## Decisions

### ADR-01: Arquitectura del módulo pagos
- **Decisión**: Seguir el mismo patrón Feature-First del proyecto: schemas → repository → service → router, usando Unit of Work para atomicidad
- **Alternativa considerada**: Service monolítico dentro de pedidos
- **Razón**: Consistencia con el resto del proyecto. El módulo pagos tiene su propio dominio y ciclo de vida independiente del pedido (el pago puede estar pending mientras el pedido espera)

### ADR-02: Idempotencia con idempotency_key
- **Decisión**: Generar UUID como `idempotency_key` en el backend por cada intento de pago, con unique constraint en la tabla `Pago`
- **Alternativa considerada**: Confiar en mp_payment_id de MP como único identificador
- **Razón**: El idempotency_key nos permite rechazar duplicados antes de llegar a la API de MP, ahorrando llamadas HTTP. La constraint UNIQUE en BD es la red de seguridad final. MP también soporta idempotency_key en sus headers.

### ADR-03: Webhook con verificación de firma
- **Decisión**: El webhook NO valida firma HMAC en v1 (el SDK de MP no la exige para desarrollo). Se valida consultando a la API de MP (`GET /v1/payments/{id}`) antes de aceptar el pago
- **Alternativa considerada**: Validar header X-Signature de MP
- **Razón**: La verificación contra API de MP es más confiable que validar firma local. En producción se puede agregar verificación HMAC como capa adicional. Respondemos rápido (200) y delegamos la verificación a la consulta API.

### ADR-04: Polling vs WebSocket para frontend
- **Decisión**: Usar polling con TanStack Query (refetchInterval: 5s) desde la pantalla de confirmación
- **Alternativa considerada**: WebSocket o Server-Sent Events
- **Razón**: El webhook de MP puede demorar segundos o minutos (especialmente con Rapipago/Pago Fácil). Polling cada 5s es simple, suficiente y consistente con TanStack Query. WebSocket agrega complejidad innecesaria para este caso de uso.

### ADR-05: UoW en pagos
- **Decisión**: `crear_pago` usa Unit of Work para garantizar atomicidad entre el INSERT en tabla Pago y la actualización del pedido
- **Alternativa considerada**: Transacciones manuales con session.commit()
- **Razón**: Consistencia con el patrón establecido del proyecto. Si falla la actualización del estado del pedido, el registro de pago no debe persistir.

### ADR-06: Tokenización en frontend
- **Decisión**: `@mercadopago/sdk-react` tokeniza la tarjeta en el browser — el backend NUNCA recibe datos de tarjeta
- **Razón**: PCI DSS SAQ-A compliance. El frontend usa CardPayment component de MP SDK que genera un `card_token` seguro. El backend solo recibe el token + ID de pedido.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| [R01] Webhook no llega (timeout de red, MP caído) | Polling frontend como respaldo. El usuario ve "Pago pendiente" y puede reintentar |
| [R02] Doble notificación webhook (MP reenvía) | idempotency_key + unique constraint en BD evitan duplicados |
| [R03] Usuario cierra browser antes de que llegue el webhook | El pedido queda PENDIENTE. Al volver, puede consultar estado con GET /pagos/{pedido_id} |
| [R04] Tarjeta rechazada pero frontend no lo muestra | Webhook notifica rejected → frontend detecta con polling y muestra error |
| [R05] Firma de webhook no validada en v1 | En v1 consultamos API MP para verificar. En producción agregar HMAC |
| [R06] El SDK de MP cambia o deja de funcionar | La abstracción está en PagoService. Solo cambiar la implementación interna |
