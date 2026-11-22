import { getCart } from "@/lib/woocommerce/cart";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function GET() {
  try {
    const cart = await getCart();
    return jsonOk(cart);
  } catch (error) {
    return jsonError(error);
  }
}
