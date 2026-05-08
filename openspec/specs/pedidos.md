# Capability: Pedidos

## Descripción
Gestión completa de pedidos con máquina de estados (FSM) de 6 estados y audit trail. Incluye API REST (`pedidos-api`) e interfaz de usuario (`pedidos-ui`).

## Historias de Usuario
- US-035: Crear pedido
- US-036: Validar stock al crear pedido
- US-037: Snapshot de precios
- US-038: Snapshot de dirección
- US-039: Listar pedidos (cliente ve solo suyos, admin ve todos)
- US-040: Ver detalle de pedido
- US-041: Avanzar estado (por rol específico)
- US-042: Completar estado terminal
- US-043: Cancelar pedido (por rol, con motivo obligatorio y restauración de stock)
- US-044: Ver historial de estados (cronológico con actor)
- US-046: Transición automática por pago

## Stack Tecnológico
- SQLModel para transacciones atómicas (no hay UoW dedicado)
- PostgreSQL con SELECT FOR UPDATE para bloqueo pesimista de stock
- PostgreSQL INTEGER[] para personalización (vía tabla DetallePedidoIngredienteRemovido)
- SQLModel con snapshots de precio y dirección

## Reglas de Negocio
- RN-PE01: Creación atómica (todo o nada en una transacción)
- RN-PE02: Snapshot de precio en DetallePedido (inmutable)
- RN-PE03: Snapshot de dirección en Pedido (serializada al crear)
- RN-PE04: Validar stock con SELECT FOR UPDATE
- RN-FS01: Solo siguiente estado en secuencia (sin saltos)
- RN-FS02: PENDIENTE→CONFIRMADO solo automático (temporal: solo ADMIN vía endpoint)
- RN-FS03: Decrementar stock al confirmar (con FOR UPDATE)
- RN-FS04: Restaurar stock al cancelar desde CONFIRMADO
- RN-FS05: Estados terminales son finales (ENTREGADO, CANCELADO)
- RN-FS06: Historial append-only (solo INSERT, nunca UPDATE/DELETE)
- RN-FS07: Cancelación por rol específico (CLIENT desde PENDIENTE, PEDIDOS/ADMIN desde CONFIRMADO, solo ADMIN desde EN_PREPARACION)

## Máquina de Estados
```
PENDIENTE → CONFIRMADO → EN_PREPARACIÓN → EN_CAMINO → ENTREGADO
    ↓           ↓              ↓
  CANCELADO ← CANCELADO ← CANCELADO (admin only)
```

### Transiciones y Roles Permitidos
| Transición | Roles Permitidos |
|------------|-----------------|
| PENDIENTE → CONFIRMADO | ADMIN (temporal, hasta webhook MP en change #5) |
| PENDIENTE → CANCELADO | CLIENT (owner), PEDIDOS, ADMIN |
| CONFIRMADO → EN_PREPARACION | PEDIDOS, ADMIN |
| CONFIRMADO → CANCELADO | PEDIDOS, ADMIN |
| EN_PREPARACION → EN_CAMINO | PEDIDOS, ADMIN |
| EN_PREPARACION → CANCELADO | ADMIN (solo) |
| EN_CAMINO → ENTREGADO | PEDIDOS, ADMIN |

## Dependencias
- auth.md (autenticación y roles)
- catalogo.md (productos disponibles)
- pagos.md (confirmación automática — pendiente, change #5)
- pedidos-api/spec.md (especificación detallada de API REST)
- pedidos-ui/spec.md (especificación detallada de interfaz de usuario)

## Sub-capabilities
- **pedidos-api**: API REST con creación atómica, FSM, stock, historial
- **pedidos-ui**: UI de carrito, checkout, listado, detalle con timeline

## Definition of Done
- [x] Crear pedido atómico con snapshots
- [x] Validar stock suficiente con SELECT FOR UPDATE
- [x] Máquina de estados funcionando con 6 estados
- [x] Decrementar stock al confirmar
- [x] Restaurar stock al cancelar (solo desde CONFIRMADO)
- [x] Historial append-only con actor
- [x] Cancelación por rol correcto

## Recursos
- docs/Descripcion.md (sección 5 - Máquina de Estados)
- docs/Historias_de_usuario.md (EPIC 07, sección Pedidos)
- docs/Integrador.md (sección 3.3, 3.4)
