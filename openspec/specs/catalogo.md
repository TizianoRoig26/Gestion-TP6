# Capability: Catálogo de Productos

## Descripción
Gestión del catálogo de productos con categorías jerárquicas, productos e ingredientes.

## Historias de Usuario
- US-007: Crear categoría
- US-008: Listar categorías jerárquicas
- US-009: Editar categoría
- US-010: Eliminar categoría (soft delete)
- US-011: Crear ingrediente
- US-012: Listar ingredientes
- US-013: Editar ingrediente
- US-014: Eliminar ingrediente
- US-015: Crear producto
- US-016: Asociar producto a categorías
- US-017: Asociar ingredientes a producto
- US-018: Listar productos del catálogo
- US-019: Ver detalle de producto
- US-020: Editar producto
- US-021: Gestionar stock
- US-022: Eliminar producto
- US-023: Filtrar productos por alérgenos

## Stack Tecnológico
- SQLModel con FK autoreferencial para categorías
- CTE recursivo para jerarquía
- PostgreSQL INTEGER[] para personalización

## Reglas de Negocio
- RN-CA01: Categorías con padre_id (jerarquía arbitraria)
- RN-CA02: No permitir ciclos en jerarquía
- RN-CA03: No eliminar categoría con productos activos
- RN-CA04: Precio como NUMERIC (no float)
- RN-CA05: Stock >= 0 (entero)
- RN-CA06: Producto puede tener múltiples categorías
- RN-CA07: Ingrediente con flag es_alérgeno
- RN-CA08: Catálogo público solo disponible=true
- RN-CA09: Soft delete preserva integridad

## Dependencias
- auth.md (requiere autenticación para gestión)

## Definition of Done
- [x] CRUD categorías con jerarquía funcionando
- [x] CRUD ingredientes con flag alérgeno
- [x] CRUD productos con stock y precio
- [x] Productos en múltiples categorías
- [x] Ingredientes en productos
- [x] Catálogo público filtrado
- [x] Filtro por alérgenos

## Sub-capabilities
- `catalogo-api` — API REST del catálogo (CRUD productos, categorías, ingredientes)
- `catalogo-ui` — Interfaz de usuario del catálogo (listado, detalle, filtros)

## Recursos
- docs/Descripcion.md (sección 4 - Dominio 2)
- docs/Historias_de_usuario.md (EPIC 03, 04, 05)