interface PaginationProps {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, pages, onChange }: PaginationProps) {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-2 text-sm font-medium rounded-lg border border-border-default
                   hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
      >
        Anterior
      </button>

      <div className="flex items-center gap-1">
        {Array.from({ length: pages }, (_, i) => i + 1)
          .filter((p) => {
            // Show first, last, and pages around current
            return (
              p === 1 ||
              p === pages ||
              Math.abs(p - page) <= 1
            );
          })
          .map((p, idx, arr) => (
            <span key={p} className="flex items-center">
              {idx > 0 && arr[idx - 1] !== p - 1 && (
                <span className="px-1 text-text-tertiary">...</span>
              )}
              <button
                onClick={() => onChange(p)}
                className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${
                  p === page
                    ? "bg-primary-500 text-white"
                    : "hover:bg-surface-secondary text-text-primary"
                }`}
              >
                {p}
              </button>
            </span>
          ))}
      </div>

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        className="px-3 py-2 text-sm font-medium rounded-lg border border-border-default
                   hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
      >
        Siguiente
      </button>
    </div>
  );
}
