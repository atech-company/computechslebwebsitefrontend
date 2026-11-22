import { describe, expect, it } from "vitest";
import { parseWooErrorBody } from "@/lib/woocommerce/errors";

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
});
