# Capability: Frontend UI

## Descripción
Capa de presentación con React, navegación por rol, estados y componentes.

## Historias de Usuario
- US-075: Navegación por rol
- US-076: Protección de rutas por autenticación
- US-066: Manejo de token expirado (refresh automático)
- US-067: Manejo de errores global
- US-029 al US-034: Carrito de compras

## Stack Tecnológico
- React + TypeScript + Vite
- TanStack Query (estado servidor)
- TanStack Form (formularios)
- Zustand (estado cliente)
- Zustand persist (localStorage)
- Axios con interceptors
- Tailwind CSS
- recharts (dashboard admin)

## Reglas de Negocio
- RN-CR01: Carrito client-side (Zustand)
- RN-CR02: Carrito persiste en localStorage
- RN-CR03: Agregar mismo producto suma cantidad
- RN-CR04: Solo excluir ingredientes existentes

## Stores de Zustand
```
authStore: accessToken, user, isAuthenticated
cartStore: items[], persistido
paymentStore: status (sin persistencia)
uiStore: theme, sidebar, toasts (sin persistencia)
```

## Navegación por Rol
- CLIENT: Catálogo → Carrito → Mis Pedidos → Perfil → Direcciones
- STOCK: Productos → Categorías → Ingredientes → Stock
- PEDIDOS: Panel de Pedidos
- ADMIN: Todas las anteriores + Usuarios + Métricas

## Dependencias
- auth.md (para autenticación)
- catalogo.md (para productos)
- pedidos.md (para pedidos)
- pagos.md (para checkout)

## Definition of Done
- [ ] Routing con guards por auth
- [ ] Menú adaptativo por rol
- [ ] Carrito persiste
- [ ] Refresh automático de token
- [ ] Manejo de errores consistente

## Recursos
- docs/Descripcion.md (sección 2 - Stack)
- docs/Historias_de_usuario.md (EPIC 02, 06)
- docs/Integrador.md (sección 9)