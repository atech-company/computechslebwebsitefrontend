import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api-response";
import { toAuthUser, upsertPhoneCustomer } from "@/lib/auth/customers";
import { AuthError } from "@/lib/auth/errors";
import { verifyOtp } from "@/lib/auth/otp";
import { normalizePhone } from "@/lib/auth/phone";
import { clientIp, rateLimit } from "@/lib/auth/rate-limit";
import { assertCustomerApiReady } from "@/lib/auth/request";
import { createSession } from "@/lib/auth/session";

const schema = z.object({
  phone: z.string().min(6).max(24),
  otp: z.string().trim().min(4).max(8),
  firstName: z.string().trim().max(80).optional(),
  lastName: z.string().trim().max(80).optional(),
});

export async function POST(request: Request) {
  try {
    assertCustomerApiReady();
    const limited = rateLimit(`otp-verify:${clientIp(request)}`, 20, 15 * 60 * 1000);
    if (!limited.ok) {
      throw new AuthError("Too many attempts. Try again later.", 429, "rate_limited");
    }
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      throw new AuthError("Invalid verification details", 400, "validation_error");
    }
    const phone = normalizePhone(parsed.data.phone);
    const stored = await verifyOtp(phone, parsed.data.otp);
    const customer = await upsertPhoneCustomer({
      phone,
      firstName: parsed.data.firstName || stored.firstName,
      lastName: parsed.data.lastName || stored.lastName,
    });
    const user = toAuthUser(customer);
    await createSession(user);
    return jsonOk({ user });
  } catch (error) {
    return jsonError(error);
  }
}
