import type { Ingrediente } from "../../entities/category/types";

interface AllergenFilterProps {
  allergens: Ingrediente[];
  selectedId: number | undefined;
  onChange: (id: number | undefined) => void;
}

export function AllergenFilter({
  allergens,
  selectedId,
  onChange,
}: AllergenFilterProps) {
  if (allergens.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-text-primary">Alérgenos</p>
      <div className="flex flex-wrap gap-2">
        {allergens.map((allergen) => (
          <button
            key={allergen.id}
            onClick={() =>
              onChange(selectedId === allergen.id ? undefined : allergen.id)
            }
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedId === allergen.id
                ? "bg-danger-500 text-white"
                : "bg-danger-50 text-danger-600 hover:bg-danger-100 border border-danger-200"
            }`}
          >
            {allergen.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
