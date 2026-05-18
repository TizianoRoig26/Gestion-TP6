## Why

La base de datos tiene datos básicos pero faltan categorías clave como "Carnes", "Postres" y "Pastas" que la homepage referencia. Además, la sección de categorías destacadas en la HomePage está hardcodeada con nombres que no existen en la DB y links rotos (usa `categoria` en vez de `categoria_id`).

## What Changes

- Agregar categorías: Carnes, Postres, Pastas (y subcategorías si aplica)
- Agregar productos de ejemplo para esas categorías (milanesas, pastas, postres)
- Actualizar FeaturedCategories en HomePage para que sea dinámico (fetch desde API)
- Fix de links en FeaturedCategories para usar `categoria_id`
- Agregar imágenes placeholder para productos

## Impact

- **Backend**: Seed data expandido en `db/seed_carnes_postres.py`
- **Frontend**: `pages/HomePage.tsx` — FeaturedCategories ahora consume datos de la API
- **No breaking**: No rompe APIs ni rutas existentes

## Definition of Done

- [ ] Nuevas categorías: Carnes, Postres, Pastas existen en DB
- [ ] Al menos 8 productos nuevos agregados
- [ ] HomePage FeaturedCategories muestra categorías reales desde API
- [ ] Los links del FeaturedCategories filtran correctamente por categoria_id
