import { Link, useParams } from "react-router-dom";
import { usePedido } from "../shared/api/pedidos";

export function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const pedidoId = id ? Number(id) : undefined;
  const { data: pedido, isLoading, isError } = usePedido(pedidoId);

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      {/* Success animation */}
      <div className="mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pedido confirmado!</h1>
      <p className="text-gray-500 mb-8">
        Tu pedido <span className="font-semibold text-gray-700">#{pedido.id}</span> fue creado exitosamente
      </p>

      {/* Order summary */}
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
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Dirección de entrega</p>
            <p className="text-sm text-gray-900">{pedido.direccion_snapshot}</p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Estado</p>
          <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
            {pedido.estado?.nombre || "Pendiente de pago"}
          </span>
        </div>
      </div>

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
    </div>
  );
}
