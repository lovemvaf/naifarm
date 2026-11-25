"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  Filter,
  Globe2,
  MapPin,
  Printer,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell";
import { NaiCalendarBoard } from "@/components/calendar/NaiCalendarBoard";
import { ScopeSelector } from "@/components/permissions/ScopeSelector";
import { buildScopedCsvContent, triggerCsvDownload } from "@/lib/export/csv-export";
import { evaluateMinorSafeguarding, hasMinorConsent } from "@/lib/permissions/access-control";
import { notifyError, notifySuccess } from "@/lib/toast";
import { Badge, Button, Card, DemoBanner, EmptyState } from "@/components/ui/Primitives";
import type { VolunteerMission } from "@/types/naifarm";

type VolunteerTab = "missions" | "ambassador" | "pass" | "calendar" | "fieldlab";

const MISSION_STATUS_LABEL: Record<
  VolunteerMission["status"],
  { text: string; tone: "neutral" | "info" | "warning" | "success" | "danger" }
> = {
  open: { text: "Đang mở", tone: "neutral" },
  assigned: { text: "Đang thực hiện", tone: "info" },
  submitted: { text: "Chờ W02 xác nhận", tone: "warning" },
  farm_accepted: { text: "W02 đã xác nhận · Chờ W04 duyệt giờ", tone: "info" },
  coordinator_approved: { text: "Đã duyệt vào NaiPass", tone: "success" },
  revision_requested: { text: "Cần bổ sung minh chứng", tone: "danger" },
};

const EVIDENCE_SAMPLES = [
  { id: "sample1", label: "Ảnh chụp vườn & tem QR", src: "/images/stitch/stitch-32.jpg" },
  { id: "sample2", label: "Ảnh đóng gói nông sản tại vườn", src: "/images/stitch/stitch-40.jpg" },
  { id: "sample3", label: "Ảnh bảng tin mùa vụ", src: "/images/stitch/stitch-53.jpg" },
];

export default function VolunteerWorkspacePage() {
  const { locale, t } = useLocale();
  const isEn = locale === "en";
  const {
    hydrated,
    setActiveWorkspace,
    authUser,
    activeScopeUnitCode,
    missions,
    lessons,
    learningProgress,
    mentorCases,
    farms,
    acceptMission,
    submitMissionEvidence,
  } = useDemoStore();
  const minorCheck = evaluateMinorSafeguarding(authUser?.isMinor, authUser?.hasGuardianConsent);

  const [tab, setTab] = useState<VolunteerTab>("missions");
  const [skillFilter, setSkillFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [durationFilter, setDurationFilter] = useState<"all" | "short" | "long">("all");
  const [statusViewFilter, setStatusViewFilter] = useState<"split" | "open_only" | "joined_only">("split");

  const [evidenceOpenId, setEvidenceOpenId] = useState<string | null>(null);
  const [evidenceNote, setEvidenceNote] = useState("");
  const [evidenceHours, setEvidenceHours] = useState("2.5");
  const [evidencePhoto, setEvidencePhoto] = useState(EVIDENCE_SAMPLES[0].src);
  const [isMinorParticipant, setIsMinorParticipant] = useState(false);
  const [guardianConsentChecked, setGuardianConsentChecked] = useState(true);

  useEffect(() => {
    setActiveWorkspace("W03");
  }, [setActiveWorkspace]);

  const volunteerName = authUser?.workspaceId === "W03" ? authUser.name : "Minh Anh (TNV)";

  const filteredMissions = useMemo(() => {
    return missions.filter((m) => {
      if (
        activeScopeUnitCode !== "ALL" &&
        m.administrativeUnitCode &&
        m.administrativeUnitCode !== activeScopeUnitCode
      ) {
        return false;
      }
      if (skillFilter !== "all" && m.skillTag !== skillFilter) return false;
      if (modeFilter !== "all" && m.mode !== modeFilter) return false;
      if (durationFilter === "short" && m.expectedHours > 4) return false;
      if (durationFilter === "long" && m.expectedHours <= 4) return false;
      return true;
    });
  }, [missions, activeScopeUnitCode, skillFilter, modeFilter, durationFilter]);

  const openMissions = filteredMissions.filter((m) => m.status === "open");
  const joinedMissions = filteredMissions.filter((m) => m.status !== "open");

  const approvedMissions = missions.filter((m) => m.status === "coordinator_approved");
  const confirmedHours = approvedMissions.reduce((sum, m) => sum + m.approvedHours, 0);
  const pendingHours = missions
    .filter((m) => m.status === "submitted" || m.status === "farm_accepted")
    .reduce((sum, m) => sum + m.submittedHours, 0);

  const handleSubmitEvidence = (e: React.FormEvent, m: VolunteerMission) => {
    e.preventDefault();
    const consentCheck = hasMinorConsent(isMinorParticipant, guardianConsentChecked);
    if (!consentCheck.allowed) {
      notifyError(consentCheck.reason ?? "Thiếu đồng thuận phụ huynh cho thành viên dưới 18 tuổi.");
      return;
    }
    const hrs = Number(evidenceHours);
    if (!evidenceNote.trim() || !hrs || hrs <= 0 || hrs > 24) {
      notifyError("Vui lòng nhập mô tả sản phẩm bàn giao và số giờ hợp lệ (0.5–24 giờ).");
      return;
    }
    submitMissionEvidence(m.id, evidenceNote.trim(), hrs, evidencePhoto);
    setEvidenceOpenId(null);
    setEvidenceNote("");
    notifySuccess(`Đã nộp minh chứng ${m.id}. Tiếp theo Chủ vườn W02 sẽ xác nhận bàn giao.`);
  };

  const renderMissionCard = (m: VolunteerMission) => {
    const statusInfo = MISSION_STATUS_LABEL[m.status];
    const stepNum =
      m.status === "open"
        ? 1
        : m.status === "assigned" || m.status === "revision_requested"
        ? 2
        : m.status === "submitted"
        ? 3
        : m.status === "farm_accepted"
        ? 4
        : 5;

    return (
      <Card key={m.id} className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="tabular-nums text-xs font-bold text-[#245B3D]">{m.id}</span>
              <Badge tone={statusInfo.tone}>{statusInfo.text}</Badge>
              <Badge tone="neutral">{m.skillTag}</Badge>
              <Badge tone="info">{m.mode}</Badge>
            </div>
            <h3 className="text-lg font-bold text-[#25352B]">{m.title}</h3>
            <p className="inline-flex flex-wrap items-center gap-1.5 text-xs text-[#52645A]">
              <MapPin className="h-3.5 w-3.5 text-[#245B3D]" aria-hidden="true" />
              <span>
                {m.farmName} · {m.location} · Dự kiến <strong className="text-[#25352B]">{m.expectedHours} giờ</strong> ·
                Hạn {m.dueDate}
              </span>
            </p>
          </div>
          {m.assigneeName ? (
            <span className="rounded-[10px] bg-[#EAF0E5] px-3 py-1.5 text-xs font-semibold text-[#245B3D]">
              Phụ trách: {m.assigneeName}
            </span>
          ) : null}
        </div>

        <p className="text-sm text-[#25352B]">{m.deliverableSummary}</p>

        {/* 4-step workflow */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { n: 1, label: "1. Nhận việc" },
            { n: 2, label: "2. Nộp minh chứng" },
            { n: 3, label: "3. W02 Xác nhận" },
            { n: 4, label: "4. W04 Duyệt giờ" },
          ].map((s) => {
            const done = stepNum > s.n;
            const active = stepNum === s.n;
            return (
              <div
                key={s.n}
                className={`rounded-[10px] border px-3 py-2 text-xs font-semibold ${
                  done
                    ? "border-[#6C9C5B] bg-[#E6F3E9] text-[#24603B]"
                    : active
                    ? "border-[#245B3D] bg-[#245B3D] text-white"
                    : "border-[#D6DED2] bg-[#FAF8F1] text-[#52645A]"
                }`}
              >
                {s.label}
              </div>
            );
          })}
        </div>

        {m.status === "revision_requested" && m.revisionReason ? (
          <div className="rounded-[12px] border border-[#A32D2D]/35 bg-[#FDECEC] p-3 text-xs text-[#A32D2D]">
            <strong>Yêu cầu bổ sung từ Điều phối W04:</strong> {m.revisionReason}
          </div>
        ) : null}

        {m.evidenceImage && m.evidenceNote ? (
          <div className="flex flex-col gap-3 rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3 sm:flex-row sm:items-center">
            <img
              src={m.evidenceImage}
              alt={`Minh chứng ${m.id}`}
              className="h-16 w-24 shrink-0 rounded-[8px] object-cover"
            />
            <div className="text-xs text-[#52645A]">
              <p className="font-bold text-[#25352B]">Minh chứng đã nộp ({m.submittedHours} giờ):</p>
              <p>{m.evidenceNote}</p>
            </div>
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {m.status === "open" ? (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                acceptMission(m.id, volunteerName);
                notifySuccess(`Bạn đã nhận nhiệm vụ ${m.id}.`);
              }}
            >
              Nhận nhiệm vụ này
            </Button>
          ) : null}

          {(m.status === "assigned" || m.status === "revision_requested") ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setEvidenceOpenId(evidenceOpenId === m.id ? null : m.id)}
            >
              {evidenceOpenId === m.id ? "Đóng biểu mẫu" : "Nộp minh chứng & giờ công"}
            </Button>
          ) : null}

          {m.status === "submitted" ? (
            <Badge tone="warning">Đang chờ chủ vườn {m.farmName} xác nhận (không thể tự duyệt)</Badge>
          ) : null}
          {m.status === "farm_accepted" ? (
            <Badge tone="info">Đã gửi Điều phối viên W04 duyệt giờ công</Badge>
          ) : null}
        </div>

        {evidenceOpenId === m.id ? (
          <form
            onSubmit={(e) => handleSubmitEvidence(e, m)}
            className="space-y-3 rounded-[14px] border border-[#D6DED2] bg-[#FAF8F1] p-4"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor={`hrs-${m.id}`} className="block text-xs font-semibold text-[#25352B]">
                  Số giờ thực tế đóng góp
                </label>
                <input
                  id={`hrs-${m.id}`}
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  value={evidenceHours}
                  onChange={(e) => setEvidenceHours(e.target.value)}
                  className="mt-1 min-h-[40px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs tabular-nums"
                />
              </div>
              <div>
                <label htmlFor={`photo-${m.id}`} className="block text-xs font-semibold text-[#25352B]">
                  Ảnh minh chứng bàn giao
                </label>
                <select
                  id={`photo-${m.id}`}
                  value={evidencePhoto}
                  onChange={(e) => setEvidencePhoto(e.target.value)}
                  className="mt-1 min-h-[40px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
                >
                  {EVIDENCE_SAMPLES.map((s) => (
                    <option key={s.id} value={s.src}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor={`note-${m.id}`} className="block text-xs font-semibold text-[#25352B]">
                Mô tả kết quả đã hỗ trợ cho vườn
              </label>
              <textarea
                id={`note-${m.id}`}
                rows={2}
                value={evidenceNote}
                onChange={(e) => setEvidenceNote(e.target.value)}
                placeholder="VD: Đã chụp 6 ảnh bưởi Tân Triều, tạo mã QR lô NF-TT-2026-01 và hướng dẫn chủ vườn..."
                className="mt-1 w-full rounded-[10px] border border-[#788A7B] bg-white p-2.5 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#52645A]">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isMinorParticipant}
                  onChange={(e) => setIsMinorParticipant(e.target.checked)}
                />
                <span>Thành viên dưới 18 tuổi tham gia thực tế</span>
              </label>
              {isMinorParticipant ? (
                <label className="inline-flex items-center gap-2 text-[#245B3D] font-semibold">
                  <input
                    type="checkbox"
                    checked={guardianConsentChecked}
                    onChange={(e) => setGuardianConsentChecked(e.target.checked)}
                  />
                  <span>Có giấy đồng thuận phụ huynh / nhà trường</span>
                </label>
              ) : null}
            </div>

            <Button type="submit" size="sm" variant="primary">
              Gửi minh chứng tới Nhà vườn W02
            </Button>
          </form>
        ) : null}
      </Card>
    );
  };

  return (
    <WorkspaceShell
      workspaceId="W03"
      title="Thanh niên Tình nguyện"
      navItems={[
        {
          label: `Nhiệm vụ hỗ trợ (${filteredMissions.length})`,
          href: "#missions",
          active: tab === "missions",
          onClick: () => setTab("missions"),
          icon: <ClipboardList className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: isEn ? "Global Youth Ambassador" : "Đại sứ Song ngữ",
          href: "#ambassador",
          active: tab === "ambassador",
          onClick: () => setTab("ambassador"),
          icon: <Globe2 className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: `Hộ chiếu NaiPass (${confirmedHours} giờ)`,
          href: "#pass",
          active: tab === "pass",
          onClick: () => setTab("pass"),
          icon: <Award className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: isEn ? "Youth Calendar" : "Lịch Thanh niên",
          href: "#calendar",
          active: tab === "calendar",
          onClick: () => setTab("calendar"),
          icon: <CalendarDays className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: "Field Lab & Đồng hành vườn",
          href: "#fieldlab",
          active: tab === "fieldlab",
          onClick: () => setTab("fieldlab"),
          icon: <BookOpen className="h-4 w-4" aria-hidden="true" />,
        },
      ]}
    >
      <div className="space-y-6">
        {tab === "missions" ? (
          <>
            {/* Filter Toolbar */}
            <Card className="space-y-4 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#25352B]">
                  <Filter className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                  <span>Lọc nhiệm vụ Thanh niên Tình nguyện</span>
                </div>
                <ScopeSelector compact label="Xã / Phường Đồng Nai" />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <select
                  aria-label="Hiển thị bảng nhiệm vụ"
                  value={statusViewFilter}
                  onChange={(e) => setStatusViewFilter(e.target.value as "split" | "open_only" | "joined_only")}
                  className="min-h-[40px] rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs font-semibold"
                >
                  <option value="split">Tách rõ: Chưa tham gia &amp; Đã tham gia</option>
                  <option value="open_only">Chỉ nhiệm vụ chưa tham gia ({openMissions.length})</option>
                  <option value="joined_only">Chỉ nhiệm vụ đã tham gia ({joinedMissions.length})</option>
                </select>

                <select
                  aria-label="Lọc theo kỹ năng"
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="min-h-[40px] rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
                >
                  <option value="all">Tất cả kỹ năng</option>
                  <option value="Chụp ảnh & AI đăng bán">Chụp ảnh &amp; AI đăng bán</option>
                  <option value="Thiết lập QR & Nhật ký">Thiết lập QR &amp; Nhật ký</option>
                  <option value="Livestream bán hàng">Livestream bán hàng</option>
                </select>

                <select
                  aria-label="Lọc theo hình thức"
                  value={modeFilter}
                  onChange={(e) => setModeFilter(e.target.value)}
                  className="min-h-[40px] rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
                >
                  <option value="all">Tại vườn &amp; Online</option>
                  <option value="Trực tiếp tại vườn">Trực tiếp tại vườn</option>
                  <option value="Hỗ trợ từ xa (Online)">Hỗ trợ từ xa (Online)</option>
                </select>

                <select
                  aria-label="Lọc theo thời lượng"
                  value={durationFilter}
                  onChange={(e) => setDurationFilter(e.target.value as "all" | "short" | "long")}
                  className="min-h-[40px] rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
                >
                  <option value="all">Mọi thời lượng</option>
                  <option value="short">Nhanh (≤ 4 giờ)</option>
                  <option value="long">Chuyên sâu (&gt; 4 giờ)</option>
                </select>
              </div>
            </Card>

            {/* Open Missions (Chưa tham gia) */}
            {(statusViewFilter === "split" || statusViewFilter === "open_only") ? (
              <section aria-label="Nhiệm vụ đang mở chưa tham gia" className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[#25352B]">
                    Nhiệm vụ đang mở · Chưa tham gia ({openMissions.length})
                  </h2>
                  <Badge tone="neutral">Có thể nhận việc ngay</Badge>
                </div>
                {openMissions.length === 0 ? (
                  <EmptyState
                    icon={<ClipboardList className="h-6 w-6" aria-hidden="true" />}
                    title="Không còn nhiệm vụ trống khớp bộ lọc"
                    description="Thử chọn Tất cả xã/phường hoặc chuyển sang nhiệm vụ đã tham gia."
                  />
                ) : (
                  <div className="space-y-4">{openMissions.map(renderMissionCard)}</div>
                )}
              </section>
            ) : null}

            {/* Joined Missions (Đã tham gia) */}
            {(statusViewFilter === "split" || statusViewFilter === "joined_only") ? (
              <section aria-label="Nhiệm vụ đã tham gia và đang xử lý" className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[#25352B]">
                    Nhiệm vụ đã tham gia &amp; theo dõi duyệt giờ ({joinedMissions.length})
                  </h2>
                  <Badge tone="info">Đang theo dõi 4 bước</Badge>
                </div>
                {joinedMissions.length === 0 ? (
                  <EmptyState
                    icon={<CheckCircle2 className="h-6 w-6" aria-hidden="true" />}
                    title="Chưa có nhiệm vụ đã nhận trong bộ lọc này"
                    description="Hãy nhận một nhiệm vụ từ danh sách đang mở phía trên."
                  />
                ) : (
                  <div className="space-y-4">{joinedMissions.map(renderMissionCard)}</div>
                )}
              </section>
            ) : null}
          </>
        ) : null}

        {tab === "pass" ? (
          <div className="space-y-5">
            <Card className="border-2 border-[#245B3D] bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#D6DED2] pb-4">
                <div>
                  <Badge tone="success">Youth Impact Pass · NaiPass</Badge>
                  <h2 className="mt-2 font-editorial text-2xl font-bold text-[#25352B]">{volunteerName}</h2>
                  <p className="text-xs text-[#52645A]">
                    Giờ công chỉ được ghi chính thức sau khi Chủ vườn (W02) và Điều phối (W04) duyệt độc lập.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 print:hidden">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const csv = buildScopedCsvContent(
                        ["Mã NV", "Tên nhiệm vụ", "Nhà vườn", "Giờ đã duyệt", "Kỹ năng"],
                        approvedMissions.map((m) => [m.id, m.title, m.farmName, m.approvedHours, m.skillTag]),
                        {
                          reportTitle: `Hồ sơ giờ công NaiPass — ${volunteerName}`,
                          periodLabel: "Tháng 11/2026",
                          scopeLabel: volunteerName,
                        },
                      );
                      triggerCsvDownload("naipass-hours.csv", csv);
                      notifySuccess("Đã xuất danh sách giờ công đã duyệt.");
                    }}
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    <span>Xuất CSV</span>
                  </Button>
                  <Button size="sm" variant="primary" onClick={() => window.print()}>
                    <Printer className="h-4 w-4" aria-hidden="true" />
                    <span>In NaiPass</span>
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-[12px] bg-[#E6F3E9] p-4">
                  <p className="text-xs font-semibold text-[#24603B]">Tổng giờ đã duyệt chính thức</p>
                  <p className="mt-1 tabular-nums text-2xl font-bold text-[#24603B]">{confirmedHours} giờ</p>
                </div>
                <div className="rounded-[12px] bg-[#FFF8E7] p-4">
                  <p className="text-xs font-semibold text-[#80520C]">Đang chờ xác nhận (tách riêng)</p>
                  <p className="mt-1 tabular-nums text-2xl font-bold text-[#80520C]">{pendingHours} giờ</p>
                </div>
                <div className="rounded-[12px] bg-[#FAF8F1] p-4">
                  <p className="text-xs font-semibold text-[#52645A]">Số nhiệm vụ hoàn tất</p>
                  <p className="mt-1 tabular-nums text-2xl font-bold text-[#25352B]">{approvedMissions.length}</p>
                </div>
              </div>

              <div className="mt-5 space-y-2 text-xs">
                <h3 className="text-sm font-bold text-[#25352B]">Danh sách nhiệm vụ đã xác nhận vào sổ</h3>
                {approvedMissions.map((m) => (
                  <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-[#EAEFE6] px-3 py-2">
                    <span>
                      <strong className="text-[#245B3D]">{m.id}</strong> · {m.title} ({m.farmName})
                    </span>
                    <Badge tone="success">+{m.approvedHours} giờ</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : null}

        {tab === "fieldlab" ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <Card className="space-y-4 p-5 lg:col-span-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
                <Sparkles className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
                <span>Học liệu Field Lab &amp; Trao đổi kỹ năng ({lessons.length})</span>
              </h2>
              <div className="space-y-2.5 text-xs">
                {lessons.slice(0, 6).map((les) => (
                  <Link
                    key={les.id}
                    href={`/learn`}
                    className="block rounded-[12px] border border-[#EAEFE6] bg-[#FAF8F1] p-3 hover:bg-[#EAF0E5]"
                  >
                    <p className="font-bold text-[#25352B]">{les.title}</p>
                    <p className="mt-0.5 text-[#52645A]">
                      {les.topicTag} · {les.durationLabel} · {les.regionName}
                    </p>
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="space-y-4 p-5 lg:col-span-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
                <ShieldAlert className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
                <span>Vườn đồng hành dài hạn &amp; Cố vấn kỹ thuật</span>
              </h2>
              <div className="space-y-2.5 text-xs">
                {mentorCases.map((mc) => (
                  <div key={mc.id} className="rounded-[12px] border border-[#D6DED2] bg-white p-3">
                    <p className="font-bold text-[#25352B]">{mc.title}</p>
                    <p className="text-[#245B3D]">
                      {mc.farmName} · Cố vấn: {mc.mentorName}
                    </p>
                    <p className="mt-1 text-[#52645A]">{mc.scheduledAt}</p>
                  </div>
                ))}
                {farms.slice(0, 3).map((f) => (
                  <div key={f.id} className="flex items-center justify-between rounded-[10px] bg-[#FAF8F1] px-3 py-2">
                    <div>
                      <p className="font-bold text-[#25352B]">{f.name}</p>
                      <p className="text-[11px] text-[#52645A]">{f.administrativeUnitName} · {f.areaHa} ha</p>
                    </div>
                    <Link href={`/farms/${f.slug}`} className="font-semibold text-[#245B3D] hover:underline">
                      Xem vườn →
                    </Link>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : null}

        {tab === "ambassador" ? (
          <div className="space-y-5">
            {authUser?.isMinor ? (
              <div className="flex items-start gap-2.5 rounded-[14px] border border-[#D7A34D] bg-[#FFF2D8] p-4 text-xs text-[#80520C]">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{isEn ? minorCheck.reasonEn : minorCheck.reasonVi}</span>
              </div>
            ) : null}

            <DemoBanner title={t.learn.practicePointsLabel} detail={t.learn.volunteerHoursSeparateNote} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card className="p-4">
                <p className="text-xs text-[#52645A]">{t.learn.practicePointsLabel}</p>
                <p className="mt-1 tabular-nums text-2xl font-bold text-[#245B3D]">
                  {learningProgress.practicePoints} pts
                </p>
                <p className="mt-1 text-[11px] text-[#52645A]">
                  {learningProgress.masteredPhraseIds.length} phrases mastered ·{" "}
                  {learningProgress.completedLessonIds.length}/{lessons.length} lessons
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-[#52645A]">
                  {isEn ? "Confirmed Volunteer Hours (W02+W04)" : "Giờ tình nguyện đã duyệt (2 lớp)"}
                </p>
                <p className="mt-1 tabular-nums text-2xl font-bold text-[#24603B]">
                  {confirmedHours} h
                </p>
                <p className="mt-1 text-[11px] text-[#52645A]">
                  {isEn ? "Separate from quiz points" : "Tách biệt khỏi điểm luyện tập"}
                </p>
              </Card>
              <Card className="flex flex-col justify-between p-4">
                <p className="text-xs font-bold text-[#25352B]">
                  {isEn ? "Open Bilingual Practice" : "Thực hành Song ngữ A1–B1"}
                </p>
                <Link
                  href="/learn"
                  className="mt-2 inline-flex min-h-[38px] items-center justify-center rounded-[10px] bg-[#245B3D] px-3 text-xs font-semibold text-white"
                >
                  {t.nav.learn} →
                </Link>
              </Card>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-[#25352B]">
                {isEn
                  ? "Bilingual Ambassador & Cultural Hospitality Missions"
                  : "Nhiệm vụ Đại sứ Song ngữ & Đón khách Quốc tế"}
              </h2>
              {missions
                .filter(
                  (m) =>
                    m.skillTag === "Đại sứ Song ngữ & Đón khách" ||
                    m.languageRequired === "bilingual" ||
                    m.languageRequired === "en",
                )
                .slice(0, 6)
                .map((m) => renderMissionCard(m))}
            </div>
          </div>
        ) : null}

        {tab === "calendar" ? <NaiCalendarBoard scope="W03" allowCreate /> : null}
      </div>
    </WorkspaceShell>
  );
}
