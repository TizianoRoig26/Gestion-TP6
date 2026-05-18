import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../shared/stores/authStore";
import { useCartStore } from "../shared/stores/cartStore";

export function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());

  const navLinks = [
    { to: "/", label: "Inicio" },
    { to: "/catalogo", label: "Catálogo" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white shadow-sm border-b border-border-default sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Navigation */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-500">
              <img
                src="/images/logo-aji.svg"
                alt="BigPepper"
                className="size-10"
              />
              BigPepper
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) =>
                    `transition-colors ${
                      isActive
                        ? "text-primary-500 font-medium"
                        : "text-text-secondary hover:text-primary-500"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right side: Cart + Auth */}
          <div className="flex items-center gap-4">
            {/* Cart link with badge */}
            <NavLink
              to="/carrito"
              className={({ isActive }) =>
                `relative p-2 transition-colors ${
                  isActive
                    ? "text-primary-500"
                    : "text-text-secondary hover:text-primary-500"
                }`
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-danger-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </NavLink>

            {/* Authenticated user menu */}
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/mis-pedidos"
                  className={({ isActive }) =>
                    `transition-colors ${
                      isActive
                        ? "text-primary-500 font-medium"
                        : "text-text-secondary hover:text-primary-500"
                    }`
                  }
                >
                  Mis Pedidos
                </NavLink>
                {user?.roles.some((r) =>
                  ["ADMIN", "STOCK", "PEDIDOS"].includes(r),
                ) && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `transition-colors ${
                        isActive
                          ? "text-primary-500 font-medium"
                          : "text-text-secondary hover:text-primary-500"
                      }`
                    }
                  >
                    Admin
                  </NavLink>
                )}
                <div className="flex items-center gap-2 pl-2 border-l border-border-default">
                  <span className="text-sm text-text-primary font-medium">
                    {user?.nombre}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-text-tertiary hover:text-danger-600 transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-text-secondary hover:text-primary-500 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
