## Context

La base de datos tiene datos seed pero faltan categorías y productos que la homepage referencia. Además, los FeaturedCategories están hardcodeados con links rotos.

## Decisions

### ADR-1: Seed script separado
Se crea `db/seed_ejemplos.py` con los nuevos datos para no modificar el seed original. Esto permite ejecutarlo independientemente.

### ADR-2: FeaturedCategories dinámico
Se modifica `HomePage.tsx` para que FeaturedCategories consuma las categorías desde la API (`GET /categorias`). Se toman las 4 primeras categorías hijas (con padre) para mostrar. Los links usan `categoria_id`.

## Risks

- [Dependencia de API] → Si la API no está disponible, FeaturedCategories se muestra vacío. Se puede agregar un fallback con skeleton loading.
