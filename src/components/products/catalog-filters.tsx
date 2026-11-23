"use client";

import type { FormEvent, ReactNode } from "react";
import { useCallback, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  BadgeDollarSign,
  Boxes,
  LayoutGrid,
  PackageCheck,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  children: ReactNode;
}

const selectClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

export function CatalogFilters({
  values,
  categories = [],
  showSearch = true,
  showOnSale = true,
  showCategory = true,
  hiddenFields,
  resultCount,
  children,
}: CatalogFiltersProps) {
  const t = useTranslations("catalog");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);
  const view = parseGridView(values.view);
  const perPage = parsePerPage(values.per_page);

  const pushFilters = useCallback(
    (next: CatalogSearchParams) => {
      const qs = buildCatalogQuery(
        { ...values, ...next, page: undefined },
        hiddenFields,
      );
      startTransition(() => router.push(`${pathname}${qs}`));
    },
    [hiddenFields, pathname, router, values],
  );

  const clearFilters = () =>
    pushFilters({
      q: undefined,
      category: hiddenFields?.category,
      min_price: undefined,
      max_price: undefined,
      stock_status: undefined,
      on_sale: hiddenFields?.on_sale,
      per_page: values.per_page,
      view: values.view,
      orderby: values.orderby,
      order: values.order,
    });

  const activeChips: Array<{
    key: string;
    label: string;
    clear: CatalogSearchParams;
  }> = [];
  if (values.q) {
    activeChips.push({
      key: "q",
      label: t("searchChip", { value: values.q }),
      clear: { q: undefined },
    });
  }
  if (values.on_sale === "true") {
    activeChips.push({
      key: "sale",
      label: t("onSale"),
      clear: { on_sale: undefined },
    });
  }
  if (values.stock_status === "instock") {
    activeChips.push({
      key: "stock",
      label: t("inStock"),
      clear: { stock_status: undefined },
    });
  }
  if (values.stock_status === "outofstock") {
    activeChips.push({
      key: "oos",
      label: t("outOfStock"),
      clear: { stock_status: undefined },
    });
  }
  if (values.min_price || values.max_price) {
    activeChips.push({
      key: "price",
      label: t("priceChip", {
        min: values.min_price || "0",
        max: values.max_price || "∞",
      }),
      clear: { min_price: undefined, max_price: undefined },
    });
  }
  if (showCategory && values.category && !hiddenFields?.category) {
    const category = categories.find(
      (item) => String(item.id) === values.category,
    );
    activeChips.push({
      key: "category",
      label: category?.name || t("category"),
      clear: { category: undefined },
    });
  }

  const handleFilterSubmit = (
    event: FormEvent<HTMLFormElement>,
    closeMobile = false,
  ) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    pushFilters({
      q: String(form.get("q") || "") || undefined,
      category: String(form.get("category") || "") || undefined,
      min_price: String(form.get("min_price") || "") || undefined,
      max_price: String(form.get("max_price") || "") || undefined,
      stock_status: String(form.get("stock_status") || "") || undefined,
      on_sale: form.get("on_sale") === "true" ? "true" : undefined,
      orderby: values.orderby,
      order: values.order,
      per_page: values.per_page,
      view: values.view,
    });
    if (closeMobile) setMobileOpen(false);
  };

  const filterPanel = (idPrefix: string, closeMobile = false) => (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-900 px-5 py-6 text-white">
        <div className="absolute -end-8 -top-8 h-28 w-28 rounded-full bg-cyan-400/20 blur-2xl" />
        <div className="relative flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <SlidersHorizontal className="h-5 w-5 text-cyan-300" />
          </span>
          <div>
            <p className="font-semibold">{t("refine")}</p>
            <p className="mt-1 text-xs leading-relaxed text-cyan-100/75">
              {t("refineDescription")}
            </p>
          </div>
        </div>
      </div>

      <form
        key={`${idPrefix}-${buildCatalogQuery(values, hiddenFields)}`}
        className="space-y-6 p-5"
        onSubmit={(event) => handleFilterSubmit(event, closeMobile)}
      >
        {hiddenFields
          ? Object.entries(hiddenFields).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))
          : null}

        {showSearch ? (
          <div>
            <label
              htmlFor={`${idPrefix}-search`}
              className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500"
            >
              <Search className="h-3.5 w-3.5 text-cyan-600" />
              {t("search")}
            </label>
            <Input
              id={`${idPrefix}-search`}
              name="q"
              defaultValue={values.q ?? ""}
              placeholder={t("searchPlaceholder")}
              className="h-11 rounded-xl"
            />
          </div>
        ) : null}

        {showCategory ? (
          <div>
            <label
              htmlFor={`${idPrefix}-category`}
              className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500"
            >
              <Boxes className="h-3.5 w-3.5 text-cyan-600" />
              {t("category")}
            </label>
            <select
              id={`${idPrefix}-category`}
              name="category"
              defaultValue={values.category ?? ""}
              className={selectClass}
            >
              <option value="">{t("allCategories")}</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            <BadgeDollarSign className="h-3.5 w-3.5 text-cyan-600" />
            {t("price")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Input
              name="min_price"
              type="number"
              min={0}
              step="0.01"
              defaultValue={values.min_price ?? ""}
              placeholder={t("minPrice")}
              aria-label={t("minPrice")}
              className="h-11 rounded-xl"
            />
            <Input
              name="max_price"
              type="number"
              min={0}
              step="0.01"
              defaultValue={values.max_price ?? ""}
              placeholder={t("maxPrice")}
              aria-label={t("maxPrice")}
              className="h-11 rounded-xl"
            />
          </div>
        </div>

        <fieldset>
          <legend className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            <PackageCheck className="h-3.5 w-3.5 text-cyan-600" />
            {t("availability")}
          </legend>
          <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-900">
            {[
              ["", t("all")],
              ["instock", t("inStock")],
              ["outofstock", t("outOfStock")],
            ].map(([value, label]) => (
              <label key={value || "all"} className="cursor-pointer">
                <input
                  type="radio"
                  name="stock_status"
                  value={value}
                  defaultChecked={(values.stock_status ?? "") === value}
                  className="peer sr-only"
                />
                <span className="flex min-h-9 items-center justify-center rounded-xl px-2 text-center text-[11px] font-semibold text-slate-500 transition peer-checked:bg-white peer-checked:text-blue-700 peer-checked:shadow-sm dark:peer-checked:bg-slate-800 dark:peer-checked:text-cyan-300">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {showOnSale ? (
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm font-semibold text-amber-950 transition hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              {t("onSale")}
            </span>
            <input
              type="checkbox"
              name="on_sale"
              value="true"
              defaultChecked={values.on_sale === "true"}
              className="h-4 w-4 rounded border-amber-300 accent-amber-500"
            />
          </label>
        ) : null}

        <div className="grid grid-cols-[1fr_auto] gap-2 border-t border-slate-100 pt-5 dark:border-slate-800">
          <Button type="submit" className="h-11 rounded-xl">
            <SlidersHorizontal className="h-4 w-4" />
            {t("apply")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-xl"
            aria-label={t("clearAll")}
            title={t("clearAll")}
            onClick={() => {
              clearFilters();
              if (closeMobile) setMobileOpen(false);
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );

  return (
    <div
      className={cn(
        "grid gap-7 lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:items-start",
        pending && "pointer-events-none opacity-70",
      )}
    >
      <aside className="hidden lg:sticky lg:top-24 lg:block">
        {filterPanel("desktop")}
      </aside>

      <section className="min-w-0">
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl lg:hidden"
                  onClick={() => setMobileOpen(true)}
                >
                  <SlidersHorizontal className="h-4 w-4 text-cyan-600" />
                  {t("filters")}
                  {activeChips.length ? (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-cyan-600 px-1 text-[10px] font-bold text-white">
                      {activeChips.length}
                    </span>
                  ) : null}
                </Button>
                <SheetContent
                  side={locale === "ar" ? "right" : "left"}
                  className="w-[92vw] max-w-sm overflow-y-auto p-0"
                >
                  <SheetHeader className="sr-only">
                    <SheetTitle>{t("filters")}</SheetTitle>
                    <SheetDescription>{t("refineDescription")}</SheetDescription>
                  </SheetHeader>
                  {filterPanel("mobile", true)}
                </SheetContent>
              </Sheet>

              <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
                  <Boxes className="h-4 w-4" />
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {typeof resultCount === "number"
                    ? t("resultCount", { count: resultCount })
                    : t("products")}
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-wrap items-center justify-end gap-2 sm:flex-none">
              <label className="sr-only" htmlFor="catalog-sort">
                {t("sort")}
              </label>
              <select
                id="catalog-sort"
                value={sortSelectValue(values.orderby, values.order)}
                className={cn(selectClass, "h-10 w-auto min-w-36 rounded-xl")}
                onChange={(event) => {
                  const sort = parseSortSelect(event.target.value);
                  pushFilters({ orderby: sort.orderby, order: sort.order });
                }}
              >
                <option value="date-desc">{t("sortNewest")}</option>
                <option value="popularity-desc">{t("sortPopular")}</option>
                <option value="price-asc">{t("priceLowHigh")}</option>
                <option value="price-desc">{t("priceHighLow")}</option>
                <option value="title-asc">{t("sortName")}</option>
              </select>

              <label className="sr-only" htmlFor="catalog-per-page">
                {t("itemsPerPage")}
              </label>
              <select
                id="catalog-per-page"
                value={String(perPage)}
                className={cn(
                  selectClass,
                  "hidden h-10 w-auto rounded-xl sm:block",
                )}
                onChange={(event) =>
                  pushFilters({ per_page: event.target.value })
                }
              >
                {PER_PAGE_OPTIONS.map((number) => (
                  <option key={number} value={number}>
                    {t("perPage", { count: number })}
                  </option>
                ))}
              </select>

              <div
                className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-900 sm:inline-flex"
                role="group"
                aria-label={t("columns")}
              >
                <LayoutGrid className="mx-1 h-3.5 w-3.5 text-slate-400" />
                {GRID_VIEW_OPTIONS.map((columns) => (
                  <button
                    key={columns}
                    type="button"
                    aria-pressed={view === columns}
                    aria-label={t("columnCount", { count: columns })}
                    className={cn(
                      "h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition",
                      view === columns
                        ? "bg-slate-950 text-white shadow-sm dark:bg-cyan-500 dark:text-slate-950"
                        : "text-slate-500 hover:bg-white dark:hover:bg-slate-800",
                    )}
                    onClick={() => pushFilters({ view: String(columns) })}
                  >
                    {columns}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {activeChips.length ? (
            <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-100 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-200"
                  onClick={() => pushFilters(chip.clear)}
                >
                  {chip.label}
                  <X className="h-3 w-3" />
                </button>
              ))}
              <button
                type="button"
                className="px-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                onClick={clearFilters}
              >
                {t("clearAll")}
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-6">{children}</div>
      </section>
    </div>
  );
}
