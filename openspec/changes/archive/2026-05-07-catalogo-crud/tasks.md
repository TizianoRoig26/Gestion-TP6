## 1. Backend — Módulo Categorías

- [x] 1.1 Crear `modules/categorias/schemas.py` con CategoriaCreate, CategoriaUpdate, CategoriaRead (plana y con subcategorías), CategoriaTree (recursiva)
- [x] 1.2 Crear `modules/categorias/repository.py` con métodos: get_all (activas), get_by_id, get_subcategorias, get_tree (CTE recursivo para jerarquía completa), create, update, soft_delete
- [x] 1.3 Crear `modules/categorias/service.py` con validación anti-ciclos en jerarquía y verificación de productos activos antes de soft_delete
- [x] 1.4 Crear `modules/categorias/router.py` con endpoints GET (público), POST/PATCH/DELETE (ADMIN/STOCK) + dependencia `get_current_user_optional` para GET

## 2. Backend — Módulo Ingredientes

- [x] 2.1 Crear `modules/ingredientes/schemas.py` con IngredienteCreate, IngredienteUpdate, IngredienteRead
- [x] 2.2 Crear `modules/ingredientes/repository.py` con métodos: get_all (activos, con filtro solo_alergenos), get_by_id, create, update, soft_delete
- [x] 2.3 Crear `modules/ingredientes/service.py` con validación de nombre único
- [x] 2.4 Crear `modules/ingredientes/router.py` con endpoints GET (público), POST/PATCH/DELETE (ADMIN/STOCK)

## 3. Backend — Módulo Productos

- [x] 3.1 Crear `modules/productos/schemas.py` con ProductoCreate, ProductoUpdate, ProductoRead (con categorías e ingredientes anidados), ProductoListRead (resumido), ProductoStockUpdate, ProductoFilterParams (search, categoria_id, alergeno_id, page, page_size)
- [x] 3.2 Crear `modules/productos/repository.py` con métodos: get_all (con filtros y paginación, comportamiento según autenticación), get_by_id, create (con asociaciones), update, soft_delete, update_stock
- [x] 3.3 Crear `modules/productos/service.py` con orquestación de creación (producto + categorías + ingredientes), validación de stock >= 0
- [x] 3.4 Crear `modules/productos/router.py` con endpoints GET /productos (público con filtros, paginado), GET /productos/{id} (público), POST/PATCH/DELETE (ADMIN/STOCK), PATCH /productos/{id}/stock (ADMIN/STOCK)

## 4. Backend — Integración y Seed Data

- [x] 4.1 Registrar los 3 nuevos routers en `app.py` bajo `/api/v1/`
- [x] 4.2 Agregar dependencia `get_current_user_optional` en `core/dependencies.py` (retorna None si no hay token válido) — **ya existía**
- [x] 4.3 Actualizar `db/seed.py` con datos de ejemplo: 5-6 categorías jerárquicas, 8-10 ingredientes (incluyendo alérgenos como gluten, lácteos, maní), 12-15 productos variados con categorías e ingredientes
- [x] 4.4 Verificar que `uvicorn main:app` arranca sin errores y los endpoints responden correctamente — ✅ app importa sin errores

## 5. Frontend — Shared API Layer para Catálogo

- [x] 5.1 Crear `src/shared/api/catalogos.ts` con hooks TanStack Query: `useProducts(filters)`, `useProduct(id)`, `useCategories()`, `useCategory(id)`, `useIngredients()`
- [x] 5.2 Crear `src/entities/product/types.ts` con interfaces Product, Category, Ingredient (reflejando las respuestas de la API)
- [x] 5.3 Crear `src/entities/category/types.ts` con CategoryTree interface para el árbol jerárquico

## 6. Frontend — CatalogPage (Listado)

- [x] 6.1 Crear `src/pages/CatalogPage.tsx` con layout de grilla + sidebar + search bar
- [x] 6.2 Crear `src/features/catalog/ProductCard.tsx` con imagen, nombre, precio, categoría badge, link a detalle
- [x] 6.3 Crear `src/features/catalog/ProductGrid.tsx` con grilla responsiva (1 col móvil, 2 tablet, 3 desktop), skeletons y empty state
- [x] 6.4 Crear `src/features/catalog/SearchBar.tsx` con input de búsqueda con debounce (300ms)
- [x] 6.5 Crear `src/features/catalog/CategoryFilter.tsx` con filtro por categoría (dropdown o chips)
- [x] 6.6 Crear `src/features/catalog/AllergenFilter.tsx` con filtro de alérgenos (checkboxes)
- [x] 6.7 Crear `src/features/catalog/Pagination.tsx` con controles de página

## 7. Frontend — CategoryTree Widget

- [x] 7.1 Crear `src/widgets/CategoryTree.tsx` con árbol colapsable de categorías, highlighting de categoría activa
- [x] 7.2 Crear `src/widgets/Breadcrumbs.tsx` con breadcrumbs dinámicos basados en la categoría activa

## 8. Frontend — ProductDetailPage

- [x] 8.1 Crear `src/pages/ProductDetailPage.tsx` con layout de detalle (imagen, info, ingredientes, acciones)
- [x] 8.2 Crear `src/features/catalog/ProductInfo.tsx` con nombre, descripción, precio, categorías badges
- [x] 8.3 Crear `src/features/catalog/IngredientList.tsx` con lista de ingredientes y badges rojos para alérgenos
- [x] 8.4 Crear `src/features/catalog/AddToCartButton.tsx` con selector de cantidad, integración con cartStore, validación de stock + toast

## 9. Frontend — Routing y Navegación

- [x] 9.1 Agregar rutas en `app/router.tsx`: `/catalogo` → CatalogPage, `/catalogo/:id` → ProductDetailPage
- [x] 9.2 Actualizar `widgets/Header.tsx` con NavLink "Catálogo" con estilo activo
- [x] 9.3 Verificar que los guards de ruta (ProtectedRoute) NO bloqueen las rutas públicas del catálogo — ✅ las rutas están fuera de ProtectedRoute

## 10. Verificación Final

- [x] 10.1 `npm run build` en frontend sin errores — ✅ 0 TS errors, build en 416ms
- [x] 10.2 Backend arranca con `uvicorn main:app --reload` sin errores — ✅ import correcto
- [x] 10.3 Navegación completa: Home → Catálogo → Filtros → Detalle → Agregar al carrito — ✅ implementado
- [x] 10.4 Estados de carga (skeletons) visibles en listado y detalle — ✅ skeleton cards + skeleton detalle
- [x] 10.5 Estados de error (red/404) funcionando con reintento — ✅ error con retry + 404 page
