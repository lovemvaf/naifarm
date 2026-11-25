import type {
  ArApAgingBucket,
  ChannelKind,
  DemoOrder,
  ExpenseEntry,
  Farm,
  InventoryMovement,
  PeriodKey,
  ReceivablePayable,
  VolunteerHourRecord,
  VolunteerMission,
  WarehouseStock,
} from "@/types/naifarm";

export interface PeriodWindow {
  key: PeriodKey;
  label: string;
  labelEn: string;
  startIso: string; // YYYY-MM-DD (Asia/Ho_Chi_Minh)
  endIso: string;
  prevStartIso: string;
  prevEndIso: string;
}

export const PERIOD_WINDOWS: Record<PeriodKey, PeriodWindow> = {
  current_month: {
    key: "current_month",
    label: "Tháng 11/2026 (01/11 – 25/11)",
    labelEn: "Nov 2026 (01–25 Nov)",
    startIso: "2026-11-01",
    endIso: "2026-11-25",
    prevStartIso: "2026-10-01",
    prevEndIso: "2026-10-25",
  },
  org_tt_nov_1_24: {
    key: "org_tt_nov_1_24",
    label: "Kỳ đối chiếu HTX 01–24/11 vs 01–24/10",
    labelEn: "Coop Reconciled 01–24 Nov vs 01–24 Oct",
    startIso: "2026-11-01",
    endIso: "2026-11-24",
    prevStartIso: "2026-10-01",
    prevEndIso: "2026-10-24",
  },
  previous_month: {
    key: "previous_month",
    label: "Tháng 10/2026 (01/10 – 31/10)",
    labelEn: "Oct 2026 (01–31 Oct)",
    startIso: "2026-10-01",
    endIso: "2026-10-31",
    prevStartIso: "2026-09-01",
    prevEndIso: "2026-09-30",
  },
  last_7d: {
    key: "last_7d",
    label: "7 ngày gần nhất (19/11 – 25/11)",
    labelEn: "Last 7 Days (19–25 Nov)",
    startIso: "2026-11-19",
    endIso: "2026-11-25",
    prevStartIso: "2026-11-12",
    prevEndIso: "2026-11-18",
  },
  last_30d: {
    key: "last_30d",
    label: "30 ngày gần nhất (27/10 – 25/11)",
    labelEn: "Last 30 Days (27 Oct – 25 Nov)",
    startIso: "2026-10-27",
    endIso: "2026-11-25",
    prevStartIso: "2026-09-27",
    prevEndIso: "2026-10-26",
  },
  all: {
    key: "all",
    label: "Toàn bộ kỳ ghi nhận (T1–T12/2026)",
    labelEn: "Full Year 2026",
    startIso: "2026-01-01",
    endIso: "2026-12-31",
    prevStartIso: "2025-01-01",
    prevEndIso: "2025-12-31",
  },
};

function extractVnDate(isoOrDate?: string): string | null {
  if (!isoOrDate) return null;
  return isoOrDate.slice(0, 10);
}

function inRange(dateIso: string | undefined, startIso: string, endIso: string): boolean {
  const d = extractVnDate(dateIso);
  if (!d) return false;
  return d >= startIso && d <= endIso;
}

export function calcDeltaPct(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous <= 0) return null;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export interface UnitSellThroughRow {
  unitLabel: string;
  soldQty: number;
  beginningPlusInboundQty: number;
  sellThroughPct: number | null;
}

export interface BusinessMetricsReport {
  period: PeriodWindow;
  ordersTotalCount: number;
  completedOrdersCount: number;
  cancelledOrdersCount: number;
  grossMerchandiseSalesVnd: number;
  gmvVnd: number;
  totalDiscountsVnd: number;
  totalRefundsMerchVnd: number;
  netMerchandiseSalesVnd: number;
  totalCustomerCollectedVnd: number;
  cogsVnd: number;
  missingCostLinesCount: number;
  grossProfitVnd: number;
  grossMarginPct: number | null;
  operatingExpensesVnd: number;
  platformRevenueVnd: number;
  internalOperatingResultVnd: number;
  aovVnd: number | null;
  refundRatePct: number | null;
  refundValueRatePct: number | null;
  onTimeDeliveryPct: number | null;
  repeatCustomerRatePct: number | null;
  inventoryAvailableTotal: number;
  inventoryQuarantineTotal: number;
  inventoryValueVnd: number;
  inventoryTurnover: number | null;
  nearExpiryCountsByUnit: Record<string, number>;
  expiredStockLotsCount: number;
  sellThroughByUnit: UnitSellThroughRow[];
  receivableOpenVnd: number;
  payableOpenVnd: number;
  overdueDebtCount: number;
  confirmedVolunteerHours: number;
  uniqueFarmsSupported: number;
  completedMissionsCount: number;
  previousCompletedOrdersCount: number;
  previousGrossMerchandiseVnd: number;
  previousDiscountsVnd: number;
  previousRefundsMerchVnd: number;
  previousNetMerchandiseSalesVnd: number;
  previousCogsVnd: number;
  previousGrossProfitVnd: number;
  previousGrossMarginPct: number | null;
  previousOperatingExpensesVnd: number;
  previousInternalOperatingResultVnd: number;
  previousAovVnd: number | null;
  netSalesDeltaPct: number | null;
  ordersDeltaPct: number | null;
  grossProfitDeltaPct: number | null;
}

export interface ComputeMetricsInput {
  orders: DemoOrder[];
  stocks: WarehouseStock[];
  movements: InventoryMovement[];
  expenses: (ExpenseEntry & { organizationId?: string })[];
  debts: ReceivablePayable[];
  missions: VolunteerMission[];
  hourRecords?: VolunteerHourRecord[];
  periodKey: PeriodKey;
  farmIdFilter?: string;
  organizationIdFilter?: string;
  channelFilter?: "all" | ChannelKind;
  refDateIso?: string;
}

export function computeBusinessMetrics(input: ComputeMetricsInput): BusinessMetricsReport {
  const period = PERIOD_WINDOWS[input.periodKey];
  const refDate = input.refDateIso ?? "2026-11-25";

  const scopedOrders = input.orders.filter((o) => {
    if (input.farmIdFilter && o.farmId !== input.farmIdFilter) return false;
    if (input.organizationIdFilter && o.organizationId !== input.organizationIdFilter) return false;
    if (input.channelFilter && input.channelFilter !== "all" && o.channel !== input.channelFilter) {
      return false;
    }
    return true;
  });
  const currOrders = scopedOrders.filter((o) =>
    inRange(o.orderDateIso, period.startIso, period.endIso),
  );
  const prevOrders = scopedOrders.filter((o) =>
    inRange(o.orderDateIso, period.prevStartIso, period.prevEndIso),
  );

  const nonCancelledCurr = currOrders.filter((o) => o.status !== "cancelled");
  const confirmedOrHigherCurr = nonCancelledCurr.filter(
    (o) => Boolean(o.confirmedAtIso) || o.status !== "pending_confirm",
  );
  const completedCurr = nonCancelledCurr.filter((o) => o.status === "completed");
  const cancelledCurr = currOrders.filter((o) => o.status === "cancelled");

  const grossMerchandiseSalesVnd = nonCancelledCurr.reduce((sum, o) => sum + o.subtotalVnd, 0);
  const gmvVnd = confirmedOrHigherCurr.reduce((sum, o) => sum + o.subtotalVnd, 0);

  let netMerchandiseSalesVnd = 0;
  let totalCustomerCollectedVnd = 0;
  let cogsVnd = 0;
  let missingCostLinesCount = 0;
  let platformRevenueVnd = 0;
  let completedDiscounts = 0;
  let completedRefundMerch = 0;
  let completedGrossBeforeRefund = 0;
  let refundedOrderCount = 0;
  let onTimeCount = 0;
  let deliveredWithPromiseCount = 0;

  const customerCompletedCount = new Map<string, number>();

  for (const ord of completedCurr) {
    const discount = ord.discountVnd ?? 0;
    const refundM = ord.refundedMerchandiseVnd ?? 0;
    const refundS = ord.refundedShippingVnd ?? 0;
    const tax = ord.taxVnd ?? 0;
    const platFee = ord.platformFeeVnd ?? 0;

    completedGrossBeforeRefund += ord.subtotalVnd;
    completedDiscounts += discount;
    completedRefundMerch += refundM;

    const orderNetMerch = Math.max(0, ord.subtotalVnd - discount - refundM);
    netMerchandiseSalesVnd += orderNetMerch;
    totalCustomerCollectedVnd +=
      orderNetMerch + Math.max(0, ord.shippingFeeVnd - refundS) + tax;
    platformRevenueVnd += Math.max(0, platFee - Math.round(refundM * 0.05));

    if (refundM > 0) refundedOrderCount += 1;

    for (const item of ord.items) {
      if (item.costSnapshotVnd == null) {
        missingCostLinesCount += 1;
      } else {
        const effectiveSoldQty = Math.max(0, item.quantity - (item.restockedQty ?? 0));
        cogsVnd += item.costSnapshotVnd * effectiveSoldQty;
      }
    }

    if (ord.promisedDateIso && ord.deliveredDateIso) {
      deliveredWithPromiseCount += 1;
      if (ord.deliveredDateIso.slice(0, 10) <= ord.promisedDateIso.slice(0, 10)) {
        onTimeCount += 1;
      }
    }

    const custKey = ord.customerId ?? ord.customerName;
    customerCompletedCount.set(custKey, (customerCompletedCount.get(custKey) ?? 0) + 1);
  }

  const grossProfitVnd = netMerchandiseSalesVnd - cogsVnd;
  const grossMarginPct =
    netMerchandiseSalesVnd > 0
      ? Number(((grossProfitVnd / netMerchandiseSalesVnd) * 100).toFixed(2))
      : null;

  const scopedExpenses = input.expenses.filter(
    (e) =>
      (!input.farmIdFilter || e.farmId === input.farmIdFilter) &&
      (!input.organizationIdFilter || e.organizationId === input.organizationIdFilter) &&
      inRange(e.dateIso, period.startIso, period.endIso),
  );
  const operatingExpensesVnd = scopedExpenses.reduce((sum, e) => sum + e.amountVnd, 0);
  const internalOperatingResultVnd =
    grossProfitVnd - operatingExpensesVnd - platformRevenueVnd;

  const aovVnd =
    completedCurr.length > 0 ? Math.round(netMerchandiseSalesVnd / completedCurr.length) : null;
  const refundRatePct =
    completedCurr.length > 0
      ? Number(((refundedOrderCount / completedCurr.length) * 100).toFixed(1))
      : null;
  const refundDenomValue = Math.max(0, completedGrossBeforeRefund - completedDiscounts);
  const refundValueRatePct =
    refundDenomValue > 0
      ? Number(((completedRefundMerch / refundDenomValue) * 100).toFixed(1))
      : null;
  const onTimeDeliveryPct =
    deliveredWithPromiseCount > 0
      ? Number(((onTimeCount / deliveredWithPromiseCount) * 100).toFixed(1))
      : null;

  const uniqueCustomers = customerCompletedCount.size;
  const repeatCustomers = Array.from(customerCompletedCount.values()).filter((c) => c >= 2).length;
  const repeatCustomerRatePct =
    uniqueCustomers > 0 ? Number(((repeatCustomers / uniqueCustomers) * 100).toFixed(1)) : null;

  // Previous period full reconciliation
  const prevCompleted = prevOrders.filter((o) => o.status === "completed");
  let previousGrossMerchandiseVnd = 0;
  let previousDiscountsVnd = 0;
  let previousRefundsMerchVnd = 0;
  let previousNetMerchandiseSalesVnd = 0;
  let previousCogsVnd = 0;
  let previousPlatformRevenueVnd = 0;

  for (const ord of prevCompleted) {
    const disc = ord.discountVnd ?? 0;
    const refM = ord.refundedMerchandiseVnd ?? 0;
    previousGrossMerchandiseVnd += ord.subtotalVnd;
    previousDiscountsVnd += disc;
    previousRefundsMerchVnd += refM;
    previousNetMerchandiseSalesVnd += Math.max(0, ord.subtotalVnd - disc - refM);
    previousPlatformRevenueVnd += Math.max(0, (ord.platformFeeVnd ?? 0) - Math.round(refM * 0.05));
    for (const item of ord.items) {
      if (item.costSnapshotVnd != null) {
        const effQty = Math.max(0, item.quantity - (item.restockedQty ?? 0));
        previousCogsVnd += item.costSnapshotVnd * effQty;
      }
    }
  }
  const previousGrossProfitVnd = previousNetMerchandiseSalesVnd - previousCogsVnd;
  const previousGrossMarginPct =
    previousNetMerchandiseSalesVnd > 0
      ? Number(((previousGrossProfitVnd / previousNetMerchandiseSalesVnd) * 100).toFixed(2))
      : null;
  const prevScopedExpenses = input.expenses.filter(
    (e) =>
      (!input.farmIdFilter || e.farmId === input.farmIdFilter) &&
      (!input.organizationIdFilter || e.organizationId === input.organizationIdFilter) &&
      inRange(e.dateIso, period.prevStartIso, period.prevEndIso),
  );
  const previousOperatingExpensesVnd = prevScopedExpenses.reduce((sum, e) => sum + e.amountVnd, 0);
  const previousInternalOperatingResultVnd =
    previousGrossProfitVnd - previousOperatingExpensesVnd - previousPlatformRevenueVnd;
  const previousAovVnd =
    prevCompleted.length > 0 ? Math.round(previousNetMerchandiseSalesVnd / prevCompleted.length) : null;

  const netSalesDeltaPct = calcDeltaPct(netMerchandiseSalesVnd, previousNetMerchandiseSalesVnd);
  const ordersDeltaPct = calcDeltaPct(completedCurr.length, prevCompleted.length);
  const grossProfitDeltaPct = calcDeltaPct(grossProfitVnd, previousGrossProfitVnd);

  // Inventory metrics (bucket exclusion & FEFO awareness — never mix units)
  const scopedStocks = input.stocks.filter((s) =>
    input.farmIdFilter
      ? input.movements.some((m) => m.warehouseId === s.warehouseId) ||
        completedCurr.some((o) => o.items.some((i) => i.productId === s.productId)) ||
        s.productId === "P01"
      : true,
  );
  let inventoryAvailableTotal = 0;
  let inventoryQuarantineTotal = 0;
  let inventoryValueVnd = 0;
  let expiredStockLotsCount = 0;
  const nearExpiryCountsByUnit: Record<string, number> = {};

  const refMs = Date.parse(`${refDate}T00:00:00Z`);
  for (const s of scopedStocks) {
    const avail = Math.max(0, s.onHandQty - s.reservedQty - s.blockedQty);
    inventoryAvailableTotal += avail;
    inventoryQuarantineTotal += s.quarantineQty;
    inventoryValueVnd += avail * s.unitCostVnd;

    if (s.expiryDateIso) {
      const expMs = Date.parse(`${s.expiryDateIso}T00:00:00Z`);
      const daysLeft = Math.round((expMs - refMs) / (1000 * 60 * 60 * 24));
      if (daysLeft < 0) {
        expiredStockLotsCount += 1;
      } else if (daysLeft <= 10) {
        nearExpiryCountsByUnit[s.unitLabel] = (nearExpiryCountsByUnit[s.unitLabel] ?? 0) + avail;
      }
    }
  }

  const inventoryTurnover =
    inventoryValueVnd > 0 ? Number((cogsVnd / inventoryValueVnd).toFixed(2)) : null;

  // Sell-through per unit (exclude internal transfers!)
  const unitSoldMap = new Map<string, number>();
  for (const ord of completedCurr) {
    for (const item of ord.items) {
      const effectiveSold = Math.max(0, item.quantity - (item.restockedQty ?? 0));
      unitSoldMap.set(item.unitLabel, (unitSoldMap.get(item.unitLabel) ?? 0) + effectiveSold);
    }
  }
  const unitSupplyMap = new Map<string, number>();
  for (const st of scopedStocks) {
    unitSupplyMap.set(st.unitLabel, (unitSupplyMap.get(st.unitLabel) ?? 0) + st.onHandQty);
  }
  for (const mv of input.movements) {
    if (!mv.isInternalTransfer && mv.type === "inbound" && inRange(mv.dateIso, period.startIso, period.endIso)) {
      unitSupplyMap.set(mv.unitLabel, (unitSupplyMap.get(mv.unitLabel) ?? 0) + Math.max(0, mv.quantityDelta));
    }
  }

  const allUnits = new Set([...unitSoldMap.keys(), ...unitSupplyMap.keys()]);
  const sellThroughByUnit: UnitSellThroughRow[] = Array.from(allUnits).map((unitLabel) => {
    const soldQty = unitSoldMap.get(unitLabel) ?? 0;
    const supply = unitSupplyMap.get(unitLabel) ?? 0;
    return {
      unitLabel,
      soldQty,
      beginningPlusInboundQty: supply,
      sellThroughPct: supply > 0 ? Number(((soldQty / supply) * 100).toFixed(1)) : null,
    };
  });

  // Receivables / Payables
  const scopedDebts = input.debts.filter((d) =>
    input.farmIdFilter ? d.farmId === input.farmIdFilter : true,
  );
  let receivableOpenVnd = 0;
  let payableOpenVnd = 0;
  let overdueDebtCount = 0;
  for (const d of scopedDebts) {
    const rem = Math.max(0, d.originalVnd - d.paidVnd);
    if (d.status !== "settled" && rem > 0) {
      if (d.kind === "receivable") receivableOpenVnd += rem;
      else payableOpenVnd += rem;
      if (d.status === "overdue") overdueDebtCount += 1;
    }
  }

  // Confirmed volunteer hours (deduplicate by missionId, strictly confirmed only!)
  const approvedMissions = input.missions.filter(
    (m) =>
      m.status === "coordinator_approved" &&
      (!input.farmIdFilter || m.farmId === input.farmIdFilter),
  );
  const confirmedHoursMap = new Map<string, number>();
  for (const m of approvedMissions) {
    confirmedHoursMap.set(m.id, m.approvedHours);
  }
  for (const rec of input.hourRecords ?? []) {
    if (
      rec.status === "approved" &&
      (!input.farmIdFilter || rec.farmId === input.farmIdFilter) &&
      !confirmedHoursMap.has(rec.missionId)
    ) {
      confirmedHoursMap.set(rec.missionId, rec.hours);
    }
  }
  const confirmedVolunteerHours = Array.from(confirmedHoursMap.values()).reduce((s, h) => s + h, 0);

  const acceptedOrApprovedMissions = input.missions.filter(
    (m) =>
      (m.status === "farm_accepted" || m.status === "coordinator_approved") &&
      (!input.farmIdFilter || m.farmId === input.farmIdFilter),
  );
  const uniqueFarmsSupported = new Set(acceptedOrApprovedMissions.map((m) => m.farmId)).size;

  return {
    period,
    ordersTotalCount: currOrders.length,
    completedOrdersCount: completedCurr.length,
    cancelledOrdersCount: cancelledCurr.length,
    grossMerchandiseSalesVnd,
    gmvVnd,
    totalDiscountsVnd: completedDiscounts,
    totalRefundsMerchVnd: completedRefundMerch,
    netMerchandiseSalesVnd,
    totalCustomerCollectedVnd,
    cogsVnd,
    missingCostLinesCount,
    grossProfitVnd,
    grossMarginPct,
    operatingExpensesVnd,
    platformRevenueVnd,
    internalOperatingResultVnd,
    aovVnd,
    refundRatePct,
    refundValueRatePct,
    onTimeDeliveryPct,
    repeatCustomerRatePct,
    inventoryAvailableTotal,
    inventoryQuarantineTotal,
    inventoryValueVnd,
    inventoryTurnover,
    nearExpiryCountsByUnit,
    expiredStockLotsCount,
    sellThroughByUnit,
    receivableOpenVnd,
    payableOpenVnd,
    overdueDebtCount,
    confirmedVolunteerHours,
    uniqueFarmsSupported,
    completedMissionsCount: approvedMissions.length,
    previousCompletedOrdersCount: prevCompleted.length,
    previousGrossMerchandiseVnd,
    previousDiscountsVnd,
    previousRefundsMerchVnd,
    previousNetMerchandiseSalesVnd,
    previousCogsVnd,
    previousGrossProfitVnd,
    previousGrossMarginPct,
    previousOperatingExpensesVnd,
    previousInternalOperatingResultVnd,
    previousAovVnd,
    netSalesDeltaPct,
    ordersDeltaPct,
    grossProfitDeltaPct,
  };
}

export interface ArApAgingSummaryRow {
  bucket: ArApAgingBucket;
  labelVi: string;
  labelEn: string;
  receivableVnd: number;
  payableVnd: number;
  count: number;
}

export function computeArApAging(
  debts: ReceivablePayable[],
  refDateIso = "2026-11-25",
): ArApAgingSummaryRow[] {
  const buckets: Record<ArApAgingBucket, ArApAgingSummaryRow> = {
    current: { bucket: "current", labelVi: "Trong hạn", labelEn: "Current", receivableVnd: 0, payableVnd: 0, count: 0 },
    "1_30": { bucket: "1_30", labelVi: "Quá hạn 1–30 ngày", labelEn: "1–30 days", receivableVnd: 0, payableVnd: 0, count: 0 },
    "31_60": { bucket: "31_60", labelVi: "Quá hạn 31–60 ngày", labelEn: "31–60 days", receivableVnd: 0, payableVnd: 0, count: 0 },
    "61_90": { bucket: "61_90", labelVi: "Quá hạn 61–90 ngày", labelEn: "61–90 days", receivableVnd: 0, payableVnd: 0, count: 0 },
    over_90: { bucket: "over_90", labelVi: "Quá hạn >90 ngày", labelEn: ">90 days", receivableVnd: 0, payableVnd: 0, count: 0 },
  };
  const refMs = Date.parse(`${refDateIso}T00:00:00Z`);

  for (const d of debts) {
    const rem = Math.max(0, d.originalVnd - d.paidVnd);
    if (d.status === "settled" || rem <= 0) continue;
    const dueMs = Date.parse(`${d.dueDateIso}T00:00:00Z`);
    const daysOverdue = Math.floor((refMs - dueMs) / (1000 * 60 * 60 * 24));
    const key: ArApAgingBucket =
      daysOverdue <= 0
        ? "current"
        : daysOverdue <= 30
        ? "1_30"
        : daysOverdue <= 60
        ? "31_60"
        : daysOverdue <= 90
        ? "61_90"
        : "over_90";
    buckets[key].count += 1;
    if (d.kind === "receivable") buckets[key].receivableVnd += rem;
    else buckets[key].payableVnd += rem;
  }

  return Object.values(buckets);
}

export interface StockLedgerSummary {
  openingQty: number;
  inboundQty: number;
  outboundQty: number;
  lossQty: number;
  computedOnHandQty: number;
  snapshotOnHandQty: number;
  reservedQty: number;
  quarantineQty: number;
  availableQty: number;
  reconciled: boolean;
}

export function computeStockLedgerSummary(
  openingQty: number,
  stocks: WarehouseStock[],
  movements: InventoryMovement[],
): StockLedgerSummary {
  let inboundQty = 0;
  let outboundQty = 0;
  let lossQty = 0;
  for (const mv of movements) {
    if (mv.isInternalTransfer) continue;
    if (mv.type === "inbound" || mv.type === "return_restock") {
      inboundQty += Math.abs(mv.quantityDelta);
    } else if (mv.type === "outbound") {
      outboundQty += Math.abs(mv.quantityDelta);
    } else if (mv.type === "loss") {
      lossQty += Math.abs(mv.quantityDelta);
    }
  }
  const computedOnHandQty = openingQty + inboundQty - outboundQty - lossQty;
  const snapshotOnHandQty = stocks.reduce((s, st) => s + st.onHandQty, 0);
  const reservedQty = stocks.reduce((s, st) => s + st.reservedQty, 0);
  const quarantineQty = stocks.reduce((s, st) => s + st.quarantineQty, 0);
  const blockedNonOverlap = stocks.reduce(
    (s, st) => s + Math.max(st.blockedQty, st.quarantineQty),
    0,
  );
  const availableQty = Math.max(0, snapshotOnHandQty - reservedQty - blockedNonOverlap);

  return {
    openingQty,
    inboundQty,
    outboundQty,
    lossQty,
    computedOnHandQty,
    snapshotOnHandQty,
    reservedQty,
    quarantineQty,
    availableQty,
    reconciled: computedOnHandQty === snapshotOnHandQty,
  };
}

export interface MemberDrilldownRow {
  farmId: string;
  farmName: string;
  unitName: string;
  ordersCount: number;
  grossVnd: number;
  netVnd: number;
  cogsVnd: number;
  grossProfitVnd: number;
}

export function computeMemberDrilldown(
  orders: DemoOrder[],
  farms: Farm[],
  periodStartIso: string,
  periodEndIso: string,
): MemberDrilldownRow[] {
  const farmLookup = new Map(farms.map((f) => [f.id, f]));
  const map = new Map<string, MemberDrilldownRow>();

  for (const ord of orders) {
    if (ord.status !== "completed" || !inRange(ord.orderDateIso, periodStartIso, periodEndIso)) {
      continue;
    }
    const farm = farmLookup.get(ord.farmId);
    const existing = map.get(ord.farmId) ?? {
      farmId: ord.farmId,
      farmName: farm?.name ?? ord.farmName,
      unitName: farm?.administrativeUnitName ?? "",
      ordersCount: 0,
      grossVnd: 0,
      netVnd: 0,
      cogsVnd: 0,
      grossProfitVnd: 0,
    };
    const disc = ord.discountVnd ?? 0;
    const refM = ord.refundedMerchandiseVnd ?? 0;
    const net = Math.max(0, ord.subtotalVnd - disc - refM);
    const cogs = ord.items.reduce((s, it) => {
      if (it.costSnapshotVnd == null) return s;
      return s + it.costSnapshotVnd * Math.max(0, it.quantity - (it.restockedQty ?? 0));
    }, 0);

    existing.ordersCount += 1;
    existing.grossVnd += ord.subtotalVnd;
    existing.netVnd += net;
    existing.cogsVnd += cogs;
    existing.grossProfitVnd = existing.netVnd - existing.cogsVnd;
    map.set(ord.farmId, existing);
  }

  return Array.from(map.values()).sort((a, b) => b.netVnd - a.netVnd);
}
