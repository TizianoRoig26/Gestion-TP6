## Why

El flujo de pedidos es el núcleo transaccional del e-commerce. Actualmente existen los modelos DB y schemas Pydantic de pedidos (creados en setup-infra-backend), pero no hay lógica de negocio: no se pueden crear pedidos, no existe la máquina de estados (FSM), y el frontend no tiene pantallas de carrito, checkout ni listado de pedidos. Sin esto, la plataforma no puede procesar ventas.

## What Changes

- **Backend**: Nuevo módulo `pedidos/` completo con repository, service y router
- **Máquina de Estados (FSM)**: Implementación de la FSM de 6 estados con transiciones validadas
- **Frontend**: Flujo completo de carrito → checkout → pedidos (pantallas y componentes)
- **Snapshots**: Captura de precio y dirección al crear pedido (inmutabilidad histórica)
- **Stock**: Decremento atómico al confirmar, restauración al cancelar
- **Auditoría**: Historial de estados append-only con registro de actor y motivo
- **Routing**: Endpoints públicos para clientes y endpoints de gestión para roles PEDIDOS/ADMIN

## Capabilities

### New Capabilities
- `pedidos-api`: API REST de pedidos con creación atómica, FSM con 6 estados, historial append-only, snapshots y gestión de stock
- `pedidos-ui`: Interfaz de usuario para el flujo completo: carrito, checkout, listado de pedidos, detalle con timeline de estados

### Modified Capabilities
- `pedidos`: Actualización de la spec existente para reflejar la implementación completa (FSM, endpoints, reglas de negocio)

## Impact

- **Backend**: Nuevo módulo `backend/modules/pedidos/` con 3 archivos (repository, service, router) + registro en `app.py`
- **Frontend**: Nuevas páginas en `pages/`, componentes en `features/`, hooks API en `shared/api/`, rutas en `app/router.tsx`, navegación en `widgets/Header.tsx`
- **Base de datos**: Los modelos ya existen en `db/models.py` — no requiere migraciones
- **Dependencias**: El módulo depende de `productos` (validación de stock), `direcciones` (snapshot de dirección), `auth` (autenticación y roles)
- **No breaking**: Todos los endpoints nuevos, no modifica API existente

## Historias de Usuario

Implementa las siguientes EPIC y US de `docs/Historias_de_usuario.md`:
- **EPIC 09 — Validaciones Pre-Checkout**: US-069 (validar disponibilidad), US-070 (verificar precios)
- **EPIC 10 — Creación de Pedidos**: US-035 (crear pedido atómico), US-036 (validar stock), US-037 (snapshot precios), US-038 (snapshot dirección)
- **EPIC 11 — Pagos MercadoPago**: US-047 (consultar estado de pago) — solo lectura, el flujo completo de pago va en change #5
- **EPIC 12 — Máquina de Estados (FSM)**: US-039 a US-044 (transiciones, cancelación, historial)
- **EPIC 13 — Visualización de Pedidos**: US-049 (mis pedidos), US-050 (detalle de pedido), US-051 (todos los pedidos - gestor), US-052 (detalle admin)
- **EPIC 14 — Notificaciones y Feedback UX**: US-071 (confirmación de pedido), US-072 (feedback de pago)

## Dependencias

- **setup-infra-backend** (#1) — modelos DB, schemas, auth, roles
- **setup-frontend** (#2) — stores, routing, guards
- **catalogo-crud** (#3) — productos para validar stock y snapshots de precio

## Definition of Done

- [ ] Backend: endpoint `POST /api/pedidos` crea pedido atómico con snapshots
- [ ] Backend: validación de stock con SELECT FOR UPDATE dentro de la transacción
- [ ] Backend: FSM implementada con todas las transiciones validadas
- [ ] Backend: decremento de stock al confirmar y restauración al cancelar
- [ ] Backend: historial append-only con registro de actor
- [ ] Backend: endpoints públicos (cliente ve solo sus pedidos) y de gestión (PEDIDOS/ADMIN ven todos)
- [ ] Frontend: carrito funcional con persistencia y personalización
- [ ] Frontend: checkout con selección de dirección y confirmación
- [ ] Frontend: listado de pedidos del cliente con filtro por estado
- [ ] Frontend: detalle de pedido con timeline visual de estados
- [ ] Frontend: feedback visual de creación y cambio de estados
- [ ] Todo commiteado y change archivado
