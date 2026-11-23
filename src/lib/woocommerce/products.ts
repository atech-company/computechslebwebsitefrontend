import { cache } from "react";
import { storeFetch } from "@/lib/woocommerce/store-client";
import { normalizeProduct, normalizeProducts } from "@/lib/woocommerce/normalize";
import type {
  ProductCardModel,
  StoreBrand,
  StoreCategory,
  StoreProduct,
} from "@/types/woocommerce";

export interface ProductListParams {
  page?: number;
  perPage?: number;
  search?: string;
  category?: string | number;
  brand?: string | number;
  onSale?: boolean;
  order?: "asc" | "desc";
  orderby?:
    | "date"
    | "price"
    | "popularity"
    | "rating"
    | "title"
    | "menu_order";
  minPrice?: string;
  maxPrice?: string;
  stockStatus?: "instock" | "outofstock" | "onbackorder";
  attribute?: string;
  attributeTerm?: string;
  slug?: string;
  include?: number[];
  type?: string;
  featured?: boolean;
}

const CATALOG_REVALIDATE = 120;

export async function getProducts(params: ProductListParams = {}): Promise<{
  products: ProductCardModel[];
  total: number;
  totalPages: number;
}> {
  const query: Record<string, string | number | boolean | undefined> = {
    page: params.page ?? 1,
    per_page: params.perPage ?? 12,
    search: params.search,
    category: params.category,
    // Store API brand filter (WooCommerce brands)
    brand: params.brand,
    on_sale: params.onSale,
    order: params.order,
    orderby: params.orderby,
    min_price: params.minPrice,
    max_price: params.maxPrice,
    stock_status: params.stockStatus,
    attribute: params.attribute,
    attribute_term: params.attributeTerm,
    slug: params.slug,
    type: params.type,
    featured: params.featured,
  };

  if (params.include?.length) {
    query.include = params.include.join(",");
  }

  const result = await storeFetch<StoreProduct[]>({
    path: "/products",
    query,
    cache: "force-cache",
    next: { revalidate: CATALOG_REVALIDATE, tags: ["products"] },
  });

  return {
    products: normalizeProducts(result.data || []),
    total: result.total ?? result.data?.length ?? 0,
    totalPages: result.totalPages ?? 1,
  };
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductCardModel | null> {
  const { products } = await getProducts({ slug, perPage: 1 });
  return products[0] ?? null;
}

export async function getProductById(
  id: number,
): Promise<ProductCardModel | null> {
  const result = await storeFetch<StoreProduct>({
    path: `/products/${id}`,
    cache: "force-cache",
    next: { revalidate: CATALOG_REVALIDATE, tags: [`product-${id}`] },
  });
  return normalizeProduct(result.data);
}

export async function getRelatedProducts(
  id: number,
  perPage = 8,
): Promise<ProductCardModel[]> {
  const result = await storeFetch<StoreProduct[]>({
    path: "/products",
    query: { related: id, per_page: perPage },
    cache: "force-cache",
    next: { revalidate: CATALOG_REVALIDATE, tags: [`related-${id}`] },
  });
  return normalizeProducts(result.data || []);
}

function uniqueById<T extends { id: number }>(items: T[]): T[] {
  const seen = new Set<number>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

const fetchAllCategories = cache(async function fetchAllCategories() {
  const result = await storeFetch<StoreCategory[]>({
    path: "/products/categories",
    query: { per_page: 100, hide_empty: false },
    cache: "force-cache",
    next: { revalidate: 300, tags: ["categories"] },
  });
  return uniqueById(result.data || []);
});

export async function getCategories(params?: {
  parent?: number;
  hideEmpty?: boolean;
  perPage?: number;
}): Promise<StoreCategory[]> {
  let list = await fetchAllCategories();
  if (params?.hideEmpty ?? true) {
    list = list.filter((c) => c.count > 0);
  }
  if (params?.parent !== undefined) {
    list = list.filter((c) => c.parent === params.parent);
  }
  const limit = params?.perPage ?? 100;
  return list.slice(0, limit);
}

export async function getCategoryBySlug(
  slug: string,
): Promise<StoreCategory | null> {
  const categories = await fetchAllCategories();
  const normalized = slug.trim().toLowerCase();
  return (
    categories.find((c) => c.slug.toLowerCase() === normalized) ?? null
  );
}

/** Parent category IDs plus direct children — Store API does not auto-include descendants. */
export async function getCategoryFilterIds(
  category: StoreCategory,
): Promise<string> {
  const categories = await fetchAllCategories();
  const childIds = [
    ...new Set(
      categories.filter((c) => c.parent === category.id).map((c) => c.id),
    ),
  ];
  return [...new Set([category.id, ...childIds])].join(",");
}

export async function expandCategoryFilter(
  category?: string | number,
): Promise<string | undefined> {
  if (category === undefined || category === "") return undefined;
  const raw = String(category);
  if (raw.includes(",")) return raw;
  const categories = await fetchAllCategories();
  const id = Number(raw);
  const cat =
    Number.isFinite(id) && String(id) === raw.trim()
      ? categories.find((c) => c.id === id)
      : categories.find((c) => c.slug.toLowerCase() === raw.toLowerCase());
  if (!cat) return raw;
  return getCategoryFilterIds(cat);
}

export const getBrands = cache(async function getBrands(
  perPage = 100,
): Promise<StoreBrand[]> {
  const result = await storeFetch<StoreBrand[]>({
    path: "/products/brands",
    query: { per_page: perPage, hide_empty: true },
    cache: "force-cache",
    next: { revalidate: 300, tags: ["brands"] },
  });
  return uniqueById(result.data || []);
});

export async function getBrandBySlug(
  slug: string,
): Promise<StoreBrand | null> {
  const brands = await getBrands(100);
  const normalized = slug.trim().toLowerCase();
  return brands.find((b) => b.slug.toLowerCase() === normalized) ?? null;
}

export async function getProductAttributes() {
  const result = await storeFetch<
    Array<{
      id: number;
      name: string;
      taxonomy: string;
      type: string;
      order: string;
      has_archives: boolean;
      count: number;
    }>
  >({
    path: "/products/attributes",
    cache: "force-cache",
    next: { revalidate: 600, tags: ["attributes"] },
  });
  return result.data || [];
}

export async function getCollectionData(params: {
  category?: string | number;
  calculatePriceRange?: boolean;
  calculateStockStatusCounts?: boolean;
  calculateAttributeCounts?: boolean;
}) {
  return storeFetch({
    path: "/products/collection-data",
    query: {
      category: params.category,
      calculate_price_range: params.calculatePriceRange ?? true,
      calculate_stock_status_counts: params.calculateStockStatusCounts ?? true,
      calculate_attribute_counts: params.calculateAttributeCounts
        ? "yes"
        : undefined,
    },
    cache: "force-cache",
    next: { revalidate: 120, tags: ["collection-data"] },
  });
}

export async function searchSuggestions(term: string, limit = 8) {
  if (!term.trim()) return { products: [] as ProductCardModel[], categories: [] as StoreCategory[] };
  const [productsResult, categories] = await Promise.all([
    getProducts({ search: term, perPage: limit }),
    getCategories({ hideEmpty: true }),
  ]);
  const matchedCategories = categories
    .filter((c) => c.name.toLowerCase().includes(term.toLowerCase()))
    .slice(0, 5);
  return { products: productsResult.products, categories: matchedCategories };
}
