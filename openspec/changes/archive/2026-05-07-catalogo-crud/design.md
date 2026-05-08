## Context

Food Store necesita un catálogo de productos navegable. Actualmente:

- **Backend**: Los modelos SQLModel para `Categoria`, `Producto`, `Ingrediente`, `ProductoCategoria` y `ProductoIngrediente` existen en `db/models.py`. El módulo `auth` está completo con JWT + RBAC. La infraestructura core (UoW, BaseRepository, database, security) está operativa. **No existen** los módulos backend de productos, categorías e ingredientes.
- **Frontend**: La infraestructura FSD está montada (Vite + React 19 + TS 6 + Zustand 5 + TanStack Query 5). Hay stores de auth, carrito, UI y pagos. El router tiene guards de ruta. Axios con interceptors funcionando. **No existen** páginas ni componentes de catálogo.
- **Seed data**: Existe pero solo tiene datos de auth (roles, admin). No tiene datos de catálogo.

## Goals / Non-Goals

**Goals:**
- CRUD completo de categorías con jerarquía padre-hijo (FK autoreferencial)
- CRUD completo de ingredientes con flag es_alérgeno
- CRUD completo de productos con precio, stock, asociación a categorías e ingredientes
- Endpoints públicos de consulta (productos disponibles, categorías, ingredientes)
- Endpoints de gestión protegidos por RBAC (ADMIN/STOCK)
- UI de listado de productos con búsqueda, filtros y paginación
- UI de detalle de producto con ingredientes, alérgenos y acción de agregar al carrito
- Navegación jerárquica por categorías (sidebar + breadcrumbs)
- Seed data con ejemplos reales de categorías, ingredientes y productos

**Non-Goals:**
- No se implementa gestión de productos desde el frontend (solo visualización pública)
- No se implementa panel admin de catálogo (será en change `admin-panel`)
- No se implementan imágenes reales (soporte para URL de imagen, pero sin upload)
- No se implementa búsqueda full-text (solo LIKE sobre nombre)

## Decisions

### ADR-01: Módulos separados vs monolito de catálogo
- **Decisión**: Tres módulos separados (`categorias`, `ingredientes`, `productos`)
- **Opción descartada**: Un solo módulo `catalogo` con todo
- **Razón**: Consistencia con la arquitectura feature-first existente. Cada entidad tiene su propio ciclo de vida, reglas y responsables. `productos` depende de `categorias` e `ingredientes` pero no al revés.
- **Consecuencia**: `productos` module importa schemas de `categorias` e `ingredientes`

### ADR-02: CTE vs consulta anidada para jerarquía de categorías
- **Decisión**: CTE recursivo en PostgreSQL para obtener subárbol de categorías
- **Opción descartada**: Múltiples queries anidadas desde Python (N+1)
- **Razón**: Performance. El CTE resuelve toda la jerarquía en una sola consulta DB. PostgreSQL optimiza CTEs recursivos naturalmente.
- **Implementación**: Query raw SQL vía `session.execute()` dentro del repository, no SQLModel.

### ADR-03: Endpoints duplicados (público vs protegido)
- **Decisión**: Mismo endpoint GET con filtro según autenticación
- **Opción descartada**: Endpoints separados `/api/v1/productos` (admin) y `/api/v1/catalogo/productos` (público)
- **Razón**: Simplicidad. Si el usuario está autenticado y tiene rol ADMIN/STOCK, ve productos no disponibles y stock real. Si no, solo ve `disponible=true`. Misma lógica con `eliminado_en IS NULL`.
- **Mecanismo**: Dependencia opcional `current_user: Usuario = Depends(get_current_user_optional)` que devuelve None si no hay token.

### ADR-04: Búsqueda por LIKE vs full-text search
- **Decisión**: `ILIKE '%termino%'` sobre nombre del producto
- **Opción descartada**: PostgreSQL tsvector + tsquery
- **Razón**: Simplicidad para el MVP. El catálogo inicial tendrá decenas, no miles de productos. LIKE es suficiente. Se migrará a FTS cuando el volumen lo justifique.

### ADR-05: Queries públicas en Service vs Repository directo
- **Decisión**: Las queries de solo lectura pública (listar productos, categorías) van en el Repository con métodos específicos
- **Opción descartada**: Service orquestando queries simples sin lógica de negocio
- **Razón**: No hay lógica de negocio en lecturas públicas (solo filtros). Repository devuelve directamente DTOs. Service se reserva para operaciones con validación (crear producto, gestionar stock).
- **Consecuencia**: Los métodos de lectura retornan `list[ProductoRead]` directamente desde Repository

### ADR-06: Sidebar categorías vs dropdown
- **Decisión**: Sidebar con árbol colapsable de categorías
- **Razón**: Las categorías son jerárquicas (ej: "Bebidas > Gaseosas > Cola"). Un dropdown plano pierde la jerarquía. La sidebar permite expandir/colapsar y ver la estructura completa.
- **Implementación**: Componente `CategoryTree` en `widgets/` que recibe la lista plana y renderiza el árbol recursivamente.

### ADR-07: Filtros client-side vs server-side
- **Decisión**: Filtros server-side (query params en GET /productos)
- **Opción descartada**: Traer todos los productos y filtrar en frontend
- **Razón**: El catálogo puede crecer. Los filtros server-side permiten paginación eficiente y evitan transferir datos innecesarios. TanStack Query cachea los resultados automáticamente.

## API Contracts

### Categorías — `/api/v1/categorias`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | Público | Lista todas las categorías activas (planas, para armar árbol en frontend) |
| GET | `/{id}` | Público | Detalle de categoría |
| GET | `/{id}/subcategorias` | Público | Subcategorías directas |
| POST | `/` | ADMIN/STOCK | Crear categoría |
| PATCH | `/{id}` | ADMIN/STOCK | Editar categoría |
| DELETE | `/{id}` | ADMIN/STOCK | Eliminar categoría (soft delete, valida sin productos activos) |

### Ingredientes — `/api/v1/ingredientes`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | Público | Lista ingredientes activos |
| GET | `/{id}` | Público | Detalle de ingrediente |
| POST | `/` | ADMIN/STOCK | Crear ingrediente |
| PATCH | `/{id}` | ADMIN/STOCK | Editar ingrediente |
| DELETE | `/{id}` | ADMIN/STOCK | Eliminar ingrediente (soft delete) |

### Productos — `/api/v1/productos`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | Público | Lista productos (filtros: `categoria_id`, `search`, `alergeno_id`, `page`, `page_size`) |
| GET | `/{id}` | Público | Detalle con categorías e ingredientes |
| POST | `/` | ADMIN/STOCK | Crear producto |
| PATCH | `/{id}` | ADMIN/STOCK | Editar producto |
| PATCH | `/{id}/stock` | ADMIN/STOCK | Actualizar stock |
| DELETE | `/{id}` | ADMIN/STOCK | Eliminar producto (soft delete) |

## Frontend Routes

| Ruta | Page | Auth | Descripción |
|------|------|------|-------------|
| `/catalogo` | `CatalogPage` | Público | Listado de productos con filtros |
| `/catalogo/:id` | `ProductDetailPage` | Público | Detalle de producto |
| `/catalogo/categoria/:id` | `CatalogPage` | Público | Listado filtrado por categoría |

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| **CTE recursivo puede ser lento con miles de categorías** | Agregar índice compuesto en categorías (padre_id + eliminado_en). El volumen esperado es bajo (< 100 categorías) |
| **END`points públicos sin rate limiting** | El rate limiting global de slowapi aplica. Considerar agregar rate limiter específico para GET /productos si hay abuso |
| **Sidebar de categorías puede ser profunda** | Limitar expansión a 3 niveles visualmente, con scroll. El backend devuelve todos los niveles igual |
| **LIKE search no escala** | Documentado como deuda técnica. Migrar a tsvector cuando haya > 500 productos |
| **Soft delete en categoría raíz** | Validar en service que no se elimine categoría con productos activos. También verificar que no se elimine la raíz si hay subcategorías |
| **Imágenes externas rotas** | Mostrar placeholder en la UI si la URL falla o es null |

## Open Questions

- ¿Manejar imágenes como URL externa o implementar upload? → Por ahora URL externa, upload en change futuro
- ¿Paginación con cursor o page/page_size? → page/page_size por simplicidad. Cursor cuando el volumen lo exija
- ¿Stock negativo permitido en pedidos? → No, validar stock >= 0 antes de confirmar pedido (RN-03)
