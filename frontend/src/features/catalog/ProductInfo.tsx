import type { CategoriaInfo } from "../../entities/product/types";

interface ProductInfoProps {
  nombre: string;
  descripcion?: string;
  precio: number;
  categorias: CategoriaInfo[];
}

export function ProductInfo({ nombre, descripcion, precio, categorias }: ProductInfoProps) {
  return (
    <div>
      {/* Categories as badges */}
      {categorias.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {categorias.map((cat) => (
            <span
              key={cat.id}
              className="text-sm bg-primary-50 text-primary-600 px-3 py-1 rounded-full"
            >
              {cat.nombre}
            </span>
          ))}
        </div>
      )}

      {/* Product name */}
      <h1 className="text-2xl font-bold text-text-primary mb-2">{nombre}</h1>

      {/* Description */}
      {descripcion && (
        <p className="text-text-secondary mb-4">{descripcion}</p>
      )}

      {/* Price */}
      <div className="text-3xl font-bold text-text-primary">
        ${precio.toFixed(2)}
      </div>
    </div>
  );
}
