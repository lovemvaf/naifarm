"use client";

import { toast } from "sonner";
import type { Locale } from "@/types/naifarm";

/**
 * Centralized toast notifications with consistent, bounded durations.
 * Always clears lingering auth/status toasts before sign-out or account switches
 * so rapid transitions never stack or linger past 1.8s.
 */
export function notifySignOut(locale: Locale = "vi") {
  toast.dismiss();
  toast.info(locale === "en" ? "Signed out" : "Đã đăng xuất", {
    id: "auth-signout",
    duration: 1300,
  });
}

export function notifyAccountSwitch(roleLabel: string, locale: Locale = "vi") {
  toast.dismiss();
  toast.info(locale === "en" ? `Switched to ${roleLabel}` : `Đã chuyển sang ${roleLabel}`, {
    id: "auth-switch",
    duration: 1500,
  });
}

export function notifySuccess(message: string) {
  toast.success(message, {
    duration: 1800,
  });
}

export function notifyInfo(message: string) {
  toast.info(message, {
    duration: 2400,
  });
}

export function notifyError(message: string) {
  toast.error(message, {
    duration: 4200,
  });
}
