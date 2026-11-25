import type { Locale } from "@/types/naifarm";

const ALLOWED_LOCAL_PREFIXES = [
  "/",
  "/marketplace",
  "/market",
  "/products",
  "/farms",
  "/explore",
  "/experiences",
  "/live",
  "/learn",
  "/events",
  "/trace",
  "/search",
  "/quality",
  "/policies",
  "/cart",
  "/checkout",
  "/account",
  "/farmer",
  "/volunteer",
  "/coordinator",
  "/organization",
  "/admin",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/demo",
];

/**
 * Sanitizes a returnTo destination against a strict internal route allowlist.
 * Blocks protocol-relative (//), external origins (http/https), javascript:, data:, and control chars.
 */
export function sanitizeReturnTo(raw: string | null | undefined, fallback = "/"): string {
  if (!raw) return fallback;
  let decoded = raw.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    return fallback;
  }
  if (
    !decoded.startsWith("/") ||
    decoded.startsWith("//") ||
    decoded.startsWith("/\\") ||
    /[\x00-\x1f]/.test(decoded) ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(decoded)
  ) {
    return fallback;
  }
  const pathOnly = decoded.split("?")[0].split("#")[0];
  const allowed = ALLOWED_LOCAL_PREFIXES.some((prefix) =>
    prefix === "/" ? pathOnly === "/" : pathOnly === prefix || pathOnly.startsWith(`${prefix}/`),
  );
  return allowed ? decoded : fallback;
}

/**
 * Builds a clean internal link preserving active locale (?lang=en when EN, clean when VI)
 * and merging any additional query parameters.
 */
export function buildLocalizedHref(
  basePath: string,
  locale: Locale,
  extraParams?: Record<string, string | undefined | null>,
): string {
  const [rawPath, existingQuery = ""] = basePath.split("?");
  const [pathOnly, hashPart] = rawPath.split("#");
  const params = new URLSearchParams(existingQuery);

  if (extraParams) {
    for (const [k, v] of Object.entries(extraParams)) {
      if (v === undefined || v === null || v === "") {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    }
  }

  if (locale === "en") {
    params.set("lang", "en");
  } else {
    params.delete("lang");
  }

  const qs = params.toString();
  const hash = hashPart ? `#${hashPart}` : "";
  return `${pathOnly}${qs ? `?${qs}` : ""}${hash}`;
}

export interface RoomSessionState {
  tab?: string;
  angleIndex?: number;
  scrollY?: number;
}

const SESSION_PREFIX = "naifarm_room_state_v4:";

export function saveRoomSessionState(roomKey: string, state: RoomSessionState) {
  if (typeof window === "undefined") return;
  try {
    const existing = loadRoomSessionState(roomKey) ?? {};
    window.sessionStorage.setItem(
      `${SESSION_PREFIX}${roomKey}`,
      JSON.stringify({ ...existing, ...state }),
    );
  } catch {
    // Ignore storage quota / private mode failures
  }
}

export function loadRoomSessionState(roomKey: string): RoomSessionState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(`${SESSION_PREFIX}${roomKey}`);
    if (!raw) return null;
    return JSON.parse(raw) as RoomSessionState;
  } catch {
    return null;
  }
}
