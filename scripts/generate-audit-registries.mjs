#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
function getArg(name, fallback) {
  const idx = args.indexOf(name);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
}

const repoRoot = path.resolve(process.cwd());
const appDir = path.join(repoRoot, "src", "app");
const compDir = path.join(repoRoot, "src", "components");
const outDir = path.resolve(repoRoot, getArg("--out", "artifacts/naifarm-final/01-before"));

fs.mkdirSync(outDir, { recursive: true });

function walk(dir, predicate) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(full, predicate));
    } else if (predicate(full)) {
      results.push(full);
    }
  }
  return results;
}

const pageFiles = walk(appDir, (f) => path.basename(f) === "page.tsx").sort();
const hasNotFound = fs.existsSync(path.join(appDir, "not-found.tsx"));
const componentFiles = walk(compDir, (f) => f.endsWith(".tsx")).sort();

const routes = pageFiles.map((f) => {
  const rel = path.relative(appDir, f).replace(/\\/g, "/");
  const route = rel === "page.tsx" ? "/" : "/" + rel.replace(/\/page\.tsx$/, "");
  const isDynamic = route.includes("[");
  const roleScope =
    route.startsWith("/farmer") ? "W02" :
    route.startsWith("/volunteer") ? "W03" :
    route.startsWith("/coordinator") ? "W04" :
    route.startsWith("/organization") ? "W05" :
    route.startsWith("/admin") ? "W06" :
    route.startsWith("/account") || route === "/cart" || route === "/checkout" ? "W01" : "public";
  return {
    routePattern: route,
    sourceFile: path.relative(repoRoot, f).replace(/\\/g, "/"),
    isDynamic,
    roleScope,
  };
});

if (hasNotFound) {
  routes.push({
    routePattern: "/404",
    sourceFile: "src/app/not-found.tsx",
    isDynamic: false,
    roleScope: "public",
    isNotFoundTemplate: true,
  });
}

const components = componentFiles.map((f) => ({
  name: path.basename(f, ".tsx"),
  sourceFile: path.relative(repoRoot, f).replace(/\\/g, "/"),
  category: path.relative(compDir, path.dirname(f)).replace(/\\/g, "/") || "root",
}));

// Authoritative scenario registry matching real dynamic seed IDs, workspace tabs, and UI states
const scenarios = [
  // Core public routes + representative dynamic variants
  { id: "SCN-HOME", route: "/", family: "homepage", role: "guest", state: "default" },
  { id: "SCN-MARKET", route: "/marketplace", family: "marketplace", role: "guest", state: "all-products" },
  { id: "SCN-MARKET-NAIBOX", route: "/marketplace?collection=naibox", family: "marketplace", role: "guest", state: "collection-naibox" },
  { id: "SCN-MARKET-ALIAS", route: "/market", family: "marketplace", role: "guest", state: "alias-route" },
  { id: "SCN-SEARCH", route: "/search?q=buoi", family: "search", role: "guest", state: "search-results" },
  { id: "SCN-SEARCH-EMPTY", route: "/search?q=zzzznotfound", family: "search", role: "guest", state: "empty-result" },
  { id: "SCN-PROD-FRESH", route: "/products/buoi-da-xanh-tan-trieu", family: "product-detail", role: "guest", state: "in-season-fresh" },
  { id: "SCN-PROD-PREORDER", route: "/products/chom-chom-nhan-hen-mua", family: "product-detail", role: "guest", state: "pre-order-empty" },
  { id: "SCN-PROD-ADULT", route: "/products/ruou-buoi-tan-trieu-chum-sanh", family: "product-detail", role: "guest", state: "adult-18-restricted" },
  { id: "SCN-PROD-PACKAGED", route: "/products/mut-vo-buoi-say-deo-mat-ong", family: "product-detail", role: "guest", state: "packaged-jam" },
  { id: "SCN-FARMS", route: "/farms", family: "farms", role: "guest", state: "directory" },
  { id: "SCN-FARM-BATU", route: "/farms/nha-vuon-ba-tu-long-khanh", family: "farm-profile", role: "guest", state: "golden-ba-tu" },
  { id: "SCN-FARM-BAMINH", route: "/farms/vuon-buoi-chu-ba-minh", family: "farm-profile", role: "guest", state: "tan-trieu-replay" },
  { id: "SCN-EXPLORE-MAP", route: "/explore", family: "map", role: "guest", state: "vector-default" },
  { id: "SCN-EXPLORE-TOURS", route: "/explore?view=tours", family: "agritourism", role: "guest", state: "tours-list" },
  { id: "SCN-EXPERIENCE-DETAIL", route: "/experiences/mot-ngay-lam-nong-dan-cu-lao-chu-ba-minh", family: "agritourism", role: "guest", state: "tour-booking" },
  { id: "SCN-EVENTS-CAMPAIGNS", route: "/events", family: "events", role: "guest", state: "campaigns" },
  { id: "SCN-EVENTS-CALENDAR", route: "/events?tab=calendar", family: "calendar", role: "guest", state: "calendar-board" },
  { id: "SCN-EVENTS-DEALS", route: "/events?tab=deals", family: "events", role: "guest", state: "deals" },
  { id: "SCN-EVENTS-HOLIDAYS", route: "/events?tab=holidays", family: "events", role: "guest", state: "official-holidays" },
  { id: "SCN-EVENT-DETAIL", route: "/events/ngay-hoi-nong-san-thanh-nien-05-12".replace("thanh-nien-05-12", "va-thanh-nien-05-12"), family: "events", role: "guest", state: "campaign-detail" },
  { id: "SCN-LIVE-HUB", route: "/live", family: "live", role: "guest", state: "live-hub" },
  { id: "SCN-LIVE-REPLAY", route: "/live/NF-LIVE-REPLAY-TT", family: "live", role: "guest", state: "replay-room" },
  { id: "SCN-LIVE-SCHEDULED", route: "/live/NF-LIVE-01", family: "live", role: "guest", state: "scheduled-room" },
  { id: "SCN-LIVE-DEMO", route: "/live/demo", family: "live", role: "guest", state: "live-demo" },
  { id: "SCN-LIVE-CAMERA", route: "/live/camera", family: "live", role: "guest", state: "live-camera" },
  { id: "SCN-LIVE-STUDIO", route: "/live/studio", family: "live", role: "demo-w02-chu-ba-tu", state: "live-studio-list" },
  { id: "SCN-LIVE-STUDIO-ROOM", route: "/live/studio/NF-LIVE-01", family: "live", role: "demo-w02-chu-ba-tu", state: "live-studio-room" },
  { id: "SCN-LEARN-HUB", route: "/learn", family: "learning", role: "guest", state: "course-library" },
  { id: "SCN-LEARN-LESSON", route: "/learn/hanh-trinh-hat-dieu-dong-nai", family: "learning", role: "demo-w03-minh-anh", state: "lesson-player" },
  { id: "SCN-QUALITY", route: "/quality", family: "quality", role: "guest", state: "26-standards" },
  { id: "SCN-TRACE-HUB", route: "/trace", family: "trace", role: "guest", state: "lookup-hub" },
  { id: "SCN-TRACE-VALID", route: "/trace/NF-DEMO-001", family: "trace", role: "guest", state: "qr-valid-batch" },
  { id: "SCN-TRACE-INVALID", route: "/trace/NF-INVALID-999", family: "trace", role: "guest", state: "qr-invalid-batch" },
  { id: "SCN-TRACE-SCAN", route: "/trace/scan", family: "trace", role: "guest", state: "qr-scanner" },
  { id: "SCN-CREDENTIAL", route: "/credentials/NF-CERT-2026-001", family: "credentials", role: "guest", state: "certificate-verify" },
  { id: "SCN-POLICIES", route: "/policies", family: "legal", role: "guest", state: "data-policies" },
  { id: "SCN-SIGNIN", route: "/sign-in", family: "auth", role: "guest", state: "role-switcher-form" },
  { id: "SCN-SIGNUP", route: "/sign-up", family: "auth", role: "guest", state: "signup-form" },
  { id: "SCN-FORGOT", route: "/forgot-password", family: "auth", role: "guest", state: "recovery-info" },
  { id: "SCN-DEMO-HUB", route: "/demo", family: "demo", role: "guest", state: "quick-hub" },
  { id: "SCN-NOTFOUND", route: "/route-does-not-exist-404", family: "error", role: "guest", state: "404-page" },
  // Commerce + W01 Account
  { id: "SCN-CART", route: "/cart", family: "checkout", role: "demo-w01-ngoc-linh", state: "cart-default" },
  { id: "SCN-CHECKOUT", route: "/checkout", family: "checkout", role: "demo-w01-ngoc-linh", state: "checkout-form" },
  { id: "SCN-W01-ACCOUNT", route: "/account", family: "workspace-W01", role: "demo-w01-ngoc-linh", state: "overview" },
  { id: "SCN-W01-ORDERS", route: "/account/orders", family: "workspace-W01", role: "demo-w01-ngoc-linh", state: "orders-list" },
  { id: "SCN-W01-ORDER-DETAIL", route: "/account/orders/NF-ORD-DEMO-01", family: "workspace-W01", role: "demo-w01-ngoc-linh", state: "order-detail" },
  { id: "SCN-W01-FAVORITES", route: "/account/favorites", family: "workspace-W01", role: "demo-w01-ngoc-linh", state: "favorites-compare" },
  { id: "SCN-W01-SETTINGS", route: "/account/settings", family: "workspace-W01", role: "demo-w01-ngoc-linh", state: "addresses-notifications" },
  { id: "SCN-W01-BOOKING", route: "/account/bookings/EXP-BOOK-01", family: "workspace-W01", role: "demo-w01-ngoc-linh", state: "booking-detail" },
  // W02 Farmer & Studio & Publish
  { id: "SCN-W02-FARMER", route: "/farmer", family: "workspace-W02", role: "demo-w02-chu-ba-tu", state: "simple-orders" },
  { id: "SCN-W02-PUBLISH", route: "/farmer/publish", family: "farmer-publish", role: "demo-w02-chu-ba-tu", state: "step1-wizard" },
  // W03 Volunteer & Minor Student Safeguarding
  { id: "SCN-W03-VOLUNTEER", route: "/volunteer", family: "workspace-W03", role: "demo-w03-minh-anh", state: "missions-explore" },
  // W04 Coordinator
  { id: "SCN-W04-COORD", route: "/coordinator", family: "workspace-W04", role: "demo-w04-thu-ha", state: "hours-review" },
  // W05 Organization / HTX Tan Trieu
  { id: "SCN-W05-ORG", route: "/organization", family: "workspace-W05", role: "demo-w05-htx-tan-trieu", state: "htx-overview" },
  // W06 Admin & Access Denied check
  { id: "SCN-W06-ADMIN", route: "/admin", family: "workspace-W06", role: "demo-w06-admin", state: "admin-overview" },
  { id: "SCN-W06-DENIED", route: "/admin", family: "security", role: "demo-w01-ngoc-linh", state: "permission-denied" },
];

fs.writeFileSync(
  path.join(outDir, "route-registry.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), count: routes.length, routes }, null, 2),
);
fs.writeFileSync(
  path.join(outDir, "component-registry.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), count: components.length, components }, null, 2),
);
fs.writeFileSync(
  path.join(outDir, "scenario-registry.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), count: scenarios.length, scenarios }, null, 2),
);

console.log(`Generated registries -> ${outDir}: ${routes.length} routes, ${components.length} components, ${scenarios.length} scenarios`);
