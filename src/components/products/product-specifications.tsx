"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSpecificationPresentation } from "@/lib/product-specs";
import type { StoreAttribute } from "@/types/woocommerce";

interface ProductSpecificationsProps {
  attributes: StoreAttribute[];
  className?: string;
}

const COLLAPSED_COUNT = 8;

export function ProductSpecifications({
  attributes,
  className,
}: ProductSpecificationsProps) {
  const t = useTranslations("product");
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);

  if (!attributes.length) return null;

  const visible = expanded
    ? attributes
    : attributes.slice(0, COLLAPSED_COUNT);
  const hasMore = attributes.length > COLLAPSED_COUNT;

  return (
    <section
      id="specifications"
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-950",
        className,
      )}
    >
      <div className="pointer-events-none absolute -end-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 start-1/3 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
            <SlidersHorizontal className="h-4 w-4" />
            {t("specsEyebrow")}
          </div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("specs")}
          </h2>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">
            {t("specsIntro")}
          </p>
        </div>
        <div className="w-fit rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="font-semibold text-blue-600 dark:text-cyan-400">
            {attributes.length}
          </span>{" "}
          {t("specCount")}
        </div>
      </div>

      <motion.dl
        layout={!reduceMotion}
        className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {visible.map((attribute, index) => {
          const presentation = getSpecificationPresentation(attribute.name);
          const value = attribute.terms.map((term) => term.name).join(", ");

          return (
            <motion.div
              layout={!reduceMotion}
              key={`${attribute.id}-${attribute.name}`}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.38, delay: Math.min(index * 0.045, 0.3) }}
              whileHover={reduceMotion ? undefined : { y: -4 }}
              className={cn(
                "group relative min-h-36 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br p-4 transition-shadow hover:shadow-lg hover:shadow-blue-950/5 dark:border-slate-800",
                presentation.accent,
              )}
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <span
                  className="grid h-11 w-11 place-items-center rounded-2xl border border-white/70 bg-white/80 text-2xl shadow-sm transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110 dark:border-slate-700 dark:bg-slate-900/80"
                  aria-hidden="true"
                >
                  {presentation.emoji}
                </span>
                <span className="h-2 w-2 rounded-full bg-blue-500/70 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]" />
              </div>
              <dt className="text-sm font-medium text-muted">{attribute.name}</dt>
              <dd className="mt-1 text-base font-semibold leading-snug text-slate-950 dark:text-white">
                {value || "—"}
              </dd>
            </motion.div>
          );
        })}
      </motion.dl>

      {hasMore ? (
        <div className="relative mt-6 flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setExpanded((current) => !current)}
            aria-expanded={expanded}
            aria-controls="specifications"
            className="min-w-44 rounded-full"
          >
            {expanded ? t("showLess") : t("showAllSpecs")}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                expanded && "rotate-180",
              )}
            />
          </Button>
        </div>
      ) : null}
    </section>
  );
}
