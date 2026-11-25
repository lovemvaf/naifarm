#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const repoRoot = path.resolve(process.cwd());
const pwPath = path.resolve(repoRoot, "..", ".toolbox", "qa-runtime", "node_modules", "playwright-core");
const { chromium } = require(pwPath);
const axeSourcePath = path.resolve(repoRoot, "node_modules", "axe-core", "axe.min.js");
const axeSource = fs.existsSync(axeSourcePath) ? fs.readFileSync(axeSourcePath, "utf8") : null;

const args = process.argv.slice(2);
function getArg(flag, envName, fallback) {
  const idx = args.indexOf(flag);
  if (idx >= 0 && args[idx + 1] && !args[idx + 1].startsWith("--")) return args[idx + 1];
  if (envName && process.env[envName]) return process.env[envName];
  return fallback;
}
function hasFlag(flag) {
  return args.includes(flag);
}

const BASE_URL = getArg("--base-url", "BASE_URL", "http://127.0.0.1:3000").replace(/\/+$/, "");
const STAGE = getArg("--stage", "STAGE", "before");
const MODE = getArg("--mode", "MODE", "baseline"); // baseline | after | full
const OUT_DIR = path.resolve(repoRoot, getArg("--out", "OUTPUT_DIR", `artifacts/naifarm-final/01-${STAGE}`));
const ROLE_FILTER = getArg("--role", "ROLE", "");
const LOCALE_FILTER = getArg("--locale", "LOCALE", "");
const RESUME = hasFlag("--resume");

function resolveChromeExecutable() {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return undefined;
}

function appendLocaleParam(route, locale) {
  const [pathname, hash = ""] = route.split("#");
  const [base, qs = ""] = pathname.split("?");
  const params = new URLSearchParams(qs);
  params.set("lang", locale);
  const query = params.toString();
  return `${base}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

function sha256File(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16);
}

// Role credentials using exact sign-in 1-tap cards or bundle buttons
const ROLE_ACCOUNTS = {
  guest: null,
  W01: { cardName: "Ngọc Linh", workspace: "W01" },
  W02: { cardName: "Chú Ba Tư", workspace: "W02" },
  W03: { cardName: "Minh Anh", workspace: "W03" },
  W04: { cardName: "Thu Hà", workspace: "W04" },
  W05: { cardName: "Ban Chủ nhiệm HTX Tân Triều", workspace: "W05" },
  W06: { cardName: "Quản trị Hệ thống", workspace: "W06" },
};

// Routes matrix per mode
const BASELINE_TASKS = [
  { id: "SCN-HOME", route: "/", role: "guest", family: "homepage", component: "UnifiedHero/HomePage", locales: ["vi", "en"], viewports: ["desktop", "mobile", "tablet"] },
  { id: "SCN-MARKET", route: "/marketplace", role: "guest", family: "marketplace", component: "ProductCard/Marketplace", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "SCN-PROD-FRESH", route: "/products/buoi-da-xanh-tan-trieu", role: "guest", family: "product-detail", component: "ProductGallery2D/ProduceAnatomy2D", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "SCN-PROD-PACKAGED", route: "/products/mut-vo-buoi-say-deo-mat-ong", role: "guest", family: "product-detail", component: "ProductCard/ImageAudit", locales: ["vi"], viewports: ["desktop"] },
  { id: "SCN-FARMS", route: "/farms", role: "guest", family: "farms", component: "FarmsDirectory", locales: ["vi"], viewports: ["desktop", "mobile"] },
  { id: "SCN-FARM-BAMINH", route: "/farms/vuon-buoi-chu-ba-minh", role: "guest", family: "farm-profile", component: "FarmDetail/LivePanel", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "SCN-EXPLORE-MAP", route: "/explore", role: "guest", family: "map", component: "NaiFarmMap", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "SCN-EVENTS-CAMPAIGNS", route: "/events", role: "guest", family: "events", component: "EventsHub", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "SCN-EVENTS-CALENDAR", route: "/events?tab=calendar", role: "guest", family: "calendar", component: "NaiCalendarBoard", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "SCN-LIVE-REPLAY", route: "/live/NF-LIVE-REPLAY-TT", role: "guest", family: "live", component: "LiveRoomView", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "SCN-LEARN-LESSON", route: "/learn/hanh-trinh-hat-dieu-dong-nai", role: "W03", family: "learning", component: "InteractiveLessonPlayer/ProduceAnatomy2D", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "SCN-SIGNIN", route: "/sign-in", role: "guest", family: "auth", component: "SignInPage", locales: ["vi", "en"], viewports: ["desktop", "tablet", "mobile"] },
  { id: "SCN-CART", route: "/cart", role: "W01", family: "checkout", component: "CartPage", locales: ["vi"], viewports: ["desktop", "mobile"] },
  { id: "SCN-TRACE-VALID", route: "/trace/NF-DEMO-001", role: "guest", family: "trace", component: "QrPassportCard", locales: ["vi"], viewports: ["desktop", "mobile"] },
  { id: "SCN-W02-FARMER", route: "/farmer?mode=erp&tab=overview", role: "W02", family: "workspace-W02", component: "FarmerOverviewAnalytics", locales: ["vi"], viewports: ["desktop", "mobile"] },
  { id: "SCN-W02-STUDIO", route: "/farmer?mode=erp&tab=studio", role: "W02", family: "studio", component: "CreativeStudioPanel", locales: ["vi"], viewports: ["desktop", "mobile"] },
  { id: "SCN-W03-VOLUNTEER", route: "/volunteer", role: "W03", family: "workspace-W03", component: "VolunteerWorkspacePage", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "SCN-W04-COORD", route: "/coordinator", role: "W04", family: "workspace-W04", component: "CoordinatorWorkspacePage", locales: ["vi"], viewports: ["desktop"] },
  { id: "SCN-W05-ORG", route: "/organization", role: "W05", family: "workspace-W05", component: "OrganizationWorkspacePage", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "SCN-W06-ADMIN", route: "/admin", role: "W06", family: "workspace-W06", component: "AdminWorkspacePage", locales: ["vi"], viewports: ["desktop", "mobile"] },
];

// Full Stage 05 suite: covers EVERY route (44) + all dynamic states & workspaces in desktop 1440 + mobile 390 x VI & EN
const FULL_TASKS = [
  { id: "R01-HOME", route: "/", role: "guest", family: "homepage", component: "UnifiedHero/HomePage", locales: ["vi", "en"], viewports: ["desktop", "mobile", "tablet"] },
  { id: "R02-MARKET", route: "/marketplace", role: "guest", family: "marketplace", component: "Marketplace/ProductCard", locales: ["vi", "en"], viewports: ["desktop", "mobile", "tablet"] },
  { id: "R03-MARKET-ALIAS", route: "/market", role: "guest", family: "marketplace", component: "MarketAlias", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R04-SEARCH", route: "/search?q=buoi", role: "guest", family: "search", component: "SearchPage", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R05-SEARCH-EMPTY", route: "/search?q=khongtimthay999", role: "guest", family: "search", component: "SearchEmptyState", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R06-PROD-FRESH", route: "/products/buoi-da-xanh-tan-trieu", role: "guest", family: "product-detail", component: "ProductDetail", locales: ["vi", "en"], viewports: ["desktop", "mobile", "tablet"] },
  { id: "R07-PROD-PREORDER", route: "/products/chom-chom-nhan-hen-mua", role: "guest", family: "product-detail", component: "ProductPreOrder", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R08-PROD-ADULT", route: "/products/ruou-buoi-tan-trieu-chum-sanh", role: "guest", family: "product-detail", component: "ProductAdult18", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R09-FARMS", route: "/farms", role: "guest", family: "farms", component: "FarmsDirectory", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R10-FARM-BATU", route: "/farms/nha-vuon-ba-tu-long-khanh", role: "guest", family: "farm-profile", component: "FarmProfileBaTu", locales: ["vi", "en"], viewports: ["desktop", "mobile", "tablet"] },
  { id: "R11-FARM-BAMINH", route: "/farms/vuon-buoi-chu-ba-minh", role: "guest", family: "farm-profile", component: "FarmProfileBaMinh", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R12-EXPLORE-MAP", route: "/explore", role: "guest", family: "map", component: "NaiFarmMap", locales: ["vi", "en"], viewports: ["desktop", "mobile", "tablet"] },
  { id: "R13-EXPLORE-TOURS", route: "/explore?view=tours", role: "guest", family: "agritourism", component: "ExploreTours", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R14-EXPERIENCE-BOOK", route: "/experiences/mot-ngay-lam-nong-dan-cu-lao-chu-ba-minh", role: "guest", family: "agritourism", component: "ExperienceBookingCheckout", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R15-EVENTS", route: "/events", role: "guest", family: "events", component: "EventsHub", locales: ["vi", "en"], viewports: ["desktop", "mobile", "tablet"] },
  { id: "R16-EVENTS-DEALS", route: "/events?tab=deals", role: "guest", family: "events", component: "EventsDeals", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R17-EVENTS-CAL", route: "/events?tab=calendar", role: "guest", family: "calendar", component: "NaiCalendarBoard", locales: ["vi", "en"], viewports: ["desktop", "mobile", "tablet"] },
  { id: "R18-EVENTS-HOLIDAYS", route: "/events?tab=holidays", role: "guest", family: "events", component: "OfficialObservances", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R19-EVENT-DETAIL", route: "/events/ngay-hoi-nong-san-va-thanh-nien-05-12", role: "guest", family: "events", component: "CampaignDetail", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R20-LIVE-HUB", route: "/live", role: "guest", family: "live", component: "LiveHub", locales: ["vi", "en"], viewports: ["desktop", "mobile", "tablet"] },
  { id: "R21-LIVE-REPLAY", route: "/live/NF-LIVE-REPLAY-TT", role: "guest", family: "live", component: "LiveRoomReplay", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R22-LIVE-DEMO", route: "/live/demo", role: "guest", family: "live", component: "LiveDemo", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R23-LIVE-CAMERA", route: "/live/camera", role: "guest", family: "live", component: "LiveCamera", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R24-LIVE-STUDIO", route: "/live/studio", role: "W02", family: "live", component: "LiveStudioList", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R25-LIVE-STUDIO-ID", route: "/live/studio/NF-LIVE-01", role: "W02", family: "live", component: "LiveStudioRoom", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R26-LEARN-HUB", route: "/learn", role: "W03", family: "learning", component: "LearnLibrary", locales: ["vi", "en"], viewports: ["desktop", "mobile", "tablet"] },
  { id: "R27-LEARN-LESSON", route: "/learn/hanh-trinh-hat-dieu-dong-nai", role: "W03", family: "learning", component: "InteractiveLessonPlayer", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R28-QUALITY", route: "/quality", role: "guest", family: "quality", component: "QualityCenterPanel", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R29-TRACE-HUB", route: "/trace", role: "guest", family: "trace", component: "TraceHub", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R30-TRACE-VALID", route: "/trace/NF-DEMO-001", role: "guest", family: "trace", component: "QrPassportValid", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R31-TRACE-INVALID", route: "/trace/NF-INVALID-999", role: "guest", family: "trace", component: "QrPassportInvalid", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R32-TRACE-SCAN", route: "/trace/scan", role: "guest", family: "trace", component: "QrScannerPage", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R33-CREDENTIAL", route: "/credentials/NF-CERT-2026-001", role: "guest", family: "credentials", component: "CredentialVerify", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R34-POLICIES", route: "/policies", role: "guest", family: "legal", component: "PoliciesPage", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R35-SIGNIN", route: "/sign-in", role: "guest", family: "auth", component: "SignInPage", locales: ["vi", "en"], viewports: ["desktop", "mobile", "tablet"] },
  { id: "R36-SIGNUP", route: "/sign-up", role: "guest", family: "auth", component: "SignUpPage", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R37-FORGOT", route: "/forgot-password", role: "guest", family: "auth", component: "ForgotPasswordPage", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R38-DEMO", route: "/demo", role: "guest", family: "demo", component: "DemoHubPage", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R39-NOTFOUND", route: "/khong-ton-tai-404", role: "guest", family: "error", component: "NotFound404", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  // Authenticated W01..W06
  { id: "R40-CART", route: "/cart", role: "W01", family: "checkout", component: "CartPage", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R41-CHECKOUT", route: "/checkout", role: "W01", family: "checkout", component: "CheckoutPage", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R42-W01-ACCOUNT", route: "/account", role: "W01", family: "workspace-W01", component: "AccountOverview", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R43-W01-ORDERS", route: "/account/orders", role: "W01", family: "workspace-W01", component: "AccountOrders", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R44-W01-ORDER-DETAIL", route: "/account/orders/NF-ORD-DEMO-01", role: "W01", family: "workspace-W01", component: "OrderDetail", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R45-W01-FAVORITES", route: "/account/favorites", role: "W01", family: "workspace-W01", component: "FavoritesCompare", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R46-W01-SETTINGS", route: "/account/settings", role: "W01", family: "workspace-W01", component: "AccountSettings", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R47-W01-BOOKING", route: "/account/bookings/EXP-BOOK-01", role: "W01", family: "workspace-W01", component: "BookingDetail", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R48-W02-SIMPLE", route: "/farmer", role: "W02", family: "workspace-W02", component: "FarmerSimpleOrders", locales: ["vi", "en"], viewports: ["desktop", "mobile", "tablet"] },
  { id: "R49-W02-ERP-OVERVIEW", route: "/farmer?mode=erp&tab=overview", role: "W02", family: "workspace-W02", component: "FarmerOverviewAnalytics", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R50-W02-ERP-STUDIO", route: "/farmer?mode=erp&tab=studio", role: "W02", family: "workspace-W02", component: "CreativeStudioPanel", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R51-W02-PUBLISH", route: "/farmer/publish", role: "W02", family: "farmer-publish", component: "FarmerQuickPublish", locales: ["vi", "en"], viewports: ["desktop", "mobile", "tablet"] },
  { id: "R52-W03-VOLUNTEER", route: "/volunteer", role: "W03", family: "workspace-W03", component: "VolunteerMissions", locales: ["vi", "en"], viewports: ["desktop", "mobile", "tablet"] },
  { id: "R53-W04-COORD", route: "/coordinator", role: "W04", family: "workspace-W04", component: "CoordinatorHours", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R54-W05-ORG", route: "/organization", role: "W05", family: "workspace-W05", component: "HtxTanTrieuOverview", locales: ["vi", "en"], viewports: ["desktop", "mobile", "tablet"] },
  { id: "R55-W05-B2B", route: "/organization?org=b2b", role: "W05", family: "workspace-W05", component: "OrganizationB2B", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R56-W05-SCHOOL", route: "/organization?org=school", role: "W05", family: "workspace-W05", component: "OrganizationSchool", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
  { id: "R57-W06-ADMIN", route: "/admin", role: "W06", family: "workspace-W06", component: "AdminOverview", locales: ["vi", "en"], viewports: ["desktop", "mobile", "tablet"] },
  { id: "R58-W06-DENIED", route: "/admin", role: "W01", family: "security", component: "AccessDeniedCard", locales: ["vi", "en"], viewports: ["desktop", "mobile"] },
];

const VIEWPORT_MAP = {
  desktop: { width: 1440, height: 900, folder: "desktop", isMobile: false },
  tablet: { width: 768, height: 1024, folder: "tablet", isMobile: false },
  tablet1024: { width: 1024, height: 768, folder: "tablet", isMobile: false },
  mobile: { width: 390, height: 844, folder: "mobile", isMobile: true, hasTouch: true },
};

async function authenticateContext(browser, roleKey, defaultLocale = "vi") {
  const vp = { width: 1440, height: 900 };
  const context = await browser.newContext({ viewport: vp });
  if (!roleKey || roleKey === "guest") return context;
  const spec = ROLE_ACCOUNTS[roleKey];
  if (!spec) return context;
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/sign-in?lang=${defaultLocale}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  // Click matching account card's action button
  const cards = page.locator("article, div").filter({ hasText: spec.cardName });
  const btn = cards.locator("button").filter({ hasText: /Chọn tài khoản này|Use this profile/i }).first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(800);
  }
  await page.close();
  return context;
}

async function waitForPageReady(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
  }).catch(() => {});
  await page.waitForTimeout(500);
  // Controlled scroll across full document to trigger lazy images then reset to top
  await page.evaluate(async () => {
    const h = Math.min(document.body.scrollHeight, 36000);
    const step = Math.max(700, Math.floor(h / 24));
    for (let y = 0; y <= h; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 35));
    }
    window.scrollTo(0, 0);
  }).catch(() => {});
  await page.waitForTimeout(300);
  await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll("img:not(.leaflet-tile)"));
    await Promise.all(
      imgs.map(
        (img) =>
          img.complete ||
          new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
            setTimeout(resolve, 1500);
          }),
      ),
    );
  }).catch(() => {});
}

async function collectDomMetrics(page) {
  return page.evaluate(() => {
    const sw = document.documentElement.scrollWidth;
    const iw = window.innerWidth;
    const sh = document.body.scrollHeight;
    const imgs = Array.from(document.querySelectorAll("img:not(.leaflet-tile)"));
    const brokenImages = imgs
      .filter((i) => window.getComputedStyle(i).display !== "none" && i.complete && i.naturalWidth === 0)
      .map((i) => i.getAttribute("src") || "empty");

    const h = document.querySelector("header");
    const headerParts = {};
    if (h) {
      const logo = h.querySelector("a");
      const nav = h.querySelector("nav");
      const search = h.querySelector("input[type='search']");
      const langGroup = h.querySelector("[role='group']");
      const cart = h.querySelector("a[href*='/cart']");
      const mapRect = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return r.width > 0 ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } : null;
      };
      headerParts.box = mapRect(h);
      headerParts.logo = mapRect(logo);
      headerParts.nav = mapRect(nav);
      headerParts.search = mapRect(search);
      headerParts.lang = mapRect(langGroup);
      headerParts.cart = mapRect(cart);
    }

    // Measure ProductCard same-row alignment delta
    const articles = Array.from(document.querySelectorAll("article"));
    let cardAlignmentMaxDeltaPx = 0;
    const rowBuckets = new Map();
    for (const art of articles.slice(0, 12)) {
      const top = Math.round(art.getBoundingClientRect().top / 10) * 10;
      const h3 = art.querySelector("h3");
      const btn = art.querySelector("button, a[href*='/trace/']:last-of-type");
      if (!h3) continue;
      if (!rowBuckets.has(top)) rowBuckets.set(top, []);
      rowBuckets.get(top).push({
        titleY: Math.round(h3.getBoundingClientRect().top),
        ctaY: btn ? Math.round(btn.getBoundingClientRect().top) : null,
      });
    }
    for (const row of rowBuckets.values()) {
      if (row.length < 2) continue;
      const ys = row.map((x) => x.titleY);
      cardAlignmentMaxDeltaPx = Math.max(cardAlignmentMaxDeltaPx, Math.max(...ys) - Math.min(...ys));
      const ctas = row.map((x) => x.ctaY).filter((v) => v !== null);
      if (ctas.length >= 2) {
        cardAlignmentMaxDeltaPx = Math.max(cardAlignmentMaxDeltaPx, Math.max(...ctas) - Math.min(...ctas));
      }
    }

    const h1 = document.querySelector("h1");
    const h1Box = h1 ? h1.getBoundingClientRect() : null;
    const hasHorizontalScroll = sw > iw + 1;

    return {
      overflowX: hasHorizontalScroll,
      scrollWidth: sw,
      innerWidth: iw,
      scrollHeight: sh,
      brokenImageCount: brokenImages.length,
      brokenImages,
      header: headerParts,
      cardAlignmentMaxDeltaPx,
      h1Height: h1Box ? Math.round(h1Box.height) : 0,
    };
  });
}

async function captureTask({ context, task, locale, vpKey, captures, metricsLog }) {
  const vpSpec = VIEWPORT_MAP[vpKey];
  const relDir = path.join("screenshots", vpSpec.folder, locale);
  const absDir = path.join(OUT_DIR, relDir);
  fs.mkdirSync(absDir, { recursive: true });

  const fileName = `${task.id}-${vpKey}-${locale}.png`;
  const relPath = path.join(relDir, fileName).replace(/\\/g, "/");
  const absPath = path.join(OUT_DIR, relPath);

  if (RESUME && fs.existsSync(absPath)) {
    captures.push({
      screenId: task.id,
      route: task.route,
      workspace: task.role,
      role: task.role,
      locale,
      viewport: `${vpSpec.width}x${vpSpec.height}`,
      uiState: task.family,
      component: task.component,
      capturedAt: new Date().toISOString(),
      status: "captured_resumed",
      captureType: "full",
      relativePath: relPath,
      sha256: sha256File(absPath),
    });
    return;
  }

  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const networkFails = [];
  await page.setViewportSize({ width: vpSpec.width, height: vpSpec.height });

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 180));
  });
  page.on("pageerror", (err) => pageErrors.push(err.message.slice(0, 180)));
  page.on("requestfailed", (req) => {
    if (req.failure()?.errorText !== "net::ERR_ABORTED") {
      networkFails.push(`${req.failure()?.errorText || "FAIL"} ${req.url().slice(0, 100)}`);
    }
  });

  const url = `${BASE_URL}${appendLocaleParam(task.route, locale)}`;
  let httpStatus = 0;
  try {
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
    httpStatus = res ? res.status() : 0;
    await waitForPageReady(page);

    // Ensure full-page and clean viewport capture
    await page.screenshot({ path: absPath, fullPage: true });
    const dom = await collectDomMetrics(page);

    // Run axe-core scan on desktop VI & EN core routes
    let axeViolations = 0;
    let axeSummary = [];
    if (axeSource && vpKey === "desktop") {
      await page.addScriptTag({ content: axeSource }).catch(() => {});
      const axeRes = await page.evaluate(async () => {
        // @ts-expect-error -- global axe injected dynamically
        if (typeof axe === "undefined") return { violations: [] };
        // @ts-expect-error -- global axe injected dynamically
        return axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] } });
      }).catch(() => ({ violations: [] }));
      axeViolations = axeRes.violations.length;
      axeSummary = axeRes.violations.map((v) => `${v.id} (${v.impact}, ${v.nodes.length})`);
    }

    // Section crops on homepage, header, footer, products, maps, dashboards
    if (vpKey === "desktop" || vpKey === "mobile") {
      if (task.id.includes("HOME")) {
        const secHomeDir = path.join(OUT_DIR, "sections", "homepage");
        const secHeaderDir = path.join(OUT_DIR, "sections", "header");
        const secFooterDir = path.join(OUT_DIR, "sections", "footer");
        fs.mkdirSync(secHomeDir, { recursive: true });
        fs.mkdirSync(secHeaderDir, { recursive: true });
        fs.mkdirSync(secFooterDir, { recursive: true });

        // Viewport top crop
        const vpTopFile = `sections/homepage/hero-viewport-${vpKey}-${locale}.png`;
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(150);
        await page.screenshot({ path: path.join(OUT_DIR, vpTopFile), fullPage: false });
        captures.push({
          screenId: `${task.id}-VIEWPORT`,
          route: task.route,
          workspace: task.role,
          role: task.role,
          locale,
          viewport: `${vpSpec.width}x${vpSpec.height}`,
          uiState: "above-the-fold",
          component: "Hero+Header",
          capturedAt: new Date().toISOString(),
          status: "captured",
          captureType: "section",
          relativePath: vpTopFile,
          sha256: sha256File(path.join(OUT_DIR, vpTopFile)),
        });

        const hdrEl = page.locator("header").first();
        if (await hdrEl.isVisible().catch(() => false)) {
          const hdrRel = `sections/header/header-${vpKey}-${locale}.png`;
          await hdrEl.screenshot({ path: path.join(OUT_DIR, hdrRel) });
          captures.push({
            screenId: `${task.id}-HEADER`,
            route: task.route,
            workspace: task.role,
            role: task.role,
            locale,
            viewport: `${vpSpec.width}x${vpSpec.height}`,
            uiState: "header",
            component: "AppHeader",
            capturedAt: new Date().toISOString(),
            status: "captured",
            captureType: "crop",
            relativePath: hdrRel,
            sha256: sha256File(path.join(OUT_DIR, hdrRel)),
          });
        }

        const ftrEl = page.locator("footer").first();
        if (await ftrEl.isVisible().catch(() => false)) {
          await ftrEl.scrollIntoViewIfNeeded().catch(() => {});
          await page.waitForTimeout(120);
          const ftrRel = `sections/footer/footer-${vpKey}-${locale}.png`;
          await ftrEl.screenshot({ path: path.join(OUT_DIR, ftrRel) });
          captures.push({
            screenId: `${task.id}-FOOTER`,
            route: task.route,
            workspace: task.role,
            role: task.role,
            locale,
            viewport: `${vpSpec.width}x${vpSpec.height}`,
            uiState: "footer",
            component: "AppFooter",
            capturedAt: new Date().toISOString(),
            status: "captured",
            captureType: "crop",
            relativePath: ftrRel,
            sha256: sha256File(path.join(OUT_DIR, ftrRel)),
          });
          await page.evaluate(() => window.scrollTo(0, 0));
        }
      }

      if (task.family === "marketplace" && vpKey === "desktop") {
        const gridEl = page.locator("div.grid-safe").first();
        if (await gridEl.isVisible().catch(() => false)) {
          const pDir = path.join(OUT_DIR, "sections", "products");
          fs.mkdirSync(pDir, { recursive: true });
          const pRel = `sections/products/product-grid-${locale}.png`;
          await gridEl.screenshot({ path: path.join(OUT_DIR, pRel) }).catch(() => {});
          if (fs.existsSync(path.join(OUT_DIR, pRel))) {
            captures.push({
              screenId: `${task.id}-GRID`,
              route: task.route,
              workspace: task.role,
              role: task.role,
              locale,
              viewport: `${vpSpec.width}x${vpSpec.height}`,
              uiState: "product-grid-crop",
              component: "ProductCard",
              capturedAt: new Date().toISOString(),
              status: "captured",
              captureType: "crop",
              relativePath: pRel,
              sha256: sha256File(path.join(OUT_DIR, pRel)),
            });
          }
        }
      }

      if (task.role.startsWith("W0")) {
        const wsDir = path.join(OUT_DIR, "workspaces", task.role);
        fs.mkdirSync(wsDir, { recursive: true });
        const wsRel = `workspaces/${task.role}/${task.id}-${vpKey}-${locale}.png`;
        fs.copyFileSync(absPath, path.join(OUT_DIR, wsRel));
      }
    }

    captures.push({
      screenId: task.id,
      route: task.route,
      workspace: task.role,
      role: task.role,
      locale,
      viewport: `${vpSpec.width}x${vpSpec.height}`,
      uiState: task.family,
      component: task.component,
      capturedAt: new Date().toISOString(),
      status: "captured",
      captureType: "full",
      relativePath: relPath,
      sha256: sha256File(absPath),
      overflowX: dom.overflowX,
      brokenImages: dom.brokenImageCount,
    });

    metricsLog.push({
      screenId: task.id,
      route: task.route,
      role: task.role,
      locale,
      viewport: vpSpec.width,
      httpStatus,
      ...dom,
      consoleErrors,
      pageErrors,
      networkFails,
      axeViolations,
      axeSummary,
    });
    console.log(`[CAP] ${task.id} | ${locale} ${vpSpec.width} | status=${httpStatus} | overflow=${dom.overflowX} | broken=${dom.brokenImageCount} | alignDelta=${dom.cardAlignmentMaxDeltaPx}px`);
  } catch (err) {
    console.error(`[FAIL] ${task.id} (${locale} ${vpKey}):`, err.message);
    metricsLog.push({
      screenId: task.id,
      route: task.route,
      role: task.role,
      locale,
      viewport: vpSpec.width,
      error: err.message,
      consoleErrors,
      pageErrors,
      networkFails,
    });
  } finally {
    await page.close();
  }
}

async function captureMotionFilmstrip(browser, captures) {
  const mDir = path.join(OUT_DIR, "motion");
  fs.mkdirSync(mDir, { recursive: true });
  const delays = [0, 400, 1000, 2000, 4000, 8000];

  for (const [label, vp] of [
    ["desktop-vi", { width: 1440, height: 900, locale: "vi" }],
    ["desktop-en", { width: 1440, height: 900, locale: "en" }],
    ["mobile-vi", { width: 390, height: 844, locale: "vi" }],
  ]) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    await page.goto(`${BASE_URL}/?lang=${vp.locale}`, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts.ready).catch(() => {});

    let prevMs = 0;
    for (const t of delays) {
      if (t > prevMs) {
        await page.waitForTimeout(t - prevMs);
        prevMs = t;
      }
      const rel = `motion/hero-${label}-t${String(t).padStart(4, "0")}ms.png`;
      await page.screenshot({ path: path.join(OUT_DIR, rel), fullPage: false });
      captures.push({
        screenId: `MOTION-HERO-${label.toUpperCase()}-${t}MS`,
        route: "/",
        workspace: "guest",
        role: "guest",
        locale: vp.locale,
        viewport: `${vp.width}x${vp.height}`,
        uiState: `motion-t${t}ms`,
        component: "UnifiedHero",
        capturedAt: new Date().toISOString(),
        status: "captured",
        captureType: "motion",
        relativePath: rel,
        sha256: sha256File(path.join(OUT_DIR, rel)),
      });
    }
    await ctx.close();
  }

  // Reduced-motion capture
  const redCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const redPage = await redCtx.newPage();
  await redPage.goto(`${BASE_URL}/?lang=vi`, { waitUntil: "domcontentloaded" });
  await waitForPageReady(redPage);
  const redRel = "motion/hero-reduced-motion-1440-vi.png";
  await redPage.screenshot({ path: path.join(OUT_DIR, redRel), fullPage: false });
  captures.push({
    screenId: "MOTION-REDUCED",
    route: "/",
    workspace: "guest",
    role: "guest",
    locale: "vi",
    viewport: "1440x900",
    uiState: "prefers-reduced-motion",
    component: "UnifiedHero",
    capturedAt: new Date().toISOString(),
    status: "captured",
    captureType: "motion",
    relativePath: redRel,
    sha256: sha256File(path.join(OUT_DIR, redRel)),
  });
  await redCtx.close();
}

async function captureInteractiveStates(browser, contextsByRole, captures) {
  const sDir = path.join(OUT_DIR, "screenshots", "ui-states");
  fs.mkdirSync(sDir, { recursive: true });

  const saveState = async (page, stateId, route, role, locale, vpLabel, component, fullPage = false) => {
    const rel = `screenshots/ui-states/${stateId}-${locale}-${vpLabel}.png`;
    await page.screenshot({ path: path.join(OUT_DIR, rel), fullPage });
    captures.push({
      screenId: stateId,
      route,
      workspace: role,
      role,
      locale,
      viewport: vpLabel,
      uiState: stateId,
      component,
      capturedAt: new Date().toISOString(),
      status: "captured",
      captureType: "ui-state",
      relativePath: rel,
      sha256: sha256File(path.join(OUT_DIR, rel)),
    });
  };

  // 1. Header signed-in + Avatar Dropdown + Mobile Drawer + Search Autocomplete
  for (const loc of ["vi", "en"]) {
    const ctxW01 = contextsByRole.get("W01");
    const page = await ctxW01.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/?lang=${loc}`, { waitUntil: "domcontentloaded" });
    await waitForPageReady(page);
    await saveState(page, "STATE-HEADER-SIGNED", "/", "W01", loc, "1440x900", "AppHeader");

    // Open avatar menu
    const avBtn = page.locator("header button[aria-haspopup='menu']").last();
    if (await avBtn.isVisible().catch(() => false)) {
      await avBtn.click();
      await page.waitForTimeout(200);
      await saveState(page, "STATE-AVATAR-MENU", "/", "W01", loc, "1440x900", "AppHeaderAvatarMenu");
      await page.keyboard.press("Escape");
      await page.waitForTimeout(150);
    }

    // Open search suggestions
    const searchInput = page.locator("header input[type='search']").first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill("buoi");
      await page.waitForTimeout(250);
      await saveState(page, "STATE-SEARCH-SUGGESTIONS", "/", "W01", loc, "1440x900", "HeaderSearchListbox");
      await searchInput.fill("");
      await page.keyboard.press("Escape");
    }

    // Open Home Chatbot
    const chatBtn = page.locator("button[aria-label*='NaiAI']").first();
    if (await chatBtn.isVisible().catch(() => false)) {
      await chatBtn.click();
      await page.waitForTimeout(250);
      await saveState(page, "STATE-CHATBOT-OPEN", "/", "W01", loc, "1440x900", "NaiFarmHomeChat");
    }

    // Mobile drawer
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(250);
    const mobToggle = page.locator("header button[aria-label*='menu'], header button[aria-label*='Menu']").last();
    if (await mobToggle.isVisible().catch(() => false)) {
      await mobToggle.click();
      await page.waitForTimeout(200);
      await saveState(page, "STATE-MOBILE-DRAWER", "/", "W01", loc, "390x844", "MobileHeaderDrawer");
    }
    await page.close();
  }

  // 2. Map Offline Tile Block + GPS Denied + Reset to Dong Nai
  {
    const ctxGuest = contextsByRole.get("guest");
    const mPage = await ctxGuest.newPage();
    await mPage.setViewportSize({ width: 1440, height: 900 });
    await mPage.route("**/*tile.openstreetmap.org/**", (route) => route.abort("failed"));
    await mPage.goto(`${BASE_URL}/explore?lang=vi`, { waitUntil: "domcontentloaded" });
    await waitForPageReady(mPage);
    await mPage.waitForTimeout(600);
    await saveState(mPage, "STATE-MAP-LOCAL-FIRST", "/explore", "guest", "vi", "1440x900", "NaiFarmMap");
    // Click first marker / card safely (clustered markers can overlap at province zoom)
    try {
      const firstPin = mPage.locator(".leaflet-marker-icon").first();
      if (await firstPin.isVisible().catch(() => false)) {
        await firstPin.click({ force: true, timeout: 4000 });
        await mPage.waitForTimeout(250);
        await saveState(mPage, "STATE-MAP-POPUP", "/explore", "guest", "vi", "1440x900", "MapPopup");
      }
    } catch (e) {
      console.warn("[WARN] map pin click skipped:", e.message);
    }
    try {
      const osmBtn = mPage.locator("button").filter({ hasText: /Nền đường OSM|OSM Street/i }).first();
      if (await osmBtn.isVisible().catch(() => false)) {
        await osmBtn.click();
        await mPage.waitForTimeout(1400);
        await saveState(mPage, "STATE-MAP-OSM-FALLBACK", "/explore", "guest", "vi", "1440x900", "MapErrorState");
      }
    } catch (e) {
      console.warn("[WARN] osm fallback check skipped:", e.message);
    }
    await mPage.close();
  }

  // 2b. Empty cart + Calendar Week/Agenda + Publish Step 2
  {
    const ctxGuest = contextsByRole.get("guest");
    const cPage = await ctxGuest.newPage();
    await cPage.setViewportSize({ width: 1440, height: 900 });
    await cPage.goto(`${BASE_URL}/cart?lang=vi`, { waitUntil: "domcontentloaded" });
    await waitForPageReady(cPage);
    await cPage.evaluate(() => {
      try {
        localStorage.removeItem("naifarm_demo_cart");
      } catch {}
    });
    await cPage.reload({ waitUntil: "domcontentloaded" });
    await waitForPageReady(cPage);
    await saveState(cPage, "STATE-CART-EMPTY", "/cart", "guest", "vi", "1440x900", "CartEmptyState");
    await cPage.close();

    const calPage = await ctxGuest.newPage();
    await calPage.setViewportSize({ width: 1440, height: 900 });
    await calPage.goto(`${BASE_URL}/events?tab=calendar&lang=vi`, { waitUntil: "domcontentloaded" });
    await waitForPageReady(calPage);
    const weekBtn = calPage.locator("[role='tab']").filter({ hasText: /Tuần|Week/i }).first();
    if (await weekBtn.isVisible().catch(() => false)) {
      await weekBtn.click();
      await calPage.waitForTimeout(250);
      await saveState(calPage, "STATE-CALENDAR-WEEK", "/events?tab=calendar", "guest", "vi", "1440x900", "NaiCalendarWeek");
    }
    const agendaBtn = calPage.locator("[role='tab']").filter({ hasText: /Danh sách|Agenda/i }).first();
    if (await agendaBtn.isVisible().catch(() => false)) {
      await agendaBtn.click();
      await calPage.waitForTimeout(250);
      await saveState(calPage, "STATE-CALENDAR-AGENDA", "/events?tab=calendar", "guest", "vi", "1440x900", "NaiCalendarAgenda");
    }
    await calPage.close();
  }

  {
    const ctxW02 = contextsByRole.get("W02");
    const pPage = await ctxW02.newPage();
    await pPage.setViewportSize({ width: 1440, height: 900 });
    await pPage.goto(`${BASE_URL}/farmer/publish?lang=vi`, { waitUntil: "domcontentloaded" });
    await waitForPageReady(pPage);
    const nextBtn = pPage.locator("button").filter({ hasText: /Bước 2|Tiếp tục/i }).first();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await pPage.waitForTimeout(300);
      await saveState(pPage, "STATE-PUBLISH-STEP2", "/farmer/publish", "W02", "vi", "1440x900", "FarmerPublishStep2", true);
    }
    await pPage.close();
  }

  // 3. Certificate PDF Modal on Volunteer NaiPass
  {
    const ctxW03 = contextsByRole.get("W03");
    const vPage = await ctxW03.newPage();
    await vPage.setViewportSize({ width: 1440, height: 900 });
    await vPage.goto(`${BASE_URL}/volunteer?lang=vi`, { waitUntil: "domcontentloaded" });
    await waitForPageReady(vPage);
    const passBtn = vPage.locator("button, a").filter({ hasText: /NaiPass/i }).first();
    if (await passBtn.isVisible().catch(() => false)) {
      await passBtn.click();
      await vPage.waitForTimeout(300);
      const certBtn = vPage.locator("button").filter({ hasText: /Chứng nhận & Tải PDF|Certificate/i }).first();
      if (await certBtn.isVisible().catch(() => false)) {
        await certBtn.click();
        await vPage.waitForTimeout(400);
        await saveState(vPage, "STATE-CERTIFICATE-MODAL", "/volunteer", "W03", "vi", "1440x900", "CertificatePreviewModal");
      }
    }
    await vPage.close();
  }

  // 4. Learn 2D Anatomy + Quiz tabs
  {
    const ctxW03 = contextsByRole.get("W03");
    const lPage = await ctxW03.newPage();
    await lPage.setViewportSize({ width: 1440, height: 900 });
    await lPage.goto(`${BASE_URL}/learn/cau-tao-buoi-da-xanh-tan-trieu?lang=vi`, { waitUntil: "domcontentloaded" });
    await waitForPageReady(lPage);
    const anatBtn = lPage.locator("button").filter({ hasText: /Giải phẫu|2D Anatomy/i }).first();
    if (await anatBtn.isVisible().catch(() => false)) {
      await anatBtn.click();
      await lPage.waitForTimeout(350);
      await saveState(lPage, "STATE-ANATOMY-2D", "/learn/cau-tao-buoi-da-xanh-tan-trieu", "W03", "vi", "1440x900", "ProduceAnatomy2D");
    }
    await lPage.close();
  }

  // 5. CMS Manager Panel inside Admin
  {
    const ctxW06 = contextsByRole.get("W06");
    const aPage = await ctxW06.newPage();
    await aPage.setViewportSize({ width: 1440, height: 900 });
    await aPage.goto(`${BASE_URL}/admin?lang=vi`, { waitUntil: "domcontentloaded" });
    await waitForPageReady(aPage);
    const cmsBtn = aPage.locator("aside button, button").filter({ hasText: /CMS/i }).first();
    if (await cmsBtn.isVisible().catch(() => false)) {
      await cmsBtn.click();
      await aPage.waitForTimeout(500);
      await saveState(aPage, "STATE-ADMIN-CMS", "/admin", "W06", "vi", "1440x900", "CmsManagerPanel", true);
    }
    await aPage.close();
  }

  // 6. Responsive edge checks (320, 360, 1024, 1280, 1920 + 844x390 landscape + 200% zoom) on homepage & marketplace
  if (MODE === "full" || MODE === "after") {
    const ctxGuest = contextsByRole.get("guest");
    for (const [label, vp] of [
      ["320x740", { width: 320, height: 740 }],
      ["360x800", { width: 360, height: 800 }],
      ["375x812", { width: 375, height: 812 }],
      ["414x896", { width: 414, height: 896 }],
      ["1024x768", { width: 1024, height: 768 }],
      ["1280x800", { width: 1280, height: 800 }],
      ["1536x864", { width: 1536, height: 864 }],
      ["1920x1080", { width: 1920, height: 1080 }],
      ["844x390-landscape", { width: 844, height: 390 }],
    ]) {
      const p = await ctxGuest.newPage();
      await p.setViewportSize({ width: vp.width, height: vp.height });
      await p.goto(`${BASE_URL}/?lang=vi`, { waitUntil: "domcontentloaded" });
      await waitForPageReady(p);
      await saveState(p, `EDGE-HOME-${label}`, "/", "guest", "vi", label, "ResponsiveHome", true);
      await p.goto(`${BASE_URL}/marketplace?lang=vi`, { waitUntil: "domcontentloaded" });
      await waitForPageReady(p);
      await saveState(p, `EDGE-MARKET-${label}`, "/marketplace", "guest", "vi", label, "ResponsiveMarket", false);
      await p.close();
    }

    // 200% text zoom check
    const zPage = await ctxGuest.newPage();
    await zPage.setViewportSize({ width: 1280, height: 800 });
    await zPage.goto(`${BASE_URL}/marketplace?lang=vi`, { waitUntil: "domcontentloaded" });
    await waitForPageReady(zPage);
    await zPage.evaluate(() => {
      document.documentElement.style.fontSize = "32px";
    });
    await zPage.waitForTimeout(300);
    await saveState(zPage, "A11Y-ZOOM-200-MARKET", "/marketplace", "guest", "vi", "1280x800", "Zoom200Reflow", false);
    await zPage.close();
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const metricsDir = path.join(OUT_DIR, "metrics");
  fs.mkdirSync(metricsDir, { recursive: true });

  const executablePath = resolveChromeExecutable();
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });

  const tasksSource = MODE === "full" ? FULL_TASKS : BASELINE_TASKS;
  const tasks = ROLE_FILTER ? tasksSource.filter((t) => t.role === ROLE_FILTER) : tasksSource;

  const neededRoles = Array.from(new Set(["guest", "W01", "W02", "W03", "W06", ...tasks.map((t) => t.role)]));
  const contextsByRole = new Map();
  const captures = [];
  const metricsLog = [];

  try {
    for (const roleKey of neededRoles) {
      contextsByRole.set(roleKey, await authenticateContext(browser, roleKey, "vi"));
    }

    for (const task of tasks) {
      const ctx = contextsByRole.get(task.role) ?? contextsByRole.get("guest");
      const locales = LOCALE_FILTER ? task.locales.filter((l) => l === LOCALE_FILTER) : task.locales;
      for (const locale of locales) {
        for (const vpKey of task.viewports) {
          await captureTask({ context: ctx, task, locale, vpKey, captures, metricsLog });
        }
      }
    }

    await captureMotionFilmstrip(browser, captures);
    await captureInteractiveStates(browser, contextsByRole, captures);

    // Compute VI vs EN header geometry deltas
    const headerDeltas = [];
    const byKey = new Map();
    for (const m of metricsLog) {
      if (!m.header?.box) continue;
      const k = `${m.screenId}::${m.viewport}`;
      if (!byKey.has(k)) byKey.set(k, {});
      byKey.get(k)[m.locale] = m.header;
    }
    for (const [k, pair] of byKey.entries()) {
      if (pair.vi && pair.en) {
        const deltaH = Math.abs((pair.vi.box?.h ?? 0) - (pair.en.box?.h ?? 0));
        const deltaSearchX = pair.vi.search && pair.en.search ? Math.abs(pair.vi.search.x - pair.en.search.x) : 0;
        const deltaLangX = pair.vi.lang && pair.en.lang ? Math.abs(pair.vi.lang.x - pair.en.lang.x) : 0;
        headerDeltas.push({ key: k, deltaH, deltaSearchX, deltaLangX });
      }
    }

    const summary = {
      stage: STAGE,
      mode: MODE,
      baseUrl: BASE_URL,
      generatedAt: new Date().toISOString(),
      totalCaptures: captures.length,
      overflowCount: metricsLog.filter((m) => m.overflowX).length,
      brokenImagePages: metricsLog.filter((m) => (m.brokenImageCount ?? 0) > 0).length,
      maxCardAlignmentDeltaPx: Math.max(0, ...metricsLog.map((m) => m.cardAlignmentMaxDeltaPx ?? 0)),
      headerDeltas,
      captures,
    };

    fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(summary, null, 2));
    fs.writeFileSync(path.join(metricsDir, "geometry-axe-log.json"), JSON.stringify(metricsLog, null, 2));
    console.log(`\n=== CAPTURE DONE (${STAGE}/${MODE}) ===`);
    console.log(`Captures: ${captures.length}, Overflow pages: ${summary.overflowCount}, Broken img pages: ${summary.brokenImagePages}, Max card delta: ${summary.maxCardAlignmentDeltaPx}px`);
  } finally {
    for (const ctx of contextsByRole.values()) {
      await ctx.close().catch(() => {});
    }
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
