import { z } from "zod";
import { applyCoupon, removeCoupon } from "@/lib/woocommerce/cart";
import { jsonError, jsonOk } from "@/lib/api-response";

const schema = z.object({
  code: z.string().min(1),
  action: z.enum(["apply", "remove"]),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const cart =
      body.action === "apply"
        ? await applyCoupon(body.code)
        : await removeCoupon(body.code);
    return jsonOk(cart);
  } catch (error) {
    return jsonError(error);
  }
}
