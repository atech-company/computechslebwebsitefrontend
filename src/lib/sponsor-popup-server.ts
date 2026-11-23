import "server-only";

import { getServerEnv } from "@/lib/env";
import {
  isScheduleActive,
  matchesLocale,
  resolveCampaignEnabled,
  sponsorCampaign,
  type SponsorCampaign,
} from "@/lib/sponsor-popup";

export function getActiveSponsorCampaign(
  locale: string,
): SponsorCampaign | null {
  const envFlag = getServerEnv().SPONSOR_POPUP_ENABLED;
  if (
    !resolveCampaignEnabled({
      jsonEnabled: sponsorCampaign.enabled,
      envFlag,
    })
  ) {
    return null;
  }
  if (!isScheduleActive(sponsorCampaign)) return null;
  if (!matchesLocale(sponsorCampaign, locale)) return null;
  return sponsorCampaign;
}
