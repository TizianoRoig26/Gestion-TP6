## Why

El backend de Food Store está 100% operativo con 9 módulos funcionales (auth, usuarios, direcciones, categorías, productos, ingredientes, pedidos, pagos, admin), pero no existe una interfaz de usuario que permita a clientes y administradores interactuar con el sistema. Sin frontend, la plataforma no es usable por usuarios reales.

Este change establece la infraestructura base del frontend para poder comenzar a construir las interfaces de usuario sobre una base sólida, consistente y alineada con la arquitectura Feature-Sliced Design (FSD).

## What Changes

- Inicialización del proyecto React + TypeScript + Vite con configuración estricta de TypeScript
- Configuración de Tailwind CSS v4 con PostCSS para estilos utilitarios
- Estructura de carpetas Feature-Sliced Design (app, pages, widgets, features, entities, shared)
- Cliente HTTP centralizado con Axios incluyendo:
  - Interceptor de request que adjunta Bearer token desde authStore
  - Interceptor de response con refresh automático de tokens en 401
  - Cola de requests para evitar refresh concurrentes
- Stores de Zustand con persistencia:
  - **authStore**: accessToken, refreshToken, user, isAuthenticated (persistente)
  - **cartStore**: items, personalización, totales (persistente)
  - **paymentStore**: checkout step, preferenceId (transitorio, sin persistencia)
  - **uiStore**: theme, sidebar (persistencia parcial)
- Configuración de TanStack Query con QueryClientProvider y defaults razonables
- Routing base con react-router-dom (rutas públicas y privadas)
- Layout base con header, sidebar responsivo y footer
- Página de Login y Register funcionales conectadas al backend
- Manejo global de errores HTTP con toasts/notificaciones
- Protección de rutas por autenticación y rol (Route Guards)

## Capabilities

### New Capabilities
- `frontend-infra`: Configuración base del proyecto frontend (Vite, TypeScript, Tailwind, FSD layout)
- `frontend-auth`: Stores de autenticación + páginas login/register + interceptor Axios con refresh
- `frontend-state`: Stores de Zustand (auth, cart, payment, ui) con persistencia y selectores

### Modified Capabilities
- *(ninguna — es el primer change de frontend)*

## Impact

- **Nuevo directorio**: `frontend/` con estructura FSD completa
- **Dependencias npm**: react, react-dom, react-router-dom, @tanstack/react-query, zustand, axios, tailwindcss, @mercadopago/sdk-js, recharts
- **Backend**: Sin cambios — el frontend consume los endpoints existentes (`/api/v1/*`)
- **Configuración**: Nuevo `.env` con `VITE_API_URL` y `VITE_MP_PUBLIC_KEY`
- **Dev server**: Vite en puerto 5173 con proxy opcional al backend (puerto 8000)

## Historias de Usuario

- **US-000c**: Setup del frontend con React, TypeScript, Vite y dependencias core
- **US-000e**: Configuración de los stores de Zustand (authStore, cartStore, paymentStore, uiStore)
- **US-075**: Navegación por rol (estructura base)
- **US-076**: Protección de rutas en frontend (guards base)
- **US-066**: Manejo de token expirado en frontend (interceptor Axios)
- **US-067**: Manejo de errores global en frontend

## Dependencias

- **setup-infra-backend** ✅ Completado — el backend ya está operativo con todos los endpoints necesarios

## Definition of Done

- [ ] `npm install` instala todas las dependencias sin errores
- [ ] `npm run dev` arranca el dev server en puerto 5173
- [ ] TypeScript estricto configurado y compilando
- [ ] Estructura FSD creada con todas las capas
- [ ] Axios instance con interceptors funcionando (token + refresh automático)
- [ ] Stores de Zustand creados y persistiendo correctamente
- [ ] TanStack Query configurado con QueryClientProvider
- [ ] Routing base operativo (público y privado)
- [ ] Login y Register funcionales conectados al backend
- [ ] Manejo global de errores con notificaciones visuales
- [ ] Protección de rutas por rol implementada
- [ ] Layout responsivo con header y sidebar
