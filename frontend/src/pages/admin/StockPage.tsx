import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "../../shared/ui/Button";
import { getErrorMessage } from "../../shared/api/axios";
import {
  useProducts,
  useUpdateStock,
  useToggleDisponible,
} from "../../shared/api/catalogos";
import type { ProductoList } from "../../entities/product/types";

// ─── Inline editable stock cell ────────────────────────────

function StockCell({
  product,
  onSave,
}: {
  product: ProductoList;
  onSave: (id: number, value: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(product.stock_cantidad));
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = useCallback(async () => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) {
      setValue(String(product.stock_cantidad));
      setEditing(false);
      return;
    }
    if (num === product.stock_cantidad) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      await onSave(product.id, num);
      setEditing(false);
    } catch {
      setValue(String(product.stock_cantidad));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }, [value, product.id, product.stock_cantidad, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSave();
      if (e.key === "Escape") {
        setValue(String(product.stock_cantidad));
        setEditing(false);
      }
    },
    [handleSave, product.stock_cantidad],
  );

  const isLowStock = product.stock_cantidad < 5 && product.stock_cantidad > 0;
  const isOutOfStock = product.stock_cantidad === 0;

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          disabled={saving}
          className="w-20 px-2 py-1 border border-blue-400 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {saving && (
          <svg
            className="animate-spin h-4 w-4 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
      </div>
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={`cursor-pointer border border-transparent hover:border-gray-300 rounded px-2 py-1 inline-block transition-colors ${
        isOutOfStock
          ? "text-red-600 font-bold"
          : isLowStock
            ? "text-red-500 font-medium"
            : "text-gray-800"
      }`}
      title="Click para editar"
    >
      {product.stock_cantidad}
    </span>
  );
}

// ─── Toggle confirmation modal ─────────────────────────────

interface ToggleModalState {
  open: boolean;
  product: ProductoList | null;
  nuevoEstado: boolean;
  saving: boolean;
  error: string;
}

const initialToggle: ToggleModalState = {
  open: false,
  product: null,
  nuevoEstado: false,
  saving: false,
  error: "",
};

function ToggleModal({
  state,
  onClose,
  onConfirm,
}: {
  state: ToggleModalState;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  if (!state.open || !state.product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6 z-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {state.nuevoEstado ? "Habilitar producto" : "Deshabilitar producto"}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {state.nuevoEstado ? (
            <>
              ¿Estas seguro de habilitar <strong>{state.product.nombre}</strong>?
              <br />
              El producto volvera a ser visible en el catalogo.
            </>
          ) : (
            <>
              ¿Estas seguro de deshabilitar{" "}
              <strong>{state.product.nombre}</strong>?
              <br />
              El producto no se mostrara en el catalogo hasta que sea
              habilitado nuevamente.
            </>
          )}
        </p>
        {state.error && (
          <p className="text-sm text-red-600 mb-4">{state.error}</p>
        )}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant={state.nuevoEstado ? "primary" : "danger"}
            onClick={onConfirm}
            isLoading={state.saving}
          >
            {state.nuevoEstado ? "Si, habilitar" : "Si, deshabilitar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────

export function AdminStockPage() {
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const filters = {
    search: busqueda || undefined,
    page,
    page_size: pageSize,
  };

  const { data, isLoading, error } = useProducts(filters);
  const updateStock = useUpdateStock();
  const toggleDisponible = useToggleDisponible();

  const [toggleModal, setToggleModal] = useState<ToggleModalState>(
    initialToggle,
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBusqueda(e.target.value);
      setPage(1);
    },
    [],
  );

  const handleStockSave = useCallback(
    async (productId: number, value: number) => {
      await updateStock.mutateAsync({
        productoId: productId,
        stockCantidad: value,
      });
    },
    [updateStock],
  );

  const openToggleModal = useCallback(
    (product: ProductoList) => {
      setToggleModal({
        open: true,
        product,
        nuevoEstado: !product.disponible,
        saving: false,
        error: "",
      });
    },
    [],
  );

  const closeToggleModal = useCallback(() => {
    setToggleModal(initialToggle);
  }, []);

  const handleToggleConfirm = useCallback(async () => {
    if (!toggleModal.product) return;
    setToggleModal((prev) => ({ ...prev, saving: true, error: "" }));
    try {
      await toggleDisponible.mutateAsync({
        productoId: toggleModal.product.id,
        disponible: toggleModal.nuevoEstado,
      });
      closeToggleModal();
    } catch (err) {
      setToggleModal((prev) => ({
        ...prev,
        saving: false,
        error: getErrorMessage(err),
      }));
    }
  }, [toggleModal, toggleDisponible, closeToggleModal]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Stock</h2>
        <p className="text-sm text-gray-500 mt-1">
          Gestion de stock y disponibilidad de productos
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="max-w-sm">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Buscar producto
          </label>
          <input
            type="text"
            value={busqueda}
            onChange={handleSearchChange}
            placeholder="Nombre del producto..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Error */}
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
                  Producto
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Precio
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Stock
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Disponible
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">
                  Accion
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    Cargando productos...
                  </td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                data?.items.map((product: ProductoList, idx: number) => (
                  <tr
                    key={product.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    } ${!product.disponible ? "opacity-60" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {product.nombre}
                      </p>
                      {product.categorias &&
                        product.categorias.length > 0 && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {product.categorias
                              .map((c) => c.nombre)
                              .join(", ")}
                          </p>
                        )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      ${product.precio_base.toLocaleString("es-AR")}
                    </td>
                    <td className="px-4 py-3">
                      <StockCell
                        product={product}
                        onSave={handleStockSave}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          product.disponible
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            product.disponible
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                        {product.disponible ? "Si" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant={product.disponible ? "danger" : "primary"}
                        onClick={() => openToggleModal(product)}
                      >
                        {product.disponible
                          ? "Deshabilitar"
                          : "Habilitar"}
                      </Button>
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
              Pagina {data.page} de {data.pages} ({data.total} productos)
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

      {/* Toggle modal */}
      <ToggleModal
        state={toggleModal}
        onClose={closeToggleModal}
        onConfirm={handleToggleConfirm}
      />
    </div>
  );
}
