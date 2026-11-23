import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api-response";
import { AuthError } from "@/lib/auth/errors";
import { authenticateEmail, toAuthUser } from "@/lib/auth/customers";
import { clientIp, rateLimit } from "@/lib/auth/rate-limit";
import { assertCustomerApiReady } from "@/lib/auth/request";
import { createSession } from "@/lib/auth/session";

const schema = z.object({
  email: z.string().trim().email().max(190),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  try {
    assertCustomerApiReady();
    const limited = rateLimit(`login:${clientIp(request)}`, 12, 15 * 60 * 1000);
    if (!limited.ok) {
      throw new AuthError("Too many attempts. Try again later.", 429, "rate_limited");
    }
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      throw new AuthError("Invalid email or password", 400, "validation_error");
    }
    const customer = await authenticateEmail(parsed.data.email, parsed.data.password);
    const user = toAuthUser(customer);
    await createSession(user);
    return jsonOk({ user });
  } catch (error) {
    return jsonError(error);
  }
}
