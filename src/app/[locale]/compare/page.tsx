"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useCompareStore } from "@/stores/compare-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { useProductsByIds } from "@/hooks/use-products-by-ids";
import type { ProductCardModel } from "@/types/woocommerce";

export default function ComparePage() {
  const tCommon = useTranslations("common");
  const ids = useCompareStore((s) => s.ids);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  const hydrated = useHydrated();
  const { data: products = [], isLoading, error } = useProductsByIds(ids);

  const attributeNames = useMemo(() => {
    const names = new Set<string>();
    for (const p of products) {
      for (const attr of p.attributes || []) {
        if (attr.name) names.add(attr.name);
      }
    }
    return Array.from(names);
  }, [products]);

  function attrValue(product: ProductCardModel, name: string) {
    const attr = product.attributes?.find((a) => a.name === name);
    if (!attr?.terms?.length) return "—";
    return attr.terms.map((term) => term.name).join(", ");
  }

  if (!hydrated || (ids.length > 0 && isLoading)) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-muted">
        {tCommon("loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-red-600">
        {(error as Error).message}
      </div>
    );
  }

  if (!ids.length) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold">Compare</h1>
        <p className="mt-3 text-muted">Add up to 4 products to compare.</p>
        <Button asChild className="mt-6">
          <Link href="/shop">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Compare</h1>
        <Button variant="outline" onClick={() => clear()}>
          Clear all
        </Button>
      </div>
      <div className="overflow-x-auto rounded-3xl border border-border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50 dark:bg-slate-900">
              <th className="p-4 text-start">Feature</th>
              {products.map((p) => (
                <th key={p.id} className="p-4 text-start align-top">
                  <div className="relative mb-3 h-28 w-28 overflow-hidden rounded-xl bg-white dark:bg-slate-950">
                    {p.image ? (
                      <Image
                        src={p.image.src}
                        alt={p.name}
                        fill
                        className="object-contain p-2"
                      />
                    ) : null}
                  </div>
                  <Link
                    href={`/product/${p.slug}`}
                    className="font-medium hover:text-blue-600"
                  >
                    {p.name}
                  </Link>
                  <div className="mt-2">{p.formattedPrice}</div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-2"
                    onClick={() => remove(p.id)}
                  >
                    Remove
                  </Button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="p-4 text-muted">Brand</td>
              {products.map((p) => (
                <td key={p.id} className="p-4">
                  {p.brands[0]?.name || "—"}
                </td>
              ))}
            </tr>
            <tr className="border-b border-border">
              <td className="p-4 text-muted">Availability</td>
              {products.map((p) => (
                <td key={p.id} className="p-4">
                  {p.stockText || (p.isInStock ? "In stock" : "Out of stock")}
                </td>
              ))}
            </tr>
            {attributeNames.map((name) => (
              <tr key={name} className="border-b border-border">
                <td className="p-4 text-muted">{name}</td>
                {products.map((p) => (
                  <td key={p.id} className="p-4">
                    {attrValue(p, name)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
