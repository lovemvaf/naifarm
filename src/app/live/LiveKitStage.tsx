"use client";

import { useEffect, useRef, useState } from "react";
import { ConnectionQuality, Room, RoomEvent, Track, VideoPresets, type RemoteTrackPublication, type RemoteTrack } from "livekit-client";
import { Button } from "@/components/ui/Primitives";
import { liveFetch, type LiveConnection } from "@/lib/live/client";

type FullscreenVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void; webkitSupportsFullscreen?: boolean };
const qualityLabel: Record<ConnectionQuality, string> = {
  excellent: "Rất tốt", good: "Tốt", poor: "Yếu", lost: "Mất kết nối", unknown: "Đang đo",
};

export function LiveKitStage({ sessionId, role, token, cameraDevice, micDevice, selectedCameraIdentity }: {
  sessionId: string; role: "viewer" | "host"; token?: string; cameraDevice?: string; micDevice?: string; selectedCameraIdentity?: string | null;
}) {
  const video = useRef<FullscreenVideo>(null);
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
      room.on(RoomEvent.ConnectionQualityChanged, (next, participant) => {
        if (participant === room.localParticipant && !disposed) setQuality(next);
      });
    }
    room.on(RoomEvent.TrackSubscribed, attach);
    room.on(RoomEvent.TrackUnsubscribed, (track) => { track.detach(); synchronize(); });
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
    const element = video.current;
    if (!element) return;
    try {
      if (document.fullscreenEnabled) await element.requestFullscreen();
      else element.webkitEnterFullscreen?.();
    } catch { setStatus("Không thể mở video toàn màn hình."); }
  }

  return <div className="space-y-3">
    <video ref={video} autoPlay playsInline muted className="aspect-video w-full rounded-xl bg-[#25352B] object-contain"
      onLoadedMetadata={(event) => setFullscreen(document.fullscreenEnabled || !!(event.currentTarget as FullscreenVideo).webkitSupportsFullscreen)} />
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
      {role === "viewer" && angle && fullscreen && <Button size="sm" variant="secondary" onClick={() => void openFullscreen()}>Toàn màn hình</Button>}
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
