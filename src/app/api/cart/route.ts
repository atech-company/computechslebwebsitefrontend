import { getCartSafe } from "@/lib/woocommerce/cart";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function GET() {
  try {
    const cart = await getCartSafe();
    return jsonOk(cart);
  } catch (error) {
    return jsonError(error);
  }
}
