import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../shared/stores/cartStore";
import { useCrearPedido } from "../shared/api/pedidos";

const COSTO_ENVIO = 50.0;

export function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice());

  const crearPedido = useCrearPedido();

  const [direccion, setDireccion] = useState("");
  const [formaPago, setFormaPago] = useState("MERCADOPAGO");
  const [error, setError] = useState<string | null>(null);

  const subtotal = totalPrice;
  const total = subtotal + COSTO_ENVIO;

  const handleSubmit = async () => {
    if (!direccion.trim()) {
      setError("Por favor ingresá una dirección de entrega");
      return;
    }

    setError(null);

    const detalles = items.map((item) => ({
      producto_id: item.productoId,
      cantidad: item.cantidad,
      precio_snapshot: item.producto.precio,
      nombre_snapshot: item.producto.nombre,
      subtotal: item.producto.precio * item.cantidad,
      personalizacion: item.personalizacion?.ingredientesExcluidos,
    }));

    try {
      const pedido = await crearPedido.mutateAsync({
        direccion_id: undefined,
        forma_pago_codigo: formaPago,
        costo_envio: COSTO_ENVIO,
        direccion_snapshot: direccion,
        detalles,
      });

      clearCart();
      navigate(`/pedido-confirmado/${pedido.id}`);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (typeof detail === "object" && detail?.message) {
        setError(detail.message);
        if (detail.errors?.length > 0) {
          const productErrors = detail.errors
            .map((e: any) => `${e.nombre}: disponible ${e.disponible}, solicitado ${e.solicitado}`)
            .join(". ");
          setError(`${detail.message}. ${productErrors}`);
        }
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("Error al crear el pedido. Intentalo de nuevo.");
      }
    }
  };

  if (items.length === 0) {
    navigate("/carrito");
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div className="space-y-6">
          {/* Delivery address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dirección de entrega</h2>
            <textarea
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Calle, número, piso, ciudad, código postal"
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder:text-gray-400"
            />
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Forma de pago</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="formaPago"
                  value="MERCADOPAGO"
                  checked={formaPago === "MERCADOPAGO"}
                  onChange={() => setFormaPago("MERCADOPAGO")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">MercadoPago</p>
                  <p className="text-xs text-gray-500">Tarjeta de crédito, débito o efectivo</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="formaPago"
                  value="EFECTIVO"
                  checked={formaPago === "EFECTIVO"}
                  onChange={() => setFormaPago("EFECTIVO")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Efectivo</p>
                  <p className="text-xs text-gray-500">Pagás al recibir el pedido</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen del pedido</h2>

            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.productoId} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate flex-1">
                    {item.cantidad}x {item.producto.nombre}
                  </span>
                  <span className="text-gray-900 font-medium ml-4">
                    ${(item.producto.precio * item.cantidad).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span>${COSTO_ENVIO.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={crearPedido.isPending}
              className="mt-6 w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium
                         hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                         transition-colors flex items-center justify-center gap-2"
            >
              {crearPedido.isPending ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creando pedido...
                </>
              ) : (
                "Confirmar pedido"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
