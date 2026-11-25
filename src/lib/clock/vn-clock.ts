import type { CalendarEvent, Locale } from "@/types/naifarm";

/**
 * Shared Asia/Ho_Chi_Minh (UTC+7) clock adapter for NaiFarm.
 * Deterministic fallback avoids SSR/client hydration drift while allowing
 * test verification of ended / active / scheduled campaigns without hardcoding.
 */
export const VN_TIMEZONE = "Asia/Ho_Chi_Minh";
export const VN_OFFSET_SUFFIX = "+07:00";
export const DEFAULT_CLOCK_ISO = "2026-11-25T12:00:00+07:00";

export function getActiveClockIso(overrideIso?: string | null): string {
  if (overrideIso && !Number.isNaN(Date.parse(overrideIso))) {
    return overrideIso;
  }
  return DEFAULT_CLOCK_ISO;
}

export function toVnDateParts(isoOrDate: string): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  dateIso: string;
} {
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrDate)) {
    const [year, month, day] = isoOrDate.split("-").map(Number);
    return { year, month, day, hour: 0, minute: 0, dateIso: isoOrDate };
  }
  const ts = Date.parse(isoOrDate);
  if (Number.isNaN(ts)) {
    return { year: 2026, month: 11, day: 25, hour: 12, minute: 0, dateIso: "2026-11-25" };
  }
  // Convert to UTC+7 wall clock reliably regardless of host OS timezone
  const vnMs = ts + 7 * 60 * 60 * 1000;
  const d = new Date(vnMs);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const hour = d.getUTCHours();
  const minute = d.getUTCMinutes();
  const dateIso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return { year, month, day, hour, minute, dateIso };
}

export function getVnDateIso(isoOrDate: string): string {
  return toVnDateParts(isoOrDate).dateIso;
}

export function compareVnIso(a: string, b: string): number {
  const ta = Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(a) ? `${a}T00:00:00+07:00` : a);
  const tb = Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(b) ? `${b}T00:00:00+07:00` : b);
  return ta - tb;
}

export function daysBetweenVn(fromDateOrIso: string, toDateOrIso: string): number {
  const p1 = toVnDateParts(fromDateOrIso);
  const p2 = toVnDateParts(toDateOrIso);
  const ms1 = Date.UTC(p1.year, p1.month - 1, p1.day);
  const ms2 = Date.UTC(p2.year, p2.month - 1, p2.day);
  return Math.round((ms2 - ms1) / (1000 * 60 * 60 * 24));
}

export function formatVnDate(isoOrDate: string, locale: Locale = "vi"): string {
  const { year, month, day } = toVnDateParts(isoOrDate);
  const dd = String(day).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  if (locale === "en") {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[month - 1]} ${day}, ${year}`;
  }
  return `${dd}/${mm}/${year}`;
}

export function formatVnDateTime(iso: string, locale: Locale = "vi"): string {
  const { year, month, day, hour, minute } = toVnDateParts(iso);
  const dd = String(day).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  const hh = String(hour).padStart(2, "0");
  const mi = String(minute).padStart(2, "0");
  if (locale === "en") {
    return `${formatVnDate(iso, "en")}, ${hh}:${mi} ICT (UTC+7)`;
  }
  return `${hh}:${mi} · ${dd}/${mm}/${year} (GMT+7)`;
}

export function isClockInWindow(clockIso: string, startIso: string, endIso: string): boolean {
  const t = Date.parse(clockIso);
  const s = Date.parse(startIso);
  const e = Date.parse(endIso);
  if (Number.isNaN(t) || Number.isNaN(s) || Number.isNaN(e)) return false;
  return t >= s && t <= e;
}

export function formatCountdownRemaining(clockIso: string, targetIso: string, locale: Locale): string {
  const diffMs = Date.parse(targetIso) - Date.parse(clockIso);
  if (Number.isNaN(diffMs) || diffMs <= 0) {
    return locale === "en" ? "Ended" : "Đã kết thúc";
  }
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (locale === "en") {
    if (days > 0) return `${days}d ${hours}h left (UTC+7)`;
    return `${hours}h ${minutes}m left`;
  }
  if (days > 0) return `Còn ${days} ngày ${hours} giờ`;
  return `Còn ${hours} giờ ${minutes} phút`;
}

function escapeIcsText(val: string): string {
  return val
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function toIcsUtcStamp(iso: string): string {
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return "20261125T050000Z";
  const d = new Date(ts);
  return (
    d.getUTCFullYear() +
    String(d.getUTCMonth() + 1).padStart(2, "0") +
    String(d.getUTCDate()).padStart(2, "0") +
    "T" +
    String(d.getUTCHours()).padStart(2, "0") +
    String(d.getUTCMinutes()).padStart(2, "0") +
    String(d.getUTCSeconds()).padStart(2, "0") +
    "Z"
  );
}

/**
 * Generates an RFC 5545 compliant .ics calendar export with explicit Asia/Ho_Chi_Minh timezone awareness.
 */
export function buildIcsDocument(
  events: CalendarEvent[],
  locale: Locale = "vi",
  calendarTitle = "NaiCalendar — Dong Nai OCOP & Agritourism",
): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NaiFarm//NaiCalendar V4.0//VI",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeIcsText(calendarTitle)}`,
    `X-WR-TIMEZONE:${VN_TIMEZONE}`,
  ];

  for (const ev of events) {
    const title = locale === "en" ? ev.titleEn || ev.title : ev.title;
    const desc = locale === "en" ? ev.descriptionEn || ev.description : ev.description;
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${ev.id}@naifarm.local`);
    lines.push(`DTSTAMP:${toIcsUtcStamp(DEFAULT_CLOCK_ISO)}`);
    if (ev.allDay) {
      const startDay = getVnDateIso(ev.startIso).replace(/-/g, "");
      const endParts = toVnDateParts(ev.endIso);
      const nextDay = new Date(Date.UTC(endParts.year, endParts.month - 1, endParts.day + 1));
      const endDay =
        nextDay.getUTCFullYear() +
        String(nextDay.getUTCMonth() + 1).padStart(2, "0") +
        String(nextDay.getUTCDate()).padStart(2, "0");
      lines.push(`DTSTART;VALUE=DATE:${startDay}`);
      lines.push(`DTEND;VALUE=DATE:${endDay}`);
    } else {
      lines.push(`DTSTART:${toIcsUtcStamp(ev.startIso)}`);
      lines.push(`DTEND:${toIcsUtcStamp(ev.endIso)}`);
    }
    lines.push(`SUMMARY:${escapeIcsText(title)}`);
    lines.push(`DESCRIPTION:${escapeIcsText(desc)}`);
    if (ev.locationLabel) {
      lines.push(`LOCATION:${escapeIcsText(ev.locationLabel)}`);
    }
    lines.push(`STATUS:${ev.status === "cancelled" ? "CANCELLED" : "CONFIRMED"}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function triggerIcsDownload(filename: string, icsContent: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
