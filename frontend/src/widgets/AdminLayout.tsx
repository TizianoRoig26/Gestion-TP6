import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../shared/stores/authStore";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
}

function DashboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}

function CatalogIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function StockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

const navItems: NavItem[] = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: <DashboardIcon />,
    roles: ["ADMIN", "STOCK", "PEDIDOS"],
  },
  {
    to: "/admin/usuarios",
    label: "Usuarios",
    icon: <UsersIcon />,
    roles: ["ADMIN"],
  },
  {
    to: "/admin/pedidos",
    label: "Pedidos",
    icon: <OrdersIcon />,
    roles: ["ADMIN", "PEDIDOS"],
  },
  {
    to: "/admin/catalogo",
    label: "Catálogo",
    icon: <CatalogIcon />,
    roles: ["ADMIN", "STOCK"],
  },
  {
    to: "/admin/stock",
    label: "Stock",
    icon: <StockIcon />,
    roles: ["ADMIN", "STOCK"],
  },
];

function AdminSidebar() {
  const user = useAuthStore((state) => state.user);
  const userRoles = user?.roles ?? [];

  const visibleItems = navItems.filter((item) =>
    item.roles.some((role) => userRoles.includes(role)),
  );

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
      {/* Logo / Brand */}
      <div className="px-6 py-5 border-b border-gray-700">
        <NavLink to="/admin" className="text-lg font-bold text-blue-400">
          Food Store Admin
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Back to site */}
      <div className="px-3 py-4 border-t border-gray-700">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Volver al sitio</span>
        </NavLink>
      </div>
    </aside>
  );
}

function AdminHeader() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-gray-800">Panel de Administración</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">
          {user?.nombre}
          <span className="ml-2 inline-flex items-center gap-1">
            {user?.roles.map((role) => (
              <span
                key={role}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium"
              >
                {role}
              </span>
            ))}
          </span>
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}

export function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
