import { z } from "zod";
import { addCartItem } from "@/lib/woocommerce/cart";
import { jsonError, jsonOk } from "@/lib/api-response";

const schema = z.object({
  id: z.number().int().positive(),
  quantity: z.number().int().positive().optional(),
  variation: z
    .array(z.object({ attribute: z.string(), value: z.string() }))
    .optional(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const cart = await addCartItem(body);
    return jsonOk(cart);
  } catch (error) {
    return jsonError(error);
  }
}
