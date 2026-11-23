import campaignsFile from "../../../content/hero-campaigns.json";
import type { ProductCardModel } from "@/types/woocommerce";

export type HeroLayout = "stage" | "studio" | "folio" | "plate" | "offer";
export type HeroMotion = "drift" | "none";

export interface HeroSlide {
  id: string;
  layout: HeroLayout;
  animation: HeroMotion;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  desktopImage: string;
  mobileImage: string;
  imageAlt: string;
  desktopPosition: string;
  mobilePosition: string;
}

export interface HeroCampaignSettings {
  autoplayMs: number;
  animation: "slide" | "fade";
  pauseOnHover: boolean;
}

type RawSlide = {
  id?: string;
  enabled?: boolean;
  order?: number;
  startAt?: string | null;
  endAt?: string | null;
  layout?: HeroLayout;
  animation?: HeroMotion;
  eyebrow?: string;
  eyebrowAr?: string;
  title?: string;
  titleAr?: string;
  subtitle?: string;
  subtitleAr?: string;
  cta?: string;
  ctaAr?: string;
  href?: string;
  desktopImage?: string;
  mobileImage?: string;
  image?: string;
  imageAlt?: string;
  desktopPosition?: string;
  mobilePosition?: string;
};

export type HeroCampaignFile = {
  autoplayMs?: number;
  animation?: "slide" | "fade";
  pauseOnHover?: boolean;
  slides?: RawSlide[];
};

const layouts = new Set<HeroLayout>([
  "stage",
  "studio",
  "folio",
  "plate",
  "offer",
]);

export function isCampaignLive(
  slide: { enabled?: boolean; startAt?: string | null; endAt?: string | null },
  now = Date.now(),
): boolean {
  if (slide.enabled === false) return false;
  if (slide.startAt) {
    const start = Date.parse(slide.startAt);
    if (!Number.isNaN(start) && now < start) return false;
  }
  if (slide.endAt) {
    const end = Date.parse(slide.endAt);
    if (!Number.isNaN(end) && now > end) return false;
  }
  return true;
}

export function mapCampaignSlides(
  file: HeroCampaignFile,
  locale: string,
  now = Date.now(),
): { settings: HeroCampaignSettings; slides: HeroSlide[] } {
  const isArabic = locale === "ar";
  const slides = (file.slides || [])
    .filter((slide) => slide?.title && slide.href && (slide.desktopImage || slide.image))
    .filter((slide) => isCampaignLive(slide, now))
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((slide, index): HeroSlide => {
      const desktop = slide.desktopImage || slide.image || "";
      return {
        id: slide.id || `campaign-${index}`,
        layout: layouts.has(slide.layout as HeroLayout)
          ? (slide.layout as HeroLayout)
          : "stage",
        animation: slide.animation === "none" ? "none" : "drift",
        eyebrow: (isArabic ? slide.eyebrowAr : slide.eyebrow) || slide.eyebrow || "Computechs",
        title: (isArabic ? slide.titleAr : slide.title) || slide.title || "",
        subtitle: (isArabic ? slide.subtitleAr : slide.subtitle) || slide.subtitle || "",
        cta: (isArabic ? slide.ctaAr : slide.cta) || slide.cta || "Shop now",
        href: slide.href || "/shop",
        desktopImage: desktop,
        mobileImage: slide.mobileImage || desktop,
        imageAlt: slide.imageAlt || slide.title || "Computechs campaign",
        desktopPosition: slide.desktopPosition || "center",
        mobilePosition: slide.mobilePosition || "center",
      };
    });

  return {
    settings: {
      autoplayMs:
        typeof file.autoplayMs === "number" && file.autoplayMs >= 3000
          ? file.autoplayMs
          : 7000,
      animation: file.animation === "fade" ? "fade" : "slide",
      pauseOnHover: file.pauseOnHover !== false,
    },
    slides,
  };
}

export function resolveHeroSlides(options: {
  deals?: ProductCardModel[];
  featured?: ProductCardModel[];
  ctaFallback?: string;
  locale?: string;
  now?: number;
  file?: HeroCampaignFile;
}): { settings: HeroCampaignSettings; slides: HeroSlide[] } {
  const resolved = mapCampaignSlides(
    options.file || (campaignsFile as HeroCampaignFile),
    options.locale || "en",
    options.now,
  );
  if (resolved.slides.length > 0) return resolved;

  const pool =
    options.deals && options.deals.length > 0
      ? options.deals
      : options.featured || [];
  return {
    settings: resolved.settings,
    slides: pool.slice(0, 5).map((product) => ({
      id: `product-${product.id}`,
      layout: "studio" as const,
      animation: "none" as const,
      eyebrow: "Featured",
      title: product.name,
      subtitle: product.shortDescription.slice(0, 140),
      cta: options.ctaFallback || "Shop now",
      href: `/product/${product.slug}`,
      desktopImage: product.image?.src || "",
      mobileImage: product.image?.src || "",
      imageAlt: product.image?.alt || product.name,
      desktopPosition: "center",
      mobilePosition: "center",
    })),
  };
}
