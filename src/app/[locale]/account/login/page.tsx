import { getTranslations, setRequestLocale } from "next-intl/server";
import { AccountShell } from "@/components/account/account-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";

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

  return (
    <AccountShell title={t("login")}>
      <form className="mx-auto max-w-md space-y-4">
        <p className="text-sm text-muted">{t("formsDeferred")}</p>
        <div className="space-y-1.5">
          <Label htmlFor="login-email">{t("email")}</Label>
          <Input id="login-email" type="email" autoComplete="email" disabled />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="login-password">{t("password")}</Label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            disabled
          />
        </div>
        <Button type="submit" className="w-full" disabled>
          {t("login")}
        </Button>
        <div className="flex flex-wrap justify-between gap-2 text-sm">
          <Link href="/account/register" className="text-blue-600 hover:underline">
            {t("register")}
          </Link>
          <Link
            href="/account/forgot-password"
            className="text-muted hover:text-foreground"
          >
            {t("forgotPassword")}
          </Link>
        </div>
      </form>
    </AccountShell>
  );
}
