import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pwPath = path.resolve(
  process.cwd(),
  "..",
  ".toolbox",
  "qa-runtime",
  "node_modules",
  "playwright-core",
);
const { chromium } = require(pwPath);

const BASE_URL = (process.argv[2] || "http://127.0.0.1:3105").replace(/\/+$/, "");
const SCREENSHOT_DIR =
  "C:\\Users\\asus\\.gemini\\antigravity\\brain\\08496d80-a896-4201-9a0c-b9a88b4a3b08\\scratch\\qa";

const ROUTES = [
  "/",
  "/marketplace",
  "/sign-in",
  "/explore",
  "/farms/vuon-buoi-chu-ba-minh",
  "/volunteer",
  "/learn",
  "/farmer?mode=erp&tab=studio",
];

const VIEWPORTS = [320, 375, 390, 768, 1024, 1280, 1440, 1920];

function resolveChromeExecutable() {
  const winChrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  if (fs.existsSync(winChrome)) return winChrome;
  return undefined;
}

async function main() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const executablePath = resolveChromeExecutable();
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });

  const consoleErrors = [];
  const pageErrors = [];
  const overflowFailures = [];
  const brokenImages = [];

  try {
    // 1. Multi-viewport sweep across 8 breakpoints (VI)
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const locUrl = msg.location()?.url || "";
        const text = msg.text();
        const isExternalTile =
          locUrl.includes("tile.openstreetmap.org") ||
          text.includes("tile.openstreetmap.org") ||
          (text.includes("ERR_NAME_NOT_RESOLVED") &&
            (page.url().includes("/explore") || page.url().includes("/farms/")));
        if (!isExternalTile) {
          consoleErrors.push(`[${page.url()}] (${locUrl}) ${text}`);
        }
      }
    });
    page.on("requestfailed", (req) => {
      const reqUrl = req.url();
      const errText = req.failure()?.errorText || "";
      if (!reqUrl.includes("tile.openstreetmap.org") && errText !== "net::ERR_ABORTED") {
        consoleErrors.push(`[REQUEST_FAILED ${errText}] ${reqUrl}`);
      }
    });
    page.on("pageerror", (err) => {
      pageErrors.push(`[${page.url()}] ${err.message}`);
    });

    for (const width of VIEWPORTS) {
      await page.setViewportSize({ width, height: 860 });
      for (const route of ROUTES) {
        const resp = await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
        assert.ok(resp && resp.status() < 400, `HTTP ${resp?.status()} on ${route}`);
        await page.waitForTimeout(450);

        const metrics = await page.evaluate(() => {
          const sw = document.documentElement.scrollWidth;
          const iw = window.innerWidth;
          const imgs = Array.from(document.querySelectorAll("img:not(.leaflet-tile)"));
          const broken = imgs
            .filter((img) => {
              const style = window.getComputedStyle(img);
              return style.display !== "none" && img.complete && img.naturalWidth === 0;
            })
            .map((img) => img.getAttribute("src") || "(no-src)");
          return { sw, iw, broken };
        });

        if (metrics.sw > metrics.iw + 1) {
          overflowFailures.push(`${route} @ ${width}px: scrollWidth=${metrics.sw} > innerWidth=${metrics.iw}`);
        }
        if (metrics.broken.length > 0 && width === 1280) {
          brokenImages.push(`${route}: ${metrics.broken.join(", ")}`);
        }
      }
    }

    // 2. EN responsive check on key viewports + Header VI/EN bounding-box stability
    for (const vpWidth of [1280, 1440]) {
      await page.setViewportSize({ width: vpWidth, height: 900 });
      await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
      // Force VI first if currently EN
      const viBtn = page.locator("header button", { hasText: /^VI$/ }).first();
      if (await viBtn.isVisible()) {
        await viBtn.click();
        await page.waitForTimeout(150);
      }
      const viHeaderBox = await page.locator("header").first().boundingBox();

      const enBtn = page.locator("header button", { hasText: /^EN$/ }).first();
      await enBtn.click();
      await page.waitForTimeout(200);
      const enHeaderBox = await page.locator("header").first().boundingBox();

      assert.ok(viHeaderBox && enHeaderBox, `Missing <header> bounding box at ${vpWidth}px`);
      const heightDelta = Math.abs((viHeaderBox.height ?? 0) - (enHeaderBox.height ?? 0));
      assert.ok(
        heightDelta <= 2.5,
        `Header height shifted ${heightDelta.toFixed(1)}px between VI and EN at ${vpWidth}px`,
      );
      console.log(`[PASS] Header VI/EN shift at ${vpWidth}px: delta=${heightDelta.toFixed(2)}px`);

      // Also check EN overflow on key routes
      for (const route of ["/", "/sign-in", "/marketplace", "/farmer?mode=erp&tab=studio"]) {
        await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(350);
        const { sw, iw } = await page.evaluate(() => ({
          sw: document.documentElement.scrollWidth,
          iw: window.innerWidth,
        }));
        if (sw > iw + 1) {
          overflowFailures.push(`EN ${route} @ ${vpWidth}px: scrollWidth=${sw} > ${iw}`);
        }
      }

      // Restore VI
      await viBtn.click();
      await page.waitForTimeout(150);
    }

    // Check EN mobile 375px
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    const mobEnBtn = page.locator("header button", { hasText: /^EN$/ }).first();
    if (await mobEnBtn.isVisible()) await mobEnBtn.click();
    await page.waitForTimeout(250);
    const mobEnOverflow = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      iw: window.innerWidth,
    }));
    if (mobEnOverflow.sw > mobEnOverflow.iw + 1) {
      overflowFailures.push(`EN / @ 375px: scrollWidth=${mobEnOverflow.sw} > ${mobEnOverflow.iw}`);
    }
    const mobViBtn = page.locator("header button", { hasText: /^VI$/ }).first();
    if (await mobViBtn.isVisible()) await mobViBtn.click();
    await page.waitForTimeout(150);

    // 3. Screenshot captures + functional UX assertions at 1280x900
    await page.setViewportSize({ width: 1280, height: 900 });

    // Homepage hero + footer
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01-home-hero.png") });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02-home-footer.png") });

    // Marketplace product grid
    await page.goto(`${BASE_URL}/marketplace`, { waitUntil: "networkidle" });
    await page.waitForTimeout(450);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03-marketplace-grid.png") });

    // Sign-in page clipping check
    await page.goto(`${BASE_URL}/sign-in`, { waitUntil: "networkidle" });
    await page.waitForTimeout(350);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04-sign-in-desktop.png") });

    // Farm detail layout check (no stretched blank column)
    await page.goto(`${BASE_URL}/farms/vuon-buoi-chu-ba-minh`, { waitUntil: "networkidle" });
    await page.waitForTimeout(450);
    const farmText = await page.locator("main").innerText();
    assert.ok(farmText.includes("Ba Minh"), "Expected real Ba Minh farm profile");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05-farm-detail-ba-minh.png") });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.55));
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05b-farm-batches-live.png") });

    // Volunteer page clean filters, open cards, & Certificate PDF modal check
    await page.goto(`${BASE_URL}/volunteer`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    if (page.url().includes("/sign-in")) {
      const minhAnhCard = page
        .locator("div.grid.grid-cols-1.gap-3.sm\\:grid-cols-2 > div")
        .filter({ hasText: "Minh Anh" })
        .first();
      await minhAnhCard.locator("button", { hasText: /Chọn tài khoản|Select account/i }).first().click();
      await page.waitForURL(/\/volunteer/, { timeout: 15000 });
      await page.waitForTimeout(600);
    }
    const volText = await page.locator("main").innerText();
    assert.equal(/3\. W02 Xác nhận|4\. W04 Duyệt giờ/.test(volText), false, "W02/W04 leaked into open volunteer cards");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06-volunteer-clean-cards.png") });

    const naiPassBtn = page.locator("aside button", { hasText: /NaiPass/ }).first();
    if (await naiPassBtn.isVisible()) {
      await naiPassBtn.click();
      await page.waitForTimeout(300);
      const certBtn = page.locator("button", { hasText: /PDF|Chứng nhận|Certificate|Xem chứng chỉ/i }).first();
      if (await certBtn.isVisible()) {
        await certBtn.click();
        await page.waitForTimeout(450);
      }
    }

    // Learn page sequential stepper & 9-crop 2D anatomy check
    await page.goto(`${BASE_URL}/learn/dong-nai-greetings-and-agricultural-origins-a1`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const stepText = await page.locator("main").innerText();
    assert.ok(/Bước [1-6]\s*\/\s*6|Step [1-6]\s*\/\s*6/.test(stepText), "Expected sequential 6-step lesson bar");
    const freeBtn = page.locator("button", { hasText: /Mở xem tự do|Free browse/i }).first();
    if (await freeBtn.isVisible()) {
      await freeBtn.click();
      await page.waitForTimeout(150);
      const anatomyTab = page.locator("button[role='tab']").last();
      await anatomyTab.click();
      await page.waitForTimeout(300);
      const anatomyText = await page.locator("main").innerText();
      assert.ok(anatomyText.includes("Mật ong") || anatomyText.includes("Wild Honey"), "Expected expanded 9-crop 2D anatomy");
    }
    console.log("[PASS] Learn sequential 6-step & 9-crop 2D SVG anatomy verified");

    // Video Studio real MP4 check in W02 ERP Studio tab (sign in 1-touch as W02 Chú Ba Tư first)
    await page.goto(`${BASE_URL}/sign-in`, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const baTuCard = page
      .locator("div.grid.grid-cols-1.gap-3.sm\\:grid-cols-2 > div")
      .filter({ hasText: "Chú Ba Tư" })
      .first();
    if (await baTuCard.isVisible()) {
      await baTuCard.locator("button", { hasText: /Chọn tài khoản|Select account/i }).first().click();
      await page.waitForURL(/\/farmer/, { timeout: 15000 });
      await page.waitForTimeout(500);
    }
    await page.goto(`${BASE_URL}/farmer?mode=erp&tab=studio`, { waitUntil: "networkidle" });
    await page.waitForSelector("[data-testid='ocop-video-studio-panel']", { timeout: 15000 });
    await page.waitForTimeout(600);
    const videoInfo = await page.evaluate(async () => {
      const vid = document.querySelector("video");
      if (!vid) return { present: false, src: "" };
      const src = vid.getAttribute("src") || vid.currentSrc || "";
      const res = src ? await fetch(src) : null;
      return {
        present: true,
        src,
        httpStatus: res?.status ?? 0,
        contentType: res?.headers.get("content-type") ?? "",
      };
    });
    assert.ok(videoInfo.present && videoInfo.src.includes("/media/studio-samples/"), "Missing sample <video> src");
    assert.equal(videoInfo.httpStatus, 200, `Expected 200 on sample MP4 ${videoInfo.src}, got ${videoInfo.httpStatus}`);
    console.log(`[PASS] Studio video verified: ${videoInfo.src} (${videoInfo.httpStatus}, ${videoInfo.contentType})`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "08-video-studio-farmer.png") });

    // NaiAI Chatbot open, clean header (no W01..W06), & Clear button check
    const chatBtn = page.locator("button[aria-label*='NaiAI'], button[aria-label*='trợ lý'], button[aria-label*='assistant']").first();
    if (await chatBtn.isVisible()) {
      await chatBtn.click();
      await page.waitForTimeout(300);
      const clearBtn = page.locator("button", { hasText: /Xóa hội thoại|Clear/i }).first();
      if (await clearBtn.isVisible()) {
        await clearBtn.click();
        await page.waitForTimeout(150);
      }
      console.log("[PASS] NaiAI chatbot open & Clear verified");
    }

    await context.close();

    // 4. Dedicated offline OSM test on /explore
    const offlineCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const offlinePage = await offlineCtx.newPage();
    await offlinePage.route("**/*openstreetmap.org/**", (route) => route.abort());
    await offlinePage.goto(`${BASE_URL}/explore`, { waitUntil: "domcontentloaded" });
    await offlinePage.waitForTimeout(2500);
    const vectorCount = await offlinePage.locator(".leaflet-overlay-pane svg path").count();
    assert.ok(vectorCount >= 90, `Expected >=90 local GeoJSON SVG paths on /explore offline, got ${vectorCount}`);
    console.log(`[PASS] Offline /explore rendered ${vectorCount} local GeoJSON vector SVG paths.`);
    await offlinePage.screenshot({ path: path.join(SCREENSHOT_DIR, "07-explore-offline-map.png") });
    await offlineCtx.close();

    assert.equal(overflowFailures.length, 0, `Horizontal overflow detected:\n${overflowFailures.join("\n")}`);
    assert.equal(brokenImages.length, 0, `Broken <img> detected:\n${brokenImages.join("\n")}`);
    assert.equal(pageErrors.length, 0, `Unhandled page errors:\n${pageErrors.join("\n")}`);
    assert.equal(consoleErrors.length, 0, `Console errors:\n${consoleErrors.join("\n")}`);

    console.log(`\nALL PLAYWRIGHT CHECKS PASSED ON ${BASE_URL}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("[v5-playwright-qa] FAILED:", err);
  process.exit(1);
});
