import { cookies } from "next/headers";
import { getAuthSecret } from "@/lib/auth/config";
import { signPayload, verifySignedPayload } from "@/lib/auth/crypto";
import { AuthError } from "@/lib/auth/errors";
import { hasWcRestCredentials } from "@/lib/env";

export const OAUTH_STATE_COOKIE = "computechs_oauth";

export function assertCustomerApiReady() {
  if (!hasWcRestCredentials()) {
    throw new AuthError(
      "Customer accounts are not connected yet. Add WooCommerce REST credentials.",
      503,
      "wc_credentials_missing",
    );
  }
}

export async function writeOAuthState(input: {
  state: string;
  locale: string;
}): Promise<void> {
  const jar = await cookies();
  jar.set(
    OAUTH_STATE_COOKIE,
    signPayload(
      getAuthSecret(),
      JSON.stringify({ ...input, exp: Date.now() + 10 * 60 * 1000 }),
    ),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 600,
    },
  );
}

export async function consumeOAuthState(
  state: string,
): Promise<{ locale: string }> {
  const jar = await cookies();
  const token = jar.get(OAUTH_STATE_COOKIE)?.value;
  jar.set(OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  const raw = token ? verifySignedPayload(getAuthSecret(), token) : null;
  if (!raw) {
    throw new AuthError("Google sign-in expired. Try again.", 400, "oauth_state");
  }
  const parsed = JSON.parse(raw) as {
    state?: string;
    locale?: string;
    exp?: number;
  };
  if (parsed.state !== state || !parsed.exp || parsed.exp < Date.now()) {
    throw new AuthError("Google sign-in expired. Try again.", 400, "oauth_state");
  }
  return { locale: parsed.locale === "ar" ? "ar" : "en" };
}
