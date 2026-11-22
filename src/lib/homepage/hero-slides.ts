import type { ProductCardModel } from "@/types/woocommerce";
import homepage from "../../../content/homepage.json";

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string | null;
  productSlug?: string;
}

type ConfigSlide = {
  id?: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  href?: string;
  image?: string;
  productSlug?: string;
};

function fromConfig(slides: ConfigSlide[] | undefined): HeroSlide[] {
  if (!Array.isArray(slides) || slides.length === 0) return [];
  return slides
    .filter((s) => s && s.title && s.href)
    .map((s, index) => ({
      id: s.id || `slide-${index}`,
      title: s.title!,
      subtitle: s.subtitle || "",
      cta: s.cta || "Shop now",
      href: s.href!,
      image: s.image || null,
      productSlug: s.productSlug,
    }));
}

function fromProducts(products: ProductCardModel[], cta: string): HeroSlide[] {
  return products.slice(0, 5).map((product) => ({
    id: `product-${product.id}`,
    title: product.name,
    subtitle:
      product.shortDescription.slice(0, 140) ||
      "Premium electronics with live stock from Computechs.",
    cta,
    href: `/product/${product.slug}`,
    image: product.image?.src ?? null,
    productSlug: product.slug,
  }));
}

export function resolveHeroSlides(options: {
  deals: ProductCardModel[];
  featured: ProductCardModel[];
  ctaFallback?: string;
}): HeroSlide[] {
  const configured = fromConfig(
    (homepage as { heroSlides?: ConfigSlide[] }).heroSlides,
  );
  if (configured.length > 0) return configured;

  const pool =
    options.deals.length > 0 ? options.deals : options.featured;
  return fromProducts(pool, options.ctaFallback || "Shop now");
}
