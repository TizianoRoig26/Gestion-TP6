## ADDED Requirements

### Requirement: CatalogPage — Listado de productos
El sistema SHALL mostrar una grilla responsiva de productos con cards, búsqueda, filtros por categoría y alérgenos, y paginación.

#### Scenario: Mostrar productos disponibles
- **WHEN** el usuario navega a `/catalogo`
- **THEN** el sistema muestra una grilla de productos con imagen, nombre, precio y categoría

#### Scenario: Mostrar skeleton loading mientras carga
- **WHEN** el usuario navega a `/catalogo` y los datos aún no cargan
- **THEN** el sistema muestra 6 skeleton cards animadas

#### Scenario: Mostrar empty state
- **WHEN** no hay productos que coincidan con los filtros
- **THEN** el sistema muestra "No encontramos productos" con ilustración y botón "Limpiar filtros"

#### Scenario: Buscar productos por término
- **WHEN** el usuario escribe "pizza" en el campo de búsqueda
- **THEN** el sistema actualiza la grilla con productos que coinciden (debounced 300ms)

#### Scenario: Filtrar por categoría
- **WHEN** el usuario selecciona "Bebidas" en el filtro de categorías
- **THEN** el sistema muestra solo productos de "Bebidas" y sus subcategorías

#### Scenario: Filtrar por alérgeno
- **WHEN** el usuario selecciona "Sin TACC" en el filtro de alérgenos
- **THEN** el sistema muestra solo productos sin ingredientes con ese alérgeno

#### Scenario: Paginar resultados
- **WHEN** hay más de 12 productos en el listado
- **THEN** el sistema muestra controles de paginación (anterior/siguiente, números de página)

#### Scenario: Error de red en listado
- **WHEN** la API no responde
- **THEN** el sistema muestra mensaje de error con botón "Reintentar"

### Requirement: ProductDetailPage — Detalle de producto
El sistema SHALL mostrar el detalle completo de un producto con imagen, descripción, precio, ingredientes, alérgenos y opción de agregar al carrito.

#### Scenario: Ver detalle de producto existente
- **WHEN** el usuario navega a `/catalogo/1`
- **THEN** el sistema muestra imagen, nombre, descripción, precio, categorías (como badges), ingredientes y botón "Agregar al carrito"

#### Scenario: Ver alérgenos destacados
- **WHEN** el producto tiene ingredientes con `es_alergeno = true`
- **THEN** el sistema muestra esos ingredientes con badge rojo "ALÉRGENO" y un icono de advertencia

#### Scenario: Error 404 en detalle
- **WHEN** el usuario navega a `/catalogo/999` (producto inexistente)
- **THEN** el sistema muestra página de "Producto no encontrado" con link para volver al catálogo

#### Scenario: Skeleton loading en detalle
- **WHEN** el usuario navega a `/catalogo/:id` y los datos cargan
- **THEN** el sistema muestra skeleton de detalle (imagen, texto, badges)

### Requirement: Agregar producto al carrito
El sistema SHALL permitir agregar productos al carrito desde la página de detalle, con selector de cantidad.

#### Scenario: Agregar producto al carrito
- **WHEN** el usuario selecciona cantidad 2 y hace clic en "Agregar al carrito"
- **THEN** el sistema agrega 2 unidades del producto al `cartStore`, muestra toast de confirmación y actualiza el badge del carrito en el header

#### Scenario: Agregar producto sin stock suficiente
- **WHEN** el producto tiene stock 0 y el usuario hace clic en "Agregar al carrito"
- **THEN** el sistema muestra el botón deshabilitado con texto "Sin stock"

### Requirement: CategoryTree — Navegación jerárquica por categorías
El sistema SHALL mostrar un árbol de categorías colapsable en la sidebar del catálogo.

#### Scenario: Mostrar árbol de categorías
- **WHEN** el usuario está en `/catalogo`
- **THEN** el sistema muestra en la sidebar las categorías raíz con icono de expandir

#### Scenario: Expandir subcategorías
- **WHEN** el usuario hace clic en "Bebidas"
- **THEN** el sistema expande y muestra sus subcategorías ("Gaseosas", "Aguas", "Jugos")

#### Scenario: Seleccionar categoría como filtro
- **WHEN** el usuario hace clic en "Gaseosas"
- **THEN** el sistema filtra los productos por esa categoría y la resalta en el árbol

#### Scenario: Breadcrumbs de navegación
- **WHEN** el usuario está viendo productos de "Gaseosas" (subcategoría de "Bebidas")
- **THEN** el sistema muestra: `Catálogo > Bebidas > Gaseosas` como breadcrumbs clickeables

### Requirement: Header — Link al catálogo
El sistema SHALL mostrar un link de navegación al catálogo en el header.

#### Scenario: Link visible para todos los usuarios
- **WHEN** cualquier usuario ve el header
- **THEN** el sistema muestra un link "Catálogo" que navega a `/catalogo`

#### Scenario: Link activo
- **WHEN** el usuario está en cualquier ruta de `/catalogo/*`
- **THEN** el link "Catálogo" aparece con estilo activo (clase active)

### Requirement: Estados de error globales
El sistema SHALL manejar errores de red y del servidor de forma consistente en todas las páginas del catálogo.

#### Scenario: Error de red en catálogo
- **WHEN** la API no está disponible
- **THEN** el sistema muestra pantalla de error con mensaje "Error al conectar con el servidor" y botón "Reintentar"

#### Scenario: Timeout de request
- **WHEN** la request demora más de 15 segundos
- **THEN** el sistema muestra mensaje "La solicitud está demorando más de lo esperado" con opción de cancelar
