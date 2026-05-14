import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

interface RoleGuardProps {
  allowedRoles: string[];
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasRequiredRole = allowedRoles.some((role) =>
    user?.roles.includes(role),
  );

  if (!hasRequiredRole) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold text-text-disabled mb-4">403</h2>
        <p className="text-xl text-text-secondary mb-4">
          No tenés permisos para esta acción
        </p>
        <p className="text-text-secondary">
          Si creés que esto es un error, contactá al administrador.
        </p>
      </div>
    );
  }

  return <Outlet />;
}
