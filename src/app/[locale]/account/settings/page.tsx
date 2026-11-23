import { getTranslations, setRequestLocale } from "next-intl/server";
import { AccountShell } from "@/components/account/account-shell";
import { getSessionUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("settings") };
}

export default async function AccountSettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");
  const user = await getSessionUser();

  return (
    <AccountShell title={t("settings")} user={user}>
      <form className="max-w-md space-y-4">
        <p className="text-sm text-muted">{t("formsDeferred")}</p>
        <div className="space-y-1.5">
          <Label htmlFor="settings-email">{t("email")}</Label>
          <Input
            id="settings-email"
            type="email"
            defaultValue={user?.email || ""}
            disabled
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="settings-phone">{t("phone")}</Label>
          <Input
            id="settings-phone"
            type="tel"
            defaultValue={user?.phone || ""}
            disabled
          />
        </div>
        <Button type="submit" disabled>
          {t("saveSettings")}
        </Button>
      </form>
    </AccountShell>
  );
}
