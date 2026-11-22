"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import type { MegaMenuCategory } from "@/components/layout/mega-menu";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface MobileNavProps {
  categories: MegaMenuCategory[];
}

export function MobileNav({ categories }: MobileNavProps) {
  const t = useTranslations("nav");
  const open = useUiStore((s) => s.mobileNavOpen);
  const setOpen = useUiStore((s) => s.setMobileNavOpen);
  const [expanded, setExpanded] = useState<number | null>(null);

  const { parents, childrenByParent } = useMemo(() => {
    const parents = categories
      .filter((c) => c.parent === 0)
      .sort((a, b) => a.name.localeCompare(b.name));
    const childrenByParent = new Map<number, MegaMenuCategory[]>();
    for (const cat of categories) {
      if (cat.parent === 0) continue;
      const list = childrenByParent.get(cat.parent) ?? [];
      list.push(cat);
      childrenByParent.set(cat.parent, list);
    }
    for (const [, list] of childrenByParent) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return { parents, childrenByParent };
  }, [categories]);

  function close() {
    setOpen(false);
    setExpanded(null);
  }

  const mainLinks = [
    { href: "/shop" as const, label: t("shop") },
    { href: "/deals" as const, label: t("deals") },
    { href: "/brands" as const, label: t("brands") },
    { href: "/about" as const, label: t("about") },
    { href: "/contact" as const, label: t("contact") },
  ];

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setExpanded(null);
      }}
    >
      <SheetContent side="left" className="w-[min(100%,22rem)] gap-0 p-0">
        <SheetHeader className="border-b border-slate-200 px-5 py-4 text-left dark:border-slate-700">
          <SheetTitle className="tracking-[0.18em] text-[#0B1120] dark:text-white">
            COMPUTECHS
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav aria-label={t("menu")}>
            <ul className="space-y-1">
              {mainLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={close}
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {parents.length > 0 ? (
              <div className="mt-6">
                <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t("shop")}
                </p>
                <ul className="space-y-1">
                  {parents.map((parent) => {
                    const kids = childrenByParent.get(parent.id) ?? [];
                    const isOpen = expanded === parent.id;

                    return (
                      <li key={parent.id} className="rounded-xl">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/category/${parent.slug}`}
                            onClick={close}
                            className="min-w-0 flex-1 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
                          >
                            {parent.name}
                          </Link>
                          {kids.length > 0 ? (
                            <button
                              type="button"
                              aria-expanded={isOpen}
                              aria-label={parent.name}
                              onClick={() =>
                                setExpanded(isOpen ? null : parent.id)
                              }
                              className="mr-1 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 transition-transform",
                                  isOpen && "rotate-180",
                                )}
                              />
                            </button>
                          ) : null}
                        </div>
                        {isOpen && kids.length > 0 ? (
                          <ul className="mb-2 ml-3 space-y-0.5 border-l border-slate-200 pl-3 dark:border-slate-700">
                            {kids.map((child) => (
                              <li key={child.id}>
                                <Link
                                  href={`/category/${child.slug}`}
                                  onClick={close}
                                  className="block rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-[#2563EB] dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                  {child.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </nav>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-4 dark:border-slate-700">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}
