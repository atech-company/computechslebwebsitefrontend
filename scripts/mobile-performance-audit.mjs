import { chromium } from "playwright";

const target = process.argv[2] ?? "http://localhost:3100/en";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent:
    "Mozilla/5.0 (Linux; Android 12; SM-G975F) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36",
});
const page = await context.newPage();
const client = await context.newCDPSession(page);
await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });

await page.addInitScript(() => {
  globalThis.__mobileAudit = { longTasks: [], lcp: 0, cls: 0 };
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      globalThis.__mobileAudit.longTasks.push(entry.duration);
    }
  }).observe({ type: "longtask", buffered: true });
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    globalThis.__mobileAudit.lcp = entries.at(-1)?.startTime ?? 0;
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) globalThis.__mobileAudit.cls += entry.value;
    }
  }).observe({ type: "layout-shift", buffered: true });
});

await page.goto(target, { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForTimeout(500);
const scrollFrames = await page.evaluate(async () => {
  const frames = [];
  let previous = performance.now();
  const finish = Math.max(0, document.documentElement.scrollHeight - innerHeight);
  for (let y = 0; y <= finish; y += 36) {
    scrollTo(0, y);
    await new Promise((resolve) =>
      requestAnimationFrame((now) => {
        frames.push(now - previous);
        previous = now;
        resolve();
      }),
    );
  }
  return frames;
});
await page.waitForTimeout(250);

const result = await page.evaluate((frames) => {
  const resources = performance.getEntriesByType("resource");
  const sortedFrames = [...frames].sort((a, b) => a - b);
  const p95 = sortedFrames[Math.floor(sortedFrames.length * 0.95)] ?? 0;
  const styles = [...document.querySelectorAll("*")].map((element) =>
    getComputedStyle(element),
  );
  const audit = globalThis.__mobileAudit;
  const transfer = (test) =>
    resources.filter(test).reduce((sum, entry) => sum + entry.transferSize, 0) / 1024;
  const isImage = (entry) =>
    entry.initiatorType === "img" ||
    entry.name.includes("/_next/image?") ||
    /\.(avif|gif|jpe?g|png|svg|webp)(\?|$)/i.test(entry.name);
  return {
    url: location.href,
    domNodes: document.querySelectorAll("*").length,
    resources: resources.length,
    scriptTransferKb: transfer((entry) => entry.initiatorType === "script"),
    imageTransferKb: transfer(isImage),
    cssTransferKb: transfer(
      (entry) => entry.initiatorType === "css" || /\.css(\?|$)/i.test(entry.name),
    ),
    totalTransferKb:
      resources.reduce((sum, entry) => sum + entry.transferSize, 0) / 1024,
    observedLcpMs: audit.lcp,
    cls: audit.cls,
    longTaskCount: audit.longTasks.length,
    longTaskTotalMs: audit.longTasks.reduce((sum, duration) => sum + duration, 0),
    longTaskMaxMs: Math.max(0, ...audit.longTasks),
    scrollFrameCount: frames.length,
    scrollFrameP95Ms: p95,
    scrollFrameMaxMs: Math.max(0, ...frames),
    framesOver24Ms: frames.filter((duration) => duration > 24).length,
    framesOver50Ms: frames.filter((duration) => duration > 50).length,
    nestedScrollers: styles.filter(
      (style) =>
        ["auto", "scroll"].includes(style.overflowY) &&
        style.position !== "fixed",
    ).length,
    backdropElements: styles.filter((style) => style.backdropFilter !== "none").length,
    fixedOrStickyElements: styles.filter((style) =>
      ["fixed", "sticky"].includes(style.position),
    ).length,
    jsHeapMb: performance.memory
      ? performance.memory.usedJSHeapSize / 1024 / 1024
      : null,
  };
}, scrollFrames);

console.log(JSON.stringify(result, null, 2));
await browser.close();
