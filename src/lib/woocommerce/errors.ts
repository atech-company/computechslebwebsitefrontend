import { decodeHtmlEntities } from "@/lib/utils";

export class WooCommerceError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "WooCommerceError";
  }
}

export function isWooCommerceError(error: unknown): error is WooCommerceError {
  return error instanceof WooCommerceError;
}

export function isStoreMutationBlocked(error: unknown): boolean {
  if (!isWooCommerceError(error)) return false;
  if (error.status === 401 || error.status === 403) return true;
  return (
    error.code === "waf_blocked" ||
    error.code === "woocommerce_rest_invalid_nonce" ||
    error.code === "woocommerce_rest_missing_nonce" ||
    error.code === "rest_cookie_invalid_nonce"
  );
}

export function parseWooErrorBody(parsed: unknown): {
  message?: string;
  code?: string;
} {
  if (Array.isArray(parsed) && parsed[0]) {
    return parseWooErrorBody(parsed[0]);
  }
  if (!parsed || typeof parsed !== "object") {
    return {};
  }
  const body = parsed as {
    message?: unknown;
    code?: unknown;
    data?: {
      params?: Record<string, unknown>;
      details?: Record<string, { message?: string }>;
    };
  };
  const parts: string[] = [];
  if (typeof body.message === "string" && body.message.trim()) {
    parts.push(decodeHtmlEntities(body.message).trim());
  }
  const params = body.data?.params;
  if (params && typeof params === "object") {
    for (const value of Object.values(params)) {
      if (typeof value === "string" && value.trim()) {
        parts.push(decodeHtmlEntities(value).trim());
      }
    }
  }
  const details = body.data?.details;
  if (details && typeof details === "object") {
    for (const value of Object.values(details)) {
      if (typeof value?.message === "string" && value.message.trim()) {
        parts.push(decodeHtmlEntities(value.message).trim());
      }
    }
  }
  return {
    message: parts.length ? [...new Set(parts)].join(" — ") : undefined,
    code: typeof body.code === "string" ? body.code : undefined,
  };
}
