import { useState } from "react";
import { Link } from "react-router-dom";
import { useMisPedidos } from "../shared/api/pedidos";
import { OrderCard } from "../features/orders/OrderCard";

const ESTADOS_FILTRO = [
  { value: "", label: "Todos" },
  { value: "PENDIENTE", label: "Pendientes" },
  { value: "CONFIRMADO", label: "Confirmados" },
  { value: "EN_PREPARACION", label: "En preparación" },
  { value: "EN_CAMINO", label: "En camino" },
  { value: "ENTREGADO", label: "Entregados" },
  { value: "CANCELADO", label: "Cancelados" },
];

export function OrdersPage() {
  const [filtroEstado, setFiltroEstado] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useMisPedidos({
    estado: filtroEstado || undefined,
    page,
    page_size: 10,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis pedidos</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ESTADOS_FILTRO.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setFiltroEstado(f.value);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtroEstado === f.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-48 mb-2" />
              <div className="h-8 bg-gray-100 rounded mt-3" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Error al cargar los pedidos</p>
          <button
            onClick={() => setPage(1)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Intentar de nuevo
          </button>
        </div>
      )}

      {data && !isLoading && (
        <>
          {data.items.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-300 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <p className="text-gray-600 font-medium mb-1">No tenés pedidos todavía</p>
              <p className="text-gray-400 text-sm mb-6">Explorá el catálogo y hacé tu primer pedido</p>
              <Link
                to="/catalogo"
                className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Ver catálogo
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {data.items.map((pedido) => (
                  <OrderCard key={pedido.id} pedido={pedido} />
                ))}
              </div>

              {/* Pagination */}
              {data.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200
                               disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-gray-600">
                    Página {data.page} de {data.pages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                    disabled={page === data.pages}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200
                               disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
