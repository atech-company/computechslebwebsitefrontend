import { Link } from "@/i18n/navigation";
import { buildCatalogQuery, type CatalogSearchParams } from "@/lib/catalog";
import { cn } from "@/lib/utils";

interface CatalogPaginationProps {
  pathname: string;
  page: number;
  totalPages: number;
  searchParams: CatalogSearchParams;
  className?: string;
}

export function CatalogPagination({
  pathname,
  page,
  totalPages,
  searchParams,
  className,
}: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav
      aria-label="Pagination"
      className={cn("mt-10 flex items-center justify-center gap-3", className)}
    >
      {prev ? (
        <Link
          href={`${pathname}${buildCatalogQuery(searchParams, {
            page: String(prev),
          })}`}
          className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-900"
        >
          Previous
        </Link>
      ) : (
        <span className="rounded-xl border border-transparent px-4 py-2 text-sm text-muted">
          Previous
        </span>
      )}

      <span className="text-sm text-muted">
        Page {page} of {totalPages}
      </span>

      {next ? (
        <Link
          href={`${pathname}${buildCatalogQuery(searchParams, {
            page: String(next),
          })}`}
          className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-900"
        >
          Next
        </Link>
      ) : (
        <span className="rounded-xl border border-transparent px-4 py-2 text-sm text-muted">
          Next
        </span>
      )}
    </nav>
  );
}
