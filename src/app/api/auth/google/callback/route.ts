import { NextResponse } from "next/server";
import { upsertGoogleCustomer, toAuthUser } from "@/lib/auth/customers";
import { exchangeGoogleCode } from "@/lib/auth/google";
import { consumeOAuthState } from "@/lib/auth/request";
import { createSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  let locale = "en";
  try {
    const error = url.searchParams.get("error");
    if (error) {
      return NextResponse.redirect(
        new URL(`/${locale}/account/register?error=google`, url.origin),
      );
    }
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state) {
      return NextResponse.redirect(
        new URL(`/${locale}/account/register?error=google`, url.origin),
      );
    }
    const consumed = await consumeOAuthState(state);
    locale = consumed.locale;
    const profile = await exchangeGoogleCode({ origin: url.origin, code });
    const customer = await upsertGoogleCustomer(profile);
    await createSession(toAuthUser(customer));
    return NextResponse.redirect(new URL(`/${locale}/account`, url.origin));
  } catch {
    return NextResponse.redirect(
      new URL(`/${locale}/account/register?error=google`, url.origin),
    );
  }
}
