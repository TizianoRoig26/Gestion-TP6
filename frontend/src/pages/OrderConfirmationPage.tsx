import { Link, useParams } from "react-router-dom";
import { usePedido } from "../shared/api/pedidos";
import { useEstadoPago } from "../shared/api/pagos";

export function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const pedidoId = id ? Number(id) : undefined;

  const {
    data: pedido,
    isLoading,
    isError,
  } = usePedido(pedidoId);

  const esMercadoPago = pedido?.forma_pago_codigo === "MERCADOPAGO";

  const {
    data: pago,
    isLoading: loadingPago,
  } = useEstadoPago(esMercadoPago ? pedidoId : undefined);

  // ===========================================
  // Loading state
  // ===========================================
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto" />
          <div className="h-32 bg-gray-100 rounded-xl mt-8" />
        </div>
      </div>
    );
  }

  // ===========================================
  // Error state
  // ===========================================
  if (isError || !pedido) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Pedido no encontrado</h1>
        <p className="text-gray-500 mb-8">No pudimos encontrar el pedido solicitado</p>
        <Link
          to="/mis-pedidos"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Mis pedidos
        </Link>
      </div>
    );
  }

  // ===========================================
  // Order Summary (shared between all states)
  // ===========================================
  function OrderSummary() {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-left mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">Resumen del pedido</h2>

        <div className="space-y-3 mb-4">
          {pedido.detalles?.map((detalle) => (
            <div key={detalle.id} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {detalle.cantidad}x {detalle.nombre_snapshot}
              </span>
              <span className="text-gray-900 font-medium">
                ${detalle.subtotal.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>${(pedido.total - pedido.costo_envio).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Envío</span>
            <span>${pedido.costo_envio.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
            <span>Total</span>
            <span>${pedido.total.toFixed(2)}</span>
          </div>
        </div>

        {pedido.direccion_snapshot && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">
              Dirección de entrega
            </p>
            <p className="text-sm text-gray-900">{pedido.direccion_snapshot}</p>
          </div>
        )}
      </div>
    );
  }

  // ===========================================
  // Action buttons (shared)
  // ===========================================
  function ActionButtons() {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to={`/mis-pedidos/${pedido.id}`}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Ver detalle del pedido
        </Link>
        <Link
          to="/catalogo"
          className="bg-white text-gray-700 px-8 py-3 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Seguir comprando
        </Link>
      </div>
    );
  }

  // ===========================================
  // Payment — Processing (loading pago for the first time)
  // ===========================================
  if (esMercadoPago && (loadingPago || !pago)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        {/* Spinner */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Procesando pago...</h1>
        <p className="text-gray-500 mb-8">
          No cierres esta página mientras se procesa el pago.
        </p>

        <p className="text-sm text-gray-400 mb-8">
          Pedido <span className="font-semibold">#{pedido.id}</span>
        </p>

        {/* Polling indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-8">
          <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          Consultando estado del pago...
        </div>

        <OrderSummary />
        <ActionButtons />
      </div>
    );
  }

  // ===========================================
  // Payment — Approved
  // ===========================================
  if (esMercadoPago && pago?.mp_status === "approved") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        {/* Success icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pago aprobado!</h1>
        <p className="text-gray-500 mb-8">
          Tu pago para el pedido <span className="font-semibold text-gray-700">#{pedido.id}</span>{" "}
          fue procesado exitosamente
        </p>

        {/* Payment reference */}
        {pago.mp_payment_id && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 inline-block">
            <p className="text-xs text-blue-600 uppercase tracking-wider font-medium mb-0.5">
              ID de transacción
            </p>
            <p className="text-sm text-blue-800 font-mono font-semibold">
              {pago.mp_payment_id}
            </p>
          </div>
        )}

        <OrderSummary />
        <ActionButtons />
      </div>
    );
  }

  // ===========================================
  // Payment — Rejected
  // ===========================================
  if (esMercadoPago && pago?.mp_status === "rejected") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        {/* Error icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago rechazado</h1>
        <p className="text-gray-500 mb-2">
          No pudimos procesar el pago del pedido{" "}
          <span className="font-semibold text-gray-700">#{pedido.id}</span>
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Revisá los datos de la tarjeta o intentá con otro medio de pago.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            to="/checkout"
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Reintentar pago
          </Link>
          <Link
            to={`/mis-pedidos/${pedido.id}`}
            className="bg-white text-gray-700 px-8 py-3 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Ver detalle del pedido
          </Link>
        </div>

        <OrderSummary />
      </div>
    );
  }

  // ===========================================
  // Payment — Pending (efectivo via MP)
  // ===========================================
  if (esMercadoPago && pago?.mp_status === "pending") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        {/* Pending icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-10 h-10 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago pendiente</h1>
        <p className="text-gray-500 mb-8">
          Si pagaste en efectivo, esperá a que se acredite el pago en tu pedido{" "}
          <span className="font-semibold text-gray-700">#{pedido.id}</span>.
        </p>

        <OrderSummary />
        <ActionButtons />
      </div>
    );
  }

  // ===========================================
  // EFECTIVO — "Pagás al recibir"
  // ===========================================
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      {/* Success check */}
      <div className="mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pedido confirmado!</h1>
      <p className="text-gray-500 mb-1">
        Tu pedido <span className="font-semibold text-gray-700">#{pedido.id}</span> fue creado exitosamente
      </p>
      <p className="text-sm text-gray-400 mb-8">Pagás al recibir el pedido</p>

      <OrderSummary />
      <ActionButtons />
    </div>
  );
}
