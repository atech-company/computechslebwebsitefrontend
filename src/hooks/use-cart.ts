"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { StoreCart } from "@/types/woocommerce";

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      (data as { message?: string })?.message || "Cart request failed",
    );
  }
  return data as T;
}

export function useCartQuery() {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const cart = await fetch("/api/cart", { credentials: "same-origin" }).then(
        (r) => parseJson<StoreCart>(r),
      );
      const previous = qc.getQueryData<StoreCart>(["cart"]);
      if (
        (!cart.items || cart.items.length === 0) &&
        previous?.items?.length
      ) {
        return previous;
      }
      return cart;
    },
    retry: 2,
    retryDelay: (attempt) => Math.min(1500 * (attempt + 1), 4000),
    staleTime: 20_000,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      id: number;
      quantity?: number;
      variation?: Array<{ attribute: string; value: string }>;
    }) =>
      fetch("/api/cart/add", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => parseJson<StoreCart>(r)),
    onSuccess: (cart) => {
      qc.setQueryData(["cart"], cart);
      toast.success("Added to cart");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { key: string; quantity: number }) =>
      fetch("/api/cart/update", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => parseJson<StoreCart>(r)),
    onSuccess: (cart) => qc.setQueryData(["cart"], cart),
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { key: string }) =>
      fetch("/api/cart/remove", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => parseJson<StoreCart>(r)),
    onSuccess: (cart) => {
      qc.setQueryData(["cart"], cart);
      toast.success("Removed from cart");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCouponMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { code: string; action: "apply" | "remove" }) =>
      fetch("/api/cart/coupon", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => parseJson<StoreCart>(r)),
    onSuccess: (cart) => {
      qc.setQueryData(["cart"], cart);
      toast.success("Coupon updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
