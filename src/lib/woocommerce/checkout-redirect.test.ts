import { describe, expect, it } from "vitest";
import { isWooCommerceOrderReceivedUrl } from "./checkout-redirect";

describe("isWooCommerceOrderReceivedUrl", () => {
  it("recognizes the WooCommerce order confirmation redirect", () => {
    expect(
      isWooCommerceOrderReceivedUrl(
        "https://wp.computechsleb.com/checkout/order-received/21789/?key=wc_order_example",
      ),
    ).toBe(true);
  });

  it("keeps genuine payment gateway redirects", () => {
    expect(
      isWooCommerceOrderReceivedUrl("https://payments.example.com/pay/21789"),
    ).toBe(false);
  });

  it("does not trust lookalike hosts or invalid URLs", () => {
    expect(
      isWooCommerceOrderReceivedUrl(
        "https://wp.computechsleb.com.example/checkout/order-received/21789/",
      ),
    ).toBe(false);
    expect(isWooCommerceOrderReceivedUrl("not-a-url")).toBe(false);
  });
});
