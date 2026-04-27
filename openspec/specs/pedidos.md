# Capability: Pedidos

## Descripción
Gestión completa de pedidos con máquina de estados (FSM) de 6 estados y audit trail.

## Historias de Usuario
- US-035: Crear pedido
- US-036: Validar stock al crear pedido
- US-037: Snapshot de precios
- US-038: Snapshot de dirección
- US-039: Listar pedidos
- US-040: Ver detalle de pedido
- US-041: Avanzar estado
- US-042: Completar estado terminal
- US-043: Cancelar pedido
- US-044: Ver historial de estados
- US-046: Transición automática por pago

## Stack Tecnológico
- Unit of Work para transacciones atómicas
- PostgreSQL INTEGER[] para personalización
- SQLModel con snapshots

## Reglas de Negocio
- RN-PE01: Creación atómica (UoW)
- RN-PE02: Snapshot de precio en DetallePedido
- RN-PE03: Snapshot de dirección en Pedido
- RN-PE04: Validar stock con SELECT FOR UPDATE
- RN-FS01: Solo siguiente estado en secuencia
- RN-FS02: PENDIENTE→CONFIRMADO es automático
- RN-FS03: Decrementar stock al confirmar
- RN-FS04: Restaurar stock al cancelar confirmado
- RN-FS05: Estados terminales son finales
- RN-FS06: Historial append-only (solo INSERT)
- RN-FS07: Cancelación por rol específico

## Máquina de Estados
```
PENDIENTE → CONFIRMADO → EN_PREPARACIÓN → EN_CAMINO → ENTREGADO
    ↓           ↓              ↓
  CANCELADO ← CANCELADO ← CANCELADO (admin only)
```

## Dependencias
- auth.md (autenticación y roles)
- catalogo.md (productos disponibles)
- pagos.md (confirmación automática)

## Definition of Done
- [ ] Crear pedido atómico con snapshots
- [ ] Validar stock suficiente
- [ ] Máquina de estados funcionando
- [ ] Decrementar stock al confirmar
- [ ] Restaurar stock al cancelar
- [ ] Historial append-only
- [ ] Cancelación por rol correcto

## Recursos
- docs/Descripcion.md (sección 5 - Máquina de Estados)
- docs/Historias_de_usuario.md (EPIC 07, sección Pedidos)
- docs/Integrador.md (sección 3.3, 3.4)