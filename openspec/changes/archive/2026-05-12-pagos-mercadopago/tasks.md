## 1. Backend — Schemas y Repository de Pagos

- [x] 1.1 Crear `backend/modules/pagos/schemas.py` con PagoCreate (pedido_id, card_token), PagoResponse (id, pedido_id, monto, mp_payment_id, mp_status, external_reference, creado_en) y WebhookNotification (type, data.id)
- [x] 1.2 Crear `backend/modules/pagos/repository.py` con PagoRepository que herede de BaseRepository[Pago] y métodos: get_by_pedido_id(), get_by_mp_payment_id(), get_by_idempotency_key(), create_pago()

## 2. Backend — Service de Pagos (SDK MercadoPago)

- [x] 2.1 Crear `backend/modules/pagos/service.py` con PagoService que recibe SDK MP y repositorio por inyección
- [x] 2.2 Implementar `crear_pago()`: validar pedido, generar idempotency_key UUID, llamar SDK payment.create() con card_token, registrar Pago en BD vía UoW
- [x] 2.3 Implementar `procesar_webhook()`: recibir notification_id de MP, consultar GET /v1/payments/{id} a API MP, actualizar mp_status, y si es approved: transicionar pedido PENDIENTE→CONFIRMADO (con decremento de stock atómico)
- [x] 2.4 Implementar `obtener_pago_por_pedido()`: consultar pago por pedido_id con verificación de propiedad

## 3. Backend — Router y Registro

- [x] 3.1 Crear `backend/modules/pagos/router.py` con:
  - `POST /api/v1/pagos/crear` — requiere autenticación CLIENT, body PagoCreate, retorna 201 PagoResponse
  - `POST /api/v1/pagos/webhook` — público, recibe WebhookNotification, retorna 200 {"status": "ok"}
  - `GET /api/v1/pagos/{pedido_id}` — requiere autenticación (propietario o ADMIN), retorna 200 PagoResponse
- [x] 3.2 Registrar el router de pagos en `backend/app.py` con prefijo `/api/v1/pagos`
- [x] 3.3 Modificar `backend/modules/pedidos/service.py`: eliminar la transición manual PENDIENTE→CONFIRMADO para ADMIN (ahora solo vía webhook). Actualizar validación FSM.

## 4. Frontend — SDK y Formulario de Pago

- [x] 4.1 Instalar `@mercadopago/sdk-react` (ya está en spec del proyecto)
- [x] 4.2 Crear hook `usePago` en `frontend/src/shared/api/pagos.ts` con TanStack Query:
  - `useCrearPago()` mutation: POST /api/v1/pagos/crear
  - `useEstadoPago(pedidoId)` query con refetchInterval condicional: GET /api/v1/pagos/{pedido_id}
- [x] 4.3 Extender CheckoutPage para integrar CardPayment de MercadoPago:
  - Renderizar CardPayment con MP_PUBLIC_KEY desde VITE_MP_PUBLIC_KEY
  - Después de crear pedido exitosamente, mostrar formulario de pago
  - Enviar card_token a POST /api/v1/pagos/crear
  - Manejar estados processing, error, approved, rejected

## 5. Frontend — Confirmación y Polling

- [x] 5.1 Extender OrderConfirmationPage con polling de pago:
  - Mostrar spinner y "Procesando pago..." mientras se espera el webhook
  - Polling con refetchInterval: 5s usando useEstadoPago
  - Detener polling en estados terminales (approved, rejected)
- [x] 5.2 Implementar pantalla de éxito: check verde, "¡Pago aprobado!", número de pedido, total, botón "Ver detalle"
- [x] 5.3 Implementar pantalla de rechazo: icono error, mensaje de rechazo, botón "Reintentar pago"
- [x] 5.4 Implementar pantalla de pago en efectivo: mensaje "Pagás al recibir", botón "Ver detalle"
- [x] 5.5 Agregar badge de estado de pago en la pantalla de detalle del pedido (`OrderDetailPage`)

## 6. Verificación Final

- [x] 6.1 Verificar que el webhook recibe notificaciones y transiciona pedido PENDIENTE→CONFIRMADO
- [x] 6.2 Verificar que idempotency_key evita pagos duplicados
- [x] 6.3 Verificar que el frontend muestra los estados de pago correctamente (approved/rejected/pending)
- [x] 6.4 Verificar que el polling se detiene al llegar a estado terminal
