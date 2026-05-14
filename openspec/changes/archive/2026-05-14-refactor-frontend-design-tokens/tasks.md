## 1. shared/ui — Componentes base

- [x] 1.1 Button.tsx — Migrar variantStyles: primary → primary-500, danger → danger-500, secondary → surface-secondary, ghost → surface-tertiary. Añadir `active:scale-[0.98]` y `rounded-button`.
- [x] 1.2 Input.tsx — Migrar label → text-text-primary, focus ring → primary-400, border → border-default, error → danger-200/danger-400/danger-600, bg → bg-surface
- [x] 1.3 Toast.tsx — Migrar typeStyles: success → secondary-50/200/600, error → danger-50/200/600, info → primary-50/200/600, warning → accent-50/200/600
- [x] 1.4 ErrorBoundary.tsx — Migrar botón recargar → primary-500, textos → text-text-primary/secondary, bg code → surface-tertiary

## 2. widgets — Layout components

- [x] 2.1 Header.tsx — Migrar logo link → primary-500, nav links activos → primary-500, cart badge → danger-500, botón register → bg-primary-500, hover logout → danger-600
- [x] 2.2 Footer.tsx — Migrar bg-gray-800 → bg-primary-800
- [x] 2.3 AdminLayout.tsx — Migrar sidebar bg-gray-900 → bg-primary-800, logo text → primary-300, nav active → bg-primary-600/80, nav inactive → text-primary-200 hover:bg-primary-700/50, header → bg-surface border-border-default, role badges → primary-100/700, hover logout → danger-600
- [x] 2.4 Breadcrumbs.tsx — Migrar text → text-text-secondary/tertiary, hover → primary-500, divider → text-text-disabled
- [x] 2.5 CategoryTree.tsx — Migrar categoría activa → bg-primary-50 text-primary-700, inactiva → text-text-secondary hover:text-text-primary hover:bg-surface-secondary, borde → border-border-default

## 3. features/catalog — Catalog components

- [x] 3.1 ProductCard.tsx — Migrar card border → border-border-default, precio → primary-500/600, botón → primary-500 placeholder gray → surface-tertiary
- [x] 3.2 ProductGrid.tsx — (check if any color classes need migration)
- [x] 3.3 CategoryFilter.tsx — Migrar chip inactivo → bg-primary-50 text-primary-700, activo → bg-primary-500 text-white
- [x] 3.4 AllergenFilter.tsx — Migrar chip inactivo → bg-danger-50 text-danger-600 border-danger-200, activo → bg-danger-500 text-white
- [x] 3.5 Pagination.tsx — Migrar active page → bg-primary-500 text-white, inactive → text-text-secondary hover:bg-surface-secondary
- [x] 3.6 SearchBar.tsx — Migrar input border → border-default, focus ring → primary-400
- [x] 3.7 AddToCartButton.tsx — Migrar botón → primary-500/600 con active:scale
- [x] 3.8 IngredientList.tsx — Migrar alérgeno badge → danger-50 text-danger-600 border-danger-200
- [x] 3.9 ProductInfo.tsx — Migrar precio → primary-500, textos → text-text-primary/secondary

## 4. features/orders — Order components

- [x] 4.1 OrderStatusBadge.tsx — Migrar status colors: PENDIENTE → accent-100/600, CONFIRMADO → primary-100/600, EN_PREPARACION → secondary-100/600, EN_CAMINO → primary-100/600, ENTREGADO → secondary-100/600, CANCELADO → danger-100/600
- [x] 4.2 OrderCard.tsx — Migrar border → border-default, estado badge con paleta, precio → text-text-primary
- [x] 4.3 OrderTimeline.tsx — Migrar timeline dots/colors con paleta, textos → text-text-primary/secondary, connect lines → border-default

## 5. pages/client — Client-side pages

- [x] 5.1 HomePage.tsx — Migrar texto → text-text-secondary
- [x] 5.2 CatalogPage.tsx — Migrar título → text-text-primary, error text → danger-500, botón reintentar → primary-500
- [x] 5.3 CartPage.tsx — Migrar botón explorar → primary-500, textos → text-text-primary/secondary, border → border-default/res, empty state → text-text-disabled
- [x] 5.4 CheckoutPage.tsx — Migrar inputs border/default/focus → paleta, radio buttons → primary-500, resumen border → border-subtle, botón pagar → primary-500/600, errores → danger-50/200
- [x] 5.5 OrdersPage.tsx — Migrar filtro tabs active → primary-500, skeleton → surface-tertiary, botón explorar → primary-500, paginación → paleta
- [x] 5.6 OrderDetailPage.tsx — Migrar skeletons → surface-tertiary, estado badge → paleta, timeline → paleta, botón pagar → primary-500, botón cancelar → danger-50/600, focus ring → danger-400
- [x] 5.7 OrderConfirmationPage.tsx — Migrar iconos estado → paleta (procesando → primary, aprobado → secondary, rechazado → danger, pendiente → accent), botones → primary-500/ghost, textos → text-text-primary/secondary
- [x] 5.8 ProductDetailPage.tsx — Migrar skeleton → surface-tertiary, precio → primary-500, textos → text-text-primary/secondary
- [x] 5.9 LoginPage.tsx — Migrar card border → border-default, link registro → primary-500
- [x] 5.10 RegisterPage.tsx — Migrar card border → border-default, link login → primary-500
- [x] 5.11 NotFoundPage.tsx — Migrar 404 text → text-text-disabled, botón volver → primary-500

## 6. pages/admin — Admin pages

- [x] 6.1 DashboardPage.tsx — Migrar KPI cards border → border-default, títulos → text-text-primary, inputs → paleta, botones active/inactive → primary-500/surface-secondary, PIE_COLORS → paleta brand colors
- [x] 6.2 PedidosPage.tsx — Migrar tabla header → bg-surface-tertiary, row hover → hover:bg-surface-secondary, selected row → bg-primary-50, status badges → paleta completa (accent/primary/secondary/danger), botones → primary-500/danger-500, error → danger-50/200
- [x] 6.3 CatalogoPage.tsx — Migrar tabs → primary-500 active, tabla → header surface-tertiary, modal → paleta, form inputs → paleta, toggle → secondary-500/gray
- [x] 6.4 UsuariosPage.tsx — Migrar tabla → paleta, role badges: ADMIN → danger-100/700, CLIENT → primary-100/700, STOCK → accent-100/700, PEDIDOS → secondary-100/700, active/inactive toggle → secondary-500/danger-500
- [x] 6.5 StockPage.tsx — Migrar tabla → paleta, stock bajo → danger-500/600, stock suficiente → secondary-500/600, input cantidad → border-primary-400

## 7. Additional files (fuera del scope original pero migrados)

- [x] 7.1 LoginForm.tsx (features/auth) — Inputs, labels, botón, error box a paleta
- [x] 7.2 RegisterForm.tsx (features/auth) — Inputs, labels, botón, error box a paleta
- [x] 7.3 CartItemRow.tsx (features/cart) — Bordes, textos, hover, remove a paleta
- [x] 7.4 CartSummary.tsx (features/cart) — Bordes, textos, botón checkout a paleta
- [x] 7.5 AdminRoute.tsx (shared/guards) — Textos 403 a text-text-*
- [x] 7.6 RoleGuard.tsx (shared/guards) — Textos 403 a text-text-*
- [x] 7.7 router.tsx (app) — Skeleton loading bg-gray-200 → bg-surface-tertiary

## 8. Verification

- [x] 8.1 Ejecutar `npx tsc --noEmit` en frontend — solo errores preexistentes en OrderConfirmationPage.tsx (pedido possibly undefined)
- [x] 8.2 Verificar cero colores legacy remanentes — confirmado: `Get-ChildItem | Select-String` retorna 0 matches
