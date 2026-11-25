"use client";

import Image from "next/image";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import {
  Award,
  BookOpen,
  Camera,
  CheckCircle2,
  Clock,
  Filter,
  MapPin,
  Radio,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell";
import { Badge, Button, Card, DemoBanner, EmptyState } from "@/components/ui/Primitives";
import type { MissionStatus, VolunteerMission } from "@/types/naifarm";
import { assetUrl } from "@/lib/storage/assets";
import { uploadImage } from "@/lib/storage/upload";

const MISSION_STATUS_LABEL: Record<
  MissionStatus,
  { text: string; tone: "neutral" | "info" | "warning" | "success" | "danger" }
> = {
  open: { text: "Chưa tham gia · Đang mở", tone: "info" },
  assigned: { text: "Đã nhận nhiệm vụ", tone: "info" },
  submitted: { text: "Đã nộp · Chờ W02 xác nhận", tone: "warning" },
  farm_accepted: { text: "W02 đã xác nhận · Chờ W04 duyệt giờ", tone: "info" },
  coordinator_approved: { text: "W04 đã duyệt cộng giờ", tone: "success" },
  revision_requested: { text: "Cần bổ sung minh chứng", tone: "danger" },
};

const SKILL_OPTIONS = [
  "Tất cả",
  "Chụp ảnh & AI đăng bán",
  "Thiết lập QR & Nhật ký",
  "Livestream bán hàng",
] as const;

const MODE_OPTIONS = ["Tất cả", "Trực tiếp tại vườn", "Hỗ trợ từ xa (Online)"] as const;

type ParticipationFilter = "all" | "available" | "joined";

const EVIDENCE_SAMPLE_PHOTOS = [
  { label: "Ảnh hướng dẫn nhà vườn", src: "stitch/stitch-32.webp" },
  { label: "Ảnh dán tem QR lô hàng", src: "stitch/stitch-31.webp" },
  { label: "Ảnh đóng gói sọt tại vườn", src: "stitch/stitch-56.webp" },
];

export default function VolunteerWorkspacePage() {
  const {
    hydrated,
    missions,
    setActiveWorkspace,
    acceptMission,
    submitMissionEvidence,
    profile,
  } = useDemoStore();

  const [participationTab, setParticipationTab] = useState<ParticipationFilter>("all");
  const [skillFilter, setSkillFilter] = useState<(typeof SKILL_OPTIONS)[number]>("Tất cả");
  const [modeFilter, setModeFilter] = useState<(typeof MODE_OPTIONS)[number]>("Tất cả");
  const [volunteerName, setVolunteerName] = useState("");
  const [evidenceOpenId, setEvidenceOpenId] = useState<string | null>(null);
  const [evidenceNote, setEvidenceNote] = useState(
    "Đã hoàn thành hướng dẫn trực tiếp, bàn giao ảnh chụp sản phẩm và kiểm tra quét QR trên điện thoại nhà vườn."
  );
  const [evidenceHours, setEvidenceHours] = useState("2");
  const [evidencePhoto, setEvidencePhoto] = useState(EVIDENCE_SAMPLE_PHOTOS[0].src);
  const [evidenceUploading, setEvidenceUploading] = useState(false);
  const siteOrigin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  );
  const displayVolunteerName =
    volunteerName.trim() || profile?.fullName || "Tình nguyện viên";

  useEffect(() => {
    setActiveWorkspace("W03");
  }, [setActiveWorkspace]);

  const matchesSkillAndMode = (m: VolunteerMission) => {
    const matchSkill = skillFilter === "Tất cả" || m.skillTag === skillFilter;
    const matchMode = modeFilter === "Tất cả" || m.mode === modeFilter;
    return matchSkill && matchMode;
  };

  const openTotalCount = missions.filter((m) => m.status === "open").length;
  const joinedTotalCount = missions.filter((m) => m.status !== "open").length;

  const availableMissions = missions.filter((m) => m.status === "open" && matchesSkillAndMode(m));
  const joinedMissions = missions.filter((m) => m.status !== "open" && matchesSkillAndMode(m));

  const visibleCount =
    participationTab === "available"
      ? availableMissions.length
      : participationTab === "joined"
      ? joinedMissions.length
      : availableMissions.length + joinedMissions.length;

  // Strict 2-layer hours ledger: approvedHours vs pendingHours NEVER combined
  const approvedHours = missions
    .filter((m) => m.status === "coordinator_approved")
    .reduce((sum, m) => sum + m.approvedHours, 0);

  const pendingHours = missions
    .filter((m) => m.status === "submitted" || m.status === "farm_accepted")
    .reduce((sum, m) => sum + (m.submittedHours || m.expectedHours), 0);

  const handleAccept = async (mission: VolunteerMission) => {
    try {
      await acceptMission(mission.id, displayVolunteerName);
      toast.success(`Bạn đã nhận nhiệm vụ ${mission.id}: ${mission.title}`);
    } catch {
      toast.error("Không nhận được nhiệm vụ. Vui lòng thử lại.");
    }
  };

  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEvidenceUploading(true);
    try {
      const key = await uploadImage("evidence", file);
      setEvidencePhoto(key);
      toast.success("Đã nén WebP và tải ảnh minh chứng lên Supabase Storage.");
    } catch {
      toast.error("Không tải được ảnh minh chứng. Vui lòng thử lại.");
    } finally {
      setEvidenceUploading(false);
    }
  };

  const handleSubmitEvidence = async (e: React.FormEvent, mission: VolunteerMission) => {
    e.preventDefault();
    if (evidenceUploading) {
      toast.error("Ảnh đang được tải lên, vui lòng đợi trong giây lát.");
      return;
    }
    const hours = Number(evidenceHours);
    if (!evidenceNote.trim() || !hours || hours <= 0) {
      toast.error("Vui lòng nhập mô tả minh chứng và số giờ hợp lệ.");
      return;
    }
    try {
      await submitMissionEvidence(mission.id, evidenceNote.trim(), hours, evidencePhoto);
      setEvidenceOpenId(null);
      toast.success(
        `Đã nộp minh chứng ${mission.id}. Bước tiếp theo: Chủ vườn W02 xác nhận kết quả.`
      );
    } catch {
      toast.error("Không nộp được minh chứng. Vui lòng thử lại.");
    }
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
      <Card key={m.id} className="p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="tabular-nums text-xs font-bold text-primary">{m.id}</span>
              <Badge tone={statusInfo.tone}>{statusInfo.text}</Badge>
              <Badge tone="neutral">{m.skillTag}</Badge>
            </div>
            <h3 className="text-lg font-bold text-foreground">{m.title}</h3>
            <p className="inline-flex items-center gap-1.5 text-xs text-muted">
              <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              {m.farmName} · {m.location} · Dự kiến{" "}
              <span className="font-bold text-foreground">{m.expectedHours} giờ</span> · Hạn{" "}
              {m.dueDate}
            </p>
          </div>

          {m.assigneeName ? (
            <div className="rounded-[10px] bg-surface-soft px-3 py-1.5 text-xs font-semibold text-primary">
              Phụ trách: {m.assigneeName}
            </div>
          ) : null}
        </div>

        <p className="text-sm text-foreground">{m.deliverableSummary}</p>

        {/* 4-step workflow bar */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { n: 1, label: "1. Nhận việc" },
            { n: 2, label: "2. Nộp minh chứng" },
            { n: 3, label: "3. W02 Xác nhận" },
            { n: 4, label: "4. W04 Duyệt giờ" },
          ].map((s) => {
            const completed = stepNum > s.n;
            const active = stepNum === s.n;
            return (
              <div
                key={s.n}
                className={`rounded-[10px] border px-3 py-2 text-xs font-semibold ${
                  completed
                    ? "border-leaf bg-success-bg text-success"
                    : active
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-background text-muted"
                }`}
              >
                {s.label}
              </div>
            );
          })}
        </div>

        {m.status === "revision_requested" && m.revisionReason ? (
          <div className="rounded-[12px] border border-danger/35 bg-danger-bg p-3 text-sm text-danger">
            <span className="font-bold">Yêu cầu bổ sung từ W04: </span>
            {m.revisionReason}
          </div>
        ) : null}

        {m.evidenceImage && m.evidenceNote ? (
          <div className="flex flex-col gap-3 rounded-[12px] border border-border bg-background p-3 sm:flex-row sm:items-center">
            <Image
              src={assetUrl(m.evidenceImage)}
              alt={`Ảnh minh chứng ${m.id}`}
              className="h-20 w-28 shrink-0 rounded-[8px] object-cover"
              width={512}
              height={279}
            />
            <div className="text-xs text-muted">
              <p className="font-bold text-foreground">
                Minh chứng đã nộp ({m.submittedHours} giờ đề nghị):
              </p>
              <p className="mt-0.5">{m.evidenceNote}</p>
            </div>
          </div>
        ) : null}

        {/* Action Controls */}
        <div className="flex flex-wrap gap-3">
          {m.status === "open" ? (
            <Button variant="primary" onClick={() => void handleAccept(m)}>
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>Nhận nhiệm vụ này</span>
            </Button>
          ) : null}

          {(m.status === "assigned" || m.status === "revision_requested") &&
          evidenceOpenId !== m.id ? (
            <Button
              variant="primary"
              onClick={() => {
                setEvidenceOpenId(m.id);
                setEvidenceHours(String(m.expectedHours));
              }}
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              <span>Nộp ảnh & minh chứng bàn giao</span>
            </Button>
          ) : null}

          {m.status === "submitted" ? (
            <Link
              href="/farmer"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-[10px] border border-primary bg-white px-4 text-xs font-bold text-primary hover:bg-surface-soft"
            >
              Mở W02 (/farmer) để chủ vườn xác nhận bàn giao →
            </Link>
          ) : null}

          {m.status === "farm_accepted" ? (
            <Link
              href="/coordinator"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-[10px] border border-primary bg-white px-4 text-xs font-bold text-primary hover:bg-surface-soft"
            >
              Mở W04 (/coordinator) để duyệt cộng giờ →
            </Link>
          ) : null}
        </div>

        {evidenceOpenId === m.id ? (
          <form
            onSubmit={(e) => handleSubmitEvidence(e, m)}
            className="rounded-[14px] border border-border bg-background p-4 space-y-3"
          >
            <p className="text-sm font-bold text-foreground">
              Nộp minh chứng bàn giao cho nhiệm vụ {m.id}
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label
                  htmlFor={`note-${m.id}`}
                  className="mb-1 block text-xs font-semibold text-foreground"
                >
                  Mô tả kết quả đã bàn giao cho nhà vườn
                </label>
                <textarea
                  id={`note-${m.id}`}
                  rows={2}
                  value={evidenceNote}
                  onChange={(e) => setEvidenceNote(e.target.value)}
                  className="w-full rounded-[10px] border border-border bg-white p-2.5 text-sm text-foreground"
                />
              </div>
              <div>
                <label
                  htmlFor={`hours-${m.id}`}
                  className="mb-1 block text-xs font-semibold text-foreground"
                >
                  Số giờ thực hiện
                </label>
                <input
                  id={`hours-${m.id}`}
                  type="number"
                  min={1}
                  max={8}
                  value={evidenceHours}
                  onChange={(e) => setEvidenceHours(e.target.value)}
                  className="min-h-[42px] w-full rounded-[10px] border border-border bg-white px-3 text-sm font-bold text-primary tabular-nums"
                />
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-semibold text-foreground">
                <Camera className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                Chọn ảnh minh chứng mẫu tại vườn:
              </span>
              <div className="flex flex-wrap gap-2">
                {EVIDENCE_SAMPLE_PHOTOS.map((photo) => (
                  <button
                    key={photo.src}
                    type="button"
                    onClick={() => setEvidencePhoto(photo.src)}
                    className={`flex items-center gap-2 rounded-[10px] border p-1.5 text-xs font-semibold cursor-pointer ${
                      evidencePhoto === photo.src
                        ? "border-primary bg-surface-soft text-primary"
                        : "border-border bg-white text-muted"
                    }`}
                  >
                    <Image
                      src={assetUrl(photo.src)}
                      alt={photo.label}
                      className="h-8 w-8 rounded object-cover"
                      width={512}
                      height={279}
                    />
                    <span>{photo.label}</span>
                  </button>
                ))}
              </div>
              <label className="mt-2 inline-flex min-h-[42px] cursor-pointer items-center gap-2 rounded-[10px] border border-primary bg-white px-3 text-xs font-bold text-primary hover:bg-surface-soft">
                <Camera className="h-4 w-4" aria-hidden="true" />
                <span>{evidenceUploading ? "Đang tải ảnh..." : "Tải ảnh minh chứng từ máy"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEvidenceUpload}
                  className="sr-only"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="primary" size="sm" disabled={evidenceUploading}>
                Gửi minh chứng chờ W02 xác nhận
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setEvidenceOpenId(null)}
              >
                Đóng
              </Button>
            </div>
          </form>
        ) : null}
      </Card>
    );
  };

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-12 text-sm text-muted">
        Đang tải Không gian Thanh niên Tình nguyện...
      </div>
    );
  }

  return (
    <WorkspaceShell
      workspaceId="W03"
      title="Thanh niên Tình nguyện"
      navItems={[
        {
          label: "Bảng nhiệm vụ Số hóa",
          href: "#missions",
          active: true,
          icon: <Sparkles className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: "Youth Impact Pass (S18)",
          href: "#impact-pass",
          icon: <Award className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: "Góc học mở & 3D Bưởi",
          href: "/learn",
          icon: <BookOpen className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: "Phòng Livestream Đồng hành",
          href: "/live",
          icon: <Radio className="h-4 w-4" aria-hidden="true" />,
        },
      ]}
    >
      <div className="space-y-6">
        <DemoBanner
          title="Cơ chế cộng giờ cống hiến 2 lớp (W02 + W04)"
          detail="Tình nguyện viên nộp minh chứng tại đây → Chủ vườn xác nhận đã nhận kết quả ở /farmer → Điều phối viên cơ sở duyệt chính thức ở /coordinator. Giờ chờ duyệt không tự cộng vào tổng giờ đã duyệt."
        />

        {/* Top Row: OCOP Youth Impact Pass (S18) */}
        <section id="impact-pass">
          <Card className="overflow-hidden border-primary/25">
            <div className="bg-gradient-to-r from-primary to-primary-soft px-5 py-4 text-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-surface-soft">
                    OCOP Youth Impact Pass (Hồ sơ TNV)
                  </p>
                  <h2 className="text-xl font-bold">
                    {displayVolunteerName} & Tuấn · Đội Trí thức trẻ Số hóa Đồng Nai
                  </h2>
                </div>
                <Badge tone="gold">Đoàn viên Số hóa · TP. Đồng Nai</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-[160px_minmax(0,1fr)]">
              <div className="flex flex-col items-center justify-center">
                <div className="rounded-[12px] border border-border bg-white p-3">
                  <QRCodeSVG
                    value={`${siteOrigin}/volunteer?pass=${profile?.id ?? ""}`}
                    size={128}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    level="M"
                    marginSize={3}
                    title="QR Hồ sơ Thanh niên Tình nguyện NaiFarm"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-muted">Mã xác thực hồ sơ</p>
              </div>

              <div className="flex flex-col justify-between gap-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-[14px] border border-success/25 bg-success-bg p-4">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-success">
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      Giờ đã duyệt chính thức
                    </p>
                    <p className="mt-1 tabular-nums text-3xl font-bold text-primary">
                      {approvedHours} giờ
                    </p>
                    <p className="mt-0.5 text-xs text-success">
                      Đã qua 2 lớp: W02 xác nhận & W04 duyệt
                    </p>
                  </div>

                  <div className="rounded-[14px] border border-accent/40 bg-warning-bg p-4">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-warning">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      Giờ đang chờ duyệt
                    </p>
                    <p className="mt-1 tabular-nums text-3xl font-bold text-warning">
                      {pendingHours} giờ
                    </p>
                    <p className="mt-0.5 text-xs text-warning">
                      Chưa cộng vào giờ chính thức cho tới khi W04 duyệt
                    </p>
                  </div>

                  <div className="rounded-[14px] border border-border bg-background p-4">
                    <p className="text-xs font-semibold text-muted">Tên hiển thị khi nhận việc</p>
                    <input
                      value={volunteerName}
                      placeholder={profile?.fullName ?? "Tên tình nguyện viên"}
                      onChange={(e) => setVolunteerName(e.target.value)}
                      aria-label="Tên tình nguyện viên"
                      className="mt-1.5 min-h-[40px] w-full rounded-[10px] border border-border bg-white px-3 text-sm font-semibold text-foreground"
                    />
                    <p className="mt-1 text-[11px] text-muted">
                      Cập nhật ngay vào lượt nhận nhiệm vụ mới
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-background px-4 py-3 text-xs text-muted">
                  <span>
                    Muốn thử nghiệm luồng duyệt? Xác nhận bàn giao ở{" "}
                    <Link href="/farmer" className="font-bold text-primary underline">
                      /farmer (W02)
                    </Link>{" "}
                    rồi duyệt giờ ở{" "}
                    <Link href="/coordinator" className="font-bold text-primary underline">
                      /coordinator (W04)
                    </Link>
                    .
                  </span>
                  <Link
                    href="/learn"
                    className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
                  >
                    <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                    Mở Góc học tập & 3D
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Mission Board Split: Chưa tham gia vs Đã tham gia / Đã làm */}
        <section id="missions" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Bảng nhiệm vụ số hóa nông sản ({visibleCount})
              </h2>
              <p className="text-sm text-muted">
                Tách rõ nhiệm vụ mới chưa tham gia và các nhiệm vụ đã tham gia / đang theo dõi.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <Filter className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>Bộ lọc hoạt động thực tế</span>
            </div>
          </div>

          <Card className="p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2 border-b border-surface-soft pb-3">
              <span className="text-xs font-semibold text-muted mr-1">Trạng thái:</span>
              {(
                [
                  { id: "all", label: `Tất cả (${missions.length})` },
                  { id: "available", label: `Nhiệm vụ chưa tham gia (${openTotalCount})` },
                  { id: "joined", label: `Nhiệm vụ đã tham gia / đã làm (${joinedTotalCount})` },
                ] as const
              ).map((tabItem) => (
                <button
                  key={tabItem.id}
                  type="button"
                  onClick={() => setParticipationTab(tabItem.id)}
                  className={`min-h-[40px] rounded-full px-4 text-xs font-semibold transition cursor-pointer ${
                    participationTab === tabItem.id
                      ? "bg-primary text-white"
                      : "border border-border bg-white text-foreground hover:bg-surface-soft"
                  }`}
                >
                  {tabItem.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted mr-1">Kỹ năng:</span>
              {SKILL_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => setSkillFilter(skill)}
                  className={`min-h-[38px] rounded-full px-3.5 text-xs font-semibold transition cursor-pointer ${
                    skillFilter === skill
                      ? "bg-primary text-white"
                      : "border border-border bg-white text-foreground hover:bg-surface-soft"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted mr-1">Hình thức:</span>
              {MODE_OPTIONS.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setModeFilter(mode)}
                  className={`min-h-[38px] rounded-full px-3.5 text-xs font-semibold transition cursor-pointer ${
                    modeFilter === mode
                      ? "bg-leaf text-white"
                      : "border border-border bg-white text-foreground hover:bg-surface-soft"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </Card>

          {visibleCount === 0 ? (
            <EmptyState
              icon={<Filter className="h-6 w-6" />}
              title="Chưa có nhiệm vụ khớp bộ lọc hiện tại"
              description="Bạn thử đặt lại bộ lọc để xem toàn bộ nhiệm vụ hỗ trợ nhà vườn ở Long Khánh, Tân Triều và Xuân Lộc."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setParticipationTab("all");
                    setSkillFilter("Tất cả");
                    setModeFilter("Tất cả");
                  }}
                >
                  Đặt lại bộ lọc
                </Button>
              }
            />
          ) : (
            <div className="space-y-6">
              {participationTab !== "joined" && availableMissions.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-primary">
                      Nhiệm vụ chưa tham gia ({availableMissions.length})
                    </h3>
                    <Badge tone="info">Sẵn sàng nhận</Badge>
                  </div>
                  <div className="space-y-4">{availableMissions.map(renderMissionCard)}</div>
                </div>
              ) : null}

              {participationTab !== "available" && joinedMissions.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-foreground">
                      Nhiệm vụ đã tham gia / Đã làm ({joinedMissions.length})
                    </h3>
                    <Badge tone="neutral">Theo dõi tiến độ & giờ duyệt</Badge>
                  </div>
                  <div className="space-y-4">{joinedMissions.map(renderMissionCard)}</div>
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </WorkspaceShell>
  );
}
