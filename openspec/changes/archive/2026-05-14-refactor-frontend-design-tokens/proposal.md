## Why

El frontend usa colores genéricos de Tailwind (blue-600, gray-800, red-500, green-500) que no reflejan la identidad de marca de Food Store. Esto genera una experiencia visual inconsistente y genérica. Se necesita migrar a una paleta cromática propia (Harvest Ochre, Garden Green, Saffron Gold, Seared Crimson) con tipografía Inter, elevación flat-plus, y surface off-white cálido — todo definido en `docs/Design.md` y tokenizado en `style.css` mediante `@theme` de Tailwind v4.

## What Changes

- Migrar todos los `bg-blue-*` / `text-blue-*` / `focus:ring-blue-*` a `primary-*` (Harvest Ochre)
- Migrar todos los `bg-red-*` / `text-red-*` / `border-red-*` a `danger-*` (Seared Crimson)
- Migrar todos los `bg-green-*` / `text-green-*` a `secondary-*` (Garden Green)
- Migrar todos los `bg-yellow-*` / `text-yellow-*` / `border-yellow-*` a `accent-*` (Saffron Gold)
- Migrar `text-gray-900/800/700` → `text-text-primary`, `text-gray-600/500` → `text-text-secondary`, `text-gray-400/300` → `text-text-tertiary`/`text-text-disabled`
- Migrar `bg-gray-50/100/200` → `surface-secondary`/`surface-tertiary`
- Migrar `border-gray-100/200/300` → `border-subtle`/`border-default`
- Sidebar y footer: `bg-gray-800/900` → `bg-primary-700/800` (paleta Harvest Ochre profunda)
- Botones: variantes primary/danger/ghost con colores de paleta
- Inputs: focus ring `primary-400` en lugar de `blue-500`
- Badges de estado y roles con colores de paleta translúcidos
- Sin cambios de layout, estructura DOM ni lógica de negocio

## Capabilities

### New Capabilities
- `frontend-design-system`: Sistema de diseño visual tokenizado (paleta, tipografía, elevación, radios) aplicado a todos los componentes del frontend

### Modified Capabilities
<!-- Sin cambios de comportamiento en specs existentes — es solo visual -->

## Impact

- **34 archivos frontend** modificados (shared/ui, widgets, features, pages, admin)
- `frontend/src/style.css` ya actualizado con tokens `@theme`
- `docs/Design.md` ya creado como fuente de verdad del diseño
- Cero cambios en backend, API, schemas, o lógica de negocio
- Cero regresiones funcionales esperadas (solo cambios de clases CSS)

## Historias de Usuario

- Como ADMIN, quiero una interfaz con identidad visual propia para sentir que uso una herramienta profesional y no un template genérico
- Como CLIENTE, quiero una experiencia visual cálida y orgánica que refleje la marca gastronómica
- Como DEVELOPER, quiero tokens CSS reutilizables en lugar de clases Tailwind genéricas esparcidas

## Definition of Done

- [ ] Todos los componentes shared/ui tienen clases de paleta
- [ ] Todos los widgets (Header, Footer, AdminLayout) tienen clases de paleta
- [ ] Todas las features (catalog, orders) tienen clases de paleta
- [ ] Todas las pages (cliente + admin) tienen clases de paleta
- [ ] `npx tsc --noEmit` pasa sin errores
- [ ] Sin cambios visibles en layout o estructura DOM
