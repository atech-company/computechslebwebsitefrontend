"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, ImageIcon, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  id: number;
  src: string;
  alt: string;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  productName: string;
  className?: string;
}

export function ProductGallery({
  images,
  productName,
  className,
}: ProductGalleryProps) {
  const t = useTranslations("product");
  const labelId = useId();
  const safeImages = images.length > 0 ? images : [{ id: 0, src: "", alt: productName }];
  const [activeIndex, setActiveIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const pointerX = useRef<number | null>(null);

  const count = safeImages.length;
  const active = safeImages[Math.min(activeIndex, count - 1)];

  const goTo = useCallback(
    (index: number) => {
      const next = ((index % count) + count) % count;
      setActiveIndex(next);
    },
    [count],
  );

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [active?.src]);

  useEffect(() => {
    if (!zoomOpen) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomOpen(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [zoomOpen]);

  useEffect(() => {
    const thumb = thumbsRef.current?.querySelector<HTMLElement>(
      `[data-thumb-index="${activeIndex}"]`,
    );
    thumb?.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  function onPointerDown(event: React.PointerEvent) {
    pointerX.current = event.clientX;
  }

  function onPointerUp(event: React.PointerEvent) {
    if (pointerX.current == null || count < 2) return;
    const delta = event.clientX - pointerX.current;
    pointerX.current = null;
    if (Math.abs(delta) < 48) return;
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const towardNext = rtl ? delta > 0 : delta < 0;
    goTo(activeIndex + (towardNext ? 1 : -1));
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(activeIndex + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(activeIndex - 1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      goTo(count - 1);
    }
    if (event.key === "Escape") setZoomOpen(false);
  }

  return (
    <div
      className={cn("flex w-full min-w-0 max-w-full flex-col gap-3", className)}
      data-testid="product-gallery"
      role="region"
      aria-labelledby={labelId}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <p id={labelId} className="sr-only">
        {productName}
      </p>

      <div
        className="relative aspect-[4/3] w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 lg:aspect-auto lg:h-[min(520px,52vw)] dark:border-slate-800 dark:bg-slate-900"
        data-testid="product-gallery-stage"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          pointerX.current = null;
        }}
      >
        {!loaded && active?.src && !failed ? (
          <div className="absolute inset-0 animate-pulse bg-slate-100 dark:bg-slate-800" />
        ) : null}

        {active?.src && !failed ? (
          <Image
            src={active.src}
            alt={active.alt || productName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 52vw"
            className="object-contain object-center"
            onLoad={() => setLoaded(true)}
            onError={() => {
              setFailed(true);
              setLoaded(true);
            }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted">
            <ImageIcon className="h-8 w-8" />
            {t("noImage")}
          </div>
        )}

        {active?.src && !failed ? (
          <button
            type="button"
            className="absolute end-3 top-3 grid h-9 w-9 place-items-center rounded-lg border border-slate-200/80 bg-white/90 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200"
            aria-label={t("zoomImage")}
            onClick={() => setZoomOpen(true)}
          >
            <Expand className="h-4 w-4" />
          </button>
        ) : null}

        {count > 1 ? (
          <>
            <button
              type="button"
              className="absolute start-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-lg border border-slate-200/80 bg-white/90 text-slate-700 shadow-sm md:grid dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200"
              aria-label={t("previousImage")}
              onClick={() => goTo(activeIndex - 1)}
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </button>
            <button
              type="button"
              className="absolute end-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-lg border border-slate-200/80 bg-white/90 text-slate-700 shadow-sm md:grid dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200"
              aria-label={t("nextImage")}
              onClick={() => goTo(activeIndex + 1)}
            >
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </button>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <div
          ref={thumbsRef}
          className="flex w-full min-w-0 max-w-full gap-2 overflow-x-auto overflow-y-hidden pb-1"
          data-testid="product-thumbs"
        >
          {safeImages.map((image, index) => (
            <button
              key={`${image.id || "image"}-${index}`}
              type="button"
              data-thumb-index={index}
              onClick={() => goTo(index)}
              aria-label={`${t("viewImage")} ${index + 1}`}
              aria-pressed={index === activeIndex}
              className={cn(
                "relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-slate-100 lg:h-16 lg:w-16 dark:bg-slate-800",
                index === activeIndex
                  ? "border-blue-600 ring-2 ring-blue-600/25"
                  : "border-slate-200 hover:border-slate-400 dark:border-slate-700",
              )}
            >
              {image.src ? (
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain object-center p-1"
                />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      {zoomOpen && active?.src ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#080F1E]/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t("zoomImage")}
          onClick={() => setZoomOpen(false)}
        >
          <button
            type="button"
            className="absolute end-4 top-4 grid h-10 w-10 place-items-center rounded-lg bg-white/90 text-slate-800"
            aria-label={t("closeZoom")}
            onClick={() => setZoomOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative h-[min(88vh,900px)] w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={active.src}
              alt={active.alt || productName}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
