import { useState, useCallback } from "react";
import { Button } from "../../shared/ui/Button";
import { getErrorMessage } from "../../shared/api/axios";
import {
  useAdminProductos,
  useAdminCategorias,
  useAdminIngredientes,
  useCreateProducto,
  useUpdateProducto,
  useDeleteProducto,
  useCreateCategoria,
  useUpdateCategoria,
  useDeleteCategoria,
  useCreateIngrediente,
  useUpdateIngrediente,
  useDeleteIngrediente,
  type AdminProductoCreate,
  type AdminProductoUpdate,
  type AdminCategoriaUpdate,
  type AdminIngredienteUpdate,
} from "../../shared/api/admin";
import type { Producto, CategoriaInfo } from "../../entities/product/types";
import type { Categoria, Ingrediente } from "../../entities/category/types";

// ─── Types for local state ─────────────────────────────────

type TabId = "productos" | "categorias" | "ingredientes";

interface ModalState<T> {
  open: boolean;
  mode: "create" | "edit";
  item: T | null;
  saving: boolean;
  error: string;
}

// ─── Default modal states ──────────────────────────────────

const initialModal = <T,>(): ModalState<T> => ({
  open: false,
  mode: "create",
  item: null,
  saving: false,
  error: "",
});

const initialDelete = {
  open: false,
  item: null as { id: number; nombre: string } | null,
  saving: false,
  error: "",
};

// ─── Reusable Modal wrapper ────────────────────────────────

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
      <div className="relative bg-white rounded-xl shadow-xl max-w-xl w-full mx-4 p-6 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-secondary transition-colors"
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

// ─── Tab Navigation ────────────────────────────────────────

const TABS: { id: TabId; label: string }[] = [
  { id: "productos", label: "Productos" },
  { id: "categorias", label: "Categorías" },
  { id: "ingredientes", label: "Ingredientes / Alérgenos" },
];

function TabBar({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) {
  return (
    <div className="flex border-b border-border-default mb-6">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
            active === tab.id
              ? "border-primary-500 text-primary-500"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─── Badge helpers ─────────────────────────────────────────

function Badge({ text, color }: { text: string; color?: string }) {
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${color ?? "bg-surface-tertiary text-text-primary"}`}>
      {text}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════

export function AdminCatalogoPage() {
  const [activeTab, setActiveTab] = useState<TabId>("productos");

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">Catálogo</h2>
      <p className="text-sm text-text-secondary mb-6">Gestión de productos, categorías e ingredientes</p>

      <TabBar active={activeTab} onChange={setActiveTab} />

      {activeTab === "productos" && <ProductosTab />}
      {activeTab === "categorias" && <CategoriasTab />}
      {activeTab === "ingredientes" && <IngredientesTab />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PRODUCTOS TAB
// ═══════════════════════════════════════════════════════════

type ProductoForm = Omit<AdminProductoCreate, "categoria_ids" | "ingrediente_ids"> & {
  categoria_ids: string;
  ingrediente_ids: string;
};

const emptyProductoForm = (): ProductoForm => ({
  nombre: "",
  descripcion: "",
  imagen_url: "",
  precio_base: 0,
  stock_cantidad: 0,
  disponible: true,
  categoria_ids: "",
  ingrediente_ids: "",
});

function ProductosTab() {
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const { data, isLoading, error } = useAdminProductos(busqueda || undefined, page, pageSize);
  const createMutation = useCreateProducto();
  const updateMutation = useUpdateProducto();
  const deleteMutation = useDeleteProducto();

  const { data: categorias } = useAdminCategorias();
  const { data: ingredientes } = useAdminIngredientes();

  // Modal state
  const [modal, setModal] = useState<ModalState<Producto>>(initialModal<Producto>());
  const [form, setForm] = useState<ProductoForm>(emptyProductoForm());
  const [del, setDel] = useState(initialDelete);

  const openCreate = useCallback(() => {
    setForm(emptyProductoForm());
    setModal({ open: true, mode: "create", item: null, saving: false, error: "" });
  }, []);

  const openEdit = useCallback((item: Producto) => {
    setForm({
      nombre: item.nombre,
      descripcion: item.descripcion ?? "",
      imagen_url: item.imagen_url ?? "",
      precio_base: item.precio_base,
      stock_cantidad: item.stock_cantidad,
      disponible: item.disponible,
      categoria_ids: (item.categorias ?? []).map((c) => c.id).join(","),
      ingrediente_ids: (item.ingredientes ?? []).map((i) => i.id).join(","),
    });
    setModal({ open: true, mode: "edit", item, saving: false, error: "" });
  }, []);

  const closeModal = useCallback(() => {
    setModal(initialModal<Producto>());
    setForm(emptyProductoForm());
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.nombre.trim() || form.precio_base <= 0) return;
    setModal((prev) => ({ ...prev, saving: true, error: "" }));

    const catIds = form.categoria_ids
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));
    const ingIds = form.ingrediente_ids
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));

    try {
      if (modal.mode === "create") {
        await createMutation.mutateAsync({
          nombre: form.nombre,
          descripcion: form.descripcion || undefined,
          imagen_url: form.imagen_url || undefined,
          precio_base: form.precio_base,
          stock_cantidad: form.stock_cantidad,
          disponible: form.disponible,
          categoria_ids: catIds,
          ingrediente_ids: ingIds,
        });
      } else if (modal.item) {
        const payload: AdminProductoUpdate = {};
        if (form.nombre !== modal.item.nombre) payload.nombre = form.nombre;
        if (form.descripcion !== (modal.item.descripcion ?? "")) payload.descripcion = form.descripcion || undefined;
        if (form.imagen_url !== (modal.item.imagen_url ?? "")) payload.imagen_url = form.imagen_url || undefined;
        if (form.precio_base !== modal.item.precio_base) payload.precio_base = form.precio_base;
        if (form.disponible !== modal.item.disponible) payload.disponible = form.disponible;
        payload.categoria_ids = catIds;
        payload.ingrediente_ids = ingIds;
        await updateMutation.mutateAsync({ id: modal.item.id, data: payload });
      }
      closeModal();
    } catch (err) {
      setModal((prev) => ({ ...prev, saving: false, error: getErrorMessage(err) }));
    }
  }, [form, modal, createMutation, updateMutation, closeModal]);

  const handleDelete = useCallback(async () => {
    if (!del.item) return;
    setDel((prev) => ({ ...prev, saving: true, error: "" }));
    try {
      await deleteMutation.mutateAsync(del.item.id);
      setDel(initialDelete);
    } catch (err) {
      setDel((prev) => ({ ...prev, saving: false, error: getErrorMessage(err) }));
    }
  }, [del, deleteMutation]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
    setPage(1);
  }, []);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={busqueda}
          onChange={handleSearchChange}
          placeholder="Buscar producto..."
          className="flex-1 min-w-[200px] px-3 py-2 border border-border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
        <Button onClick={openCreate}>+ Nuevo producto</Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-600 px-4 py-3 rounded-lg text-sm">
          {getErrorMessage(error)}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-border-default overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-tertiary border-b border-border-default">
                <th className="text-left px-4 py-3 font-medium text-text-secondary">ID</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Precio</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Stock</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Categorías</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Disponible</th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-text-tertiary">
                    Cargando productos...
                  </td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-text-tertiary">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                data?.items.map((producto, idx) => (
                  <tr key={producto.id} className={`hover:bg-surface-secondary transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-surface-secondary/50"}`}>
                    <td className="px-4 py-3 text-text-secondary">{producto.id}</td>
                    <td className="px-4 py-3 font-medium text-text-primary">{producto.nombre}</td>
                    <td className="px-4 py-3 text-text-primary">${producto.precio_base.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${(producto as Producto).stock_cantidad > 0 ? "text-secondary-600" : "text-danger-600"}`}>
                        {(producto as Producto).stock_cantidad}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {producto.categorias?.map((cat: CategoriaInfo) => (
                          <Badge key={cat.id} text={cat.nombre} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        producto.disponible ? "bg-secondary-100 text-secondary-600" : "bg-danger-100 text-danger-600"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${producto.disponible ? "bg-secondary-500" : "bg-danger-500"}`} />
                        {producto.disponible ? "Sí" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(producto)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => setDel({ open: true, item: { id: producto.id, nombre: producto.nombre }, saving: false, error: "" })}>
                          Eliminar
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-default bg-surface-tertiary">
            <p className="text-sm text-text-secondary">
              Página {data.page} de {data.pages} ({data.total} productos)
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Anterior
              </Button>
              <Button size="sm" variant="secondary" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {modal.open && (
        <Modal title={modal.mode === "create" ? "Nuevo producto" : "Editar producto"} onClose={closeModal}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1">Nombre *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-3 py-2 border border-border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Precio *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.precio_base}
                  onChange={(e) => setForm((prev) => ({ ...prev, precio_base: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Stock</label>
                <input
                  type="number"
                  min="0"
                  value={form.stock_cantidad}
                  onChange={(e) => setForm((prev) => ({ ...prev, stock_cantidad: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1">URL de imagen</label>
                <input
                  type="text"
                  value={form.imagen_url}
                  onChange={(e) => setForm((prev) => ({ ...prev, imagen_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Disponible</label>
                <select
                  value={String(form.disponible)}
                  onChange={(e) => setForm((prev) => ({ ...prev, disponible: e.target.value === "true" }))}
                  className="w-full px-3 py-2 border border-border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">IDs de categorías</label>
                <input
                  type="text"
                  value={form.categoria_ids}
                  onChange={(e) => setForm((prev) => ({ ...prev, categoria_ids: e.target.value }))}
                  placeholder="1, 2, 3"
                  className="w-full px-3 py-2 border border-border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
                {categorias && categorias.length > 0 && (
                  <p className="text-xs text-text-tertiary mt-1">
                    IDs disponibles: {categorias.map((c: Categoria) => `${c.id}:${c.nombre}`).join(", ")}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">IDs de ingredientes</label>
                <input
                  type="text"
                  value={form.ingrediente_ids}
                  onChange={(e) => setForm((prev) => ({ ...prev, ingrediente_ids: e.target.value }))}
                  placeholder="1, 2, 3"
                  className="w-full px-3 py-2 border border-border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
                {ingredientes && ingredientes.length > 0 && (
                  <p className="text-xs text-text-tertiary mt-1">
                    IDs disponibles: {ingredientes.map((i: Ingrediente) => `${i.id}:${i.nombre}`).join(", ")}
                  </p>
                )}
              </div>
            </div>

            {modal.error && <p className="text-sm text-danger-600">{modal.error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
              <Button onClick={handleSave} isLoading={modal.saving} disabled={!form.nombre.trim() || form.precio_base <= 0}>
                {modal.mode === "create" ? "Crear producto" : "Guardar cambios"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirmation ── */}
      {del.open && del.item && (
        <Modal title="Eliminar producto" onClose={() => setDel(initialDelete)}>
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              ¿Estás seguro de eliminar <strong>{del.item.nombre}</strong>?
              <br />
              Esta acción es irreversible (soft delete).
            </p>
            {del.error && <p className="text-sm text-danger-600">{del.error}</p>}
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDel(initialDelete)}>Cancelar</Button>
              <Button variant="danger" onClick={handleDelete} isLoading={del.saving}>Eliminar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CATEGORÍAS TAB
// ═══════════════════════════════════════════════════════════

interface CategoriaForm {
  nombre: string;
  descripcion: string;
  imagen: string;
  padre_id: string;
}

const emptyCategoriaForm = (): CategoriaForm => ({
  nombre: "",
  descripcion: "",
  imagen: "",
  padre_id: "",
});

function CategoriasTab() {
  const { data, isLoading, error } = useAdminCategorias();
  const createMutation = useCreateCategoria();
  const updateMutation = useUpdateCategoria();
  const deleteMutation = useDeleteCategoria();

  const [modal, setModal] = useState<ModalState<Categoria>>(initialModal<Categoria>());
  const [form, setForm] = useState<CategoriaForm>(emptyCategoriaForm());
  const [del, setDel] = useState(initialDelete);

  const openCreate = useCallback(() => {
    setForm(emptyCategoriaForm());
    setModal({ open: true, mode: "create", item: null, saving: false, error: "" });
  }, []);

  const openEdit = useCallback((item: Categoria) => {
    setForm({
      nombre: item.nombre,
      descripcion: item.descripcion ?? "",
      imagen: item.imagen ?? "",
      padre_id: item.padre_id !== null ? String(item.padre_id) : "",
    });
    setModal({ open: true, mode: "edit", item, saving: false, error: "" });
  }, []);

  const closeModal = useCallback(() => {
    setModal(initialModal<Categoria>());
    setForm(emptyCategoriaForm());
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.nombre.trim()) return;
    setModal((prev) => ({ ...prev, saving: true, error: "" }));

    const padreVal = form.padre_id.trim() ? parseInt(form.padre_id.trim()) : null;

    try {
      if (modal.mode === "create") {
        await createMutation.mutateAsync({
          nombre: form.nombre,
          descripcion: form.descripcion || undefined,
          imagen: form.imagen || undefined,
          padre_id: padreVal,
        });
      } else if (modal.item) {
        const payload: AdminCategoriaUpdate = {};
        if (form.nombre !== modal.item.nombre) payload.nombre = form.nombre;
        if (form.descripcion !== (modal.item.descripcion ?? "")) payload.descripcion = form.descripcion || undefined;
        if (form.imagen !== (modal.item.imagen ?? "")) payload.imagen = form.imagen || undefined;
        payload.padre_id = padreVal;
        await updateMutation.mutateAsync({ id: modal.item.id, data: payload });
      }
      closeModal();
    } catch (err) {
      setModal((prev) => ({ ...prev, saving: false, error: getErrorMessage(err) }));
    }
  }, [form, modal, createMutation, updateMutation, closeModal]);

  const handleDelete = useCallback(async () => {
    if (!del.item) return;
    setDel((prev) => ({ ...prev, saving: true, error: "" }));
    try {
      await deleteMutation.mutateAsync(del.item.id);
      setDel(initialDelete);
    } catch (err) {
      setDel((prev) => ({ ...prev, saving: false, error: getErrorMessage(err) }));
    }
  }, [del, deleteMutation]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>+ Nueva categoría</Button>
      </div>

      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-600 px-4 py-3 rounded-lg text-sm">
          {getErrorMessage(error)}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-border-default overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-tertiary border-b border-border-default">
                <th className="text-left px-4 py-3 font-medium text-text-secondary">ID</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Nivel</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Padre ID</th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-text-tertiary">Cargando categorías...</td>
                </tr>
              ) : !data || data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-text-tertiary">No hay categorías</td>
                </tr>
              ) : (
                data.map((cat: Categoria, idx: number) => (
                  <tr key={cat.id} className={`hover:bg-surface-secondary transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-surface-secondary/50"}`}
                      style={{ paddingLeft: `${cat.nivel * 20}px` }}>
                    <td className="px-4 py-3 text-text-secondary">{cat.id}</td>
                    <td className="px-4 py-3 font-medium text-text-primary" style={{ paddingLeft: `${16 + (cat.nivel || 0) * 20}px` }}>
                      {cat.nivel > 0 && <span className="text-text-tertiary mr-1">└─</span>}
                      {cat.nombre}
                    </td>
                    <td className="px-4 py-3">
                      <Badge text={`Nivel ${cat.nivel ?? 0}`} />
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{cat.padre_id ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(cat)}>Editar</Button>
                        <Button size="sm" variant="danger" onClick={() => setDel({ open: true, item: { id: cat.id, nombre: cat.nombre }, saving: false, error: "" })}>Eliminar</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modal.open && (
        <Modal title={modal.mode === "create" ? "Nueva categoría" : "Editar categoría"} onClose={closeModal}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Nombre *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                className="w-full px-3 py-2 border border-border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Descripción</label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">URL de imagen</label>
              <input
                type="text"
                value={form.imagen}
                onChange={(e) => setForm((prev) => ({ ...prev, imagen: e.target.value }))}
                className="w-full px-3 py-2 border border-border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Padre ID (dejar vacío si es raíz)</label>
              <input
                type="text"
                value={form.padre_id}
                onChange={(e) => setForm((prev) => ({ ...prev, padre_id: e.target.value }))}
                placeholder="ID de categoría padre"
                className="w-full px-3 py-2 border border-border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              {data && data.length > 0 && (
                <p className="text-xs text-text-tertiary mt-1">
                  IDs disponibles: {data.map((c: Categoria) => `${c.id}:${c.nombre}`).join(", ")}
                </p>
              )}
            </div>

            {modal.error && <p className="text-sm text-danger-600">{modal.error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
              <Button onClick={handleSave} isLoading={modal.saving} disabled={!form.nombre.trim()}>
                {modal.mode === "create" ? "Crear categoría" : "Guardar cambios"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {del.open && del.item && (
        <Modal title="Eliminar categoría" onClose={() => setDel(initialDelete)}>
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              ¿Estás seguro de eliminar <strong>{del.item.nombre}</strong>?
              <br />
              Esta acción es irreversible (soft delete).
            </p>
            {del.error && <p className="text-sm text-danger-600">{del.error}</p>}
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDel(initialDelete)}>Cancelar</Button>
              <Button variant="danger" onClick={handleDelete} isLoading={del.saving}>Eliminar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// INGREDIENTES TAB
// ═══════════════════════════════════════════════════════════

interface IngredienteForm {
  nombre: string;
  descripcion: string;
  es_alergeno: boolean;
}

const emptyIngredienteForm = (): IngredienteForm => ({
  nombre: "",
  descripcion: "",
  es_alergeno: false,
});

function IngredientesTab() {
  const { data, isLoading, error } = useAdminIngredientes();
  const createMutation = useCreateIngrediente();
  const updateMutation = useUpdateIngrediente();
  const deleteMutation = useDeleteIngrediente();

  const [modal, setModal] = useState<ModalState<Ingrediente>>(initialModal<Ingrediente>());
  const [form, setForm] = useState<IngredienteForm>(emptyIngredienteForm());
  const [del, setDel] = useState(initialDelete);

  const openCreate = useCallback(() => {
    setForm(emptyIngredienteForm());
    setModal({ open: true, mode: "create", item: null, saving: false, error: "" });
  }, []);

  const openEdit = useCallback((item: Ingrediente) => {
    setForm({
      nombre: item.nombre,
      descripcion: item.descripcion ?? "",
      es_alergeno: item.es_alergeno,
    });
    setModal({ open: true, mode: "edit", item, saving: false, error: "" });
  }, []);

  const closeModal = useCallback(() => {
    setModal(initialModal<Ingrediente>());
    setForm(emptyIngredienteForm());
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.nombre.trim()) return;
    setModal((prev) => ({ ...prev, saving: true, error: "" }));

    try {
      if (modal.mode === "create") {
        await createMutation.mutateAsync({
          nombre: form.nombre,
          descripcion: form.descripcion || undefined,
          es_alergeno: form.es_alergeno,
        });
      } else if (modal.item) {
        const payload: AdminIngredienteUpdate = {};
        if (form.nombre !== modal.item.nombre) payload.nombre = form.nombre;
        if (form.descripcion !== (modal.item.descripcion ?? "")) payload.descripcion = form.descripcion || undefined;
        if (form.es_alergeno !== modal.item.es_alergeno) payload.es_alergeno = form.es_alergeno;
        await updateMutation.mutateAsync({ id: modal.item.id, data: payload });
      }
      closeModal();
    } catch (err) {
      setModal((prev) => ({ ...prev, saving: false, error: getErrorMessage(err) }));
    }
  }, [form, modal, createMutation, updateMutation, closeModal]);

  const handleDelete = useCallback(async () => {
    if (!del.item) return;
    setDel((prev) => ({ ...prev, saving: true, error: "" }));
    try {
      await deleteMutation.mutateAsync(del.item.id);
      setDel(initialDelete);
    } catch (err) {
      setDel((prev) => ({ ...prev, saving: false, error: getErrorMessage(err) }));
    }
  }, [del, deleteMutation]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>+ Nuevo ingrediente</Button>
      </div>

      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-600 px-4 py-3 rounded-lg text-sm">
          {getErrorMessage(error)}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-border-default overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-tertiary border-b border-border-default">
                <th className="text-left px-4 py-3 font-medium text-text-secondary">ID</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Descripción</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Alérgeno</th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-text-tertiary">Cargando ingredientes...</td>
                </tr>
              ) : !data || data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-text-tertiary">No hay ingredientes</td>
                </tr>
              ) : (
                data.map((ing: Ingrediente, idx: number) => (
                  <tr key={ing.id} className={`hover:bg-surface-secondary transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-surface-secondary/50"}`}>
                    <td className="px-4 py-3 text-text-secondary">{ing.id}</td>
                    <td className="px-4 py-3 font-medium text-text-primary">{ing.nombre}</td>
                    <td className="px-4 py-3 text-text-secondary">{ing.descripcion || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        ing.es_alergeno ? "bg-danger-100 text-danger-600" : "bg-secondary-100 text-secondary-600"
                      }`}>
                        {ing.es_alergeno ? "⚠️ Alérgeno" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(ing)}>Editar</Button>
                        <Button size="sm" variant="danger" onClick={() => setDel({ open: true, item: { id: ing.id, nombre: ing.nombre }, saving: false, error: "" })}>Eliminar</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modal.open && (
        <Modal title={modal.mode === "create" ? "Nuevo ingrediente" : "Editar ingrediente"} onClose={closeModal}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Nombre *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                className="w-full px-3 py-2 border border-border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Descripción</label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Es alérgeno</label>
              <select
                value={String(form.es_alergeno)}
                onChange={(e) => setForm((prev) => ({ ...prev, es_alergeno: e.target.value === "true" }))}
                className="w-full px-3 py-2 border border-border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
            </div>

            {modal.error && <p className="text-sm text-danger-600">{modal.error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
              <Button onClick={handleSave} isLoading={modal.saving} disabled={!form.nombre.trim()}>
                {modal.mode === "create" ? "Crear ingrediente" : "Guardar cambios"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {del.open && del.item && (
        <Modal title="Eliminar ingrediente" onClose={() => setDel(initialDelete)}>
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              ¿Estás seguro de eliminar <strong>{del.item.nombre}</strong>?
              <br />
              Esta acción es irreversible (soft delete).
            </p>
            {del.error && <p className="text-sm text-danger-600">{del.error}</p>}
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDel(initialDelete)}>Cancelar</Button>
              <Button variant="danger" onClick={handleDelete} isLoading={del.saving}>Eliminar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
