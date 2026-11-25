import assert from "node:assert/strict";
import { MESSAGES_VI } from "../src/lib/i18n/messages-vi";
import { MESSAGES_EN } from "../src/lib/i18n/messages-en";
import { INITIAL_PRODUCTS } from "../src/data/demo/products";
import { INITIAL_FARMS } from "../src/data/demo/farms";
import { INITIAL_BATCHES } from "../src/data/demo/batches";
import { INITIAL_LESSONS } from "../src/data/demo/learning";
import { INITIAL_MISSIONS } from "../src/data/demo/missions";
import { INITIAL_TOUR_PACKAGES } from "../src/data/fixtures/agritourism-experiences";
import { INITIAL_LIVESTREAMS } from "../src/data/demo/livestreams";
import { INITIAL_CAMPAIGNS } from "../src/data/fixtures/calendar-campaigns";
import { runGlobalSearch } from "../src/lib/search/search-engine";

function collectLeafKeys(obj: Record<string, unknown>, prefix = ""): Map<string, string> {
  const out = new Map<string, string>();
  for (const [k, v] of Object.entries(obj)) {
    const keyPath = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") {
      assert(v.trim().length > 0, `Empty translation string at ${keyPath}`);
      out.set(keyPath, v);
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      for (const [ck, cv] of collectLeafKeys(v as Record<string, unknown>, keyPath)) {
        out.set(ck, cv);
      }
    }
  }
  return out;
}

function main() {
  const viKeys = collectLeafKeys(MESSAGES_VI as unknown as Record<string, unknown>);
  const enKeys = collectLeafKeys(MESSAGES_EN as unknown as Record<string, unknown>);

  assert.equal(viKeys.size, enKeys.size, `Key count mismatch: VI=${viKeys.size} EN=${enKeys.size}`);
  for (const key of viKeys.keys()) {
    assert(enKeys.has(key), `Missing EN key: ${key}`);
  }
  for (const key of enKeys.keys()) {
    assert(viKeys.has(key), `Missing VI key: ${key}`);
  }

  // Verify EN synonym search resolves Vietnamese Dong Nai SKUs and tours
  const bundle = {
    products: INITIAL_PRODUCTS,
    farms: INITIAL_FARMS,
    batches: INITIAL_BATCHES,
    lessons: INITIAL_LESSONS,
    missions: INITIAL_MISSIONS,
    tours: INITIAL_TOUR_PACKAGES,
    livestreams: INITIAL_LIVESTREAMS,
    campaigns: INITIAL_CAMPAIGNS,
  };

  const pomeloHits = runGlobalSearch("pomelo", bundle, 10);
  assert(pomeloHits.results.length > 0, "EN search 'pomelo' must match Dong Nai pomelo items");

  const cashewHits = runGlobalSearch("cashew", bundle, 10);
  assert(cashewHits.results.length > 0, "EN search 'cashew' must match Xuan Loc cashew items");

  const tourHits = runGlobalSearch("tour", bundle, 10);
  assert(tourHits.results.length > 0, "Search 'tour' must match agritourism experiences");

  console.log(
    JSON.stringify(
      {
        status: "PASS",
        i18nKeyCount: viKeys.size,
        enPomeloHits: pomeloHits.results.length,
        enCashewHits: cashewHits.results.length,
        tourHits: tourHits.results.length,
      },
      null,
      2,
    ),
  );
}

main();
