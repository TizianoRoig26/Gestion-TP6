import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

interface AdminRouteProps {
  allowedRoles?: string[];
}

export function AdminRoute({ allowedRoles }: AdminRouteProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const roles = allowedRoles ?? ["ADMIN", "STOCK", "PEDIDOS"];
  const hasRequiredRole = roles.some((role) =>
    user?.roles.includes(role),
  );

  if (!hasRequiredRole) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold text-gray-300 mb-4">403</h2>
        <p className="text-xl text-gray-600 mb-4">
          No tenés permisos para esta acción
        </p>
        <p className="text-gray-500">
          Si creés que esto es un error, contactá al administrador.
        </p>
      </div>
    );
  }

  return <Outlet />;
}
