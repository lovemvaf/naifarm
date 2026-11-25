import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { ADMINISTRATIVE_UNITS, getAdministrativeUnitByCode } from "../src/lib/geography/administrative-lookup";
import { INITIAL_FARMS } from "../src/data/demo/farms";
import { INITIAL_PRODUCTS } from "../src/data/demo/products";
import { INITIAL_BATCHES } from "../src/data/demo/batches";
import { INITIAL_CERTIFICATIONS } from "../src/data/demo/certifications";
import { INITIAL_SEASONS, INITIAL_DIARY_ENTRIES } from "../src/data/demo/seasons-diaries";
import { INITIAL_ORDERS } from "../src/data/demo/orders";
import {
  INITIAL_MISSIONS,
  INITIAL_SUPPORT_REQUESTS,
  INITIAL_VOLUNTEER_HOURS,
} from "../src/data/demo/missions";
import { INITIAL_LIVESTREAMS } from "../src/data/demo/livestreams";
import { INITIAL_LESSONS } from "../src/data/demo/learning";
import {
  DEMO_AUTH_ACCOUNTS,
  INITIAL_ADDRESS_BOOK,
  INITIAL_NOTIFICATIONS,
  INITIAL_PARTNER_ORGS,
  INITIAL_TICKETS,
} from "../src/data/demo/partners-tickets";
import {
  INITIAL_ADMIN_GRANTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_DOC_CASES,
  INITIAL_EXPERIENCE_BOOKINGS,
} from "../src/data/demo/community";
import { ASSET_MANIFEST } from "../src/data/reference/asset-manifest";
import { OCOP_PUBLIC_REFERENCE_CATALOG } from "../src/data/reference/ocop-public-reference";
import {
  INITIAL_TOUR_PACKAGES,
  INITIAL_V4_BOOKINGS,
} from "../src/data/fixtures/agritourism-experiences";
import {
  ACADEMY_QUESTION_BANK,
  AMBASSADOR_PHRASES,
  ROLEPLAY_SCENARIOS,
} from "../src/data/fixtures/youth-ambassador-academy";
import {
  INITIAL_CALENDAR_EVENTS,
  INITIAL_CAMPAIGNS,
  INITIAL_PROMOTIONS,
  OFFICIAL_OBSERVANCES,
} from "../src/data/fixtures/calendar-campaigns";

function assertAssetExists(root: string, imagePath: string | undefined, owner: string) {
  if (!imagePath) return;
  const rel = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  const full = path.join(root, "public", rel);
  assert(fs.existsSync(full), `Missing asset file ${imagePath} referenced by ${owner}`);
}

function assertNoLegacyDistrict(text: string, owner: string) {
  const forbidden = ["H. Vĩnh Cửu", "H. Cẩm Mỹ", "H. Xuân Lộc", "TP. Biên Hòa"];
  for (const token of forbidden) {
    assert(!text.includes(token), `Forbidden legacy district token "${token}" found in ${owner}: ${text}`);
  }
}

function main() {
  const root = process.cwd();
  assert.equal(ADMINISTRATIVE_UNITS.length, 95);

  const experienceCount = INITIAL_FARMS.reduce((sum, f) => sum + f.experiences.length, 0);
  const categories = new Set(INITIAL_PRODUCTS.map((p) => p.category));
  const certStatuses = new Set(INITIAL_CERTIFICATIONS.map((c) => c.status));
  const orderStatuses = new Set(INITIAL_ORDERS.map((o) => o.status));

  // Count assertions matching V3.0 baseline & expansion targets
  assert(INITIAL_FARMS.length >= 30, `Expected >=30 farms, got ${INITIAL_FARMS.length}`);
  assert(experienceCount >= 14, `Expected >=14 experiences, got ${experienceCount}`);
  assert(INITIAL_PRODUCTS.length >= 116, `Expected >=116 products, got ${INITIAL_PRODUCTS.length}`);
  assert(categories.size >= 10, `Expected 10 product categories, got ${categories.size}`);
  assert(INITIAL_BATCHES.length >= 119, `Expected >=119 batches, got ${INITIAL_BATCHES.length}`);
  assert(INITIAL_SEASONS.length >= 30, `Expected >=30 seasons, got ${INITIAL_SEASONS.length}`);
  assert(INITIAL_DIARY_ENTRIES.length >= 300, `Expected >=300 diaries, got ${INITIAL_DIARY_ENTRIES.length}`);
  assert(INITIAL_CERTIFICATIONS.length >= 24, `Expected >=24 certifications, got ${INITIAL_CERTIFICATIONS.length}`);
  assert.equal(certStatuses.size, 7, `Expected all 7 certification statuses, got ${certStatuses.size}`);
  assert(INITIAL_ORDERS.length >= 168, `Expected >=168 orders, got ${INITIAL_ORDERS.length}`);
  assert(
    INITIAL_ORDERS.some((o) => o.orderDateIso?.startsWith("2026-10")),
    "Expected orders spanning Oct 2026 for prior-period comparisons",
  );
  assert(
    INITIAL_ORDERS.some((o) => o.orderDateIso?.startsWith("2026-11")),
    "Expected orders spanning Nov 2026 for current-period metrics",
  );
  assert(ASSET_MANIFEST.length >= 88, `Expected >=88 asset manifest entries (65 Stitch + 23 V5 products), got ${ASSET_MANIFEST.length}`);
  for (const asset of ASSET_MANIFEST) {
    assertAssetExists(root, asset.localPath, `asset manifest ${asset.assetId}`);
  }
  for (const ref of OCOP_PUBLIC_REFERENCE_CATALOG) {
    if (ref.administrativeUnitCode) {
      assert(
        getAdministrativeUnitByCode(ref.administrativeUnitCode),
        `Public reference ${ref.id} uses unknown unit code ${ref.administrativeUnitCode}`,
      );
    }
    assertAssetExists(root, ref.image, `public reference ${ref.id}`);
  }
  // Security & architecture guardrails: zero 3D/WebGL or live secret keys
  const scanSrcForBanned = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanSrcForBanned(full);
      } else if (/\.(ts|tsx)$/.test(entry.name)) {
        const text = fs.readFileSync(full, "utf8");
        assert(!/from\s+["'](three|@react-three\/)/.test(text), `Forbidden 3D import found in ${full}`);
        assert(!/(sk_live_|AIza[0-9A-Za-z_-]{20,}|ghp_[0-9A-Za-z]{20,})/.test(text), `Secret-like token found in ${full}`);
      }
    }
  };
  scanSrcForBanned(path.join(root, "src"));
  assert.equal(orderStatuses.size, 6, `Expected all 6 order statuses, got ${orderStatuses.size}`);
  assert(INITIAL_MISSIONS.length >= 40, `Expected >=40 missions, got ${INITIAL_MISSIONS.length}`);
  assert(INITIAL_VOLUNTEER_HOURS.length >= 120, `Expected >=120 volunteer hour records, got ${INITIAL_VOLUNTEER_HOURS.length}`);
  assert(INITIAL_LIVESTREAMS.length >= 12, `Expected >=12 livestreams, got ${INITIAL_LIVESTREAMS.length}`);
  assert(INITIAL_EXPERIENCE_BOOKINGS.length >= 24, `Expected >=24 bookings, got ${INITIAL_EXPERIENCE_BOOKINGS.length}`);
  assert(INITIAL_LESSONS.length >= 12, `Expected >=12 lessons, got ${INITIAL_LESSONS.length}`);
  assert(INITIAL_PARTNER_ORGS.length >= 10, `Expected >=10 partner orgs, got ${INITIAL_PARTNER_ORGS.length}`);
  assert(INITIAL_NOTIFICATIONS.length >= 30, `Expected >=30 notifications, got ${INITIAL_NOTIFICATIONS.length}`);
  assert(INITIAL_TICKETS.length >= 12, `Expected >=12 support tickets, got ${INITIAL_TICKETS.length}`);
  assert.equal(DEMO_AUTH_ACCOUNTS.length, 6, "Expected 6 demo accounts W01..W06");
  assert(INITIAL_ADDRESS_BOOK.length >= 4, "Expected >=4 saved address book entries");
  assert(INITIAL_DOC_CASES.length >= 12, "Expected >=12 doc review cases");
  assert(INITIAL_ADMIN_GRANTS.length >= 6, "Expected >=6 admin grants");
  assert(INITIAL_AUDIT_LOGS.length >= 16, "Expected >=16 audit logs");
  assert(INITIAL_SUPPORT_REQUESTS.length >= 10, "Expected >=10 support requests");

  // V4.0 cumulative minimums & image cleanliness
  assert(INITIAL_FARMS.length >= 36, `Expected >=36 farms in V4, got ${INITIAL_FARMS.length}`);
  assert(INITIAL_PRODUCTS.length >= 150, `Expected >=150 products in V4, got ${INITIAL_PRODUCTS.length}`);
  assert(categories.size >= 12, `Expected >=12 product categories in V4, got ${categories.size}`);
  assert(INITIAL_SEASONS.length >= 50, `Expected >=50 seasons in V4, got ${INITIAL_SEASONS.length}`);
  assert(INITIAL_DIARY_ENTRIES.length >= 400, `Expected >=400 diaries in V4, got ${INITIAL_DIARY_ENTRIES.length}`);
  assert(INITIAL_TOUR_PACKAGES.length >= 24, `Expected >=24 agritourism tours, got ${INITIAL_TOUR_PACKAGES.length}`);
  assert(INITIAL_V4_BOOKINGS.length >= 40, `Expected >=40 V4 bookings, got ${INITIAL_V4_BOOKINGS.length}`);
  assert(INITIAL_LIVESTREAMS.length >= 20, `Expected >=20 livestreams, got ${INITIAL_LIVESTREAMS.length}`);
  assert(INITIAL_LESSONS.length >= 20, `Expected >=20 lessons, got ${INITIAL_LESSONS.length}`);
  assert(AMBASSADOR_PHRASES.length >= 16, `Expected >=16 ambassador phrases, got ${AMBASSADOR_PHRASES.length}`);
  assert(ACADEMY_QUESTION_BANK.length >= 100, `Expected >=100 quiz bank items, got ${ACADEMY_QUESTION_BANK.length}`);
  assert(ROLEPLAY_SCENARIOS.length >= 12, `Expected >=12 roleplay scenarios, got ${ROLEPLAY_SCENARIOS.length}`);
  assert(INITIAL_CAMPAIGNS.length >= 20, `Expected >=20 campaigns, got ${INITIAL_CAMPAIGNS.length}`);
  assert(INITIAL_PROMOTIONS.length >= 6, `Expected >=6 promotions, got ${INITIAL_PROMOTIONS.length}`);
  assert(INITIAL_CALENDAR_EVENTS.length >= 60, `Expected >=60 calendar events, got ${INITIAL_CALENDAR_EVENTS.length}`);
  assert(OFFICIAL_OBSERVANCES.length >= 10, `Expected >=10 official observances, got ${OFFICIAL_OBSERVANCES.length}`);

  const bannedMockupImages = ["stitch-15.jpg", "stitch-17.jpg", "stitch-47.jpg"];
  for (const prod of INITIAL_PRODUCTS) {
    assert(
      !bannedMockupImages.some((b) => prod.image.includes(b)),
      `Product ${prod.id} uses UI chrome / fake-LIVE image ${prod.image}`,
    );
  }
  for (const lv of INITIAL_LIVESTREAMS) {
    for (const ang of lv.angles) {
      assert(
        !bannedMockupImages.some((b) => ang.image.includes(b)),
        `Livestream ${lv.id} angle uses banned overlay image ${ang.image}`,
      );
    }
  }

  // Golden Dataset Integrity
  const baTu = INITIAL_FARMS.find((f) => f.id === "farm-ba-tu-demo");
  assert(baTu, "Missing Golden farm-ba-tu-demo");
  assert.equal(baTu.administrativeUnitCode, "26080");
  assert.equal(baTu.areaHa, 2.5);
  assert(INITIAL_BATCHES.some((b) => b.batchCode === "NF-DEMO-001"));
  assert(INITIAL_ORDERS.some((o) => o.id === "NF-ORD-DEMO-01"));
  assert(INITIAL_MISSIONS.some((m) => m.id === "NF-MIS-01"));

  // Foreign key & asset validation
  const farmIds = new Set(INITIAL_FARMS.map((f) => f.id));
  const productIds = new Set(INITIAL_PRODUCTS.map((p) => p.id));
  const batchCodes = new Set(INITIAL_BATCHES.map((b) => b.batchCode));
  const seasonIds = new Set(INITIAL_SEASONS.map((s) => s.id));
  const missionIds = new Set(INITIAL_MISSIONS.map((m) => m.id));

  for (const tp of INITIAL_TOUR_PACKAGES) {
    assert(farmIds.has(tp.farmId), `Tour ${tp.id} missing farm ${tp.farmId}`);
    assertAssetExists(root, tp.image, `tour ${tp.id}`);
  }
  for (const cmp of INITIAL_CAMPAIGNS) {
    assertAssetExists(root, cmp.bannerImage, `campaign ${cmp.id}`);
  }

  for (const farm of INITIAL_FARMS) {
    const unit = getAdministrativeUnitByCode(farm.administrativeUnitCode);
    assert(unit, `Farm ${farm.id} uses invalid administrativeUnitCode ${farm.administrativeUnitCode}`);
    assert.equal(farm.administrativeUnitName, unit.tenDayDu, `Farm ${farm.id} unit name mismatch`);
    assert.equal(farm.coordinates.isDemoCoordinate, true);
    assert(farm.coordinates.lat >= 10.5 && farm.coordinates.lat <= 12.4, `Farm ${farm.id} lat out of Dong Nai`);
    assert(farm.coordinates.lng >= 106.4 && farm.coordinates.lng <= 107.6, `Farm ${farm.id} lng out of Dong Nai`);
    assertNoLegacyDistrict(farm.addressLabel, `farm ${farm.id}`);
    assertAssetExists(root, farm.bannerImage, `farm ${farm.id} banner`);
    assertAssetExists(root, farm.ownerPortrait, `farm ${farm.id} portrait`);
    for (const img of farm.galleryImages) assertAssetExists(root, img, `farm ${farm.id} gallery`);
  }

  for (const prod of INITIAL_PRODUCTS) {
    assert(farmIds.has(prod.farmId), `Product ${prod.id} references missing farm ${prod.farmId}`);
    assert(batchCodes.has(prod.batchCode), `Product ${prod.id} references missing batch ${prod.batchCode}`);
    assert(getAdministrativeUnitByCode(prod.administrativeUnitCode), `Product ${prod.id} bad unit code`);
    if (prod.seasonId) assert(seasonIds.has(prod.seasonId), `Product ${prod.id} missing season ${prod.seasonId}`);
    assertNoLegacyDistrict(prod.region, `product ${prod.id}`);
    assertAssetExists(root, prod.image, `product ${prod.id} image`);
    for (const g of prod.gallery) assertAssetExists(root, g, `product ${prod.id} gallery`);
  }

  for (const batch of INITIAL_BATCHES) {
    assert(farmIds.has(batch.farmId), `Batch ${batch.batchCode} missing farm ${batch.farmId}`);
    assert(productIds.has(batch.productId), `Batch ${batch.batchCode} missing product ${batch.productId}`);
    assert(getAdministrativeUnitByCode(batch.administrativeUnitCode), `Batch ${batch.batchCode} bad unit code`);
    assert(batch.events.length >= 3, `Batch ${batch.batchCode} needs >=3 events`);
    assertNoLegacyDistrict(batch.region, `batch ${batch.batchCode}`);
  }

  for (const season of INITIAL_SEASONS) {
    assert(farmIds.has(season.farmId), `Season ${season.id} missing farm`);
    assert(getAdministrativeUnitByCode(season.administrativeUnitCode), `Season ${season.id} bad unit code`);
    for (const bc of season.batchCodes) {
      assert(batchCodes.has(bc), `Season ${season.id} references missing batchCode ${bc}`);
    }
  }

  for (const diary of INITIAL_DIARY_ENTRIES) {
    assert(seasonIds.has(diary.seasonId), `Diary ${diary.id} missing season ${diary.seasonId}`);
    assert(batchCodes.has(diary.batchCode), `Diary ${diary.id} missing batch ${diary.batchCode}`);
    assertAssetExists(root, diary.photo, `diary ${diary.id}`);
  }

  for (const cert of INITIAL_CERTIFICATIONS) {
    assert(farmIds.has(cert.farmId), `Cert ${cert.id} missing farm`);
    assert(getAdministrativeUnitByCode(cert.administrativeUnitCode), `Cert ${cert.id} bad unit code`);
    if (cert.qrBatchCode) assert(batchCodes.has(cert.qrBatchCode), `Cert ${cert.id} missing batch ${cert.qrBatchCode}`);
    assert(!/^[0-9]+$/.test(cert.certificateCode), `Cert ${cert.id} must use DEMO-* code`);
  }

  for (const order of INITIAL_ORDERS) {
    assert(farmIds.has(order.farmId), `Order ${order.id} missing farm`);
    if (order.administrativeUnitCode) {
      assert(getAdministrativeUnitByCode(order.administrativeUnitCode), `Order ${order.id} bad unit code`);
    }
    assertNoLegacyDistrict(order.deliveryAddress, `order ${order.id}`);
    for (const item of order.items) {
      assert(productIds.has(item.productId), `Order ${order.id} missing product ${item.productId}`);
      assertAssetExists(root, item.image, `order ${order.id} item ${item.productId}`);
    }
  }

  for (const mis of INITIAL_MISSIONS) {
    assert(farmIds.has(mis.farmId), `Mission ${mis.id} missing farm`);
    assertNoLegacyDistrict(mis.location, `mission ${mis.id}`);
    assertAssetExists(root, mis.evidenceImage, `mission ${mis.id}`);
  }

  for (const hr of INITIAL_VOLUNTEER_HOURS) {
    assert(missionIds.has(hr.missionId), `Hour record ${hr.id} missing mission ${hr.missionId}`);
    assert(farmIds.has(hr.farmId), `Hour record ${hr.id} missing farm`);
  }

  for (const live of INITIAL_LIVESTREAMS) {
    assert(farmIds.has(live.farmId), `Livestream ${live.id} missing farm`);
    for (const pid of live.pinnedProductIds) assert(productIds.has(pid), `Livestream ${live.id} missing product ${pid}`);
    for (const angle of live.angles) assertAssetExists(root, angle.image, `livestream ${live.id}`);
  }

  for (const lesson of INITIAL_LESSONS) {
    assert(getAdministrativeUnitByCode(lesson.regionCode), `Lesson ${lesson.id} bad unit code`);
    assertAssetExists(root, lesson.image, `lesson ${lesson.id}`);
    for (const sec of lesson.sections) assertAssetExists(root, sec.image, `lesson ${lesson.id} section`);
  }

  console.log(
    JSON.stringify(
      {
        status: "PASS",
        farms: INITIAL_FARMS.length,
        experiences: experienceCount,
        products: INITIAL_PRODUCTS.length,
        categories: categories.size,
        batches: INITIAL_BATCHES.length,
        seasons: INITIAL_SEASONS.length,
        diaryEntries: INITIAL_DIARY_ENTRIES.length,
        certifications: INITIAL_CERTIFICATIONS.length,
        orders: INITIAL_ORDERS.length,
        missions: INITIAL_MISSIONS.length,
        volunteerHourRecords: INITIAL_VOLUNTEER_HOURS.length,
        livestreams: INITIAL_LIVESTREAMS.length,
        bookings: INITIAL_EXPERIENCE_BOOKINGS.length,
        lessons: INITIAL_LESSONS.length,
        partnerOrgs: INITIAL_PARTNER_ORGS.length,
        notifications: INITIAL_NOTIFICATIONS.length,
        tickets: INITIAL_TICKETS.length,
        demoAccounts: DEMO_AUTH_ACCOUNTS.length,
        tours: INITIAL_TOUR_PACKAGES.length,
        phrases: AMBASSADOR_PHRASES.length,
        questionBank: ACADEMY_QUESTION_BANK.length,
        campaigns: INITIAL_CAMPAIGNS.length,
        calendarEvents: INITIAL_CALENDAR_EVENTS.length,
      },
      null,
      2,
    ),
  );
}

main();
