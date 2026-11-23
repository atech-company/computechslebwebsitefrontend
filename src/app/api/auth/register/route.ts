import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api-response";
import { AuthError } from "@/lib/auth/errors";
import { createEmailCustomer, toAuthUser } from "@/lib/auth/customers";
import { clientIp, rateLimit } from "@/lib/auth/rate-limit";
import { assertCustomerApiReady } from "@/lib/auth/request";
import { createSession } from "@/lib/auth/session";

const schema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(190),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  try {
    assertCustomerApiReady();
    const limited = rateLimit(`register:${clientIp(request)}`, 8, 15 * 60 * 1000);
    if (!limited.ok) {
      throw new AuthError("Too many attempts. Try again later.", 429, "rate_limited");
    }
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      throw new AuthError(
        parsed.error.issues[0]?.message || "Invalid registration details",
        400,
        "validation_error",
      );
    }
    const customer = await createEmailCustomer(parsed.data);
    const user = toAuthUser(customer);
    await createSession(user);
    return jsonOk({ user }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
