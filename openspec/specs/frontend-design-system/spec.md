## ADDED Requirements

### Requirement: Design tokens aplicados globalmente
El frontend SHALL usar los tokens CSS definidos en `frontend/src/style.css` mediante `@theme` de Tailwind v4 como única fuente de verdad para colores, tipografía, sombras y radios.

#### Scenario: Tokens existentes en style.css
- **WHEN** se inspecciona `frontend/src/style.css`
- **THEN** el archivo SHALL contener un bloque `@theme` con los tokens de color `primary-*`, `secondary-*`, `accent-*`, `danger-*`, `surface-*`, `text-*`, `border-*`, `shadow-ambient`, `radius-*` y `font-family-sans`

### Requirement: Paleta Harvest Ochre para acciones primarias
Todos los componentes SHALL usar `primary-500` (Harvest Ochre) como color de acción principal, reemplazando `blue-600`.

#### Scenario: Botón primary
- **WHEN** un botón tiene `variant="primary"`
- **THEN** SHALL tener `bg-primary-500` con hover `bg-primary-600` y focus ring `ring-primary-400`

#### Scenario: Links de navegación
- **WHEN** un link de navegación está activo
- **THEN** SHALL usar `text-primary-500` en lugar de `text-blue-600`

#### Scenario: Focus rings en inputs
- **WHEN** un input recibe foco
- **THEN** SHALL mostrar `ring-2 ring-primary-400 ring-offset-2` en lugar de `ring-blue-500`

### Requirement: Paleta Seared Crimson para errores y peligro
Todos los componentes SHALL usar `danger-500` (Seared Crimson) para estados de error, cancelación y acciones destructivas, reemplazando `red-600`.

#### Scenario: Botón danger
- **WHEN** un botón tiene `variant="danger"`
- **THEN** SHALL tener `bg-danger-500` con hover `bg-danger-600`

#### Scenario: Mensajes de error
- **WHEN** se muestra un mensaje de error
- **THEN** SHALL usar `bg-danger-50 border-danger-200 text-danger-600` en lugar de `bg-red-50 border-red-200 text-red-600`

### Requirement: Paleta Garden Green para éxito y stock
Los estados de éxito y stock SHALL usar `secondary-500` (Garden Green), reemplazando `green-500`.

#### Scenario: Badge de activo/stock suficiente
- **WHEN** un item está activo o tiene stock
- **THEN** SHALL mostrar `text-secondary-600` y punto indicador `bg-secondary-500`

#### Scenario: Toast de éxito
- **WHEN** se muestra un toast de tipo success
- **THEN** SHALL usar `bg-secondary-50 border-secondary-200 text-secondary-600`

### Requirement: Paleta Saffron Gold para advertencias
Los estados de advertencia y highlight SHALL usar `accent-500` (Saffron Gold), reemplazando `yellow-500`.

#### Scenario: Badge pendiente
- **WHEN** un pedido tiene estado PENDIENTE
- **THEN** SHALL mostrar badge con `bg-accent-100 text-accent-600`

### Requirement: Surface off-white cálido
El fondo principal de la aplicación SHALL ser `bg-surface` (#FDFBF9, off-white cálido) en lugar de `bg-white` o `bg-gray-50`.

#### Scenario: Fondo de página
- **WHEN** se renderiza una página de cliente
- **THEN** el contenedor principal SHALL usar `bg-surface`

#### Scenario: Cards
- **WHEN** se renderiza una card
- **THEN** SHALL usar `bg-white` con `border border-border-default`

### Requirement: Sidebar con paleta Harvest Ochre
El sidebar administrativo SHALL usar la paleta Harvest Ochre profunda (`primary-800/700`) en lugar de `gray-900/800`.

#### Scenario: Sidebar en AdminLayout
- **WHEN** se renderiza la barra lateral de admin
- **THEN** SHALL tener `bg-primary-800` con items inactivos en `text-primary-200`, hover en `hover:bg-primary-700/50 text-white`, y active en `bg-primary-600/80 text-white`

### Requirement: Badges de estado con paleta de marca
Los badges de estado de pedido y roles SHALL usar colores de la paleta en lugar de colores genéricos.

#### Scenario: Estados de pedido mapeados
- **WHEN** se muestra un badge de estado de pedido
- **THEN** SHALL usar: PENDIENTE → accent, CONFIRMADO → primary, EN_PREPARACION → secondary, EN_CAMINO → primary, ENTREGADO → secondary, CANCELADO → danger

### Requirement: Tipografía Inter
Toda la aplicación SHALL usar la fuente Inter con la escala tipográfica definida en los tokens.

#### Scenario: Headings
- **WHEN** se renderiza un título de página (h1)
- **THEN** SHALL usar `text-headline-lg font-headline-lg`

#### Scenario: Body text
- **WHEN** se renderiza texto de cuerpo
- **THEN** SHALL usar `text-body-lg` o `text-body-md`
