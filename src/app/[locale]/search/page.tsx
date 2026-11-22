import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { FadeIn } from "@/components/animations/fade-in";
import { CatalogFilters } from "@/components/products/catalog-filters";
import { CatalogPagination } from "@/components/products/catalog-pagination";
import { ProductGrid } from "@/components/products/product-grid";
import { type CatalogSearchParams, parseGridView } from "@/lib/catalog";
import { resolveCatalogListParams } from "@/lib/catalog-server";
import { getCategories, getProducts } from "@/lib/woocommerce/products";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<CatalogSearchParams>;
};

export async function generateMetadata({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "nav" });
  const q = sp.q?.trim();
  return {
    title: q ? `${t("search")}: ${q}` : t("search"),
  };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");
  const q = sp.q?.trim() ?? "";

  const listParams = await resolveCatalogListParams(sp, {
    search: q || undefined,
    orderby: "date",
    order: "desc",
  });

  // Store API may not support "relevance"; fall back to date when empty query
  if (!q) {
    listParams.orderby = "date";
  } else {
    listParams.orderby = "date";
    listParams.search = q;
  }

  const [result, categories] = await Promise.all([
    q
      ? getProducts(listParams)
      : Promise.resolve({ products: [], total: 0, totalPages: 0 }),
    getCategories({ hideEmpty: true }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: tNav("search") },
        ]}
      />

      <FadeIn>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {tNav("search")}
          </h1>
          <p className="mt-2 text-muted">
            {q
              ? `${result.total} result${result.total === 1 ? "" : "s"} for “${q}”`
              : "Enter a search term to find products."}
          </p>
        </div>

        <CatalogFilters values={sp} categories={categories} showSearch />

        <div className="mt-8">
          {q && result.products.length ? (
            <ProductGrid
              products={result.products}
              locale={locale}
              columns={parseGridView(sp.view)}
            />
          ) : q ? (
            <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
              {tCommon("noResults")}
            </p>
          ) : null}
        </div>

        {q ? (
          <CatalogPagination
            pathname="/search"
            page={listParams.page ?? 1}
            totalPages={result.totalPages}
            searchParams={sp}
          />
        ) : null}
      </FadeIn>
    </div>
  );
}
