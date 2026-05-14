import type { IngredienteInfo } from "../../entities/product/types";

interface IngredientListProps {
  ingredientes: IngredienteInfo[];
}

export function IngredientList({ ingredientes }: IngredientListProps) {
  if (ingredientes.length === 0) return null;

  const allergens = ingredientes.filter((ing) => ing.es_alergeno);
  const nonAllergens = ingredientes.filter((ing) => !ing.es_alergeno);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-2">Ingredientes</h3>
        <div className="flex flex-wrap gap-2">
          {nonAllergens.map((ing) => (
            <span
              key={ing.id}
              className="text-sm bg-surface-tertiary text-text-primary px-3 py-1 rounded-full"
            >
              {ing.nombre}
            </span>
          ))}
        </div>
      </div>

      {allergens.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-2">Alérgenos</h3>
          <div className="flex flex-wrap gap-2">
            {allergens.map((ing) => (
              <span
                key={ing.id}
                className="inline-flex items-center gap-1 text-sm bg-danger-50 text-danger-600 border border-danger-200 px-3 py-1 rounded-full font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                {ing.nombre}
                <span className="text-xs uppercase tracking-wider ml-0.5">ALÉRGENO</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
