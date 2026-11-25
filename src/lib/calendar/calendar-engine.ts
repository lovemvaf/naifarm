import { daysBetweenVn, getVnDateIso } from "@/lib/clock/vn-clock";
import type {
  CalendarEvent,
  CalendarEventKind,
  CalendarVisibility,
  WorkspaceId,
} from "@/types/naifarm";

const WORKSPACE_TO_VISIBILITY: Record<WorkspaceId, CalendarVisibility[]> = {
  W01: ["public"],
  W02: ["public", "w02"],
  W03: ["public", "w03"],
  W04: ["public", "w02", "w03", "w04"],
  W05: ["public", "w05"],
  W06: ["public", "w02", "w03", "w04", "w05", "w06"],
};

export interface CalendarFilterOptions {
  workspaceScope: WorkspaceId | "public";
  kindFilter?: "all" | CalendarEventKind;
  farmIdFilter?: string;
  monthIso?: string; // e.g. "2026-11" or "2026-12"
  searchQuery?: string;
}

export function filterCalendarEvents(
  events: CalendarEvent[],
  opts: CalendarFilterOptions,
): CalendarEvent[] {
  const allowedVis =
    opts.workspaceScope === "public"
      ? (["public"] as CalendarVisibility[])
      : WORKSPACE_TO_VISIBILITY[opts.workspaceScope];
  const q = (opts.searchQuery ?? "").trim().toLowerCase();

  return events
    .filter((ev) => {
      if (!allowedVis.includes(ev.visibility)) return false;
      if (opts.kindFilter && opts.kindFilter !== "all" && ev.eventKind !== opts.kindFilter) {
        return false;
      }
      if (opts.farmIdFilter && opts.farmIdFilter !== "all" && ev.farmId && ev.farmId !== opts.farmIdFilter) {
        return false;
      }
      if (opts.monthIso) {
        const startDay = getVnDateIso(ev.startIso);
        const endDay = getVnDateIso(ev.endIso);
        if (!startDay.startsWith(opts.monthIso) && !endDay.startsWith(opts.monthIso)) {
          return false;
        }
      }
      if (q) {
        const hay = `${ev.title} ${ev.titleEn} ${ev.organizer} ${ev.locationLabel ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => Date.parse(a.startIso) - Date.parse(b.startIso));
}

export function detectCalendarOverlap(
  existingEvents: CalendarEvent[],
  candidate: Pick<CalendarEvent, "id" | "startIso" | "endIso" | "allDay" | "farmId" | "assignedTo">,
): CalendarEvent[] {
  if (candidate.allDay) return [];
  const candStart = Date.parse(candidate.startIso);
  const candEnd = Date.parse(candidate.endIso);
  if (Number.isNaN(candStart) || Number.isNaN(candEnd)) return [];

  return existingEvents.filter((ev) => {
    if (ev.id === candidate.id || ev.allDay || ev.status === "cancelled") return false;
    const sameResource =
      (candidate.farmId && ev.farmId === candidate.farmId) ||
      (candidate.assignedTo && ev.assignedTo === candidate.assignedTo);
    if (!sameResource) return false;
    const evStart = Date.parse(ev.startIso);
    const evEnd = Date.parse(ev.endIso);
    return candStart < evEnd && candEnd > evStart;
  });
}

export const REMINDER_OFFSETS = [30, 14, 7, 3, 1] as const;

export interface ComputedReminder {
  dedupeKey: string;
  eventId: string;
  offsetDays: number;
  recipientKey: string;
  titleVi: string;
  titleEn: string;
  eventDateIso: string;
  linkedRoute?: string;
}

/**
 * Computes deduplicated in-app reminders at D-30, D-14, D-7, D-3, D-1 relative to Asia/Ho_Chi_Minh clock.
 */
export function generateDedupedReminders(
  events: CalendarEvent[],
  clockIso: string,
  recipientKey: string,
  dismissedKeys: string[] = [],
): ComputedReminder[] {
  const seen = new Set<string>(dismissedKeys);
  const reminders: ComputedReminder[] = [];

  for (const ev of events) {
    if (ev.status === "cancelled" || ev.status === "completed") continue;
    const diff = daysBetweenVn(clockIso, ev.startIso);
    if (diff < 0 || diff > 30) continue;

    // Pick closest active threshold bucket (e.g., diff=10 -> D-14; diff=7 -> D-7; diff=1 -> D-1)
    const matchedOffset = REMINDER_OFFSETS.find((off) => diff <= off && diff >= (off === 30 ? 15 : off === 14 ? 8 : off === 7 ? 4 : off === 3 ? 2 : 0))
      ?? (diff === 0 ? 1 : undefined);
    if (!matchedOffset) continue;

    const dedupeKey = `${ev.id}+D-${matchedOffset}+${recipientKey}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    reminders.push({
      dedupeKey,
      eventId: ev.id,
      offsetDays: matchedOffset,
      recipientKey,
      titleVi: `Còn ${diff} ngày (Mốc D-${matchedOffset}): ${ev.title}`,
      titleEn: `In ${diff} day(s) (D-${matchedOffset}): ${ev.titleEn}`,
      eventDateIso: getVnDateIso(ev.startIso),
      linkedRoute: ev.linkedRoute,
    });
  }

  return reminders.sort((a, b) => a.eventDateIso.localeCompare(b.eventDateIso));
}
