import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(
  amountMinor: string | number,
  minorUnit: number,
  currencyCode: string,
  locale = "en-US",
): string {
  const value =
    typeof amountMinor === "string"
      ? Number.parseInt(amountMinor, 10)
      : amountMinor;
  const amount = value / 10 ** minorUnit;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function discountPercent(
  regularMinor: string | number,
  saleMinor: string | number,
): number | null {
  const regular =
    typeof regularMinor === "string"
      ? Number.parseInt(regularMinor, 10)
      : regularMinor;
  const sale =
    typeof saleMinor === "string" ? Number.parseInt(saleMinor, 10) : saleMinor;
  if (!regular || sale >= regular) return null;
  return Math.round(((regular - sale) / regular) * 100);
}

export function decodeHtmlEntities(value: string): string {
  const namedEntities: Record<string, string> = {
    amp: "&",
    quot: '"',
    apos: "'",
    nbsp: " ",
    ndash: "–",
    mdash: "—",
    trade: "™",
    reg: "®",
    Prime: "″",
  };

  return value
    .replace(/&#(x?[0-9a-f]+);/gi, (_, code: string) => {
      const radix = code.toLowerCase().startsWith("x") ? 16 : 10;
      const parsed = Number.parseInt(code.replace(/^x/i, ""), radix);
      return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : "";
    })
    .replace(
      /&([a-z]+);/gi,
      (entity, name: string) => namedEntities[name] ?? entity,
    );
}

export function stripHtml(html: string): string {
  return decodeHtmlEntities(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatProductDisplayName(value: string): string {
  return decodeHtmlEntities(value)
    .replace(/\)(?=\d)/g, ") ")
    .replace(/(\d\s*GB)(?=\d)/gi, "$1 ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getProductHeadline(value: string): string {
  const displayName = formatProductDisplayName(value);
  const specMarkers = [
    /\s+RAM\s+\d/i,
    /\s+\d{1,3}\s*GB\b/i,
    /\s+\d+(?:\.\d+)?\s*(?:TB|GB)\s*(?:NVMe|SSD|HDD)\b/i,
  ];
  const indices = specMarkers
    .map((pattern) => displayName.search(pattern))
    .filter((index) => index >= 20);

  if (!indices.length) return displayName;
  return displayName.slice(0, Math.min(...indices)).replace(/[\s–—|-]+$/, "").trim();
}
