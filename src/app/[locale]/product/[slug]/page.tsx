import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PackageCheck, Star } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/animations/fade-in";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductSpecifications } from "@/components/products/product-specifications";
import { ProductPurchasePanel } from "@/components/products/product-purchase-panel";
import { RecordRecentlyViewed } from "@/components/products/record-recently-viewed";
import { ProductGrid } from "@/components/products/product-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  extractProductSpecifications,
  getSpecificationPresentation,
} from "@/lib/product-specs";
import { getProductBySlug, getRelatedProducts } from "@/lib/woocommerce/products";
import { formatProductDisplayName, getProductHeadline } from "@/lib/utils";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) return { title: "Product" };
  return {
    title: formatProductDisplayName(product.name),
    description: product.shortDescription.slice(0, 160),
    openGraph: {
      title: formatProductDisplayName(product.name),
      images: product.image ? [product.image.src] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("product");
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const displayName = formatProductDisplayName(product.name);
  const headline = getProductHeadline(product.name);
  const related = await getRelatedProducts(product.id, 8).catch(() => []);
  const specifications = extractProductSpecifications(product);
  const highlights = specifications.slice(0, 4);
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const waUrl = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent(`Hi Computechs, I'm interested in: ${product.name}`)}`
    : null;

  return (
    <main className="min-w-0">
      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-8 lg:px-8">
        <RecordRecentlyViewed productId={product.id} />

        <nav
          className="mb-4 flex min-w-0 items-center gap-2 overflow-hidden text-xs text-muted sm:mb-6 sm:text-sm"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="shrink-0 transition hover:text-blue-600">
            {t("home")}
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/shop" className="shrink-0 transition hover:text-blue-600">
            {t("shop")}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="min-w-0 truncate text-foreground/75">{displayName}</span>
        </nav>

        <section className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,52fr)_minmax(0,48fr)] lg:items-start lg:gap-10">
          <div className="min-w-0">
            <ProductGallery images={product.images} productName={displayName} />
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="flex flex-wrap items-center gap-2">
              {product.brands[0] ? (
                <Badge variant="secondary">{product.brands[0].name}</Badge>
              ) : null}
              <Badge variant={product.isInStock ? "stock" : "secondary"}>
                <span className="me-1 inline-block h-1.5 w-1.5 rounded-full bg-current" />
                {product.stockText ||
                  (product.isInStock ? t("inStock") : t("outOfStock"))}
              </Badge>
              {product.averageRating > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {product.averageRating}
                </span>
              ) : null}
            </div>

            <h1 className="mt-3 break-words text-2xl font-semibold leading-tight tracking-[-0.03em] text-slate-950 sm:text-3xl lg:text-[2.05rem] dark:text-white">
              {headline}
            </h1>

            {product.sku ? (
              <p className="mt-3 break-all text-sm text-muted">
                {t("sku")}:{" "}
                <span className="font-medium text-foreground/80">{product.sku}</span>
              </p>
            ) : null}

            {product.shortDescription ? (
              <p className="mt-4 break-words text-sm leading-relaxed text-foreground/75 sm:text-base">
                {product.shortDescription}
              </p>
            ) : null}

            {highlights.length ? (
              <div className="mt-5 grid min-w-0 grid-cols-2 gap-2">
                {highlights.map((attribute) => {
                  const presentation = getSpecificationPresentation(attribute.name);
                  return (
                    <a
                      key={`${attribute.id}-${attribute.name}`}
                      href="#specifications"
                      className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60"
                    >
                      <div className="flex min-w-0 items-center gap-2 text-xs text-muted">
                        <span aria-hidden="true">{presentation.emoji}</span>
                        <span className="min-w-0 break-words">{attribute.name}</span>
                      </div>
                      <p className="mt-1 break-words text-sm font-semibold">
                        {attribute.terms.map((term) => term.name).join(", ")}
                      </p>
                    </a>
                  );
                })}
              </div>
            ) : null}

            <ProductPurchasePanel product={product} whatsappUrl={waUrl} />
          </div>
        </section>

        {specifications.length ? (
          <ProductSpecifications attributes={specifications} className="mt-10" />
        ) : null}

        {product.description ? (
          <FadeIn delay={0.08}>
            <section className="mt-10 min-w-0 rounded-xl border border-slate-200 bg-white p-5 sm:p-8 dark:border-slate-800 dark:bg-slate-950">
              <div className="mb-4 flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-cyan-400">
                  <PackageCheck className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {t("description")}
                  </h2>
                </div>
              </div>
              <div
                className="prose prose-slate max-w-none min-w-0 overflow-x-auto text-foreground/75 dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </section>
          </FadeIn>
        ) : null}

        <FadeIn delay={0.1}>
          <section className="mt-10 flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-8 dark:border-slate-800 dark:bg-slate-950">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold">{t("reviews")}</h2>
              <p className="mt-1 text-sm text-muted">
                {product.reviewCount > 0
                  ? t("reviewSummary", {
                      count: product.reviewCount,
                      rating: product.averageRating,
                    })
                  : t("noReviews")}
              </p>
            </div>
            <Badge variant="secondary" className="w-fit px-4 py-2 text-sm">
              {product.reviewCount} {t("reviews")}
            </Badge>
          </section>
        </FadeIn>

        {related.length ? (
          <section className="mt-14 min-w-0 pb-20 lg:pb-0">
            <div className="mb-6 flex min-w-0 items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight">{t("related")}</h2>
              <Button asChild variant="ghost">
                <Link href="/shop">{t("shopAll")}</Link>
              </Button>
            </div>
            <ProductGrid products={related} locale={locale} />
          </section>
        ) : (
          <div className="h-16 lg:hidden" />
        )}
      </div>
    </main>
  );
}
