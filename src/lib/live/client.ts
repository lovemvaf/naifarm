"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

export type LiveSession = {
  id: string; farm_id: string; title: string; description: string; scheduled_at: string | null; host_name?: string | null;
  status: string; product_ids: string[]; pinned_product_id: string | null; selected_camera_identity: string | null; revision: number; room_ready: boolean; started_at: string | null;
};
export type LiveMessage = { id: string; sender_name: string; body: string; created_at: string; is_host: boolean };
export type LiveConnection = { url: string; token: string };

export const active = (status: string) => ["starting", "live", "reconnecting"].includes(status);

export async function liveFetch<T>(path: string, options?: RequestInit, token?: string): Promise<T> {
  const headers = new Headers(options?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options?.body) headers.set("Content-Type", "application/json");
  const response = await fetch(`/api/live${path}`, { ...options, headers, cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Không thể kết nối livestream.");
  return result;
}

let connection: Promise<{ auth: SupabaseClient; events: SupabaseClient }> | undefined;
export function liveClients() {
  return connection ??= liveFetch<{ url: string; key: string }>("/config").then(({ url, key }) => ({
    auth: createClient(url, key, { auth: { storageKey: "naifarm-live-pilot" } }),
    events: createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }),
  })).catch((error) => { connection = undefined; throw error; });
}

export function useLiveAuth() {
  const [token, setToken] = useState("");
  const [authError, setError] = useState("");
  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;
    void liveClients().then(({ auth }) => {
      if (!mounted) return;
      const { data } = auth.auth.onAuthStateChange((_event, session) => setToken(session?.access_token ?? ""));
      unsubscribe = () => data.subscription.unsubscribe();
    }).catch((error) => { if (mounted) setError(error.message); });
    return () => { mounted = false; unsubscribe?.(); };
  }, []);
  return { token, authError };
}

export function useLiveData<T>(path: string | null, sessionId?: string, token?: string) {
  const [snapshot, setSnapshot] = useState<{ path: string; token?: string; data?: T; error?: string }>();
  const [attempt, setAttempt] = useState(0);
  const [realtimeError, setRealtimeError] = useState("");
  const refresh = useCallback(() => setAttempt((value) => value + 1), []);
  useEffect(() => {
    if (path === null) return;
    const controller = new AbortController();
    let current = 0;
    let disconnect: (() => void) | undefined;
    const revisions = new Map<string, unknown>();
    function load() {
      if (controller.signal.aborted || path === null) return;
      const request = ++current;
      void liveFetch<T>(path, { signal: controller.signal }, token).then((data) => {
        if (!controller.signal.aborted && current === request) setSnapshot({ path, token, data });
      }).catch((error) => {
        if (!controller.signal.aborted && current === request) setSnapshot((previous) => ({
          path, token, error: error.message, data: previous?.path === path && previous?.token === token ? previous?.data : undefined,
        }));
      });
    }
    load();
    const restore = () => { if (document.visibilityState === "visible") load(); };
    document.addEventListener("visibilitychange", restore);
    window.addEventListener("online", load);
    void liveClients().then(({ events }) => {
      if (controller.signal.aborted) return;
      const channel = events.channel(`naifarm-live-${crypto.randomUUID()}`).on("postgres_changes", {
        event: "*", schema: "public", table: "live_updates", ...(sessionId ? { filter: `session_id=eq.${sessionId}` } : {}),
      }, (event) => {
        if (!sessionId && event.eventType === "UPDATE") {
          const { session_id: changedId, session_revision: revision } = event.new;
          if (revisions.get(changedId) === revision) return;
          revisions.set(changedId, revision);
        }
        load();
      }).subscribe((status) => {
        if (controller.signal.aborted) return;
        if (status === "SUBSCRIBED") { revisions.clear(); setRealtimeError(""); load(); }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setRealtimeError("Đồng bộ trực tiếp bị gián đoạn. Đang thử kết nối lại.");
      });
      disconnect = () => { void events.removeChannel(channel); };
    }).catch(() => undefined);
    return () => {
      controller.abort();
      disconnect?.();
      document.removeEventListener("visibilitychange", restore);
      window.removeEventListener("online", load);
    };
  }, [path, sessionId, token, attempt]);
  const value = snapshot?.path === path && snapshot?.token === token ? snapshot : undefined;
  return { data: value?.data, error: value?.error, realtimeError, refresh };
}
