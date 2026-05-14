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
            ? "bg-primary-500 text-white"
            : "bg-surface-tertiary text-text-secondary hover:bg-surface-secondary"
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
              ? "bg-primary-500 text-white"
              : "bg-surface-tertiary text-text-secondary hover:bg-surface-secondary"
          }`}
        >
          {cat.nombre}
        </button>
      ))}
    </div>
  );
}
