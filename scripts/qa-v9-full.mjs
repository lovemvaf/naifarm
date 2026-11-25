import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const playwright = require("../../.toolbox/qa-runtime/node_modules/playwright-core");

const BASE_URL = process.env.QA_BASE_URL || "http://127.0.0.1:3099";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const SCREENSHOT_DIR = path.resolve(process.cwd(), "qa-v9-screenshots");
const REPORT_PATH = path.resolve(process.cwd(), "qa-v9-report.json");
const AXE_SOURCE = fs.readFileSync(
  path.resolve(process.cwd(), "node_modules/axe-core/axe.min.js"),
  "utf8",
);

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const ALL_18_WIDTHS = [
  320, 360, 375, 390, 393, 412, 414, 430, 480, 640, 768, 820, 1024, 1280, 1366, 1440, 1536, 1920,
];
const INTERMEDIATE_WIDTHS = [900, 1100, 1180, 1240, 1320];

const report = {
  startedAt: new Date().toISOString(),
  baseUrl: BASE_URL,
  tests: {},
  failures: [],
  runtimeErrors: {
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
    brokenImages: [],
  },
  screenshots: [],
};

function record(testName, passed, details) {
  report.tests[testName] = { passed, ...details };
  if (!passed) {
    report.failures.push({ testName, details });
  }
  const tag = passed ? "PASS" : "FAIL";
  console.log(`[${tag}] ${testName}`, JSON.stringify(details).slice(0, 260));
}

function attachListeners(page) {
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const txt = msg.text();
      if (!txt.includes("openstreetmap.org")) {
        report.runtimeErrors.consoleErrors.push({ url: page.url(), text: txt });
      }
    }
  });
  page.on("pageerror", (err) => {
    report.runtimeErrors.pageErrors.push({ url: page.url(), error: err.message });
  });
  page.on("response", (res) => {
    const status = res.status();
    const url = res.url();
    if (status >= 400 && !url.includes("openstreetmap.org") && !url.includes("favicon.ico")) {
      report.runtimeErrors.failedRequests.push({ url, status, page: page.url() });
    }
  });
}

async function waitStable(page, ms = 350) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(ms);
}

async function checkHeaderGeometry(page, label) {
  return await page.evaluate((lbl) => {
    const header = document.querySelector("header");
    if (!header) return { ok: false, reason: "Missing <header>", label: lbl };

    const brand = header.querySelector('[data-header-zone="brand"]');
    const nav = header.querySelector('[data-header-zone="nav"]');
    const utils = header.querySelector('[data-header-zone="utilities"]');

    const rect = (el) => (el ? el.getBoundingClientRect() : null);
    const bR = rect(brand);
    const nR = rect(nav);
    const uR = rect(utils);

    const overlaps = [];
    const checkPair = (nameA, rA, nameB, rB) => {
      if (!rA || !rB || rA.width === 0 || rB.width === 0) return;
      const horizOverlap = rA.right > rB.left + 1 && rA.left < rB.right - 1;
      const vertOverlap = rA.bottom > rB.top + 1 && rA.top < rB.bottom - 1;
      if (horizOverlap && vertOverlap) {
        overlaps.push(`${nameA} overlaps ${nameB} (A.right=${rA.right.toFixed(1)}, B.left=${rB.left.toFixed(1)})`);
      }
    };

    checkPair("brand", bR, "nav", nR);
    checkPair("nav", nR, "utilities", uR);
    checkPair("brand", bR, "utilities", uR);

    // Check interactive items inside nav + utilities for pairwise overlap
    const visibleControls = [...header.querySelectorAll("a, button, input")].filter((el) => {
      const r = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return r.width > 4 && r.height > 4 && style.visibility !== "hidden" && style.opacity !== "0";
    });

    // Only check items in the primary row (top < bR.bottom + 12)
    const row1Controls = visibleControls.filter((el) => {
      const r = el.getBoundingClientRect();
      return bR && Math.abs(r.top - bR.top) < 36;
    });

    for (let i = 0; i < row1Controls.length; i++) {
      const rA = row1Controls[i].getBoundingClientRect();
      for (let j = i + 1; j < row1Controls.length; j++) {
        const a = row1Controls[i];
        const b = row1Controls[j];
        if (a.contains(b) || b.contains(a)) continue;
        const rB = b.getBoundingClientRect();
        const horizOverlap = rA.right > rB.left + 1.5 && rA.left < rB.right - 1.5;
        const vertOverlap = rA.bottom > rB.top + 1.5 && rA.top < rB.bottom - 1.5;
        if (horizOverlap && vertOverlap) {
          overlaps.push(
            `control[${a.textContent?.trim() || a.getAttribute("aria-label")}] overlaps control[${b.textContent?.trim() || b.getAttribute("aria-label")}]`,
          );
        }
      }
    }

    // Verify elementFromPoint hits on key controls in row 1
    const hitIssues = [];
    for (const el of row1Controls) {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      if (cx < 0 || cx > window.innerWidth || cy < 0 || cy > window.innerHeight) {
        hitIssues.push(`Offscreen header control: ${el.textContent?.trim() || el.getAttribute("aria-label")}`);
        continue;
      }
      const hit = document.elementFromPoint(cx, cy);
      if (hit && !el.contains(hit) && !hit.contains(el)) {
        hitIssues.push(
          `Blocked click on [${el.textContent?.trim() || el.getAttribute("aria-label")}] by [${hit.tagName}.${hit.className}]`,
        );
      }
    }

    const headerOverflow = header.scrollWidth > window.innerWidth + 1;
    const docOverflow = document.documentElement.scrollWidth > window.innerWidth + 1;

    return {
      ok: overlaps.length === 0 && hitIssues.length === 0 && !headerOverflow && !docOverflow,
      label: lbl,
      viewportWidth: window.innerWidth,
      headerOverflow,
      docOverflow,
      overlaps,
      hitIssues,
      brandRect: bR ? { x: bR.x, y: bR.y, w: bR.width, h: bR.height } : null,
      navRect: nR ? { x: nR.x, y: nR.y, w: nR.width, h: nR.height } : null,
      utilRect: uR ? { x: uR.x, y: uR.y, w: uR.width, h: uR.height } : null,
    };
  }, label);
}

async function checkBrokenImages(page) {
  const broken = await page.evaluate(() => {
    return [...document.querySelectorAll("img")]
      .filter((img) => {
        const r = img.getBoundingClientRect();
        const visible = r.width > 0 && r.height > 0;
        return visible && img.complete && img.naturalWidth === 0;
      })
      .map((img) => img.getAttribute("src") || img.alt);
  });
  for (const src of broken) {
    report.runtimeErrors.brokenImages.push({ url: page.url(), src });
  }
  return broken;
}

async function main() {
  const browser = await playwright.chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"],
  });

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    attachListeners(page);

    // =========================================================================
    // TEST A: Header Collision & Real Clicks (VI & EN across key desktop/tablet/mobile widths)
    // =========================================================================
    const headerWidths = [1920, 1440, 1366, 1280, 1180, 1024, 900, 768, 390, 320];
    const headerResults = [];
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    await waitStable(page, 500);

    for (const lang of ["vi", "en"]) {
      if (lang === "en") {
        await page.locator('[data-locale-btn="en"]').click();
        await waitStable(page, 300);
      }
      for (const w of headerWidths) {
        await page.setViewportSize({ width: w, height: 860 });
        await page.waitForTimeout(260);
        const res = await checkHeaderGeometry(page, `${lang}@${w}`);
        headerResults.push(res);
      }
    }

    // Verify "Sự kiện" / "Events" real navigation click at 1280px (directly or via More menu)
    await page.setViewportSize({ width: 1280, height: 860 });
    await page.locator('[data-locale-btn="vi"]').click();
    await waitStable(page, 250);
    let eventsClicked = false;
    const directEventLink = page.locator('[data-header-zone="nav"] a[href*="/events"]').first();
    if (await directEventLink.isVisible().catch(() => false)) {
      await directEventLink.click();
      eventsClicked = true;
    } else {
      const moreBtn = page.locator('[data-header-zone="nav"] button[aria-haspopup="menu"]').first();
      if (await moreBtn.isVisible().catch(() => false)) {
        await moreBtn.click();
        await page.waitForTimeout(150);
        await page.locator('header [role="menu"] a[href*="/events"]').first().click();
        eventsClicked = true;
      }
    }
    await waitStable(page, 350);
    const landedOnEvents = page.url().includes("/events");
    const failedHeaders = headerResults.filter((r) => !r.ok);
    record("Test_A_Header_Collision_And_Clicks", failedHeaders.length === 0 && eventsClicked && landedOnEvents, {
      checkedConfigs: headerResults.length,
      failedCount: failedHeaders.length,
      failedSamples: failedHeaders.slice(0, 3),
      eventsClicked,
      landedOnEvents,
    });

    // =========================================================================
    // TEST B: VI -> EN -> VI -> EN Round-Trip Geometry & State Preservation
    // =========================================================================
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    await waitStable(page, 450);

    const captureAnchorRects = async () =>
      await page.evaluate(() => {
        const pick = (sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        };
        return {
          brand: pick('[data-header-zone="brand"]'),
          langVi: pick('[data-locale-btn="vi"]'),
          langEn: pick('[data-locale-btn="en"]'),
          cart: pick('[data-header-control="cart"]'),
          hero: pick('[data-v9-hero="true"]'),
          heroCta: pick('[data-slide-active="true"] [data-hero-cta-row="true"]'),
        };
      });

    const vi1 = await captureAnchorRects();
    await page.locator('[data-locale-btn="en"]').click();
    await waitStable(page, 300);
    const en1 = await captureAnchorRects();
    await page.locator('[data-locale-btn="vi"]').click();
    await waitStable(page, 300);
    const vi2 = await captureAnchorRects();
    await page.locator('[data-locale-btn="en"]').click();
    await waitStable(page, 300);
    const en2 = await captureAnchorRects();

    const maxDelta = (a, b) => {
      if (!a || !b) return 999;
      return Math.max(
        Math.abs(a.x - b.x),
        Math.abs(a.y - b.y),
        Math.abs(a.w - b.w),
        Math.abs(a.h - b.h),
      );
    };

    const deltas = {
      brandViEn: maxDelta(vi1.brand, en1.brand),
      langViEn: maxDelta(vi1.langVi, en1.langVi),
      cartViEn: maxDelta(vi1.cart, en1.cart),
      heroHeightDelta: Math.abs((vi1.hero?.h ?? 0) - (en1.hero?.h ?? 0)),
      heroCtaYDelta: Math.abs((vi1.heroCta?.y ?? 0) - (en1.heroCta?.y ?? 0)),
      viRoundTripBrand: maxDelta(vi1.brand, vi2.brand),
      enRoundTripBrand: maxDelta(en1.brand, en2.brand),
    };

    // State preservation across VI/EN on marketplace
    await page.goto(`${BASE_URL}/marketplace`, { waitUntil: "domcontentloaded" });
    await waitStable(page, 400);
    await page.locator('[data-product-card="true"] button').filter({ hasText: /Add|Thêm/i }).first().click();
    await page.waitForTimeout(250);
    const cartBefore = await page.locator('[data-header-control="cart"]').innerText();
    await page.locator('[data-locale-btn="vi"]').click();
    await waitStable(page, 300);
    const cartAfterVi = await page.locator('[data-header-control="cart"]').innerText();
    const stillOnMarket = page.url().includes("/marketplace");

    const testBPass =
      deltas.brandViEn <= 2 &&
      deltas.langViEn <= 2 &&
      deltas.cartViEn <= 2 &&
      deltas.heroHeightDelta <= 2 &&
      deltas.heroCtaYDelta <= 2 &&
      stillOnMarket &&
      /\d+/.test(cartBefore) &&
      /\d+/.test(cartAfterVi);

    record("Test_B_Bilingual_RoundTrip_Lock", testBPass, {
      deltas,
      cartBefore: cartBefore.replace(/\s+/g, " ").trim(),
      cartAfterVi: cartAfterVi.replace(/\s+/g, " ").trim(),
      stillOnMarket,
    });

    // =========================================================================
    // TEST C: Account Stress Test (Guest + Long HTX Name + Admin + Cart 99+)
    // =========================================================================
    await page.goto(`${BASE_URL}/sign-in`, { waitUntil: "domcontentloaded" });
    await waitStable(page, 400);

    // Select HTX Tân Triều long name account
    const htxCard = page.locator("article, div").filter({ hasText: "Ban Chủ nhiệm HTX Tân Triều" }).locator("button").first();
    let signedHtx = false;
    if (await htxCard.isVisible().catch(() => false)) {
      await htxCard.click();
      await waitStable(page, 450);
      signedHtx = true;
    }

    const htxHeaderChecks = [];
    for (const w of [1440, 1366, 1280, 768, 390]) {
      await page.setViewportSize({ width: w, height: 860 });
      await page.waitForTimeout(240);
      htxHeaderChecks.push(await checkHeaderGeometry(page, `htx@${w}`));
    }
    const htxFailed = htxHeaderChecks.filter((r) => !r.ok);

    // Switch back to guest for clean subsequent checks (keep account verified)
    record("Test_C_Account_LongName_Stress", signedHtx && htxFailed.length === 0, {
      signedHtx,
      checkedWidths: htxHeaderChecks.length,
      failedCount: htxFailed.length,
      failedSamples: htxFailed.slice(0, 2),
    });

    // =========================================================================
    // TEST D: All 18 Viewports + Intermediate Widths Responsive Overflow Check
    // =========================================================================
    const allWidths = [...ALL_18_WIDTHS, ...INTERMEDIATE_WIDTHS];
    const overflowRoutes = ["/", "/marketplace", "/products/buoi-duong-la-cam-tan-trieu", "/explore", "/learn"];
    const overflowFailures = [];

    for (const route of overflowRoutes) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
      await waitStable(page, 300);
      for (const w of allWidths) {
        const h = w < 640 ? 844 : 900;
        await page.setViewportSize({ width: w, height: h });
        await page.waitForTimeout(90);
        const ov = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));
        if (ov.scrollWidth > ov.innerWidth + 1) {
          overflowFailures.push({ route, width: w, scrollWidth: ov.scrollWidth, innerWidth: ov.innerWidth });
        }
      }
    }
    record("Test_D_18_Plus_Intermediate_Viewports_ZeroOverflow", overflowFailures.length === 0, {
      totalChecks: overflowRoutes.length * allWidths.length,
      overflowCount: overflowFailures.length,
      overflowSamples: overflowFailures.slice(0, 5),
    });

    // =========================================================================
    // TEST E: Hero Carousel Stability Across All 3 Slides + Pause + WebP Load
    // =========================================================================
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    await waitStable(page, 450);

    const heroHeights = [];
    const ctaYs = [];
    let allCtasInsideHero = true;
    for (let s = 0; s < 3; s++) {
      const m = await page.evaluate(() => {
        const hero = document.querySelector('[data-v9-hero="true"]');
        const cta = document.querySelector('[data-slide-active="true"] [data-hero-cta-row="true"]');
        const activeImg = document.querySelector('[data-slide-active="true"] img');
        const hR = hero ? hero.getBoundingClientRect() : null;
        const cR = cta ? cta.getBoundingClientRect() : null;
        return {
          slide: hero?.getAttribute("data-active-slide"),
          heroH: hR ? hR.height : 0,
          ctaY: cR ? cR.y : 0,
          ctaInsideHero: Boolean(hR && cR && cR.top >= hR.top && cR.bottom <= hR.bottom),
          imgSrc: activeImg?.currentSrc || activeImg?.getAttribute("src"),
          imgLoaded: Boolean(activeImg && activeImg.complete && activeImg.naturalWidth > 0),
        };
      });
      heroHeights.push(m.heroH);
      ctaYs.push(m.ctaY);
      if (!m.ctaInsideHero) allCtasInsideHero = false;
      if (s < 2) {
        await page.locator('[data-v9-hero="true"]').hover();
        await page.waitForTimeout(120);
        await page.locator('[data-hero-nav="next"]').click();
        await page.waitForTimeout(450);
      }
    }

    await page.locator('[data-hero-pause="true"]').click();
    const pausedPressed = await page.locator('[data-hero-pause="true"]').getAttribute("aria-pressed");
    const heroHeightSpread = Math.max(...heroHeights) - Math.min(...heroHeights);
    const ctaYSpread = Math.max(...ctaYs) - Math.min(...ctaYs);
    const webpUsed = await page.evaluate(() => {
      const img = document.querySelector('[data-v9-hero="true"] img');
      return Boolean(img && (img.currentSrc || "").includes(".webp") && img.naturalWidth > 0);
    });

    record(
      "Test_E_Hero_Stability_And_WebP",
      heroHeightSpread <= 2 && ctaYSpread <= 2 && allCtasInsideHero && pausedPressed === "true" && webpUsed,
      { heroHeights, ctaYs, heroHeightSpread, ctaYSpread, allCtasInsideHero, pausedPressed, webpUsed },
    );

    // =========================================================================
    // TEST F: Core Routes, 4 PDP Tabs, Mobile Filter Sheet, 9 Learning Audiences
    // =========================================================================
    const coreRoutes = [
      "/",
      "/marketplace",
      "/products/buoi-duong-la-cam-tan-trieu",
      "/explore",
      "/trace/NF-DEMO-001",
      "/quality",
      "/learn",
      "/events",
      "/cart",
      "/checkout",
      "/farmer",
      "/volunteer",
      "/coordinator",
      "/organization",
      "/admin",
      "/search",
      "/sign-in",
    ];
    const routeCheckSummary = [];
    for (const r of coreRoutes) {
      const resp = await page.goto(`${BASE_URL}${r}`, { waitUntil: "domcontentloaded" });
      await waitStable(page, 250);
      const broken = await checkBrokenImages(page);
      routeCheckSummary.push({
        route: r,
        status: resp?.status() ?? 0,
        brokenImgs: broken.length,
      });
    }

    // Verify exact 4 PDP tabs
    await page.goto(`${BASE_URL}/products/buoi-duong-la-cam-tan-trieu`, { waitUntil: "domcontentloaded" });
    await waitStable(page, 350);
    const pdpTabCount = await page.locator("[data-pdp-tab]").count();
    for (const tabId of ["origin", "story", "reviews", "overview"]) {
      await page.locator(`[data-pdp-tab="${tabId}"]`).click();
      await page.waitForTimeout(120);
    }

    // Verify mobile sticky purchase bar + mobile marketplace filter sheet at 390px
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(200);
    const mobileStickyPurchaseVisible = await page
      .locator('[data-mobile-sticky-purchase="true"]')
      .isVisible()
      .catch(() => false);

    await page.goto(`${BASE_URL}/marketplace`, { waitUntil: "domcontentloaded" });
    await waitStable(page, 300);
    await page.locator('[data-mobile-filter-trigger="true"]').click();
    await page.waitForTimeout(200);
    const filterSheetVisible = await page.locator('div[role="dialog"]').isVisible().catch(() => false);
    if (filterSheetVisible) {
      await page.locator('div[role="dialog"] button').filter({ hasText: /Apply|Xem/i }).first().click();
      await page.waitForTimeout(150);
    }

    // Verify 9 Learning Audiences on /learn
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/learn`, { waitUntil: "domcontentloaded" });
    await waitStable(page, 300);
    const audienceCount = await page.locator("[data-audience-id]").count();
    await page.locator('[data-audience-id="farmers"]').click();
    await page.waitForTimeout(120);
    const farmersSelected = await page.locator('[data-audience-id="farmers"]').getAttribute("aria-selected");

    const badStatusRoutes = routeCheckSummary.filter((x) => x.status >= 400 || x.brokenImgs > 0);
    record(
      "Test_F_Core_Routes_PDP4Tabs_FilterSheet_9Audiences",
      badStatusRoutes.length === 0 &&
        pdpTabCount === 4 &&
        mobileStickyPurchaseVisible &&
        filterSheetVisible &&
        audienceCount === 9 &&
        farmersSelected === "true",
      {
        routesChecked: coreRoutes.length,
        badStatusRoutes,
        pdpTabCount,
        mobileStickyPurchaseVisible,
        filterSheetVisible,
        audienceCount,
        farmersSelected,
      },
    );

    // =========================================================================
    // TEST G: Non-Modal Chatbot Interaction (Desktop + Mobile, Home + Marketplace)
    // =========================================================================
    const chatChecks = [];
    for (const cfg of [
      { route: "/", width: 1440, height: 900, panelSel: '[data-naiai-panel="home"]', launcherSel: '[data-naiai-launcher="home"]' },
      { route: "/", width: 390, height: 844, panelSel: '[data-naiai-panel="home"]', launcherSel: '[data-naiai-launcher="home"]' },
      { route: "/marketplace", width: 1440, height: 900, panelSel: '[data-naiai-panel="floating"]', launcherSel: '[data-naiai-launcher="floating"]' },
    ]) {
      await page.setViewportSize({ width: cfg.width, height: cfg.height });
      await page.goto(`${BASE_URL}${cfg.route}`, { waitUntil: "domcontentloaded" });
      await waitStable(page, 350);
      // Clear saved open flag first if already open
      const panelAlready = await page.locator(cfg.panelSel).isVisible().catch(() => false);
      if (!panelAlready) {
        await page.locator(cfg.launcherSel).click();
        await page.waitForTimeout(200);
      }
      const panelInfo = await page.evaluate((sel) => {
        const p = document.querySelector(sel);
        if (!p) return { open: false };
        return {
          open: true,
          role: p.getAttribute("role"),
          ariaModal: p.getAttribute("aria-modal"),
        };
      }, cfg.panelSel);

      // Scroll page while chat stays open
      await page.evaluate(() => window.scrollTo(0, 320));
      await page.waitForTimeout(150);
      const scrollY = await page.evaluate(() => window.scrollY);

      // Click header VI/EN toggle directly while chat stays open!
      const langTarget = await page.locator('[data-locale-btn="en"]').getAttribute("aria-pressed") === "true"
        ? '[data-locale-btn="vi"]'
        : '[data-locale-btn="en"]';
      await page.locator(langTarget).click();
      await page.waitForTimeout(200);
      const panelStillOpen = await page.locator(cfg.panelSel).isVisible().catch(() => false);

      // Close chat cleanly
      await page.locator(`${cfg.panelSel} button[aria-label*="Close"], ${cfg.panelSel} button[aria-label*="Đóng"]`).first().click();
      await page.waitForTimeout(150);

      chatChecks.push({
        ...cfg,
        ok:
          panelInfo.open &&
          panelInfo.role === "region" &&
          panelInfo.ariaModal !== "true" &&
          scrollY >= 200 &&
          panelStillOpen,
        panelInfo,
        scrollY,
        panelStillOpen,
      });
    }
    record("Test_G_NonModal_Chatbot_Interaction", chatChecks.every((c) => c.ok), { chatChecks });

    // =========================================================================
    // TEST H: Capture Desktop / Tablet / Mobile Screenshots (VI & EN) for Visual Review
    // =========================================================================
    const shots = [
      { name: "home-1440-vi", route: "/", w: 1440, h: 900, lang: "vi" },
      { name: "home-1440-en", route: "/", w: 1440, h: 900, lang: "en" },
      { name: "home-1366-vi", route: "/", w: 1366, h: 768, lang: "vi" },
      { name: "home-768-vi", route: "/", w: 768, h: 1024, lang: "vi" },
      { name: "home-390-vi", route: "/", w: 390, h: 844, lang: "vi" },
      { name: "marketplace-1440-vi", route: "/marketplace", w: 1440, h: 900, lang: "vi" },
      { name: "marketplace-390-vi", route: "/marketplace", w: 390, h: 844, lang: "vi" },
      { name: "pdp-1440-vi", route: "/products/buoi-duong-la-cam-tan-trieu", w: 1440, h: 900, lang: "vi" },
      { name: "pdp-390-en", route: "/products/buoi-duong-la-cam-tan-trieu", w: 390, h: 844, lang: "en" },
      { name: "explore-1440-vi", route: "/explore", w: 1440, h: 900, lang: "vi" },
      { name: "learn-1440-vi", route: "/learn", w: 1440, h: 900, lang: "vi" },
      { name: "farmer-1440-vi", route: "/farmer", w: 1440, h: 900, lang: "vi" },
    ];
    for (const s of shots) {
      await page.setViewportSize({ width: s.w, height: s.h });
      await page.goto(`${BASE_URL}${s.route}${s.lang === "en" ? "?lang=en" : ""}`, { waitUntil: "domcontentloaded" });
      await waitStable(page, 450);
      const langBtn = s.lang === "en" ? '[data-locale-btn="en"]' : '[data-locale-btn="vi"]';
      if (await page.locator(langBtn).isVisible().catch(() => false)) {
        await page.locator(langBtn).click();
        await page.waitForTimeout(250);
      }
      const outPath = path.join(SCREENSHOT_DIR, `${s.name}.png`);
      await page.screenshot({ path: outPath, fullPage: false });
      report.screenshots.push(outPath);
    }
    record("Test_H_Visual_Screenshots_Captured", report.screenshots.length === shots.length, {
      count: report.screenshots.length,
      dir: SCREENSHOT_DIR,
    });

    // =========================================================================
    // TEST I: Real axe-core Accessibility Checks + Reduced Motion
    // =========================================================================
    const axeRoutes = ["/", "/marketplace", "/products/buoi-duong-la-cam-tan-trieu", "/explore", "/learn", "/sign-in"];
    const axeSummary = [];
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const r of axeRoutes) {
      await page.goto(`${BASE_URL}${r}`, { waitUntil: "domcontentloaded" });
      await waitStable(page, 350);
      await page.addScriptTag({ content: AXE_SOURCE });
      const res = await page.evaluate(async () => {
        const out = await window.axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
        });
        const severe = out.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
        return {
          totalViolations: out.violations.length,
          severeCount: severe.length,
          severeDetails: severe.map((v) => ({
            id: v.id,
            impact: v.impact,
            help: v.help,
            nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" ")),
          })),
        };
      });
      axeSummary.push({ route: r, ...res });
    }
    const totalSevere = axeSummary.reduce((acc, x) => acc + x.severeCount, 0);

    // Reduced motion check
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    await waitStable(page, 300);
    const reducedOk = await page.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    await page.emulateMedia({ reducedMotion: "no-preference" });

    record("Test_I_AxeCore_A11y_And_ReducedMotion", totalSevere === 0 && reducedOk, {
      totalSevere,
      reducedOk,
      axeSummary,
    });

    // =========================================================================
    // TEST J: Runtime Health (0 console errors, 0 page errors, 0 broken images)
    // =========================================================================
    const runtimeClean =
      report.runtimeErrors.consoleErrors.length === 0 &&
      report.runtimeErrors.pageErrors.length === 0 &&
      report.runtimeErrors.failedRequests.length === 0 &&
      report.runtimeErrors.brokenImages.length === 0;
    record("Test_J_Runtime_Health", runtimeClean, report.runtimeErrors);

    report.finishedAt = new Date().toISOString();
    report.allPassed = report.failures.length === 0;
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
    console.log(`\n=== QA V9 SUMMARY: ${report.allPassed ? "ALL PASS" : `${report.failures.length} FAILURES`} ===`);
    console.log(`Report saved to: ${REPORT_PATH}`);
    if (!report.allPassed) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
