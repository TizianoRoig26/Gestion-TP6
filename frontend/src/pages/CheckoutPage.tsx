import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useCartStore } from "../shared/stores/cartStore";
import { usePaymentStore } from "../shared/stores/paymentStore";
import { useCrearPedido } from "../shared/api/pedidos";
import { useCrearPago } from "../shared/api/pagos";
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react";

const COSTO_ENVIO = 50.0;
const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY as string | undefined;

if (!MP_PUBLIC_KEY) {
  throw new Error(
    "VITE_MP_PUBLIC_KEY is not defined. Create a .env file based on .env.example",
  );
}

// Initialize MercadoPago once at module level
initMercadoPago(MP_PUBLIC_KEY);

export function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice());

  const crearPedido = useCrearPedido();
  const crearPago = useCrearPago();
  const paymentStore = usePaymentStore();

  const [direccion, setDireccion] = useState("");
  const [formaPago, setFormaPago] = useState("MERCADOPAGO");
  const [error, setError] = useState<string | null>(null);
  const [pedidoCreado, setPedidoCreado] = useState<number | null>(null);

  const subtotal = totalPrice;
  const total = subtotal + COSTO_ENVIO;

  // Reset payment store on mount
  useEffect(() => {
    paymentStore.resetPayment();
  }, []);

  // Redirect to cart if empty (usamos <Navigate> para no llamar navigate() durante el render)
  if (items.length === 0 && !pedidoCreado) {
    return <Navigate to="/carrito" replace />;
  }

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

      if (formaPago === "MERCADOPAGO") {
        // Show CardPayment for card tokenization
        setPedidoCreado(pedido.id);
        paymentStore.startCheckout(pedido.id);
      } else {
        // EFECTIVO — redirect straight to confirmation
        navigate(`/pedido-confirmado/${pedido.id}`);
      }
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

  const handleCardPayment = async (cardToken: string, paymentMethodId?: string | null) => {
    if (!pedidoCreado) return;

    setError(null);
    paymentStore.startCheckout(pedidoCreado);

    try {
      await crearPago.mutateAsync({
        pedido_id: pedidoCreado,
        card_token: cardToken,
        payment_method_id: paymentMethodId ?? undefined,
      });

      // Navigate to confirmation page — polling will pick up the status
      // Usamos setTimeout para evitar que el CardPayment brick se desmonte abruptamente
      // y cause el error "removeChild" del SDK de MercadoPago
      setTimeout(() => {
        navigate(`/pedido-confirmado/${pedidoCreado}`);
      }, 100);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      paymentStore.setError(
        typeof detail === "string" ? detail : "Error al procesar el pago. Intentá de nuevo.",
      );
    }
  };

  const handleCardPaymentSubmit = async (param: any) => {
    // param.token is the card_token from MercadoPago SDK
    // param.paymentMethodId is the payment method (visa, master, etc.)
    if (param?.token) {
      await handleCardPayment(param.token, param?.paymentMethodId);
    }
  };

  // ===========================================
  // Render: CardPayment step
  // ===========================================
  if (pedidoCreado && formaPago === "MERCADOPAGO") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Completá el pago</h1>
        <p className="text-text-secondary mb-8">
          Pedido #{pedidoCreado} — Total: <span className="font-semibold">${total.toFixed(2)}</span>
        </p>

        {/* CardPayment Brick */}
        <div className="bg-white rounded-xl shadow-sm border border-border-subtle p-6 mb-6">
          <CardPayment
            initialization={{ amount: total }}
            onSubmit={handleCardPaymentSubmit}
            onError={(brickError) => {
              const msg = brickError?.message ?? "Error al cargar el formulario de pago";
              setError(msg);
              paymentStore.setError(msg);
            }}
            locale="es-AR"
          />
        </div>

        {/* Error */}
        {(error || paymentStore.error) && (
          <div className="p-4 bg-danger-50 border border-danger-100 rounded-lg text-sm text-danger-600 mb-6">
            {paymentStore.error || error}
          </div>
        )}

        {/* Processing indicator */}
        {crearPago.isPending && (
          <div className="flex items-center justify-center gap-3 text-text-secondary mb-6">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium">Procesando pago...</span>
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => {
            setPedidoCreado(null);
            paymentStore.resetPayment();
          }}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          ← Volver al checkout
        </button>
      </div>
    );
  }

  // ===========================================
  // Render: Checkout form
  // ===========================================
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div className="space-y-6">
          {/* Delivery address */}
          <div className="bg-white rounded-xl shadow-sm border border-border-subtle p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Dirección de entrega</h2>
            <textarea
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Calle, número, piso, ciudad, código postal"
              rows={3}
              className="w-full border border-border-default rounded-lg px-4 py-3 text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                         placeholder:text-text-tertiary"
            />
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-xl shadow-sm border border-border-subtle p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Forma de pago</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-border-default rounded-lg cursor-pointer hover:bg-surface-secondary transition-colors">
                <input
                  type="radio"
                  name="formaPago"
                  value="MERCADOPAGO"
                  checked={formaPago === "MERCADOPAGO"}
                  onChange={() => setFormaPago("MERCADOPAGO")}
                  className="text-primary-500 focus:ring-primary-400"
                />
                <div>
                  <p className="font-medium text-text-primary text-sm">MercadoPago</p>
                  <p className="text-xs text-text-secondary">Tarjeta de crédito, débito o efectivo</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-border-default rounded-lg cursor-pointer hover:bg-surface-secondary transition-colors">
                <input
                  type="radio"
                  name="formaPago"
                  value="EFECTIVO"
                  checked={formaPago === "EFECTIVO"}
                  onChange={() => setFormaPago("EFECTIVO")}
                  className="text-primary-500 focus:ring-primary-400"
                />
                <div>
                  <p className="font-medium text-text-primary text-sm">Efectivo</p>
                  <p className="text-xs text-text-secondary">Pagás al recibir el pedido</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-border-subtle p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Resumen del pedido</h2>

            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.productoId} className="flex justify-between text-sm">
                  <span className="text-text-secondary truncate flex-1">
                    {item.cantidad}x {item.producto.nombre}
                  </span>
                  <span className="text-text-primary font-medium ml-4">
                    ${(item.producto.precio * item.cantidad).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border-subtle pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Envío</span>
                <span>${COSTO_ENVIO.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-text-primary pt-2 border-t border-border-subtle">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-danger-50 border border-danger-100 rounded-lg text-sm text-danger-600">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={crearPedido.isPending}
              className="mt-6 w-full bg-primary-500 text-white py-3 px-6 rounded-xl font-medium
                         hover:bg-primary-600 disabled:bg-surface-tertiary disabled:cursor-not-allowed
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
