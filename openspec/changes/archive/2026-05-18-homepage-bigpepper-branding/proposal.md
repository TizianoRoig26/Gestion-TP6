## Why

La página principal actual (`HomePage.tsx`) es un placeholder genérico que muestra "Bienvenido a Food Store" sin identidad visual de marca. La tienda se llama **BigPepper** pero el branding no existe en la interfaz. No hay slogan, no hay hero visual, no hay propuesta de valor. La primera impresión que recibe un usuario es plana y sin personalidad.

Además, el sistema se muestra como "Food Store" en el header, footer y title tag, nunca como BigPepper. Esto crea una desconexión entre la identidad del negocio y lo que ve el usuario.

## What Changes

- Rediseñar `HomePage.tsx` con un hero section impactante que incluya:
  - Nombre de marca **BigPepper** con identidad visual
  - Slogan de marca
  - Subtítulo con propuesta de valor
  - CTA principal hacia el catálogo
  - Sección de categorías destacadas / productos sugeridos
- Actualizar `Header.tsx` para mostrar "BigPepper" como nombre de marca (manteniendo la paleta Harvest Ochre)
- Actualizar `Footer.tsx` para mostrar "BigPepper ©"
- Actualizar `index.html` title de "Food Store" a "BigPepper — El sabor que enciende tu día"
- Mantener 100% la paleta de diseño existente (Harvest Ochre, Garden Green, Saffron Gold, Seared Crimson)
- No se toca backend, ni APIs, ni lógica de negocio

## Capabilities

### New Capabilities

- `homepage-branding`: Identidad visual de BigPepper en la landing page — hero, slogan, propuesta de valor, CTAs

### Modified Capabilities

- *(Ninguna — los cambios son puramente visuales/frontend, no modifican requerimientos de specs existentes)*

## Impact

- **Frontend**: `pages/HomePage.tsx` (reescritura completa), `widgets/Header.tsx` (logo/texto), `widgets/Footer.tsx` (texto), `index.html` (title)
- **Backend**: Sin cambios
- **Diseño**: Reutiliza paleta existente de `docs/Design.md` y `style.css`. No se requieren nuevos tokens.
- **No breaking**: No rompe rutas, APIs, contratos existentes

## Historias de Usuario

- **HU-01**: Como visitante, quiero ver una página principal atractiva con el nombre y slogan de BigPepper para identificar inmediatamente la marca.
- **HU-02**: Como visitante, quiero un hero visual con un CTA claro para explorar el catálogo de productos.
- **HU-03**: Como usuario recurrente, quiero ver secciones destacadas en la home para descubrir productos rápidamente.

## Dependencias

- Ninguna. No depende de otros cambios activos.

## Definition of Done

- [ ] HomePage tiene hero section con nombre BigPepper, slogan, y CTA
- [ ] Header muestra "BigPepper" con la paleta Harvest Ochre
- [ ] Footer muestra "BigPepper ©"
- [ ] Title del sitio es "BigPepper — El sabor que enciende tu día"
- [ ] Paleta de colores existente se mantiene sin cambios
- [ ] `tsc --noEmit` pasa sin errores
- [ ] No hay regresión visual en otras páginas
