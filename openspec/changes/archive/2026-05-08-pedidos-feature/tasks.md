## 1. Backend — PedidoRepository

- [x] 1.1 Crear `modules/pedidos/repository.py` con clase `PedidoRepository`: constructor recibe session, métodos get_by_id, get_by_user (paginado con filtro estado), get_all (admin, paginado con filtros), get_historial
- [x] 1.2 Implementar `create_with_snapshots` que recibe pedido + detalles + ingredientes_removidos, INSERTA todo en una transacción y valida stock con SELECT FOR UPDATE
- [x] 1.3 Implementar `update_estado` que actualiza estado_codigo + actualizado_en
- [x] 1.4 Implementar `add_historial` (insert en HistorialEstadoPedido, append-only)
- [x] 1.5 Implementar `get_detalles` y `get_ingredientes_removidos` para cargar relaciones del pedido
- [x] 1.6 Implementar `validar_stock` que verifica stock suficiente para cada producto (con for_update)

## 2. Backend — PedidoService (FSM + Lógica de Negocio)

- [x] 2.1 Definir mapa de transiciones FSM como constante del módulo: `TRANSICIONES_PERMITIDAS` con todos los estados y sus destinos válidos
- [x] 2.2 Implementar `crear_pedido`: validar stock, crear Pedido + DetallesPedido + DetallePedidoIngredienteRemovido, calcular total (subtotales + costo_envio), registrar historial inicial PENDIENTE, commitear transacción
- [x] 2.3 Implementar `cambiar_estado`: validar transición contra FSM, validar roles según transición (CONFIRMADO solo ADMIN, EN_PREPARACION/EN_CAMINO/ENTREGADO para PEDIDOS/ADMIN, CANCELADO según reglas), ejecutar side-effects (decrementar stock al confirmar, restaurar al cancelar), registrar historial
- [x] 2.4 Implementar `listar_mis_pedidos` (filtrado por usuario_id, paginado, con filtro estado opcional)
- [x] 2.5 Implementar `obtener_pedido` (con validación de ownership para clientes)
- [x] 2.6 Implementar `listar_todos_pedidos` (admin, con filtros: estado, fecha_desde, fecha_hasta, búsqueda)
- [x] 2.7 Implementar `obtener_historial` que retorna lista cronológica de transiciones

## 3. Backend — PedidoRouter + Integración

- [x] 3.1 Crear `modules/pedidos/router.py` con endpoints públicos (cliente): POST /pedidos, GET /pedidos, GET /pedidos/{id}, GET /pedidos/{id}/historial — todos autenticados con get_current_user, filtrados por usuario_id
- [x] 3.2 Agregar endpoints de gestión (admin): GET /admin/pedidos, GET /admin/pedidos/{id}, PATCH /admin/pedidos/{id}/estado, GET /admin/pedidos/{id}/historial — protegidos con require_role("PEDIDOS", "ADMIN")
- [x] 3.3 Registrar router en `app.py`: `from modules.pedidos.router import router as pedidos_router` + `app.include_router(pedidos_router, prefix="/api/v1/pedidos")` + router admin con prefijo `/api/v1/admin/pedidos`
- [x] 3.4 Verificar que `uvicorn main:app` arranca sin errores y los endpoints aparecen en /docs

## 4. Frontend — API Hooks y Entities

- [x] 4.1 Crear `src/shared/api/pedidos.ts` con hooks TanStack Query: `useCrearPedido()`, `useMisPedidos(filtros)`, `usePedido(id)`, `useHistorialPedido(id)`, `useCambiarEstado()`
- [x] 4.2 Actualizar/generar tipos en `src/entities/order/types.ts` para los tipos de pedido

## 5. Frontend — Carrito (CartPage)

- [x] 5.1 Crear `src/pages/CartPage.tsx` con layout del carrito: lista de items, resumen con totales, botón "Ir a pagar"
- [x] 5.2 Crear `src/features/cart/CartItemRow.tsx` con imagen, nombre, cantidad (selector +/-), precio, subtotal, personalización, botón eliminar
- [x] 5.3 Crear `src/features/cart/CartSummary.tsx` con subtotal, costo envío, total, y botón checkout
- [x] 5.4 Integrar con cartStore existente (addItem, removeItem, updateQuantity, clearCart)
- [x] 6.1 Crear `src/pages/CheckoutPage.tsx` con resumen del pedido, selector de dirección (input directo por ahora), forma de pago, y botón "Confirmar pedido"
- [x] 6.2 Integrar con `useCrearPedido` hook, mostrar loading state durante creación
- [x] 6.3 Manejar errores: stock insuficiente, producto no disponible, validaciones
- [x] 6.4 Redirigir a pantalla de confirmación post-creación exitosa
- [x] 7.1 Crear `src/pages/OrderConfirmationPage.tsx` con número de pedido, resumen de items, total, dirección, estado actual, botones "Ver detalle" e "Ir al catálogo"
- [x] 7.2 Agregar animación/feedback visual de éxito

## 8. Frontend — Listado de Pedidos (OrdersPage)

- [x] 8.1 Crear `src/pages/OrdersPage.tsx` con lista paginada de pedidos del cliente, filtro por estado
- [x] 8.2 Crear `src/features/orders/OrderCard.tsx` con número, fecha, estado (badge con color), total, items count
- [x] 8.3 Crear `src/features/orders/OrderStatusBadge.tsx` con colores semánticos: PENDIENTE (amarillo), CONFIRMADO (azul), EN_PREPARACION (naranja), EN_CAMINO (celeste), ENTREGADO (verde), CANCELADO (rojo)
- [x] 8.4 Manejar empty state y loading (skeletons)

## 9. Frontend — Detalle de Pedido (OrderDetailPage)

- [x] 9.1 Crear `src/pages/OrderDetailPage.tsx` con datos del pedido, items, dirección snapshot
- [x] 9.2 Crear `src/features/orders/OrderTimeline.tsx` con timeline visual de estados: completados (check verde), actual (destacado), pendientes (atenuado), cada paso con timestamp y actor
- [x] 9.3 Botón "Cancelar pedido" si está en PENDIENTE (con confirmación modal)
- [x] 9.4 Manejar loading (skeleton) y error (404, error de red)

## 10. Frontend — Routing y Navegación

- [x] 10.1 Agregar rutas en `app/router.tsx`: `/carrito` → CartPage, `/checkout` → CheckoutPage (protegida), `/pedido-confirmado/:id` → OrderConfirmationPage (protegida), `/mis-pedidos` → OrdersPage (protegida), `/mis-pedidos/:id` → OrderDetailPage (protegida)
- [x] 10.2 Usar `React.lazy` + `Suspense` para lazy loading de las nuevas páginas
- [x] 10.3 Actualizar `widgets/Header.tsx` con link al carrito (con badge de cantidad desde cartStore) y link "Mis Pedidos" (visible solo autenticado), menú de usuario con nombre y cerrar sesión

## 11. Verificación Final

- [x] 11.1 `npm run build` en frontend sin errores (build OK)
- [x] 11.2 Backend arranca con `uvicorn main:app --reload` sin errores (OK)
- [x] 11.3 Endpoints de pedidos aparecen en Swagger /docs (registrados en app.py)
- [ ] 11.4 Flujo completo: Catálogo → Agregar al carrito → Carrito → Checkout → Confirmación → Mis Pedidos → Detalle (requiere DB con datos)
- [ ] 11.5 Transiciones FSM funcionando: PENDIENTE → CONFIRMADO → EN_PREPARACION → EN_CAMINO → ENTREGADO (requiere DB)
- [ ] 11.6 Cancelación desde PENDIENTE y CONFIRMADO con restauración de stock (requiere DB)
- [ ] 11.7 Verificar que cliente solo ve sus propios pedidos (requiere DB)
