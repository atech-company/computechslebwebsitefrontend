import { z } from "zod";
import { getCheckout, submitCheckout } from "@/lib/woocommerce/cart";
import { jsonError, jsonOk } from "@/lib/api-response";

const submitSchema = z.object({
  billing_address: z.record(z.string(), z.string()),
  shipping_address: z.record(z.string(), z.string()),
  customer_note: z.string().optional(),
  payment_method: z.string().min(1),
});

export async function GET() {
  try {
    const checkout = await getCheckout();
    return jsonOk(checkout);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = submitSchema.parse(await request.json());
    const checkout = await submitCheckout(body);
    return jsonOk(checkout);
  } catch (error) {
    return jsonError(error);
  }
}
