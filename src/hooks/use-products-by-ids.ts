"use client";

import { useQuery } from "@tanstack/react-query";
import type { ProductCardModel } from "@/types/woocommerce";
import { useHydrated } from "@/hooks/use-hydrated";

export function useProductsByIds(ids: number[]) {
  const hydrated = useHydrated();
  const key = ids.join(",");

  return useQuery({
    queryKey: ["products-by-ids", key],
    enabled: hydrated && ids.length > 0,
    queryFn: async () => {
      const res = await fetch(
        `/api/products?include=${key}&per_page=${ids.length}`,
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load products");
      }
      const products = (data.products || []) as ProductCardModel[];
      const order = new Map(ids.map((id, i) => [id, i]));
      return [...products].sort(
        (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
      );
    },
  });
}
