import { useState, useCallback } from "react";
import { Button } from "../../shared/ui/Button";
import { getErrorMessage } from "../../shared/api/axios";
import {
  useAllPedidos,
  usePedidoAdmin,
  useHistorialAdmin,
  useCambiarEstado,
} from "../../shared/api/pedidos";
import type { PedidoResumen, HistorialEstado } from "../../entities/order/types";

// ─── FSM: transiciones disponibles para admin ──────────────

const FSM_TRANSITIONS: Record<string, string[]> = {
  PENDIENTE: ["CONFIRMADO", "CANCELADO"],
  CONFIRMADO: ["EN_PREPARACION", "CANCELADO"],
  EN_PREPARACION: ["EN_CAMINO", "CANCELADO"],
  EN_CAMINO: ["ENTREGADO"],
  ENTREGADO: [],
  CANCELADO: [],
};

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En preparacion",
  EN_CAMINO: "En camino",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-700",
  CONFIRMADO: "bg-blue-100 text-blue-700",
  EN_PREPARACION: "bg-purple-100 text-purple-700",
  EN_CAMINO: "bg-cyan-100 text-cyan-700",
  ENTREGADO: "bg-green-100 text-green-700",
  CANCELADO: "bg-red-100 text-red-700",
};

function EstadoBadge({ codigo }: { codigo: string }) {
  const color = ESTADO_COLORS[codigo] ?? "bg-gray-100 text-gray-700";
  const label = ESTADO_LABELS[codigo] ?? codigo;
  return (
    <span
      className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${color}`}
    >
      {label}
    </span>
  );
}

// ─── Motivo de cancelación ─────────────────────────────────

const ESTADOS_CON_MOTIVO = new Set(["PENDIENTE", "CONFIRMADO", "EN_PREPARACION"]);

function necesitaMotivo(estadoActual: string): boolean {
  return ESTADOS_CON_MOTIVO.has(estadoActual);
}

// ─── Timeline component ────────────────────────────────────

function Timeline({ historial }: { historial: HistorialEstado[] }) {
  if (!historial || historial.length === 0) {
    return <p className="text-sm text-gray-400">Sin historial</p>;
  }

  return (
    <div className="relative space-y-0">
      {historial.map((h, idx) => (
        <div key={h.id} className="flex gap-4 pb-4 last:pb-0">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-200 z-10" />
            {idx < historial.length - 1 && (
              <div className="w-0.5 flex-1 bg-blue-200 -mt-0.5" />
            )}
          </div>
          {/* Content */}
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-800">
                {ESTADO_LABELS[h.estado_hacia] ?? h.estado_hacia}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(h.creado_en).toLocaleString("es-AR")}
              </span>
            </div>
            {h.observacion && (
              <p className="text-xs text-gray-500 mt-0.5">{h.observacion}</p>
            )}
            {h.estado_desde && (
              <p className="text-xs text-gray-400 mt-0.5">
                desde {ESTADO_LABELS[h.estado_desde] ?? h.estado_desde}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Modal de motivo ───────────────────────────────────────

interface MotivoModalState {
  open: boolean;
  pedidoId: number;
  estadoActual: string;
  estadoDestino: string;
  saving: boolean;
  error: string;
}

const initialMotivo: MotivoModalState = {
  open: false,
  pedidoId: 0,
  estadoActual: "",
  estadoDestino: "",
  saving: false,
  error: "",
};

function MotivoModal({
  state,
  onClose,
  onConfirm,
}: {
  state: MotivoModalState;
  onClose: () => void;
  onConfirm: (motivo: string) => Promise<void>;
}) {
  const [motivo, setMotivo] = useState("");

  if (!state.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6 z-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Motivo de cancelacion
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {necesitaMotivo(state.estadoActual)
            ? "El motivo es obligatorio para cancelar este pedido."
            : "Opcionalmente agregá un motivo:"}
        </p>
        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Describí el motivo..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        {state.error && (
          <p className="text-sm text-red-600 mt-2">{state.error}</p>
        )}
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => onConfirm(motivo)}
            isLoading={state.saving}
            disabled={
              necesitaMotivo(state.estadoActual) && !motivo.trim()
            }
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail panel ──────────────────────────────────────────

function PedidoDetail({
  pedidoId,
  onClose,
}: {
  pedidoId: number;
  onClose: () => void;
}) {
  const { data: pedido, isLoading } = usePedidoAdmin(pedidoId);
  const { data: historial } = useHistorialAdmin(pedidoId);
  const cambiarEstado = useCambiarEstado();

  const [selectedState, setSelectedState] = useState("");
  const [motivoModal, setMotivoModal] = useState<MotivoModalState>(initialMotivo);

  const handleTransition = useCallback(
    (nuevoEstado: string) => {
      if (!pedido) return;
      const estadoActual = pedido.estado_codigo;
      setSelectedState(nuevoEstado);

      // If cancelling from a state that requires motivo, show modal
      if (
        nuevoEstado === "CANCELADO" &&
        necesitaMotivo(estadoActual)
      ) {
        setMotivoModal({
          open: true,
          pedidoId: pedido.id,
          estadoActual,
          estadoDestino: nuevoEstado,
          saving: false,
          error: "",
        });
        return;
      }

      // Direct transition (no motivo required)
      handleConfirmTransition(pedido.id, nuevoEstado, undefined);
    },
    [pedido],
  );

  const handleConfirmTransition = useCallback(
    async (id: number, estado: string, observacion?: string) => {
      try {
        await cambiarEstado.mutateAsync({
          pedidoId: id,
          data: { estado_codigo: estado, observacion },
        });
        setMotivoModal(initialMotivo);
        setSelectedState("");
      } catch (err) {
        setSelectedState("");
        setMotivoModal((prev) => ({
          ...prev,
          saving: false,
          error: getErrorMessage(err),
        }));
      }
    },
    [cambiarEstado],
  );

  const closeMotivoModal = useCallback(() => {
    setMotivoModal(initialMotivo);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-20 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!pedido) return null;

  const transiciones = FSM_TRANSITIONS[pedido.estado_codigo] ?? [];

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-6">
      {/* Close button */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800">
          Pedido #{pedido.id}
        </h4>
        <button
          onClick={onClose}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Cerrar detalle
        </button>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-sm font-medium text-gray-800">
            ${pedido.total.toLocaleString("es-AR")}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Estado</p>
          <EstadoBadge codigo={pedido.estado_codigo} />
        </div>
        <div>
          <p className="text-xs text-gray-500">Forma de pago</p>
          <p className="text-sm font-medium text-gray-800">
            {pedido.forma_pago?.nombre ?? pedido.forma_pago_codigo}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Fecha</p>
          <p className="text-sm font-medium text-gray-800">
            {new Date(pedido.creado_en).toLocaleDateString("es-AR")}
          </p>
        </div>
      </div>

      {/* Items */}
      {pedido.detalles && pedido.detalles.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">
            Items ({pedido.detalles.length})
          </h5>
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {pedido.detalles.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {item.cantidad}x
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    {item.nombre_snapshot}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  ${item.subtotal.toLocaleString("es-AR")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* State transition */}
      {transiciones.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">
            Cambiar estado
          </h5>
          <div className="flex flex-wrap items-center gap-2">
            {transiciones.map((estado) => (
              <Button
                key={estado}
                size="sm"
                variant={estado === "CANCELADO" ? "danger" : "primary"}
                onClick={() => handleTransition(estado)}
                isLoading={
                  selectedState === estado
                }
              >
                {ESTADO_LABELS[estado] ?? estado}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div>
        <h5 className="text-sm font-medium text-gray-700 mb-3">
          Historial de estados
        </h5>
        <Timeline historial={historial ?? []} />
      </div>

      {/* Motivo modal */}
      <MotivoModal
        state={motivoModal}
        onClose={closeMotivoModal}
        onConfirm={async (motivo) => {
          setMotivoModal((prev) => ({ ...prev, saving: true, error: "" }));
          await handleConfirmTransition(
            motivoModal.pedidoId,
            motivoModal.estadoDestino,
            motivo || undefined,
          );
        }}
      />
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────

export function AdminPedidosPage() {
  const [filtroEstado, setFiltroEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPedidoId, setSelectedPedidoId] = useState<number | null>(
    null,
  );

  const filters = {
    page,
    page_size: 15,
    estado: filtroEstado || undefined,
    busqueda: busqueda || undefined,
    desde: desde || undefined,
    hasta: hasta || undefined,
  };

  const { data, isLoading, error } = useAllPedidos(filters);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBusqueda(e.target.value);
      setPage(1);
    },
    [],
  );

  const handleEstadoFilter = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFiltroEstado(e.target.value);
      setPage(1);
    },
    [],
  );

  const toggleDetail = useCallback((pedidoId: number) => {
    setSelectedPedidoId((prev) => (prev === pedidoId ? null : pedidoId));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Pedidos</h2>
        <p className="text-sm text-gray-500 mt-1">
          Gestion de pedidos del sistema
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Buscar
          </label>
          <input
            type="text"
            value={busqueda}
            onChange={handleSearchChange}
            placeholder="ID o nombre de cliente..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Estado
          </label>
          <select
            value={filtroEstado}
            onChange={handleEstadoFilter}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {Object.entries(ESTADO_LABELS).map(([codigo, label]) => (
              <option key={codigo} value={codigo}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Desde
          </label>
          <input
            type="date"
            value={desde}
            onChange={(e) => {
              setDesde(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Hasta
          </label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => {
              setHasta(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  ID
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Cliente
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Estado
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Total
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Items
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Fecha
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">
                  Accion
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    Cargando pedidos...
                  </td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    No se encontraron pedidos
                  </td>
                </tr>
              ) : (
                data?.items.flatMap((pedido: PedidoResumen, idx: number) => {
                  const rows: React.ReactNode[] = [
                    <tr
                      key={pedido.id}
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      } ${selectedPedidoId === pedido.id ? "bg-blue-50" : ""}`}
                      onClick={() => toggleDetail(pedido.id)}
                    >
                      <td className="px-4 py-3 text-gray-500">
                        #{pedido.id}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        Cliente #{pedido.usuario_id}
                      </td>
                      <td className="px-4 py-3">
                        <EstadoBadge codigo={pedido.estado_codigo} />
                      </td>
                      <td className="px-4 py-3 text-gray-800 font-medium">
                        ${pedido.total.toLocaleString("es-AR")}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {pedido.items_count}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(pedido.creado_en).toLocaleDateString(
                          "es-AR",
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDetail(pedido.id);
                          }}
                        >
                          {selectedPedidoId === pedido.id
                            ? "Cerrar"
                            : "Ver"}
                        </Button>
                      </td>
                    </tr>,
                  ];

                  if (selectedPedidoId === pedido.id) {
                    rows.push(
                      <tr key={`detail-${pedido.id}`}>
                        <td colSpan={7} className="px-4 py-4 bg-gray-50/80">
                          <PedidoDetail
                            pedidoId={pedido.id}
                            onClose={() => setSelectedPedidoId(null)}
                          />
                        </td>
                      </tr>,
                    );
                  }

                  return rows;
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Pagina {data.page} de {data.pages} ({data.total} pedidos)
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
    </div>
  );
}
