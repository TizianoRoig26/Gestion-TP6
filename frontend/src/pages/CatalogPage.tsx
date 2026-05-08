import { useSearchParams } from "react-router-dom";
import { useProducts, useCategories, useIngredients } from "../shared/api/catalogos";
import { ProductGrid } from "../features/catalog/ProductGrid";
import { SearchBar } from "../features/catalog/SearchBar";
import { CategoryFilter } from "../features/catalog/CategoryFilter";
import { AllergenFilter } from "../features/catalog/AllergenFilter";
import { Pagination } from "../features/catalog/Pagination";
import { CategoryTree } from "../widgets/CategoryTree";
import { Breadcrumbs } from "../widgets/Breadcrumbs";

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read filters from URL
  const search = searchParams.get("search") ?? "";
  const categoriaId = searchParams.get("categoria_id")
    ? Number(searchParams.get("categoria_id"))
    : undefined;
  const alergenoId = searchParams.get("alergeno_id")
    ? Number(searchParams.get("alergeno_id"))
    : undefined;
  const page = Number(searchParams.get("page") ?? "1");

  // Queries
  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
  } = useProducts({
    search: search || undefined,
    categoria_id: categoriaId,
    alergeno_id: alergenoId,
    page,
    page_size: 12,
  });

  const { data: categories = [] } = useCategories();
  const { data: allergens = [] } = useIngredients(true);

  // Handlers
  function updateFilter(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset page when changing filters
    if (key !== "page") {
      params.delete("page");
    }
    setSearchParams(params);
  }

  function clearFilters() {
    setSearchParams({});
  }

  const hasFilters = search || categoriaId || alergenoId;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        categoriaId={categoriaId}
        categories={categories}
      />

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Catálogo</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="space-y-6 lg:sticky lg:top-8">
            {/* Category tree */}
            <CategoryTree
              categories={categories}
              selectedId={categoriaId}
              onSelect={(id) =>
                updateFilter("categoria_id", id ? String(id) : undefined)
              }
            />

            {/* Allergen filter */}
            <AllergenFilter
              allergens={allergens}
              selectedId={alergenoId}
              onChange={(id) =>
                updateFilter("alergeno_id", id ? String(id) : undefined)
              }
            />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Search bar */}
          <div className="mb-6">
            <SearchBar
              value={search}
              onChange={(val) => updateFilter("search", val || undefined)}
            />
          </div>

          {/* Category chips */}
          <div className="mb-6">
            <CategoryFilter
              categories={categories}
              selectedId={categoriaId}
              onChange={(id) =>
                updateFilter("categoria_id", id ? String(id) : undefined)
              }
            />
          </div>

          {/* Error state */}
          {productsError ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">Error al cargar los productos</p>
              <button
                onClick={() => refetchProducts()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
              {/* Product grid */}
              <ProductGrid
                productos={productsData?.items ?? []}
                isLoading={productsLoading}
                hasFilters={!!hasFilters}
                onClearFilters={clearFilters}
              />

              {/* Pagination */}
              {productsData && (
                <Pagination
                  page={productsData.page}
                  pages={productsData.pages}
                  onChange={(p) => updateFilter("page", String(p))}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
