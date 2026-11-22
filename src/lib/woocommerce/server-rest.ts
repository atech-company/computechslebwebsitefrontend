import "server-only";

import { getServerEnv, hasWcRestCredentials, restApiBase } from "@/lib/env";
import { WooCommerceError } from "@/lib/woocommerce/errors";

export interface PaymentGateway {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  method_title: string;
  method_description: string;
  settings?: Record<string, unknown>;
}

export async function restFetch<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<T> {
  if (!hasWcRestCredentials()) {
    throw new WooCommerceError(
      "WC_CONSUMER_KEY and WC_CONSUMER_SECRET are required for this operation",
      401,
      "missing_credentials",
    );
  }

  const env = getServerEnv();
  const timeoutMs = init?.timeoutMs ?? 20_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const auth = Buffer.from(
    `${env.WC_CONSUMER_KEY}:${env.WC_CONSUMER_SECRET}`,
  ).toString("base64");

  try {
    const url = `${restApiBase()}${path.startsWith("/") ? path : `/${path}`}`;
    const response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${auth}`,
        ...(init?.headers || {}),
      },
      signal: controller.signal,
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new WooCommerceError(
        (data as { message?: string })?.message ||
          `WooCommerce REST error (${response.status})`,
        response.status,
        (data as { code?: string })?.code,
        data,
      );
    }
    return data as T;
  } catch (error) {
    if (error instanceof WooCommerceError) throw error;
    throw new WooCommerceError(
      error instanceof Error ? error.message : "REST API failure",
      500,
      "network_error",
      error,
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function getPaymentGateways(): Promise<PaymentGateway[]> {
  return restFetch<PaymentGateway[]>("/payment_gateways");
}

export async function auditPaymentGateways(): Promise<{
  ok: boolean;
  gateways: PaymentGateway[];
  storePaymentMethods: string[];
  notes: string[];
  error?: string;
}> {
  const notes: string[] = [];
  try {
    const { storeFetch } = await import("@/lib/woocommerce/store-client");
    const cart = await storeFetch<{ payment_methods: string[] }>({
      path: "/cart",
      cache: "no-store",
    });
    const storePaymentMethods = cart.data.payment_methods || [];

    if (!hasWcRestCredentials()) {
      notes.push(
        "WC REST credentials missing — only Store API payment method ids are available.",
      );
      return {
        ok: true,
        gateways: [],
        storePaymentMethods,
        notes,
      };
    }

    const gateways = await getPaymentGateways();
    const enabled = gateways.filter((g) => g.enabled);
    notes.push(
      `Found ${enabled.length} enabled gateway(s) via WC REST v3.`,
    );
    for (const id of storePaymentMethods) {
      const match = gateways.find((g) => g.id === id);
      if (!match) {
        notes.push(
          `Store method "${id}" not found in WC REST gateway list — treat as custom/plugin gateway.`,
        );
      } else {
        notes.push(
          `Store method "${id}" maps to "${match.title}" (enabled=${match.enabled}).`,
        );
      }
    }

    return { ok: true, gateways, storePaymentMethods, notes };
  } catch (error) {
    return {
      ok: false,
      gateways: [],
      storePaymentMethods: [],
      notes,
      error: error instanceof Error ? error.message : "Unknown audit failure",
    };
  }
}
