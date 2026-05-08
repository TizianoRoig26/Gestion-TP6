import type { HistorialEstado } from "../../entities/order/types";
import { FSM_STATES } from "./OrderStatusBadge";

interface OrderTimelineProps {
  historial: HistorialEstado[];
  estadoActual: string;
}

const STATE_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En preparación",
  EN_CAMINO: "En camino",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

function getActorInfo(entry: HistorialEstado): string {
  if (entry.observacion?.startsWith("Transición:") && !entry.usuario_id) {
    return "Sistema";
  }
  return entry.usuario_id ? `Usuario #${entry.usuario_id}` : "Sistema";
}

export function OrderTimeline({ historial, estadoActual }: OrderTimelineProps) {
  // Build map of completed states with their history entries
  const completedStates = new Map<string, HistorialEstado>();
  for (const entry of historial) {
    completedStates.set(entry.estado_hacia, entry);
  }

  const isCancelled = estadoActual === "CANCELADO";

  return (
    <div className="relative">
      {/* FSM Timeline */}
      <div className="space-y-0">
        {FSM_STATES.map((state, index) => {
          // Skip CANCELADO in the linear flow unless cancelled
          if (state === "CANCELADO" && !isCancelled) return null;
          if (state === "CANCELADO" && index === 0) return null; // don't show at start

          const historyEntry = completedStates.get(state);
          const isCompleted = !!historyEntry;
          const isCurrent = state === estadoActual;
          const isPast = FSM_STATES.indexOf(estadoActual) > index || isCancelled;
          const isTerminal = state === "ENTREGADO" || state === "CANCELADO";

          // For cancelled orders, show which state it was cancelled from
          let cancelledFromLabel = "";
          if (isCancelled && state === "CANCELADO" && historial.length > 0) {
            const cancelEntry = historial.find((h) => h.estado_hacia === "CANCELADO");
            if (cancelEntry?.estado_desde) {
              cancelledFromLabel = `(desde ${STATE_LABELS[cancelEntry.estado_desde] || cancelEntry.estado_desde})`;
            }
          }

          return (
            <div key={state} className="flex gap-4">
              {/* Timeline node */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0
                    ${isCompleted || isCurrent
                      ? isCancelled && state === "CANCELADO"
                        ? "bg-red-500 border-red-500 text-white"
                        : isCompleted && isTerminal
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                    }`}
                >
                  {isCompleted || isCurrent ? (
                    state === "CANCELADO" ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                {index < FSM_STATES.length - 1 && (
                  <div
                    className={`w-0.5 h-8 ${
                      isPast && !isCancelled ? "bg-blue-200" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <div className={`pb-6 ${!isCompleted && !isCurrent ? "opacity-50" : ""}`}>
                <p className="font-medium text-sm text-gray-900">
                  {STATE_LABELS[state] || state}
                  {cancelledFromLabel && (
                    <span className="text-gray-400 font-normal ml-1">{cancelledFromLabel}</span>
                  )}
                </p>
                {historyEntry && (
                  <div className="mt-0.5 space-y-0.5">
                    <p className="text-xs text-gray-500">
                      {new Date(historyEntry.creado_en).toLocaleString("es-AR")}
                    </p>
                    <p className="text-xs text-gray-400">
                      por {getActorInfo(historyEntry)}
                    </p>
                    {historyEntry.observacion && !historyEntry.observacion.startsWith("Transición:") && (
                      <p className="text-xs text-gray-500 italic">
                        "{historyEntry.observacion}"
                      </p>
                    )}
                  </div>
                )}
                {isCurrent && !isCompleted && (
                  <p className="text-xs text-blue-600 font-medium mt-0.5">Estado actual</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
