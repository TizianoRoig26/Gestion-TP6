## Why

El flujo de compras de Food Store está incompleto: los pedidos se crean correctamente con estado PENDIENTE, pero nunca transicionan a CONFIRMADO porque no existe la integración con MercadoPago para procesar pagos. Sin esta integración, el core del negocio (gestionar pedidos con pago) no funciona end-to-end. El modelo de datos (`Pago`, `FormaPago`), la SDK (`mercadopago==2.4.0`) y la configuración base ya existen; falta la capa de integración backend + frontend.

## What Changes

- **Backend — Nuevo módulo `backend/modules/pagos/`**: schemas, repository, service (con SDK de MercadoPago) y router con 3 endpoints
- **Backend — Webhook IPN**: Endpoint público que recibe notificaciones de MercadoPago, verifica el pago y avanza el pedido PENDIENTE → CONFIRMADO
- **Backend — `app.py`**: Registrar el router de pagos
- **Frontend — Checkout con tarjeta**: Integrar `@mercadopago/sdk-react` en el flujo de checkout para tokenizar tarjeta en browser (PCI SAQ-A)
- **Frontend — Página de confirmación**: Mostrar estado del pago con polling mientras se procesa
- **Frontend — Estados de pago**: Manejar approved, pending, rejected, in_process, cancelled

## Capabilities

### New Capabilities
- `pagos-api`: Módulo backend de pagos con integración MercadoPago SDK, endpoints REST y webhook IPN
- `pagos-ui`: Componentes frontend de pago con tarjeta tokenizada, polling de estado y feedback visual

### Modified Capabilities
- `pedidos-api`: El webhook de pagos modifica el estado del pedido (PENDIENTE → CONFIRMADO) — requiere coordinación con módulo pedidos
- `pedidos-ui`: La página de checkout existente se extiende para incluir el formulario de pago con MercadoPago

## Impact

- **Backend**: Nuevo módulo `backend/modules/pagos/` (schemas, repository, service, router) + registro en `app.py`
- **Frontend**: Nuevo componente `CardPayment` en features/pagos, extensión de `CheckoutPage`, nueva página `PedidoConfirmadoPage`, hook `usePago` con TanStack Query
- **Dependencias**: `@mercadopago/sdk-react` en frontend (ya está en spec)
- **Seed/Datos**: Las formas de pago ya existen en seed (MERCADOPAGO, EFECTIVO, TRANSFERENCIA)
- **Config**: Las variables MP_ACCESS_TOKEN, MP_PUBLIC_KEY, MP_NOTIFICATION_URL ya existen en `core/config.py`
