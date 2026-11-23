import { NextResponse } from "next/server";
import { googleAuthorizeUrl } from "@/lib/auth/google";
import { oauthNonce } from "@/lib/auth/otp";
import { writeOAuthState } from "@/lib/auth/request";
import { assertCustomerApiReady } from "@/lib/auth/request";

export async function GET(request: Request) {
  try {
    assertCustomerApiReady();
    const url = new URL(request.url);
    const locale = url.searchParams.get("locale") === "ar" ? "ar" : "en";
    const state = oauthNonce();
    await writeOAuthState({ state, locale });
    const destination = googleAuthorizeUrl({
      origin: url.origin,
      state,
    });
    return NextResponse.redirect(destination);
  } catch {
    const url = new URL(request.url);
    const locale = url.searchParams.get("locale") === "ar" ? "ar" : "en";
    return NextResponse.redirect(
      new URL(`/${locale}/account/register?error=google`, url.origin),
    );
  }
}
