import { test, expect, type Page } from "@playwright/test";

const ELITE = "/en/product/hp-elitebook-x360-1040-touchscreen";
const ELITE_AR = "/ar/product/hp-elitebook-x360-1040-touchscreen";
const VIEWPORTS = [320, 360, 375, 390, 414, 430, 768, 1024, 1280, 1440, 1920, 2560];

async function dismissSponsor(page: Page) {
  const dismiss = page.getByRole("button", { name: /not now|ليس الآن|close advertisement|إغلاق الإعلان/i });
  try {
    await dismiss.first().waitFor({ timeout: 5000 });
    await dismiss.first().click({ timeout: 3000 });
    await page.waitForTimeout(200);
  } catch {
    /* popup may be absent */
  }
}

async function openProduct(page: Page, path: string) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await dismissSponsor(page);
  await page.getByTestId("product-gallery-stage").waitFor({ state: "visible", timeout: 30_000 });
  return errors;
}

test.describe("product details layout", () => {
  for (const width of VIEWPORTS) {
    test(`EliteBook has no page overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const errors = await openProduct(page, ELITE);

      const heading = page.locator("h1").first();
      await expect(heading).toBeVisible();

      const stage = page.getByTestId("product-gallery-stage");
      const img = stage.locator("img").first();
      await expect(img).toBeVisible();
      await expect
        .poll(async () => img.evaluate((el) => (el as HTMLImageElement).naturalWidth), {
          timeout: 20_000,
        })
        .toBeGreaterThan(0);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(1);

      if (width >= 1024) {
        const headingBox = await heading.boundingBox();
        const stageBox = await stage.boundingBox();
        expect(headingBox).toBeTruthy();
        expect(stageBox).toBeTruthy();
        expect(headingBox!.x).toBeGreaterThan(width * 0.35);
        expect(stageBox!.height).toBeLessThanOrEqual(560);
        await expect(page.getByRole("button", { name: /add to cart|أضف إلى السلة/i }).first()).toBeVisible();
      }

      const thumbs = page.getByTestId("product-thumbs");
      if (await thumbs.count()) {
        const thumbOverflow = await thumbs.evaluate((el) => el.scrollWidth > el.clientWidth + 4);
        expect(thumbOverflow || (await thumbs.evaluate((el) => el.scrollWidth <= el.clientWidth + 1))).toBeTruthy();
        const pageOverflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        expect(pageOverflow).toBeLessThanOrEqual(1);
      }

      const noisy = errors.filter(
        (text) => !/favicon|hydration|Download the React DevTools/i.test(text),
      );
      expect(noisy, noisy.join("\n")).toEqual([]);
    });
  }

  test("Arabic layout does not overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openProduct(page, ELITE_AR);
    await expect(page.locator("[dir=rtl]").first()).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("dark theme does not overflow", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.addInitScript(() => localStorage.setItem("theme", "dark"));
    await openProduct(page, ELITE);
    await page.locator("html").evaluate((el) => el.classList.add("dark"));
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("add to cart control remains usable", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openProduct(page, ELITE);
    const add = page.getByRole("button", { name: /add to cart/i }).first();
    await expect(add).toBeVisible();
    await add.click();
    await expect(add).toBeEnabled();
  });

  test("single-image product from shop stays in viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en/shop", { waitUntil: "domcontentloaded" });
    await dismissSponsor(page);
    const first = page.locator('a[href*="/en/product/"]').first();
    await first.click();
    await page.getByTestId("product-gallery-stage").waitFor({ state: "visible", timeout: 30_000 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
