import { formatCountdownRemaining, isClockInWindow } from "@/lib/clock/vn-clock";
import type {
  CampaignRecord,
  Locale,
  PromotionRecord,
} from "@/types/naifarm";
import type { BusinessMetricsReport } from "@/lib/metrics/business-metrics";

export interface PromoEvaluationResult {
  eligible: boolean;
  promo: PromotionRecord;
  merchDiscountVnd: number;
  shipDiscountVnd: number;
  reasonVi: string;
  reasonEn: string;
}

export function evaluatePromotion(
  promo: PromotionRecord,
  subtotalVnd: number,
  shippingFeeVnd: number,
  locale: Locale,
  clockIso: string,
  isMinorAccount = false,
): PromoEvaluationResult {
  if (promo.excludeMinors && isMinorAccount) {
    return {
      eligible: false,
      promo,
      merchDiscountVnd: 0,
      shipDiscountVnd: 0,
      reasonVi: "Tài khoản học sinh dưới 18 tuổi không áp dụng ưu đãi mua sắm thương mại.",
      reasonEn: "Commercial promo codes are disabled for minor learner accounts.",
    };
  }
  if (!promo.active) {
    return {
      eligible: false,
      promo,
      merchDiscountVnd: 0,
      shipDiscountVnd: 0,
      reasonVi: "Chương trình ưu đãi đang tạm dừng hoặc đã kết thúc.",
      reasonEn: "This promotion is paused or has ended.",
    };
  }
  if (!isClockInWindow(clockIso, promo.startIso, promo.endIso)) {
    const startMs = Date.parse(promo.startIso);
    const nowMs = Date.parse(clockIso);
    const notStarted = nowMs < startMs;
    return {
      eligible: false,
      promo,
      merchDiscountVnd: 0,
      shipDiscountVnd: 0,
      reasonVi: notStarted
        ? "Ưu đãi chưa đến giờ mở theo lịch đã duyệt."
        : "Ưu đãi đã quá hạn sử dụng theo đồng hồ hệ thống.",
      reasonEn: notStarted
        ? "Promotion has not started yet per approved schedule."
        : "Promotion expired past its scheduled end window.",
    };
  }
  if (!promo.eligibleLocales.includes(locale)) {
    return {
      eligible: false,
      promo,
      merchDiscountVnd: 0,
      shipDiscountVnd: 0,
      reasonVi: "Ưu đãi chưa bật cho ngôn ngữ/khu vực đang chọn.",
      reasonEn: "Offer does not apply to the currently active locale.",
    };
  }
  if (promo.redeemedCount >= promo.maxRedemptionsTotal) {
    return {
      eligible: false,
      promo,
      merchDiscountVnd: 0,
      shipDiscountVnd: 0,
      reasonVi: "Đã hết lượt áp dụng theo giới hạn chương trình.",
      reasonEn: "Maximum redemption quota reached.",
    };
  }
  if (
    promo.stockAllocatedUnits != null &&
    promo.stockUsedUnits != null &&
    promo.stockUsedUnits >= promo.stockAllocatedUnits
  ) {
    return {
      eligible: false,
      promo,
      merchDiscountVnd: 0,
      shipDiscountVnd: 0,
      reasonVi: "Đã hết suất hàng phân bổ cho ưu đãi này.",
      reasonEn: "Allocated promo unit stock has been fully claimed.",
    };
  }
  if (promo.budgetUsedVnd >= promo.budgetCapVnd) {
    return {
      eligible: false,
      promo,
      merchDiscountVnd: 0,
      shipDiscountVnd: 0,
      reasonVi: "Đã hết ngân sách phân bổ cho đợt ưu đãi.",
      reasonEn: "Campaign discount budget cap reached.",
    };
  }
  if (subtotalVnd < promo.minSpendVnd) {
    return {
      eligible: false,
      promo,
      merchDiscountVnd: 0,
      shipDiscountVnd: 0,
      reasonVi: `Cần đơn từ ${promo.minSpendVnd.toLocaleString("vi-VN")} đ để áp dụng.`,
      reasonEn: `Minimum spend of ${promo.minSpendVnd.toLocaleString("en-US")} VND required.`,
    };
  }

  let merchDiscountVnd = 0;
  let shipDiscountVnd = 0;

  if (promo.discountPercent) {
    merchDiscountVnd = Math.round((subtotalVnd * promo.discountPercent) / 100);
  } else if (promo.discountFixedVnd) {
    merchDiscountVnd = promo.discountFixedVnd;
  }

  if (promo.shippingDiscountVnd) {
    shipDiscountVnd = Math.min(shippingFeeVnd, promo.shippingDiscountVnd);
  }

  const remainingBudget = Math.max(0, promo.budgetCapVnd - promo.budgetUsedVnd);
  merchDiscountVnd = Math.min(
    subtotalVnd,
    promo.maxDiscountVnd,
    remainingBudget,
    merchDiscountVnd,
  );

  return {
    eligible: true,
    promo,
    merchDiscountVnd,
    shipDiscountVnd,
    reasonVi: `Hợp lệ — giảm ${merchDiscountVnd.toLocaleString("vi-VN")} đ${
      shipDiscountVnd > 0 ? ` + ${shipDiscountVnd.toLocaleString("vi-VN")} đ giao hàng` : ""
    }.`,
    reasonEn: `Applied — ${merchDiscountVnd.toLocaleString("en-US")} VND off${
      shipDiscountVnd > 0 ? ` + ${shipDiscountVnd.toLocaleString("en-US")} VND delivery discount` : ""
    }.`,
  };
}

export function applyPromotionsToCart(
  promos: PromotionRecord[],
  appliedCodes: string[],
  subtotalVnd: number,
  shippingFeeVnd: number,
  locale: Locale,
  clockIso: string,
  isMinorAccount = false,
): {
  applied: PromoEvaluationResult[];
  rejected: { code: string; reasonVi: string; reasonEn: string }[];
  totalMerchDiscountVnd: number;
  totalShipDiscountVnd: number;
  finalTotalVnd: number;
} {
  const cleanCodes = Array.from(
    new Set(appliedCodes.map((c) => c.trim().toUpperCase()).filter(Boolean)),
  );
  const applied: PromoEvaluationResult[] = [];
  const rejected: { code: string; reasonVi: string; reasonEn: string }[] = [];
  let remainingSubtotal = Math.max(0, subtotalVnd);
  let remainingShipping = Math.max(0, shippingFeeVnd);

  for (const code of cleanCodes) {
    const found = promos.find((p) => p.code.toUpperCase() === code);
    if (!found) {
      rejected.push({
        code,
        reasonVi: `Không tìm thấy mã "${code}".`,
        reasonEn: `Promo code "${code}" was not found.`,
      });
      continue;
    }
    if (applied.length > 0 && (!found.stackable || applied.some((a) => !a.promo.stackable))) {
      rejected.push({
        code,
        reasonVi: `Mã "${code}" không hỗ trợ cộng dồn với ưu đãi đang chọn.`,
        reasonEn: `Code "${code}" cannot stack with the currently applied promotion.`,
      });
      continue;
    }
    const res = evaluatePromotion(
      found,
      remainingSubtotal,
      remainingShipping,
      locale,
      clockIso,
      isMinorAccount,
    );
    if (!res.eligible) {
      rejected.push({ code, reasonVi: res.reasonVi, reasonEn: res.reasonEn });
      continue;
    }
    applied.push(res);
    remainingSubtotal = Math.max(0, remainingSubtotal - res.merchDiscountVnd);
    remainingShipping = Math.max(0, remainingShipping - res.shipDiscountVnd);
  }

  const totalMerchDiscountVnd = Math.min(
    subtotalVnd,
    applied.reduce((s, r) => s + r.merchDiscountVnd, 0),
  );
  const totalShipDiscountVnd = Math.min(
    shippingFeeVnd,
    applied.reduce((s, r) => s + r.shipDiscountVnd, 0),
  );
  const finalTotalVnd = Math.max(
    0,
    subtotalVnd - totalMerchDiscountVnd + (shippingFeeVnd - totalShipDiscountVnd),
  );

  return {
    applied,
    rejected,
    totalMerchDiscountVnd,
    totalShipDiscountVnd,
    finalTotalVnd,
  };
}

/**
 * Computes proportional refund preserving allocated order discount ratio so refunds never exceed paid merchandise.
 */
export function calculateProportionalRefund(
  grossSubtotalVnd: number,
  discountVnd: number,
  returnedGrossVnd: number,
): number {
  if (grossSubtotalVnd <= 0 || returnedGrossVnd <= 0) return 0;
  const netPaidMerch = Math.max(0, grossSubtotalVnd - discountVnd);
  const ratio = Math.min(1, returnedGrossVnd / grossSubtotalVnd);
  return Math.round(netPaidMerch * ratio);
}

export function resolveCampaignRuntimeState(
  campaign: CampaignRecord,
  clockIso: string,
): "recap" | "active" | "upcoming" | "paused_or_draft" {
  if (campaign.status === "paused" || campaign.status === "cancelled" || campaign.status === "draft" || campaign.status === "submitted") {
    return "paused_or_draft";
  }
  const t = Date.parse(clockIso);
  const s = Date.parse(campaign.startIso);
  const e = Date.parse(campaign.endIso);
  if (campaign.status === "ended" || t > e) return "recap";
  if (t >= s && t <= e) return "active";
  return "upcoming";
}

export function getPromotionTimeRemainingLabel(
  promo: PromotionRecord,
  clockIso: string,
  locale: Locale,
): string {
  const t = Date.parse(clockIso);
  const s = Date.parse(promo.startIso);
  const e = Date.parse(promo.endIso);
  if (t < s) {
    return locale === "en" ? "Starts soon" : "Sắp mở theo lịch";
  }
  if (t > e || !promo.active) {
    return locale === "en" ? "Ended" : "Đã kết thúc";
  }
  return formatCountdownRemaining(clockIso, promo.endIso, locale);
}

export interface CampaignAnalyticsSummary {
  sessions: number;
  orders: number;
  conversionPct: number | null;
  revenueVnd: number;
  budgetSpentVnd: number;
  budgetUtilizationPct: number | null;
  redemptions: number;
}

export function computeCampaignAnalytics(
  campaign: CampaignRecord,
  promos: PromotionRecord[],
): CampaignAnalyticsSummary {
  const linkedPromos = promos.filter(
    (p) => p.campaignId === campaign.id || campaign.promotionIds.includes(p.id),
  );
  const redemptions = linkedPromos.reduce((s, p) => s + p.redeemedCount, 0);
  const budgetSpentVnd =
    linkedPromos.length > 0
      ? linkedPromos.reduce((s, p) => s + p.budgetUsedVnd, 0)
      : campaign.budgetSpentVnd;
  return {
    sessions: campaign.fixtureSessionsCount,
    orders: campaign.fixtureOrdersCount,
    conversionPct:
      campaign.fixtureSessionsCount > 0
        ? Number(((campaign.fixtureOrdersCount / campaign.fixtureSessionsCount) * 100).toFixed(1))
        : null,
    revenueVnd: campaign.fixtureRevenueVnd,
    budgetSpentVnd,
    budgetUtilizationPct:
      campaign.budgetPlannedVnd > 0
        ? Number(((budgetSpentVnd / campaign.budgetPlannedVnd) * 100).toFixed(1))
        : null,
    redemptions,
  };
}

export interface ManagerStrategyCard {
  id: string;
  severity: "info" | "warning" | "action";
  titleVi: string;
  titleEn: string;
  rationaleVi: string;
  rationaleEn: string;
  suggestedHref: string;
}

/**
 * Rule-based deterministic manager suggestions (explicitly not live market AI inference).
 */
export function getManagerStrategyCards(
  report: BusinessMetricsReport,
  pendingApprovalCampaignsCount: number,
  locale: Locale,
): ManagerStrategyCard[] {
  const cards: ManagerStrategyCard[] = [];
  const nearExpirySum = Object.values(report.nearExpiryCountsByUnit).reduce((s, n) => s + n, 0);

  if (nearExpirySum > 0) {
    cards.push({
      id: "STRAT-FEFO-COMBO",
      severity: "warning",
      titleVi: `Phát hiện ${nearExpirySum} đơn vị tồn cận hạn — gợi ý combo NaiRescue / nhắc QC`,
      titleEn: `${nearExpirySum} near-expiry stock units detected — schedule NaiRescue bundle`,
      rationaleVi: "Quy tắc FEFO: ưu tiên xuất lô gần hạn trước và mở combo giải cứu đủ điều kiện an toàn.",
      rationaleEn: "FEFO rule: prioritize earliest expiry lots before packaging new seasonal sets.",
      suggestedHref: "/farmer?mode=erp&tab=inventory",
    });
  }

  if (report.grossMarginPct !== null && report.grossMarginPct < 29) {
    cards.push({
      id: "STRAT-MARGIN-GUARD",
      severity: "warning",
      titleVi: `Biên gộp hiện ở ${report.grossMarginPct}% — kiểm tra lại mức giảm giá tối đa`,
      titleEn: `Gross margin at ${report.grossMarginPct}% — review promotion discount caps`,
      rationaleVi: "Quy tắc bảo vệ biên: khi biên gộp dưới 29%, hạn chế chồng mã và ưu tiên nhận tại vườn.",
      rationaleEn: "Margin rule: disable stacked promos and incentivize zero-delivery orchard pickup.",
      suggestedHref: "/farmer?mode=erp&tab=marketing",
    });
  }

  if (pendingApprovalCampaignsCount > 0) {
    cards.push({
      id: "STRAT-APPROVAL-QUEUE",
      severity: "action",
      titleVi: `Còn ${pendingApprovalCampaignsCount} chiến dịch / banner chờ phê duyệt (Maker ≠ Checker)`,
      titleEn: `${pendingApprovalCampaignsCount} campaign drafts awaiting independent approval`,
      rationaleVi: "Cần rà soát nội dung song ngữ VI/EN và ngân sách trước mốc D-7 Ngày hội 05/12.",
      rationaleEn: "Verify VI/EN creative copy and budget caps before the D-7 milestone.",
      suggestedHref: "/admin?tab=campaigns",
    });
  }

  cards.push({
    id: "STRAT-EN-TOURS",
    severity: "info",
    titleVi: "Đồng bộ hướng dẫn viên song ngữ cho các ca cuối tuần 28–29/11 & 05/12",
    titleEn: "Ensure bilingual ambassador shift coverage for Nov 28–29 & Dec 5 tours",
    rationaleVi:
      locale === "en"
        ? "Rule-based check (local data): high bilingual tour interest requires confirmed W03 guides."
        : "Gợi ý theo quy tắc: các ca tour song ngữ cần phân công rõ TNV A2/B1 từ W03.",
    rationaleEn: "Confirmed bilingual W03 guides ensure safe and accurate orchard tour interpretation.",
    suggestedHref: "/volunteer?tab=ambassador",
  });

  return cards;
}
