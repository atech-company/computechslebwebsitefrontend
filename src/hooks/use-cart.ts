"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { StoreCart } from "@/types/woocommerce";

class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    const error = data as { message?: string; code?: string };
    throw new ApiRequestError(
      error.message || "Cart request failed",
      error.code,
    );
  }
  return data as T;
}

export function fetchCartFromApi() {
  return fetch("/api/cart", { credentials: "same-origin" }).then((response) =>
    parseJson<StoreCart>(response),
  );
}

export function useCartQuery() {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const cart = await fetchCartFromApi();
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
    mutationKey: ["cart", "add"],
    mutationFn: async (body: {
      id: number;
      quantity?: number;
      variation?: Array<{ attribute: string; value: string }>;
    }) => {
      // Prime WooCommerce's Cart-Token + Nonce once. When the idle warmup has
      // already run this is a cache read; on a very fast first click it avoids
      // the slower unauthorized request/retry path.
      await qc.ensureQueryData({
        queryKey: ["cart"],
        queryFn: fetchCartFromApi,
        staleTime: 20_000,
      });
      return fetch("/api/cart/add", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => parseJson<StoreCart>(r));
    },
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: ["cart"] });
      const previous = qc.getQueryData<StoreCart>(["cart"]);
      if (previous) {
        qc.setQueryData<StoreCart>(["cart"], {
          ...previous,
          items_count: previous.items_count + (body.quantity ?? 1),
        });
      }
      return { previous };
    },
    onSuccess: (cart) => {
      qc.setQueryData(["cart"], cart);
      toast.success("Added to cart");
    },
    onError: (err: Error, _body, context) => {
      if (context?.previous) {
        qc.setQueryData(["cart"], context.previous);
      }
      if (
        err instanceof ApiRequestError &&
        err.code?.includes("out_of_stock")
      ) {
        void qc.invalidateQueries({ queryKey: ["products-by-ids"] });
      }
      toast.error(err.message);
    },
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
