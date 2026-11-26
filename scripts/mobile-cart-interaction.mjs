import { chromium } from "playwright";

const target = process.argv[2] ?? "http://localhost:3100/en";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});
const page = await context.newPage();
const client = await context.newCDPSession(page);
await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await page.goto(target, { waitUntil: "networkidle", timeout: 60_000 });

const addButton = page.locator('button[aria-label^="Add to cart:"]').first();
await addButton.scrollIntoViewIfNeeded();
const responsePromise = page.waitForResponse(
  (response) => response.url().includes("/api/cart/add"),
  { timeout: 20_000 },
);
const startedAt = performance.now();
await addButton.click();
await page.getByRole("dialog").waitFor({ state: "visible", timeout: 5_000 });
const drawerVisibleMs = performance.now() - startedAt;
const response = await responsePromise;
const apiCompletedMs = performance.now() - startedAt;

console.log(
  JSON.stringify(
    {
      drawerVisibleMs,
      apiCompletedMs,
      apiStatus: response.status(),
    },
    null,
    2,
  ),
);
await browser.close();
