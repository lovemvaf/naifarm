"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Compass,
  ExternalLink,
  HelpCircle,
  PlayCircle,
  Plus,
  QrCode,
  Radio,
  ShieldAlert,
  ShoppingBasket,
  Sprout,
  Users,
  Video,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { buildIcsDocument, triggerIcsDownload } from "@/lib/clock/vn-clock";
import { localizeProductName, localizeUnit } from "@/lib/i18n/domain-en";
import {
  buildLocalizedHref,
  loadRoomSessionState,
  sanitizeReturnTo,
  saveRoomSessionState,
} from "@/lib/navigation/safe-nav";
import { evaluateMinorSafeguarding } from "@/lib/permissions/access-control";
import { resolveCategoryMedia } from "@/data/reference/media-library";
import { MediaPlayer } from "@/components/media/MediaPlayer";
import { cn, formatVnd, stripWorkspaceCodePrefix } from "@/lib/format";
import { notifyError, notifySuccess } from "@/lib/toast";
import { Badge, Button, Card, DemoBanner } from "@/components/ui/Primitives";
import type { CalendarEvent, LiveStatus } from "@/types/naifarm";

type RoomTab = "overview" | "schedule" | "farm_tour" | "faq";

const VALID_TABS: RoomTab[] = ["overview", "schedule", "farm_tour", "faq"];

export function LiveRoomView({ routeRoomId }: { routeRoomId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale, t, currencyMode } = useLocale();
  const isEn = locale === "en";
  const showUsd = currencyMode === "vnd_usd_est";

  const {
    hydrated,
    authUser,
    activeWorkspace,
    livestreams,
    products,
    farms,
    addToCart,
    createLivestreamSession,
  } = useDemoStore();

  const urlRoomParam = searchParams.get("room");
  const urlTabParam = searchParams.get("tab") as RoomTab | null;
  const urlAngleParam = searchParams.get("angle");
  const rawReturnTo = searchParams.get("returnTo");
  const safeReturnTo = sanitizeReturnTo(rawReturnTo, "/live");

  const [localRoomId, setActiveSessionId] = useState<string | null>(null);
  const [localTab, setActiveTab] = useState<RoomTab | null>(null);
  const [localAngle, setAngleIndex] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | LiveStatus>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [remindedIds, setRemindedIds] = useState<string[]>([]);

  const [newTitle, setNewTitle] = useState("");
  const [newFarmId, setNewFarmId] = useState(farms[1]?.id ?? "farm-ba-tu-demo");
  const [newSchedule, setNewSchedule] = useState("29/11/2026 · 09:30");
  const [newYouth, setNewYouth] = useState("Minh Anh & Tuấn");
  const [newProductId, setNewProductId] = useState("P01");

  const activeSessionId = useMemo(() => {
    if (routeRoomId && livestreams.some((l) => l.id === routeRoomId)) return routeRoomId;
    if (urlRoomParam && livestreams.some((l) => l.id === urlRoomParam)) return urlRoomParam;
    if (localRoomId && livestreams.some((l) => l.id === localRoomId)) return localRoomId;
    return livestreams[0]?.id ?? "";
  }, [routeRoomId, urlRoomParam, localRoomId, livestreams]);

  const cachedState = useMemo(() => {
    if (typeof window === "undefined") return null;
    return loadRoomSessionState(`live:${activeSessionId || "hub"}`);
  }, [activeSessionId]);

  const activeTab: RoomTab =
    urlTabParam && VALID_TABS.includes(urlTabParam)
      ? urlTabParam
      : localTab ??
        (cachedState?.tab && VALID_TABS.includes(cachedState.tab as RoomTab)
          ? (cachedState.tab as RoomTab)
          : "overview");

  const angleIndex: number =
    urlAngleParam !== null && !Number.isNaN(Number(urlAngleParam))
      ? Math.max(0, Number(urlAngleParam))
      : localAngle ??
        (typeof cachedState?.angleIndex === "number" ? Math.max(0, cachedState.angleIndex) : 0);

  const activeSession =
    livestreams.find((l) => l.id === activeSessionId) ?? livestreams[0] ?? null;

  const activeFarm = useMemo(
    () => farms.find((f) => f.id === activeSession?.farmId),
    [farms, activeSession],
  );

  const safeAngleIndex =
    activeSession && angleIndex < activeSession.angles.length ? angleIndex : 0;
  const activeAngle = activeSession?.angles[safeAngleIndex] ?? activeSession?.angles[0];

  const minorCheck = evaluateMinorSafeguarding(authUser?.isMinor, authUser?.hasGuardianConsent);
  const allPinnedProducts = useMemo(
    () => products.filter((p) => activeSession?.pinnedProductIds.includes(p.id)),
    [products, activeSession],
  );
  const pinnedProducts = useMemo(
    () =>
      minorCheck.allowAlcoholCatalog
        ? allPinnedProducts
        : allPinnedProducts.filter((p) => !p.adultOnly),
    [allPinnedProducts, minorCheck.allowAlcoholCatalog],
  );
  const hiddenAdultCount = allPinnedProducts.length - pinnedProducts.length;

  const isSignedInWorkspace = Boolean(authUser);
  const canScheduleLive =
    isSignedInWorkspace &&
    (activeWorkspace === "W02" ||
      activeWorkspace === "W03" ||
      activeWorkspace === "W04" ||
      activeWorkspace === "W05");
  const isReadOnlyAdmin = isSignedInWorkspace && activeWorkspace === "W06";

  const syncUrlAndSession = (next: { room?: string; tab?: RoomTab; angle?: number }) => {
    const nextRoom = next.room ?? activeSessionId;
    const nextTab = next.tab ?? activeTab;
    const nextAngle = next.angle ?? safeAngleIndex;

    saveRoomSessionState(`live:${nextRoom}`, {
      tab: nextTab,
      angleIndex: nextAngle,
    });

    const params = new URLSearchParams(searchParams.toString());
    if (!routeRoomId && nextRoom) {
      params.set("room", nextRoom);
    }
    params.set("tab", nextTab);
    params.set("angle", String(nextAngle));
    if (locale === "en") params.set("lang", "en");
    else params.delete("lang");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSelectSessionOnHub = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setAngleIndex(0);
    syncUrlAndSession({ room: sessionId, tab: activeTab, angle: 0 });
  };

  const handleSelectAngle = (idx: number) => {
    setAngleIndex(idx);
    syncUrlAndSession({ angle: idx });
  };

  const handleSelectTab = (tab: RoomTab) => {
    setActiveTab(tab);
    syncUrlAndSession({ tab });
  };

  const handleExportRoomIcs = () => {
    if (!activeSession) return;
    const startIso = activeSession.startIso || "2026-11-28T09:00:00+07:00";
    const endIso = new Date(Date.parse(startIso) + 90 * 60 * 1000).toISOString();
    const calEv: CalendarEvent = {
      id: `LIVE-${activeSession.id}`,
      title: activeSession.title,
      titleEn: activeSession.titleEn ?? activeSession.title,
      description: `${activeSession.summary} · ${activeSession.hostYouth}`,
      descriptionEn: activeSession.summaryEn ?? activeSession.summary,
      eventKind: "live",
      classification: "platform_initiative",
      organizer: activeSession.farmName,
      status: activeSession.status === "ended" ? "completed" : "scheduled",
      startIso,
      endIso,
      allDay: false,
      timezone: "Asia/Ho_Chi_Minh",
      priority: "normal",
      visibility: "public",
      locationLabel: `${activeSession.farmName}, ${activeFarm?.administrativeUnitName ?? "Đồng Nai"}`,
      linkedRoute: `/live/${activeSession.id}`,
      linkedEntityId: activeSession.id,
    };
    const ics = buildIcsDocument([calEv], locale, `NaiFarm Live - ${activeSession.id}`);
    triggerIcsDownload(`naifarm-live-${activeSession.id}.ics`, ics);
    notifySuccess(t.toasts.icsDownloaded);
  };

  const filteredSessions = useMemo(() => {
    if (statusFilter === "all") return livestreams;
    return livestreams.filter((s) => s.status === statusFilter);
  }, [livestreams, statusFilter]);

  const statusMeta = (status: LiveStatus) => {
    if (status === "replay_demo") {
      return { tone: "info" as const, label: t.live.statusReplay };
    }
    if (status === "ended") {
      return { tone: "neutral" as const, label: t.live.statusEnded };
    }
    return { tone: "gold" as const, label: t.live.statusScheduled };
  };

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1360px] px-4 py-12 text-sm text-[#52645A]">
        {isEn ? "Loading OCOP Live Story Hub..." : "Đang tải Phòng OCOP Live Story..."}
      </div>
    );
  }

  const backHref = buildLocalizedHref(
    routeRoomId ? safeReturnTo : "/",
    locale,
  );
  const currentRoomCanonicalPath = activeSession
    ? buildLocalizedHref(
        `/live/${activeSession.id}?returnTo=${encodeURIComponent(
          buildLocalizedHref("/live", locale),
        )}`,
        locale,
      )
    : buildLocalizedHref("/live", locale);

  return (
    <div className="mx-auto max-w-[1360px] space-y-6 px-4 py-6 lg:px-8">
      {/* Breadcrumb & Safe Return */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#52645A]">
          <Link href={buildLocalizedHref("/", locale)} className="hover:text-[#245B3D]">
            {isEn ? "Home" : "Trang chủ"}
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={buildLocalizedHref("/live", locale)} className="hover:text-[#245B3D]">
            OCOP Live
          </Link>
          {routeRoomId && activeSession ? (
            <>
              <span aria-hidden="true">/</span>
              <span className="font-semibold text-[#25352B]">{activeSession.id}</span>
            </>
          ) : null}
        </div>

        <Link
          href={backHref}
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[10px] border border-[#D6DED2] bg-white px-3 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{t.nav.backButton}</span>
        </Link>
      </nav>

      {/* Public Hub Header + Optional Signed-in Action Strip */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="info">{t.brand.experienceSpaceBadge}</Badge>
            {isSignedInWorkspace && authUser ? (
              <Badge tone="neutral">
                {stripWorkspaceCodePrefix(
                  isEn && authUser.roleLabelEn ? authUser.roleLabelEn : authUser.roleLabel,
                )}
              </Badge>
            ) : null}
          </div>
          <h1 className="mt-2 font-editorial text-2xl font-semibold text-[#25352B] sm:text-3xl">
            {activeSession && routeRoomId
              ? isEn && activeSession.titleEn
                ? activeSession.titleEn
                : activeSession.title
              : t.live.hubTitle}
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-[#52645A]">{t.live.hubSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canScheduleLive ? (
            <Button variant="primary" size="sm" onClick={() => setShowCreateForm((v) => !v)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>{showCreateForm ? t.nav.closeButton : t.live.createScheduleCta}</span>
            </Button>
          ) : null}
          {isSignedInWorkspace && authUser ? (
            <Link
              href={buildLocalizedHref(
                authUser.workspaceId === "W02"
                  ? "/farmer"
                  : authUser.workspaceId === "W03"
                  ? "/volunteer"
                  : authUser.workspaceId === "W04"
                  ? "/coordinator"
                  : authUser.workspaceId === "W05"
                  ? "/organization"
                  : authUser.workspaceId === "W06"
                  ? "/admin"
                  : "/account",
                locale,
              )}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[12px] border border-[#245B3D] bg-white px-3.5 text-xs font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
            >
              <span>
                {isEn
                  ? `Return to ${authUser.workspaceId} Workspace`
                  : `Về Không gian ${authUser.workspaceId}`}
              </span>
            </Link>
          ) : null}
        </div>
      </div>

      <DemoBanner title={t.live.honestyBannerTitle} detail={t.live.honestyBannerDetail} />

      {/* Schedule Creation Form for Authorized Signed-in Roles */}
      {canScheduleLive && showCreateForm ? (
        <Card className="border-2 border-[#245B3D]/25 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-[#25352B]">{t.live.createScheduleCta}</h2>
          <form
            className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newTitle.trim()) {
                notifyError(
                  isEn ? "Please enter a session title." : "Vui lòng nhập tiêu đề phiên livestream.",
                );
                return;
              }
              const created = createLivestreamSession({
                title: newTitle.trim(),
                farmId: newFarmId,
                scheduleLabel: newSchedule,
                hostYouth: newYouth.trim() || "Minh Anh & Tuấn",
                pinnedProductId: newProductId,
                summary:
                  "Phiên phát minh họa gắn tem QR truy xuất lô hàng cùng thanh niên tình nguyện.",
              });
              setActiveSessionId(created.id);
              setAngleIndex(0);
              setShowCreateForm(false);
              setNewTitle("");
              notifySuccess(
                isEn
                  ? `Scheduled ${created.id} linked to ${newProductId}.`
                  : `Đã tạo lịch ${created.id} liên kết sản phẩm ${newProductId}.`,
              );
            }}
          >
            <div className="sm:col-span-2">
              <label htmlFor="live-title" className="block text-xs font-semibold text-[#25352B]">
                {isEn ? "Session title" : "Tiêu đề phiên phát sóng"}
              </label>
              <input
                id="live-title"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={
                  isEn
                    ? "e.g. Morning rambutan harvest at Ba Tu orchard"
                    : "Ví dụ: Cắt chôm chôm sáng sớm tại vườn Ba Tư"
                }
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              />
            </div>

            <div>
              <label htmlFor="live-farm" className="block text-xs font-semibold text-[#25352B]">
                {t.nav.farms}
              </label>
              <select
                id="live-farm"
                value={newFarmId}
                onChange={(e) => setNewFarmId(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {isEn && f.enName ? f.enName : f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="live-prod" className="block text-xs font-semibold text-[#25352B]">
                {isEn ? "Pinned product" : "Sản phẩm ghim"}
              </label>
              <select
                id="live-prod"
                value={newProductId}
                onChange={(e) => setNewProductId(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              >
                {products.slice(0, 60).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} · {localizeProductName(p, locale)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="live-time" className="block text-xs font-semibold text-[#25352B]">
                {isEn ? "Scheduled window" : "Thời gian dự kiến"}
              </label>
              <input
                id="live-time"
                type="text"
                value={newSchedule}
                onChange={(e) => setNewSchedule(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              />
            </div>

            <div>
              <label htmlFor="live-youth" className="block text-xs font-semibold text-[#25352B]">
                {isEn ? "Youth / Host team" : "Người dẫn phiên / TNV"}
              </label>
              <input
                id="live-youth"
                type="text"
                value={newYouth}
                onChange={(e) => setNewYouth(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm"
              />
            </div>

            <div className="flex items-end sm:col-span-2">
              <Button type="submit" variant="primary" size="md">
                {isEn ? "Save Scheduled Room" : "Lưu lịch Livestream"}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {/* Main Stage + Pinned Products (Strict items-start + self-start — Zero White Gap Stretch) */}
      {activeSession ? (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Left Player & Tabbed Details */}
          <Card className="self-start overflow-hidden lg:col-span-8">
            <div className="relative aspect-[16/9] bg-[#25352B]">
              <img
                src={activeAngle?.image || "/images/stitch/stitch-44.jpg"}
                alt={isEn && activeSession.titleEn ? activeSession.titleEn : activeSession.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                <Badge tone={statusMeta(activeSession.status).tone}>
                  <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{statusMeta(activeSession.status).label}</span>
                </Badge>
                <Badge tone="neutral">{activeSession.id}</Badge>
              </div>
            </div>

            <div className="space-y-4 p-5">
              {/* Orchard Angle Selector */}
              <div>
                <p className="mb-2 text-xs font-semibold text-[#52645A]">{t.live.anglesTitle}</p>
                <div className="flex flex-wrap gap-2">
                  {activeSession.angles.map((ang, idx) => (
                    <button
                      key={ang.id}
                      type="button"
                      onClick={() => handleSelectAngle(idx)}
                      aria-pressed={safeAngleIndex === idx}
                      className={cn(
                        "inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-colors cursor-pointer",
                        safeAngleIndex === idx
                          ? "bg-[#245B3D] text-white"
                          : "border border-[#D6DED2] bg-[#F5F3E9] text-[#25352B] hover:bg-[#EAF0E5]",
                      )}
                    >
                      <Video className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{isEn && ang.labelEn ? ang.labelEn : ang.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Session Title & Meta */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-[#25352B]">
                    {isEn && activeSession.titleEn ? activeSession.titleEn : activeSession.title}
                  </h2>
                  <p className="mt-1 text-xs font-medium text-[#52645A]">
                    {isEn && activeFarm?.enName ? activeFarm.enName : activeSession.farmName} ·{" "}
                    {isEn ? "Orchard host:" : "Chủ vườn:"} {activeSession.farmerName} ·{" "}
                    {isEn ? "Support:" : "Phụ trách:"} {activeSession.hostYouth} ·{" "}
                    {activeSession.scheduleLabel}
                  </p>
                </div>

                {!routeRoomId ? (
                  <Link
                    href={currentRoomCanonicalPath}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-[10px] border border-[#245B3D] bg-[#EAF0E5]/70 px-3 text-xs font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{isEn ? "Direct room link" : "Mở trang phòng riêng"}</span>
                  </Link>
                ) : null}
              </div>

              {/* Stateful URL-Backed Tabs */}
              <div
                role="tablist"
                aria-label={isEn ? "Session details tabs" : "Chi tiết phiên Live"}
                className="flex flex-wrap gap-1.5 border-b border-[#D6DED2] pb-2"
              >
                {(
                  [
                    { id: "overview", label: t.live.tabOverview, icon: Radio },
                    { id: "schedule", label: t.live.tabSchedule, icon: Users },
                    { id: "farm_tour", label: t.live.tabFarmTour, icon: Compass },
                    { id: "faq", label: t.live.tabFaq, icon: HelpCircle },
                  ] as const
                ).map((tabItem) => {
                  const TabIcon = tabItem.icon;
                  const active = activeTab === tabItem.id;
                  return (
                    <button
                      key={tabItem.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => handleSelectTab(tabItem.id)}
                      className={cn(
                        "inline-flex min-h-[38px] items-center gap-1.5 rounded-[10px] px-3 text-xs font-semibold transition-colors cursor-pointer",
                        active
                          ? "bg-[#245B3D] text-white"
                          : "bg-[#F5F3E9] text-[#25352B] hover:bg-[#EAF0E5]",
                      )}
                    >
                      <TabIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{tabItem.label}</span>
                    </button>
                  );
                })}
              </div>

              {activeTab === "overview" ? (
                <div className="space-y-4 text-sm text-[#25352B]">
                  <p>
                    {isEn
                      ? activeAngle?.captionEn ?? activeSession.summaryEn ?? activeSession.summary
                      : activeAngle?.caption ?? activeSession.summary}
                  </p>
                  <p className="rounded-[10px] border border-[#D6DED2] bg-[#FAF8F1] px-3 py-2 text-xs text-[#52645A]">
                    {t.live.noCommentsNotice}
                  </p>
                  <MediaPlayer
                    asset={resolveCategoryMedia(
                      `${activeSession.title} ${activeFarm?.mainCrops.join(" ") ?? ""}`,
                    )}
                    compact
                  />
                </div>
              ) : null}

              {activeTab === "schedule" ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3.5 text-xs">
                    <p className="font-bold text-[#25352B]">
                      {isEn ? "Broadcast window (UTC+7)" : "Khung giờ lịch phát (GMT+7)"}
                    </p>
                    <p className="mt-1 text-[#52645A]">{activeSession.scheduleLabel}</p>
                    <p className="mt-2 font-semibold text-[#245B3D]">
                      {statusMeta(activeSession.status).label}
                    </p>
                  </div>
                  <div className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3.5 text-xs">
                    <p className="font-bold text-[#25352B]">
                      {isEn ? "Youth Co-Host & Traceability Check" : "Thanh niên đồng hành & Hộ chiếu QR"}
                    </p>
                    <p className="mt-1 text-[#52645A]">{activeSession.hostYouth}</p>
                    {activeSession.linkedCampaignId ? (
                      <Link
                        href={buildLocalizedHref(`/events/${activeSession.linkedCampaignId}`, locale)}
                        className="mt-2 inline-flex items-center gap-1 font-semibold text-[#245B3D] underline"
                      >
                        <span>
                          {isEn ? "Linked cultural campaign" : "Chiến dịch liên kết"}:{" "}
                          {activeSession.linkedCampaignId}
                        </span>
                      </Link>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {activeTab === "farm_tour" ? (
                <div className="flex flex-wrap gap-2.5">
                  {activeFarm ? (
                    <Link
                      href={buildLocalizedHref(`/farms/${activeFarm.slug}`, locale)}
                      className="inline-flex min-h-[42px] items-center gap-2 rounded-[12px] border border-[#245B3D] bg-white px-4 text-xs font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
                    >
                      <Sprout className="h-4 w-4" aria-hidden="true" />
                      <span>{t.live.farmLinkLabel}</span>
                    </Link>
                  ) : null}
                  {activeSession.linkedTourSlug ? (
                    <Link
                      href={buildLocalizedHref(
                        `/experiences/${activeSession.linkedTourSlug}?returnTo=${encodeURIComponent(
                          buildLocalizedHref(
                            routeRoomId ? `/live/${activeSession.id}` : `/live?room=${activeSession.id}`,
                            locale,
                          ),
                        )}`,
                        locale,
                      )}
                      className="inline-flex min-h-[42px] items-center gap-2 rounded-[12px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#19472E]"
                    >
                      <Compass className="h-4 w-4" aria-hidden="true" />
                      <span>{t.live.tourLinkLabel}</span>
                    </Link>
                  ) : null}
                  {activeSession.linkedLessonSlug ? (
                    <Link
                      href={buildLocalizedHref(
                        `/learn/${activeSession.linkedLessonSlug}?returnTo=${encodeURIComponent(
                          buildLocalizedHref(
                            routeRoomId ? `/live/${activeSession.id}` : `/live?room=${activeSession.id}`,
                            locale,
                          ),
                        )}`,
                        locale,
                      )}
                      className="inline-flex min-h-[42px] items-center gap-2 rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] px-4 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
                    >
                      <BookOpen className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                      <span>{t.live.lessonLinkLabel}</span>
                    </Link>
                  ) : null}
                </div>
              ) : null}

              {activeTab === "faq" ? (
                <div className="space-y-2.5 text-xs">
                  <div className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3">
                    <p className="font-bold text-[#25352B]">
                      {isEn
                        ? "How is batch traceability verified during OCOP Live?"
                        : "Mã lô QR trong phiên Live được đối chiếu như thế nào?"}
                    </p>
                    <p className="mt-1 text-[#52645A]">
                      {isEn
                        ? "Every pinned product links directly to its QR Harvest Passport showing harvest date, packing station, and declared farm logs."
                        : "Mỗi sản phẩm ghim đều gắn trực tiếp mã lô Hộ chiếu QR hiển thị ngày hái, điểm đóng gói và nhật ký chăm bón đã công bố."}
                    </p>
                  </div>
                  <div className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3">
                    <p className="font-bold text-[#25352B]">
                      {isEn
                        ? "Are viewer counts or chat streams simulated?"
                        : "Phòng Live có mô phỏng mắt xem hoặc bình luận ảo không?"}
                    </p>
                    <p className="mt-1 text-[#52645A]">{t.live.noCommentsNotice}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          {/* Right Pinned Products & Schedule Actions */}
          <div className="self-start space-y-4 lg:col-span-4">
            <Card className="p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold text-[#25352B]">
                  {t.live.pinnedProductsTitle} ({pinnedProducts.length})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportRoomIcs}
                  title={t.events.exportIcsBtn}
                >
                  <CalendarPlus className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                  <span className="text-xs">.ics</span>
                </Button>
              </div>

              {hiddenAdultCount > 0 ? (
                <div className="mt-2.5 flex items-start gap-2 rounded-[10px] border border-[#D7A34D] bg-[#FFF2D8] p-2.5 text-xs text-[#80520C]">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{isEn ? minorCheck.reasonEn : minorCheck.reasonVi}</span>
                </div>
              ) : null}

              <div className="mt-3 max-h-[460px] space-y-3 overflow-y-auto pr-1">
                {pinnedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex gap-3 rounded-[12px] border border-[#D6DED2] bg-[#F5F3E9]/60 p-3"
                  >
                    <img
                      src={p.image}
                      alt={localizeProductName(p, locale)}
                      className="h-20 w-20 shrink-0 rounded-[10px] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={buildLocalizedHref(
                          `/products/${p.slug}?returnTo=${encodeURIComponent(currentRoomCanonicalPath)}`,
                          locale,
                        )}
                        className="line-clamp-2 text-sm font-bold text-[#25352B] hover:text-[#245B3D]"
                      >
                        {localizeProductName(p, locale)}
                      </Link>
                      <p className="mt-0.5 tabular-nums text-sm font-bold text-[#245B3D]">
                        {formatVnd(p.priceVnd, locale, showUsd)}/{localizeUnit(p.unitLabel, locale)}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {!isReadOnlyAdmin ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              const r = addToCart(p.id, 1);
                              if (r.ok) notifySuccess(r.message);
                              else notifyError(r.message);
                            }}
                          >
                            <ShoppingBasket className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{t.commerce.buyNow}</span>
                          </Button>
                        ) : null}
                        <Link
                          href={buildLocalizedHref(
                            `/trace/${p.batchCode}?returnTo=${encodeURIComponent(currentRoomCanonicalPath)}`,
                            locale,
                          )}
                          className="inline-flex min-h-[36px] items-center gap-1 rounded-[10px] border border-[#D6DED2] bg-white px-2.5 text-xs font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
                        >
                          <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>QR</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {activeSession.status === "scheduled" ? (
                <div className="mt-4 border-t border-[#D6DED2] pt-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const already = remindedIds.includes(activeSession.id);
                      setRemindedIds((prev) =>
                        already
                          ? prev.filter((id) => id !== activeSession.id)
                          : [...prev, activeSession.id],
                      );
                      notifySuccess(
                        already
                          ? isEn
                            ? `Reminder cleared for ${activeSession.id}.`
                            : `Đã tắt nhắc lịch ${activeSession.id}.`
                          : isEn
                          ? `Saved reminder for ${activeSession.id}. Export .ics for device calendar.`
                          : `Đã lưu nhắc lịch ${activeSession.id}. Xuất .ics nếu muốn lưu trên máy.`,
                      );
                    }}
                  >
                    {remindedIds.includes(activeSession.id) ? (
                      <CheckCircle2 className="h-4 w-4 text-[#24603B]" aria-hidden="true" />
                    ) : (
                      <Bell className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span>
                      {remindedIds.includes(activeSession.id) ? t.live.reminded : t.live.remindMe}
                    </span>
                  </Button>
                </div>
              ) : null}
            </Card>
          </div>
        </div>
      ) : null}

      {/* Schedule Directory & Filter */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-bold text-[#25352B]">
            <Calendar className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
            <span>
              {isEn
                ? `OCOP Live Schedule (${filteredSessions.length})`
                : `Danh sách Lịch phát sóng OCOP Live (${filteredSessions.length})`}
            </span>
          </h2>

          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: "all", label: t.live.filterAll },
                { id: "replay_demo", label: t.live.filterReplay },
                { id: "scheduled", label: t.live.filterScheduled },
                { id: "ended", label: t.live.filterEnded },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={cn(
                  "min-h-[36px] rounded-full px-3.5 text-xs font-semibold transition-colors cursor-pointer",
                  statusFilter === f.id
                    ? "bg-[#245B3D] text-white"
                    : "border border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#EAF0E5]",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredSessions.map((s) => {
            const meta = statusMeta(s.status);
            const isActive = s.id === activeSession?.id;
            const roomHref = buildLocalizedHref(
              `/live/${s.id}?returnTo=${encodeURIComponent(buildLocalizedHref("/live", locale))}`,
              locale,
            );

            return (
              <Card
                key={s.id}
                className={cn(
                  "flex flex-col justify-between p-4 transition-colors",
                  isActive ? "border-2 border-[#245B3D] bg-[#EAF0E5]/35" : "",
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone={meta.tone}>
                      <Radio className="h-3 w-3" aria-hidden="true" />
                      <span>{meta.label}</span>
                    </Badge>
                    <span className="text-xs font-semibold text-[#52645A]">{s.id}</span>
                  </div>
                  <h3 className="mt-2 font-bold text-[#25352B]">
                    {isEn && s.titleEn ? s.titleEn : s.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#52645A]">
                    {s.farmName} · {s.scheduleLabel}
                  </p>
                  <p className="mt-1 text-xs font-medium text-[#245B3D]">
                    {isEn ? "Co-host:" : "Phụ trách:"} {s.hostYouth}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {!routeRoomId ? (
                    <Button
                      variant={isActive ? "primary" : "secondary"}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleSelectSessionOnHub(s.id)}
                    >
                      {isActive ? t.live.viewingNowCta : t.live.openRoomCta}
                    </Button>
                  ) : null}
                  <Link
                    href={roomHref}
                    className={cn(
                      "inline-flex min-h-[40px] items-center justify-center gap-1 rounded-[12px] border px-3 text-xs font-semibold",
                      routeRoomId && isActive
                        ? "w-full border-[#245B3D] bg-[#245B3D] text-white"
                        : "border-[#D6DED2] bg-white text-[#245B3D] hover:bg-[#EAF0E5]",
                    )}
                  >
                    <span>{isEn ? "Room page" : "Trang phòng"}</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
