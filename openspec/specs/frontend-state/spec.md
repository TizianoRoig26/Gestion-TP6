## ADDED Requirements

### Requirement: authStore
The authStore SHALL manage authentication state with persistence in localStorage.

#### Scenario: Store structure
- **WHEN** the authStore is initialized
- **THEN** it SHALL contain: `accessToken` (string | null), `refreshToken` (string | null), `user` ({ id, nombre, email, roles } | null), `isAuthenticated` (boolean)

#### Scenario: Login action
- **WHEN** `login(tokens, user)` is called
- **THEN** the store SHALL set accessToken, refreshToken, user, and isAuthenticated to true

#### Scenario: Logout action
- **WHEN** `logout()` is called
- **THEN** the store SHALL clear all auth state and remove it from localStorage

#### Scenario: Token update
- **WHEN** `updateTokens(newTokens)` is called (after refresh)
- **THEN** the store SHALL update accessToken and refreshToken

#### Scenario: Role checking selector
- **WHEN** `hasRole(role)` selector is called
- **THEN** it SHALL return true if the user has the specified role

#### Scenario: Partial persistence
- **WHEN** the auth state is persisted to localStorage
- **THEN** the `isLoading` transient state SHALL be excluded via `partialize`

### Requirement: cartStore
The cartStore SHALL manage shopping cart state with persistence in localStorage.

#### Scenario: Store structure
- **WHEN** the cartStore is initialized
- **THEN** it SHALL contain `items` as an array of `{ productoId, producto, cantidad, personalizacion }`

#### Scenario: Add item
- **WHEN** `addItem(producto, cantidad, personalizacion)` is called
- **THEN** if the product is already in the cart, its quantity SHALL be incremented
- **THEN** if the product is not in the cart, a new item SHALL be added

#### Scenario: Remove item
- **WHEN** `removeItem(productoId)` is called
- **THEN** the item SHALL be removed from the cart

#### Scenario: Update quantity
- **WHEN** `updateQuantity(productoId, cantidad)` is called
- **THEN** the item's quantity SHALL be updated

#### Scenario: Clear cart
- **WHEN** `clearCart()` is called
- **THEN** all items SHALL be removed from the cart

#### Scenario: Total items selector
- **WHEN** `totalItems()` selector is called
- **THEN** it SHALL return the sum of all item quantities

#### Scenario: Total price selector
- **WHEN** `totalPrice()` selector is called
- **THEN** it SHALL return the sum of (item.precio * item.cantidad) for all items

#### Scenario: Cart persistence
- **WHEN** the page is refreshed or the browser is closed and reopened
- **THEN** the cart items SHALL be restored from localStorage

### Requirement: paymentStore
The paymentStore SHALL manage payment/checkout state WITHOUT persistence.

#### Scenario: Store structure
- **WHEN** the paymentStore is initialized
- **THEN** it SHALL contain: `checkoutStep`, `preferenceId` (string | null), `paymentStatus` (string | null), `error` (string | null)

#### Scenario: Start checkout
- **WHEN** `startCheckout(pedidoId)` is called
- **THEN** checkoutStep SHALL be set to "processing"

#### Scenario: Set preference
- **WHEN** `setPreference(preferenceId)` is called
- **THEN** the preferenceId SHALL be stored

#### Scenario: Reset payment
- **WHEN** `resetPayment()` is called
- **THEN** all payment state SHALL return to initial values

#### Scenario: No persistence
- **WHEN** the page is refreshed
- **THEN** paymentStore state SHALL be reset to initial values (no localStorage persistence)

### Requirement: uiStore
The uiStore SHALL manage UI state with selective persistence.

#### Scenario: Store structure
- **WHEN** the uiStore is initialized
- **THEN** it SHALL contain: `theme` ("light" | "dark"), `sidebarOpen` (boolean), `toasts` (array)

#### Scenario: Toggle theme
- **WHEN** `toggleTheme()` is called
- **THEN** the theme SHALL switch between "light" and "dark"

#### Scenario: Selective persistence
- **WHEN** the uiStore is persisted to localStorage
- **THEN** only `theme` SHALL be persisted, NOT `sidebarOpen` or `toasts`
