import { Link } from "react-router-dom";
import type { ProductoList } from "../../entities/product/types";

interface ProductCardProps {
  producto: ProductoList;
}

export function ProductCard({ producto }: ProductCardProps) {
  return (
    <Link
      to={`/catalogo/${producto.id}`}
      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all"
    >
      {/* Image */}
      <div className="aspect-square bg-gray-50 flex items-center justify-center p-8">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="text-gray-300">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {producto.nombre}
        </h3>

        {producto.categorias.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {producto.categorias.slice(0, 2).map((cat) => (
              <span
                key={cat.id}
                className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"
              >
                {cat.nombre}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            ${producto.precio_base.toFixed(2)}
          </span>
          {producto.stock_cantidad === 0 && (
            <span className="text-xs text-red-500 font-medium">Sin stock</span>
          )}
        </div>
      </div>
    </Link>
  );
}
