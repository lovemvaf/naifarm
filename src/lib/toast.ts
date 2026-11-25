"use client";

import { toast } from "sonner";

/**
 * Centralized toast notifications with consistent, bounded durations.
 * Always clears lingering auth/status toasts before sign-out or account switches
 * so rapid transitions never stack or linger past 1.8s.
 */
export function notifySignOut() {
  toast.dismiss();
  toast.info("Đã đăng xuất", {
    id: "auth-signout",
    duration: 1300,
  });
}

export function notifyAccountSwitch(roleLabel: string) {
  toast.dismiss();
  toast.info(`Đã chuyển sang ${roleLabel}`, {
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
    duration: 4500,
  });
}
