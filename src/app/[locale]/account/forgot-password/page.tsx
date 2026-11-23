import { getTranslations, setRequestLocale } from "next-intl/server";
import { AccountShell } from "@/components/account/account-shell";
import { getSessionUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("forgotPassword") };
}

export default async function ForgotPasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");
  const user = await getSessionUser();

  return (
    <AccountShell title={t("forgotPassword")} user={user}>
      <form className="mx-auto max-w-md space-y-4">
        <p className="text-sm text-muted">{t("formsDeferred")}</p>
        <div className="space-y-1.5">
          <Label htmlFor="forgot-email">{t("email")}</Label>
          <Input id="forgot-email" type="email" autoComplete="email" disabled />
        </div>
        <Button type="submit" className="w-full" disabled>
          {t("sendReset")}
        </Button>
        <p className="text-center text-sm">
          <Link href="/account/login" className="text-blue-600 hover:underline">
            {t("login")}
          </Link>
        </p>
      </form>
    </AccountShell>
  );
}
