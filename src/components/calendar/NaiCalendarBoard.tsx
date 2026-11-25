"use client";

import React, { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Bell,
  Calendar as CalendarIcon,
  CalendarPlus,
  Clock,
  Lock,
  Plus,
  X,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import {
  buildIcsDocument,
  formatVnDate,
  formatVnDateTime,
  getVnDateIso,
  triggerIcsDownload,
} from "@/lib/clock/vn-clock";
import {
  filterCalendarEvents,
  generateDedupedReminders,
} from "@/lib/calendar/calendar-engine";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { cn } from "@/lib/format";
import { notifyError, notifyInfo, notifySuccess } from "@/lib/toast";
import { Badge, Button, Card } from "@/components/ui/Primitives";
import type { CalendarEvent, CalendarEventKind, WorkspaceId } from "@/types/naifarm";

type CalendarViewMode = "month" | "week" | "day" | "agenda";

export function NaiCalendarBoard({
  scope,
  farmIdFilter,
  allowCreate = false,
  compact = false,
}: {
  scope: WorkspaceId | "public";
  farmIdFilter?: string;
  allowCreate?: boolean;
  compact?: boolean;
}) {
  const { locale, t } = useLocale();
  const isEn = locale === "en";

  const {
    calendarEvents,
    activeClockIso,
    dismissedReminderKeys,
    dismissReminder,
    upsertCalendarEvent,
  } = useDemoStore();

  const isMobile = useSyncExternalStore(
    (cb) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia("(max-width: 767px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => (typeof window !== "undefined" ? window.innerWidth < 768 : false),
    () => false,
  );
  const [userViewMode, setUserViewMode] = useState<CalendarViewMode | null>(null);
  const viewMode: CalendarViewMode = userViewMode ?? (compact || isMobile ? "agenda" : "month");
  const setViewMode = (next: CalendarViewMode) => setUserViewMode(next);
  const [monthIso, setMonthIso] = useState<"2026-11" | "2026-12">("2026-11");
  const [kindFilter, setKindFilter] = useState<"all" | CalendarEventKind>("all");
  const [selectedDayIso, setSelectedDayIso] = useState<string>(getVnDateIso(activeClockIso));
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newStartDate, setNewStartDate] = useState("2026-11-29");
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("11:00");
  const [newKind, setNewKind] = useState<CalendarEventKind>("harvest");
  const [newLocation, setNewLocation] = useState("Phường Tân Triều");

  const filteredEvents = useMemo(
    () =>
      filterCalendarEvents(calendarEvents, {
        workspaceScope: scope,
        farmIdFilter,
        kindFilter,
        monthIso: viewMode === "month" ? monthIso : undefined,
        searchQuery,
      }),
    [calendarEvents, scope, farmIdFilter, kindFilter, viewMode, monthIso, searchQuery],
  );

  const visibleEvents = useMemo(() => {
    if (viewMode === "day") {
      return filteredEvents.filter((ev) => getVnDateIso(ev.startIso) === selectedDayIso);
    }
    if (viewMode === "week") {
      const targetTs = Date.parse(`${selectedDayIso}T00:00:00+07:00`);
      return filteredEvents.filter((ev) => {
        const ts = Date.parse(ev.startIso);
        const diffDays = Math.abs((ts - targetTs) / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      });
    }
    return filteredEvents;
  }, [filteredEvents, viewMode, selectedDayIso]);

  const reminders = useMemo(
    () =>
      generateDedupedReminders(
        filteredEvents,
        activeClockIso,
        scope,
        dismissedReminderKeys,
      ).slice(0, 6),
    [filteredEvents, activeClockIso, scope, dismissedReminderKeys],
  );

  // Month grid cells (for 2026-11 or 2026-12)
  const monthDays = useMemo(() => {
    const [yr, mo] = monthIso.split("-").map(Number);
    const daysInMonth = new Date(Date.UTC(yr, mo, 0)).getUTCDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const dd = String(i + 1).padStart(2, "0");
      return `${monthIso}-${dd}`;
    });
  }, [monthIso]);

  const scopeLabel =
    scope === "public"
      ? isEn
        ? "Seasonal & Cultural Schedule"
        : "Mùa vụ & Sự kiện"
      : scope === "W02"
        ? isEn
          ? "Orchard Operations"
          : "Nhà vườn"
        : scope === "W03"
          ? isEn
            ? "Youth Missions"
            : "Thanh niên Tình nguyện"
          : scope === "W04"
            ? isEn
              ? "Cluster Coordination"
              : "Điều phối cộng đồng"
            : scope === "W05"
              ? isEn
                ? "Co-op & Partner Schedule"
                : "Hợp tác xã & Đối tác"
              : isEn
                ? "Governance Schedule"
                : "Quản trị Hệ thống";

  const handleExportIcs = () => {
    const ics = buildIcsDocument(
      visibleEvents.length > 0 ? visibleEvents : filteredEvents,
      locale,
      `NaiCalendar · ${scopeLabel}`,
    );
    triggerIcsDownload(`naifarm-calendar-${scope.toLowerCase()}.ics`, ics);
    notifySuccess(t.toasts.icsDownloaded);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      notifyError(isEn ? "Please enter an event title." : "Vui lòng nhập tiêu đề sự kiện.");
      return;
    }
    const created: CalendarEvent = {
      id: `CAL-USR-${Date.now()}`,
      title: newTitle.trim(),
      titleEn: newTitle.trim(),
      description: `Sự kiện tạo trong ${scopeLabel}.`,
      descriptionEn: `Scheduled inside ${scopeLabel}.`,
      eventKind: newKind,
      classification: "internal",
      organizer: scopeLabel,
      status: "scheduled",
      startIso: `${newStartDate}T${newStartTime}:00+07:00`,
      endIso: `${newStartDate}T${newEndTime}:00+07:00`,
      allDay: false,
      timezone: "Asia/Ho_Chi_Minh",
      priority: "normal",
      visibility: scope === "public" ? "public" : (scope.toLowerCase() as CalendarEvent["visibility"]),
      farmId: farmIdFilter,
      locationLabel: newLocation.trim() || "Thành phố Đồng Nai",
    };

    const res = upsertCalendarEvent(created);
    if (!res.ok) {
      notifyError(res.message);
      return;
    }
    setNewTitle("");
    setShowCreateForm(false);
    if (res.overlapCount && res.overlapCount > 0) {
      notifyInfo(res.message);
    } else {
      notifySuccess(t.toasts.calendarSaved);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Toolbar */}
      <Card className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
            <h2 className="text-lg font-bold text-[#25352B]">NaiCalendar · {scopeLabel}</h2>
            <Badge tone="neutral">Asia/Ho_Chi_Minh (UTC+7)</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {allowCreate ? (
              <Button
                size="sm"
                variant="primary"
                onClick={() => setShowCreateForm((v) => !v)}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>{showCreateForm ? t.nav.closeButton : t.events.addEventBtn}</span>
              </Button>
            ) : null}
            <Button size="sm" variant="secondary" onClick={handleExportIcs}>
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              <span>{t.events.exportIcsBtn}</span>
            </Button>
          </div>
        </div>

        {/* View Switcher & Filters */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-[auto_auto_minmax(170px,210px)_minmax(180px,1fr)] lg:items-center">
          <div
            role="tablist"
            aria-label={isEn ? "Calendar views" : "Chế độ xem lịch"}
            className="inline-flex rounded-[10px] border border-[#D6DED2] bg-[#FAF8F1] p-0.5"
          >
            {(
              [
                { id: "month", label: t.events.monthView },
                { id: "week", label: t.events.weekView },
                { id: "day", label: t.events.dayView },
                { id: "agenda", label: t.events.agendaView },
              ] as const
            ).map((v) => (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={viewMode === v.id}
                onClick={() => setViewMode(v.id)}
                className={cn(
                  "min-h-[34px] rounded-[8px] px-3 text-xs font-semibold cursor-pointer",
                  viewMode === v.id
                    ? "bg-[#245B3D] text-white"
                    : "text-[#52645A] hover:text-[#25352B]",
                )}
              >
                {v.label}
              </button>
            ))}
          </div>

          {viewMode === "month" ? (
            <div className="inline-flex rounded-[10px] border border-[#D6DED2] bg-white p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setMonthIso("2026-11")}
                className={cn(
                  "min-h-[32px] rounded-[8px] px-2.5 font-semibold cursor-pointer",
                  monthIso === "2026-11" ? "bg-[#EAF0E5] text-[#245B3D]" : "text-[#52645A]",
                )}
              >
                {isEn ? "Nov 2026" : "Tháng 11/2026"}
              </button>
              <button
                type="button"
                onClick={() => setMonthIso("2026-12")}
                className={cn(
                  "min-h-[32px] rounded-[8px] px-2.5 font-semibold cursor-pointer",
                  monthIso === "2026-12" ? "bg-[#EAF0E5] text-[#245B3D]" : "text-[#52645A]",
                )}
              >
                {isEn ? "Dec 2026" : "Tháng 12/2026"}
              </button>
            </div>
          ) : (
            <input
              type="date"
              aria-label={isEn ? "Focus date" : "Chọn ngày"}
              value={selectedDayIso}
              onChange={(e) => setSelectedDayIso(e.target.value)}
              className="min-h-[36px] rounded-[10px] border border-[#C7D2C2] bg-white px-2.5 text-xs"
            />
          )}

          <select
            aria-label={isEn ? "Event type filter" : "Lọc loại sự kiện"}
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as "all" | CalendarEventKind)}
            className="min-h-[36px] rounded-[10px] border border-[#C7D2C2] bg-white px-2.5 text-xs font-semibold"
          >
            <option value="all">{isEn ? "All event types" : "Tất cả loại lịch"}</option>
            <option value="observance">{isEn ? "Official Observances" : "Ngày lễ & Mốc văn hóa"}</option>
            <option value="harvest">{isEn ? "Harvest Schedule" : "Lịch thu hoạch"}</option>
            <option value="live">{isEn ? "OCOP Live" : "Phát sóng OCOP Live"}</option>
            <option value="tour">{isEn ? "Orchard Tours" : "Tour trải nghiệm vườn"}</option>
            <option value="promotion">{isEn ? "Promotions" : "Chương trình ưu đãi"}</option>
            <option value="mission">{isEn ? "Youth Missions" : "Nhiệm vụ thanh niên"}</option>
            <option value="training">{isEn ? "Academy Workshops" : "Tập huấn & Đào tạo"}</option>
          </select>

          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? "Filter calendar events..." : "Lọc sự kiện trên lịch..."}
            className="min-h-[36px] flex-1 min-w-[160px] rounded-[10px] border border-[#C7D2C2] bg-white px-3 text-xs"
          />
        </div>

        {/* Optional Add Event Form */}
        {allowCreate && showCreateForm ? (
          <form
            onSubmit={handleCreateEvent}
            className="grid grid-cols-1 gap-3 rounded-[14px] border border-[#D6DED2] bg-[#FAF8F1] p-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            <div className="sm:col-span-2">
              <label htmlFor="cal-new-title" className="block text-xs font-semibold text-[#25352B]">
                {isEn ? "Title" : "Tiêu đề sự kiện"}
              </label>
              <input
                id="cal-new-title"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={isEn ? "e.g. Morning pomelo packing shift" : "Ví dụ: Ca đóng gói bưởi sáng"}
                className="mt-1 min-h-[40px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
              />
            </div>
            <div>
              <label htmlFor="cal-new-date" className="block text-xs font-semibold text-[#25352B]">
                {isEn ? "Date" : "Ngày"}
              </label>
              <input
                id="cal-new-date"
                type="date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                className="mt-1 min-h-[40px] w-full rounded-[10px] border border-[#788A7B] bg-white px-2.5 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label htmlFor="cal-new-start" className="block text-xs font-semibold text-[#25352B]">
                  {isEn ? "Start" : "Từ"}
                </label>
                <input
                  id="cal-new-start"
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="mt-1 min-h-[40px] w-full rounded-[10px] border border-[#788A7B] bg-white px-2 text-xs"
                />
              </div>
              <div>
                <label htmlFor="cal-new-end" className="block text-xs font-semibold text-[#25352B]">
                  {isEn ? "End" : "Đến"}
                </label>
                <input
                  id="cal-new-end"
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="mt-1 min-h-[40px] w-full rounded-[10px] border border-[#788A7B] bg-white px-2 text-xs"
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <select
                aria-label={isEn ? "Kind" : "Loại"}
                value={newKind}
                onChange={(e) => setNewKind(e.target.value as CalendarEventKind)}
                className="min-h-[40px] flex-1 rounded-[10px] border border-[#788A7B] bg-white px-2 text-xs"
              >
                <option value="harvest">{isEn ? "Harvest" : "Thu hoạch"}</option>
                <option value="live">Live</option>
                <option value="tour">Tour</option>
                <option value="meeting">{isEn ? "Meeting" : "Họp"}</option>
                <option value="inventory_count">{isEn ? "Stock count" : "Kiểm kho"}</option>
              </select>
              <Button type="submit" size="sm" variant="primary">
                {isEn ? "Save" : "Lưu"}
              </Button>
            </div>
            <div className="sm:col-span-2 lg:col-span-5">
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder={isEn ? "Location / Ward" : "Địa điểm / Phường xã"}
                className="min-h-[38px] w-full rounded-[10px] border border-[#C7D2C2] bg-white px-3 text-xs"
              />
            </div>
          </form>
        ) : null}
      </Card>

      {/* Deduplicated In-App Reminders (D-30/14/7/3/1) */}
      {reminders.length > 0 ? (
        <Card className="border-[#D7A34D]/60 bg-[#FFFDF7] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#25352B]">
              <Bell className="h-4 w-4 text-[#80520C]" aria-hidden="true" />
              <span>{t.events.remindersHeading}</span>
            </h3>
            <span className="text-[11px] text-[#52645A]">
              {formatVnDateTime(activeClockIso, locale)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#52645A]">{t.events.appOpenReminderDisclaimer}</p>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            {reminders.map((rem) => (
              <div
                key={rem.dedupeKey}
                className="flex items-center justify-between gap-2 rounded-[10px] border border-[#D6DED2] bg-white px-3 py-2 text-xs"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#25352B]">
                    {isEn ? rem.titleEn : rem.titleVi}
                  </p>
                  <p className="text-[11px] text-[#52645A]">{formatVnDate(rem.eventDateIso, locale)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => dismissReminder(rem.dedupeKey)}
                  aria-label={isEn ? "Dismiss reminder" : "Ẩn nhắc lịch"}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#52645A] hover:bg-[#F5F3E9] cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Month Grid Preview when viewMode === 'month' */}
      {viewMode === "month" ? (
        <Card className="p-4">
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-[#52645A]">
            {(isEn
              ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
              : ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
            ).map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {monthDays.map((dayIso) => {
              const dayEvents = filteredEvents.filter((ev) => {
                const startDay = getVnDateIso(ev.startIso);
                const endDay = getVnDateIso(ev.endIso);
                return dayIso >= startDay && dayIso <= endDay;
              });
              const isToday = dayIso === getVnDateIso(activeClockIso);
              const isSelected = dayIso === selectedDayIso;
              return (
                <button
                  key={dayIso}
                  type="button"
                  onClick={() => {
                    setSelectedDayIso(dayIso);
                    setViewMode("day");
                  }}
                  className={cn(
                    "min-h-[68px] rounded-[10px] border p-1.5 text-left transition cursor-pointer",
                    isSelected
                      ? "border-[#245B3D] bg-[#EAF0E5]"
                      : isToday
                      ? "border-[#D7A34D] bg-[#FFF2D8]/50"
                      : "border-[#EAEFE6] bg-[#FAF8F1]/60 hover:bg-[#EAF0E5]/50",
                  )}
                >
                  <span className="text-[11px] font-bold text-[#25352B] tabular-nums">
                    {Number(dayIso.slice(-2))}
                  </span>
                  {dayEvents.slice(0, 2).map((ev) => (
                    <span
                      key={`${dayIso}-${ev.id}`}
                      className="mt-0.5 block truncate rounded bg-white px-1 text-[10px] font-medium text-[#245B3D]"
                    >
                      {isEn ? ev.titleEn : ev.title}
                    </span>
                  ))}
                  {dayEvents.length > 2 ? (
                    <span className="mt-0.5 block text-[10px] font-semibold text-[#80520C]">
                      +{dayEvents.length - 2}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </Card>
      ) : null}

      {/* Event List (Always displayed below Month or standalone in Week/Day/Agenda) */}
      <div className="space-y-2.5">
        {visibleEvents.length === 0 ? (
          <Card className="p-6 text-center text-sm text-[#52645A]">
            {isEn
              ? "No scheduled items match the current date/filter."
              : "Chưa có sự kiện nào khớp bộ lọc hoặc ngày đang chọn."}
          </Card>
        ) : (
          visibleEvents.map((ev) => (
            <Card
              key={ev.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={ev.isOfficialReadOnly ? "gold" : "info"}>
                    {ev.eventKind.replace("_", " ")}
                  </Badge>
                  {ev.isOfficialReadOnly ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#80520C]">
                      <Lock className="h-3 w-3" aria-hidden="true" />
                      {t.events.officialReadOnlyTag}
                    </span>
                  ) : null}
                  <span className="text-xs font-medium text-[#52645A]">
                    <Clock className="mr-1 inline h-3.5 w-3.5 text-[#245B3D]" aria-hidden="true" />
                    {ev.allDay
                      ? formatVnDate(ev.startIso, locale)
                      : formatVnDateTime(ev.startIso, locale)}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#25352B]">
                  {isEn ? ev.titleEn : ev.title}
                </h3>
                <p className="text-xs text-[#52645A]">
                  {isEn ? ev.descriptionEn : ev.description}
                  {ev.locationLabel ? ` · ${ev.locationLabel}` : ""}
                </p>
              </div>

              {ev.linkedRoute ? (
                <Link
                  href={buildLocalizedHref(ev.linkedRoute, locale)}
                  className="inline-flex min-h-[36px] shrink-0 items-center rounded-[10px] border border-[#245B3D] bg-white px-3 text-xs font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
                >
                  {isEn ? "Open →" : "Mở →"}
                </Link>
              ) : null}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
