"use client";

import { useEffect } from "react";
import { useRecentlyViewedStore } from "@/stores/recently-viewed-store";

export function RecordRecentlyViewed({ productId }: { productId: number }) {
  const add = useRecentlyViewedStore((s) => s.add);

  useEffect(() => {
    if (productId) add(productId);
  }, [productId, add]);

  return null;
}
