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
  return { title: t("addresses") };
}

export default async function AccountAddressesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");
  const user = await getSessionUser();

  return (
    <AccountShell title={t("addresses")} user={user}>
      <form className="max-w-xl space-y-4">
        <p className="text-sm text-muted">{t("formsDeferred")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("firstName")}</Label>
            <Input disabled />
          </div>
          <div className="space-y-1.5">
            <Label>{t("lastName")}</Label>
            <Input disabled />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>{t("address")}</Label>
          <Input disabled />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("city")}</Label>
            <Input disabled />
          </div>
          <div className="space-y-1.5">
            <Label>{t("country")}</Label>
            <Input defaultValue="LB" disabled />
          </div>
        </div>
        <Button type="submit" disabled>
          {t("saveAddress")}
        </Button>
      </form>
    </AccountShell>
  );
}
