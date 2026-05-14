import { createBrowserRouter, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Header } from "../widgets/Header";
import { Footer } from "../widgets/Footer";
import { AdminLayout } from "../widgets/AdminLayout";
import { AdminRoute } from "../shared/guards/AdminRoute";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { CatalogPage } from "../pages/CatalogPage";
import { ProductDetailPage } from "../pages/ProductDetailPage";
import { ProtectedRoute } from "../shared/guards/ProtectedRoute";
import { PublicOnlyRoute } from "../shared/guards/PublicOnlyRoute";

// Lazy-loaded pages
const CartPage = lazy(() =>
  import("../pages/CartPage").then((m) => ({ default: m.CartPage })),
);
const CheckoutPage = lazy(() =>
  import("../pages/CheckoutPage").then((m) => ({ default: m.CheckoutPage })),
);
const OrderConfirmationPage = lazy(() =>
  import("../pages/OrderConfirmationPage").then((m) => ({
    default: m.OrderConfirmationPage,
  })),
);
const OrdersPage = lazy(() =>
  import("../pages/OrdersPage").then((m) => ({ default: m.OrdersPage })),
);
const OrderDetailPage = lazy(() =>
  import("../pages/OrderDetailPage").then((m) => ({
    default: m.OrderDetailPage,
  })),
);

// Lazy-loaded admin pages
const DashboardPage = lazy(() =>
  import("../pages/admin/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);
const AdminUsuariosPage = lazy(() =>
  import("../pages/admin/UsuariosPage").then((m) => ({
    default: m.AdminUsuariosPage,
  })),
);
const AdminPedidosPage = lazy(() =>
  import("../pages/admin/PedidosPage").then((m) => ({
    default: m.AdminPedidosPage,
  })),
);
const AdminCatalogoPage = lazy(() =>
  import("../pages/admin/CatalogoPage").then((m) => ({
    default: m.AdminCatalogoPage,
  })),
);
const AdminStockPage = lazy(() =>
  import("../pages/admin/StockPage").then((m) => ({
    default: m.AdminStockPage,
  })),
);

function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-surface-tertiary rounded w-1/3" />
        <div className="h-64 bg-surface-tertiary rounded" />
      </div>
    </div>
  );
}

function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // Public routes
      { path: "/", element: <HomePage /> },
      { path: "/catalogo", element: <CatalogPage /> },
      { path: "/catalogo/:id", element: <ProductDetailPage /> },
      { path: "/carrito", element: <CartPage /> },
      { path: "*", element: <NotFoundPage /> },

      // Auth routes (redirect to / if already authenticated)
      {
        element: <PublicOnlyRoute />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
        ],
      },

      // Protected routes (require authentication)
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/checkout", element: <CheckoutPage /> },
          { path: "/pedido-confirmado/:id", element: <OrderConfirmationPage /> },
          { path: "/mis-pedidos", element: <OrdersPage /> },
          { path: "/mis-pedidos/:id", element: <OrderDetailPage /> },
        ],
      },
    ],
  },

  // Admin routes (separate layout with sidebar, no public header/footer)
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/admin", element: <DashboardPage /> },
          { path: "/admin/usuarios", element: <AdminUsuariosPage /> },
          { path: "/admin/pedidos", element: <AdminPedidosPage /> },
          { path: "/admin/catalogo", element: <AdminCatalogoPage /> },
          { path: "/admin/stock", element: <AdminStockPage /> },
        ],
      },
    ],
  },
]);
