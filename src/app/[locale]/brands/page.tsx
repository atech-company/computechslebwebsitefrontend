import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { FadeIn } from "@/components/animations/fade-in";
import { getBrands } from "@/lib/woocommerce/products";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("brands") };
}

export default async function BrandsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations("nav");
  const tHome = await getTranslations("home");
  const brands = await getBrands();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: tNav("brands") },
        ]}
      />

      <FadeIn>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {tHome("shopByBrand")}
          </h1>
          <p className="mt-2 text-muted">
            {brands.length} brand{brands.length === 1 ? "" : "s"}
          </p>
        </div>

        {brands.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative flex aspect-square w-full items-center justify-center">
                  {brand.image?.src ? (
                    <Image
                      src={brand.image.src}
                      alt={brand.name}
                      width={120}
                      height={120}
                      className="max-h-24 w-auto object-contain transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-center text-sm font-semibold">
                      {brand.name}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{brand.name}</p>
                  <p className="text-xs text-muted">{brand.count} products</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
            No brands found
          </p>
        )}
      </FadeIn>
    </div>
  );
}
