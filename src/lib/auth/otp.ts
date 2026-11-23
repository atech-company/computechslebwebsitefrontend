import { randomInt } from "crypto";
import { cookies } from "next/headers";
import { getAuthSecret } from "@/lib/auth/config";
import { hashOtp, randomToken, signPayload, verifySignedPayload } from "@/lib/auth/crypto";
import { AuthError } from "@/lib/auth/errors";

export const OTP_COOKIE = "computechs_otp";
const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

type OtpRecord = {
  phone: string;
  hash: string;
  exp: number;
  attempts: number;
  firstName?: string;
  lastName?: string;
};

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function generateOtp(): string {
  return String(randomInt(100000, 1000000));
}

export async function storeOtp(input: {
  phone: string;
  otp: string;
  firstName?: string;
  lastName?: string;
}): Promise<void> {
  const record: OtpRecord = {
    phone: input.phone,
    hash: hashOtp(input.otp, getAuthSecret()),
    exp: Date.now() + OTP_TTL_MS,
    attempts: 0,
    firstName: input.firstName,
    lastName: input.lastName,
  };
  const jar = await cookies();
  jar.set(
    OTP_COOKIE,
    signPayload(getAuthSecret(), JSON.stringify(record)),
    cookieOptions(Math.floor(OTP_TTL_MS / 1000)),
  );
}

async function readOtpRecord(): Promise<OtpRecord | null> {
  const jar = await cookies();
  const token = jar.get(OTP_COOKIE)?.value;
  if (!token) return null;
  const raw = verifySignedPayload(getAuthSecret(), token);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OtpRecord;
  } catch {
    return null;
  }
}

export async function clearOtp(): Promise<void> {
  const jar = await cookies();
  jar.set(OTP_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
}

export async function verifyOtp(
  phone: string,
  otp: string,
): Promise<{ firstName?: string; lastName?: string }> {
  const record = await readOtpRecord();
  if (!record || record.phone !== phone || record.exp < Date.now()) {
    throw new AuthError("Code expired. Request a new one.", 400, "otp_expired");
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    await clearOtp();
    throw new AuthError("Too many attempts. Request a new code.", 429, "otp_locked");
  }

  const expected = hashOtp(otp, getAuthSecret());
  if (expected !== record.hash) {
    record.attempts += 1;
    const jar = await cookies();
    jar.set(
      OTP_COOKIE,
      signPayload(getAuthSecret(), JSON.stringify(record)),
      cookieOptions(Math.max(1, Math.floor((record.exp - Date.now()) / 1000))),
    );
    throw new AuthError("Invalid verification code", 400, "invalid_otp");
  }

  await clearOtp();
  return { firstName: record.firstName, lastName: record.lastName };
}

export function oauthNonce(): string {
  return randomToken(16);
}
