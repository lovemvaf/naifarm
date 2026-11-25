"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { createAudioAnalyser, createLocalAudioTrack } from "livekit-client";
import { LiveKitStage } from "../LiveKitStage";
import { LiveChat } from "../LiveChat";
import { INITIAL_FARMS } from "@/data/demo/farms";
import { INITIAL_PRODUCTS } from "@/data/demo/products";
import { Button, Card } from "@/components/ui/Primitives";
import { active, liveFetch, useLiveAuth, useLiveData, type LiveSession } from "@/lib/live/client";

const field = "w-full rounded-lg border border-[#D6DED2] p-2";
const inputKinds = ["videoinput", "audioinput"] as const;
type InputKind = (typeof inputKinds)[number];
const timeslot = (value: string | null) => value ? new Date(Date.parse(value) + 7 * 3600_000).toISOString().slice(0, 16) : "";
const statusText: Record<string, string> = { scheduled: "Đã lên lịch", starting: "Đang mở phòng", live: "Đang phát", reconnecting: "Đang kết nối lại", ended: "Đã kết thúc", cancelled: "Đã hủy" };

function ElapsedTime({ startedAt }: { startedAt: string }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const seconds = Math.max(0, Math.floor((now - Date.parse(startedAt)) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) % 60;
  const time = [hours, minutes, seconds % 60].map((part) => String(part).padStart(2, "0")).join(":");
  return <p className="text-sm tabular-nums">Thời gian phát · {time}</p>;
}

function ScheduleForm({ farms, session, onSave, busy }: {
  farms: string[]; session?: LiveSession; onSave: (data: object) => void; busy: boolean;
}) {
  const [farm, setFarm] = useState(session?.farm_id ?? farms[0] ?? "");
  return <form className="grid gap-3" onSubmit={(event) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const time = String(values.get("time") ?? "");
    onSave({
      farmId: farm, title: values.get("title"), description: values.get("description"),
      scheduledAt: time ? new Date(`${time}:00+07:00`).toISOString() : null, productIds: values.getAll("products"),
    });
  }}>
    <label>Nhà vườn<select className={field} disabled={!!session} value={farm} onChange={(event) => setFarm(event.target.value)} required>
      <option value="">Chọn nhà vườn</option>
      {INITIAL_FARMS.filter((item) => farms.includes(item.id)).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
    </select></label>
    <label>Tiêu đề<input name="title" className={field} required minLength={3} maxLength={140} defaultValue={session?.title} /></label>
    <label>Mô tả<textarea name="description" className={field} maxLength={2000} defaultValue={session?.description} /></label>
    <label>Thời gian phát (giờ Việt Nam)<input name="time" className={field} type="datetime-local" defaultValue={timeslot(session?.scheduled_at ?? null)} /></label>
    <fieldset key={farm} className="space-y-1"><legend>Sản phẩm giới thiệu</legend>
      {INITIAL_PRODUCTS.filter((item) => item.farmId === farm).map((item) => <label key={item.id} className="block text-sm">
        <input type="checkbox" name="products" value={item.id} defaultChecked={session?.product_ids.includes(item.id)} /> {item.name}
      </label>)}
    </fieldset>
    <Button type="submit" disabled={busy || !farm}>{session ? "Lưu lịch" : "Tạo lịch"}</Button>
  </form>;
}

export function LiveStudio({ sessionId }: { sessionId?: string }) {
  const router = useRouter();
  const { token, authError } = useLiveAuth();
  const { data, error, realtimeError, refresh } = useLiveData<{ sessions: LiveSession[]; farms: string[] }>(token ? "?studio=1" : null, undefined, token);
  const session = data?.sessions.find((item) => item.id === sessionId);
  const selectedLiveProducts = INITIAL_PRODUCTS.filter((item) => session?.product_ids.includes(item.id));
  const mockLiveProducts = selectedLiveProducts.length >= 3 ? selectedLiveProducts : INITIAL_PRODUCTS.slice(0, 8);
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const [pairing, setPairing] = useState<{ id: string; url: string; expiresAt: string }>();
  const [publishing, setPublishing] = useState("");
  const [preview, setPreview] = useState(false);
  const [checkingMic, setCheckingMic] = useState(false);
  const [mockEngagement, setMockEngagement] = useState(true);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [inputs, setInputs] = useState<Partial<Record<InputKind, string>>>({});
  const cameraPreview = useRef<MediaStream | null>(null);
  const micPreview = useRef<{ read: () => number; stop: () => void } | null>(null);
  const previewGeneration = useRef(0);
  const meter = useRef<HTMLMeterElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const requestId = useRef<string | null>(null);

  const inRoom = !!session && active(session.status);
  const publish = !!session && inRoom && session.room_ready && publishing === session.id;
  const canPreview = !!token && (session?.status === "scheduled" || (inRoom && !publish));

  useEffect(() => {
    if (!canPreview) return;
    return () => {
      previewGeneration.current += 1;
      cameraPreview.current?.getTracks().forEach((track) => track.stop());
      micPreview.current?.stop();
      cameraPreview.current = null;
      micPreview.current = null;
      setPreview(false);
      setCheckingMic(false);
    };
  }, [canPreview, sessionId]);

  useEffect(() => {
    if (!checkingMic) return;
    const timer = window.setInterval(() => {
      if (meter.current && micPreview.current) meter.current.value = micPreview.current.read();
    }, 100);
    return () => window.clearInterval(timer);
  }, [checkingMic]);

  // Only the host tab asks the server to reconcile media when a webhook was missed.
  const needsReconcile = !!session && active(session.status);
  useEffect(() => {
    if (!needsReconcile) return;
    const timer = window.setInterval(() => {
      void liveFetch("?studio=1", undefined, token).catch(() => undefined);
    }, 8_000);
    return () => window.clearInterval(timer);
  }, [needsReconcile, token]);

  async function run(work: () => Promise<void>) {
    setBusy(true); setActionError("");
    try { await work(); }
    catch (error) { setActionError(error instanceof Error ? error.message : "Thao tác chưa thành công."); }
    finally { setBusy(false); }
  }

  async function action(suffix: string, options: RequestInit = { method: "POST" }) {
    return liveFetch(`/${sessionId}/${suffix}`, options, token);
  }

  function stopCameraPreview() {
    cameraPreview.current?.getTracks().forEach((track) => track.stop());
    cameraPreview.current = null;
    if (video.current) video.current.srcObject = null;
    setPreview(false);
  }

  function stopMicPreview() {
    micPreview.current?.stop();
    micPreview.current = null;
    setCheckingMic(false);
  }

  function refreshDevices(generation: number) {
    void navigator.mediaDevices.enumerateDevices().then((available) => {
      if (previewGeneration.current === generation) setDevices(available.filter((device) => device.deviceId));
    }).catch(() => undefined);
  }

  function selectInput(kind: InputKind, deviceId: string) {
    if (kind === "videoinput") stopCameraPreview();
    else stopMicPreview();
    setInputs((previous) => ({ ...previous, [kind]: deviceId || undefined }));
  }

  async function toggleCameraPreview() {
    if (cameraPreview.current) { stopCameraPreview(); return; }
    if (!navigator.mediaDevices) throw new Error("Mở studio bằng HTTPS hoặc localhost để dùng camera.");
    const generation = previewGeneration.current;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: inputs.videoinput ? { deviceId: { exact: inputs.videoinput } } : true, audio: false,
    });
    if (generation !== previewGeneration.current || !video.current) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }
    cameraPreview.current = stream;
    video.current.srcObject = stream;
    setPreview(true);
    refreshDevices(generation);
  }

  async function toggleMicPreview() {
    if (micPreview.current) { stopMicPreview(); return; }
    const generation = previewGeneration.current;
    const track = await createLocalAudioTrack({ deviceId: inputs.audioinput ? { exact: inputs.audioinput } : undefined });
    if (generation !== previewGeneration.current) { track.stop(); return; }
    try {
      const analysis = createAudioAnalyser(track, { maxDecibels: -20 });
      micPreview.current = {
        read: analysis.calculateVolume,
        stop: () => { track.stop(); void analysis.cleanup().catch(() => undefined); },
      };
      void (analysis.analyser.context as AudioContext).resume().catch(() => undefined);
      setCheckingMic(true);
      refreshDevices(generation);
    } catch (error) { track.stop(); throw error; }
  }

  return <section className="mx-auto max-w-screen-2xl space-y-6 px-4 py-8">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="font-editorial text-3xl font-bold">Studio phát sóng NaiFarm Live</h1><p className="mt-1 text-sm text-[#52645A]">Dành cho nhà vườn tạo lịch, bật camera và điều khiển buổi phát.</p></div>
      <Link className="underline" href="/live">Trang xem</Link>
    </header>
    {(authError || error || actionError || realtimeError) && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-amber-900">{actionError || error || authError || realtimeError}</p>}
    {!token && <div role="status" className="space-y-2 rounded-lg border border-[#D6DED2] bg-[#F5F3E9] p-4 text-sm">
      <p>Studio cần phiên đăng nhập Supabase thật. Hồ sơ ghi <strong>Không gian trải nghiệm</strong> ở menu tài khoản chỉ đổi vai trò demo, chưa đăng nhập host livestream.</p>
      <p>Tài khoản host còn cần được cấp quyền livestream cho đúng nhà vườn.</p>
      <Link className="inline-flex min-h-10 items-center rounded-lg bg-[#245B3D] px-4 font-semibold text-white" href="/sign-in#signin-email">
        Đăng nhập bằng Email &amp; mật khẩu
      </Link>
    </div>}
    {token && data && <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.8fr)]">
      <Card className="space-y-4 p-4">
        <h2 className="font-bold">Phiên của tôi</h2>
        {data.sessions.map((item) => <Link className="block rounded-lg border p-2" key={item.id} href={`/live/studio/${item.id}`} aria-current={item.id === sessionId ? "page" : undefined}>
          {item.title} · {statusText[item.status]}
        </Link>)}
        {sessionId && <Link className="block underline" href="/live/studio">Tạo phiên mới</Link>}
        {!sessionId && <ScheduleForm farms={data.farms} busy={busy} onSave={(values) => void run(async () => {
          requestId.current ??= crypto.randomUUID();
          const created = await liveFetch<{ session: LiveSession }>("", { method: "POST", body: JSON.stringify({ ...values, requestId: requestId.current }) }, token);
          requestId.current = null;
          router.push(`/live/studio/${created.session.id}`);
        })} />}
      </Card>
      {sessionId && !session && <p>Phiên không tồn tại hoặc bạn không có quyền điều khiển.</p>}
      {session && <div className="space-y-4">
        <Card className="space-y-4 p-4">
          <h2 className="text-xl font-bold">{session.title}</h2>
          <p role="status">{statusText[session.status]}</p>
          {inRoom && session.started_at && <ElapsedTime startedAt={session.started_at} />}
          {session.status === "scheduled" && <ScheduleForm key={session.id} farms={data.farms} session={session} busy={busy} onSave={(values) => void run(async () => {
            await liveFetch(`/${session.id}`, { method: "PATCH", body: JSON.stringify(values) }, token);
            refresh();
          })} />}
          {publish ? <div className="space-y-3">
            <Button size="sm" variant="secondary" aria-pressed={mockEngagement} onClick={() => setMockEngagement((enabled) => !enabled)}>
              {mockEngagement ? "Tắt tương tác minh họa" : "Bật tương tác minh họa"}
            </Button>
            <LiveKitStage key={session.id} sessionId={session.id} role="host" token={token} mockEngagement={mockEngagement}
              mockProducts={mockLiveProducts}
              cameraDevice={inputs.videoinput} micDevice={inputs.audioinput} />
          </div> : canPreview ? <div className="space-y-2">
            <video ref={video} muted autoPlay playsInline className="aspect-video w-full rounded-lg bg-[#25352B] object-contain" />
            {devices.length > 0 && <div className="grid gap-2 sm:grid-cols-2">
              {inputKinds.map((kind) => {
                const options = devices.filter((device) => device.kind === kind);
                const label = kind === "videoinput" ? "Thiết bị camera" : "Thiết bị mic";
                return !!options.length && <label key={kind} className="grid min-w-0 gap-1 text-sm">{label}
                  <select className={field} disabled={busy} value={inputs[kind] ?? ""} onChange={(event) => selectInput(kind, event.target.value)}>
                    <option value="">Mặc định</option>
                    {options.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `${label} ${index + 1}`}</option>)}
                  </select>
                </label>;
              })}
            </div>}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" disabled={busy} onClick={() => void run(toggleCameraPreview)}>{preview ? "Dừng xem trước" : "Xem trước camera"}</Button>
              <Button size="sm" variant="secondary" disabled={busy} onClick={() => void run(toggleMicPreview)}>{checkingMic ? "Dừng kiểm tra mic" : "Kiểm tra mic"}</Button>
            </div>
            {checkingMic && <label className="flex items-center gap-2 text-sm">Mức tín hiệu mic <meter ref={meter} min={0} max={1} value={0} /></label>}
          </div> : null}
          <div className="flex flex-wrap gap-2">
            {(session.status === "scheduled" || (inRoom && !publish)) && <Button disabled={busy} onClick={() => void run(async () => {
              stopCameraPreview();
              stopMicPreview();
              await action("start");
              setPublishing(session.id);
              refresh();
            })}>{session.status === "scheduled" ? "Bắt đầu phát" : "Kết nối camera chính"}</Button>}
            {session.status === "scheduled" && <Button disabled={busy} variant="secondary" onClick={() => {
              if (window.confirm("Hủy lịch phát này?")) void run(async () => { await action("cancel"); refresh(); });
            }}>Hủy lịch</Button>}
            {inRoom && <>
              <Button disabled={busy} variant="destructive" onClick={() => {
                if (window.confirm("Kết thúc phát sóng cho mọi người?")) void run(async () => {
                  await action("end"); setPublishing(""); setPairing(undefined); refresh();
                });
              }}>Kết thúc phiên</Button>
              <Button disabled={busy || !session.room_ready} variant="secondary" onClick={() => void run(async () => {
                const result = await liveFetch<{ code: string; expiresAt: string }>(`/${session.id}/cameras/pair`, { method: "POST" }, token);
                setPairing({ id: session.id, url: `${location.origin}/live/camera#code=${result.code}`, expiresAt: result.expiresAt });
              })}>Tạo QR ghép camera</Button>
              <Button disabled={busy} variant="secondary" onClick={() => void run(async () => {
                await action("cameras", { method: "DELETE" }); setPairing(undefined);
              })}>Ngắt camera phụ</Button>
            </>}
          </div>
          {inRoom && pairing?.id === session.id && <div className="space-y-2">
            <QRCodeSVG value={pairing.url} size={160} marginSize={2} title="QR ghép camera phụ" />
            <p className="text-sm">Dùng một lần, hết hạn lúc {new Date(pairing.expiresAt).toLocaleTimeString("vi-VN")}.</p>
            <input className={field} aria-label="Đường dẫn ghép camera" readOnly value={pairing.url} onFocus={(event) => event.target.select()} />
          </div>}
          {inRoom && <label className="block">Sản phẩm đang ghim
            <select className={field} disabled={busy} value={session.pinned_product_id ?? ""} onChange={(event) => {
              const productId = event.target.value || null;
              void run(async () => { await action("pin", { method: "POST", body: JSON.stringify({ productId, revision: session.revision }) }); refresh(); });
            }}><option value="">Bỏ ghim</option>{INITIAL_PRODUCTS.filter((item) => session.product_ids.includes(item.id)).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          </label>}
          <Link href={`/live/${session.id}`} className="underline">Mở trang xem</Link>
        </Card>
        <LiveChat key={session.id} id={session.id} token={token} writable={["live", "reconnecting"].includes(session.status)} moderate />
      </div>}
    </div>}
  </section>;
}
