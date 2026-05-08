# Capability: Pedidos

## Descripción
Gestión completa de pedidos con máquina de estados (FSM) de 6 estados y audit trail.

## ADDED Requirements

### Requirement: Gestión de pedidos para roles PEDIDOS/ADMIN
El sistema SHALL exponer endpoints de administración para que los roles PEDIDOS y ADMIN gestionen todos los pedidos del sistema.

#### Scenario: Listar todos los pedidos
- **WHEN** un usuario con rol PEDIDOS o ADMIN envía `GET /api/admin/pedidos`
- **THEN** el sistema retorna todos los pedidos del sistema con paginación, filtro por estado y búsqueda por nombre de cliente

#### Scenario: Ver detalle de cualquier pedido
- **WHEN** un gestor envía `GET /api/admin/pedidos/{id}`
- **THEN** el sistema retorna el detalle completo incluyendo datos del cliente, items, snapshots, historial de estados y estado de pago

### Requirement: Cancelación por rol específico
El sistema SHALL restringir la cancelación según el estado del pedido y el rol del usuario.

#### Scenario: Cliente cancela pedido PENDIENTE
- **WHEN** un cliente cancela su pedido en estado PENDIENTE
- **THEN** el sistema transiciona a CANCELADO (no requiere restauración de stock)

#### Scenario: Gestor cancela pedido CONFIRMADO
- **WHEN** un gestor de pedidos o admin cancela un pedido CONFIRMADO
- **THEN** el sistema transiciona a CANCELADO y restaura el stock atómicamente

#### Scenario: Solo admin cancela EN_PREPARACION
- **WHEN** un usuario con rol PEDIDOS intenta cancelar un pedido EN_PREPARACION
- **THEN** el sistema rechaza con error 403 (solo ADMIN puede cancelar en este estado)

#### Scenario: Motivo de cancelación obligatorio
- **WHEN** un usuario cancela un pedido
- **THEN** el sistema requiere el campo motivo (obligatorio si estado_codigo = CANCELADO)

## MODIFIED Requirements

### Requirement: Listar pedidos (US-039)
**UPDATE**: Se actualiza para especificar el comportamiento según el rol.

#### Scenario: Cliente lista sus pedidos
- **WHEN** un cliente autenticado envía GET /api/pedidos
- **THEN** el sistema retorna SOLO los pedidos del usuario autenticado, paginados, ordenados por fecha descendente

#### Scenario: Admin lista todos los pedidos
- **WHEN** un ADMIN envía GET /api/admin/pedidos
- **THEN** el sistema retorna TODOS los pedidos con paginación y filtros

### Requirement: Avanzar estado (US-041)
**UPDATE**: Se especifican los roles permitidos para cada transición.

#### Scenario: Gestor avanza estado
- **WHEN** un gestor de pedidos envía PATCH con un estado_codigo válido (CONFIRMADO→EN_PREPARACION→EN_CAMINO→ENTREGADO)
- **THEN** el sistema valida la transición, actualiza el estado y registra el historial

#### Scenario: Transición CONFIRMADO por ADMIN
- **WHEN** un ADMIN envía PATCH con estado_codigo=CONFIRMADO
- **THEN** el sistema ejecuta la transición (temporal, hasta webhook de pagos)

### Requirement: Cancelar pedido (US-043)
**UPDATE**: Se agrega la regla de restauración de stock y motivo obligatorio.

#### Scenario: Cancelación de PENDIENTE
- **WHEN** un cliente o gestor cancela un pedido PENDIENTE
- **THEN** transiciona a CANCELADO, NO se restaura stock (nunca se descontó)

#### Scenario: Cancelación de CONFIRMADO
- **WHEN** un gestor o admin cancela un pedido CONFIRMADO
- **THEN** transiciona a CANCELADO Y se restaura el stock de cada producto

#### Scenario: Motivo requerido
- **WHEN** se cancela un pedido
- **THEN** el campo motivo es obligatorio

### Requirement: Ver historial de estados (US-044)
**UPDATE**: Se especifica el formato del historial.

#### Scenario: Consulta de historial
- **WHEN** un usuario autorizado consulta el historial
- **THEN** retorna lista cronológica con: estado_desde, estado_hacia, timestamp, usuario (o SISTEMA), observación

## Stack Tecnológico
- SQLModel para transacciones atómicas (no hay UoW dedicado)
- PostgreSQL INTEGER[] para personalización (vía tabla DetallePedidoIngredienteRemovido)
- SQLModel con snapshots

## Máquina de Estados
```
PENDIENTE → CONFIRMADO → EN_PREPARACIÓN → EN_CAMINO → ENTREGADO
    ↓           ↓              ↓
  CANCELADO ← CANCELADO ← CANCELADO (admin only)
```

## Dependencias
- auth.md (autenticación y roles)
- catalogo.md (productos disponibles)
- pagos.md (confirmación automática — pendiente, change #5)

## Definition of Done
- [x] Crear pedido atómico con snapshots (spec detallada en pedidos-api)
- [x] Validar stock suficiente (spec detallada en pedidos-api)
- [ ] Máquina de estados funcionando (implementado en pedidos-api)
- [ ] Decrementar stock al confirmar (implementado en pedidos-api)
- [ ] Restaurar stock al cancelar (implementado en pedidos-api)
- [ ] Historial append-only (implementado en pedidos-api)
- [x] Cancelación por rol correcto (spec detallada en pedidos-ui)
