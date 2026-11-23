import { test, expect } from "@playwright/test";

test("homepage shows Computechs branding", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByText("COMPUTECHS").first()).toBeVisible();
});

test("homepage hero carousel changes campaigns", async ({ page }) => {
  await page.goto("/en");
  const carousel = page.getByRole("region", { name: "Featured campaigns" });

  await expect(
    carousel.getByRole("heading", {
      name: "Performance that keeps up with your game",
    }),
  ).toBeVisible();
  await carousel.getByRole("button", { name: /Go to slide 2:/ }).click();
  await expect(
    carousel.getByRole("heading", { name: "One device. Every mode." }),
  ).toBeVisible();
});

test("shop page loads", async ({ page }) => {
  await page.goto("/en/shop");
  await expect(page.getByRole("heading", { name: "Shop" })).toBeVisible();
});
