import { describe, expect, it } from "vitest";
import { normalizePhone, phonePlaceholderEmail, phoneUsername } from "@/lib/auth/phone";
import { hashPassword, verifyPassword, signPayload, verifySignedPayload } from "@/lib/auth/crypto";

describe("normalizePhone", () => {
  it("normalizes Lebanese local numbers", () => {
    expect(normalizePhone("71 123 456")).toBe("+96171123456");
    expect(normalizePhone("071123456")).toBe("+96171123456");
    expect(normalizePhone("+96171123456")).toBe("+96171123456");
  });

  it("keeps international numbers that already include a country code", () => {
    expect(normalizePhone("+14155552671")).toBe("+14155552671");
  });
});

describe("phone helpers", () => {
  it("builds a stable username and placeholder email", () => {
    expect(phoneUsername("+96171123456")).toBe("p96171123456");
    expect(phonePlaceholderEmail("+96171123456")).toBe(
      "p96171123456@phone.computechsleb.com",
    );
  });
});

describe("password hashing", () => {
  it("verifies a hash of the original password only", () => {
    const stored = hashPassword("secret-pass");
    expect(verifyPassword("secret-pass", stored)).toBe(true);
    expect(verifyPassword("other", stored)).toBe(false);
  });
});

describe("signed payloads", () => {
  it("round-trips a payload with the same secret", () => {
    const token = signPayload("test-secret-key", JSON.stringify({ a: 1 }));
    expect(verifySignedPayload("test-secret-key", token)).toBe('{"a":1}');
    expect(verifySignedPayload("other-secret-key", token)).toBeNull();
  });
});
