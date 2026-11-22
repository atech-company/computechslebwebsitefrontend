import {
  parseCatalogSearchParams,
  type CatalogSearchParams,
} from "@/lib/catalog";
import {
  expandCategoryFilter,
  type ProductListParams,
} from "@/lib/woocommerce/products";

export async function resolveCatalogListParams(
  sp: CatalogSearchParams,
  defaults: Partial<ProductListParams> = {},
): Promise<ProductListParams> {
  const params = parseCatalogSearchParams(sp, defaults);
  const category = await expandCategoryFilter(params.category);
  return { ...params, category };
}
