## 1. Project Scaffold

- [x] 1.1 Initialize Vite + React + TypeScript project with SWC plugin
- [x] 1.2 Install dependencies: react-router-dom, @tanstack/react-query, zustand, axios, tailwindcss, @tailwindcss/vite, @mercadopago/sdk-react, recharts
- [x] 1.3 Configure TypeScript strict mode (`strict: true`)
- [x] 1.4 Configure Tailwind CSS v4 with `@tailwindcss/vite` plugin and `style.css` with `@import "tailwindcss"`
- [x] 1.5 Create `.env.example` with `VITE_API_URL` and `VITE_MP_PUBLIC_KEY`
- [x] 1.6 Verify `npm run dev` starts without errors on port 5173
- [x] 1.7 Verify `npm run build` produces a valid production bundle

## 2. FSD Directory Structure

- [x] 2.1 Create `src/app/` directory (App.tsx, main.tsx, router.tsx, providers.tsx)
- [x] 2.2 Create `src/pages/` directory (LoginPage.tsx, RegisterPage.tsx, NotFoundPage.tsx, HomePage.tsx)
- [x] 2.3 Create `src/widgets/` directory (Header.tsx, Sidebar.tsx, Footer.tsx)
- [x] 2.4 Create `src/features/` directory (auth/ with LoginForm.tsx, RegisterForm.tsx)
- [x] 2.5 Create `src/entities/` directory (user/types.ts)
- [x] 2.6 Create `src/shared/` directory (api/, stores/, guards/, lib/, ui/)

## 3. Axios HTTP Client

- [x] 3.1 Create Axios instance with `baseURL` from `VITE_API_URL`
- [x] 3.2 Implement request interceptor that attaches `Authorization: Bearer <token>` from authStore
- [x] 3.3 Implement response interceptor that catches 401 errors
- [x] 3.4 Implement refresh token logic: on 401, call `POST /api/v1/auth/refresh` with refresh token
- [x] 3.5 Implement request queue: pause concurrent requests during refresh, replay after success
- [x] 3.6 Handle refresh failure: clear authStore, redirect to login
- [x] 3.7 Set up Axios response interceptor for error mapping (400, 403, 404, 429, 500)

## 4. Zustand Stores

- [x] 4.1 Create `authStore` with state (accessToken, refreshToken, user, isAuthenticated), actions (login, logout, updateTokens), selectors (isAuthenticated, hasRole), and localStorage persistence with partialize
- [x] 4.2 Create `cartStore` with state (items: array of { productoId, producto, cantidad, personalizacion }), actions (addItem, removeItem, updateQuantity, clearCart), selectors (totalItems, totalPrice, getItem), and localStorage persistence
- [x] 4.3 Create `paymentStore` with state (checkoutStep, preferenceId, paymentStatus, error), actions (startCheckout, setPreference, updatePaymentStatus, resetPayment), WITHOUT persistence
- [x] 4.4 Create `uiStore` with state (theme, sidebarOpen, toasts), actions (toggleTheme, toggleSidebar, addToast, removeToast), with selective persistence (only theme)

## 5. TanStack Query Configuration

- [x] 5.1 Create `QueryClient` with defaults: `staleTime: 5 * 60 * 1000`, `retry: 1`, `refetchOnWindowFocus: false`
- [x] 5.2 Wrap app root with `QueryClientProvider`

## 6. Routing and Layout

- [x] 6.1 Create router configuration with react-router-dom v6 using createBrowserRouter
- [x] 6.2 Implement layout route with Header, Sidebar, Footer, and `<Outlet />`
- [x] 6.3 Create responsive Header component with logo, navigation links, and user menu
- [x] 6.4 Create responsive Sidebar component (collapsible, shows nav by role)
- [x] 6.5 Create Footer component with basic info
- [x] 6.6 Create HomePage placeholder component

## 7. Login and Register Pages

- [x] 7.1 Create LoginForm component with email, password inputs and validation
- [x] 7.2 Connect LoginForm to `POST /api/v1/auth/login` via Axios
- [x] 7.3 On successful login, update authStore and redirect to home
- [x] 7.4 Handle login errors: invalid credentials, rate limiting (429), network errors
- [x] 7.5 Create RegisterForm component with nombre, email, password, confirm password inputs
- [x] 7.6 Connect RegisterForm to `POST /api/v1/auth/register` via Axios
- [x] 7.7 On successful registration, update authStore and redirect to home
- [x] 7.8 Handle registration errors: duplicate email, password validation
- [x] 7.9 Create LoginPage and RegisterPage wrapping the forms

## 8. Route Guards

- [x] 8.1 Create `ProtectedRoute` component that redirects unauthenticated users to /login
- [x] 8.2 Create `RoleGuard` component that shows 403 page if user lacks required role
- [x] 8.3 Create `PublicOnlyRoute` component that redirects authenticated users away from login/register
- [x] 8.4 Wire up guards in router configuration

## 9. Error Handling and UI Primitives

- [x] 9.1 Create Toast notification system (toast store + Toast component with auto-dismiss)
- [x] 9.2 Create global error boundary component
- [x] 9.3 Create UI primitives: Button, Input components with Tailwind styling
- [x] 9.4 Implement error mapping: map HTTP status codes to user-friendly messages in Axios interceptor

## 10. Final Verification

- [x] 10.1 `npm run dev` starts without errors on port 5173
- [x] 10.2 `npm run build` completes without TypeScript or build errors
- [x] 10.3 Login flow code complete (form → API → authStore → redirect) — requires backend running for E2E verification
- [x] 10.4 Register flow code complete — requires backend running for E2E verification
- [x] 10.5 Route guards redirect unauthenticated users correctly — logic verified in code
- [x] 10.6 Cart persists across page refresh — Zustand persist middleware configured
- [x] 10.7 Theme toggle works and persists — Zustand partialize configured
- [x] 10.8 Token refresh flow code complete (interceptor + queue + retry) — requires backend running for E2E verification
