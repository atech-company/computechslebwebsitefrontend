import { phoneDevOtpEnabled, twilioConfigured } from "@/lib/auth/config";
import { AuthError } from "@/lib/auth/errors";
import { getServerEnv } from "@/lib/env";

export async function sendOtpSms(phone: string, otp: string): Promise<void> {
  if (!twilioConfigured()) {
    if (phoneDevOtpEnabled()) return;
    throw new AuthError(
      "Phone verification is not configured. Add Twilio credentials.",
      503,
      "sms_not_configured",
    );
  }

  const env = getServerEnv();
  const sid = env.AUTH_TWILIO_ACCOUNT_SID.trim();
  const auth = Buffer.from(
    `${sid}:${env.AUTH_TWILIO_AUTH_TOKEN.trim()}`,
  ).toString("base64");

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: phone,
        From: env.AUTH_TWILIO_FROM.trim(),
        Body: `Your Computechs verification code is ${otp}`,
      }),
    },
  );

  if (!response.ok) {
    throw new AuthError(
      "Could not send the verification SMS. Try again.",
      502,
      "sms_failed",
    );
  }
}
