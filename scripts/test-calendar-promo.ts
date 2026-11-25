import assert from "node:assert/strict";
import {
  INITIAL_CALENDAR_EVENTS,
  INITIAL_CAMPAIGNS,
  INITIAL_PROMOTIONS,
  OFFICIAL_OBSERVANCES,
} from "../src/data/fixtures/calendar-campaigns";
import { buildIcsDocument, DEFAULT_CLOCK_ISO } from "../src/lib/clock/vn-clock";
import { generateDedupedReminders } from "../src/lib/calendar/calendar-engine";
import {
  applyPromotionsToCart,
  calculateProportionalRefund,
  resolveCampaignRuntimeState,
} from "../src/lib/commerce/promotion-engine";
import { sanitizeReturnTo } from "../src/lib/navigation/safe-nav";

function main() {
  // 1. Clock-aware Campaign Lifecycle (Default: 2026-11-25T12:00:00+07:00)
  const recap = INITIAL_CAMPAIGNS.find((c) => c.id === "CMP-2026-CULTURE-RECAP");
  const activeNov = INITIAL_CAMPAIGNS.find((c) => c.id === "CMP-2026-NOV-CONNECT");
  const decYouth = INITIAL_CAMPAIGNS.find((c) => c.id === "CMP-2026-DEC-YOUTH-SOIL");
  assert(recap && activeNov && decYouth, "Core holiday/seasonal campaigns must exist");

  assert.equal(resolveCampaignRuntimeState(recap, DEFAULT_CLOCK_ISO), "recap");
  assert.equal(resolveCampaignRuntimeState(activeNov, DEFAULT_CLOCK_ISO), "active");
  assert.equal(resolveCampaignRuntimeState(decYouth, DEFAULT_CLOCK_ISO), "upcoming");

  // 2. Official Observances Read-Only Integrity
  assert(OFFICIAL_OBSERVANCES.length >= 10);
  for (const obs of OFFICIAL_OBSERVANCES) {
    assert.equal(obs.isReadOnlyOfficial, true, `Observance ${obs.id} must be read-only`);
  }

  // 3. Reminder Deduplication at D-30/14/7/3/1
  const reminders = generateDedupedReminders(INITIAL_CALENDAR_EVENTS, DEFAULT_CLOCK_ISO, "W02");
  const keys = reminders.map((r) => r.dedupeKey);
  assert.equal(new Set(keys).size, keys.length, "Reminders must never duplicate dedupeKeys");

  const afterDismiss = generateDedupedReminders(
    INITIAL_CALENDAR_EVENTS,
    DEFAULT_CLOCK_ISO,
    "W02",
    keys.slice(0, 1),
  );
  assert.equal(afterDismiss.length, Math.max(0, reminders.length - 1));

  // 4. RFC 5545 .ics Export with Asia/Ho_Chi_Minh timezone
  const ics = buildIcsDocument(INITIAL_CALENDAR_EVENTS.slice(0, 3), "vi");
  assert(ics.includes("BEGIN:VCALENDAR"));
  assert(ics.includes("X-WR-TIMEZONE:Asia/Ho_Chi_Minh"));
  assert(ics.includes("BEGIN:VEVENT"));
  assert(ics.includes("END:VCALENDAR"));

  // 5. Promo Engine Rules, Expiration, Minor Safeguard & Proportional Refund
  const activeRes = applyPromotionsToCart(
    INITIAL_PROMOTIONS,
    ["HTXTANTRIEU"],
    150000,
    20000,
    "vi",
    DEFAULT_CLOCK_ISO,
    false,
  );
  assert.equal(activeRes.applied.length, 1);
  assert.equal(activeRes.totalMerchDiscountVnd, 15000);

  const expiredRes = applyPromotionsToCart(
    INITIAL_PROMOTIONS,
    ["DISAN2411", "QUATET1212"],
    300000,
    20000,
    "en",
    DEFAULT_CLOCK_ISO,
    false,
  );
  assert.equal(expiredRes.applied.length, 0);
  assert.equal(expiredRes.rejected.length, 2);

  const minorRes = applyPromotionsToCart(
    INITIAL_PROMOTIONS,
    ["HTXTANTRIEU"],
    200000,
    20000,
    "vi",
    DEFAULT_CLOCK_ISO,
    true,
  );
  assert.equal(minorRes.applied.length, 0, "Minor accounts must not redeem commercial promos");

  assert.equal(calculateProportionalRefund(200000, 20000, 100000), 90000);

  // 6. Open-Redirect & Protocol Injection Defense
  assert.equal(sanitizeReturnTo("//evil.com"), "/");
  assert.equal(sanitizeReturnTo("https://evil.com/phish"), "/");
  assert.equal(sanitizeReturnTo("javascript:alert(1)"), "/");
  assert.equal(sanitizeReturnTo("/live/NF-LIVE-01?tab=faq"), "/live/NF-LIVE-01?tab=faq");

  console.log(
    JSON.stringify(
      {
        status: "PASS",
        defaultClockIso: DEFAULT_CLOCK_ISO,
        remindersComputed: reminders.length,
        promoNovDiscountVnd: activeRes.totalMerchDiscountVnd,
        icsBytes: ics.length,
      },
      null,
      2,
    ),
  );
}

main();
