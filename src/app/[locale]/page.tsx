import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HomeHero } from "@/components/homepage/hero";
import { SectionHeading } from "@/components/homepage/section-heading";
import { ProductGrid } from "@/components/products/product-grid";
import { FadeIn } from "@/components/animations/fade-in";
import { RecentlyViewedSection } from "@/components/homepage/recently-viewed";
import {
  getBrands,
  getCategories,
  getProducts,
} from "@/lib/woocommerce/products";
import { resolveHeroSlides } from "@/lib/homepage/hero-slides";
import homepage from "../../../content/homepage.json";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const [deals, featured, categories, brands] = await Promise.all([
    getProducts({ onSale: true, perPage: 8, orderby: "date", order: "desc" }),
    getProducts({ perPage: 8, orderby: "popularity", order: "desc" }),
    getCategories({ hideEmpty: true }),
    getBrands(),
  ]);

  const hero = resolveHeroSlides({
    deals: deals.products,
    featured: featured.products,
    ctaFallback: t("shopNow"),
    locale,
  });
  const topCategories = categories.filter((c) => c.parent === 0).slice(0, 8);

  return (
    <div>
      <HomeHero
        slides={hero.slides}
        settings={hero.settings}
        browseLabel={t("explore")}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionHeading
            title={t("shopByCategory")}
            href="/shop"
            actionLabel={t("viewAll")}
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {topCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] bg-slate-50 dark:bg-slate-900">
                  {cat.image?.src ? (
                    <Image
                      src={cat.image.src}
                      alt={cat.name}
                      fill
                      className="object-contain p-6 transition duration-500 group-hover:scale-105"
                      sizes="25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted">
                      {cat.name}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-medium">{cat.name}</p>
                  <p className="text-xs text-muted">{cat.count} products</p>
                </div>
              </Link>
            ))}
          </div>
        </FadeIn>
      </section>

      <section className="bg-slate-50 py-16 dark:bg-slate-950/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionHeading
              title={t("todaysDeals")}
              href="/deals"
              actionLabel={t("viewAll")}
            />
            <ProductGrid products={deals.products} locale={locale} />
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionHeading
            title={t("featured")}
            href="/shop"
            actionLabel={t("viewAll")}
          />
          <ProductGrid products={featured.products} locale={locale} />
        </FadeIn>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
        {homepage.promoBanners.map((banner) => (
          <Link
            key={banner.title}
            href={banner.href}
            className={
              banner.tone === "dark"
                ? "rounded-3xl bg-midnight p-8 text-white"
                : banner.tone === "cyan"
                  ? "rounded-3xl bg-cyan-500 p-8 text-slate-950"
                  : "rounded-3xl border border-border bg-card p-8"
            }
          >
            <h3 className="text-2xl font-semibold">{banner.title}</h3>
            <p className="mt-2 text-sm opacity-80">{banner.subtitle}</p>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionHeading
            title={t("shopByBrand")}
            href="/brands"
            actionLabel={t("viewAll")}
          />
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
            {brands.slice(0, 12).map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="flex aspect-square items-center justify-center rounded-2xl border border-border bg-card p-4 transition hover:shadow-md"
              >
                {brand.image?.src ? (
                  <Image
                    src={brand.image.src}
                    alt={brand.name}
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                ) : (
                  <span className="text-center text-sm font-medium">
                    {brand.name}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </FadeIn>
      </section>

      <RecentlyViewedSection title={t("recentlyViewed")} />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionHeading title={t("whyTitle")} />
          <p className="mb-8 max-w-2xl text-muted">{t("whySubtitle")}</p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {homepage.why.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
