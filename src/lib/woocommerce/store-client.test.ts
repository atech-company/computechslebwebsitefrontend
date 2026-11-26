import { afterEach, describe, expect, it, vi } from "vitest";
import { storeFetch } from "@/lib/woocommerce/store-client";

function successfulResponse() {
  return new Response("{}", {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cart-Token": "rotated-cart-token",
      Nonce: "rotated-nonce",
    },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("storeFetch Store API session headers", () => {
  it("sends the nonce alongside a cart token when explicitly requested", async () => {
    const fetchMock = vi.fn().mockResolvedValue(successfulResponse());
    vi.stubGlobal("fetch", fetchMock);

    await storeFetch({
      path: "/checkout",
      cartToken: "cart-token",
      nonce: "cart-nonce",
      sendNonce: true,
      retries: 0,
    });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = init.headers as Headers;
    expect(headers.get("Cart-Token")).toBe("cart-token");
    expect(headers.get("Nonce")).toBe("cart-nonce");
  });

  it("defaults to token-only auth for WAF-sensitive cart mutations", async () => {
    const fetchMock = vi.fn().mockResolvedValue(successfulResponse());
    vi.stubGlobal("fetch", fetchMock);

    await storeFetch({
      method: "POST",
      path: "/cart/add-item",
      cartToken: "cart-token",
      nonce: "cart-nonce",
      body: { id: 1, quantity: 1 },
      retries: 0,
    });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = init.headers as Headers;
    expect(headers.get("Cart-Token")).toBe("cart-token");
    expect(headers.has("Nonce")).toBe(false);
  });
});
