import type { ProductCardModel } from "@/types/woocommerce";
import homepage from "../../../content/homepage.json";

export type HeroAccent = "cyan" | "blue" | "violet" | "emerald";

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string | null;
  highlights: string[];
  accent: HeroAccent;
  imageStyle: "floating" | "framed";
  productSlug?: string;
}

type ConfigSlide = {
  id?: string;
  eyebrow?: string;
  eyebrowAr?: string;
  title?: string;
  titleAr?: string;
  subtitle?: string;
  subtitleAr?: string;
  cta?: string;
  ctaAr?: string;
  href?: string;
  image?: string;
  highlights?: string[];
  highlightsAr?: string[];
  accent?: HeroAccent;
  imageStyle?: "floating" | "framed";
  productSlug?: string;
};

function fromConfig(
  slides: ConfigSlide[] | undefined,
  locale: string,
): HeroSlide[] {
  if (!Array.isArray(slides) || slides.length === 0) return [];
  const isArabic = locale === "ar";
  return slides
    .filter((s) => s && s.title && s.href)
    .map((s, index) => ({
      id: s.id || `slide-${index}`,
      eyebrow:
        (isArabic ? s.eyebrowAr : s.eyebrow) || s.eyebrow || "Computechs",
      title: (isArabic ? s.titleAr : s.title) || s.title!,
      subtitle: (isArabic ? s.subtitleAr : s.subtitle) || s.subtitle || "",
      cta: (isArabic ? s.ctaAr : s.cta) || s.cta || "Shop now",
      href: s.href!,
      image: s.image || null,
      highlights:
        (isArabic ? s.highlightsAr : s.highlights) || s.highlights || [],
      accent: s.accent || "cyan",
      imageStyle: s.imageStyle || "floating",
      productSlug: s.productSlug,
    }));
}

function fromProducts(products: ProductCardModel[], cta: string): HeroSlide[] {
  return products.slice(0, 5).map((product) => ({
    id: `product-${product.id}`,
    eyebrow: "Featured now",
    title: product.name,
    subtitle:
      product.shortDescription.slice(0, 140) ||
      "Premium electronics with live stock from Computechs.",
    cta,
    href: `/product/${product.slug}`,
    image: product.image?.src ?? null,
    highlights: [],
    accent: "cyan" as const,
    imageStyle: "floating" as const,
    productSlug: product.slug,
  }));
}

export function resolveHeroSlides(options: {
  deals: ProductCardModel[];
  featured: ProductCardModel[];
  ctaFallback?: string;
  locale?: string;
}): HeroSlide[] {
  const configured = fromConfig(
    (homepage as { heroSlides?: ConfigSlide[] }).heroSlides,
    options.locale || "en",
  );
  if (configured.length > 0) return configured;

  const pool = options.deals.length > 0 ? options.deals : options.featured;
  return fromProducts(pool, options.ctaFallback || "Shop now");
}
