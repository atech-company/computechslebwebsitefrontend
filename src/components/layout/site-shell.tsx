import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import type { StoreCategory } from "@/types/woocommerce";

export function SiteShell({
  children,
  categories,
}: {
  children: React.ReactNode;
  categories: StoreCategory[];
  locale?: string;
}) {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader categories={categories} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CartDrawer />
    </>
  );
}
