import { getTranslations, setRequestLocale } from "next-intl/server";
import { AccountShell } from "@/components/account/account-shell";
import { RegisterForm } from "@/components/account/register-form";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("register") };
}

export default async function AccountRegisterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");

  return (
    <AccountShell title={t("register")}>
      <RegisterForm />
    </AccountShell>
  );
}
