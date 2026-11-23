import { getServerEnv } from "@/lib/env";

export function getAuthSecret(): string {
  const secret = getServerEnv().AUTH_SECRET.trim();
  if (secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set to a string of at least 16 characters");
  }
  return "computechs-dev-auth-secret-change-me";
}

export function googleOAuthConfigured(): boolean {
  const env = getServerEnv();
  return Boolean(
    env.AUTH_GOOGLE_CLIENT_ID.trim() && env.AUTH_GOOGLE_CLIENT_SECRET.trim(),
  );
}

export function twilioConfigured(): boolean {
  const env = getServerEnv();
  return Boolean(
    env.AUTH_TWILIO_ACCOUNT_SID.trim() &&
      env.AUTH_TWILIO_AUTH_TOKEN.trim() &&
      env.AUTH_TWILIO_FROM.trim(),
  );
}

export function phoneDevOtpEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && !twilioConfigured();
}

export function publicAuthConfig() {
  return {
    google: googleOAuthConfigured(),
    phone: true,
    phoneSms: twilioConfigured(),
    phoneDevOtp: phoneDevOtpEnabled(),
  };
}
