import { getServerEnv, storeApiBase } from "@/lib/env";
import {
  parseWooErrorBody,
  WooCommerceError,
} from "@/lib/woocommerce/errors";

export interface StoreRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  cartToken?: string | null;
  nonce?: string | null;
  /** When a Cart-Token is present, Woo does not need a nonce. Skip it by default so Hostinger WAF does not 403 custom headers. */
  sendNonce?: boolean;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
  timeoutMs?: number;
  retries?: number;
}

export interface StoreResponse<T> {
  data: T;
  headers: Headers;
  cartToken: string | null;
  nonce: string | null;
  total: number | null;
  totalPages: number | null;
}

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function buildUrl(
  path: string,
  query?: StoreRequestOptions["query"],
): string {
  const base = storeApiBase();
  const url = new URL(
    path.startsWith("/") ? `${base}${path}` : `${base}/${path}`,
  );
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number) {
  return status === 408 || status === 429 || status >= 500;
}

async function storeFetchOnce<T>(
  options: StoreRequestOptions,
): Promise<StoreResponse<T>> {
  const {
    method = "GET",
    path,
    query,
    body,
    cartToken,
    nonce,
    cache,
    next,
    timeoutMs = 8_000,
  } = options;
  const sendNonce = options.sendNonce ?? Boolean(nonce && !cartToken);
  const wooOrigin = getServerEnv().WOOCOMMERCE_URL.replace(/\/$/, "");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers = new Headers({
    Accept: "application/json",
    "User-Agent": BROWSER_UA,
    "Accept-Language": "en-US,en;q=0.9",
  });
  if (method !== "GET") {
    headers.set("Origin", wooOrigin);
    headers.set("Referer", `${wooOrigin}/`);
  }
  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (cartToken) headers.set("Cart-Token", cartToken);
  if (sendNonce && nonce) {
    headers.set("Nonce", nonce);
  }

  try {
    const response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache,
      next,
      signal: controller.signal,
    });

    const responseCartToken =
      response.headers.get("Cart-Token") ||
      response.headers.get("cart-token");
    const responseNonce =
      response.headers.get("Nonce") ||
      response.headers.get("nonce") ||
      response.headers.get("X-WC-Store-API-Nonce") ||
      response.headers.get("x-wc-store-api-nonce");

    const text = await response.text();
    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text) as unknown;
      } catch {
        parsed = text;
      }
    }

    if (!response.ok) {
      const parsedError = parseWooErrorBody(parsed);
      const htmlBlocked =
        typeof parsed === "string" &&
        (parsed.trim().startsWith("<") || parsed.trim() === "");
      throw new WooCommerceError(
        htmlBlocked
          ? `WooCommerce host blocked this request (${response.status}) on ${path}`
          : parsedError.message ||
              `WooCommerce Store API error (${response.status}) on ${path}`,
        response.status,
        parsedError.code || (htmlBlocked ? "waf_blocked" : undefined),
        parsed,
      );
    }

    const totalHeader = response.headers.get("X-WP-Total");
    const totalPagesHeader = response.headers.get("X-WP-TotalPages");

    return {
      data: parsed as T,
      headers: response.headers,
      cartToken: responseCartToken,
      nonce: responseNonce,
      total: totalHeader ? Number.parseInt(totalHeader, 10) : null,
      totalPages: totalPagesHeader
        ? Number.parseInt(totalPagesHeader, 10)
        : null,
    };
  } catch (error) {
    if (error instanceof WooCommerceError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new WooCommerceError(
        `WooCommerce Store API timeout after ${timeoutMs}ms (${getServerEnv().WOOCOMMERCE_URL})`,
        408,
        "timeout",
      );
    }
    throw new WooCommerceError(
      error instanceof Error
        ? error.message
        : "Unknown WooCommerce Store API failure",
      500,
      "network_error",
      error,
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function storeFetch<T>(
  options: StoreRequestOptions,
): Promise<StoreResponse<T>> {
  const method = options.method ?? "GET";
  const retries = options.retries ?? (method === "GET" ? 1 : 0);

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await storeFetchOnce<T>(options);
    } catch (error) {
      lastError = error;
      const retryable =
        error instanceof WooCommerceError && isRetryableStatus(error.status);
      if (!retryable || attempt === retries) throw error;
      await sleep(200 * (attempt + 1));
    }
  }
  throw lastError;
}
