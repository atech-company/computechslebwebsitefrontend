"use client";

import { useEffect, useState } from "react";
import {
  GitCompareArrows,
  Heart,
  Menu,
  Search,
  ShoppingCart,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useCompareStore } from "@/stores/compare-store";
import {
  MegaMenu,
  type MegaMenuCategory,
} from "@/components/layout/mega-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchDialog } from "@/components/layout/search-dialog";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { useCartQuery } from "@/hooks/use-cart";
import { useHydrated } from "@/hooks/use-hydrated";

interface SiteHeaderProps {
  categories?: MegaMenuCategory[];
  cartCount?: number;
}

function IconBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#06B6D4] px-1 text-[10px] font-bold text-[#0B1120]">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function SiteHeader({
  categories = [],
  cartCount: cartCountProp,
}: SiteHeaderProps) {
  const t = useTranslations("nav");
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const toggleCartDrawer = useUiStore((s) => s.toggleCartDrawer);
  const wishlistCount = useWishlistStore((s) => s.ids.length);
  const compareCount = useCompareStore((s) => s.ids.length);
  const { data: cart } = useCartQuery();
  const cartCount = cartCountProp ?? cart?.items_count ?? 0;
  const hydrated = useHydrated();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    const frame = window.requestAnimationFrame(onScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const navLinks = [
    { href: "/shop" as const, label: t("shop") },
    { href: "/deals" as const, label: t("deals") },
    { href: "/brands" as const, label: t("brands") },
  ];

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-all duration-300",
          scrolled
            ? "border-slate-200/80 bg-white/80 shadow-sm shadow-[#0B1120]/5 backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#0B1120]/80"
            : "border-transparent bg-white/60 backdrop-blur-md dark:bg-[#0B1120]/50",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:h-[4.25rem] lg:px-8">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={t("menu")}
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link
            href="/"
            className="shrink-0 text-base font-bold tracking-[0.22em] text-[#0B1120] dark:text-white sm:text-lg"
          >
            COMPUTECHS
          </Link>

          <nav className="ml-4 hidden items-center gap-1 md:flex lg:ml-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-[#0B1120] dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t("search")}
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
              aria-label={t("account")}
              asChild
            >
              <Link href="/account">
                <User className="h-5 w-5" />
              </Link>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative hidden sm:inline-flex"
              aria-label={t("wishlist")}
              asChild
            >
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                {hydrated ? <IconBadge count={wishlistCount} /> : null}
              </Link>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative hidden sm:inline-flex"
              aria-label={t("compare")}
              asChild
            >
              <Link href="/compare">
                <GitCompareArrows className="h-5 w-5" />
                {hydrated ? <IconBadge count={compareCount} /> : null}
              </Link>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative"
              aria-label={t("cart")}
              onClick={() => toggleCartDrawer()}
            >
              <ShoppingCart className="h-5 w-5" />
              <IconBadge count={cartCount} />
            </Button>

            <div className="mx-1 hidden h-6 w-px bg-slate-200 dark:bg-slate-700 sm:block" />

            <ThemeToggle className="hidden sm:inline-flex" />
            <LocaleSwitcher className="ml-1 hidden md:inline-flex" />
          </div>
        </div>

        {categories.length > 0 ? (
          <div className="hidden border-t border-slate-200/60 dark:border-slate-800/60 lg:block">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <MegaMenu categories={categories} />
            </div>
          </div>
        ) : null}
      </header>

      <MobileNav categories={categories} />
      <SearchDialog />
    </>
  );
}
