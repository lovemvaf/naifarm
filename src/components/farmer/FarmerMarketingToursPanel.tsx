"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Compass,
  Globe2,
  Megaphone,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { formatVnDate } from "@/lib/clock/vn-clock";
import {
  computeCampaignAnalytics,
  getManagerStrategyCards,
  resolveCampaignRuntimeState,
} from "@/lib/commerce/promotion-engine";
import { computeBusinessMetrics } from "@/lib/metrics/business-metrics";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { formatVnd } from "@/lib/format";
import { notifyError, notifySuccess } from "@/lib/toast";
import { Badge, Button, Card, DemoBanner } from "@/components/ui/Primitives";
import type { CampaignStatus } from "@/types/naifarm";

export function FarmerMarketingToursPanel({
  farmId,
  farmName,
  actorName,
}: {
  farmId: string;
  farmName: string;
  actorName: string;
}) {
  const { locale } = useLocale();
  const isEn = locale === "en";

  const {
    activeClockIso,
    campaigns,
    promotions,
    experienceBookings,
    internationalInquiries,
    orders,
    warehouseStocks,
    inventoryMovements,
    expenses,
    receivablesPayables,
    missions,
    volunteerHours,
    createCampaign,
    advanceCampaignStatus,
    updateExperienceBookingStatus,
    respondInternationalInquiry,
  } = useDemoStore();

  const [showWizard, setShowWizard] = useState(false);
  const [titleVi, setTitleVi] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [subtitleVi, setSubtitleVi] = useState("Kết nối mùa vụ nông sản vườn & workshop QR cuối tuần");
  const [budgetVnd, setBudgetVnd] = useState("5000000");
  const [startIso, setStartIso] = useState("2026-12-01T08:00:00+07:00");
  const [endIso, setEndIso] = useState("2026-12-05T20:00:00+07:00");
  const [checkerName, setCheckerName] = useState("Trần Minh Châu (Ban Kiểm soát HTX)");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const metricsReport = useMemo(
    () =>
      computeBusinessMetrics({
        orders,
        stocks: warehouseStocks,
        movements: inventoryMovements,
        expenses,
        debts: receivablesPayables,
        missions,
        hourRecords: volunteerHours,
        periodKey: "org_tt_nov_1_24",
        organizationIdFilter: "org-tt-scenario",
        refDateIso: "2026-11-25",
      }),
    [orders, warehouseStocks, inventoryMovements, expenses, receivablesPayables, missions, volunteerHours],
  );

  const pendingCount = campaigns.filter((c) => c.status === "draft" || c.status === "submitted").length;
  const strategyCards = useMemo(
    () => getManagerStrategyCards(metricsReport, pendingCount, locale),
    [metricsReport, pendingCount, locale],
  );

  const scopedBookings = useMemo(
    () => experienceBookings.filter((b) => b.farmId === farmId || experienceBookings.length <= 20),
    [experienceBookings, farmId],
  );

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleVi.trim()) {
      notifyError(isEn ? "Please enter a campaign title." : "Vui lòng nhập tên chiến dịch.");
      return;
    }
    const created = createCampaign({
      slug: `${titleVi
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")}-${Date.now().toString().slice(-4)}`,
      titleVi: titleVi.trim(),
      titleEn: titleEn.trim() || titleVi.trim(),
      subtitleVi: subtitleVi.trim(),
      subtitleEn: subtitleVi.trim(),
      objectiveVi: `Giới thiệu nông sản và trải nghiệm tại ${farmName}`,
      objectiveEn: `Promote traceable produce and orchard tours for ${farmName}`,
      classification: "platform_initiative",
      organizer: `${farmName} (NaiFarm W02)`,
      targetAudience: ["domestic_customer", "international_guest"],
      startIso,
      endIso,
      timezone: "Asia/Ho_Chi_Minh",
      priority: 8,
      showNationalFlagAccent: false,
      bannerImage: "/images/stitch/stitch-02.jpg",
      bannerAltVi: titleVi.trim(),
      bannerAltEn: titleEn.trim() || titleVi.trim(),
      primaryCtaLabelVi: "Xem gian hàng chiến dịch",
      primaryCtaLabelEn: "Explore campaign",
      primaryCtaHref: "/marketplace",
      makerName: actorName,
      productIds: ["P01", "P06"],
      farmIds: [farmId],
      experienceSlugs: ["mot-ngay-lam-nong-dan-cu-lao-chu-ba-minh"],
      liveIds: ["NF-LIVE-01"],
      lessonSlugs: ["dong-nai-greetings-and-agricultural-origins-a1"],
      promotionIds: ["PROMO-25NOV"],
      budgetPlannedVnd: Math.max(500000, Number(budgetVnd) || 5000000),
      agendaItems: [],
    });
    setTitleVi("");
    setTitleEn("");
    setShowWizard(false);
    notifySuccess(
      isEn
        ? `Created draft campaign ${created.id}. Independent checker must approve before publishing.`
        : `Đã tạo bản nháp ${created.id}. Cần người duyệt độc lập (Maker ≠ Checker) trước khi mở.`,
    );
  };

  return (
    <div className="space-y-6">
      <DemoBanner
        title={isEn ? "Rule-Based Operations Assistant & Maker–Checker Governance" : "Gợi ý vận hành theo quy tắc & Tách quyền Maker ≠ Checker"}
        detail={
          isEn
            ? "Strategy cards inspect inventory FEFO, gross margin, and pending approvals using local deterministic rules — no live external AI calls."
            : "Thẻ gợi ý dùng quy tắc nội bộ kiểm tra tồn cận hạn FEFO, biên gộp và hồ sơ chờ duyệt — người lập chiến dịch không tự phê duyệt phát hành."
        }
      />

      {/* Rule-Based Strategy Cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {strategyCards.map((card) => (
          <Card
            key={card.id}
            className="flex flex-col justify-between border-[#D6DED2] bg-[#FAF8F1] p-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <Badge
                  tone={
                    card.severity === "warning"
                      ? "warning"
                      : card.severity === "action"
                      ? "gold"
                      : "info"
                  }
                >
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  <span>{isEn ? "Rule check" : "Theo quy tắc"}</span>
                </Badge>
              </div>
              <p className="mt-2 text-sm font-bold text-[#25352B]">
                {isEn ? card.titleEn : card.titleVi}
              </p>
              <p className="mt-1 text-xs text-[#52645A]">
                {isEn ? card.rationaleEn : card.rationaleVi}
              </p>
            </div>
            <Link
              href={buildLocalizedHref(card.suggestedHref, locale)}
              className="mt-3 inline-block text-xs font-bold text-[#245B3D] underline"
            >
              {isEn ? "Open related tool →" : "Mở mục liên quan →"}
            </Link>
          </Card>
        ))}
      </div>

      {/* Campaign Wizard & Approval Queue */}
      <Card className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
              <Megaphone className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
              <span>
                {isEn
                  ? `Seasonal Campaigns & Promotions (${campaigns.length})`
                  : `Chiến dịch Mùa vụ & Phê duyệt phát hành (${campaigns.length})`}
              </span>
            </h2>
            <p className="text-xs text-[#52645A]">
              {isEn
                ? "Checker identity must differ from the campaign creator (Maker ≠ Checker)."
                : "Danh tính người phê duyệt phải khác người lập đề xuất (Maker ≠ Checker)."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={checkerName}
              onChange={(e) => setCheckerName(e.target.value)}
              aria-label={isEn ? "Independent checker name" : "Người phê duyệt độc lập"}
              className="min-h-[38px] rounded-[10px] border border-[#C7D2C2] bg-white px-2.5 text-xs"
            />
            <Button size="sm" variant="primary" onClick={() => setShowWizard((v) => !v)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>{showWizard ? (isEn ? "Close" : "Đóng") : isEn ? "New Campaign Draft" : "Tạo chiến dịch mới"}</span>
            </Button>
          </div>
        </div>

        {showWizard ? (
          <form
            onSubmit={handleCreateCampaign}
            className="grid grid-cols-1 gap-3 rounded-[14px] border border-[#D6DED2] bg-[#FAF8F1] p-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <input
              type="text"
              required
              value={titleVi}
              onChange={(e) => setTitleVi(e.target.value)}
              placeholder="Tên chiến dịch (Tiếng Việt)..."
              className="min-h-[40px] rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
            />
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="Campaign title (English)..."
              className="min-h-[40px] rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
            />
            <input
              type="number"
              min={500000}
              value={budgetVnd}
              onChange={(e) => setBudgetVnd(e.target.value)}
              placeholder="Ngân sách dự kiến (VNĐ)"
              className="min-h-[40px] rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs tabular-nums"
            />
            <input
              type="text"
              value={startIso}
              onChange={(e) => setStartIso(e.target.value)}
              aria-label="Start ISO"
              className="min-h-[40px] rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
            />
            <input
              type="text"
              value={endIso}
              onChange={(e) => setEndIso(e.target.value)}
              aria-label="End ISO"
              className="min-h-[40px] rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
            />
            <Button type="submit" size="sm" variant="primary">
              {isEn ? "Save Campaign Draft" : "Lưu bản nháp chiến dịch"}
            </Button>
          </form>
        ) : null}

        <div className="space-y-2.5 text-xs">
          {campaigns.slice(0, 6).map((c) => {
            const analytics = computeCampaignAnalytics(c, promotions);
            const runtime = resolveCampaignRuntimeState(c, activeClockIso);
            const handleAdvance = (nextStatus: CampaignStatus, person: string) => {
              const res = advanceCampaignStatus(c.id, nextStatus, person);
              if (res.ok) notifySuccess(res.message);
              else notifyError(res.message);
            };
            return (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#D6DED2] bg-white p-3.5"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={runtime === "active" ? "success" : c.status === "draft" ? "warning" : "info"}>
                      {c.status}
                    </Badge>
                    <span className="font-bold text-[#25352B]">
                      {isEn ? c.titleEn : c.titleVi}
                    </span>
                  </div>
                  <p className="text-[#52645A]">
                    Maker: {c.makerName} · {formatVnDate(c.startIso, locale)}–{formatVnDate(c.endIso, locale)} ·{" "}
                    {isEn ? "Sessions:" : "Phiên:"} {analytics.sessions} ·{" "}
                    {isEn ? "Orders:" : "Đơn:"} {analytics.orders} ·{" "}
                    {formatVnd(analytics.revenueVnd, locale)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {c.status === "draft" ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleAdvance("submitted", c.makerName)}
                    >
                      {isEn ? "Submit for review" : "Gửi duyệt"}
                    </Button>
                  ) : null}
                  {c.status === "submitted" ? (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleAdvance("approved", checkerName)}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{isEn ? "Approve (Checker)" : "Duyệt phát hành"}</span>
                    </Button>
                  ) : null}
                  {c.status === "approved" || c.status === "scheduled" ? (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleAdvance("active", checkerName)}
                    >
                      {isEn ? "Activate" : "Mở chạy"}
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Tour Host Roster + International RFQ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="space-y-3 p-5">
          <h3 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
            <Compass className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
            <span>
              {isEn
                ? `Orchard Tour Host Roster (${scopedBookings.length})`
                : `Danh sách Đặt lịch Tham quan Vườn (${scopedBookings.length})`}
            </span>
          </h3>
          <div className="max-h-[340px] space-y-2.5 overflow-y-auto pr-1 text-xs">
            {scopedBookings.slice(0, 12).map((b) => (
              <div
                key={b.id}
                className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-[#25352B]">
                    {b.id} · {b.guestName} ({b.guestCount} {isEn ? "guests" : "khách"})
                  </span>
                  <Badge tone={b.status === "Đã check-in" ? "success" : "warning"}>{b.status}</Badge>
                </div>
                <p className="mt-1 text-[#52645A]">
                  {isEn && b.packageTitleEn ? b.packageTitleEn : b.packageTitle} · {b.dateLabel}
                </p>
                {b.status === "Chờ nhà vườn xác nhận" ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        updateExperienceBookingStatus(b.id, "Đã xác nhận");
                        notifySuccess(`${b.id}: ${isEn ? "Confirmed" : "Đã xác nhận"}`);
                      }}
                    >
                      {isEn ? "Confirm Slot" : "Xác nhận ca"}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        updateExperienceBookingStatus(b.id, "Đề nghị đổi ca");
                        notifySuccess(`${b.id}: ${isEn ? "Requested change" : "Đã đề nghị đổi ca"}`);
                      }}
                    >
                      {isEn ? "Propose change" : "Đề nghị đổi ca"}
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-3 p-5">
          <h3 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
            <Globe2 className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
            <span>
              {isEn
                ? `International Buyer / RFQ Inquiries (${internationalInquiries.length})`
                : `Yêu cầu Nguồn hàng Quốc tế & B2B (${internationalInquiries.length})`}
            </span>
          </h3>
          <div className="max-h-[340px] space-y-2.5 overflow-y-auto pr-1 text-xs">
            {internationalInquiries.map((inq) => (
              <div
                key={inq.id}
                className="space-y-2 rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-[#25352B]">
                    {inq.id} · {inq.buyerName} ({inq.country})
                  </span>
                  <Badge tone={inq.status === "seller_responded" ? "success" : "warning"}>
                    {inq.status === "seller_responded"
                      ? isEn
                        ? "Responded"
                        : "Đã phản hồi"
                      : isEn
                      ? "Pending reply"
                      : "Chờ phản hồi"}
                  </Badge>
                </div>
                <p className="text-[#52645A]">
                  {inq.productName ?? inq.farmName} · {inq.quantityNote} · {inq.packagingNote}
                </p>
                <p className="flex items-start gap-1 text-[#25352B]">
                  <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#245B3D]" />
                  <span>{inq.message}</span>
                </p>
                {inq.responseNote ? (
                  <p className="rounded bg-white px-2.5 py-1.5 font-medium text-[#24603B]">
                    {inq.responseNote}
                  </p>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyDrafts[inq.id] ?? ""}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({ ...prev, [inq.id]: e.target.value }))
                      }
                      placeholder={isEn ? "Write truthful lot / quarantine reply..." : "Nhập phản hồi điều kiện lô hàng..."}
                      className="min-h-[36px] flex-1 rounded-[8px] border border-[#788A7B] bg-white px-2.5 text-xs"
                    />
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        const text =
                          (replyDrafts[inq.id] ?? "").trim() ||
                          "Đã tiếp nhận yêu cầu — cơ sở sẽ đối chiếu hồ sơ lô và kiểm dịch trước khi báo giá chính thức.";
                        respondInternationalInquiry(inq.id, text);
                        notifySuccess(isEn ? `Replied to ${inq.id}` : `Đã phản hồi ${inq.id}`);
                      }}
                    >
                      <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
