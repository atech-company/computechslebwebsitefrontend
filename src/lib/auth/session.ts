import { cookies } from "next/headers";
import { getAuthSecret } from "@/lib/auth/config";
import { signPayload, verifySignedPayload } from "@/lib/auth/crypto";
import { AuthError } from "@/lib/auth/errors";

export const SESSION_COOKIE = "computechs_session";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30;

export type AuthProvider = "email" | "google" | "phone";

export type AuthUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  providers: AuthProvider[];
};

type SessionPayload = AuthUser & { exp: number; iat: number };

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}

export async function createSession(user: AuthUser): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    ...user,
    iat: now,
    exp: now + SESSION_MAX_AGE_SEC,
  };
  const token = signPayload(getAuthSecret(), JSON.stringify(payload));
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, cookieOptions());
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const raw = verifySignedPayload(getAuthSecret(), token);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SessionPayload;
    if (!parsed?.id || typeof parsed.exp !== "number") return null;
    if (parsed.exp * 1000 < Date.now()) return null;
    return {
      id: parsed.id,
      email: parsed.email,
      firstName: parsed.firstName || "",
      lastName: parsed.lastName || "",
      phone: parsed.phone ?? null,
      providers: Array.isArray(parsed.providers) ? parsed.providers : [],
    };
  } catch {
    return null;
  }
}

export async function requireSessionUser(): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new AuthError("Sign in to continue", 401, "unauthenticated");
  }
  return user;
}
