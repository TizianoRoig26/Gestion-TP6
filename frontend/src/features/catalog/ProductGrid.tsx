import type { ProductoList } from "../../entities/product/types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  productos: ProductoList[];
  isLoading: boolean;
  hasFilters: boolean;
  onClearFilters: () => void;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-border-subtle overflow-hidden animate-pulse">
      <div className="aspect-square bg-surface-tertiary" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-surface-tertiary rounded w-3/4" />
        <div className="h-3 bg-surface-tertiary rounded w-1/2" />
        <div className="h-5 bg-surface-tertiary rounded w-1/3" />
      </div>
    </div>
  );
}

function EmptyState({ hasFilters, onClearFilters }: { hasFilters: boolean; onClearFilters: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <svg className="w-20 h-20 text-text-disabled mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <h3 className="text-lg font-medium text-text-primary mb-1">No encontramos productos</h3>
      <p className="text-text-secondary mb-4">
        {hasFilters
          ? "Intentá con otros filtros o términos de búsqueda"
          : "No hay productos disponibles en este momento"}
      </p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="text-sm text-primary-500 hover:text-primary-600 font-medium"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

export function ProductGrid({ productos, isLoading, hasFilters, onClearFilters }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <EmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {productos.map((producto) => (
        <ProductCard key={producto.id} producto={producto} />
      ))}
    </div>
  );
}
