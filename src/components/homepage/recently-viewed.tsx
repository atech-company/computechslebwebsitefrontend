"use client";

import { SectionHeading } from "@/components/homepage/section-heading";
import { ProductGrid } from "@/components/products/product-grid";
import { useRecentlyViewedStore } from "@/stores/recently-viewed-store";
import { useProductsByIds } from "@/hooks/use-products-by-ids";
import { useHydrated } from "@/hooks/use-hydrated";

export function RecentlyViewedSection({ title }: { title: string }) {
  const hydrated = useHydrated();
  const ids = useRecentlyViewedStore((s) => s.ids);
  const slice = ids.slice(0, 8);
  const { data: products = [] } = useProductsByIds(slice);

  if (!hydrated || !slice.length || !products.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading title={title} />
      <ProductGrid products={products} />
    </section>
  );
}
