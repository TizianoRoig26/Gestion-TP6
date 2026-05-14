import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { usePedido, useHistorialPedido } from "../shared/api/pedidos";
import { useEstadoPago } from "../shared/api/pagos";
import { OrderStatusBadge } from "../features/orders/OrderStatusBadge";
import { OrderTimeline } from "../features/orders/OrderTimeline";

async function cancelarPedido(pedidoId: number, motivo: string): Promise<void> {
  const { api } = await import("../shared/api/axios");
  await api.post(`/pedidos/${pedidoId}/cancelar`, {
    estado_codigo: "CANCELADO",
    observacion: motivo,
  });
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pedidoId = id ? Number(id) : undefined;

  const { data: pedido, isLoading: loadingPedido, isError: errorPedido } = usePedido(pedidoId);
  const { data: historial, isLoading: loadingHistorial } = useHistorialPedido(pedidoId);

  const esMercadoPago = pedido?.forma_pago_codigo === "MERCADOPAGO";
  const { data: pago } = useEstadoPago(esMercadoPago ? pedidoId : undefined);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelMotivo, setCancelMotivo] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!cancelMotivo.trim()) {
      setCancelError("El motivo de cancelación es obligatorio");
      return;
    }

    setCancelling(true);
    setCancelError(null);

    try {
      await cancelarPedido(pedidoId!, cancelMotivo);
      setShowCancelModal(false);
      window.location.reload(); // Simple reload to refresh data
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setCancelError(typeof detail === "string" ? detail : "Error al cancelar el pedido");
    } finally {
      setCancelling(false);
    }
  };

  if (loadingPedido) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-surface-tertiary rounded w-48" />
          <div className="h-4 bg-surface-tertiary rounded w-64" />
          <div className="h-64 bg-surface-tertiary rounded-xl" />
        </div>
      </div>
    );
  }

  if (errorPedido || !pedido) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Pedido no encontrado</h1>
        <p className="text-text-secondary mb-4">El pedido que buscás no existe o fue eliminado</p>
        <Link to="/mis-pedidos" className="text-primary-500 hover:text-primary-600 font-medium">
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  const fecha = new Date(pedido.creado_en).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const puedeCancelar = pedido.estado_codigo === "PENDIENTE";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate("/mis-pedidos")}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver a mis pedidos
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Pedido #{pedido.id}</h1>
          <p className="text-sm text-text-secondary mt-1">{fecha}</p>
        </div>
        <OrderStatusBadge estado={pedido.estado_codigo} />
      </div>

      {/* Payment status badge */}
      {esMercadoPago && pago && (
        <div className="mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-text-secondary">Pago:</span>
            {pago.mp_status === "approved" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-100 text-secondary-600 text-sm font-medium rounded-full">
                <span className="w-2 h-2 bg-secondary-500 rounded-full" />
                Aprobado
                {pago.mp_payment_id && (
                  <span className="text-xs text-secondary-600 ml-1 font-mono">
                    · ID: {pago.mp_payment_id}
                  </span>
                )}
              </span>
            )}
            {pago.mp_status === "rejected" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-danger-100 text-danger-600 text-sm font-medium rounded-full">
                <span className="w-2 h-2 bg-danger-500 rounded-full" />
                Rechazado
              </span>
            )}
            {pago.mp_status === "pending" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-100 text-accent-600 text-sm font-medium rounded-full">
                <span className="w-2 h-2 bg-accent-500 rounded-full" />
                Pendiente
              </span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Order info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-xl shadow-sm border border-border-subtle p-6">
            <h2 className="font-semibold text-text-primary mb-4">Productos</h2>
            <div className="divide-y divide-border-subtle">
              {pedido.detalles?.map((detalle) => (
                <div key={detalle.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-text-primary text-sm">{detalle.nombre_snapshot}</p>
                    <div className="flex gap-2 text-xs text-text-secondary mt-0.5">
                      <span>{detalle.cantidad}x ${detalle.precio_snapshot.toFixed(2)}</span>
                      {detalle.personalizacion && detalle.personalizacion.length > 0 && (
                        <span className="text-text-tertiary">
                          · Sin {detalle.personalizacion.length} ingrediente(s)
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-semibold text-text-primary text-sm">
                    ${detalle.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border-subtle pt-4 mt-2 space-y-1.5 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>${(pedido.total - pedido.costo_envio).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Envío</span>
                <span>${pedido.costo_envio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-text-primary pt-2 border-t border-border-subtle">
                <span>Total</span>
                <span>${pedido.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery address */}
          {pedido.direccion_snapshot && (
            <div className="bg-white rounded-xl shadow-sm border border-border-subtle p-6">
              <h2 className="font-semibold text-text-primary mb-2">Dirección de entrega</h2>
              <p className="text-sm text-text-secondary">{pedido.direccion_snapshot}</p>
            </div>
          )}

          {/* Retry payment — rejected + PENDIENTE */}
          {pago?.mp_status === "rejected" && puedeCancelar && (
            <Link
              to="/checkout"
              className="block w-full text-center py-3 px-6 bg-primary-500 text-white rounded-xl font-medium
                         hover:bg-primary-600 transition-colors text-sm"
            >
              Reintentar pago
            </Link>
          )}

          {/* Cancel button */}
          {puedeCancelar && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full py-3 px-6 border border-danger-200 text-danger-500 rounded-xl font-medium
                         hover:bg-danger-50 transition-colors text-sm"
            >
              Cancelar pedido
            </button>
          )}
        </div>

        {/* Right: Timeline */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-border-subtle p-6 sticky top-24">
            <h2 className="font-semibold text-text-primary mb-6">Estado del pedido</h2>
            {loadingHistorial ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 bg-surface-tertiary rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-surface-tertiary rounded w-24 mb-1" />
                      <div className="h-3 bg-surface-tertiary rounded w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <OrderTimeline
                historial={historial || []}
                estadoActual={pedido.estado_codigo}
              />
            )}
          </div>
        </div>
      </div>

      {/* Cancel modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Cancelar pedido</h3>
            <p className="text-sm text-text-secondary mb-4">
              ¿Estás seguro de que querés cancelar el pedido #{pedido.id}? Esta acción no se puede deshacer.
            </p>

            <textarea
              value={cancelMotivo}
              onChange={(e) => setCancelMotivo(e.target.value)}
              placeholder="Motivo de cancelación (obligatorio)"
              rows={3}
              className="w-full border border-border-default rounded-lg px-4 py-3 text-sm
                         focus:outline-none focus:ring-2 focus:ring-danger-500 focus:border-transparent
                         placeholder:text-text-tertiary mb-4"
            />

            {cancelError && (
              <p className="text-sm text-danger-500 mb-4">{cancelError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelError(null);
                  setCancelMotivo("");
                }}
                disabled={cancelling}
                className="flex-1 py-2.5 border border-border-default text-text-primary rounded-lg font-medium
                           hover:bg-surface-secondary transition-colors disabled:opacity-50 text-sm"
              >
                Volver
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling || !cancelMotivo.trim()}
                className="flex-1 py-2.5 bg-danger-500 text-white rounded-lg font-medium
                           hover:bg-danger-600 transition-colors disabled:bg-surface-tertiary disabled:cursor-not-allowed text-sm"
              >
                {cancelling ? "Cancelando..." : "Confirmar cancelación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
