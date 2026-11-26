"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getImageProps } from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import type {
  HeroCampaignSettings,
  HeroLayout,
  HeroSlide,
} from "@/lib/homepage/hero-slides";

const themes: Record<
  HeroLayout,
  {
    section: string;
    kicker: string;
    title: string;
    body: string;
    cta: string;
    secondary: string;
    stage: string;
    image: string;
  }
> = {
  stage: {
    section: "bg-[#101114] text-white",
    kicker: "text-[#d6d3d1]",
    title: "text-white",
    body: "text-[#d6d3d1]",
    cta: "bg-white text-[#101114] hover:bg-[#f5f5f4]",
    secondary: "border-white/25 text-white hover:bg-white/10",
    stage: "bg-[#181b22]",
    image: "object-contain p-6 sm:p-10 drop-shadow-[0_28px_48px_rgba(0,0,0,0.45)]",
  },
  studio: {
    section: "bg-[#f5f5f7] text-[#1d1d1f]",
    kicker: "text-[#6e6e73]",
    title: "text-[#1d1d1f]",
    body: "text-[#424245]",
    cta: "bg-[#1d1d1f] text-white hover:bg-black",
    secondary: "border-[#1d1d1f]/20 text-[#1d1d1f] hover:bg-black/5",
    stage: "bg-[#e8e8ed]",
    image: "object-contain p-4 sm:p-8 drop-shadow-[0_18px_32px_rgba(0,0,0,0.12)]",
  },
  folio: {
    section: "bg-[#f3efe6] text-[#1c1917]",
    kicker: "text-[#78716c]",
    title: "text-[#1c1917]",
    body: "text-[#44403c]",
    cta: "bg-[#1c1917] text-[#faf7f2] hover:bg-black",
    secondary: "border-[#1c1917]/20 text-[#1c1917] hover:bg-black/5",
    stage: "bg-[#e7e1d6]",
    image: "object-contain p-6 sm:p-10 drop-shadow-[0_18px_32px_rgba(28,25,23,0.16)]",
  },
  plate: {
    section: "bg-[#12171c] text-white",
    kicker: "text-[#a8b3bd]",
    title: "text-white",
    body: "text-[#d5dde4]",
    cta: "bg-[#e8eef3] text-[#12171c] hover:bg-white",
    secondary: "border-white/25 text-white hover:bg-white/10",
    stage: "bg-[#1c242c]",
    image: "object-contain p-4 sm:p-8 drop-shadow-[0_28px_48px_rgba(0,0,0,0.4)]",
  },
  offer: {
    section: "bg-[#fffdf8] text-[#171717]",
    kicker: "text-[#9a3412]",
    title: "text-[#171717]",
    body: "text-[#404040]",
    cta: "bg-[#9a3412] text-white hover:bg-[#7c2d12]",
    secondary: "border-[#171717]/15 text-[#171717] hover:bg-black/5",
    stage: "bg-[#f6f1e8]",
    image: "object-contain p-6 drop-shadow-[0_18px_32px_rgba(28,25,23,0.14)]",
  },
};

const lightStages = new Set<HeroLayout>(["studio", "folio", "offer"]);

function usesCssKnockout(src: string, layout: HeroLayout) {
  if (lightStages.has(layout)) return true;
  return /^(https?:)?\/\//i.test(src) || src.includes("/hero/uploads/");
}

function CampaignPhoto({
  slide,
  priority,
  active,
  reduce,
}: {
  slide: HeroSlide;
  priority: boolean;
  active: boolean;
  reduce: boolean;
}) {
  const drift =
    active && !reduce && slide.animation === "drift" ? "campaign-drift" : "";
  const common = {
    alt: slide.imageAlt,
    quality: 75,
    fetchPriority: priority ? ("high" as const) : ("auto" as const),
    loading: priority ? ("eager" as const) : ("lazy" as const),
  };
  const {
    props: { srcSet: mobileSrcSet, ...mobileProps },
  } = getImageProps({
    ...common,
    src: slide.mobileImage,
    width: 900,
    height: 675,
    sizes: "100vw",
  });
  const {
    props: { src: desktopSrc, srcSet: desktopSrcSet },
  } = getImageProps({
    ...common,
    alt: "",
    src: slide.desktopImage,
    width: 1600,
    height: 900,
    sizes: "58vw",
  });

  return (
    <>
      {priority ? (
        <>
          <link
            rel="preload"
            as="image"
            href={mobileProps.src}
            imageSrcSet={mobileSrcSet}
            imageSizes="100vw"
            media="(max-width: 767px)"
            fetchPriority="high"
          />
          <link
            rel="preload"
            as="image"
            href={desktopSrc}
            imageSrcSet={desktopSrcSet}
            imageSizes="58vw"
            media="(min-width: 768px)"
            fetchPriority="high"
          />
        </>
      ) : null}
      <picture>
        <source media="(min-width: 768px)" srcSet={desktopSrcSet} sizes="58vw" />
        <img
          {...mobileProps}
          alt={slide.imageAlt}
          srcSet={mobileSrcSet}
          className={cn(
            "campaign-photo absolute inset-0 h-full w-full",
            themes[slide.layout].image,
            drift,
            usesCssKnockout(slide.mobileImage, slide.layout) && "campaign-knockout",
          )}
          style={
            {
              "--campaign-mobile-position": slide.mobilePosition,
              "--campaign-desktop-position": slide.desktopPosition,
            } as React.CSSProperties
          }
        />
      </picture>
    </>
  );
}

export function HomeHero({
  slides,
  settings,
  browseLabel = "Browse catalog",
}: {
  slides: HeroSlide[];
  settings?: HeroCampaignSettings;
  browseLabel?: string;
}) {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const isMobile = useMediaQuery("(max-width: 767px)", true);
  const autoplayMs = settings?.autoplayMs ?? 7000;
  const pauseOnHover = settings?.pauseOnHover !== false;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    direction: isArabic ? "rtl" : "ltr",
    loop: slides.length > 1,
    duration: reduce || settings?.animation === "fade" ? 18 : 32,
    watchDrag: slides.length > 1,
  });
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    const frame = window.requestAnimationFrame(onSelect);
    return () => {
      window.cancelAnimationFrame(frame);
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (
      !emblaApi ||
      reduce ||
      isMobile ||
      paused ||
      !visible ||
      !pageVisible ||
      slides.length < 2
    ) return;
    const id = window.setInterval(() => emblaApi.scrollNext(), autoplayMs);
    return () => window.clearInterval(id);
  }, [emblaApi, reduce, isMobile, paused, visible, pageVisible, slides.length, selected, autoplayMs]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0.05 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  if (!slides.length) return null;

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#101114] text-white"
      aria-roledescription="carousel"
      aria-label={isArabic ? "العروض المميزة" : "Featured campaigns"}
      tabIndex={0}
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          emblaApi?.scrollPrev();
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          emblaApi?.scrollNext();
        }
      }}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {slides.map((slide, index) => {
            const theme = themes[slide.layout];
            const active = selected === index;
            const Heading = index === 0 ? "h1" : "h2";
            const imageFirst = slide.layout === "folio";
            return (
              <div
                key={slide.id}
                className="min-w-0 flex-[0_0_100%]"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} ${isArabic ? "من" : "of"} ${slides.length}: ${slide.title}`}
                aria-hidden={!active}
              >
                <div
                  className={cn(
                    "grid md:min-h-[34rem] md:grid-cols-12 md:items-center",
                    theme.section,
                  )}
                >
                  <div
                    className={cn(
                      "campaign-stage relative order-2 mx-auto aspect-[4/3] w-full max-w-xl md:aspect-auto md:h-full md:max-w-none",
                      theme.stage,
                      imageFirst
                        ? "md:order-1 md:col-span-6"
                        : "md:col-span-7 md:col-start-6",
                      slide.layout === "offer" &&
                        "aspect-square w-[70%] md:col-span-5 md:col-start-8 md:w-full",
                    )}
                  >
                    <CampaignPhoto
                      slide={slide}
                      priority={index === 0}
                      active={active}
                      reduce={Boolean(reduce)}
                    />
                  </div>

                  <div
                    className={cn(
                      "order-1 flex flex-col justify-center px-5 pb-6 pt-8 sm:px-8 md:col-span-5 md:px-10 md:py-16",
                      imageFirst
                        ? "md:order-2 md:col-span-6 md:col-start-7"
                        : "md:col-start-1 md:row-start-1",
                      slide.layout === "offer" && "md:col-span-7",
                    )}
                  >
                    <p
                      className={cn(
                        "text-[0.72rem] font-semibold uppercase tracking-[0.22em]",
                        theme.kicker,
                      )}
                    >
                      {slide.eyebrow}
                    </p>
                    <Heading
                      className={cn(
                        "mt-4 max-w-[14ch] text-balance text-[2.15rem] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl lg:text-[3.35rem]",
                        theme.title,
                      )}
                    >
                      {slide.title}
                    </Heading>
                    {slide.subtitle ? (
                      <p
                        className={cn(
                          "mt-4 max-w-md text-base leading-7 sm:text-[1.05rem]",
                          theme.body,
                        )}
                      >
                        {slide.subtitle}
                      </p>
                    ) : null}
                    <div className="mt-7 flex flex-wrap gap-3">
                      <Link
                        href={slide.href}
                        tabIndex={active ? 0 : -1}
                        className={cn(
                          "inline-flex h-12 items-center rounded-full px-5 text-sm font-semibold transition",
                          theme.cta,
                        )}
                      >
                        {slide.cta}
                      </Link>
                      <Link
                        href="/shop"
                        tabIndex={active ? 0 : -1}
                        className={cn(
                          "inline-flex h-12 items-center rounded-full border px-5 text-sm font-semibold transition",
                          theme.secondary,
                        )}
                      >
                        {browseLabel}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {slides.length > 1 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20">
          <div className="pointer-events-auto mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
            <div className="mobile-no-backdrop mobile-flat-shadow flex items-center gap-3 rounded-full bg-[#101114]/95 px-3 py-2 text-white shadow-lg md:bg-[#101114]/85 md:backdrop-blur">
              <div className="flex items-center gap-2">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    aria-label={`${isArabic ? "انتقل إلى الشريحة" : "Go to slide"} ${index + 1}: ${slide.title}`}
                    aria-current={index === selected ? "true" : undefined}
                    className={cn(
                      "h-2 rounded-full bg-white transition-all",
                      index === selected ? "w-8" : "w-2 opacity-40",
                    )}
                    onClick={() => emblaApi?.scrollTo(index)}
                  />
                ))}
              </div>
              <span className="text-xs tabular-nums text-white/80">
                {String(selected + 1).padStart(2, "0")} /{" "}
                {String(slides.length).padStart(2, "0")}
              </span>
            </div>
            <div className="mobile-no-backdrop mobile-flat-shadow ms-auto flex gap-1 rounded-full bg-[#101114]/95 p-1 text-white shadow-lg md:bg-[#101114]/85 md:backdrop-blur">
              {!reduce ? (
                <button
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10"
                  aria-label={
                    paused
                      ? isArabic
                        ? "تشغيل العرض التلقائي"
                        : "Resume autoplay"
                      : isArabic
                        ? "إيقاف العرض التلقائي"
                        : "Pause autoplay"
                  }
                  aria-pressed={paused}
                  onClick={() => setPaused((value) => !value)}
                >
                  {paused ? (
                    <Play className="h-4 w-4" />
                  ) : (
                    <Pause className="h-4 w-4" />
                  )}
                </button>
              ) : null}
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10"
                aria-label={isArabic ? "الشريحة السابقة" : "Previous slide"}
                onClick={() => emblaApi?.scrollPrev()}
              >
                <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
              </button>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10"
                aria-label={isArabic ? "الشريحة التالية" : "Next slide"}
                onClick={() => emblaApi?.scrollNext()}
              >
                <ChevronRight className="h-5 w-5 rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
