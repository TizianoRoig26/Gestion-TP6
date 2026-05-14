## Context

El frontend de Food Store fue construido con clases utilitarias genéricas de Tailwind (blue-600, gray-800, red-500, green-500, etc.) sin una paleta de marca definida. Como resultado, la interfaz se ve genérica y no refleja la identidad gastronómica del producto.

Ya existe:
- `docs/Design.md` — Sistema de diseño completo con filosofía "Flat-Plus", paleta, tipografía, componentes, elevación y brief de marca
- `frontend/src/style.css` — Tokens `@theme` de Tailwind v4 configurados con la paleta completa

El diseño visual está completamente definido y tokenizado. Falta migrar los ~30 componentes del frontend para usar los nuevos tokens en lugar de las clases genéricas.

## Goals / Non-Goals

**Goals:**
- Migrar todos los componentes frontend a la paleta de marca definida en `docs/Design.md`
- Reemplazar `bg-blue-*`, `text-blue-*`, `focus:ring-blue-*` → `primary-*` (Harvest Ochre)
- Reemplazar `bg-red-*`, `text-red-*`, `border-red-*` → `danger-*` (Seared Crimson)
- Reemplazar `bg-green-*`, `text-green-*` → `secondary-*` (Garden Green)
- Reemplazar `bg-yellow-*`, `border-yellow-*` → `accent-*` (Saffron Gold)
- Reemplazar `text-gray-{900,800,700}` → `text-text-primary`
- Reemplazar `text-gray-{600,500}` → `text-text-secondary`
- Reemplazar `text-gray-{400,300}` → `text-text-tertiary` / `text-text-disabled`
- Reemplazar `bg-gray-{50,100,200}` → `surface-secondary` / `surface-tertiary`
- Reemplazar `border-gray-{100,200,300}` → `border-subtle` / `border-default`
- Migrar sidebar (`bg-gray-900/800`) a paleta Harvest Ochre (`primary-800/700`)
- Migrar footer (`bg-gray-800`) a paleta Harvest Ochre (`primary-800`)

**Non-Goals:**
- NO cambiar layout, estructura DOM ni lógica de negocio
- NO migrar a CSS modules, styled-components, o cualquier otro approach de estilos
- NO cambiar el sistema de build o configuración de Tailwind
- NO tocar backend
- NO resolver errores de TypeScript preexistentes

## Decisions

### ADR-1: Clases directas vs. componentes wrappe
**Decisión**: Reemplazar clases in-situ, sin crear wrapper components.
**Contexto**: Podríamos crear componentes `Button`, `Input`, `Badge` que encapsulen los estilos. Pero ya existen componentes `Button` e `Input` en `shared/ui/` que usan clases directamente.
**Razón**: Menor superficie de cambio. Los componentes existentes se actualizan con las nuevas clases. No se introducen nuevas abstracciones.
**Alternativa considerada**: Crear un sistema de componentes con variantes tipadas — descartado porque duplica trabajo y los componentes ya existen.

### ADR-2: Gray mapping consistente
**Decisión**: Usar tabla de mapeo fija para todas las clases gray.
**Razonamiento**: Para evitar inconsistencia, cada clase gray legacy se mapea a un único token de surface/text/border:
- `text-gray-900/800/700` → `text-text-primary`
- `text-gray-600/500` → `text-text-secondary`
- `text-gray-400` → `text-text-tertiary`
- `text-gray-300` → `text-text-disabled`
- `bg-gray-50` → `bg-surface-secondary`
- `bg-gray-100` → `bg-surface-tertiary`
- `bg-gray-200` → `bg-surface-tertiary` (o `bg-border-default` en contextos de borde)
- `border-gray-100` → `border-border-subtle`
- `border-gray-200` → `border-border-default`
- `border-gray-300` → `border-border-default`

### ADR-3: Sidebar con Harvest Ochre
**Decisión**: Sidebar usa `bg-primary-800` con active `bg-primary-600/80` y hover `hover:bg-primary-700/50`.
**Razonamiento**: La paleta Harvest Ochre (`#703B14` → `#542607`) es lo suficientemente oscura para mantener legibilidad, a la vez que comunica calidez. Se mantienen textos en `primary-200` (inactivo) y `white` (activo/hover).

### ADR-4: Badges de estado y roles con paleta translúcida
**Decisión**: Badges usan `bg-{color}-100 text-{color}-700` mapeados de la paleta.
**Razonamiento**: Mantener el patrón translúcido existente (fondo claro, texto bold) pero con los colores de marca. Ej: estado PENDIENTE pasa de `bg-yellow-100 text-yellow-700` a `bg-accent-100 text-accent-600`.

## Risks / Trade-offs

- [Contraste AA] → Los pares primary-100/text-primary-700 y surface/text-primary fueron verificados en `docs/Design.md` para cumplir AA. Si algún badge no pasa, ajustar tono.
- [Regresión visual] → El cambio de 30+ archivos simultáneamente puede introducir inconsistencias si no se sigue el mapeo exacto. Mitigación: revisión visual post-cambio.
- [Sidebar oscura] → Harvest Ochre es menos oscuro que gray-900. El contraste con texto blanco sigue siendo alto (AA+), pero puede sentirse ligeramente más claro. Aceptado como trade-off por identidad de marca.

## Migration Plan

1. **shared/ui/** (4 archivos) — Button, Input, Toast, ErrorBoundary
2. **widgets/** (5 archivos) — Header, Footer, AdminLayout, Breadcrumbs, CategoryTree
3. **features/catalog/** (5+ archivos) — ProductCard, CategoryFilter, AllergenFilter, Pagination, etc.
4. **features/orders/** (3 archivos) — OrderStatusBadge, OrderCard, OrderTimeline
5. **pages/client/** (7+ archivos) — HomePage, CatalogPage, CartPage, CheckoutPage, etc.
6. **pages/admin/** (5 archivos) — DashboardPage, PedidosPage, CatalogoPage, UsuariosPage, StockPage
7. **Verificación** — `npx tsc --noEmit` para detectar errores
