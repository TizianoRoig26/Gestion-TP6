import { useState, useCallback } from "react";
import { useAuthStore } from "../../shared/stores/authStore";
import { Button } from "../../shared/ui/Button";
import { getErrorMessage } from "../../shared/api/axios";
import {
  useUsuarios,
  useEditarUsuario,
  useCambiarRol,
  useToggleEstado,
  type AdminUsuario,
} from "../../shared/api/admin";

const ROLES_DISPONIBLES = ["ADMIN", "CLIENT", "STOCK", "PEDIDOS"] as const;

interface EditModalState {
  open: boolean;
  user: AdminUsuario | null;
  nombre: string;
  email: string;
  rol: string;
  saving: boolean;
  error: string;
}

interface DeactivateModalState {
  open: boolean;
  user: AdminUsuario | null;
  saving: boolean;
  error: string;
}

const initialEdit: EditModalState = {
  open: false,
  user: null,
  nombre: "",
  email: "",
  rol: "",
  saving: false,
  error: "",
};

const initialDeactivate: DeactivateModalState = {
  open: false,
  user: null,
  saving: false,
  error: "",
};

// ─── Colores para roles ────────────────────────────────────

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  CLIENT: "bg-blue-100 text-blue-700",
  STOCK: "bg-yellow-100 text-yellow-700",
  PEDIDOS: "bg-purple-100 text-purple-700",
};

function RoleBadge({ role }: { role: string }) {
  const color = ROLE_BADGE[role] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      {role}
    </span>
  );
}

// ─── Modal base reutilizable ───────────────────────────────

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────

export function AdminUsuariosPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filters = {
    page,
    page_size: pageSize,
    busqueda: busqueda || undefined,
    rol: filtroRol || undefined,
  };

  const { data, isLoading, error } = useUsuarios(filters);
  const editarMutation = useEditarUsuario();
  const cambiarRolMutation = useCambiarRol();
  const toggleEstadoMutation = useToggleEstado();

  // ── Edit modal state ──
  const [editModal, setEditModal] = useState<EditModalState>(initialEdit);

  const openEditModal = useCallback((user: AdminUsuario) => {
    setEditModal({
      open: true,
      user,
      nombre: user.nombre,
      email: user.email,
      rol: user.roles[0] ?? "CLIENT",
      saving: false,
      error: "",
    });
  }, []);

  const closeEditModal = useCallback(() => {
    setEditModal(initialEdit);
  }, []);

  const handleEditSave = useCallback(async () => {
    if (!editModal.user) return;
    setEditModal((prev) => ({ ...prev, saving: true, error: "" }));

    try {
      await editarMutation.mutateAsync({
        userId: editModal.user.id,
        data: { nombre: editModal.nombre, email: editModal.email },
      });

      // If role changed, call cambiarRol
      const currentRole = editModal.user.roles[0] ?? "CLIENT";
      if (editModal.rol !== currentRole) {
        await cambiarRolMutation.mutateAsync({
          userId: editModal.user.id,
          rolCodigo: editModal.rol,
        });
      }

      closeEditModal();
    } catch (err) {
      setEditModal((prev) => ({
        ...prev,
        saving: false,
        error: getErrorMessage(err),
      }));
    }
  }, [editModal, editarMutation, cambiarRolMutation, closeEditModal]);

  // ── Deactivate modal state ──
  const [deactivateModal, setDeactivateModal] =
    useState<DeactivateModalState>(initialDeactivate);

  const openDeactivateModal = useCallback((user: AdminUsuario) => {
    setDeactivateModal({
      open: true,
      user,
      saving: false,
      error: "",
    });
  }, []);

  const closeDeactivateModal = useCallback(() => {
    setDeactivateModal(initialDeactivate);
  }, []);

  const handleDeactivateConfirm = useCallback(async () => {
    if (!deactivateModal.user) return;
    setDeactivateModal((prev) => ({ ...prev, saving: true, error: "" }));

    try {
      await toggleEstado.mutateAsync({
        userId: deactivateModal.user.id,
        activo: !deactivateModal.user.activo,
      });
      closeDeactivateModal();
    } catch (err) {
      setDeactivateModal((prev) => ({
        ...prev,
        saving: false,
        error: getErrorMessage(err),
      }));
    }
  }, [deactivateModal, toggleEstado, closeDeactivateModal]);

  // ── Search handler with debounce ──
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBusqueda(e.target.value);
      setPage(1);
    },
    [],
  );

  const handleRoleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFiltroRol(e.target.value);
      setPage(1);
    },
    [],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Usuarios</h2>
        <p className="text-sm text-gray-500 mt-1">
          Gestion de usuarios del sistema
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Buscar
          </label>
          <input
            type="text"
            value={busqueda}
            onChange={handleSearchChange}
            placeholder="Nombre o email..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Filtro por rol
          </label>
          <select
            value={filtroRol}
            onChange={handleRoleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los roles</option>
            {ROLES_DISPONIBLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {getErrorMessage(error)}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  ID
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Nombre
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Email
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Roles
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Estado
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                data?.items.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-500">{user.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {user.nombre}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <RoleBadge key={role} role={role} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          user.activo
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.activo ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        {user.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(user)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant={user.activo ? "danger" : "secondary"}
                          onClick={() => openDeactivateModal(user)}
                        >
                          {user.activo ? "Desactivar" : "Activar"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Pagina {data.page} de {data.pages} ({data.total} usuarios)
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {editModal.open && editModal.user && (
        <Modal title="Editar usuario" onClose={closeEditModal}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={editModal.nombre}
                onChange={(e) =>
                  setEditModal((prev) => ({
                    ...prev,
                    nombre: e.target.value,
                    error: "",
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={editModal.email}
                onChange={(e) =>
                  setEditModal((prev) => ({
                    ...prev,
                    email: e.target.value,
                    error: "",
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                value={editModal.rol}
                onChange={(e) =>
                  setEditModal((prev) => ({
                    ...prev,
                    rol: e.target.value,
                    error: "",
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ROLES_DISPONIBLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {editModal.error && (
              <p className="text-sm text-red-600">{editModal.error}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={closeEditModal}>
                Cancelar
              </Button>
              <Button
                onClick={handleEditSave}
                isLoading={editModal.saving}
                disabled={
                  !editModal.nombre.trim() || !editModal.email.trim()
                }
              >
                Guardar cambios
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Deactivate / Activate Modal ── */}
      {deactivateModal.open && deactivateModal.user && (
        <Modal
          title={
            deactivateModal.user.activo
              ? "Desactivar usuario"
              : "Activar usuario"
          }
          onClose={closeDeactivateModal}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {deactivateModal.user.activo ? (
                <>
                  ¿Estas seguro de desactivar a{" "}
                  <strong>{deactivateModal.user.nombre}</strong>?
                  <br />
                  El usuario no podra iniciar sesion hasta que sea reactivado.
                </>
              ) : (
                <>
                  ¿Estas seguro de activar a{" "}
                  <strong>{deactivateModal.user.nombre}</strong>?
                  <br />
                  El usuario podra iniciar sesion nuevamente.
                </>
              )}
            </p>

            {/* Self-deactivation guard */}
            {deactivateModal.user.activo &&
              currentUser?.id === deactivateModal.user.id && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg text-sm">
                  No podes desactivar tu propia cuenta.
                </div>
              )}

            {deactivateModal.error && (
              <p className="text-sm text-red-600">{deactivateModal.error}</p>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={closeDeactivateModal}>
                Cancelar
              </Button>
              <Button
                variant={deactivateModal.user.activo ? "danger" : "primary"}
                onClick={handleDeactivateConfirm}
                isLoading={deactivateModal.saving}
                disabled={
                  deactivateModal.user.activo &&
                  currentUser?.id === deactivateModal.user.id
                }
              >
                {deactivateModal.user.activo
                  ? "Si, desactivar"
                  : "Si, activar"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
