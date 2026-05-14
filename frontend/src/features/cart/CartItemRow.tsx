import type { CartItem } from "../../shared/stores/cartStore";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (productoId: number, cantidad: number) => void;
  onRemove: (productoId: number) => void;
}

export function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const subtotal = item.producto.precio * item.cantidad;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-border-subtle last:border-0">
      {/* Image */}
      <div className="w-20 h-20 rounded-lg bg-surface-secondary flex items-center justify-center flex-shrink-0">
        {item.producto.imagen ? (
          <img
            src={item.producto.imagen}
            alt={item.producto.nombre}
            className="w-full h-full object-contain rounded-lg"
          />
        ) : (
          <div className="text-text-disabled">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-text-primary truncate">{item.producto.nombre}</h3>
        <p className="text-sm text-text-secondary">${item.producto.precio.toFixed(2)} c/u</p>

        {item.personalizacion?.ingredientesExcluidos &&
          item.personalizacion.ingredientesExcluidos.length > 0 && (
          <p className="text-xs text-text-tertiary mt-0.5">
            Sin {item.personalizacion.ingredientesExcluidos.length} ingrediente(s)
          </p>
        )}
      </div>

      {/* Quantity selector */}
      <div className="flex items-center border border-border-default rounded-lg">
        <button
          onClick={() => onUpdateQuantity(item.productoId, item.cantidad - 1)}
          className="px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
        >
          −
        </button>
        <span className="px-3 py-1.5 text-sm font-medium text-text-primary min-w-[2rem] text-center">
          {item.cantidad}
        </span>
        <button
          onClick={() => onUpdateQuantity(item.productoId, item.cantidad + 1)}
          className="px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
        >
          +
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right min-w-[5rem]">
        <p className="font-semibold text-text-primary">${subtotal.toFixed(2)}</p>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.productoId)}
        className="p-2 text-text-tertiary hover:text-danger-500 transition-colors"
        title="Eliminar"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );
}
