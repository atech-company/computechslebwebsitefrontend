import { describe, expect, it } from "vitest";
import { isCampaignLive, mapCampaignSlides } from "@/lib/homepage/hero-slides";

describe("hero campaigns", () => {
  it("hides disabled and out-of-window slides, then sorts by order", () => {
    const now = Date.parse("2026-06-01T00:00:00.000Z");
    const { slides } = mapCampaignSlides(
      {
        slides: [
          {
            id: "later",
            order: 2,
            title: "Later",
            href: "/shop",
            desktopImage: "/a.webp",
            startAt: "2026-07-01T00:00:00.000Z",
          },
          {
            id: "second",
            order: 2,
            title: "Second",
            href: "/deals",
            desktopImage: "/b.webp",
          },
          {
            id: "first",
            order: 1,
            title: "First",
            titleAr: "أول",
            href: "/shop",
            desktopImage: "/c.webp",
            mobileImage: "/c-mobile.webp",
          },
          {
            id: "off",
            enabled: false,
            order: 0,
            title: "Off",
            href: "/shop",
            desktopImage: "/d.webp",
          },
        ],
      },
      "en",
      now,
    );
    expect(slides.map((slide) => slide.id)).toEqual(["first", "second"]);
    expect(slides[0]?.mobileImage).toBe("/c-mobile.webp");
  });

  it("uses Arabic copy when the locale is ar", () => {
    const { slides } = mapCampaignSlides(
      {
        slides: [
          {
            title: "English",
            titleAr: "عربي",
            href: "/shop",
            desktopImage: "/a.webp",
          },
        ],
      },
      "ar",
    );
    expect(slides[0]?.title).toBe("عربي");
  });

  it("treats a missing enabled flag as visible", () => {
    expect(isCampaignLive({})).toBe(true);
    expect(isCampaignLive({ enabled: false })).toBe(false);
  });
});
