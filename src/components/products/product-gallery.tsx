"use client";

import { useState } from "react";
import Image from "next/image";
import { Expand, ImageIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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

export function ProductGallery({ images, productName, className }: ProductGalleryProps) {
  const reduceMotion = useReducedMotion();
  const safeImages = images.length > 0 ? images : [{ id: 0, src: "", alt: productName }];
  const [activeIndex, setActiveIndex] = useState(0);
  const active = safeImages[Math.min(activeIndex, safeImages.length - 1)];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="group relative aspect-square overflow-hidden rounded-[2rem] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-blue-50 shadow-sm dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/40">
        <div className="pointer-events-none absolute inset-1/4 rounded-full bg-blue-400/15 blur-3xl transition-transform duration-700 group-hover:scale-125" />
        <div className="absolute end-4 top-4 z-10 rounded-full border border-white/70 bg-white/75 p-2 text-slate-500 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-900/75">
          <Expand className="h-4 w-4" aria-hidden="true" />
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {active?.src ? (
            <motion.div
              key={active.src}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <Image
                src={active.src}
                alt={active.alt || productName}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-7 transition-transform duration-700 group-hover:scale-[1.035] sm:p-10"
              />
            </motion.div>
          ) : (
            <motion.div key="empty" className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted">
              <ImageIcon className="h-8 w-8" />
              No image
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {safeImages.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {safeImages.map((image, index) => (
            <motion.button
              key={`${image.id || "image"}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              aria-pressed={index === activeIndex}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-slate-50 transition dark:bg-slate-900",
                index === activeIndex
                  ? "border-blue-500 ring-2 ring-blue-500/30"
                  : "border-border hover:border-slate-400",
              )}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            >
              {image.src ? (
                <Image
                  src={image.src}
                  alt={image.alt || `${productName} ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-contain p-2"
                />
              ) : null}
            </motion.button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
