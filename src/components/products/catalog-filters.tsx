"use client";

import { useRouter } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { useCallback, useTransition } from "react";
import { LayoutGrid, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  GRID_VIEW_OPTIONS,
  PER_PAGE_OPTIONS,
  buildCatalogQuery,
  parseGridView,
  parsePerPage,
  parseSortSelect,
  sortSelectValue,
  type CatalogSearchParams,
} from "@/lib/catalog";
import type { StoreCategory } from "@/types/woocommerce";

interface CatalogFiltersProps {
  values: CatalogSearchParams;
  categories?: StoreCategory[];
  showSearch?: boolean;
  showOnSale?: boolean;
  showCategory?: boolean;
  hiddenFields?: Record<string, string>;
  resultCount?: number;
}

const selectClass =
  "h-10 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

export function CatalogFilters({
  values,
  categories = [],
  showSearch = true,
  showOnSale = true,
  showCategory = true,
  hiddenFields,
  resultCount,
}: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const view = parseGridView(values.view);
  const perPage = parsePerPage(values.per_page);

  const pushFilters = useCallback(
    (next: CatalogSearchParams) => {
      const qs = buildCatalogQuery(
        { ...values, ...next, page: undefined },
        hiddenFields,
      );
      startTransition(() => {
        router.push(`${pathname}${qs}`);
      });
    },
    [hiddenFields, pathname, router, values],
  );

  const activeChips: Array<{
    key: string;
    label: string;
    clear: CatalogSearchParams;
  }> = [];
  if (values.q) {
    activeChips.push({
      key: "q",
      label: `Search: ${values.q}`,
      clear: { q: undefined },
    });
  }
  if (values.on_sale === "true") {
    activeChips.push({
      key: "sale",
      label: "On sale",
      clear: { on_sale: undefined },
    });
  }
  if (values.stock_status === "instock") {
    activeChips.push({
      key: "stock",
      label: "In stock",
      clear: { stock_status: undefined },
    });
  }
  if (values.stock_status === "outofstock") {
    activeChips.push({
      key: "oos",
      label: "Out of stock",
      clear: { stock_status: undefined },
    });
  }
  if (values.min_price || values.max_price) {
    activeChips.push({
      key: "price",
      label: `Price ${values.min_price || "0"}–${values.max_price || "∞"}`,
      clear: { min_price: undefined, max_price: undefined },
    });
  }
  if (showCategory && values.category && !hiddenFields?.category) {
    const cat = categories.find((c) => String(c.id) === values.category);
    activeChips.push({
      key: "category",
      label: cat?.name || "Category",
      clear: { category: undefined },
    });
  }

  const formKey = buildCatalogQuery(values, hiddenFields);

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/80",
        pending && "opacity-70",
      )}
    >
      <form
        key={formKey}
        method="get"
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const sort = parseSortSelect(String(fd.get("sort") || "date-desc"));
          const next: CatalogSearchParams = {
            q: String(fd.get("q") || "") || undefined,
            category: String(fd.get("category") || "") || undefined,
            orderby: sort.orderby,
            order: sort.order,
            min_price: String(fd.get("min_price") || "") || undefined,
            max_price: String(fd.get("max_price") || "") || undefined,
            stock_status: String(fd.get("stock_status") || "") || undefined,
            on_sale: String(fd.get("on_sale") || "") || undefined,
            per_page: String(fd.get("per_page") || "") || undefined,
            view: String(fd.get("view") || "") || undefined,
          };
          pushFilters(next);
        }}
      >
        {hiddenFields
          ? Object.entries(hiddenFields).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))
          : null}
        <input type="hidden" name="view" value={String(view)} />

        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <SlidersHorizontal className="h-4 w-4 text-cyan-600" />
            <span className="font-medium text-slate-800 dark:text-slate-100">
              Filters
            </span>
            {typeof resultCount === "number" ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {resultCount} products
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="catalog-sort">
              Sort
            </label>
            <select
              id="catalog-sort"
              name="sort"
              defaultValue={sortSelectValue(values.orderby, values.order)}
              className={selectClass}
              onChange={(e) => {
                const sort = parseSortSelect(e.target.value);
                pushFilters({ orderby: sort.orderby, order: sort.order });
              }}
            >
              <option value="date-desc">Sort: Newest</option>
              <option value="popularity-desc">Sort: Popular</option>
              <option value="price-asc">Price: Low to high</option>
              <option value="price-desc">Price: High to low</option>
              <option value="title-asc">Sort: Name</option>
            </select>

            <label className="sr-only" htmlFor="catalog-per-page">
              Items per page
            </label>
            <select
              id="catalog-per-page"
              name="per_page"
              defaultValue={String(perPage)}
              className={selectClass}
              onChange={(e) => pushFilters({ per_page: e.target.value })}
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} per page
                </option>
              ))}
            </select>

            <div
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
              role="group"
              aria-label="Grid columns"
            >
              <LayoutGrid className="ml-1.5 h-3.5 w-3.5 text-slate-400" />
              {GRID_VIEW_OPTIONS.map((cols) => (
                <button
                  key={cols}
                  type="button"
                  aria-pressed={view === cols}
                  aria-label={`${cols} columns`}
                  className={cn(
                    "h-8 min-w-8 rounded-full px-2 text-xs font-semibold",
                    view === cols
                      ? "bg-cyan-600 text-white"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                  )}
                  onClick={() => pushFilters({ view: String(cols) })}
                >
                  {cols}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          {showSearch ? (
            <Input
              name="q"
              defaultValue={values.q ?? ""}
              placeholder="Search in collection"
              className="h-10 min-w-[12rem] flex-1 rounded-full"
            />
          ) : null}

          {showCategory ? (
            <select
              name="category"
              defaultValue={values.category ?? ""}
              className={cn(selectClass, "min-w-[9rem]")}
              onChange={(e) =>
                pushFilters({ category: e.target.value || undefined })
              }
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </option>
              ))}
            </select>
          ) : null}

          <Input
            name="min_price"
            type="number"
            min={0}
            step="0.01"
            defaultValue={values.min_price ?? ""}
            placeholder="Min $"
            className="h-10 w-24 rounded-full"
          />
          <Input
            name="max_price"
            type="number"
            min={0}
            step="0.01"
            defaultValue={values.max_price ?? ""}
            placeholder="Max $"
            className="h-10 w-24 rounded-full"
          />

          <select
            name="stock_status"
            defaultValue={values.stock_status ?? ""}
            className={cn(selectClass, "min-w-[8rem]")}
            onChange={(e) =>
              pushFilters({ stock_status: e.target.value || undefined })
            }
          >
            <option value="">Availability</option>
            <option value="instock">In stock</option>
            <option value="outofstock">Out of stock</option>
          </select>

          {showOnSale ? (
            <select
              name="on_sale"
              defaultValue={values.on_sale ?? ""}
              className={cn(selectClass, "min-w-[7rem]")}
              onChange={(e) =>
                pushFilters({ on_sale: e.target.value || undefined })
              }
            >
              <option value="">Offers</option>
              <option value="true">On sale</option>
            </select>
          ) : null}

          <Button type="submit" size="sm" className="h-10 rounded-full px-5">
            Apply
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-10 rounded-full"
            onClick={() =>
              pushFilters({
                q: undefined,
                category: hiddenFields?.category,
                orderby: undefined,
                order: undefined,
                min_price: undefined,
                max_price: undefined,
                stock_status: undefined,
                on_sale: hiddenFields?.on_sale,
                per_page: values.per_page,
                view: values.view,
              })
            }
          >
            Clear
          </Button>
        </div>
      </form>

      {activeChips.length ? (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              onClick={() => pushFilters(chip.clear)}
            >
              {chip.label}
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
