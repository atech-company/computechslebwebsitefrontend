import type { ProductListParams } from "@/lib/woocommerce/products";

export type CatalogSearchParams = {
  page?: string;
  orderby?: string;
  order?: string;
  on_sale?: string;
  category?: string;
  min_price?: string;
  max_price?: string;
  stock_status?: string;
  q?: string;
  brand?: string;
  per_page?: string;
  view?: string;
};

export const PER_PAGE_OPTIONS = [12, 24, 36, 48] as const;
export const GRID_VIEW_OPTIONS = [2, 3, 4, 5] as const;
export type GridView = (typeof GRID_VIEW_OPTIONS)[number];

const ORDERBY_VALUES = [
  "date",
  "price",
  "popularity",
  "rating",
  "title",
  "menu_order",
] as const;

const STOCK_VALUES = ["instock", "outofstock", "onbackorder"] as const;

const PRICE_MINOR_UNIT = 2;

export function parsePerPage(value?: string, fallback = 12): number {
  const n = Number(value);
  return (PER_PAGE_OPTIONS as readonly number[]).includes(n) ? n : fallback;
}

export function parseGridView(
  value?: string,
  fallback: GridView = 4,
): GridView {
  const n = Number(value);
  return (GRID_VIEW_OPTIONS as readonly number[]).includes(n)
    ? (n as GridView)
    : fallback;
}

export function catalogGridClass(view: GridView): string {
  switch (view) {
    case 2:
      return "grid-cols-1 sm:grid-cols-2";
    case 3:
      return "grid-cols-2 md:grid-cols-3";
    case 5:
      return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
    default:
      return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  }
}

export function dollarsToMinorUnits(value?: string): string | undefined {
  if (!value?.trim()) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return String(Math.round(n * 10 ** PRICE_MINOR_UNIT));
}

export function parseCatalogSearchParams(
  sp: CatalogSearchParams,
  defaults: Partial<ProductListParams> = {},
): ProductListParams {
  const page = Number(sp.page || "1");
  const orderby = ORDERBY_VALUES.includes(
    sp.orderby as (typeof ORDERBY_VALUES)[number],
  )
    ? (sp.orderby as ProductListParams["orderby"])
    : defaults.orderby;
  const order =
    sp.order === "asc" || sp.order === "desc" ? sp.order : defaults.order;
  const stockStatus = STOCK_VALUES.includes(
    sp.stock_status as (typeof STOCK_VALUES)[number],
  )
    ? (sp.stock_status as ProductListParams["stockStatus"])
    : defaults.stockStatus;

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    perPage: parsePerPage(sp.per_page, defaults.perPage ?? 12),
    search: sp.q?.trim() || defaults.search,
    category: sp.category || defaults.category,
    brand: sp.brand || defaults.brand,
    onSale:
      sp.on_sale === "true" || sp.on_sale === "1"
        ? true
        : sp.on_sale === "false" || sp.on_sale === "0"
          ? false
          : defaults.onSale,
    orderby,
    order,
    minPrice: dollarsToMinorUnits(sp.min_price) || defaults.minPrice,
    maxPrice: dollarsToMinorUnits(sp.max_price) || defaults.maxPrice,
    stockStatus,
  };
}

export function buildCatalogQuery(
  sp: CatalogSearchParams,
  overrides: Record<string, string | undefined> = {},
): string {
  const params = new URLSearchParams();
  const merged: Record<string, string | undefined> = {
    q: sp.q,
    orderby: sp.orderby,
    order: sp.order,
    on_sale: sp.on_sale,
    category: sp.category,
    min_price: sp.min_price,
    max_price: sp.max_price,
    stock_status: sp.stock_status,
    brand: sp.brand,
    per_page: sp.per_page,
    view: sp.view,
    page: sp.page,
    ...overrides,
  };

  for (const [key, value] of Object.entries(merged)) {
    if (value !== undefined && value !== "") params.set(key, value);
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function sortSelectValue(orderby?: string, order?: string): string {
  const by = orderby || "date";
  const dir =
    order || (by === "price" || by === "title" ? "asc" : "desc");
  return `${by}-${dir}`;
}

export function parseSortSelect(value: string): {
  orderby: string;
  order: "asc" | "desc";
} {
  const [orderby, dir] = value.split("-");
  const order: "asc" | "desc" = dir === "asc" ? "asc" : "desc";
  return { orderby: orderby || "date", order };
}
