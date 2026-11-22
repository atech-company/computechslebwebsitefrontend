import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { FadeIn } from "@/components/animations/fade-in";
import { CatalogFilters } from "@/components/products/catalog-filters";
import { CatalogPagination } from "@/components/products/catalog-pagination";
import { ProductGrid } from "@/components/products/product-grid";
import { type CatalogSearchParams, parseGridView } from "@/lib/catalog";
import { resolveCatalogListParams } from "@/lib/catalog-server";
import { stripHtml } from "@/lib/utils";
import { getBrandBySlug, getProducts } from "@/lib/woocommerce/products";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<CatalogSearchParams>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return { title: "Brand" };
  return {
    title: brand.name,
    description: stripHtml(brand.description || "").slice(0, 160) || undefined,
  };
}

export default async function BrandPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");

  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const listParams = await resolveCatalogListParams(sp, {
    brand: brand.id,
    orderby: "date",
    order: "desc",
  });

  const result = await getProducts(listParams);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: tNav("brands"), href: "/brands" },
          { label: brand.name },
        ]}
      />

      <FadeIn>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {brand.name}
          </h1>
          {brand.description ? (
            <div
              className="prose prose-sm mt-3 max-w-3xl text-muted dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: brand.description }}
            />
          ) : (
            <p className="mt-2 text-muted">
              {result.total} product{result.total === 1 ? "" : "s"}
            </p>
          )}
        </div>

        <CatalogFilters
          values={sp}
          showCategory={false}
          showOnSale
          resultCount={result.total}
          hiddenFields={{ brand: String(brand.id) }}
        />

        <div className="mt-8">
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
        </div>

        <CatalogPagination
          pathname={`/brands/${slug}`}
          page={listParams.page ?? 1}
          totalPages={result.totalPages}
          searchParams={sp}
        />
      </FadeIn>
    </div>
  );
}
