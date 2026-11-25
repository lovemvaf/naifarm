export interface MuseProviderStatus {
  name: "muse2api";
  enabled: boolean;
  status: "disabled_manual_login_required" | "ready" | "error";
  note: string;
}

export interface MuseClipRequest {
  jobId: string;
  prompt: string;
  aspectRatio: "9:16" | "16:9" | "1:1";
  timeoutMs?: number;
}

export interface MuseClipResult {
  usedAi: boolean;
  clipPaths: string[];
  note: string;
}

function isAllowedMuseBaseUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:" && parsed.hostname !== "127.0.0.1" && parsed.hostname !== "localhost") {
      return false;
    }
    const blockedHosts = new Set(["169.254.169.254", "0.0.0.0", "::1"]);
    if (blockedHosts.has(parsed.hostname)) return false;
    return parsed.hostname.endsWith("muse.video") || parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";
  } catch {
    return false;
  }
}

export function getMuseProviderStatus(): MuseProviderStatus {
  const aiEnabled = process.env.VIDEO_AI_ENABLED === "true";
  if (!aiEnabled) {
    return {
      name: "muse2api",
      enabled: false,
      status: "disabled_manual_login_required",
      note: "Muse2API đang tắt (chờ chủ dự án đăng nhập thủ công trên máy cục bộ). Studio tự động dùng FFmpeg Fast Render ổn định.",
    };
  }

  const baseUrl = process.env.MUSE_BASE_URL || "";
  if (!baseUrl || !isAllowedMuseBaseUrl(baseUrl)) {
    return {
      name: "muse2api",
      enabled: false,
      status: "error",
      note: "MUSE_BASE_URL chưa hợp lệ hoặc chưa nằm trong danh sách tên miền an toàn.",
    };
  }

  return {
    name: "muse2api",
    enabled: true,
    status: "ready",
    note: "Muse2API đã bật trên máy cục bộ.",
  };
}

export async function tryGenerateMuseClips(req: MuseClipRequest): Promise<MuseClipResult> {
  const status = getMuseProviderStatus();
  if (!status.enabled || status.status !== "ready") {
    return {
      usedAi: false,
      clipPaths: [],
      note: status.note,
    };
  }

  // Scaffold for future manual-login session: never auto-bypass CAPTCHA, cookies, or login prompts.
  const baseUrl = process.env.MUSE_BASE_URL!;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.max(5000, req.timeoutMs ?? 25000));

  try {
    const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/health`, {
      method: "GET",
      signal: controller.signal,
    });
    if (!res.ok) {
      return {
        usedAi: false,
        clipPaths: [],
        note: `Muse endpoint trả HTTP ${res.status}; chuyển dự phòng về FFmpeg Fast Render.`,
      };
    }
    return {
      usedAi: false,
      clipPaths: [],
      note: "Muse endpoint sẵn sàng nhưng phiên kết xuất clip chưa kích hoạt credential; dùng FFmpeg Fast Render.",
    };
  } catch (err) {
    return {
      usedAi: false,
      clipPaths: [],
      note: `Muse timeout/offline (${err instanceof Error ? err.message : "unknown"}); chuyển dự phòng an toàn về FFmpeg Fast Render.`,
    };
  } finally {
    clearTimeout(timeout);
  }
}
