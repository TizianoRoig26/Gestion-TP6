import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../shared/stores/cartStore";

const COSTO_ENVIO = 50.0;

export function CartSummary() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice());

  const subtotal = totalPrice;
  const total = subtotal + COSTO_ENVIO;
  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0);

  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Costo de envío</span>
          <span>${COSTO_ENVIO.toFixed(2)}</span>
        </div>

        <div className="border-t border-gray-100 pt-3">
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={items.length === 0}
        className="mt-6 w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium
                   hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                   transition-colors"
      >
        Ir a pagar
      </button>
    </div>
  );
}
