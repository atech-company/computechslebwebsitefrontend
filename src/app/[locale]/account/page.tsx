import { getTranslations, setRequestLocale } from "next-intl/server";
import { AccountShell } from "@/components/account/account-shell";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth/session";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("overview") };
}

export default async function AccountOverviewPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");
  const user = await getSessionUser();

  return (
    <AccountShell title={t("overview")} user={user}>
      <div className="space-y-6">
        <p className="text-muted">
          {user ? t("overviewBodySignedIn") : t("overviewBody")}
        </p>
        {user ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-border p-4">
              <dt className="text-muted">{t("email")}</dt>
              <dd className="mt-1 font-medium">{user.email}</dd>
            </div>
            <div className="rounded-xl border border-border p-4">
              <dt className="text-muted">{t("phone")}</dt>
              <dd className="mt-1 font-medium">{user.phone || "—"}</dd>
            </div>
          </dl>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild variant="outline">
              <Link href="/account/login">{t("login")}</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/account/register">{t("register")}</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/wishlist">{t("wishlist")}</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/checkout">{t("guestCheckout")}</Link>
            </Button>
          </div>
        )}
      </div>
    </AccountShell>
  );
}
