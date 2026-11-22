import { z } from "zod";
import { updateCartItem } from "@/lib/woocommerce/cart";
import { jsonError, jsonOk } from "@/lib/api-response";

const schema = z.object({
  key: z.string().min(1),
  quantity: z.number().int().min(0),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const cart = await updateCartItem(body);
    return jsonOk(cart);
  } catch (error) {
    return jsonError(error);
  }
}
