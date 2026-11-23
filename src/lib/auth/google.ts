import { googleOAuthConfigured } from "@/lib/auth/config";
import { AuthError } from "@/lib/auth/errors";
import { getServerEnv } from "@/lib/env";

export function googleRedirectUri(origin: string): string {
  return `${origin.replace(/\/$/, "")}/api/auth/google/callback`;
}

export function googleAuthorizeUrl(input: {
  origin: string;
  state: string;
}): string {
  if (!googleOAuthConfigured()) {
    throw new AuthError(
      "Google sign-in is not configured.",
      503,
      "google_not_configured",
    );
  }
  const env = getServerEnv();
  const params = new URLSearchParams({
    client_id: env.AUTH_GOOGLE_CLIENT_ID.trim(),
    redirect_uri: googleRedirectUri(input.origin),
    response_type: "code",
    scope: "openid email profile",
    state: input.state,
    prompt: "select_account",
    access_type: "online",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(input: {
  origin: string;
  code: string;
}): Promise<{
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
}> {
  if (!googleOAuthConfigured()) {
    throw new AuthError(
      "Google sign-in is not configured.",
      503,
      "google_not_configured",
    );
  }
  const env = getServerEnv();
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: input.code,
      client_id: env.AUTH_GOOGLE_CLIENT_ID.trim(),
      client_secret: env.AUTH_GOOGLE_CLIENT_SECRET.trim(),
      redirect_uri: googleRedirectUri(input.origin),
      grant_type: "authorization_code",
    }),
  });
  const tokenJson = (await tokenRes.json().catch(() => null)) as {
    access_token?: string;
    error?: string;
  } | null;
  if (!tokenRes.ok || !tokenJson?.access_token) {
    throw new AuthError("Google sign-in failed", 401, "google_token_failed");
  }

  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });
  const profile = (await userRes.json().catch(() => null)) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    given_name?: string;
    family_name?: string;
    name?: string;
  } | null;
  if (!userRes.ok || !profile?.sub || !profile.email) {
    throw new AuthError(
      "Google did not return a verified email.",
      401,
      "google_profile_failed",
    );
  }
  if (profile.email_verified === false) {
    throw new AuthError(
      "Verify your Google email before continuing.",
      401,
      "google_unverified",
    );
  }

  const names = (profile.name || "").split(" ").filter(Boolean);
  return {
    sub: profile.sub,
    email: profile.email,
    firstName: profile.given_name || names[0] || "",
    lastName: profile.family_name || names.slice(1).join(" ") || "",
  };
}
