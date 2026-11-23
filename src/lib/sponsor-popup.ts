import campaignJson from "../../content/sponsor-popup.json";

export type SponsorDevice = "mobile" | "tablet" | "desktop";
export type SponsorLocale = "en" | "ar";

export type SponsorCopy = {
  badge: string;
  title: string;
  body: string;
  highlights: string[];
  playCta: string;
  siteCta: string;
  dismiss: string;
  close: string;
  imageAlt: string;
};

export type SponsorCampaign = {
  id: string;
  enabled: boolean;
  startAt: string | null;
  endAt: string | null;
  delayMs: number;
  frequencyMode: "every_visit" | "session" | "days";
  frequencyDays: number;
  locales: SponsorLocale[];
  devices: SponsorDevice[];
  includePaths: string[];
  excludePaths: string[];
  appearance: {
    accent: string;
    accentSoft: string;
    navy: string;
    surface: string;
  };
  image: string;
  playUrl: string;
  siteUrl: string;
  copy: Record<SponsorLocale, SponsorCopy>;
};

export const sponsorCampaign = campaignJson as SponsorCampaign;

export function isScheduleActive(
  campaign: SponsorCampaign,
  now = Date.now(),
): boolean {
  if (campaign.startAt) {
    const start = Date.parse(campaign.startAt);
    if (!Number.isNaN(start) && now < start) return false;
  }
  if (campaign.endAt) {
    const end = Date.parse(campaign.endAt);
    if (!Number.isNaN(end) && now > end) return false;
  }
  return true;
}

export function normalizePathname(pathname: string): string {
  const stripped = pathname.replace(/^\/(en|ar)(?=\/|$)/, "") || "/";
  return stripped.startsWith("/") ? stripped : `/${stripped}`;
}

export function matchesPath(
  campaign: SponsorCampaign,
  pathname: string,
): boolean {
  const path = normalizePathname(pathname);
  if (campaign.excludePaths.some((rule) => pathMatches(path, rule))) {
    return false;
  }
  if (campaign.includePaths.length === 0) return true;
  return campaign.includePaths.some((rule) => pathMatches(path, rule));
}

function pathMatches(path: string, rule: string): boolean {
  if (rule.endsWith("*")) {
    const prefix = rule.slice(0, -1);
    return path === prefix.replace(/\/$/, "") || path.startsWith(prefix);
  }
  return path === rule || path.startsWith(`${rule}/`);
}

export function deviceFromWidth(width: number): SponsorDevice {
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function matchesDevice(
  campaign: SponsorCampaign,
  width: number,
): boolean {
  return campaign.devices.includes(deviceFromWidth(width));
}

export function matchesLocale(
  campaign: SponsorCampaign,
  locale: string,
): boolean {
  return campaign.locales.includes(locale as SponsorLocale);
}

export function parseEnabledFlag(value: string | undefined): boolean | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (["false", "0", "off", "disabled"].includes(normalized)) return false;
  if (["true", "1", "on", "enabled"].includes(normalized)) return true;
  return null;
}

export function resolveCampaignEnabled(options: {
  jsonEnabled: boolean;
  envFlag?: string;
}): boolean {
  const env = parseEnabledFlag(options.envFlag);
  if (env === false) return false;
  if (env === true) return true;
  return options.jsonEnabled;
}
