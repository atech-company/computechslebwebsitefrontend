import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Headphones, PackageCheck, ShieldCheck, Star, Truck } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/animations/fade-in";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductPrice } from "@/components/products/product-price";
import { ProductSpecifications } from "@/components/products/product-specifications";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
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
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[38rem] bg-[radial-gradient(circle_at_15%_10%,rgba(6,182,212,0.09),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(37,99,235,0.10),transparent_35%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <RecordRecentlyViewed productId={product.id} />

        <nav
          className="mb-6 flex min-w-0 items-center gap-2 overflow-hidden text-sm text-muted"
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
          <span className="truncate text-foreground/75">{displayName}</span>
        </nav>

        <FadeIn>
          <section className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6 lg:p-8 dark:border-slate-800 dark:bg-slate-950/85">
            <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
              <ProductGallery images={product.images} productName={displayName} />

              <div className="flex min-w-0 flex-col lg:py-2">
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
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {product.averageRating}
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-[2.4rem] dark:text-white">
                  {headline}
                </h1>

                <div className="mt-5 flex flex-wrap items-end gap-3">
                  <ProductPrice
                    product={product}
                    className="[&_span:first-child]:text-2xl"
                  />
                  {product.onSale && product.discountPercent ? (
                    <span className="mb-0.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:bg-rose-950/60 dark:text-rose-300">
                      {t("savePercent", { percent: product.discountPercent })}
                    </span>
                  ) : null}
                </div>

                {product.sku ? (
                  <p className="mt-3 text-sm text-muted">
                    {t("sku")}: {" "}
                    <span className="font-medium text-foreground/80">{product.sku}</span>
                  </p>
                ) : null}

                {product.shortDescription ? (
                  <p className="mt-5 border-s-2 border-cyan-400 ps-4 text-base leading-relaxed text-foreground/75">
                    {product.shortDescription}
                  </p>
                ) : null}

                {highlights.length ? (
                  <div className="mt-6 grid grid-cols-2 gap-2.5">
                    {highlights.map((attribute) => {
                      const presentation = getSpecificationPresentation(attribute.name);
                      return (
                        <a
                          key={`${attribute.id}-${attribute.name}`}
                          href="#specifications"
                          className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-3 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-blue-800 dark:hover:bg-slate-900"
                        >
                          <div className="flex items-center gap-2 text-sm text-muted">
                            <span
                              className="text-lg transition-transform group-hover:scale-110"
                              aria-hidden="true"
                            >
                              {presentation.emoji}
                            </span>
                            <span className="truncate">{attribute.name}</span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm font-semibold">
                            {attribute.terms.map((term) => term.name).join(", ")}
                          </p>
                        </a>
                      );
                    })}
                  </div>
                ) : null}

                <div className="mt-7">
                  <AddToCartButton
                    productId={product.id}
                    isPurchasable={product.isPurchasable}
                    isInStock={product.isInStock}
                    minQuantity={product.addToCart.minimum}
                    maxQuantity={product.addToCart.maximum}
                    openCartOnSuccess
                  />
                </div>

                {waUrl ? (
                  <Button asChild variant="outline" className="mt-3 w-full" size="lg">
                    <a href={waUrl} target="_blank" rel="noreferrer">
                      {t("whatsapp")}
                    </a>
                  </Button>
                ) : null}

                <div className="mt-6 grid grid-cols-3 gap-2 border-t border-slate-100 pt-5 dark:border-slate-800">
                  {[
                    { icon: ShieldCheck, label: t("warrantySupport") },
                    { icon: Truck, label: t("localDelivery") },
                    { icon: Headphones, label: t("expertHelp") },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-1.5 text-center text-xs text-muted sm:flex-row sm:text-start"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-blue-600 dark:text-cyan-400" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        {specifications.length ? (
          <ProductSpecifications attributes={specifications} className="mt-10" />
        ) : null}

        {product.description ? (
          <FadeIn delay={0.08}>
            <section className="mt-10 rounded-[2rem] border border-slate-200/80 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-950">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-cyan-400">
                  <PackageCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-cyan-400">
                    {t("moreToKnow")}
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {t("description")}
                  </h2>
                </div>
              </div>
              <div
                className="prose prose-slate max-w-none text-foreground/75 dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </section>
          </FadeIn>
        ) : null}

        <FadeIn delay={0.1}>
          <section className="mt-10 flex flex-col justify-between gap-5 rounded-[2rem] border border-slate-200/80 bg-gradient-to-br from-white to-amber-50/50 p-6 sm:flex-row sm:items-center sm:p-8 dark:border-slate-800 dark:from-slate-950 dark:to-amber-950/20">
            <div>
              <div className="flex items-center gap-2 text-amber-500" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <h2 className="mt-3 text-xl font-semibold">{t("reviews")}</h2>
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
          <section className="mt-16">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-cyan-400">
                  {t("keepExploring")}
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {t("related")}
                </h2>
              </div>
              <Button asChild variant="ghost">
                <Link href="/shop">{t("shopAll")}</Link>
              </Button>
            </div>
            <ProductGrid products={related} locale={locale} />
          </section>
        ) : null}
      </div>
    </main>
  );
}
