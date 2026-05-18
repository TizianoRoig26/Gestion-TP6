import { useState } from "react";
import { Link } from "react-router-dom";
import type { ProductoList } from "../../entities/product/types";

const PLACEHOLDER_IMG = "/images/imagen no encontrada.svg";

interface ProductCardProps {
  producto: ProductoList;
}

export function ProductCard({ producto }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  const showPlaceholder = !producto.imagen_url || imgError;

  return (
    <Link
      to={`/catalogo/${producto.id}`}
      className="group bg-white rounded-xl shadow-sm border border-border-subtle overflow-hidden hover:shadow-md hover:border-primary-100 transition-all"
    >
      {/* Image */}
      <div className="aspect-square bg-surface-secondary flex items-center justify-center p-8">
        {showPlaceholder ? (
          <img
            src={PLACEHOLDER_IMG}
            alt={producto.nombre}
            className="w-full h-full object-contain"
          />
        ) : (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
          />
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-text-primary group-hover:text-primary-500 transition-colors line-clamp-2">
          {producto.nombre}
        </h3>

        {producto.categorias.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {producto.categorias.slice(0, 2).map((cat) => (
              <span
                key={cat.id}
                className="text-xs bg-primary-50 text-primary-500 px-2 py-0.5 rounded-full"
              >
                {cat.nombre}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-text-primary">
            ${producto.precio_base.toFixed(2)}
          </span>
          {producto.stock_cantidad === 0 && (
            <span className="text-xs text-danger-500 font-medium">Sin stock</span>
          )}
        </div>
      </div>
    </Link>
  );
}
