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

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("deals") };
}

export default async function DealsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const tNav = await getTranslations("nav");
  const tHome = await getTranslations("home");
  const tCommon = await getTranslations("common");

  const listParams = await resolveCatalogListParams(
    { ...sp, on_sale: "true" },
    { onSale: true, orderby: "date", order: "desc" },
  );

  const [result, categories] = await Promise.all([
    getProducts(listParams),
    getCategories({ hideEmpty: true }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: tNav("deals") },
        ]}
      />

      <FadeIn>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {tHome("todaysDeals")}
          </h1>
          <p className="mt-2 text-muted">
            {result.total} deal{result.total === 1 ? "" : "s"}
          </p>
        </div>

        <CatalogFilters
          values={{ ...sp, on_sale: "true" }}
          categories={categories}
          showOnSale={false}
          resultCount={result.total}
          hiddenFields={{ on_sale: "true" }}
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
            pathname="/deals"
            page={listParams.page ?? 1}
            totalPages={result.totalPages}
            searchParams={{ ...sp, on_sale: "true" }}
          />
        </CatalogFilters>
      </FadeIn>
    </div>
  );
}
