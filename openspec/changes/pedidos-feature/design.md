## Context

El backend ya tiene los modelos SQLModel (Pedido, DetallePedido, EstadoPedido, HistorialEstadoPedido, Pago, FormaPago) y los schemas Pydantic completos en `modules/pedidos/schemas.py`. El frontend tiene los stores de Zustand (cartStore con persistencia, paymentStore para checkout). Sin embargo, no existe la lógica de negocio para crear pedidos, transicionar estados, ni las pantallas de frontend.

### Estado Actual
```
Backend:  models ✅  schemas ✅  repository ❌  service ❌  router ❌
Frontend: cartStore ✅  paymentStore ✅  pages ❌  api hooks ❌
```

## Goals / Non-Goals

**Goals:**
- Implementar el módulo backend de pedidos con repository, service y router
- Implementar la FSM con 6 estados y validación de transiciones
- Creación atómica de pedidos con snapshots de precio y dirección
- Validación de stock con SELECT FOR UPDATE dentro de la transacción
- Decremento/restauración de stock atómico al confirmar/cancelar
- Historial de estados append-only con registro de actor
- Frontend: flujo carrito → checkout → pedidos completo
- Endpoints públicos (cliente ve solo sus pedidos) y de gestión (PEDIDOS/ADMIN)

**Non-Goals:**
- Integración real con MercadoPago (webhook, creación de preferencia) — va en change #5
- Módulo de direcciones de entrega — se asume que existe o se usa direccion_id directamente
- Panel admin de pedidos completo con métricas — eso va en change #6 (admin-panel)
- Testing automatizado — se hará en un change dedicado de testing

## Decisions

### D1: Arquitectura del módulo — Patrón Repository + Service
**Decisión**: Seguir el mismo patrón que `productos/`, `categorias/` e `ingredientes/`: Repository con session directa, Service con lógica de negocio, Router con FastAPI Depends.
**Alternativa considerada**: Unit of Work patrón. Se descarta porque no existe en el código base y todos los módulos existentes usan `session.commit()` directo en el service.
**Consecuencia**: Consistencia con el resto del código base.

### D2: FSM Engine — Transiciones explícitas
**Decisión**: Implementar la FSM como un diccionario de transiciones permitidas en el service:
```python
TRANSICIONES = {
    "PENDIENTE": ["CONFIRMADO", "CANCELADO"],
    "CONFIRMADO": ["EN_PREPARACION", "CANCELADO"],
    "EN_PREPARACION": ["EN_CAMINO", "CANCELADO"],
    "EN_CAMINO": ["ENTREGADO"],
    "ENTREGADO": [],       # terminal
    "CANCELADO": [],       # terminal
}
```
La transición PENDIENTE→CONFIRMADO solo puede ejecutarla el sistema (webhook), no un usuario manual.
**Alternativa considerada**: State Machine library (transitions, python-statemachine). Se descarta por simplicidad y porque la FSM es lineal y predecible.
**Consecuencia**: Fácil de entender y debuggear.

### D3: Validación de stock — SELECT FOR UPDATE
**Decisión**: Dentro de la transacción de creación/confirmación, usar `ProductoRepository` con `with_for_update()` para bloquear las filas de productos y evitar race conditions.
**Alternativa considerada**: Lock optimista con versión. Se descarta porque en un e-commerce con alta concurrencia, el lock pesimista es más seguro.
**Consecuencia**: Garantiza consistencia del stock incluso bajo carga concurrente.

### D4: Snapshots — Copia al momento de creación
**Decisión**: Al crear el pedido, copiar `producto.precio_base` a `DetallePedido.precio_snapshot` y serializar la dirección a `Pedido.direccion_snapshot`. Los snapshots son inmutables.
**Alternativa considerada**: Foreign keys a productos y direcciones. Se descarta porque viola RN-DA06 (cambios futuros no deben afectar pedidos existentes).
**Consecuencia**: Los pedidos históricos mantienen su valor original aunque cambien precios o direcciones.

### D5: Separación de endpoints — Cliente vs Gestión
**Decisión**: Dos grupos de endpoints:
- `/api/pedidos` — para clientes autenticados (filtrados por userId del JWT)
- `/api/admin/pedidos` — para roles PEDIDOS/ADMIN (todos los pedidos, transiciones)
**Alternativa considerada**: Un solo grupo con query params. Se descarta porque mezcla lógica de autorización y hace el router más complejo.
**Consecuencia**: Clara separación de responsabilidades y permisos.

### D6: Transición PENDIENTE→CONFIRMADO — Endpoint admin temporal
**Decisión**: Mientras no exista el webhook de MercadoPago (change #5), se expone un endpoint `PATCH /api/admin/pedidos/{id}/estado` que permite a PEDIDOS/ADMIN avanzar el estado manualmente. Esto incluye PENDIENTE→CONFIRMADO para poder testear el flujo completo. Cuando llegue el webhook, se agregará la transición automática y la manual quedará solo para administración.
**Alternativa considerada**: Dejar PENDIENTE→CONFIRMADO sin posibilidad de testear. Se descarta porque bloquearía el desarrollo frontend.
**Consecuencia**: Permite desarrollo paralelo, se ajusta cuando llegue el change de pagos.

### D7: Frontend — React Router con lazy loading
**Decisión**: Las nuevas páginas (CartPage, CheckoutPage, OrdersPage, OrderDetailPage) se agregan al router existente con lazy loading (`React.lazy` + Suspense).
**Alternativa considerada**: Carga eager. Se descarta porque aumenta el bundle inicial innecesariamente.
**Consecuencia**: Mejor performance inicial, código dividido por ruta.

## API Contracts

### Endpoints Públicos (Cliente autenticado — `/api/pedidos`)

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/pedidos` | CLIENT | Crear pedido desde carrito |
| GET | `/api/pedidos` | CLIENT | Listar mis pedidos (paginado, filtro por estado) |
| GET | `/api/pedidos/{id}` | CLIENT | Ver detalle de mi pedido |
| GET | `/api/pedidos/{id}/historial` | CLIENT | Ver historial de estados de mi pedido |

### Endpoints de Gestión (PEDIDOS/ADMIN — `/api/admin/pedidos`)

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/admin/pedidos` | PEDIDOS/ADMIN | Listar todos los pedidos (paginado, filtros) |
| GET | `/api/admin/pedidos/{id}` | PEDIDOS/ADMIN | Ver detalle de cualquier pedido |
| PATCH | `/api/admin/pedidos/{id}/estado` | PEDIDOS/ADMIN | Avanzar estado (FSM) |
| GET | `/api/admin/pedidos/{id}/historial` | PEDIDOS/ADMIN | Ver historial de cualquier pedido |

### Contractos Request/Response

**POST /api/pedidos**
```json
{
  "direccion_id": 1,
  "forma_pago_codigo": "MERCADOPAGO",
  "costo_envio": 50.0,
  "detalles": [
    {
      "producto_id": 5,
      "cantidad": 2,
      "personalizacion": [3]
    }
  ]
}
```
Response: PedidoRead (con detalles, snapshots, estado PENDIENTE)

**PATCH /api/admin/pedidos/{id}/estado**
```json
{
  "estado_codigo": "EN_PREPARACION",
  "motivo": "Iniciando preparación"
}
```
Response: PedidoRead (con estado actualizado)

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|-----------|
| Race condition en stock durante alta concurrencia | SELECT FOR UPDATE dentro de la transacción |
| PÉRDIDA de datos si falla creación a medio camino | Todo en una sola transacción con commit al final |
| Usuario cancela pedido confirmado y el stock no se restaura | Restauración atómica en la misma transacción de cancelación |
| Frontend muestra stock desactualizado | TanStack Query con staleTime agresivo (30s) en productos |
| Transiciones inválidas por bug en FSM | Validación en service + tests unitarios de la FSM |
| PEDIDOS→CONFIRMADO manual antes del webhook | Se acepta temporalmente; se restringirá cuando llegue change #5 |

## Open Questions

1. ¿Cómo manejamos la selección de dirección en el checkout si el módulo de direcciones no está implementado? → Usar `direccion_id` como FK directa y mostrar un input de texto como placeholder.
2. ¿Incluimos `costo_envio` calculado o fijo? → Por ahora fijo ($50), configurable en settings después.
3. ¿Las exclusiones de ingredientes se envían como array de IDs en el POST? → Sí, se almacenan en `DetallePedidoIngredienteRemovido`.
