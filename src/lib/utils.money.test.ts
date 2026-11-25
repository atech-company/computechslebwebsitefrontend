import { describe, expect, it } from "vitest";
import { formatMoney, toMinorUnits } from "@/lib/utils";

describe("money helpers", () => {
  it("rounds major amounts into integer minor units", () => {
    expect(toMinorUnits(410, 2)).toBe(41000);
    expect(toMinorUnits(410.1, 2)).toBe(41010);
    expect(toMinorUnits(19.99, 2)).toBe(1999);
  });

  it("formats quantity totals without float drift", () => {
    const unit = toMinorUnits(410, 2);
    expect(formatMoney(unit * 3, 2, "USD")).toBe("$1,230.00");
  });
});
