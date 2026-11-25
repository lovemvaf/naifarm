"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, Maximize2, Minimize2, Sparkles } from "lucide-react";
import Link from "next/link";
import { ConnectionQuality, Room, RoomEvent, Track, VideoPresets, type RemoteTrackPublication, type RemoteTrack } from "livekit-client";
import { Button } from "@/components/ui/Primitives";
import { formatVnd } from "@/lib/format";
import { liveFetch, type LiveConnection } from "@/lib/live/client";
import type { Product } from "@/types/naifarm";

type FullscreenVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void; webkitSupportsFullscreen?: boolean };
const qualityLabel: Record<ConnectionQuality, string> = {
  excellent: "Rất tốt", good: "Tốt", poor: "Yếu", lost: "Mất kết nối", unknown: "Đang đo",
};
const mockComments = [
  { name: "Cô Lan", text: "Bưởi vườn mình nhìn tươi quá!" },
  { name: "Minh Khoa", text: "Nhà vườn ở khu vực nào vậy ạ?" },
  { name: "Thanh Hà", text: "Cho mình xin cách đặt mua nhé 🌿" },
  { name: "Tuấn Anh", text: "Chúc phiên live đông khách!" },
  { name: "Ngọc Mai", text: "Trái cây thu hoạch hôm nay luôn ạ?" },
];
const mockGifts = ["Giỏ trái cây Đồng Nai", "Hộp quà OCOP", "Rổ bưởi Tân Triều", "Combo hạt điều Xuân Lộc"];
const mockDiscounts = [10, 15, 20, 12];

export function LiveKitStage({ sessionId, role, token, cameraDevice, micDevice, selectedCameraIdentity, mockEngagement = false, mockProducts = [] }: {
  sessionId: string; role: "viewer" | "host"; token?: string; cameraDevice?: string; micDevice?: string; selectedCameraIdentity?: string | null; mockEngagement?: boolean; mockProducts?: Product[];
}) {
  const video = useRef<FullscreenVideo>(null);
  const stage = useRef<HTMLDivElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const currentRoom = useRef<Room | null>(null);
  const accessToken = useRef(token);
  const selectedCamera = useRef(selectedCameraIdentity);
  const audioEnabled = useRef(false);
  const synchronizeAngle = useRef<() => void>(() => {});
  const [status, setStatus] = useState("Đang kết nối…");
  const [angles, setAngles] = useState<{ id: string; label: string }[]>([]);
  const [angle, setAngle] = useState("");
  const [count, setCount] = useState<number | null>(null);
  const [retry, setRetry] = useState(0);
  const [canRetry, setCanRetry] = useState(false);
  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(true);
  const [listening, setListening] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [quality, setQuality] = useState(ConnectionQuality.Unknown);
  const [secondaryCamera, setSecondaryCamera] = useState(false);
  const [mockFeed, setMockFeed] = useState<{ id: number; name: string; text: string }[]>([]);
  const [hearts, setHearts] = useState<{ id: number; position: number }[]>([]);
  const [gift, setGift] = useState<{ id: number; name: string } | null>(null);
  const [productIndex, setProductIndex] = useState(0);
  const mockSequence = useRef(0);
  const featuredProduct = mockProducts[productIndex % Math.max(1, mockProducts.length)];
  const discountPercent = mockDiscounts[productIndex % mockDiscounts.length];
  const salePrice = featuredProduct ? Math.round(featuredProduct.priceVnd * (1 - discountPercent / 100) / 1000) * 1000 : 0;

  useEffect(() => {
    if (!mockEngagement) {
      setMockFeed([]);
      setHearts([]);
      return;
    }
    let tick = 0;
    const timer = window.setInterval(() => {
      const id = ++mockSequence.current;
      tick += 1;
      if (tick % 2 === 0) {
        const comment = mockComments[(tick / 2 - 1) % mockComments.length];
        setMockFeed((items) => [...items.slice(-2), { id, ...comment }]);
      }
      setHearts((items) => [...items.slice(-5), { id, position: (id * 37) % 55 }]);
      if (tick % 6 === 0) {
        setGift({ id, name: mockGifts[(tick / 6 - 1) % mockGifts.length] });
        if (mockProducts.length > 1) setProductIndex((index) => (index + 1) % mockProducts.length);
      }
    }, 750);
    return () => window.clearInterval(timer);
  }, [mockEngagement, mockProducts.length]);

  useEffect(() => {
    const updateFullscreen = () => setFullscreen(document.fullscreenElement === stage.current);
    document.addEventListener("fullscreenchange", updateFullscreen);
    return () => document.removeEventListener("fullscreenchange", updateFullscreen);
  }, []);

  useEffect(() => { accessToken.current = token; }, [token]);
  useEffect(() => { selectedCamera.current = selectedCameraIdentity; synchronizeAngle.current(); }, [selectedCameraIdentity]);

  useEffect(() => {
    const room = new Room({
      adaptiveStream: true, dynacast: true,
      videoCaptureDefaults: { resolution: VideoPresets.h720.resolution, deviceId: cameraDevice ? { exact: cameraDevice } : undefined },
      audioCaptureDefaults: { deviceId: micDevice ? { exact: micDevice } : undefined },
      publishDefaults: { videoEncoding: { maxBitrate: 1_200_000, maxFramerate: 24 } },
    });
    let disposed = false;
    currentRoom.current = room;
    const expectedHost = `host-${sessionId}`;
    let shown: RemoteTrack | undefined;

    function synchronize() {
      if (disposed) return;
      const participants = [...room.remoteParticipants.values()];
      setCount(participants.filter((item) => item.identity.startsWith("viewer-")).length + (role === "viewer" ? 1 : 0));
      if (role === "host") {
        setSecondaryCamera(participants.some((item) => item.identity.startsWith("camera-") &&
          [...item.videoTrackPublications.values()].some((publication) => publication.source === Track.Source.Camera && !publication.isMuted)));
        return;
      }
      const choices = participants.filter((item) => item.identity === expectedHost || item.identity.startsWith("camera-"))
        .sort((a, b) => Number(b.identity === expectedHost) - Number(a.identity === expectedHost))
        .flatMap((item) => [...item.videoTrackPublications.values()].filter((publication) => publication.source === Track.Source.Camera && !publication.isMuted)
          .map((publication) => ({ id: item.identity, label: item.identity === expectedHost ? "Camera chính" : "Camera điện thoại", publication })));
      const selected = choices.find((item) => item.id === selectedCamera.current) ?? choices.find((item) => item.id === `host-${sessionId}`) ?? choices[0];
      setAngles(choices.map(({ id, label }) => ({ id, label })));
      setAngle(selected?.id ?? "");
      if (shown && shown !== selected?.publication.track) { shown.detach(); shown = undefined; }
      for (const item of participants) for (const publication of item.trackPublications.values()) {
        const wanted = publication === selected?.publication || (item.identity === expectedHost && publication.source === Track.Source.Microphone);
        if (publication.isDesired !== wanted) publication.setSubscribed(wanted);
      }
      if (video.current && selected?.publication.track && shown !== selected.publication.track) {
        shown = selected.publication.track;
        shown.attach(video.current);
      }
    }

    synchronizeAngle.current = synchronize;
    function attach(track: RemoteTrack, publication: RemoteTrackPublication) {
      if (disposed) return;
      if (publication.source === Track.Source.Microphone && audio.current) {
        track.attach(audio.current);
        audio.current.muted = !audioEnabled.current;
      }
      synchronize();
    }
    if (role === "host") {
      room.on(RoomEvent.ConnectionQualityChanged, (next: ConnectionQuality, participant: Participant) => {
        if (participant === room.localParticipant && !disposed) setQuality(next);
      });
    }
    room.on(RoomEvent.TrackSubscribed, attach);
    room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => { track.detach(); synchronize(); });
    room.on(RoomEvent.TrackPublished, synchronize);
    room.on(RoomEvent.TrackUnpublished, synchronize);
    room.on(RoomEvent.TrackMuted, synchronize);
    room.on(RoomEvent.TrackUnmuted, synchronize);
    room.on(RoomEvent.ParticipantConnected, synchronize);
    room.on(RoomEvent.ParticipantActive, synchronize);
    room.on(RoomEvent.ParticipantDisconnected, synchronize);
    room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
      if (!room.canPlaybackAudio) {
        audioEnabled.current = false;
        setListening(false);
      }
    });
    room.on(RoomEvent.Reconnecting, () => { setCount(null); setStatus("Đang kết nối lại…"); });
    room.on(RoomEvent.Reconnected, () => { setStatus("Đã kết nối lại"); synchronize(); });
    room.on(RoomEvent.Disconnected, () => {
      if (!disposed) { setCount(null); setStatus("Mất kết nối với phòng."); setCanRetry(true); }
    });

    void (async () => {
      try {
        const connection = await liveFetch<LiveConnection>(`/${sessionId}/${role === "host" ? "token" : "viewer-token"}`, { method: "POST" }, accessToken.current);
        if (disposed) return;
        await room.connect(connection.url, connection.token, { autoSubscribe: false });
        if (disposed) { await room.disconnect(); return; }
        if (role === "host") {
          const publication = await room.localParticipant.setCameraEnabled(true);
          if (disposed) { await room.disconnect(); return; }
          if (video.current) publication?.track?.attach(video.current);
          const microphone = await room.localParticipant.setMicrophoneEnabled(true).catch(() => undefined);
          if (!disposed) {
            setMic(!!microphone);
            setQuality(room.localParticipant.connectionQuality);
          }
        }
        if (disposed) return;
        synchronize();
        setStatus("Đã kết nối");
      } catch (error) {
        await room.disconnect();
        if (!disposed) {
          setStatus(error instanceof Error ? error.message : "Không thể kết nối.");
          setCanRetry(true);
        }
      }
    })();
    return () => { disposed = true; synchronizeAngle.current = () => {}; shown?.detach(); currentRoom.current = null; void room.disconnect(); };
  }, [sessionId, role, retry, cameraDevice, micDevice]);

  async function selectAngle(identity: string) {
    try {
      await liveFetch(`/${sessionId}/camera-angle`, { method: "POST", body: JSON.stringify({ identity }) });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "KhÃ´ng thá»ƒ Ä‘á»•i gÃ³c camera.");
    }
  }

  async function toggle(source: Track.Source.Camera | Track.Source.Microphone) {
    const room = currentRoom.current;
    if (!room) return;
    try {
      if (source === Track.Source.Microphone) {
        await room.localParticipant.setMicrophoneEnabled(!mic);
        setMic(!mic);
      } else {
        const publication = await room.localParticipant.setCameraEnabled(!camera);
        if (video.current && !camera) publication?.track?.attach(video.current);
        setCamera(!camera);
      }
    } catch { setStatus("Không thể truy cập thiết bị. Kiểm tra quyền camera và mic."); }
  }

  async function toggleListening() {
    const element = audio.current;
    const room = currentRoom.current;
    if (!element || !room) return;
    if (listening) {
      audioEnabled.current = false;
      element.muted = true;
      setListening(false);
      return;
    }
    try {
      element.muted = false;
      void video.current?.play().catch(() => undefined);
      await room.startAudio();
      audioEnabled.current = true;
      setListening(true);
    } catch {
      element.muted = true;
      setStatus("Trình duyệt chưa cho phát âm thanh. Hãy thử bật lại.");
    }
  }

  async function openFullscreen() {
    const element = stage.current;
    if (!element) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.fullscreenEnabled) await element.requestFullscreen();
      else video.current?.webkitEnterFullscreen?.();
    } catch { setStatus("Không thể mở video toàn màn hình."); }
  }

  return <div className="space-y-3">
    <div ref={stage} className={`live-stage relative overflow-hidden rounded-xl bg-[#25352B] ${fullscreen ? "flex min-h-0 items-center justify-center bg-black p-3" : ""}`}>
      <video ref={video} autoPlay playsInline muted className={`w-full object-contain ${fullscreen ? "max-h-[94vh]" : "aspect-video"}`} />
      {mockEngagement && <>
        <span className="absolute left-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">Tương tác mô phỏng</span>
        <div className="pointer-events-none absolute inset-y-0 right-4 w-12 overflow-hidden" aria-hidden="true">
          {hearts.map((item) => <Heart key={item.id} fill="currentColor" className="absolute bottom-3 h-7 w-7 text-rose-400 drop-shadow-md animate-live-heart"
            style={{ left: `${item.position}%` }} onAnimationEnd={() => setHearts((items) => items.filter((heart) => heart.id !== item.id))} />)}
        </div>
        {featuredProduct && <Link key={featuredProduct.id} href={`/products/${featuredProduct.slug}`} className="absolute left-3 top-12 flex w-[min(21rem,82%)] items-center gap-3 rounded-2xl border border-white/70 bg-[#FFFDF5]/95 p-2.5 shadow-2xl backdrop-blur-sm animate-live-product">
          <img src={featuredProduct.image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-[#9B2C21]"><span className="rounded bg-[#B72D24] px-1.5 py-0.5 text-white">-{discountPercent}%</span> Ưu đãi mô phỏng · sản phẩm mẫu</span>
            <span className="block truncate text-sm font-bold text-[#25352B]">{featuredProduct.name}</span>
            <span className="flex flex-wrap items-baseline gap-x-1.5"><span className="text-sm font-extrabold text-[#B72D24]">{formatVnd(salePrice)}</span><span className="text-[10px] text-[#52645A]">/{featuredProduct.unitLabel}</span><span className="text-[10px] text-[#718075] line-through">{formatVnd(featuredProduct.priceVnd)}</span></span>
            <span className="block text-[9px] font-semibold uppercase tracking-wide text-[#52645A]">Giá demo · mở trang sản phẩm để đặt mua</span>
          </span>
          <span className="rounded-full bg-[#245B3D] px-2.5 py-1.5 text-[11px] font-bold text-white">Xem &amp; đặt</span>
        </Link>}
        {gift && <div key={gift.id} className="pointer-events-none absolute left-1/2 top-1/2 flex max-w-[90%] items-center gap-3 rounded-2xl border border-amber-200 bg-[#542F18]/90 px-5 py-4 text-white shadow-2xl animate-live-gift">
          <span className="absolute -left-5 -top-7 text-4xl animate-live-firework" aria-hidden="true">🎆</span>
          <span className="absolute -right-5 -top-7 text-4xl animate-live-firework" aria-hidden="true">✨</span>
          <span className="absolute -bottom-6 left-1/2 text-3xl animate-live-firework" aria-hidden="true">🎇</span>
          <span className="text-4xl" aria-hidden="true">🎁</span>
          <span><span className="block text-[10px] font-bold uppercase tracking-wider text-amber-200">Quà tặng mô phỏng · vừa nhận</span><span className="text-sm font-extrabold">{gift.name}</span></span>
          <Sparkles className="h-6 w-6 shrink-0 text-amber-200" aria-hidden="true" />
        </div>}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 space-y-1 bg-gradient-to-t from-black/75 to-transparent px-3 pb-3 pt-10">
          {mockFeed.map((item) => <p key={item.id} className="w-fit max-w-[85%] rounded-full bg-black/45 px-3 py-1 text-xs text-white">
            <span className="font-bold text-emerald-200">{item.name}</span> {item.text}
          </p>)}
        </div>
      </>}
      <button type="button" onClick={() => void openFullscreen()} aria-label={fullscreen ? "Thoát toàn màn hình" : "Xem livestream toàn màn hình"}
        className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 focus-visible:outline-white">
        {fullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
      </button>
    </div>
    {role === "viewer" && <audio ref={audio} autoPlay muted={!listening} />}
    <p role="status" className="text-sm">{status}{count !== null && ` · ${count} người xem`}{role === "viewer" && count !== null && !angle && " · Đang chờ camera"}</p>
    {role === "host" && count !== null && <div className="space-y-2 text-sm">
      <p>Chất lượng kết nối · {qualityLabel[quality]}</p>
      <p role="status">Camera phụ · {secondaryCamera ? "Đang phát" : "Không phát"}</p>
    </div>}
    <div className="flex flex-wrap gap-2">
      {role === "viewer" && angles.map((item) => <Button key={item.id} size="sm" aria-pressed={item.id === angle}
        variant={item.id === angle ? "primary" : "secondary"} onClick={() => void selectAngle(item.id)}>{item.label}</Button>)}
      {role === "viewer" && angles.length > 1 && <p className="basis-full text-xs text-[#4C5D50]">GÃ³c camera Ä‘ang chá»n Ä‘Æ°á»£c Ä‘á»“ng bá»™ cho má»i ngÆ°á»i xem.</p>}
      {role === "viewer" && count !== null && <Button size="sm" variant="secondary" onClick={() => void toggleListening()}>
        {listening ? "Tắt âm thanh" : "Bật âm thanh"}
      </Button>}
      {role === "host" && count !== null && <>
        <Button size="sm" variant="secondary" onClick={() => void toggle(Track.Source.Camera)}>{camera ? "Tắt camera" : "Bật camera"}</Button>
        <Button size="sm" variant="secondary" onClick={() => void toggle(Track.Source.Microphone)}>{mic ? "Tắt mic" : "Bật mic"}</Button>
      </>}
      {canRetry && <Button size="sm" onClick={() => {
        setCanRetry(false); setStatus("Đang kết nối…"); setCamera(true); setRetry((value) => value + 1);
      }}>Kết nối lại</Button>}
    </div>
  </div>;
}
