"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchTo(next: AppLocale) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-xl border border-slate-200/80 bg-white/50 p-0.5 dark:border-slate-700/80 dark:bg-slate-900/40",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {routing.locales.map((code) => {
        const active = code === locale;
        return (
          <Button
            key={code}
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending}
            aria-pressed={active}
            onClick={() => switchTo(code)}
            className={cn(
              "h-8 min-w-9 px-2 text-xs font-semibold uppercase tracking-wide",
              active
                ? "bg-[#2563EB] text-white hover:bg-[#2563EB]/90 hover:text-white"
                : "text-slate-600 hover:text-[#0B1120] dark:text-slate-300 dark:hover:text-white",
            )}
          >
            {code}
          </Button>
        );
      })}
    </div>
  );
}
