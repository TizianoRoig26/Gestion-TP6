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
    <div className="bg-white rounded-xl shadow-sm border border-border-subtle p-6 sticky top-24">
      <h2 className="text-lg font-semibold text-text-primary mb-4">Resumen</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-text-secondary">
          <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-text-secondary">
          <span>Costo de envío</span>
          <span>${COSTO_ENVIO.toFixed(2)}</span>
        </div>

        <div className="border-t border-border-subtle pt-3">
          <div className="flex justify-between text-lg font-bold text-text-primary">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={items.length === 0}
        className="mt-6 w-full bg-primary-500 text-white py-3 px-6 rounded-xl font-medium
                   hover:bg-primary-600 disabled:bg-surface-tertiary disabled:cursor-not-allowed
                   transition-colors"
      >
        Ir a pagar
      </button>
    </div>
  );
}
