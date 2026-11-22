import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";

export async function POST(request: Request) {
  const secret = getServerEnv().WC_WEBHOOK_SECRET;
  if (secret) {
    const header =
      request.headers.get("x-wc-webhook-signature") ||
      request.headers.get("x-computechs-webhook-secret");
    if (header !== secret) {
      return NextResponse.json({ message: "Invalid webhook secret" }, { status: 401 });
    }
  }

  revalidateTag("products", "max");
  revalidateTag("categories", "max");
  revalidateTag("brands", "max");
  revalidateTag("collection-data", "max");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
