"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useLocale } from "next-intl";
import { useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HeroAccent, HeroSlide } from "@/lib/homepage/hero-slides";

const AUTOPLAY_MS = 6500;

const accentStyles: Record<
  HeroAccent,
  {
    glow: string;
    glowSecondary: string;
    label: string;
    chip: string;
    primary: string;
    nav: string;
  }
> = {
  cyan: {
    glow: "bg-cyan-400/30",
    glowSecondary: "bg-blue-600/20",
    label: "text-cyan-200",
    chip: "border-cyan-300/20 bg-cyan-300/10 text-cyan-50",
    primary: "bg-cyan-400 text-slate-950 hover:bg-cyan-300",
    nav: "bg-cyan-300",
  },
  blue: {
    glow: "bg-blue-500/30",
    glowSecondary: "bg-cyan-500/15",
    label: "text-blue-200",
    chip: "border-blue-300/20 bg-blue-300/10 text-blue-50",
    primary: "bg-blue-400 text-slate-950 hover:bg-blue-300",
    nav: "bg-blue-300",
  },
  violet: {
    glow: "bg-violet-500/30",
    glowSecondary: "bg-fuchsia-500/15",
    label: "text-violet-200",
    chip: "border-violet-300/20 bg-violet-300/10 text-violet-50",
    primary: "bg-violet-400 text-slate-950 hover:bg-violet-300",
    nav: "bg-violet-300",
  },
  emerald: {
    glow: "bg-emerald-400/25",
    glowSecondary: "bg-cyan-500/15",
    label: "text-emerald-200",
    chip: "border-emerald-300/20 bg-emerald-300/10 text-emerald-50",
    primary: "bg-emerald-400 text-slate-950 hover:bg-emerald-300",
    nav: "bg-emerald-300",
  },
};

export function HomeHero({
  slides,
  browseLabel = "Browse catalog",
}: {
  slides: HeroSlide[];
  browseLabel?: string;
}) {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const reduce = useReducedMotion();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    direction: isArabic ? "rtl" : "ltr",
    loop: slides.length > 1,
    duration: 28,
    watchDrag: slides.length > 1,
  });
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);

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
    if (!emblaApi || reduce || paused || slides.length < 2) return;
    const id = window.setInterval(() => {
      emblaApi.scrollNext();
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [emblaApi, reduce, paused, slides.length, selected]);

  if (!slides.length) {
    return (
      <section className="hero-glow relative overflow-hidden">
        <div className="mx-auto flex min-h-[52vh] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-white">
            <p className="mb-4 text-sm font-semibold tracking-[0.28em] text-cyan-300">
              COMPUTECHS
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Premium electronics
            </h1>
            <Button asChild size="lg" variant="cyan" className="mt-8">
              <Link href="/shop">{browseLabel}</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const activeSlide = slides[selected] || slides[0];
  const accent = accentStyles[activeSlide.accent];

  return (
    <section
      className="relative isolate overflow-hidden bg-[#050914] text-white"
      aria-roledescription="carousel"
      aria-label={isArabic ? "العروض المميزة" : "Featured campaigns"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") emblaApi?.scrollPrev();
        if (event.key === "ArrowRight") emblaApi?.scrollNext();
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,.28) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.28) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,.9), transparent 88%)",
        }}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-32 top-[-12rem] h-[36rem] w-[36rem] rounded-full blur-[130px] transition-colors duration-700",
          accent.glow,
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -bottom-56 -left-24 h-[30rem] w-[30rem] rounded-full blur-[130px] transition-colors duration-700",
          accent.glowSecondary,
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {slides.map((slide, index) => {
            const slideAccent = accentStyles[slide.accent];
            const isActive = selected === index;
            const Heading = index === 0 ? "h1" : "h2";

            return (
              <div
                key={slide.id}
                className="min-w-0 flex-[0_0_100%]"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} ${isArabic ? "من" : "of"} ${slides.length}: ${slide.title}`}
                aria-hidden={!isActive}
              >
                <div className="mx-auto grid min-h-[42rem] max-w-7xl items-center gap-0 px-4 pb-24 pt-8 sm:min-h-[47rem] sm:gap-6 sm:px-6 sm:pb-36 sm:pt-12 lg:min-h-[42rem] lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:px-8 lg:pb-28 lg:pt-10 xl:gap-12">
                  <div
                    className={cn(
                      "relative z-10 max-w-2xl transition duration-700",
                      isActive
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-40",
                    )}
                  >
                    <div
                      className={cn(
                        "mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur",
                        slideAccent.label,
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          slideAccent.nav,
                        )}
                      />
                      {slide.eyebrow}
                    </div>

                    <Heading className="max-w-2xl text-balance text-4xl font-semibold leading-[1.03] tracking-[-0.04em] sm:text-5xl lg:text-[3.45rem] xl:text-6xl">
                      {slide.title}
                    </Heading>

                    {slide.subtitle ? (
                      <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                        {slide.subtitle}
                      </p>
                    ) : null}

                    {slide.highlights.length > 0 ? (
                      <div className="mt-6 flex flex-wrap gap-2">
                        {slide.highlights.map((highlight) => (
                          <span
                            key={highlight}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-sm backdrop-blur-sm",
                              slideAccent.chip,
                            )}
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-8 flex flex-wrap gap-3">
                      <Button
                        asChild
                        size="lg"
                        className={cn(
                          "border-0 shadow-xl",
                          slideAccent.primary,
                        )}
                      >
                        <Link href={slide.href} tabIndex={isActive ? 0 : -1}>
                          {slide.cta}
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="border-white/20 bg-white/[0.06] text-white backdrop-blur hover:border-white/35 hover:bg-white/10"
                      >
                        <Link href="/shop" tabIndex={isActive ? 0 : -1}>
                          {browseLabel}
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="relative mx-auto h-[14rem] w-full max-w-2xl sm:h-[22rem] lg:h-[32rem] lg:max-w-none">
                    <div
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute left-1/2 top-1/2 h-[66%] w-[66%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]",
                        slideAccent.glow,
                      )}
                    />
                    {slide.image ? (
                      <div
                        className={cn(
                          "relative h-full w-full transition duration-700",
                          slide.imageStyle === "framed" &&
                            "overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 shadow-2xl shadow-black/40",
                          isActive
                            ? "translate-y-0 scale-100 opacity-100"
                            : "translate-y-3 scale-[0.97] opacity-60",
                        )}
                      >
                        <Image
                          src={slide.image}
                          alt=""
                          fill
                          preload={index === 0}
                          className={cn(
                            "object-contain object-center drop-shadow-[0_30px_54px_rgba(0,0,0,0.48)]",
                            slide.imageStyle === "framed" && "drop-shadow-none",
                          )}
                          sizes="(max-width: 1023px) 92vw, 55vw"
                        />
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        Campaign media
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {slides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-5 z-30">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
            <div className="hidden min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50 p-1.5 backdrop-blur-xl md:flex">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`${isArabic ? "انتقل إلى الشريحة" : "Go to slide"} ${index + 1}: ${slide.title}`}
                  aria-current={index === selected ? "true" : undefined}
                  className={cn(
                    "group relative min-w-0 flex-1 rounded-xl px-2 py-2.5 text-start transition",
                    index === selected
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200",
                  )}
                  onClick={() => emblaApi?.scrollTo(index)}
                >
                  <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.14em]">
                    {slide.eyebrow}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-2 bottom-0 h-0.5 origin-left scale-x-0 rounded-full transition-transform duration-500",
                      accentStyles[slide.accent].nav,
                      index === selected && "scale-x-100",
                    )}
                  />
                </button>
              ))}
            </div>

            <div className="flex flex-1 items-center gap-2 md:hidden">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`${isArabic ? "انتقل إلى الشريحة" : "Go to slide"} ${index + 1}`}
                  aria-current={index === selected ? "true" : undefined}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    index === selected
                      ? cn("w-8", accentStyles[slide.accent].nav)
                      : "w-2 bg-white/30 hover:bg-white/55",
                  )}
                  onClick={() => emblaApi?.scrollTo(index)}
                />
              ))}
              <span className="ms-1 text-xs tabular-nums text-slate-400">
                {String(selected + 1).padStart(2, "0")} /{" "}
                {String(slides.length).padStart(2, "0")}
              </span>
            </div>

            {!reduce ? (
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="shrink-0 border-white/15 bg-slate-950/50 text-white backdrop-blur-xl hover:bg-white/10"
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
              </Button>
            ) : null}

            <div className="flex shrink-0 gap-1.5">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="border-white/15 bg-slate-950/50 text-white backdrop-blur-xl hover:bg-white/10"
                aria-label={isArabic ? "الشريحة السابقة" : "Previous slide"}
                onClick={() => emblaApi?.scrollPrev()}
              >
                <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="border-white/15 bg-slate-950/50 text-white backdrop-blur-xl hover:bg-white/10"
                aria-label={isArabic ? "الشريحة التالية" : "Next slide"}
                onClick={() => emblaApi?.scrollNext()}
              >
                <ChevronRight className="h-5 w-5 rtl:rotate-180" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
