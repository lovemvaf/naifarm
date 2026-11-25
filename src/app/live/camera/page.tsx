"use client";

import { useEffect, useRef, useState } from "react";
import { LocalVideoTrack, Room, RoomEvent, Track, VideoPresets, createLocalVideoTrack } from "livekit-client";
import { Button, Card } from "@/components/ui/Primitives";
import { liveFetch, type LiveConnection } from "@/lib/live/client";

function captureOptions(facingMode: "environment" | "user") {
  return { facingMode, resolution: VideoPresets.h720.resolution };
}

function cameraError(error: unknown) {
  if (error instanceof DOMException) {
    if (["NotAllowedError", "SecurityError"].includes(error.name)) return "Bạn chưa cấp quyền camera. Hãy cho phép camera cho trang này trong Safari hoặc Chrome rồi thử lại.";
    if (error.name === "NotFoundError") return "Không tìm thấy camera trên điện thoại này.";
    if (["NotReadableError", "AbortError"].includes(error.name)) return "Camera đang được ứng dụng khác sử dụng. Hãy đóng ứng dụng đó rồi thử lại.";
    if (error.name === "OverconstrainedError") return "Không mở được góc camera này. Hãy thử đổi camera trước/sau.";
  }
  return error instanceof Error ? error.message : "Không thể mở camera.";
}

export default function LiveCameraPage() {
  const code = useRef("");
  const content = useRef<HTMLVideoElement>(null);
  const room = useRef<Room | null>(null);
  const track = useRef<LocalVideoTrack | null>(null);
  const mounted = useRef(false);
  const [valid, setValid] = useState(false);
  const [stage, setStage] = useState<"idle" | "preview" | "live" | "ended">("idle");
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    mounted.current = true;
    const params = new URLSearchParams(location.hash.slice(1));
    if (params.has("code")) {
      code.current = params.get("code") ?? "";
      history.replaceState(history.state, "", location.pathname + location.search);
    }
    queueMicrotask(() => { if (mounted.current) setValid(!!code.current); });
    const disconnect = () => {
      track.current?.stop();
      void room.current?.disconnect();
    };
    window.addEventListener("pagehide", disconnect);
    return () => {
      mounted.current = false;
      window.removeEventListener("pagehide", disconnect);
      disconnect();
    };
  }, []);

  async function run(work: () => Promise<void>) {
    setBusy(true);
    setError("");
    try { await work(); }
    catch (error) { setError(cameraError(error)); }
    finally { setBusy(false); }
  }

  async function preview() {
    if (!navigator.mediaDevices) throw new Error("Mở liên kết bằng HTTPS để dùng camera trên điện thoại.");
    const camera = await createLocalVideoTrack(captureOptions(facing));
    if (!mounted.current) { camera.stop(); return; }
    track.current = camera;
    if (content.current) camera.attach(content.current);
    setStage("preview");
  }

  async function publish() {
    if (!track.current || !code.current) return;
    const client = new Room({ dynacast: true, publishDefaults: { videoEncoding: { maxBitrate: 1_200_000, maxFramerate: 24 } } });
    room.current = client;
    client.on(RoomEvent.Disconnected, () => {
      track.current?.stop();
      if (mounted.current) setStage("ended");
    });
    try {
      const pairingCode = code.current;
      code.current = "";
      const connection = await liveFetch<LiveConnection>("/cameras/redeem", { method: "POST", body: JSON.stringify({ code: pairingCode }) });
      if (!mounted.current) return;
      await client.connect(connection.url, connection.token, { autoSubscribe: false });
      if (!mounted.current) { await client.disconnect(); return; }
      await client.localParticipant.publishTrack(track.current, { source: Track.Source.Camera });
      setStage("live");
    } catch (error) {
      await client.disconnect();
      track.current?.stop();
      setStage("ended");
      throw error;
    }
  }

  return <section className="mx-auto max-w-xl px-4 py-8">
    <Card className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Camera phụ tại vườn</h1>
      <video ref={content} muted autoPlay playsInline className="aspect-video w-full rounded-xl bg-[#25352B] object-contain" />
      <p role="status">{stage === "live" ? "Đang phát video từ điện thoại." : stage === "ended" ? "Camera đã ngắt. Hãy xin chủ phiên ghép lại nếu cần." : valid ? "Kiểm tra góc máy trước khi phát." : "Quét QR do chủ phiên cung cấp."}</p>
      {error && <p role="alert" className="text-red-800">{error}</p>}
      {valid && <div className="flex flex-wrap gap-2">
        {stage === "idle" && <Button disabled={busy} onClick={() => void run(preview)}>Cho phép và xem trước</Button>}
        {stage === "preview" && <Button disabled={busy} onClick={() => void run(publish)}>Phát camera phụ</Button>}
        {(stage === "preview" || stage === "live") && <Button variant="secondary" disabled={busy} onClick={() => void run(async () => {
          const next = facing === "environment" ? "user" : "environment";
          await track.current?.restartTrack(captureOptions(next));
          setFacing(next);
        })}>Đổi camera trước/sau</Button>}
        {stage === "live" && <Button variant="secondary" disabled={busy} onClick={() => void room.current?.disconnect()}>Ngắt camera</Button>}
      </div>}
    </Card>
  </section>;
}
