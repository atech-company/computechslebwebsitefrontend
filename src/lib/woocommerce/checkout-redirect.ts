export const WP_CHECKOUT_FALLBACK =
  "https://wp.computechsleb.com/checkout/";

const WP_CHECKOUT_ORIGIN = new URL(WP_CHECKOUT_FALLBACK).origin;

export function isWooCommerceOrderReceivedUrl(
  redirectUrl: string | undefined,
): boolean {
  if (!redirectUrl) return false;

  try {
    const url = new URL(redirectUrl);
    return (
      url.origin === WP_CHECKOUT_ORIGIN &&
      /\/checkout\/order-received\/\d+\/?$/.test(url.pathname)
    );
  } catch {
    return false;
  }
}
