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

test("Drivo sponsor popup can be previewed", async ({ page }) => {
  await page.goto("/en?sponsorPreview=1");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("heading", { name: "Confirm pickup with confidence" }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("link", { name: /Google Play/i }),
  ).toHaveAttribute(
    "href",
    "https://play.google.com/store/apps/details?id=com.drivo.mobile&pli=1",
  );
  await expect(dialog.getByRole("link", { name: /drivo.tech/i })).toHaveAttribute(
    "href",
    "https://drivo.tech/",
  );
});

test("register page offers email and phone signup", async ({ page }) => {
  await page.goto("/en/account/register");
  await expect(
    page.getByRole("heading", { name: "Create account" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Continue with Google" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Send phone code" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
});
