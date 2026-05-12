## Context

El sistema tiene 8 módulos backend funcionales (auth, usuarios, categorias, ingredientes, productos, pedidos, pagos, direcciones) pero no existe un panel de administración. Los endpoints de pedidos ya tienen un `admin_router` en `/api/v1/admin/pedidos/`, y los endpoints de catálogo ya aceptan rol ADMIN. Lo que falta es:

1. **Backend**: Endpoints para CRUD de usuarios desde admin + métricas/dashboard
2. **Frontend**: Layout admin con sidebar, páginas de gestión, dashboard con gráficos

La rúbrica del proyecto asigna **15 puntos** exclusivamente al "Frontend — Panel Admin" (dashboard KPIs + recharts, CRUDs, gestión pedidos con FSM, gestión stock), por lo que es un entregable crítico.

## Goals / Non-Goals

**Goals:**
- Implementar módulo backend `admin/` con endpoints de usuarios (listar, editar rol, desactivar)
- Implementar endpoints de métricas: resumen, ventas por período, top productos, pedidos por estado
- Crear layout admin con sidebar responsive y navegación por rol
- Crear Dashboard page con KPIs y 3 gráficos recharts (ventas línea, top productos barras, pedidos torta)
- Crear Admin Usuarios page (listado, editar rol, activar/desactivar)
- Crear Admin Pedidos page (listado, cambiar estado FSM, detalle)
- Crear Admin Catálogo/Stock page (productos, stock, disponibilidad)
- Implementar guards de ruta por rol en secciones admin

**Non-Goals:**
- No se modifica el modelo de datos existente (Usuario ya tiene campo `credo_activo` y soft delete)
- No se implementa configuración del sistema (EPIC 18 — US-060, prioridad baja)
- No se implementan notificaciones push en tiempo real
- No se modifican los endpoints existentes de pedidos admin
- No se implementa exportación de datos (CSV/Excel)

## Decisions

### ADR-01: Módulo admin backend sin modelo propio
- **Decisión**: El módulo `admin/` NO tiene modelo propio. Usa schemas para request/response y opera sobre los repositorios existentes (UsuarioRepository, PedidoRepository, ProductoRepository, etc.)
- **Alternativa considerada**: Crear modelos específicos de admin
- **Razón**: El admin es una capa de orquestación sobre los dominios existentes, no un dominio nuevo. Reutilizar repositorios evita duplicación y garantiza consistencia.

### ADR-02: Métricas con queries SQL de agregación
- **Decisión**: Usar SQLModel con queries raw (text()) para las métricas, ya que requieren GROUP BY, DATE_TRUNC y agregaciones que SQLModel no soporta bien
- **Alternativa considerada**: ORM queries
- **Razón**: Las métricas son consultas complejas de solo lectura (SELECT). Usar SQL directo es más simple, predecible y performante.

### ADR-03: Sidebar admin vs Header unificado
- **Decisión**: Sidebar vertical fijo a la izquierda para todas las páginas admin, separado del layout público
- **Alternativa considerada**: Menú desplegable en el header existente
- **Razón**: Las apps admin con muchas secciones se benefician de un sidebar persistente. El layout público (catálogo, carrito, checkout) mantiene su header actual.

### ADR-04: Admin API con prefijo único /api/v1/admin/
- **Decisión**: Todos los endpoints admin bajo `/api/v1/admin/` (usuarios, métricas)
- **Alternativa considerada**: Dispersar endpoints en módulos existentes
- **Razón**: Consistencia con el admin_router de pedidos existente. Agrupa toda la funcionalidad admin bajo un namespace claro para seguridad (rate limiting, logging, auditoría).

### ADR-05: Estado del dashboard con TanStack Query (no Zustand)
- **Decisión**: Los datos del dashboard se cargan con TanStack Query (useQuery), no se persisten en Zustand
- **Alternativa considerada**: Store Zustand con data del dashboard
- **Razón**: Los datos del dashboard son estado del servidor, no del cliente. TanStack Query maneja caché, refetch y stale-while-revalidate automáticamente.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| [R01] Queries de métricas lentas con muchos datos | Índices en pedidos (creado_en, estado_codigo) y detalles_pedido (producto_id). LIMIT en top productos |
| [R02] Admin desactiva su propia cuenta | Validación en backend: no permitir desactivar el último ADMIN. No permitir auto-desactivación |
| [R03] Sidebar admin no es responsive | Usar Tailwind: sidebar colapsable en mobile, drawer overlay con toggle |
| [R04] Roles mixtos (usuario con múltiples roles) | El guard de ruta verifica al menos un rol permitido (OR lógico) |
