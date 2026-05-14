import { Link } from "react-router-dom";
import { useCartStore } from "../shared/stores/cartStore";
import { CartItemRow } from "../features/cart/CartItemRow";
import { CartSummary } from "../features/cart/CartSummary";

export function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-text-disabled mb-6">
          <svg className="w-20 h-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Tu carrito está vacío</h1>
        <p className="text-text-secondary mb-8">Agregá productos del catálogo para empezar tu pedido</p>
        <Link
          to="/catalogo"
          className="inline-block bg-primary-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-8">Carrito de compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-border-subtle p-6">
            <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-4 pb-3 border-b border-border-subtle text-xs font-medium text-text-secondary uppercase tracking-wider">
              <span>Producto</span>
              <span className="text-center">Cantidad</span>
              <span className="text-right">Subtotal</span>
              <span className="w-10" />
            </div>

            <div className="divide-y divide-border-subtle">
              {items.map((item) => (
                <CartItemRow
                  key={item.productoId}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>

            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 mt-4 text-sm text-primary-500 hover:text-primary-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Seguir comprando
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div>
          <CartSummary />
        </div>
      </div>
    </div>
  );
}
