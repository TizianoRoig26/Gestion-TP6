## Context

Food Store tiene un backend completamente funcional (auth, usuarios, catálogo, pedidos, pagos, admin) expuesto via REST API en `/api/v1/*`. Actualmente no existe interfaz de usuario. Este change establece la infraestructura frontend sobre la cual se construirán todas las interfaces futuras.

El frontend debe:
- Consumir la API REST existente (FastAPI, puerto 8000)
- Soportar 4 roles de usuario: ADMIN, STOCK, PEDIDOS, CLIENT
- Implementar autenticación JWT con refresh automático
- Ser responsive (mobile-first)
- Usar Feature-Sliced Design (FSD) como arquitectura

## Goals / Non-Goals

**Goals:**
- Proyecto React + TypeScript + Vite inicializado y compilando con strict mode
- Tailwind CSS v4 configurado con PostCSS
- Estructura FSD creada con todas las capas (app, pages, widgets, features, entities, shared)
- Cliente Axios centralizado con interceptors (token + refresh automático + cola de requests)
- 4 stores de Zustand con persistencia selectiva (auth, cart, payment, ui)
- TanStack Query configurado con defaults óptimos
- Routing base con react-router-dom (rutas públicas y protegidas por rol)
- Layout responsivo (header, sidebar colapsable, footer)
- Páginas de Login y Register funcionales conectadas al backend
- Manejo global de errores HTTP con notificaciones toast
- Route guards que protegen según autenticación y rol

**Non-Goals:**
- Implementar componentes de negocio (catálogo, carrito, pedidos, etc.)
- Integración real con MercadoPago (solo SDK instalado)
- Tests E2E (se agregarán en cambios posteriores)
- PWA / service workers
- Server-Side Rendering (SSR) — la app es SPA pura

## Decisions

### 1. Vite con SWC en lugar de Babel

**Decisión**: Usar `@vitejs/plugin-react-swc` en lugar del plugin con Babel.

**Razón**: SWC es ~20x más rápido que Babel en transformaciones. Para un proyecto que crecerá con múltiples módulos, el speed boost en hot reload se nota desde el día 1.

**Alternativa considerada**: `@vitejs/plugin-react` (Babel) — descartado por performance inferior.

### 2. Zustand sobre Redux Toolkit

**Decisión**: Zustand para estado client-side (auth, cart, payment, UI) + TanStack Query para estado servidor.

**Razón**: Separación clara de responsabilidades. Zustand es liviano (~1KB), no requiere boilerplate, y su API basada en hooks es natural en React. TanStack Query maneja caching, refetch, y sincronización con el backend.

**Alternativa considerada**: Redux Toolkit + RTK Query — descartado porque para este tamaño de app, RTK añade boilerplate innecesario y una curva de aprendizaje más empinada.

### 3. Feature-Sliced Design (FSD) sobre pages-only

**Decisión**: Estructura FSD con 6 capas (app, pages, widgets, features, entities, shared).

**Razón**: A medida que el frontend crezca (6+ epics planificadas), una estructura plana de componentes se vuelve inmanejable. FSD fuerza una separación clara: `entities/` para modelos de dominio, `features/` para interacciones de usuario completas, `widgets/` para composiciones reutilizables.

**Alternativa considerada**: Estructura plana por páginas — descartado porque no escala a 20+ páginas con lógica compartida.

### 4. Axios con interceptor de refresh vs. fetch nativo

**Decisión**: Axios con interceptores y cola de requests pendientes.

**Razón**: El interceptor de response captura 401s, pauses otras requests, ejecuta refresh, y reanuda todas automáticamente. Esto da una experiencia transparente para el usuario. Axios además soporta cancelación de requests y transformers.

**Alternativa considerada**: TanStack Query solo — descartado porque las requests de autenticación (login, register) no pasan por Query.

### 5. Persistencia selectiva con partialize

**Decisión**: Persistir solo campos necesarios en localStorage usando `partialize` de Zustand.

**Razón**: `authStore` persiste tokens y user (excepto isLoading). `cartStore` persiste items. `uiStore` persiste solo theme. `paymentStore` no persiste nada (es transitorio). Esto evita guardar datos sensibles o estado inconsistente.

### 6. Tailwind CSS v4 sobre CSS Modules o Styled Components

**Decisión**: Tailwind CSS v4 con PostCSS.

**Razón**: Tailwind v4 trae el引擎 nativo que elimina la necesidad de configurar `tailwind.config.js` manualmente. Las clases utilitarias aceleran el desarrollo y el purging automático mantiene el bundle pequeño.

### 7. react-router-dom v6+ con layout anidado

**Decisión**: Usar layout routes de react-router-dom v6 para el shell de la app (header/sidebar/footer) con rutas anidadas para cada página.

**Razón**: Los layout routes permiten que el shell persista entre navegaciones sin rerenderizar, mejorando performance y permitiendo transiciones suaves.

## Architecture

```
frontend/
├── app/                        # Init de la app: providers, router, layout
│   ├── App.tsx                 # Root component (QueryClientProvider + Router)
│   ├── main.tsx                # Entry point (ReactDOM.createRoot)
│   ├── router.tsx              # React Router config (layout + routes)
│   └── providers.tsx           # Composicion de providers
├── pages/                      # Paginas completas (1 file = 1 route)
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── NotFoundPage.tsx
├── widgets/                    # Composiciones reutilizables
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── Footer.tsx
├── features/                   # Interacciones completas
│   └── auth/                   # Feature de autenticación
│       ├── LoginForm.tsx
│       └── RegisterForm.tsx
├── entities/                   # Modelos de dominio
│   └── user/
│       └── types.ts
└── shared/                     # Infraestructura compartida
    ├── api/
    │   └── axios.ts            # Axios instance + interceptors
    ├── stores/
    │   ├── authStore.ts
    │   ├── cartStore.ts
    │   ├── paymentStore.ts
    │   └── uiStore.ts
    ├── guards/
    │   ├── ProtectedRoute.tsx
    │   └── RoleGuard.tsx
    ├── lib/
    │   └── queryClient.ts      # QueryClient config
    └── ui/                     # UI primitives
        ├── Toast.tsx
        ├── Button.tsx
        └── Input.tsx
```

### Data Flow

```
User interaction
    │
    ▼
Page/Feature component
    │
    ├── TanStack Query (datos servidor) ──► Axios ──► Backend API
    │                                              │
    │                                       [Interceptor: attach token,
    │                                         handle 401 → refresh → retry]
    │
    └── Zustand (estado cliente)
        ├── authStore: tokens, user, roles
        ├── cartStore: items, personalizacion
        ├── paymentStore: checkout step (transitorio)
        └── uiStore: theme, sidebar
```

### Auth Flow

```
1. Login → POST /api/v1/auth/login
       ↓
2. authStore.set({ accessToken, refreshToken, user })
       ↓
3. Axios interceptor attachs: Authorization: Bearer <accessToken>
       ↓
4. On 401:
   a. Pausar todas las requests en cola
   b. POST /api/v1/auth/refresh (con refreshToken)
   c. Si OK → updateTokens() + replay cola
   d. Si falla → logout() + redirect login
```

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|-----------|
| Token expira durante request concurrentes → múltiples refreshes | Cola de requests: solo 1 refresh a la vez, las demás esperan |
| localStorage corrupto o manipulado | Validación al despersistir con esquemas Zod/sanity checks |
| FSD puede sentirse over-engineered al inicio | La estructura de carpetas se crea vacía; se llena gradualmente |
| Sin tests E2E en este change → posibles regresiones | Se prioriza tipo limpio en TypeScript + validaciones en runtime |
| Dependencias externas (Tailwind v4) pueden tener breaking changes | Pin versions exactas en package.json |
