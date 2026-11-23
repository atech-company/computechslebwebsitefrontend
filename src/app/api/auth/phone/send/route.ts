import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api-response";
import { phoneDevOtpEnabled } from "@/lib/auth/config";
import { AuthError } from "@/lib/auth/errors";
import { generateOtp, storeOtp } from "@/lib/auth/otp";
import { normalizePhone } from "@/lib/auth/phone";
import { clientIp, rateLimit } from "@/lib/auth/rate-limit";
import { assertCustomerApiReady } from "@/lib/auth/request";
import { sendOtpSms } from "@/lib/auth/sms";

const schema = z.object({
  phone: z.string().min(6).max(24),
  firstName: z.string().trim().max(80).optional(),
  lastName: z.string().trim().max(80).optional(),
});

export async function POST(request: Request) {
  try {
    assertCustomerApiReady();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      throw new AuthError("Enter a valid phone number", 400, "validation_error");
    }
    const phone = normalizePhone(parsed.data.phone);
    const ipLimit = rateLimit(`otp-ip:${clientIp(request)}`, 8, 15 * 60 * 1000);
    const phoneLimit = rateLimit(`otp-phone:${phone}`, 5, 15 * 60 * 1000);
    if (!ipLimit.ok || !phoneLimit.ok) {
      throw new AuthError("Too many codes requested. Try again later.", 429, "rate_limited");
    }

    const otp = generateOtp();
    await storeOtp({
      phone,
      otp,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
    });
    await sendOtpSms(phone, otp);

    return jsonOk({
      ok: true,
      phone,
      devOtp: phoneDevOtpEnabled() ? otp : undefined,
    });
  } catch (error) {
    return jsonError(error);
  }
}
