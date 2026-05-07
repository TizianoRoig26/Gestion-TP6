import { createBrowserRouter, Outlet } from "react-router-dom";
import { Header } from "../widgets/Header";
import { Footer } from "../widgets/Footer";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ProtectedRoute } from "../shared/guards/ProtectedRoute";
import { PublicOnlyRoute } from "../shared/guards/PublicOnlyRoute";

function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet />
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
          // Placeholder for future protected pages
        ],
      },
    ],
  },
]);
