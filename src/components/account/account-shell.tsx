"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/account" as const, key: "overview" as const },
  { href: "/account/orders" as const, key: "orders" as const },
  { href: "/account/addresses" as const, key: "addresses" as const },
  { href: "/account/settings" as const, key: "settings" as const },
  { href: "/wishlist" as const, key: "wishlist" as const },
  { href: "/account/login" as const, key: "login" as const },
];

export function AccountShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("account");
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-600">
          Computechs
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">{t("authComingSoon")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/account" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                )}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>
        <div className="min-w-0 rounded-2xl border border-border bg-card p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
