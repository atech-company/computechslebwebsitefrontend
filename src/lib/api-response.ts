import { NextResponse } from "next/server";
import { isAuthError } from "@/lib/auth/errors";
import { isWooCommerceError } from "@/lib/woocommerce/errors";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function jsonError(error: unknown) {
  if (isAuthError(error)) {
    return NextResponse.json(
      { message: error.message, code: error.code },
      { status: error.status },
    );
  }
  if (isWooCommerceError(error)) {
    return NextResponse.json(
      { message: error.message, code: error.code, details: error.details },
      { status: error.status || 500 },
    );
  }
  return NextResponse.json(
    {
      message:
        error instanceof Error ? error.message : "Unexpected server error",
    },
    { status: 500 },
  );
}
