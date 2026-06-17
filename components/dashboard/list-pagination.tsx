type ListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function ListPageSummary({
  meta,
  isLoading,
  hasError,
  itemLabel,
}: {
  meta: ListMeta;
  isLoading: boolean;
  hasError: boolean;
  itemLabel: string;
}) {
  if (isLoading || hasError || meta.total <= 0) return null;

  return (
    <p className="text-center text-xs text-brand-dark/60">
      Page {meta.page} sur {meta.totalPages} — {meta.pageSize} {itemLabel} par page ({meta.total} au total)
    </p>
  );
}

export function ListPagination({
  page,
  totalPages,
  onPageChange,
  ariaLabel,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  ariaLabel: string;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav
      className="mt-6 flex flex-wrap items-center justify-center gap-2 border-t border-brand-medium/20 pt-6"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-full border border-brand-medium/35 bg-white px-3 py-1.5 text-xs font-semibold text-brand-dark transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Précédent
      </button>
      {pages.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          onClick={() => onPageChange(pageNumber)}
          aria-current={pageNumber === page ? "page" : undefined}
          className={`min-w-9 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            pageNumber === page
              ? "bg-brand-dark text-white"
              : "border border-brand-medium/35 bg-white text-brand-dark hover:bg-zinc-50"
          }`}
        >
          {pageNumber}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-full border border-brand-medium/35 bg-white px-3 py-1.5 text-xs font-semibold text-brand-dark transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Suivant
      </button>
    </nav>
  );
}
