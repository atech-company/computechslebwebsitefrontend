import { test, expect } from "@playwright/test";

test("homepage shows Computechs branding", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByText("COMPUTECHS").first()).toBeVisible();
});

test("shop page loads", async ({ page }) => {
  await page.goto("/en/shop");
  await expect(page.getByRole("heading", { name: "Shop" })).toBeVisible();
});
