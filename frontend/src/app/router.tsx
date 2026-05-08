import { createBrowserRouter, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Header } from "../widgets/Header";
import { Footer } from "../widgets/Footer";
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

function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded" />
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
]);
