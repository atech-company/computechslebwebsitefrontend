import { getTranslations, setRequestLocale } from "next-intl/server";
import { AccountShell } from "@/components/account/account-shell";
import { getSessionUser } from "@/lib/auth/session";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("orders") };
}

export default async function AccountOrdersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");
  const user = await getSessionUser();

  return (
    <AccountShell title={t("orders")} user={user}>
      <div className="space-y-3">
        <p className="text-muted">{t("ordersEmpty")}</p>
        {!user ? (
          <p className="text-sm text-muted">{t("signInForOrders")}</p>
        ) : null}
      </div>
    </AccountShell>
  );
}
