import { describe, expect, it } from "vitest";
import {
  isStoreMutationBlocked,
  parseWooErrorBody,
  WooCommerceError,
} from "@/lib/woocommerce/errors";

describe("parseWooErrorBody", () => {
  it("reads message and nested address param errors", () => {
    const parsed = parseWooErrorBody({
      code: "rest_invalid_param",
      message: "Invalid parameter(s): shipping_address",
      data: {
        params: {
          shipping_address: "email is not a valid property of Object.",
        },
        details: {
          shipping_address: {
            message: "email is not a valid property of Object.",
          },
        },
      },
    });
    expect(parsed.code).toBe("rest_invalid_param");
    expect(parsed.message).toContain("shipping_address");
    expect(parsed.message).toContain("email is not a valid property");
  });

  it("reads the first item of a WP error array", () => {
    const parsed = parseWooErrorBody([
      { code: "woocommerce_rest_cart_empty", message: "Cannot create order from empty cart." },
    ]);
    expect(parsed.code).toBe("woocommerce_rest_cart_empty");
    expect(parsed.message).toBe("Cannot create order from empty cart.");
  });

  it("decodes HTML entities in WooCommerce messages", () => {
    const parsed = parseWooErrorBody({
      code: "woocommerce_rest_product_out_of_stock",
      message:
        "You cannot add &quot;MacBook Pro&quot; because it is out of stock.&#x20;",
    });

    expect(parsed.message).toBe(
      'You cannot add "MacBook Pro" because it is out of stock.',
    );
  });
});

describe("isStoreMutationBlocked", () => {
  it("treats Hostinger 403 pages as blocked cart mutations", () => {
    expect(
      isStoreMutationBlocked(
        new WooCommerceError("blocked", 403, "waf_blocked"),
      ),
    ).toBe(true);
  });

  it("treats invalid Store API nonces as blocked", () => {
    expect(
      isStoreMutationBlocked(
        new WooCommerceError("bad nonce", 403, "woocommerce_rest_invalid_nonce"),
      ),
    ).toBe(true);
  });

  it("does not treat a missing product as blocked", () => {
    expect(
      isStoreMutationBlocked(
        new WooCommerceError("missing", 400, "woocommerce_rest_invalid_product"),
      ),
    ).toBe(false);
  });
});
