import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { routing, type AppLocale } from "@/i18n/routing";

export async function loadMessages(locale: string) {
  const safeLocale = routing.locales.includes(locale as AppLocale)
    ? locale
    : routing.defaultLocale;
  const raw = await readFile(
    join(process.cwd(), "messages", `${safeLocale}.json`),
    "utf8",
  );
  return JSON.parse(raw) as Record<string, unknown>;
}
