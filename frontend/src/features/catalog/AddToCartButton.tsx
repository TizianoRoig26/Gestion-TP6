import { useState } from "react";
import { useCartStore } from "../../shared/stores/cartStore";
import { useUiStore } from "../../shared/stores/uiStore";
import { Button } from "../../shared/ui/Button";

interface AddToCartButtonProps {
  productoId: number;
  nombre: string;
  precio: number;
  imagen?: string;
  stock: number;
}

export function AddToCartButton({
  productoId,
  nombre,
  precio,
  imagen,
  stock,
}: AddToCartButtonProps) {
  const [cantidad, setCantidad] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const addToast = useUiStore((state) => state.addToast);

  const outOfStock = stock === 0;

  function handleAdd() {
    addItem(
      { id: productoId, nombre, precio, imagen },
      cantidad,
    );
    addToast({
      type: "success",
      message: `${cantidad}x ${nombre} agregado al carrito`,
    });
    setCantidad(1);
  }

  return (
    <div className="space-y-3">
      {/* Quantity selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Cantidad:</span>
        <div className="flex items-center border border-gray-200 rounded-lg">
          <button
            onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
            disabled={cantidad <= 1 || outOfStock}
            className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            -
          </button>
          <span className="px-4 py-1.5 text-sm font-medium text-gray-900 min-w-[40px] text-center border-x border-gray-200">
            {cantidad}
          </span>
          <button
            onClick={() => setCantidad((prev) => Math.min(stock, prev + 1))}
            disabled={cantidad >= stock || outOfStock}
            className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
        </div>
        {stock > 0 && stock <= 5 && (
          <span className="text-sm text-orange-500">Solo quedan {stock}</span>
        )}
      </div>

      {/* Add to cart button */}
      <Button
        onClick={handleAdd}
        disabled={outOfStock}
        size="lg"
        className="w-full"
      >
        {outOfStock ? "Sin stock" : "Agregar al carrito"}
      </Button>
    </div>
  );
}
