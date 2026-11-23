import { describe, expect, it } from "vitest";
import {
  isScheduleActive,
  matchesDevice,
  matchesPath,
  normalizePathname,
  resolveCampaignEnabled,
  sponsorCampaign,
} from "@/lib/sponsor-popup";

describe("sponsor popup targeting", () => {
  it("strips locale prefixes", () => {
    expect(normalizePathname("/en")).toBe("/");
    expect(normalizePathname("/ar/shop")).toBe("/shop");
  });

  it("hides on excluded checkout routes", () => {
    expect(matchesPath(sponsorCampaign, "/en/checkout")).toBe(false);
    expect(matchesPath(sponsorCampaign, "/en/shop")).toBe(true);
  });

  it("respects schedule windows", () => {
    expect(
      isScheduleActive({
        ...sponsorCampaign,
        startAt: "2099-01-01T00:00:00.000Z",
        endAt: null,
      }),
    ).toBe(false);
    expect(
      isScheduleActive({
        ...sponsorCampaign,
        startAt: null,
        endAt: "2000-01-01T00:00:00.000Z",
      }),
    ).toBe(false);
    expect(isScheduleActive(sponsorCampaign)).toBe(true);
  });

  it("classifies devices", () => {
    expect(matchesDevice(sponsorCampaign, 390)).toBe(true);
    expect(
      matchesDevice({ ...sponsorCampaign, devices: ["desktop"] }, 390),
    ).toBe(false);
  });

  it("lets env override JSON for instant on/off", () => {
    expect(
      resolveCampaignEnabled({ jsonEnabled: true, envFlag: "off" }),
    ).toBe(false);
    expect(
      resolveCampaignEnabled({ jsonEnabled: false, envFlag: "on" }),
    ).toBe(true);
    expect(resolveCampaignEnabled({ jsonEnabled: true })).toBe(true);
  });
});
