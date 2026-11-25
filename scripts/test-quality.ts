import assert from "node:assert/strict";
import { INITIAL_BATCHES } from "../src/data/demo/batches";
import { INITIAL_ORDERS } from "../src/data/demo/orders";
import { INITIAL_CREDENTIAL_RECORDS } from "../src/data/fixtures/quality-credentials";
import { OCOP_PUBLIC_REFERENCE_CATALOG } from "../src/data/reference/ocop-public-reference";
import {
  CREDENTIAL_TYPES,
  QUALITY_SOURCE_REGISTRY,
  evaluateCredentialDisplay,
} from "../src/lib/quality/credential-registry";
import { impactAnalysisForRecall, traceLotGenealogy } from "../src/lib/quality/recall-engine";

function main() {
  // 1. Registry completeness Q01..Q26 and S01..S23
  assert.equal(CREDENTIAL_TYPES.length, 26, `Expected 26 credential types Q01..Q26, got ${CREDENTIAL_TYPES.length}`);
  assert(Object.keys(QUALITY_SOURCE_REGISTRY).length >= 23, "Expected >=23 verified verification sources");
  const typeIds = new Set(CREDENTIAL_TYPES.map((t) => t.id));
  for (let i = 1; i <= 26; i++) {
    assert(typeIds.has(`Q${String(i).padStart(2, "0")}`), `Missing credential type Q${String(i).padStart(2, "0")}`);
  }

  // 2. Aquaculture-only types (Q25 ASC, Q26 BAP) MUST be suppressed on agricultural fruit/cashew categories
  const asc = INITIAL_CREDENTIAL_RECORDS.find((r) => r.typeId === "Q25");
  const bap = INITIAL_CREDENTIAL_RECORDS.find((r) => r.typeId === "Q26");
  assert(asc && bap, "Missing Q25 ASC / Q26 BAP reference records");
  const ascOnPomelo = evaluateCredentialDisplay(asc, "Bưởi & Cây có múi", "P01", "2026-11-25");
  const bapOnCashew = evaluateCredentialDisplay(bap, "Hạt điều & Rang củi", "P08", "2026-11-25");
  assert.equal(ascOnPomelo.canShowBadge, false, "Q25 ASC must NOT show badge on pomelo");
  assert.equal(bapOnCashew.canShowBadge, false, "Q26 BAP must NOT show badge on cashew");

  // 3. Coffee-only Q24 4C must be suppressed when checked against Pomelo
  const rec4c = INITIAL_CREDENTIAL_RECORDS.find((r) => r.typeId === "Q24");
  assert(rec4c, "Missing Q24 4C fixture");
  assert.equal(
    evaluateCredentialDisplay(rec4c, "Bưởi & Cây có múi", "P01", "2026-11-25").canShowBadge,
    false,
    "Q24 4C coffee-only badge must not render on Pomelo",
  );
  assert.equal(
    evaluateCredentialDisplay(rec4c, "Cà phê & Ca cao", "P53", "2026-11-25").canShowBadge,
    true,
    "Q24 4C should render when category + product match",
  );

  // 4. Lifecycle suppression rules: expired, revoked, suspended, missing evidence, announced pending
  const revoked = INITIAL_CREDENTIAL_RECORDS.find((r) => r.lifecycleStatus === "revoked");
  const suspended = INITIAL_CREDENTIAL_RECORDS.find((r) => r.lifecycleStatus === "suspended");
  const announcedOnly = INITIAL_CREDENTIAL_RECORDS.find(
    (r) => r.lifecycleStatus === "announced_pending_dossier",
  );
  assert(revoked && suspended && announcedOnly, "Expected revoked, suspended, announced_pending_dossier test fixtures");
  assert.equal(evaluateCredentialDisplay(revoked).canShowBadge, false, "Revoked record must suppress badge");
  assert.equal(evaluateCredentialDisplay(suspended).canShowBadge, false, "Suspended record must suppress badge");
  assert.equal(evaluateCredentialDisplay(announcedOnly).canShowBadge, false, "Announced-only record must suppress badge");

  const expiredRec = INITIAL_CREDENTIAL_RECORDS.find(
    (r) => r.validTo && r.validTo < "2026-11-25",
  );
  assert(expiredRec, "Expected expired credential test record");
  const expiredEval = evaluateCredentialDisplay(expiredRec, undefined, undefined, "2026-11-25");
  assert.equal(expiredEval.canShowBadge, false, "Expired credential must suppress badge");
  assert.equal(expiredEval.effectiveStatus, "expired", "Expired date must transition effectiveStatus to expired");

  // 5. Public reference catalog integrity (zero fake commerce fields, real sources only)
  assert(OCOP_PUBLIC_REFERENCE_CATALOG.length >= 17, "Expected >=17 real public reference entries");
  for (const ref of OCOP_PUBLIC_REFERENCE_CATALOG) {
    assert.equal(ref.sourceKind, "public_reference");
    assert(ref.sourceUrl.startsWith("https://"), `Reference ${ref.id} missing https sourceUrl`);
    assert(!("priceVnd" in ref), `Reference ${ref.id} must NEVER carry synthetic priceVnd`);
    assert(!("stockKg" in ref), `Reference ${ref.id} must NEVER carry synthetic stockKg`);
  }

  // 6. Batch genealogy & recall cascade (NF-DN-099 -> NF-DN-100)
  const tree = traceLotGenealogy("NF-DN-099", INITIAL_BATCHES);
  assert(tree, "Expected lot genealogy tree for NF-DN-099");
  assert(tree.children.some((c) => c.batchCode === "NF-DN-100"), "NF-DN-099 must have child NF-DN-100");
  const impact = impactAnalysisForRecall("NF-DN-099", INITIAL_BATCHES, INITIAL_ORDERS);
  assert(impact.affectedBatchCodes.includes("NF-DN-099"));
  assert(impact.affectedBatchCodes.includes("NF-DN-100"), "Recall impact must cascade to child lot NF-DN-100");

  console.log(
    JSON.stringify(
      {
        status: "PASS",
        credentialTypesCount: CREDENTIAL_TYPES.length,
        credentialRecordsCount: INITIAL_CREDENTIAL_RECORDS.length,
        publicReferencesCount: OCOP_PUBLIC_REFERENCE_CATALOG.length,
        recallCascadeLots: impact.affectedBatchCodes,
        recallAffectedOrdersCount: impact.affectedOrders.length,
      },
      null,
      2,
    ),
  );
}

main();
