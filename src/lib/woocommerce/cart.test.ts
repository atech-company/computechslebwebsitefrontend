import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("@/lib/woocommerce/store-client", () => ({ storeFetch: vi.fn() }));

import { cookies } from "next/headers";
import { submitCheckout } from "@/lib/woocommerce/cart";
import { storeFetch } from "@/lib/woocommerce/store-client";
import type { StoreCheckout } from "@/types/woocommerce";

const checkout: StoreCheckout = {
  order_id: 123,
  status: "pending",
  order_key: "wc_order_test",
  order_number: "123",
  customer_note: "",
  customer_id: 0,
  billing_address: {},
  shipping_address: {},
  payment_method: "whish_by_codnloc",
  payment_result: null,
  additional_fields: {},
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(cookies).mockResolvedValue({
    get: vi.fn((name: string) => {
      if (name === "computechs_cart_token") return { value: "cart-token" };
      if (name === "computechs_cart_nonce") return { value: "cart-nonce" };
      return undefined;
    }),
    set: vi.fn(),
  } as never);
  vi.mocked(storeFetch).mockResolvedValue({
    data: checkout,
    headers: new Headers(),
    cartToken: "rotated-cart-token",
    nonce: "rotated-nonce",
    total: null,
    totalPages: null,
  });
});

describe("submitCheckout", () => {
  it("sends the stored nonce with the cart token", async () => {
    await submitCheckout({
      billing_address: {
        first_name: "Test",
        last_name: "Shopper",
        email: "shopper@example.com",
      },
      shipping_address: {
        first_name: "Test",
        last_name: "Shopper",
      },
      payment_method: "whish_by_codnloc",
    });

    expect(storeFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/checkout",
        cartToken: "cart-token",
        nonce: "cart-nonce",
        sendNonce: true,
        timeoutMs: 45_000,
      }),
    );
  });
});
