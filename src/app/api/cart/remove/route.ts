import { z } from "zod";
import { removeCartItem } from "@/lib/woocommerce/cart";
import { jsonError, jsonOk } from "@/lib/api-response";

const schema = z.object({ key: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const cart = await removeCartItem(body.key);
    return jsonOk(cart);
  } catch (error) {
    return jsonError(error);
  }
}
