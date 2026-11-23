import "server-only";

import { randomPassword, hashPassword, verifyPassword } from "@/lib/auth/crypto";
import { AuthError } from "@/lib/auth/errors";
import type { AuthProvider, AuthUser } from "@/lib/auth/session";
import {
  phonePlaceholderEmail,
  phoneUsername,
} from "@/lib/auth/phone";
import { isWooCommerceError } from "@/lib/woocommerce/errors";
import { restFetch } from "@/lib/woocommerce/server-rest";

export const META_PASSWORD = "_computechs_password";
export const META_PHONE = "_computechs_phone";
export const META_GOOGLE_SUB = "_computechs_google_sub";
export const META_PROVIDERS = "_computechs_providers";

export type WooCustomer = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  billing?: {
    phone?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  };
  meta_data?: { id?: number; key: string; value: unknown }[];
};

function metaValue(customer: WooCustomer, key: string): string | null {
  const match = customer.meta_data?.find((item) => item.key === key);
  if (match == null || match.value == null) return null;
  return String(match.value);
}

function parseProviders(customer: WooCustomer): AuthProvider[] {
  const raw = metaValue(customer, META_PROVIDERS);
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is AuthProvider =>
      item === "email" || item === "google" || item === "phone",
    );
}

function withProvider(
  customer: WooCustomer,
  provider: AuthProvider,
): AuthProvider[] {
  return Array.from(new Set([...parseProviders(customer), provider]));
}

export function toAuthUser(customer: WooCustomer): AuthUser {
  return {
    id: customer.id,
    email: customer.email,
    firstName: customer.first_name || "",
    lastName: customer.last_name || "",
    phone:
      metaValue(customer, META_PHONE) || customer.billing?.phone || null,
    providers: parseProviders(customer),
  };
}

function upsertMeta(
  customer: WooCustomer | null | undefined,
  entries: Record<string, string>,
) {
  const existing = [...(customer?.meta_data || [])];
  for (const [key, value] of Object.entries(entries)) {
    const index = existing.findIndex((item) => item.key === key);
    if (index >= 0) existing[index] = { ...existing[index], key, value };
    else existing.push({ key, value });
  }
  return existing.map(({ key, value }) => ({ key, value }));
}

function handleCustomerError(error: unknown): never {
  if (isWooCommerceError(error)) {
    const code = error.code || "";
    if (
      code.includes("email") ||
      /already registered|already exists|email/i.test(error.message)
    ) {
      throw new AuthError(
        "An account with this email already exists. Sign in instead.",
        409,
        "email_exists",
      );
    }
    throw new AuthError(
      "Could not save the customer account. Try again.",
      error.status >= 400 && error.status < 500 ? error.status : 502,
      "customer_error",
    );
  }
  throw error;
}

export async function findCustomerByEmail(
  email: string,
): Promise<WooCustomer | null> {
  try {
    const rows = await restFetch<WooCustomer[]>(
      `/customers?email=${encodeURIComponent(email)}&role=all`,
    );
    return rows.find((row) => row.email.toLowerCase() === email.toLowerCase()) ??
      rows[0] ??
      null;
  } catch (error) {
    handleCustomerError(error);
  }
}

export async function findCustomerByPhone(
  phone: string,
): Promise<WooCustomer | null> {
  try {
    const username = phoneUsername(phone);
    const rows = await restFetch<WooCustomer[]>(
      `/customers?search=${encodeURIComponent(username)}&role=all`,
    );
    const exact = rows.find(
      (row) =>
        metaValue(row, META_PHONE) === phone ||
        row.billing?.phone === phone ||
        row.username === username,
    );
    if (exact) return exact;
    return (
      rows.find((row) =>
        JSON.stringify(row.meta_data || []).includes(phone.replace("+", "")),
      ) ?? null
    );
  } catch (error) {
    handleCustomerError(error);
  }
}

export async function findCustomerByGoogleSub(
  sub: string,
  email: string,
): Promise<WooCustomer | null> {
  const byEmail = await findCustomerByEmail(email);
  if (byEmail && metaValue(byEmail, META_GOOGLE_SUB) === sub) return byEmail;
  if (byEmail) return byEmail;
  return null;
}

export async function createEmailCustomer(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<WooCustomer> {
  const existing = await findCustomerByEmail(input.email);
  if (existing) {
    throw new AuthError(
      "An account with this email already exists. Sign in instead.",
      409,
      "email_exists",
    );
  }
  try {
    return await restFetch<WooCustomer>("/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: input.email,
        first_name: input.firstName,
        last_name: input.lastName,
        username: `${input.email.split("@")[0]?.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 18) || "user"}_${Date.now().toString(36)}`,
        password: input.password,
        billing: {
          first_name: input.firstName,
          last_name: input.lastName,
          email: input.email,
        },
        meta_data: [
          { key: META_PASSWORD, value: hashPassword(input.password) },
          { key: META_PROVIDERS, value: "email" },
        ],
      }),
    });
  } catch (error) {
    handleCustomerError(error);
  }
}

export async function authenticateEmail(
  email: string,
  password: string,
): Promise<WooCustomer> {
  const customer = await findCustomerByEmail(email);
  const stored = customer ? metaValue(customer, META_PASSWORD) : null;
  if (!customer || !stored || !verifyPassword(password, stored)) {
    throw new AuthError("Invalid email or password", 401, "invalid_credentials");
  }
  return customer;
}

export async function upsertGoogleCustomer(input: {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
}): Promise<WooCustomer> {
  const existing = await findCustomerByGoogleSub(input.sub, input.email);
  const providers = existing
    ? withProvider(existing, "google")
    : (["google"] as AuthProvider[]);
  const meta = upsertMeta(existing, {
    [META_GOOGLE_SUB]: input.sub,
    [META_PROVIDERS]: providers.join(","),
  });

  if (existing) {
    try {
      return await restFetch<WooCustomer>(`/customers/${existing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: existing.first_name || input.firstName,
          last_name: existing.last_name || input.lastName,
          meta_data: meta,
        }),
      });
    } catch (error) {
      handleCustomerError(error);
    }
  }

  try {
    return await restFetch<WooCustomer>("/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: input.email,
        first_name: input.firstName,
        last_name: input.lastName,
        username: `g_${input.sub.replace(/[^a-zA-Z0-9]/g, "").slice(-16)}_${Date.now().toString(36)}`,
        password: randomPassword(),
        billing: {
          first_name: input.firstName,
          last_name: input.lastName,
          email: input.email,
        },
        meta_data: meta,
      }),
    });
  } catch (error) {
    handleCustomerError(error);
  }
}

export async function upsertPhoneCustomer(input: {
  phone: string;
  firstName?: string;
  lastName?: string;
}): Promise<WooCustomer> {
  const existing = await findCustomerByPhone(input.phone);
  const providers = existing
    ? withProvider(existing, "phone")
    : (["phone"] as AuthProvider[]);
  const meta = upsertMeta(existing, {
    [META_PHONE]: input.phone,
    [META_PROVIDERS]: providers.join(","),
  });

  if (existing) {
    try {
      return await restFetch<WooCustomer>(`/customers/${existing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing: {
            ...(existing.billing || {}),
            phone: input.phone,
            first_name:
              input.firstName || existing.billing?.first_name || existing.first_name,
            last_name:
              input.lastName || existing.billing?.last_name || existing.last_name,
          },
          meta_data: meta,
        }),
      });
    } catch (error) {
      handleCustomerError(error);
    }
  }

  const email = phonePlaceholderEmail(input.phone);
  try {
    return await restFetch<WooCustomer>("/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        first_name: input.firstName || "",
        last_name: input.lastName || "",
        username: phoneUsername(input.phone),
        password: randomPassword(),
        billing: {
          first_name: input.firstName || "",
          last_name: input.lastName || "",
          phone: input.phone,
          email,
        },
        meta_data: meta,
      }),
    });
  } catch (error) {
    handleCustomerError(error);
  }
}
