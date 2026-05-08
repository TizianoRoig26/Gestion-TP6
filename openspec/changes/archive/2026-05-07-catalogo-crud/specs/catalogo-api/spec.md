## ADDED Requirements

### Requirement: Categorías — Crear categoría
El sistema SHALL permitir crear categorías con nombre, descripción opcional, imagen opcional y padre opcional (jerarquía).

#### Scenario: Crear categoría raíz exitosamente
- **WHEN** un usuario con rol ADMIN o STOCK envía POST /api/v1/categorias con `{nombre: "Bebidas", descripcion: "Bebidas en general"}`
- **THEN** el sistema retorna 201 con la categoría creada, `padre_id` = null

#### Scenario: Crear subcategoría exitosamente
- **WHEN** un usuario ADMIN envía POST /api/v1/categorias con `{nombre: "Gaseosas", padre_id: 1}`
- **THEN** el sistema retorna 201 con la categoría creada y `padre_id` = 1

#### Scenario: Crear categoría con ciclo en jerarquía
- **WHEN** un usuario ADMIN intenta crear una categoría cuyo `padre_id` apunta a una subcategoría propia
- **THEN** el sistema retorna 400 con error de jerarquía inválida

#### Scenario: Crear categoría sin autenticación
- **WHEN** un request anónimo envía POST /api/v1/categorias
- **THEN** el sistema retorna 401 Unauthorized

#### Scenario: Crear categoría con rol CLIENT
- **WHEN** un usuario con rol CLIENT envía POST /api/v1/categorias
- **THEN** el sistema retorna 403 Forbidden

### Requirement: Categorías — Listar categorías
El sistema SHALL listar todas las categorías activas (no eliminadas) en formato plano para que el frontend arme el árbol.

#### Scenario: Listar todas las categorías activas
- **WHEN** un request GET /api/v1/categorias
- **THEN** el sistema retorna 200 con array de categorías ordenadas por nombre, incluyendo sus subcategorías con nivel de profundidad

#### Scenario: Listar solo categorías raíz
- **WHEN** un request GET /api/v1/categorias?raiz=true
- **THEN** el sistema retorna 200 con solo categorías sin padre

#### Scenario: Listar subcategorías de una categoría
- **WHEN** un request GET /api/v1/categorias/1/subcategorias
- **THEN** el sistema retorna 200 con las subcategorías directas de la categoría 1

### Requirement: Categorías — Editar categoría
El sistema SHALL permitir editar nombre, descripción e imagen de una categoría existente.

#### Scenario: Editar categoría exitosamente
- **WHEN** un usuario ADMIN envía PATCH /api/v1/categorias/1 con `{nombre: "Bebidas Actualizado"}`
- **THEN** el sistema retorna 200 con la categoría actualizada

#### Scenario: Editar categoría eliminada
- **WHEN** un usuario ADMIN envía PATCH /api/v1/categorias/999 (eliminada)
- **THEN** el sistema retorna 404 Not Found

### Requirement: Categorías — Eliminar categoría (soft delete)
El sistema SHALL permitir eliminar categorías con soft delete, validando que no tenga productos activos ni subcategorías.

#### Scenario: Eliminar categoría sin productos
- **WHEN** un usuario ADMIN envía DELETE /api/v1/categorias/2 y la categoría no tiene productos ni subcategorías
- **THEN** el sistema retorna 204 y la categoría tiene `eliminado_en` con timestamp

#### Scenario: Eliminar categoría con productos activos
- **WHEN** un usuario ADMIN envía DELETE /api/v1/categorias/1 y tiene productos asociados
- **THEN** el sistema retorna 409 Conflict con mensaje "No se puede eliminar: la categoría tiene productos activos"

### Requirement: Ingredientes — Crear ingrediente
El sistema SHALL permitir crear ingredientes con nombre único, descripción opcional y flag es_alérgeno.

#### Scenario: Crear ingrediente exitosamente
- **WHEN** un usuario ADMIN envía POST /api/v1/ingredientes con `{nombre: "Gluten", es_alergeno: true}`
- **THEN** el sistema retorna 201 con el ingrediente creado

#### Scenario: Crear ingrediente duplicado
- **WHEN** un usuario ADMIN envía POST /api/v1/ingredientes con un nombre ya existente
- **THEN** el sistema retorna 409 Conflict

### Requirement: Ingredientes — Listar ingredientes
El sistema SHALL listar ingredientes activos con su flag de alérgeno.

#### Scenario: Listar ingredientes
- **WHEN** un request GET /api/v1/ingredientes
- **THEN** el sistema retorna 200 con array de ingredientes, incluyendo `es_alergeno`

#### Scenario: Filtrar solo alérgenos
- **WHEN** un request GET /api/v1/ingredientes?solo_alergenos=true
- **THEN** el sistema retorna 200 con solo ingredientes donde `es_alergeno = true`

### Requirement: Ingredientes — Editar ingrediente
El sistema SHALL permitir editar nombre, descripción y flag es_alérgeno.

#### Scenario: Editar ingrediente exitosamente
- **WHEN** un usuario ADMIN envía PATCH /api/v1/ingredientes/1
- **THEN** el sistema retorna 200 con el ingrediente actualizado

### Requirement: Ingredientes — Eliminar ingrediente (soft delete)
El sistema SHALL permitir eliminar ingredientes con soft delete.

#### Scenario: Eliminar ingrediente
- **WHEN** un usuario ADMIN envía DELETE /api/v1/ingredientes/1
- **THEN** el sistema retorna 204

### Requirement: Productos — Crear producto
El sistema SHALL permitir crear productos con nombre, descripción, precio, stock, disponible, imágenes, categorías e ingredientes.

#### Scenario: Crear producto exitosamente
- **WHEN** un usuario ADMIN envía POST /api/v1/productos con `{nombre: "Coca Cola 500ml", precio_base: 250.0, stock_cantidad: 100, categoria_ids: [1], ingrediente_ids: [1, 2]}`
- **THEN** el sistema retorna 201 con el producto creado, categorías e ingredientes asociados

#### Scenario: Crear producto con precio negativo
- **WHEN** un usuario ADMIN envía POST /api/v1/productos con `precio_base: -10`
- **THEN** el sistema retorna 422 Validation Error

#### Scenario: Crear producto con stock negativo
- **WHEN** un usuario ADMIN envía POST /api/v1/productos con `stock_cantidad: -5`
- **THEN** el sistema retorna 422 Validation Error

### Requirement: Productos — Listar productos del catálogo
El sistema SHALL listar productos con filtros por categoría, búsqueda por nombre, alérgenos, paginación y ordenamiento.

#### Scenario: Listar productos disponibles (público)
- **WHEN** un request GET /api/v1/productos sin autenticación
- **THEN** el sistema retorna 200 con solo productos donde `disponible = true` y `eliminado_en IS NULL`

#### Scenario: Listar productos con filtro por categoría
- **WHEN** un request GET /api/v1/productos?categoria_id=1
- **THEN** el sistema retorna 200 con productos de la categoría 1 y sus subcategorías

#### Scenario: Buscar productos por nombre
- **WHEN** un request GET /api/v1/productos?search=coca
- **THEN** el sistema retorna 200 con productos cuyo nombre contenga "coca" (ILIKE)

#### Scenario: Listar productos con paginación
- **WHEN** un request GET /api/v1/productos?page=1&page_size=10
- **THEN** el sistema retorna 200 con `{items: [...], total: N, page: 1, page_size: 10, pages: M}`

#### Scenario: Listar productos filtrando por alérgeno
- **WHEN** un request GET /api/v1/productos?alergeno_id=1
- **THEN** el sistema retorna 200 con productos que contienen el ingrediente alérgeno 1

#### Scenario: Listar todos los productos (admin)
- **WHEN** un usuario ADMIN autenticado envía GET /api/v1/productos
- **THEN** el sistema retorna 200 con todos los productos incluyendo no disponibles y eliminados

### Requirement: Productos — Ver detalle de producto
El sistema SHALL mostrar el detalle completo de un producto incluyendo categorías e ingredientes.

#### Scenario: Ver detalle de producto existente
- **WHEN** un request GET /api/v1/productos/1
- **THEN** el sistema retorna 200 con producto, sus categorías e ingredientes

#### Scenario: Ver detalle de producto inexistente
- **WHEN** un request GET /api/v1/productos/999
- **THEN** el sistema retorna 404 Not Found

### Requirement: Productos — Editar producto
El sistema SHALL permitir editar producto (incluyendo categorías e ingredientes asociados).

#### Scenario: Editar producto exitosamente
- **WHEN** un usuario ADMIN envía PATCH /api/v1/productos/1 con `{precio_base: 300.0}`
- **THEN** el sistema retorna 200 con el producto actualizado

### Requirement: Productos — Gestionar stock
El sistema SHALL permitir actualizar el stock de un producto.

#### Scenario: Actualizar stock exitosamente
- **WHEN** un usuario ADMIN envía PATCH /api/v1/productos/1/stock con `{stock_cantidad: 50}`
- **THEN** el sistema retorna 200 con el stock actualizado

#### Scenario: Actualizar stock a valor negativo
- **WHEN** un usuario ADMIN envía PATCH /api/v1/productos/1/stock con `{stock_cantidad: -1}`
- **THEN** el sistema retorna 422 Validation Error

### Requirement: Productos — Eliminar producto (soft delete)
El sistema SHALL permitir eliminar productos con soft delete.

#### Scenario: Eliminar producto exitosamente
- **WHEN** un usuario ADMIN envía DELETE /api/v1/productos/1
- **THEN** el sistema retorna 204
