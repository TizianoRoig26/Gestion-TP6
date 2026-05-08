import { Link } from "react-router-dom";
import type { CategoriaTreeItem } from "../entities/category/types";

interface BreadcrumbsProps {
  categoriaId: number | undefined;
  categories: CategoriaTreeItem[];
}

export function Breadcrumbs({ categoriaId, categories }: BreadcrumbsProps) {
  // Build breadcrumb trail
  const crumbs: Array<{ label: string; path: string }> = [
    { label: "Catálogo", path: "/catalogo" },
  ];

  if (categoriaId) {
    const trail = getCategoryTrail(categoriaId, categories);
    trail.forEach((cat) => {
      crumbs.push({
        label: cat.nombre,
        path: `/catalogo?categoria_id=${cat.id}`,
      });
    });
  }

  if (crumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
      {crumbs.map((crumb, idx) => (
        <span key={crumb.path} className="flex items-center gap-2">
          {idx > 0 && (
            <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {idx === crumbs.length - 1 ? (
            <span className="text-gray-900 font-medium">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-blue-600 transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

/** Build category trail from leaf to root */
function getCategoryTrail(
  categoryId: number,
  categories: CategoriaTreeItem[],
): CategoriaTreeItem[] {
  const trail: CategoriaTreeItem[] = [];
  let currentId: number | null = categoryId;

  while (currentId !== null) {
    const cat = categories.find((c) => c.id === currentId);
    if (!cat) break;
    trail.unshift(cat);
    currentId = cat.padre_id;
  }

  return trail;
}
