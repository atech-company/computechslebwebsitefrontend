import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Separator } from "@/components/ui/separator";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tMeta = await getTranslations("meta");
  const year = new Date().getFullYear();

  const serviceLinks = [
    { href: "/shipping" as const, label: t("shipping") },
    { href: "/warranty" as const, label: t("warranty") },
    { href: "/returns" as const, label: t("returns") },
    { href: "/privacy" as const, label: t("privacy") },
    { href: "/terms" as const, label: t("terms") },
  ];

  const exploreLinks = [
    { href: "/shop" as const, label: tNav("shop") },
    { href: "/deals" as const, label: tNav("deals") },
    { href: "/brands" as const, label: tNav("brands") },
    { href: "/about" as const, label: tNav("about") },
    { href: "/contact" as const, label: tNav("contact") },
  ];

  return (
    <footer className="content-auto-section mt-auto border-t border-slate-200 bg-[#0B1120] text-slate-300 dark:border-slate-800">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-4">
          <Link
            href="/"
            className="inline-block text-lg font-bold tracking-[0.2em] text-white"
          >
            COMPUTECHS
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            {t("aboutText")}
          </p>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#06B6D4]">
            {t("about")}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-slate-400 transition hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#06B6D4]">
            {t("customerService")}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {serviceLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-slate-400 transition hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#06B6D4]">
            {t("newsletter")}
          </h3>
          <p className="mt-4 text-sm text-slate-400">{tMeta("tagline")}</p>
          <form className="mt-4 flex flex-col gap-2 sm:flex-row" action="#">
            <input
              type="email"
              name="email"
              required
              placeholder={t("newsletterPlaceholder")}
              className="h-11 flex-1 rounded-xl border border-slate-700 bg-slate-900/60 px-3 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06B6D4]/50"
            />
            <button
              type="submit"
              className="h-11 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white transition hover:bg-[#2563EB]/90"
            >
              {t("subscribe")}
            </button>
          </form>
        </div>
      </div>

      <Separator className="bg-slate-800" />

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
        <p>
          © {year} {tMeta("siteName")}. {t("rights")}
        </p>
        <p className="text-[#06B6D4]/80">Lebanon · Premium electronics</p>
      </div>
    </footer>
  );
}
