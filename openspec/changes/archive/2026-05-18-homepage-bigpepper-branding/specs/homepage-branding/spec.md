# Homepage Branding

> Identidad visual de BigPepper en la landing page principal.

## ADDED Requirements

### Requirement: Hero section con identidad de marca
La landing page SHALL mostrar un hero section que comunique la identidad de BigPepper con nombre de marca y slogan.

#### Scenario: Visualización del hero
- **WHEN** un visitante accede a la página principal (`/`)
- **THEN** el hero SHALL mostrar el nombre "BigPepper" en forma prominente
- **THEN** el hero SHALL mostrar el slogan "El sabor que enciende tu día"
- **THEN** el hero SHALL mostrar un subtítulo con la propuesta de valor
- **THEN** el hero SHALL incluir un CTA button "Explorar Catálogo" que navegue a `/catalogo`

### Requirement: Header con nombre de marca
El header SHALL identificar la marca como "BigPepper" en lugar de "Food Store".

#### Scenario: Identidad en navegación
- **WHEN** un usuario navega cualquier página del sitio
- **THEN** el header SHALL mostrar "BigPepper" como nombre del sitio
- **THEN** el logo/texto de marca SHALL usar la paleta Harvest Ochre (primary-500)

### Requirement: Footer con marca
El footer SHALL mostrar el nombre de marca BigPepper.

#### Scenario: Identidad en footer
- **WHEN** un usuario ve el footer
- **THEN** el footer SHALL mostrar "BigPepper © {año}" o similar con la marca

### Requirement: Title del sitio
El title del documento HTML SHALL reflejar la marca BigPepper.

#### Scenario: Identidad en pestaña del navegador
- **WHEN** un usuario abre el sitio
- **THEN** el title de la pestaña SHALL mostrar "BigPepper — El sabor que enciende tu día"

### Requirement: Sección de categorías destacadas
La landing page SHALL mostrar una sección de categorías destacadas para facilitar la navegación.

#### Scenario: Categorías visibles
- **WHEN** un visitante hace scroll debajo del hero
- **THEN** SHALL mostrar un grid de categorías destacadas con iconos y nombres
- **THEN** cada categoría SHALL ser clickeable llevando al catálogo filtrado
