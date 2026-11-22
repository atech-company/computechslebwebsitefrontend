import { searchSuggestions } from "@/lib/woocommerce/products";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";
    const result = await searchSuggestions(q);
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
