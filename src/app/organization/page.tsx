"use client";

import React, { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Download,
  Film,
  Globe2,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell";
import { NaiCalendarBoard } from "@/components/calendar/NaiCalendarBoard";
import { ScopeSelector } from "@/components/permissions/ScopeSelector";
import { QualityCenterPanel } from "@/components/quality/QualityCenterPanel";
import { OCOP_PUBLIC_REFERENCE_CATALOG } from "@/data/reference/ocop-public-reference";
import { buildScopedCsvContent, triggerCsvDownload } from "@/lib/export/csv-export";
import { formatVnd } from "@/lib/format";
import { notifyError, notifySuccess } from "@/lib/toast";
import { Badge, Button, Card } from "@/components/ui/Primitives";
import type { OrganizationKind } from "@/types/naifarm";

const LazyCmsManagerPanel = dynamic(
  () => import("@/components/cms/CmsManagerPanel").then((m) => m.CmsManagerPanel),
  { ssr: false, loading: () => <div className="p-6 text-xs text-[#52645A]">Loading CMS...</div> },
);

const LazyCreativeStudioPanel = dynamic(
  () => import("@/components/studio/CreativeStudioPanel").then((m) => m.CreativeStudioPanel),
  { ssr: false, loading: () => <div className="p-6 text-xs text-[#52645A]">Loading Video Studio...</div> },
);

type OrgTab = "overview" | "work" | "members" | "approvals" | "calendar" | "cms" | "studio" | "reports";

const ORG_KINDS: { id: OrganizationKind; label: string; badge: string }[] = [
  { id: "coop", label: "Hợp tác xã / Hội Nông dân", badge: "Gom lô & Xã viên" },
  { id: "school", label: "Trường học & CLB Sinh viên", badge: "Giáo dục & Thực tế" },
  { id: "b2b", label: "Doanh nghiệp thu mua B2B", badge: "Thu mua & Truy xuất" },
  { id: "sponsor", label: "Nhà tài trợ & Dự án", badge: "Ngân sách & Kết quả" },
  { id: "logistics", label: "Đối tác Vận chuyển", badge: "Chuyến gom & POD" },
  { id: "mentor", label: "Chuyên gia / Giảng viên", badge: "Tư vấn & Phản hồi" },
  { id: "authority", label: "Cơ quan chuyên môn", badge: "Đối chiếu chứng nhận" },
];

function OrganizationWorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale } = useLocale();
  const isEn = locale === "en";
  const {
    hydrated,
    authUser,
    setActiveWorkspace,
    activeOrgKind,
    setActiveOrgKind,
    activeScopeUnitCode,
    organizations,
    coopPools,
    memberDeliveries,
    schoolClasses,
    studentSubmissions,
    logisticsTrips,
    mentorCases,
    sponsorCampaigns,
    products,
    credentialRecords,
    internationalInquiries,
    respondInternationalInquiry,
    settleMemberDelivery,
    gradeStudentSubmission,
    updateLogisticsTripStatus,
    updateCredentialLifecycle,
    renewCredentialRecord,
  } = useDemoStore();

  const urlOrg = searchParams.get("org") as OrganizationKind | null;
  const currentOrg: OrganizationKind =
    urlOrg && ORG_KINDS.some((o) => o.id === urlOrg) ? urlOrg : activeOrgKind;

  const [tab, setTab] = useState<OrgTab>("overview");
  const [checkerName, setCheckerName] = useState("Kế toán trưởng HTX Minh Châu");

  useEffect(() => {
    setActiveWorkspace("W05");
  }, [setActiveWorkspace]);

  const handleSelectOrgKind = (kind: OrganizationKind) => {
    setActiveOrgKind(kind);
    const params = new URLSearchParams(searchParams.toString());
    params.set("org", kind);
    router.replace(`/organization?${params.toString()}`, { scroll: false });
  };

  const activeOrgMeta = ORG_KINDS.find((k) => k.id === currentOrg) ?? ORG_KINDS[0];

  const exportOrgCsv = () => {
    const csv = buildScopedCsvContent(
      ["Khối tổ chức", "Đơn vị", "Tóm tắt", "Trạng thái"],
      organizations.map((o) => [o.type, o.name, o.focusArea, o.statusLabel]),
      {
        reportTitle: `Báo cáo đối tác tổ chức — ${activeOrgMeta.label}`,
        periodLabel: "Tháng 11/2026",
        scopeLabel: activeScopeUnitCode === "ALL" ? "Toàn Thành phố Đồng Nai (95 xã/phường)" : activeScopeUnitCode,
      },
    );
    triggerCsvDownload(`naifarm-to-chuc-${currentOrg}.csv`, csv);
    notifySuccess("Đã xuất báo cáo tổ chức theo phạm vi CSV.");
  };

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-12 text-sm text-[#52645A]">
        Đang mở Không gian Tổ chức &amp; Đối tác...
      </div>
    );
  }

  return (
    <WorkspaceShell
      workspaceId="W05"
      title="Không gian Tổ chức & Đối tác"
      navItems={[
        {
          label: "Tổng quan",
          href: "#overview",
          active: tab === "overview",
          onClick: () => setTab("overview"),
          icon: <Building2 className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: "Công việc chuyên môn",
          href: "#work",
          active: tab === "work",
          onClick: () => setTab("work"),
          icon: <Briefcase className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: "Thành viên & Địa bàn",
          href: "#members",
          active: tab === "members",
          onClick: () => setTab("members"),
          icon: <Users className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: "Phê duyệt & Bảo vệ dữ liệu",
          href: "#approvals",
          active: tab === "approvals",
          onClick: () => setTab("approvals"),
          icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: isEn ? "Organization Calendar" : "Lịch Tổ chức (NaiCalendar)",
          href: "#calendar",
          active: tab === "calendar",
          onClick: () => setTab("calendar"),
          icon: <CalendarDays className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: isEn ? "Co-op Content & Media" : "Nội dung & Media HTX",
          href: "#cms",
          active: tab === "cms",
          onClick: () => setTab("cms"),
          icon: <Globe2 className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: isEn ? "OCOP Video Studio" : "Video Studio HTX",
          href: "#studio",
          active: tab === "studio",
          onClick: () => setTab("studio"),
          icon: <Film className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: "Báo cáo & Xuất CSV",
          href: "#reports",
          active: tab === "reports",
          onClick: () => setTab("reports"),
          icon: <BarChart3 className="h-4 w-4" aria-hidden="true" />,
        },
      ]}
    >
      <div className="space-y-6">
        {/* Organization Type Switcher */}
        <Card className="space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#52645A]">Loại hình tổ chức đang hoạt động</p>
              <h2 className="text-lg font-bold text-[#25352B]">{activeOrgMeta.label}</h2>
            </div>
            <ScopeSelector compact label="Phạm vi địa bàn" />
          </div>

          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Chọn loại hình tổ chức">
            {ORG_KINDS.map((kind) => {
              const active = currentOrg === kind.id;
              return (
                <button
                  key={kind.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleSelectOrgKind(kind.id)}
                  className={`inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition ${
                    active
                      ? "border-[#245B3D] bg-[#245B3D] text-white"
                      : "border-[#D6DED2] bg-[#FAF8F1] text-[#25352B] hover:bg-[#EAF0E5]"
                  }`}
                >
                  <span>{kind.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Tab 1: Overview */}
        {tab === "overview" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {organizations.map((org) => (
              <Card key={org.id} className="space-y-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone="info">{org.type}</Badge>
                  <span className="text-xs font-semibold text-[#52645A]">{org.administrativeUnitName}</span>
                </div>
                <h3 className="text-base font-bold text-[#25352B]">{org.name}</h3>
                <p className="text-xs text-[#52645A]">{org.focusArea}</p>
                <p className="text-xs font-semibold text-[#245B3D]">
                  Liên kết {org.linkedFarmsCount} nhà vườn · {org.statusLabel}
                </p>
              </Card>
            ))}
          </div>
        ) : null}

        {/* Tab 2 & Tab 4 adapt specifically to all 6+ organization types */}
        {(tab === "work" || tab === "approvals") ? (
          <>
            {currentOrg === "coop" ? (
              <Card className="space-y-4 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-[#25352B]">
                    Gom lô HTX &amp; Đối soát phiếu giao xã viên ({coopPools.length} lô gom)
                  </h3>
                  <select
                    value={checkerName}
                    onChange={(e) => setCheckerName(e.target.value)}
                    aria-label="Chọn người duyệt chi trả HTX"
                    className="min-h-[36px] rounded-[8px] border border-[#788A7B] bg-white px-2.5 text-xs"
                  >
                    <option value="Kế toán trưởng HTX Minh Châu">Kế toán trưởng HTX Minh Châu (Hợp lệ)</option>
                    <option value="Thủ kho Hai Hùng">Thủ kho Hai Hùng (Thử tự duyệt — chặn)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {coopPools.map((pool) => (
                    <div key={pool.id} className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3.5 text-xs">
                      <p className="font-bold text-[#25352B]">{pool.title}</p>
                      <p className="mt-1 text-[#52645A]">
                        Lô tổng:{" "}
                        <Link href={`/trace/${pool.mixedBatchCode}`} className="font-mono font-bold text-[#245B3D] underline">
                          {pool.mixedBatchCode}
                        </Link>{" "}
                        · {pool.totalCommittedQty} {pool.unitLabel}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {memberDeliveries.map((md) => (
                    <div key={md.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[#EAEFE6] p-3 text-xs">
                      <div>
                        <p className="font-bold text-[#25352B]">
                          {md.id} · {md.memberFarmName} ({md.deliveredQty} {md.unitLabel} {md.productName})
                        </p>
                        <p className="text-[#52645A]">
                          Thực nhận: <strong className="tabular-nums text-[#245B3D]">{formatVnd(md.netPayableVnd)}</strong> ·
                          Lập phiếu: {md.makerName}
                        </p>
                      </div>
                      {md.settlementStatus === "da_duyet_thanh_toan" ? (
                        <Badge tone="success">Đã duyệt chi trả</Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            const res = settleMemberDelivery(md.id, checkerName);
                            if (res.ok) notifySuccess(res.message);
                            else notifyError(res.message);
                          }}
                        >
                          Duyệt đối soát
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}

            {currentOrg === "school" ? (
              <Card className="space-y-4 p-5">
                <h3 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
                  <GraduationCap className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
                  <span>Lớp học nông nghiệp thực hành &amp; Kiểm soát đồng thuận phụ huynh</span>
                </h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {schoolClasses.map((cls) => (
                    <div key={cls.id} className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-4 text-xs">
                      <p className="font-bold text-[#25352B]">{cls.name}</p>
                      <p className="text-[#245B3D]">{cls.schoolName} · GV: {cls.teacherName}</p>
                      <p className="mt-1 text-[#52645A]">
                        Sĩ số: {cls.enrolledCount} · Đồng thuận phụ huynh: {cls.minorConsentCount}/{cls.enrolledCount} ·{" "}
                        {cls.fieldTripDate}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5">
                  <p className="text-sm font-bold text-[#25352B]">Bài nộp học sinh / sinh viên &amp; chấm điểm</p>
                  {studentSubmissions.map((sub) => (
                    <div key={sub.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#EAEFE6] p-3 text-xs">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-[#25352B]">{sub.studentName}</span>
                          {sub.isMinor ? (
                            <Badge tone={sub.hasGuardianConsent ? "success" : "danger"}>
                              {sub.hasGuardianConsent ? "Đủ đồng thuận phụ huynh" : "Thiếu đồng thuận (< 18t)"}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 text-[#52645A]">{sub.title}</p>
                      </div>
                      {sub.status === "graded" ? (
                        <Badge tone="success">Điểm: {sub.rubricScore}/10</Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            const res = gradeStudentSubmission(sub.id, 8.5);
                            if (res.ok) notifySuccess(res.message);
                            else notifyError(res.message);
                          }}
                        >
                          Chấm điểm (8.5/10)
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}

            {currentOrg === "b2b" ? (
              <Card className="space-y-4 p-5">
                <h3 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
                  <ShoppingBag className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
                  <span>Nguồn cung B2B &amp; Gói truy xuất theo lô</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[540px] border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#D6DED2] text-[#52645A]">
                        <th className="py-2 pr-3 font-semibold">Mặt hàng</th>
                        <th className="py-2 px-3 font-semibold">Nhà vườn / Xã</th>
                        <th className="py-2 px-3 text-right font-semibold">Khả dụng</th>
                        <th className="py-2 pl-3 font-semibold">Truy xuất</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAEFE6]">
                      {products.slice(0, 10).map((p) => (
                        <tr key={p.id}>
                          <td className="py-2 pr-3 font-bold text-[#25352B]">{p.name}</td>
                          <td className="py-2 px-3 text-[#52645A]">
                            {p.farmName} ({p.administrativeUnitName})
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums">
                            {p.stockKg} {p.unitLabel}
                          </td>
                          <td className="py-2 pl-3">
                            <Link href={`/trace/${p.batchCode}`} className="font-mono font-bold text-[#245B3D] underline">
                              {p.batchCode}
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : null}

            {currentOrg === "sponsor" ? (
              <Card className="space-y-4 p-5">
                <h3 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
                  <HeartHandshake className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
                  <span>Tài trợ cộng đồng — Tách bạch ngân sách dự kiến &amp; đã duyệt</span>
                </h3>
                <div className="space-y-3 text-xs">
                  {sponsorCampaigns.map((sp) => (
                    <div key={sp.id} className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-4">
                      <p className="font-bold text-[#245B3D]">{sp.sponsorName}</p>
                      <h4 className="mt-1 text-base font-bold text-[#25352B]">{sp.title}</h4>
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-lg bg-white p-2.5">
                          <span className="text-[#52645A]">Ngân sách dự kiến</span>
                          <p className="tabular-nums font-bold text-[#25352B]">{formatVnd(sp.plannedBudgetVnd)}</p>
                        </div>
                        <div className="rounded-lg bg-white p-2.5">
                          <span className="text-[#52645A]">Đã phê duyệt giải ngân</span>
                          <p className="tabular-nums font-bold text-[#24603B]">{formatVnd(sp.approvedBudgetVnd)}</p>
                        </div>
                        <div className="rounded-lg bg-white p-2.5">
                          <span className="text-[#52645A]">Đầu ra được nghiệm thu</span>
                          <p className="tabular-nums font-bold text-[#25352B]">{sp.outputsAcceptedCount} nhà vườn</p>
                        </div>
                      </div>
                      <p className="mt-2 text-[#52645A]">{sp.milestoneSummary}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}

            {currentOrg === "logistics" ? (
              <Card className="space-y-4 p-5">
                <h3 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
                  <Truck className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
                  <span>Quản lý chuyến gom &amp; Biên bản bàn giao POD ({logisticsTrips.length})</span>
                </h3>
                <div className="space-y-3 text-xs">
                  {logisticsTrips.map((trip) => (
                    <div key={trip.id} className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono font-bold text-[#245B3D]">{trip.id}</span>
                        <Badge tone={trip.status === "delivered_pod" ? "success" : trip.status === "failed_reschedule" ? "danger" : "info"}>
                          {trip.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm font-bold text-[#25352B]">{trip.routeLabel}</p>
                      <p className="text-[#52645A]">
                        Tài xế: {trip.driverName} · {trip.parcelCount} kiện · {trip.plannedDeparture}
                      </p>
                      {trip.podNote ? <p className="mt-1 text-[#24603B]">{trip.podNote}</p> : null}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            updateLogisticsTripStatus(trip.id, "delivered_pod", "Đã bàn giao đủ kèm chữ ký điểm nhận.");
                            notifySuccess(`Đã hoàn tất POD chuyến ${trip.id}.`);
                          }}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Hoàn tất POD</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            updateLogisticsTripStatus(trip.id, "failed_reschedule", "Khách hẹn giao lại khung chiều.");
                            notifySuccess(`Đã ghi nhận hẹn lại chuyến ${trip.id}.`);
                          }}
                        >
                          Hẹn giao lại
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}

            {currentOrg === "mentor" ? (
              <Card className="space-y-4 p-5">
                <h3 className="text-base font-bold text-[#25352B]">
                  Hồ sơ tư vấn kỹ thuật &amp; bao bì sau thu hoạch ({mentorCases.length})
                </h3>
                <div className="space-y-3 text-xs">
                  {mentorCases.map((mc) => (
                    <div key={mc.id} className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#245B3D]">{mc.id} · {mc.topic}</span>
                        <Badge tone={mc.status === "reviewed" ? "success" : "warning"}>{mc.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm font-bold text-[#25352B]">{mc.title}</p>
                      <p className="text-[#52645A]">Vườn: {mc.farmName} · Cố vấn: {mc.mentorName} · {mc.scheduledAt}</p>
                      {mc.feedback ? <p className="mt-1 text-[#24603B]">Kết luận: {mc.feedback}</p> : null}
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}

            {currentOrg === "authority" ? (
              <div className="space-y-5">
                <QualityCenterPanel
                  records={credentialRecords}
                  roleMode="verifier"
                  onChangeStatus={(id, next, note) => {
                    updateCredentialLifecycle(id, next, note, "Ban đối chiếu HTX & Tổ chức");
                    notifySuccess(`Đã cập nhật trạng thái đối chiếu cho ${id}.`);
                  }}
                  onRenew={(id) => renewCredentialRecord(id, "Ban đối chiếu HTX & Tổ chức")}
                />
              </div>
            ) : null}
          </>
        ) : null}

        {/* Tab 3: Members & Public Reference Verification */}
        {tab === "members" ? (
          <Card className="space-y-4 p-5">
            <h3 className="text-base font-bold text-[#25352B]">
              Đối tác liên kết &amp; Tham chiếu công bố trên địa bàn ({OCOP_PUBLIC_REFERENCE_CATALOG.length} hồ sơ tham khảo)
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 text-xs">
              {OCOP_PUBLIC_REFERENCE_CATALOG.slice(0, 8).map((ref) => (
                <div key={ref.id} className="rounded-[10px] border border-[#EAEFE6] bg-[#FAF8F1] p-3">
                  <p className="font-bold text-[#25352B]">{ref.name}</p>
                  <p className="text-[#245B3D]">{ref.subjectName}</p>
                  <p className="text-[#52645A]">{ref.sourceAddressOriginal}</p>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        {tab === "calendar" ? <NaiCalendarBoard scope="W05" allowCreate /> : null}

        {tab === "cms" ? (
          <LazyCmsManagerPanel
            scopeMode="organization"
            actorName={authUser?.name ?? "Ban Chủ nhiệm HTX"}
          />
        ) : null}

        {tab === "studio" ? (
          <LazyCreativeStudioPanel
            mode="creator"
            actorName={authUser?.name ?? "Ban Chủ nhiệm HTX"}
          />
        ) : null}

        {/* Tab 5: Scoped Reports */}
        {tab === "reports" ? (
          <div className="space-y-5">
            <Card className="space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-[#25352B]">
                    Báo cáo theo phạm vi tổ chức: {activeOrgMeta.label}
                  </h3>
                  <p className="text-xs text-[#52645A]">
                    Xuất tệp CSV chuẩn UTF-8 BOM an toàn công thức bảng tính.
                  </p>
                </div>
                <Button size="sm" variant="primary" onClick={exportOrgCsv}>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span>Xuất CSV tổ chức</span>
                </Button>
              </div>
            </Card>

            <Card className="space-y-3 p-5">
              <h3 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
                <Globe2 className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                <span>
                  {isEn
                    ? `B2B & International Buyer RFQs (${internationalInquiries.length})`
                    : `Yêu cầu B2B & Nguồn hàng Quốc tế (${internationalInquiries.length})`}
                </span>
              </h3>
              <div className="space-y-2 text-xs">
                {internationalInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[#EAEFE6] bg-[#FAF8F1] p-3"
                  >
                    <div>
                      <p className="font-bold text-[#25352B]">
                        {inq.id} · {inq.buyerName} ({inq.country})
                      </p>
                      <p className="text-[#52645A]">
                        {inq.productName ?? inq.farmName} · {inq.quantityNote}
                      </p>
                    </div>
                    {inq.responseNote ? (
                      <Badge tone="success">{isEn ? "Responded" : "Đã phản hồi"}</Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          respondInternationalInquiry(
                            inq.id,
                            "Ban chủ nhiệm đã tiếp nhận RFQ và chuyển tổ kiểm định MSVT rà soát.",
                          );
                          notifySuccess(`${inq.id}: ${isEn ? "Reply recorded" : "Đã phản hồi RFQ"}`);
                        }}
                      >
                        {isEn ? "Acknowledge RFQ" : "Ghi nhận phản hồi B2B"}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : null}
      </div>
    </WorkspaceShell>
  );
}

export default function OrganizationWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1280px] px-4 py-12 text-sm text-[#52645A]">
          Đang tải Không gian Tổ chức...
        </div>
      }
    >
      <OrganizationWorkspaceContent />
    </Suspense>
  );
}
