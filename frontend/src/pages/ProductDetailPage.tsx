import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProduct } from "../shared/api/catalogos";
import { ProductInfo } from "../features/catalog/ProductInfo";
import { IngredientList } from "../features/catalog/IngredientList";
import { AddToCartButton } from "../features/catalog/AddToCartButton";

const PLACEHOLDER_IMG = "/images/imagen no encontrada.svg";

function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-surface-tertiary rounded-xl" />
        <div className="space-y-4">
          <div className="h-4 bg-surface-tertiary rounded w-1/3" />
          <div className="h-8 bg-surface-tertiary rounded w-3/4" />
          <div className="h-4 bg-surface-tertiary rounded w-full" />
          <div className="h-4 bg-surface-tertiary rounded w-2/3" />
          <div className="h-10 bg-surface-tertiary rounded w-1/4" />
          <div className="h-12 bg-surface-tertiary rounded w-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productoId = id ? Number(id) : undefined;
  const [imgError, setImgError] = useState(false);

  const {
    data: producto,
    isLoading,
    isError,
  } = useProduct(productoId);

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <svg className="w-20 h-20 text-text-disabled mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Producto no encontrado</h2>
        <p className="text-text-secondary mb-4">El producto que buscás no existe o fue eliminado</p>
        <Link
          to="/catalogo"
          className="text-primary-500 hover:text-primary-600 font-medium"
        >
          Volver al catálogo
        </Link>
      </div>
    );
  }

  // Loading state
  if (isLoading || !producto) {
    return (
      <div className="container mx-auto px-4 py-8">
        <DetailSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        to="/catalogo"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary-500 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square bg-surface-secondary rounded-xl flex items-center justify-center p-12">
          {!producto.imagen_url || imgError ? (
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
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Product info */}
          <ProductInfo
            nombre={producto.nombre}
            descripcion={producto.descripcion}
            precio={producto.precio_base}
            categorias={producto.categorias}
          />

          {/* Separator */}
          <hr className="border-border-subtle" />

          {/* Ingredients */}
          <IngredientList ingredientes={producto.ingredientes} />

          {/* Separator */}
          <hr className="border-border-subtle" />

          {/* Add to cart */}
          <AddToCartButton
            productoId={producto.id}
            nombre={producto.nombre}
            precio={producto.precio_base}
            imagen={producto.imagen_url}
            stock={producto.stock_cantidad}
          />
        </div>
      </div>
    </div>
  );
}
