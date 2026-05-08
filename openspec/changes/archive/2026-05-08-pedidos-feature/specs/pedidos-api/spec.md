# Capability: pedidos-api

## Descripción
API REST para la gestión completa de pedidos con máquina de estados (FSM), creación atómica con snapshots, validación de stock, y historial de auditoría append-only.

## ADDED Requirements

### Requirement: Creación atómica de pedido
El sistema SHALL permitir a un cliente autenticado crear un pedido a partir de su carrito, realizando la operación de forma atómica (todo o nada) dentro de una única transacción.

#### Scenario: Creación exitosa
- **WHEN** un cliente autenticado envía `POST /api/pedidos` con direccion_id, forma_pago_codigo, costo_envio y al menos un detalle con producto_id y cantidad
- **THEN** el sistema crea un Pedido en estado PENDIENTE con sus DetallePedido, registra el historial inicial, calcula el total, y retorna el PedidoRead con todos los datos

#### Scenario: Snapshot de precios
- **WHEN** se crea un pedido
- **THEN** cada DetallePedido almacena precio_snapshot (producto.precio_base al momento de creación) y nombre_snapshot

#### Scenario: Snapshot de dirección
- **WHEN** se crea un pedido con direccion_id
- **THEN** el sistema copia los datos de la dirección a direccion_snapshot en formato serializado

#### Scenario: Carrito vacío
- **WHEN** un cliente envía `POST /api/pedidos` sin detalles
- **THEN** el sistema rechaza con error 422 (validación: min_length=1)

#### Scenario: Personalización de ingredientes
- **WHEN** un cliente envía exclusiones de ingredientes en un detalle del pedido
- **THEN** el sistema almacena cada ingrediente removido en DetallePedidoIngredienteRemovido asociado al DetallePedido

### Requirement: Validación de stock con SELECT FOR UPDATE
El sistema SHALL validar el stock disponible de cada producto dentro de la transacción de creación del pedido, usando bloqueo pesimista (SELECT FOR UPDATE).

#### Scenario: Stock suficiente
- **WHEN** todos los productos del pedido tienen stock >= cantidad solicitada
- **THEN** el pedido se crea exitosamente

#### Scenario: Stock insuficiente
- **WHEN** algún producto tiene stock < cantidad solicitada
- **THEN** el sistema rechaza la operación con error 409 indicando qué producto y cuánto stock disponible hay

#### Scenario: Bloqueo concurrente
- **WHEN** dos usuarios intentan comprar el mismo producto simultáneamente
- **THEN** el SELECT FOR UPDATE asegura que solo uno complete la transacción

### Requirement: Listado de pedidos del cliente
El sistema SHALL permitir a un cliente autenticado listar sus propios pedidos con paginación y filtro opcional por estado.

#### Scenario: Listado paginado
- **WHEN** un cliente envía `GET /api/pedidos?page=1&page_size=10`
- **THEN** el sistema retorna sus pedidos ordenados por fecha descendente, con total de registros para paginación

#### Scenario: Filtro por estado
- **WHEN** un cliente envía `GET /api/pedidos?estado=PENDIENTE`
- **THEN** el sistema retorna solo sus pedidos en ese estado

#### Scenario: Solo pedidos propios
- **WHEN** un cliente autenticado lista pedidos
- **THEN** el sistema filtra automáticamente por su usuario_id (no puede ver pedidos de otros)

### Requirement: Detalle de pedido (cliente)
El sistema SHALL permitir a un cliente ver el detalle completo de uno de sus pedidos.

#### Scenario: Detalle exitoso
- **WHEN** un cliente envía `GET /api/pedidos/{id}` con un ID de su propiedad
- **THEN** el sistema retorna el PedidoRead con detalles, estado, forma_pago, dirección snapshot

#### Scenario: Pedido de otro usuario
- **WHEN** un cliente intenta ver un pedido que no le pertenece
- **THEN** el sistema retorna 403 Forbidden

#### Scenario: Pedido inexistente
- **WHEN** un cliente envía `GET /api/pedidos/{id}` con un ID que no existe
- **THEN** el sistema retorna 404 Not Found

### Requirement: Máquina de Estados (FSM)
El sistema SHALL implementar una máquina de estados con 6 estados y transiciones restringidas según el mapa de transiciones permitidas.

#### Scenario: Transición válida
- **WHEN** un gestor de pedidos envía `PATCH /api/admin/pedidos/{id}/estado` con un estado_codigo válido según la FSM
- **THEN** el sistema actualiza el estado del pedido, registra el cambio en HistorialEstadoPedido, y retorna el pedido actualizado

#### Scenario: Transición inválida (salto)
- **WHEN** un gestor intenta pasar de PENDIENTE a EN_CAMINO
- **THEN** el sistema rechaza con error 400 indicando que la transición no está permitida

#### Scenario: Transición desde estado terminal
- **WHEN** un gestor intenta cambiar el estado de un pedido ENTREGADO o CANCELADO
- **THEN** el sistema rechaza con error 400 indicando que es un estado terminal

#### Scenario: Sin autenticación
- **WHEN** un usuario no autenticado intenta cambiar el estado
- **THEN** el sistema retorna 401 Unauthorized

#### Scenario: Sin permisos
- **WHEN** un cliente (rol CLIENT) intenta cambiar el estado
- **THEN** el sistema retorna 403 Forbidden

### Requirement: Decremento de stock al confirmar
El sistema SHALL decrementar el stock de cada producto de forma atómica cuando un pedido pasa a CONFIRMADO.

#### Scenario: Decremento exitoso
- **WHEN** un pedido PENDIENTE transiciona a CONFIRMADO
- **THEN** el sistema decrementa stock_cantidad de cada producto en la cantidad del detalle

#### Scenario: Decremento fallido
- **WHEN** el decremento de stock falla para algún producto
- **THEN** toda la operación se revierte (rollback) y el pedido permanece PENDIENTE

### Requirement: Restauración de stock al cancelar
El sistema SHALL restaurar el stock de cada producto cuando un pedido CONFIRMADO es cancelado.

#### Scenario: Restauración exitosa
- **WHEN** un pedido CONFIRMADO transiciona a CANCELADO
- **THEN** el sistema incrementa stock_cantidad de cada producto en la cantidad del detalle

#### Scenario: Cancelación sin restauración
- **WHEN** un pedido PENDIENTE (no confirmado) es cancelado
- **THEN** el sistema NO modifica el stock (nunca se decrementó)

### Requirement: Historial append-only
El sistema SHALL registrar cada cambio de estado en HistorialEstadoPedido de forma append-only (solo INSERT, nunca UPDATE ni DELETE).

#### Scenario: Registro de transición
- **WHEN** ocurre cualquier cambio de estado
- **THEN** el sistema inserta un registro en HistorialEstadoPedido con: pedido_id, estado_desde, estado_hacia, usuario_id (o null para sistema), observación, creado_en

#### Scenario: Registro inicial
- **WHEN** se crea un pedido
- **THEN** el sistema inserta el registro inicial con estado_desde=null y estado_hacia="PENDIENTE"

#### Scenario: Consulta de historial
- **WHEN** un usuario autorizado consulta `GET /api/pedidos/{id}/historial`
- **THEN** el sistema retorna todos los registros ordenados cronológicamente

### Requirement: Transición PENDIENTE→CONFIRMADO restringida
El sistema SHALL permitir la transición PENDIENTE→CONFIRMADO solo para usuarios con rol ADMIN (como reemplazo temporal hasta que el webhook de MercadoPago esté implementado en change #5).

#### Scenario: Admin confirma pedido
- **WHEN** un ADMIN envía PATCH con estado_codigo=CONFIRMADO sobre un pedido PENDIENTE
- **THEN** el sistema transiciona el pedido y decrementa el stock

#### Scenario: Gestor de Pedidos no puede confirmar
- **WHEN** un usuario con rol PEDIDOS intenta la transición PENDIENTE→CONFIRMADO
- **THEN** el sistema rechaza con error 403

## Reglas de Negocio

- RN-PE01: Creación atómica (todo o nada)
- RN-PE02: Snapshot de precio en DetallePedido
- RN-PE03: Snapshot de dirección en Pedido
- RN-PE04: Validar stock con SELECT FOR UPDATE
- RN-FS01: Solo siguiente estado en secuencia
- RN-FS02: PENDIENTE→CONFIRMADO solo automático (temporal: solo ADMIN)
- RN-FS03: Decrementar stock al confirmar
- RN-FS04: Restaurar stock al cancelar confirmado
- RN-FS05: Estados terminales son finales
- RN-FS06: Historial append-only (solo INSERT)
- RN-FS07: Cancelación por rol específico
