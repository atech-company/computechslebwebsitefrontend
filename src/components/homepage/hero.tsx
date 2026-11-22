"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/lib/homepage/hero-slides";

const AUTOPLAY_MS = 5000;

export function HomeHero({
  slides,
  browseLabel = "Browse catalog",
}: {
  slides: HeroSlide[];
  browseLabel?: string;
}) {
  const reduce = useReducedMotion();
  const [emblaRef, emblaApi] = useEmblaCarousel({
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

  return (
    <section
      className="hero-glow relative overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured campaigns"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="min-w-0 flex-[0_0_100%]"
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}: ${slide.title}`}
            >
              <div className="mx-auto grid min-h-[58vh] max-w-7xl items-center gap-8 px-4 py-12 sm:min-h-[62vh] sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-20">
                <div className="relative z-10 text-white">
                  <p className="mb-4 text-sm font-semibold tracking-[0.28em] text-cyan-300">
                    COMPUTECHS
                  </p>
                  <h1 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">
                    {slide.title}
                  </h1>
                  {slide.subtitle ? (
                    <p className="mt-4 max-w-lg text-sm text-slate-300 sm:text-base lg:text-lg">
                      {slide.subtitle}
                    </p>
                  ) : null}
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button asChild size="lg" variant="cyan">
                      <Link href={slide.href}>{slide.cta}</Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                    >
                      <Link href="/shop">{browseLabel}</Link>
                    </Button>
                  </div>
                </div>

                <div className="relative mx-auto aspect-[4/3] w-full max-w-xl lg:max-w-none">
                  {slide.image ? (
                    <div className="relative h-full w-full">
                      <div
                        aria-hidden
                        className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/15 blur-3xl"
                      />
                      <Image
                        src={slide.image}
                        alt=""
                        fill
                        priority={index === 0}
                        className="object-contain object-center drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
                        sizes="(max-width:1024px) 90vw, 44vw"
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
          ))}
        </div>
      </div>

      {slides.length > 1 ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 hidden -translate-y-1/2 justify-between px-3 sm:flex lg:px-6">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="pointer-events-auto border-white/20 bg-[#0B1120]/55 text-white backdrop-blur hover:bg-[#0B1120]/80"
              aria-label="Previous slide"
              onClick={() => emblaApi?.scrollPrev()}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="pointer-events-auto border-white/20 bg-[#0B1120]/55 text-white backdrop-blur hover:bg-[#0B1120]/80"
              aria-label="Next slide"
              onClick={() => emblaApi?.scrollNext()}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="absolute inset-x-0 bottom-5 z-20 flex justify-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === selected}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  index === selected
                    ? "w-8 bg-cyan-400"
                    : "w-2.5 bg-white/35 hover:bg-white/60",
                )}
                onClick={() => emblaApi?.scrollTo(index)}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
