import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("@/lib/woocommerce/store-client", () => ({ storeFetch: vi.fn() }));

import { cookies } from "next/headers";
import {
  addCartItem,
  emptyStoreCart,
  getCheckout,
  submitCheckout,
} from "@/lib/woocommerce/cart";
import { WooCommerceError } from "@/lib/woocommerce/errors";
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

describe("getCheckout", () => {
  it("warms checkout directly when a cart session already exists", async () => {
    await getCheckout();

    expect(storeFetch).toHaveBeenCalledTimes(1);
    expect(storeFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/checkout",
        cartToken: "cart-token",
        nonce: "cart-nonce",
        sendNonce: true,
      }),
    );
  });
});

describe("addCartItem", () => {
  it("refreshes rejected cart auth and retries with the returned nonce", async () => {
    const refreshedCart = emptyStoreCart();
    const addedCart = { ...emptyStoreCart(), items_count: 1 };

    vi.mocked(storeFetch)
      .mockReset()
      .mockRejectedValueOnce(
        new WooCommerceError(
          "Missing the Nonce header. This endpoint requires a valid nonce.",
          401,
          "woocommerce_rest_missing_nonce",
        ),
      )
      .mockResolvedValueOnce({
        data: refreshedCart,
        headers: new Headers(),
        cartToken: "fresh-cart-token",
        nonce: "fresh-cart-nonce",
        total: null,
        totalPages: null,
      })
      .mockResolvedValueOnce({
        data: addedCart,
        headers: new Headers(),
        cartToken: "fresh-cart-token",
        nonce: "next-cart-nonce",
        total: null,
        totalPages: null,
      });

    await expect(addCartItem({ id: 42 })).resolves.toEqual(addedCart);

    expect(storeFetch).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        path: "/cart/add-item",
        cartToken: "cart-token",
        nonce: "cart-nonce",
        sendNonce: false,
      }),
    );
    expect(storeFetch).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        path: "/cart",
        cartToken: "cart-token",
      }),
    );
    expect(storeFetch).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        path: "/cart/add-item",
        cartToken: "fresh-cart-token",
        nonce: "fresh-cart-nonce",
        sendNonce: true,
      }),
    );
  });
});
