import { getTranslations, setRequestLocale } from "next-intl/server";
import { AccountShell } from "@/components/account/account-shell";
import { LoginForm } from "@/components/account/login-form";
import { getSessionUser } from "@/lib/auth/session";
import { redirect } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("login") };
}

export default async function AccountLoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");
  const user = await getSessionUser();
  if (user) redirect({ href: "/account", locale });

  return (
    <AccountShell title={t("login")} user={user}>
      <LoginForm />
    </AccountShell>
  );
}
