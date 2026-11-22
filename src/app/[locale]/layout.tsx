import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { loadMessages } from "@/i18n/load-messages";
import { routing } from "@/i18n/routing";
import { AppProviders } from "@/components/providers/app-providers";
import { SiteShell } from "@/components/layout/site-shell";
import { getCategories } from "@/lib/woocommerce/products";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = await loadMessages(locale);
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  try {
    categories = await getCategories({ hideEmpty: true });
  } catch {
    categories = [];
  }

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AppProviders>
        <div lang={locale} dir={dir} className={locale === "ar" ? "font-[family-name:var(--font-arabic)]" : undefined}>
          <SiteShell categories={categories} locale={locale}>
            {children}
          </SiteShell>
        </div>
      </AppProviders>
    </NextIntlClientProvider>
  );
}
