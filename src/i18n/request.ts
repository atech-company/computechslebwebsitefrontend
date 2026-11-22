import { getRequestConfig } from "next-intl/server";
import { loadMessages } from "@/i18n/load-messages";
import { routing, type AppLocale } from "@/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as AppLocale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
