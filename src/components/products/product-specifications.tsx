"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ProductSpecificationIcon } from "@/components/products/product-specification-icon";
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
        "relative min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-5 sm:p-8 dark:border-slate-800 dark:bg-slate-950",
        className,
      )}
    >
      <div className="relative mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold tracking-tight">{t("specs")}</h2>
          <p className="mt-1 text-sm text-muted">{t("specsIntro")}</p>
        </div>
        <p className="shrink-0 text-sm text-muted">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {attributes.length}
          </span>{" "}
          {t("specCount")}
        </p>
      </div>

      <dl className="relative grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((attribute) => {
          const presentation = getSpecificationPresentation(attribute.name);
          const value = attribute.terms.map((term) => term.name).join(", ");

          return (
            <div
              key={`${attribute.id}-${attribute.name}`}
              className={cn(
                "group relative min-w-0 overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-br p-4 md:transition-transform md:hover:-translate-y-1 dark:border-slate-800",
                presentation.accent,
              )}
            >
              <div className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-white/75 text-blue-600 shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-900/75 dark:text-cyan-400 dark:ring-white/10">
                <ProductSpecificationIcon
                  icon={presentation.icon}
                  className="h-5 w-5"
                />
              </div>
              <dt className="break-words text-sm font-medium text-muted">{attribute.name}</dt>
              <dd className="mt-1 break-words text-base font-semibold leading-snug text-slate-950 dark:text-white">
                {value || "—"}
              </dd>
            </div>
          );
        })}
      </dl>

      {hasMore ? (
        <div className="relative mt-6 flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setExpanded((current) => !current)}
            aria-expanded={expanded}
            aria-controls="specifications"
            className="rounded-full px-5"
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
