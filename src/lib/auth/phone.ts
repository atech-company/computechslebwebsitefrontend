import { AuthError } from "@/lib/auth/errors";

export function normalizePhone(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new AuthError("Enter a phone number", 400, "invalid_phone");
  }

  const plus = trimmed.startsWith("+");
  let digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);

  if (plus && !digits.startsWith("961")) {
    if (digits.length < 8 || digits.length > 15) {
      throw new AuthError("Enter a valid phone number", 400, "invalid_phone");
    }
    return `+${digits}`;
  }

  if (digits.startsWith("961")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length < 7 || digits.length > 8) {
    throw new AuthError(
      "Enter a valid Lebanese mobile number",
      400,
      "invalid_phone",
    );
  }
  return `+961${digits}`;
}

export function phoneUsername(phone: string): string {
  return `p${phone.replace(/\D/g, "")}`;
}

export function phonePlaceholderEmail(phone: string): string {
  return `${phoneUsername(phone)}@phone.computechsleb.com`;
}
