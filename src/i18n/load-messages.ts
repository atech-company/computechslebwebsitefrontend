import "server-only";
import arMessages from "../../messages/ar.json";
import enMessages from "../../messages/en.json";
import { routing, type AppLocale } from "@/i18n/routing";

const messagesByLocale: Record<AppLocale, Record<string, unknown>> = {
  ar: arMessages,
  en: enMessages,
};

export async function loadMessages(locale: string) {
  const safeLocale = routing.locales.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : routing.defaultLocale;
  return messagesByLocale[safeLocale];
}
