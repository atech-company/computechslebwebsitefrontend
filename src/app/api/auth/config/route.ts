import { publicAuthConfig } from "@/lib/auth/config";
import { jsonOk } from "@/lib/api-response";

export async function GET() {
  return jsonOk(publicAuthConfig());
}
