import type { CategoriaTreeItem } from "../../entities/category/types";

interface CategoryFilterProps {
  categories: CategoriaTreeItem[];
  selectedId: number | undefined;
  onChange: (id: number | undefined) => void;
}

export function CategoryFilter({
  categories,
  selectedId,
  onChange,
}: CategoryFilterProps) {
  // Get root categories only for the filter chips
  const rootCategories = categories.filter((c) => c.padre_id === null);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(undefined)}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selectedId === undefined
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        Todas
      </button>
      {rootCategories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(selectedId === cat.id ? undefined : cat.id)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedId === cat.id
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {cat.nombre}
        </button>
      ))}
    </div>
  );
}
