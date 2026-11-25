import type {
  DemoOrder,
  ExpenseEntry,
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
  startIso: string; // YYYY-MM-DD (Asia/Ho_Chi_Minh)
  endIso: string;
  prevStartIso: string;
  prevEndIso: string;
}

export const PERIOD_WINDOWS: Record<PeriodKey, PeriodWindow> = {
  current_month: {
    key: "current_month",
    label: "Tháng 11/2026 (01/11 – 25/11)",
    startIso: "2026-11-01",
    endIso: "2026-11-25",
    prevStartIso: "2026-10-01",
    prevEndIso: "2026-10-25",
  },
  previous_month: {
    key: "previous_month",
    label: "Tháng 10/2026 (01/10 – 31/10)",
    startIso: "2026-10-01",
    endIso: "2026-10-31",
    prevStartIso: "2026-09-01",
    prevEndIso: "2026-09-30",
  },
  last_7d: {
    key: "last_7d",
    label: "7 ngày gần nhất (19/11 – 25/11)",
    startIso: "2026-11-19",
    endIso: "2026-11-25",
    prevStartIso: "2026-11-12",
    prevEndIso: "2026-11-18",
  },
  last_30d: {
    key: "last_30d",
    label: "30 ngày gần nhất (27/10 – 25/11)",
    startIso: "2026-10-27",
    endIso: "2026-11-25",
    prevStartIso: "2026-09-27",
    prevEndIso: "2026-10-26",
  },
  all: {
    key: "all",
    label: "Toàn bộ kỳ ghi nhận (T10–T11/2026)",
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
  previousNetMerchandiseSalesVnd: number;
  netSalesDeltaPct: number | null;
  ordersDeltaPct: number | null;
}

export interface ComputeMetricsInput {
  orders: DemoOrder[];
  stocks: WarehouseStock[];
  movements: InventoryMovement[];
  expenses: ExpenseEntry[];
  debts: ReceivablePayable[];
  missions: VolunteerMission[];
  hourRecords?: VolunteerHourRecord[];
  periodKey: PeriodKey;
  farmIdFilter?: string;
  refDateIso?: string;
}

export function computeBusinessMetrics(input: ComputeMetricsInput): BusinessMetricsReport {
  const period = PERIOD_WINDOWS[input.periodKey];
  const refDate = input.refDateIso ?? "2026-11-25";

  const scopedOrders = input.orders.filter((o) =>
    input.farmIdFilter ? o.farmId === input.farmIdFilter : true,
  );
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
  let completedRefundShip = 0;
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
    completedRefundShip += refundS;

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
      ? Number(((grossProfitVnd / netMerchandiseSalesVnd) * 100).toFixed(1))
      : null;

  const scopedExpenses = input.expenses.filter(
    (e) =>
      (!input.farmIdFilter || e.farmId === input.farmIdFilter) &&
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

  // Previous period comparison
  const prevCompleted = prevOrders.filter((o) => o.status === "completed");
  const previousNetMerchandiseSalesVnd = prevCompleted.reduce(
    (sum, o) =>
      sum + Math.max(0, o.subtotalVnd - (o.discountVnd ?? 0) - (o.refundedMerchandiseVnd ?? 0)),
    0,
  );
  const netSalesDeltaPct = calcDeltaPct(netMerchandiseSalesVnd, previousNetMerchandiseSalesVnd);
  const ordersDeltaPct = calcDeltaPct(nonCancelledCurr.length, prevOrders.filter((o) => o.status !== "cancelled").length);

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
    previousNetMerchandiseSalesVnd,
    netSalesDeltaPct,
    ordersDeltaPct,
  };
}
