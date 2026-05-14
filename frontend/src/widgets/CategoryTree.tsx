import { useState } from "react";
import type { CategoriaTreeItem } from "../entities/category/types";

interface CategoryTreeProps {
  categories: CategoriaTreeItem[];
  selectedId: number | undefined;
  onSelect: (id: number | undefined) => void;
}

interface TreeNodeProps {
  node: CategoriaTreeItem;
  allCategories: CategoriaTreeItem[];
  selectedId: number | undefined;
  onSelect: (id: number | undefined) => void;
  defaultExpanded: boolean;
}

function TreeNode({
  node,
  allCategories,
  selectedId,
  onSelect,
  defaultExpanded,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const children = allCategories.filter((c) => c.padre_id === node.id);
  const hasChildren = children.length > 0;
  const isSelected = selectedId === node.id;

  return (
    <li>
      <div className="flex items-center gap-1">
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 hover:bg-surface-tertiary rounded transition-colors"
          >
            <svg
              className={`w-4 h-4 text-text-tertiary transition-transform ${
                isExpanded ? "rotate-90" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        ) : (
          <span className="w-5" />
        )}
        <button
          onClick={() => onSelect(isSelected ? undefined : node.id)}
          className={`flex-1 text-left px-2 py-1 text-sm rounded transition-colors ${
            isSelected
              ? "bg-primary-50 text-primary-700 font-medium"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
          }`}
        >
          {node.nombre}
        </button>
      </div>

      {hasChildren && isExpanded && (
        <ul className="ml-4 border-l border-border-default pl-2 mt-1 space-y-0.5">
          {children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              allCategories={allCategories}
              selectedId={selectedId}
              onSelect={onSelect}
              defaultExpanded={false}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function CategoryTree({
  categories,
  selectedId,
  onSelect,
}: CategoryTreeProps) {
  const rootCategories = categories.filter((c) => c.padre_id === null);

  return (
    <div>
      <h3 className="text-sm font-semibold text-text-primary mb-3">Categorías</h3>
      <button
        onClick={() => onSelect(undefined)}
        className={`w-full text-left px-3 py-1.5 text-sm rounded transition-colors mb-1 ${
          selectedId === undefined
            ? "bg-primary-50 text-primary-700 font-medium"
            : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
        }`}
      >
        Todas las categorías
      </button>

      <ul className="space-y-0.5">
        {rootCategories.map((cat) => (
          <TreeNode
            key={cat.id}
            node={cat}
            allCategories={categories}
            selectedId={selectedId}
            onSelect={onSelect}
            defaultExpanded={selectedId !== undefined && isAncestor(cat.id, selectedId, categories)}
          />
        ))}
      </ul>
    </div>
  );
}

/** Check if a category is an ancestor of another */
function isAncestor(
  potentialAncestorId: number,
  targetId: number,
  categories: CategoriaTreeItem[],
): boolean {
  const target = categories.find((c) => c.id === targetId);
  if (!target || target.padre_id === null) return false;
  if (target.padre_id === potentialAncestorId) return true;
  return isAncestor(potentialAncestorId, target.padre_id, categories);
}
