## Context

La página principal actual (`HomePage.tsx`) es un placeholder con 4 líneas de contenido. El sistema se identifica como "Food Store" en header, footer y title, pero la marca real del negocio es **BigPepper**. No existe hero visual, slogan, ni propuesta de valor en la landing page.

El design system existe y está tokenizado en `style.css` con la paleta:
- **Primary (Harvest Ochre)**: Tonos terracota/cálidos (#FDF8F3 → #542607)
- **Secondary (Garden Green)**: Tonos verdes naturales (#EDF5F0 → #122B22)
- **Accent (Saffron Gold)**: Dorado cálido (#FEF9F0 → #D4942E)
- **Danger (Seared Crimson)**: Rojo intenso (#FDF2F2 → #380C0C)
- **Surfaces/Text/Borders**: Tonos neutros cálidos

## Goals / Non-Goals

**Goals:**
- Crear un Hero Section memorable que comunique la identidad de BigPepper
- Definir e implementar el slogan de marca: **"El sabor que enciende tu día"**
- Agregar secciones de contenido en la home (categorías destacadas, CTA)
- Actualizar Header, Footer y title con el nombre BigPepper
- Mantener coherencia con la paleta existente (sin nuevos tokens)
- Diseñar para que se sienta como una landing page de restaurante/cocina, no un template genérico

**Non-Goals:**
- NO cambiar la paleta de colores ni agregar nuevos tokens CSS
- NO modificar el layout general (Header/Footer siguen igual, solo cambia texto)
- NO tocar backend ni APIs
- NO cambiar el routing ni la estructura de la app

## Decisions

### ADR-1: Slogan de marca
**Decisión**: "**BigPepper — El sabor que enciende tu día**"
**Razonamiento**: "Pepper" evoca picante/calor → "enciende". "Big" → ambición, día completo. El slogan conecta el nombre con una experiencia emocional positiva (sabor, energía, calidez). Se alinea con la paleta Harvest Ochre (naranja/terracota = fuego, calor).
**Alternativas consideradas**:
- "Sazona tu vida con BigPepper" → más genérico, menos potente
- "El fuego del sabor" → muy agresivo para una tienda de comida general

### ADR-2: Hero visual con gradiente oscuro
**Decisión**: Hero section con fondo gradiente `primary-800` → `primary-900` + overlay de patrón sutil, texto en blanco/primary-100, CTA con accent-500.
**Razonamiento**: El contraste de texto claro sobre fondo oscuro terracota crea una atmósfera cálida y sofisticada. La gradiente da profundidad sin necesidad de imágenes. El CTA en Saffron Gold (accent-500) contrasta fuertemente sin romper la paleta.
**Alternativa considerada**: Hero con imagen de fondo → requiere asset gráfico, más mantenimiento, puede verse genérico.

### ADR-3: Secciones modulares en la Home
**Decisión**: La HomePage se compone de secciones independientes para facilitar mantenimiento:
- `HomeHero` — Hero principal con marca + slogan + CTA
- `FeaturedCategories` — Grid de categorías destacadas con iconos/emojis
- `HomeCTA` — Banner secundario con llamado a la acción
**Razonamiento**: Componentes separados son más fáciles de mantener, testear y reordenar. No merecen archivos propios (son pequeños), pero van en el mismo `HomePage.tsx` con secciones claras.

## Visual Design Direction

### Hero Section
```
┌──────────────────────────────────────────────────────┐
│  [Gradiente primary-800 → primary-900 + patrón]      │
│                                                      │
│           🥘  BigPepper                              │
│       El sabor que enciende tu día                   │
│                                                      │
│   Productos frescos, sabores auténticos.             │
│   De la cocina a tu puerta.                          │
│                                                      │
│   [  Explorar Catálogo  →  ]                        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Featured Categories Section
```
┌──────────────────────────────────────────────────────┐
│  Categorías destacadas                               │
│                                                      │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐           │
│  │ 🍕   │  │ 🥗   │  │ 🥩   │  │ 🍰   │           │
│  │Pizza │  │Ensal.│  │Carnes│  │Postre│           │
│  └──────┘  └──────┘  └──────┘  └──────┘           │
│                                                      │
│  [Ver todas las categorías]                         │
└──────────────────────────────────────────────────────┘
```

### Typography Usage
- **Headline (BigPepper)**: `headline-lg` (2rem, bold 700)
- **Slogan**: `headline-md` (1.5rem, weight 600) en primary-200
- **Subtitle**: `body-lg` (1rem) en primary-100/white
- **Section titles**: `headline-md` con color-text-primary

## Risks / Trade-offs

- [Hero muy textual] → Podría necesitar imágenes en el futuro. Se diseña con espacio预留 para agregar un fondo visual sin cambiar layout.
- [Slogan no resuena] → El slogan es fácilmente reemplazable en `HomePage.tsx`. Es texto plano, no un asset gráfico.
- [Regresión en otras páginas] → Solo se tocan HomePage, Header, Footer. El router y demás páginas quedan intactas.
- [Contraste hero oscuro] → Ya verificado: primary-800 (#703B14) con texto blanco cumple WCAG AA (ratio > 4.5:1).

## Open Questions

- ¿Las categorías destacadas se cargan desde la API o son estáticas? → Por ahora estáticas (emojis + nombres hardcodeados). En un futuro cambio se puede conectar a `/api/categorias`.
