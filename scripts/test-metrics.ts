import assert from "node:assert/strict";
import { INITIAL_ORDERS } from "../src/data/demo/orders";
import {
  INITIAL_EXPENSES,
  INITIAL_INVENTORY_MOVEMENTS,
  INITIAL_RECEIVABLES_PAYABLES,
  INITIAL_WAREHOUSE_STOCKS,
} from "../src/data/fixtures/erp-operations";
import { INITIAL_MISSIONS, INITIAL_VOLUNTEER_HOURS } from "../src/data/demo/missions";
import { calcDeltaPct, computeBusinessMetrics } from "../src/lib/metrics/business-metrics";
import { buildScopedCsvContent, sanitizeCsvCell } from "../src/lib/export/csv-export";
import type { InventoryMovement } from "../src/types/naifarm";

function main() {
  const novReport = computeBusinessMetrics({
    orders: INITIAL_ORDERS,
    stocks: INITIAL_WAREHOUSE_STOCKS,
    movements: INITIAL_INVENTORY_MOVEMENTS,
    expenses: INITIAL_EXPENSES,
    debts: INITIAL_RECEIVABLES_PAYABLES,
    missions: INITIAL_MISSIONS,
    hourRecords: INITIAL_VOLUNTEER_HOURS,
    periodKey: "current_month",
    refDateIso: "2026-11-25",
  });

  // 1. Revenue definitions remain distinct
  assert(novReport.gmvVnd > 0, "GMV must be positive in Nov 2026");
  assert(novReport.netMerchandiseSalesVnd > 0, "Net Merchandise Sales must be positive");
  assert(
    novReport.gmvVnd >= novReport.netMerchandiseSalesVnd,
    "GMV (before discounts/refunds/pending) must be >= Net Merchandise Sales",
  );
  assert(
    novReport.platformRevenueVnd < novReport.netMerchandiseSalesVnd,
    "Platform Revenue must stay separated and smaller than seller Net Merchandise Sales",
  );
  assert(
    novReport.totalCustomerCollectedVnd >= novReport.netMerchandiseSalesVnd,
    "Customer Cash Collected includes net shipping/tax on top of net merchandise",
  );

  // 2. Missing COGS line (#168) triggers explicit gap counter rather than silent 0 fabrication
  const allReport = computeBusinessMetrics({
    orders: INITIAL_ORDERS,
    stocks: INITIAL_WAREHOUSE_STOCKS,
    movements: INITIAL_INVENTORY_MOVEMENTS,
    expenses: INITIAL_EXPENSES,
    debts: INITIAL_RECEIVABLES_PAYABLES,
    missions: INITIAL_MISSIONS,
    hourRecords: INITIAL_VOLUNTEER_HOURS,
    periodKey: "all",
    refDateIso: "2026-11-25",
  });
  assert(
    allReport.missingCostLinesCount >= 1,
    `Expected >=1 missing COGS line in allReport, got ${allReport.missingCostLinesCount}`,
  );

  // 3. Period comparison (Nov vs Oct 2026) and zero/null denominator safety
  assert(novReport.previousNetMerchandiseSalesVnd > 0, "Previous month (Oct 2026) sales must exist");
  assert(novReport.netSalesDeltaPct !== null, "Delta % vs Oct 2026 should compute cleanly");
  assert.equal(calcDeltaPct(100, 0), null, "Denominator 0 must return null");
  assert.equal(calcDeltaPct(100, null), null, "Null previous must return null");

  // 4. Sell-through per unit excludes internal transfers
  const internalTransfer: InventoryMovement = {
    id: "MOV-TEST-INT",
    warehouseId: "WH-LK-01",
    productId: "P01",
    batchCode: "NF-DEMO-001",
    type: "transfer",
    quantityDelta: 9999,
    unitLabel: "kg",
    dateIso: "2026-11-25",
    actorName: "Test",
    reason: "Internal move",
    isInternalTransfer: true,
  };
  const withTransfer = computeBusinessMetrics({
    orders: INITIAL_ORDERS,
    stocks: INITIAL_WAREHOUSE_STOCKS,
    movements: [...INITIAL_INVENTORY_MOVEMENTS, internalTransfer],
    expenses: INITIAL_EXPENSES,
    debts: INITIAL_RECEIVABLES_PAYABLES,
    missions: INITIAL_MISSIONS,
    hourRecords: INITIAL_VOLUNTEER_HOURS,
    periodKey: "current_month",
    refDateIso: "2026-11-25",
  });
  const baseKgSupply = novReport.sellThroughByUnit.find((u) => u.unitLabel === "kg")?.beginningPlusInboundQty;
  const nextKgSupply = withTransfer.sellThroughByUnit.find((u) => u.unitLabel === "kg")?.beginningPlusInboundQty;
  assert.equal(baseKgSupply, nextKgSupply, "Internal transfers must NOT inflate sell-through supply");

  // 5. Confirmed volunteer hours ignore unapproved submissions
  assert(novReport.confirmedVolunteerHours > 0, "Expected confirmed volunteer hours > 0");

  // 6. CSV CWE-1236 formula injection neutralization & UTF-8 BOM
  assert.equal(sanitizeCsvCell("=CMD()"), `"'=CMD()"`);
  assert.equal(sanitizeCsvCell("+SUM(A1)"), `"'+SUM(A1)"`);
  assert.equal(sanitizeCsvCell("-1+1"), `"'-1+1"`);
  assert.equal(sanitizeCsvCell("@calc"), `"'@calc"`);
  const csv = buildScopedCsvContent(["Cột 1"], [["=1+1"]], {
    reportTitle: "Kiểm thử",
    periodLabel: "11/2026",
    scopeLabel: "Đồng Nai",
  });
  assert(csv.startsWith("\uFEFF"), "CSV export must start with UTF-8 BOM");
  assert(csv.includes(`"'=1+1"`), "CSV export must neutralize formula triggers");

  console.log(
    JSON.stringify(
      {
        status: "PASS",
        novGmvVnd: novReport.gmvVnd,
        novNetMerchandiseVnd: novReport.netMerchandiseSalesVnd,
        novPlatformRevenueVnd: novReport.platformRevenueVnd,
        missingCostLinesCount: allReport.missingCostLinesCount,
        confirmedVolunteerHours: novReport.confirmedVolunteerHours,
        sellThroughUnits: novReport.sellThroughByUnit.map((u) => u.unitLabel),
      },
      null,
      2,
    ),
  );
}

main();
