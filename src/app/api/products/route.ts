import { getProducts } from "@/lib/woocommerce/products";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const include = searchParams.get("include");
    const search = searchParams.get("q") || undefined;
    const page = Number(searchParams.get("page") || "1");
    const perPage = Number(searchParams.get("per_page") || "12");
    const category = searchParams.get("category") || undefined;
    const onSale = searchParams.get("on_sale") === "true";
    const orderby = (searchParams.get("orderby") as
      | "date"
      | "price"
      | "popularity"
      | "rating"
      | "title"
      | "menu_order"
      | null) || undefined;
    const order = (searchParams.get("order") as "asc" | "desc" | null) || undefined;

    const result = await getProducts({
      page,
      perPage,
      search,
      category,
      onSale: searchParams.has("on_sale") ? onSale : undefined,
      orderby,
      order,
      include: include
        ? include
            .split(",")
            .map((x) => Number(x))
            .filter(Boolean)
        : undefined,
      fresh: searchParams.get("fresh") === "1",
    });

    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
