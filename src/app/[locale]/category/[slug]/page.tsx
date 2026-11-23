import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { FadeIn } from "@/components/animations/fade-in";
import { CatalogFilters } from "@/components/products/catalog-filters";
import { CatalogPagination } from "@/components/products/catalog-pagination";
import { CatalogUnavailable } from "@/components/products/catalog-unavailable";
import { ProductGrid } from "@/components/products/product-grid";
import { type CatalogSearchParams, parseGridView } from "@/lib/catalog";
import { resolveCatalogListParams } from "@/lib/catalog-server";
import { stripHtml } from "@/lib/utils";
import { isWooCommerceError } from "@/lib/woocommerce/errors";
import {
  getCategoryBySlug,
  getCategoryFilterIds,
  getProducts,
} from "@/lib/woocommerce/products";
import type { StoreCategory } from "@/types/woocommerce";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<CatalogSearchParams>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const category = await getCategoryBySlug(slug);
    if (!category) return { title: "Category" };
    return {
      title: category.name,
      description:
        stripHtml(category.description || "").slice(0, 160) || undefined,
    };
  } catch {
    return { title: "Category" };
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");

  let category: StoreCategory | null = null;
  try {
    category = await getCategoryBySlug(slug);
  } catch (error) {
    return (
      <CatalogUnavailable
        message={
          isWooCommerceError(error)
            ? "WooCommerce is temporarily blocking catalog requests. Refresh in a moment."
            : undefined
        }
      />
    );
  }

  if (!category) notFound();

  let categoryFilter: string;
  let result: Awaited<ReturnType<typeof getProducts>>;
  let page = 1;
  try {
    categoryFilter = await getCategoryFilterIds(category);
    const listParams = await resolveCatalogListParams(sp, {
      category: categoryFilter,
      orderby: "date",
      order: "desc",
    });
    page = listParams.page ?? 1;
    result = await getProducts(listParams);
  } catch {
    return (
      <CatalogUnavailable
        title={category.name}
        message="This category could not be loaded from WooCommerce right now."
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: tNav("shop"), href: "/shop" },
          { label: category.name },
        ]}
      />

      <FadeIn>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {category.name}
          </h1>
          <p className="mt-2 text-muted">
            {result.total} product{result.total === 1 ? "" : "s"}
          </p>
          {category.description ? (
            <div
              className="prose prose-sm mt-3 max-w-3xl text-muted dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: category.description }}
            />
          ) : null}
        </div>

        <CatalogFilters
          values={sp}
          showCategory={false}
          resultCount={result.total}
          hiddenFields={{ category: categoryFilter }}
        >
          {result.products.length ? (
            <ProductGrid
              products={result.products}
              locale={locale}
              columns={parseGridView(sp.view)}
            />
          ) : (
            <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
              {tCommon("noResults")}
            </p>
          )}
          <CatalogPagination
            pathname={`/category/${slug}`}
            page={page}
            totalPages={result.totalPages}
            searchParams={{ ...sp, category: categoryFilter }}
          />
        </CatalogFilters>
      </FadeIn>
    </div>
  );
}
