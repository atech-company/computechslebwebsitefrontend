import { cookies } from "next/headers";
import { storeFetch } from "@/lib/woocommerce/store-client";
import {
  isStoreMutationBlocked,
  isWooCommerceError,
  WooCommerceError,
} from "@/lib/woocommerce/errors";
import type {
  StoreCart,
  StoreCheckout,
  StoreProduct,
} from "@/types/woocommerce";

export const CART_TOKEN_COOKIE = "computechs_cart_token";
export const CART_NONCE_COOKIE = "computechs_cart_nonce";

export async function readCartSession(): Promise<{
  cartToken: string | null;
  nonce: string | null;
}> {
  const jar = await cookies();
  return {
    cartToken: jar.get(CART_TOKEN_COOKIE)?.value ?? null,
    nonce: jar.get(CART_NONCE_COOKIE)?.value ?? null,
  };
}

function cartItemCount(data: unknown): number {
  if (!data || typeof data !== "object") return 0;
  const items = (data as { items?: unknown }).items;
  return Array.isArray(items) ? items.length : 0;
}

export function emptyStoreCart(): StoreCart {
  return {
    items: [],
    coupons: [],
    totals: {
      total_items: "0",
      total_items_tax: "0",
      total_fees: "0",
      total_fees_tax: "0",
      total_discount: "0",
      total_discount_tax: "0",
      total_shipping: null,
      total_shipping_tax: null,
      total_price: "0",
      total_tax: "0",
      tax_lines: [],
      currency_code: "USD",
      currency_symbol: "$",
      currency_minor_unit: 2,
      currency_decimal_separator: ".",
      currency_thousand_separator: ",",
      currency_prefix: "$",
      currency_suffix: "",
    },
    shipping_address: {},
    billing_address: {},
    needs_payment: false,
    needs_shipping: false,
    payment_requirements: [],
    has_calculated_shipping: false,
    shipping_rates: [],
    items_count: 0,
    items_weight: 0,
    cross_sells: [],
    errors: [],
    payment_methods: [],
    extensions: {},
  };
}

function isUpstreamUnavailable(error: unknown) {
  if (!isWooCommerceError(error)) return false;
  return (
    error.status === 408 ||
    error.status === 502 ||
    error.status === 503 ||
    error.status === 504 ||
    error.code === "timeout" ||
    error.code === "waf_blocked" ||
    error.code === "network_error"
  );
}

export async function persistCartSession(
  cartToken: string | null,
  nonce: string | null,
): Promise<void> {
  const jar = await cookies();
  const common = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
  if (cartToken) {
    jar.set(CART_TOKEN_COOKIE, cartToken, common);
  }
  if (nonce) {
    jar.set(CART_NONCE_COOKIE, nonce, common);
  }
}

async function persistSessionIfSafe(options: {
  incomingToken: string | null;
  incomingNonce: string | null;
  outgoingToken: string | null;
  outgoingNonce: string | null;
  outgoingItemCount: number;
  keepIncomingIfEmptyRotate?: boolean;
}): Promise<void> {
  const latest = await readCartSession();
  const outgoingToken =
    options.outgoingToken ?? options.incomingToken ?? latest.cartToken;
  const outgoingNonce =
    options.outgoingNonce ?? options.incomingNonce ?? latest.nonce;

  // Never let a GET (or a rotated empty cart) replace a token that already
  // has items. That is what made Place order say the cart was empty after add.
  if (
    options.keepIncomingIfEmptyRotate &&
    options.outgoingItemCount === 0 &&
    (latest.cartToken || options.incomingToken)
  ) {
    if (
      options.incomingToken &&
      outgoingToken &&
      outgoingToken !== options.incomingToken
    ) {
      await persistCartSession(options.incomingToken, options.incomingNonce);
    }
    return;
  }

  await persistCartSession(outgoingToken, outgoingNonce);
}

async function fetchStoreCart(session: {
  cartToken: string | null;
  nonce: string | null;
}) {
  const first = await storeFetch<StoreCart>({
    path: "/cart",
    cartToken: session.cartToken,
    nonce: session.nonce,
    cache: "no-store",
    timeoutMs: 6_000,
    retries: 1,
  });

  const firstCount = cartItemCount(first.data);
  const rotatedEmpty =
    Boolean(session.cartToken) &&
    firstCount === 0 &&
    Boolean(first.cartToken) &&
    first.cartToken !== session.cartToken;

  if (!rotatedEmpty) {
    return first;
  }

  const retry = await storeFetch<StoreCart>({
    path: "/cart",
    cartToken: session.cartToken,
    nonce: session.nonce,
    cache: "no-store",
    timeoutMs: 6_000,
    retries: 0,
  });
  if (cartItemCount(retry.data) > 0) return retry;

  return {
    ...retry,
    data: retry.data,
    cartToken: session.cartToken,
    nonce: session.nonce,
  };
}

async function withSessionUpdate<T>(
  runner: (session: {
    cartToken: string | null;
    nonce: string | null;
  }) => Promise<{
    data: T;
    cartToken: string | null;
    nonce: string | null;
  }>,
  options?: { keepIncomingIfEmptyRotate?: boolean },
): Promise<T> {
  const session = await readCartSession();
  const result = await runner(session);
  await persistSessionIfSafe({
    incomingToken: session.cartToken,
    incomingNonce: session.nonce,
    outgoingToken: result.cartToken,
    outgoingNonce: result.nonce,
    outgoingItemCount: cartItemCount(result.data),
    keepIncomingIfEmptyRotate: options?.keepIncomingIfEmptyRotate,
  });
  return result.data;
}

export async function getCart(): Promise<StoreCart> {
  return withSessionUpdate(async (session) => {
    const res = await fetchStoreCart(session);
    return {
      data: res.data,
      cartToken: res.cartToken,
      nonce: res.nonce,
    };
  }, { keepIncomingIfEmptyRotate: true });
}

export async function getCartSafe(): Promise<StoreCart> {
  try {
    return await getCart();
  } catch (error) {
    if (isUpstreamUnavailable(error)) {
      return emptyStoreCart();
    }
    throw error;
  }
}

async function ensureCartToken(session: {
  cartToken: string | null;
  nonce: string | null;
}) {
  if (session.cartToken) return session;
  const primed = await fetchStoreCart({ cartToken: null, nonce: null });
  return {
    cartToken: primed.cartToken ?? session.cartToken,
    nonce: primed.nonce ?? session.nonce,
  };
}

async function postAddItem(
  session: { cartToken: string | null; nonce: string | null },
  input: {
    id: number;
    quantity: number;
    variation?: Array<{ attribute: string; value: string }>;
  },
  mode: "json" | "query",
) {
  const res = await storeFetch<StoreCart>({
    method: "POST",
    path: "/cart/add-item",
    cartToken: session.cartToken,
    sendNonce: false,
    query:
      mode === "query"
        ? { id: input.id, quantity: input.quantity }
        : undefined,
    body:
      mode === "json"
        ? {
            id: input.id,
            quantity: input.quantity,
            ...(input.variation?.length ? { variation: input.variation } : {}),
          }
        : undefined,
    cache: "no-store",
    retries: 0,
  });
  return {
    data: res.data,
    cartToken: res.cartToken ?? session.cartToken,
    nonce: res.nonce ?? session.nonce,
  };
}

export async function addCartItem(input: {
  id: number;
  quantity?: number;
  variation?: Array<{ attribute: string; value: string }>;
}): Promise<StoreCart> {
  const quantity = input.quantity ?? 1;
  const payload = {
    id: input.id,
    quantity,
    variation: input.variation,
  };

  const liveProduct = await storeFetch<StoreProduct>({
    path: `/products/${input.id}`,
    cache: "no-store",
    timeoutMs: 6_000,
    retries: 0,
  });
  if (!liveProduct.data.is_in_stock) {
    throw new WooCommerceError(
      "This product is currently out of stock. Its availability has been refreshed.",
      409,
      "woocommerce_rest_product_out_of_stock",
    );
  }

  return withSessionUpdate(async (session) => {
    let current = await ensureCartToken(session);

    try {
      return await postAddItem(current, payload, "json");
    } catch (error) {
      if (!isStoreMutationBlocked(error)) throw error;
      const primed = await fetchStoreCart({
        cartToken: current.cartToken,
        nonce: null,
      });
      current = {
        cartToken: primed.cartToken ?? current.cartToken,
        nonce: primed.nonce ?? current.nonce,
      };
      try {
        return await postAddItem(current, payload, "json");
      } catch (retryError) {
        if (!isStoreMutationBlocked(retryError) || payload.variation?.length) {
          throw retryError;
        }
        return await postAddItem(current, payload, "query");
      }
    }
  });
}

export async function updateCartItem(input: {
  key: string;
  quantity: number;
}): Promise<StoreCart> {
  return withSessionUpdate(async (session) => {
    const current = await ensureCartToken(session);
    const res = await storeFetch<StoreCart>({
      method: "POST",
      path: "/cart/update-item",
      cartToken: current.cartToken,
      sendNonce: false,
      body: {
        key: input.key,
        quantity: input.quantity,
      },
      cache: "no-store",
    });
    return {
      data: res.data,
      cartToken: res.cartToken ?? current.cartToken,
      nonce: res.nonce ?? current.nonce,
    };
  });
}

export async function removeCartItem(key: string): Promise<StoreCart> {
  return withSessionUpdate(async (session) => {
    const current = await ensureCartToken(session);
    const res = await storeFetch<StoreCart>({
      method: "POST",
      path: "/cart/remove-item",
      cartToken: current.cartToken,
      sendNonce: false,
      body: { key },
      cache: "no-store",
    });
    return {
      data: res.data,
      cartToken: res.cartToken ?? current.cartToken,
      nonce: res.nonce ?? current.nonce,
    };
  });
}

export async function applyCoupon(code: string): Promise<StoreCart> {
  return withSessionUpdate(async (session) => {
    const current = await ensureCartToken(session);
    const res = await storeFetch<StoreCart>({
      method: "POST",
      path: "/cart/apply-coupon",
      cartToken: current.cartToken,
      sendNonce: false,
      body: { code },
      cache: "no-store",
    });
    return {
      data: res.data,
      cartToken: res.cartToken ?? current.cartToken,
      nonce: res.nonce ?? current.nonce,
    };
  });
}

export async function removeCoupon(code: string): Promise<StoreCart> {
  return withSessionUpdate(async (session) => {
    const current = await ensureCartToken(session);
    const res = await storeFetch<StoreCart>({
      method: "POST",
      path: "/cart/remove-coupon",
      cartToken: current.cartToken,
      sendNonce: false,
      body: { code },
      cache: "no-store",
    });
    return {
      data: res.data,
      cartToken: res.cartToken ?? current.cartToken,
      nonce: res.nonce ?? current.nonce,
    };
  });
}

const BILLING_KEYS = [
  "first_name",
  "last_name",
  "company",
  "address_1",
  "address_2",
  "city",
  "state",
  "postcode",
  "country",
  "phone",
  "email",
] as const;

const SHIPPING_KEYS = [
  "first_name",
  "last_name",
  "company",
  "address_1",
  "address_2",
  "city",
  "state",
  "postcode",
  "country",
  "phone",
] as const;

function pickAddress(
  source: Record<string, string>,
  keys: readonly string[],
): Record<string, string> {
  const next: Record<string, string> = {};
  for (const key of keys) {
    next[key] = source[key] ?? "";
  }
  if (!next.country) next.country = "LB";
  return next;
}

function emptyCheckout(cart: StoreCart): StoreCheckout {
  return {
    order_id: 0,
    status: "",
    order_key: "",
    order_number: "",
    customer_note: "",
    customer_id: 0,
    billing_address: {},
    shipping_address: {},
    payment_method: cart.payment_methods?.[0] ?? "",
    payment_result: null,
    additional_fields: {},
    __experimentalCart: cart,
  };
}

export async function getCheckout(): Promise<StoreCheckout> {
  return withSessionUpdate(async (session) => {
    const cartRes = await fetchStoreCart(session);
    const cartToken = cartRes.cartToken ?? session.cartToken;
    const nonce = cartRes.nonce ?? session.nonce;
    const cart = cartRes.data;

    if (!cart.items?.length) {
      return {
        data: emptyCheckout(cart),
        cartToken: session.cartToken ?? cartToken,
        nonce: session.nonce ?? nonce,
      };
    }

    const res = await storeFetch<StoreCheckout>({
      path: "/checkout",
      cartToken,
      nonce,
      cache: "no-store",
    });
    return {
      data: res.data,
      cartToken: res.cartToken ?? cartToken,
      nonce: res.nonce ?? nonce,
    };
  }, { keepIncomingIfEmptyRotate: true });
}

export async function submitCheckout(payload: {
  billing_address: Record<string, string>;
  shipping_address: Record<string, string>;
  customer_note?: string;
  payment_method: string;
}): Promise<StoreCheckout> {
  const checkoutTimeoutMs = 45_000;
  return withSessionUpdate(async (session) => {
    const cartToken = session.cartToken;
    const nonce = session.nonce;
    const billing = pickAddress(payload.billing_address, BILLING_KEYS);
    const shipping = pickAddress(payload.shipping_address, SHIPPING_KEYS);

    if (!cartToken) {
      const cartRes = await fetchStoreCart(session);
      if (!cartRes.data.items?.length) {
        throw new WooCommerceError(
          "Your cart is empty. Add a product before checkout.",
          400,
          "woocommerce_rest_cart_empty",
        );
      }
      const res = await storeFetch<StoreCheckout>({
        method: "POST",
        path: "/checkout",
        cartToken: cartRes.cartToken,
        sendNonce: false,
        body: {
          billing_address: billing,
          shipping_address: shipping,
          customer_note: payload.customer_note || "",
          payment_method: payload.payment_method,
          payment_data: [],
          create_account: false,
        },
        cache: "no-store",
        timeoutMs: checkoutTimeoutMs,
        retries: 0,
      });
      return {
        data: res.data,
        cartToken: res.cartToken ?? cartRes.cartToken,
        nonce: res.nonce ?? cartRes.nonce,
      };
    }

    // Place the order on the current token. A prior GET /cart can look empty
    // after Hostinger WAF rotation even though add-item succeeded.
    const res = await storeFetch<StoreCheckout>({
      method: "POST",
      path: "/checkout",
      cartToken,
      sendNonce: false,
      body: {
        billing_address: billing,
        shipping_address: shipping,
        customer_note: payload.customer_note || "",
        payment_method: payload.payment_method,
        payment_data: [],
        create_account: false,
      },
      cache: "no-store",
      timeoutMs: checkoutTimeoutMs,
      retries: 0,
    });
    return {
      data: res.data,
      cartToken: res.cartToken ?? cartToken,
      nonce: res.nonce ?? nonce,
    };
  });
}
