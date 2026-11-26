import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import {
  DeferredCartDrawer,
  DeferredSponsorPopup,
} from "@/components/layout/deferred-overlays";
import type { SponsorCampaign } from "@/lib/sponsor-popup";
import type { StoreCategory } from "@/types/woocommerce";

export function SiteShell({
  children,
  categories,
  locale,
  sponsorCampaign,
}: {
  children: React.ReactNode;
  categories: StoreCategory[];
  locale?: string;
  sponsorCampaign?: SponsorCampaign | null;
}) {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader categories={categories} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <DeferredCartDrawer />
      {sponsorCampaign && locale ? (
        <DeferredSponsorPopup campaign={sponsorCampaign} locale={locale} />
      ) : null}
    </>
  );
}
