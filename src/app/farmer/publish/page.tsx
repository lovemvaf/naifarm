"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Loader2,
  Mic,
  QrCode,
  RotateCcw,
  Sparkles,
  Square,
  Upload,
  Volume2,
  X,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell";
import { Badge, Button, Card, DemoBanner } from "@/components/ui/Primitives";
import { formatVnd } from "@/lib/format";
import {
  parseVietnamesePrice,
  parseVietnameseQuantityAndUnit,
} from "@/lib/vietnameseNumberParser";
import type { Product } from "@/types/naifarm";

interface SamplePhoto {
  id: string;
  label: string;
  src: string;
  defaultName: string;
  defaultCategory: Product["category"];
  defaultPrice: number;
  defaultStock: number;
  defaultTranscript: string;
}

const SAMPLE_PHOTOS: SamplePhoto[] = [
  {
    id: "rambutan",
    label: "Chôm chôm Java Long Khánh",
    src: "/images/stitch/stitch-40.jpg",
    defaultName: "Chôm chôm Java Long Khánh mới hái",
    defaultCategory: "Trái cây tươi",
    defaultPrice: 35000,
    defaultStock: 30,
    defaultTranscript: "Tôi có 30 ký chôm chôm Java hái sáng nay, bán 35 nghìn một ký.",
  },
  {
    id: "durian",
    label: "Sầu riêng Ri6 tại vườn",
    src: "/images/stitch/stitch-49.jpg",
    defaultName: "Sầu riêng Ri6 chín cây vườn Ba Tư",
    defaultCategory: "Trái cây tươi",
    defaultPrice: 120000,
    defaultStock: 25,
    defaultTranscript: "Hôm nay vườn có khoảng 25 ký sầu riêng Ri6 tuyển chọn, bán 120 nghìn một ký.",
  },
  {
    id: "pomelo",
    label: "Bưởi da xanh Tân Triều",
    src: "/images/stitch/stitch-53.jpg",
    defaultName: "Bưởi da xanh Cù lao Tân Triều lứa mới",
    defaultCategory: "Trái cây tươi",
    defaultPrice: 55000,
    defaultStock: 40,
    defaultTranscript: "Sáng nay tôi cắt 40 ký bưởi da xanh ruột hồng, giá 55 nghìn một ký.",
  },
  {
    id: "cashew",
    label: "Hạt điều rang củi vỏ lụa",
    src: "/images/stitch/stitch-39.jpg",
    defaultName: "Hạt điều rang củi vỏ lụa đóng gói mới",
    defaultCategory: "Hạt & Cà phê",
    defaultPrice: 145000,
    defaultStock: 20,
    defaultTranscript: "Tôi vừa rang 20 hộp hạt điều vỏ lụa 500 gam, bán 145 nghìn một hộp.",
  },
];

const QUICK_VOICE_PROMPTS = [
  {
    label: "Chôm chôm Java (30 ký · 35k)",
    text: "Tôi có 30 ký chôm chôm Java hái sáng nay, bán 35 nghìn một ký.",
  },
  {
    label: "Sầu riêng Ri6 (25 ký · 120k)",
    text: "Hôm nay vườn có 25 ký sầu riêng Ri6 chín cây, bán 120 nghìn một ký.",
  },
  {
    label: "Bưởi da xanh Tân Triều (40 ký · 55k)",
    text: "Sáng nay tôi cắt 40 ký bưởi da xanh ruột hồng, giá 55 nghìn một ký.",
  },
  {
    label: "Hạt điều rang củi (20 hộp 500g · 145k)",
    text: "Tôi vừa rang 20 hộp hạt điều vỏ lụa 500 gam, bán 145 nghìn một hộp.",
  },
  {
    label: "Thử mẫu thiếu giá & số lượng",
    text: "Vườn Ba Tư hôm nay thu hoạch sầu riêng Ri6 chín cây thơm nức mũi đạt chuẩn OCOP.",
  },
];

// Helper outside component to maintain purity rules
function generateBatchCode(prefix = "NF-LK"): string {
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(10 + Math.random() * 90);
  return `${prefix}-${currentYear}-${randomSuffix}`;
}

// Convert audio recorded by browser to standard 16-bit PCM WAV (16kHz mono) required by ASR
function writeWavHeaderString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function encodeWAVBuffer(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeWavHeaderString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeWavHeaderString(view, 8, "WAVE");

  // "fmt " subchunk
  writeWavHeaderString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // AudioFormat 1 = PCM
  view.setUint16(22, 1, true); // NumChannels = 1 (Mono)
  view.setUint32(24, sampleRate, true); // SampleRate (16000)
  view.setUint32(28, sampleRate * 2, true); // ByteRate = SampleRate * 1 * 2
  view.setUint16(32, 2, true); // BlockAlign = 1 * 2
  view.setUint16(34, 16, true); // BitsPerSample = 16

  // "data" subchunk
  writeWavHeaderString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  // 16-bit PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return buffer;
}

function resampleLinear(
  fullPcm: Float32Array,
  inputSampleRate: number,
  targetSampleRate = 16000
): Float32Array {
  if (inputSampleRate === targetSampleRate) return fullPcm;
  const ratio = targetSampleRate / inputSampleRate;
  const newLen = Math.round(fullPcm.length * ratio);
  const resampled = new Float32Array(newLen);
  for (let i = 0; i < newLen; i++) {
    const srcIdx = i / ratio;
    const low = Math.floor(srcIdx);
    const high = Math.min(low + 1, fullPcm.length - 1);
    const frac = srcIdx - low;
    resampled[i] = fullPcm[low] * (1 - frac) + fullPcm[high] * frac;
  }
  return resampled;
}

export default function FarmerPublishWizardPage() {
  const { setActiveWorkspace, setHideAiChatOnSubflow, publishFarmerProduct } = useDemoStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [customPhotoData, setCustomPhotoData] = useState<string | null>(null);

  // Audio Recording & Voice Recognition States (Step 2)
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");

  // AI Draft generation & Step 3 editable fields
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [aiDraftSource, setAiDraftSource] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftCategory, setDraftCategory] = useState<Product["category"]>("Trái cây tươi");
  const [draftPrice, setDraftPrice] = useState("");
  const [draftUnit, setDraftUnit] = useState("");
  const [draftStock, setDraftStock] = useState("");
  const [draftBatchCode, setDraftBatchCode] = useState(generateBatchCode("NF-LK"));
  const [draftDescription, setDraftDescription] = useState("");

  const [publishedProduct, setPublishedProduct] = useState<Product | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const pcmChunksRef = useRef<Float32Array[]>([]);
  const isRecordingRef = useRef<boolean>(false);

  useEffect(() => {
    setActiveWorkspace("W02");
    return () => {
      setHideAiChatOnSubflow(false);
    };
  }, [setActiveWorkspace, setHideAiChatOnSubflow]);

  // Hide floating NaiAI widget when actively recording or transcribing
  useEffect(() => {
    setHideAiChatOnSubflow(isRecording || isTranscribing);
  }, [isRecording, isTranscribing, setHideAiChatOnSubflow]);

  // Timer counter for recording duration
  useEffect(() => {
    if (!isRecording) return;
    const id = window.setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRecording]);

  // Clean up MediaStream, AudioContext and ScriptProcessor when unmounting
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (processorRef.current) {
        try {
          processorRef.current.disconnect();
        } catch {
          // ignore cleanup error
        }
        processorRef.current = null;
      }
      if (audioContextRef.current) {
        try {
          void audioContextRef.current.close();
        } catch {
          // ignore cleanup error
        }
        audioContextRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, []);

  const activePhotoSrc =
    customPhotoData ??
    (selectedSampleId ? SAMPLE_PHOTOS.find((p) => p.id === selectedSampleId)?.src : null) ??
    SAMPLE_PHOTOS[0].src;

  // Xử lý chọn / bỏ chọn ảnh mẫu: KHÔNG TỰ ĐIỀN THÔNG TIN MẪU
  const handleSelectSamplePhoto = (sample: SamplePhoto) => {
    setCustomPhotoData(null);
    if (selectedSampleId === sample.id) {
      setSelectedSampleId(null);
      toast.info(`Đã bỏ chọn ảnh "${sample.label}".`);
    } else {
      setSelectedSampleId(sample.id);
      toast.success(`Đã chọn ảnh "${sample.label}". Bác có thể tiếp tục sang Bước 2.`);
    }
    // TUYỆT ĐỐI KHÔNG TỰ ĐIỀN draftName, draftPrice, draftStock, draftUnit, transcript!
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCustomPhotoData(reader.result);
        setSelectedSampleId(null);
        toast.success(`Đã chọn ảnh "${file.name}". Bác có thể tiếp tục sang Bước 2.`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearPhoto = () => {
    setSelectedSampleId(null);
    setCustomPhotoData(null);
    toast.info("Đã bỏ chọn ảnh.");
  };

  // Start recording audio from browser microphone with Dual-Engine (Web Speech API + ASR)
  // Start recording audio from browser microphone using Direct PCM Recorder (16-bit PCM WAV 16kHz)
  const handleStartRecording = async () => {
    setMicErrorMessage(null);

    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setMicErrorMessage(
        "Trình duyệt hiện tại chưa hỗ trợ ghi âm trực tiếp. Bác có thể chọn các câu mẫu hoặc gõ vào ô bên dưới nhé!"
      );
      return;
    }

    try {
      if (processorRef.current) {
        try { processorRef.current.disconnect(); } catch {}
        processorRef.current = null;
      }
      if (audioContextRef.current) {
        try { await audioContextRef.current.close(); } catch {}
        audioContextRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextClass) {
        throw new Error("Trình duyệt không hỗ trợ Web Audio.");
      }

      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      const source = audioCtx.createMediaStreamSource(stream);
      // Buffer size 4096, 1 input channel, 1 output channel
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      pcmChunksRef.current = [];

      processor.onaudioprocess = (e) => {
        if (!isRecordingRef.current) return;
        const input = e.inputBuffer.getChannelData(0);
        pcmChunksRef.current.push(new Float32Array(input));
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);

      isRecordingRef.current = true;
      setIsRecording(true);
      setRecordSeconds(0);

      toast.info("Đang lắng nghe... Bác nói tự nhiên nhé!");
    } catch (err: unknown) {
      console.error("[Record] Start error:", err);
      const isDenied =
        err instanceof Error &&
        (err.name === "NotAllowedError" || err.name === "PermissionDeniedError");
      if (isDenied) {
        setMicErrorMessage(
          "Trình duyệt chưa được cấp quyền micro. Bác hãy bấm vào biểu tượng ổ khóa/micro trên thanh địa chỉ để 'Cho phép', hoặc gõ nội dung vào ô bên dưới."
        );
      } else {
        const msg = err instanceof Error ? err.message : "";
        setMicErrorMessage(
          `Không thể khởi động micro (${msg || "kiểm tra kết nối"}). Bác hãy kiểm tra thiết bị thu âm hoặc gõ trực tiếp vào ô bên dưới nhé!`
        );
      }
      setIsRecording(false);
      isRecordingRef.current = false;
      setRecordSeconds(0);
    }
  };

  const handleStopRecording = async () => {
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;
    setIsRecording(false);
    setRecordSeconds(0);

    // 1. Disconnect and stop audio nodes
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch (err) {
        console.warn("[Record] Disconnect processor error:", err);
      }
      processorRef.current = null;
    }

    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.warn("[Record] Stop stream track error:", err);
      }
      mediaStreamRef.current = null;
    }

    const audioCtx = audioContextRef.current;
    const inputSampleRate = audioCtx ? audioCtx.sampleRate : 44100;
    if (audioCtx) {
      try {
        await audioCtx.close();
      } catch (err) {
        console.warn("[Record] Close audioCtx error:", err);
      }
      audioContextRef.current = null;
    }

    // 2. Concatenate pcm chunks
    const chunks = pcmChunksRef.current;
    pcmChunksRef.current = [];

    let totalSamples = 0;
    for (const chunk of chunks) {
      totalSamples += chunk.length;
    }

    if (totalSamples < 1600) {
      toast.info("Chưa nghe rõ do thời gian thu âm quá ngắn. Bác bấm và nói lại nhé!");
      return;
    }

    const fullPcm = new Float32Array(totalSamples);
    let offset = 0;
    for (const chunk of chunks) {
      fullPcm.set(chunk, offset);
      offset += chunk.length;
    }

    // 3. Linear resample to 16000 Hz
    const targetSampleRate = 16000;
    const resampled = resampleLinear(fullPcm, inputSampleRate, targetSampleRate);

    // 4. Encode to standard 16-bit PCM WAV (16kHz Mono)
    const wavBuffer = encodeWAVBuffer(resampled, targetSampleRate);
    const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });

    // 5. Send to DeepSeek ASR
    await handleTranscribeAudio(wavBlob);
  };

  const handleToggleRecording = () => {
    if (isTranscribing) return;
    if (isRecording) {
      void handleStopRecording();
    } else {
      void handleStartRecording();
    }
  };

  const handleTranscribeAudio = async (wavBlob: Blob) => {
    if (!wavBlob || wavBlob.size < 400) {
      toast.info("Chưa nghe rõ lời nói do tiếng ồn hoặc nói hơi nhỏ. Bác nói to và gần micro hơn nhé!");
      return;
    }

    setIsTranscribing(true);
    setMicErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", wavBlob, "recording.wav");

      const response = await fetch("/api/ai/asr", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      const asrText = (typeof result.text === "string" ? result.text : "").trim();

      if (result.success && asrText && !result.isLowVolumeOrNoisy) {
        setTranscript(asrText);
        toast.success("Đã ghi nhận xong lời nói của bác!");
      } else if (result.success && asrText) {
        setTranscript(asrText);
        toast.success("Đã ghi nhận xong lời nói của bác!");
      } else if (result.error) {
        toast.error(`Máy chủ nhận diện giọng nói: ${result.error}`);
      } else {
        toast.info("Chưa nghe rõ lời nói do tiếng ồn hoặc nói hơi nhỏ. Bác nói to và gần micro hơn nhé!");
      }
    } catch (err: unknown) {
      console.error("[Transcribe Audio] Error:", err);
      const msg = err instanceof Error ? err.message : "Lỗi kết nối máy chủ";
      toast.error(`Hệ thống nhận dạng: ${msg}. Bác có thể chọn câu mẫu hoặc gõ vào ô bên dưới nhé.`);
    } finally {
      setIsTranscribing(false);
    }
  };

interface BrowserSpeechResultItem {
  transcript: string;
}
interface BrowserSpeechResultList {
  [index: number]: {
    [index: number]: BrowserSpeechResultItem;
  };
}
interface BrowserSpeechEvent {
  results?: BrowserSpeechResultList;
  error?: string;
}
interface BrowserSpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: BrowserSpeechEvent) => void) | null;
  onerror: ((event: BrowserSpeechEvent) => void) | null;
  start: () => void;
  stop: () => void;
}
type BrowserSpeechConstructor = new () => BrowserSpeechRecognitionInstance;

  // Fallback: Web Speech API độc lập cho trình duyệt hỗ trợ khi không dùng microphone AudioContext
  const handleStartBrowserSpeechRecognition = () => {
    if (isRecording || isTranscribing) return;
    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: BrowserSpeechConstructor }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: BrowserSpeechConstructor }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      toast.error("Trình duyệt hiện tại chưa hỗ trợ Web Speech API.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = "vi-VN";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      toast.info("Trình duyệt đang lắng nghe... Bác nói đi nhé!");

      recognition.onresult = (event: BrowserSpeechEvent) => {
        const text = event.results?.[0]?.[0]?.transcript || "";
        if (text) {
          setTranscript(text);
          toast.success("Đã ghi nhận xong lời nói của bác!");
        }
      };

      recognition.onerror = (event: BrowserSpeechEvent) => {
        console.warn("[Web Speech Fallback] Error:", event?.error);
        if (event?.error === "not-allowed") {
          toast.error("Trình duyệt chưa được cấp quyền micro.");
        } else {
          toast.info("Chưa nhận dạng được giọng nói từ trình duyệt. Bác nói lại nhé!");
        }
      };

      recognition.start();
    } catch (e: unknown) {
      console.error(e);
      toast.error("Không thể kích hoạt nhận diện giọng nói trình duyệt.");
    }
  };

  // Local extraction integrating Vietnamese number & unit parser
  const buildDraftFromTranscriptLocally = (text: string) => {
    const lower = text.toLowerCase().trim();
    const { stock, unit } = parseVietnameseQuantityAndUnit(lower);
    const price = parseVietnamesePrice(lower);

    // Không tự bịa số liệu: nếu không có thì để trống ""
    setDraftStock(stock !== null ? String(stock) : "");
    setDraftPrice(price !== null ? String(price) : "");
    setDraftUnit(unit ?? "");

    let detectedName = "";
    let detectedCategory: Product["category"] = "Trái cây tươi";

    // Ưu tiên cao nhất nội dung mô tả của nông dân
    if (lower.includes("điều") || lower.includes("hạt điều")) {
      detectedName = "Hạt điều rang củi vỏ lụa Đồng Nai";
      detectedCategory = "Hạt & Cà phê";
    } else if (lower.includes("sầu riêng")) {
      detectedName = "Sầu riêng Ri6 chín cây vườn Ba Tư Long Khánh";
      detectedCategory = "Trái cây tươi";
    } else if (lower.includes("chôm chôm")) {
      detectedName = "Chôm chôm Java Long Khánh mới hái";
      detectedCategory = "Trái cây tươi";
    } else if (lower.includes("bưởi")) {
      detectedName = "Bưởi da xanh Cù lao Tân Triều lứa mới";
      detectedCategory = "Trái cây tươi";
    } else if (lower.includes("cà phê") || lower.includes("cafe")) {
      detectedName = "Cà phê Robusta Đất đỏ Đồng Nai";
      detectedCategory = "Hạt & Cà phê";
    } else if (lower.includes("mật ong")) {
      detectedName = "Mật ong hoa rừng Trị An nguyên chất";
      detectedCategory = "Mật ong & Đặc sản";
    } else if (lower.includes("chuối")) {
      detectedName = "Chuối cấy mô Trảng Bom đạt chuẩn xuất khẩu";
      detectedCategory = "Trái cây tươi";
    } else if (selectedSampleId) {
      const sample = SAMPLE_PHOTOS.find((p) => p.id === selectedSampleId);
      if (sample) {
        detectedName = sample.defaultName;
        detectedCategory = sample.defaultCategory;
      }
    } else if (text.trim()) {
      detectedName = text.length > 40 ? `${text.slice(0, 40).trim()}...` : text.trim();
    }

    setDraftName(detectedName);
    setDraftCategory(detectedCategory);
    setDraftDescription(
      text
        ? `Nông sản thu hoạch tươi mới tại vườn Đồng Nai: "${text}". Đảm bảo an toàn OCOP.`
        : "Nông sản tươi ngon đặc sản Đồng Nai, thu hoạch trực tiếp tại vườn."
    );
    setDraftBatchCode(generateBatchCode("NF-LK"));
    setAiDraftSource("fallback-heuristic");
    setStep(3);
  };

  // Call Server API: AI analysis
  const handleGenerateDraftWithAi = async (customText?: string) => {
    if (isRecording) {
      handleStopRecording();
    }

    const textToAnalyze = (customText ?? transcript ?? "").trim();
    if (!textToAnalyze && !selectedSampleId && !customPhotoData) {
      toast.info("Bác vui lòng chọn ảnh hoặc nói/gõ đôi lời mô tả nông sản trước nhé!");
      return;
    }

    if (!transcript.trim() && textToAnalyze) {
      setTranscript(textToAnalyze);
    }

    setIsGeneratingDraft(true);
    setMicErrorMessage(null);

    try {
      const response = await fetch("/api/ai/publish-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: textToAnalyze,
          image: customPhotoData || (selectedSampleId ? activePhotoSrc : undefined),
          sampleId: selectedSampleId || undefined,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const d = result.data;

        // Điền vào template bước 3: Trường nào thiếu thì để trống "" đúng quy tắc
        setDraftName(d.name || "");
        if (d.category) {
          setDraftCategory(d.category as Product["category"]);
        }
        setDraftPrice(d.price !== null && d.price !== undefined ? String(d.price) : "");
        setDraftStock(d.stock !== null && d.stock !== undefined ? String(d.stock) : "");
        setDraftUnit(d.unit || "");
        setDraftBatchCode(d.batchCode || generateBatchCode("NF-LK"));
        setDraftDescription(d.description || "");
        setAiDraftSource(result.source || "ai-smart");

        setStep(3);

        const isMissingPriceOrStock = !d.price || !d.stock || !d.unit;
        if (isMissingPriceOrStock) {
          toast.info(
            "AI đã tạo bản nháp! Có mục giá bán, số lượng hoặc đơn vị chưa có trong lời nói, bác vui lòng điền bổ sung ở Bước 3 nhé."
          );
        } else {
          toast.success("AI NAI Farm đã trích xuất thông tin thành công!");
        }
      } else {
        throw new Error(result.error || "Không thể phân tích dữ liệu");
      }
    } catch (err: unknown) {
      console.error("[handleGenerateDraftWithAi] Error:", err);
      toast.error("Không thể kết nối AI, đang sử dụng bộ trích xuất dự phòng cho bác.");
      buildDraftFromTranscriptLocally(textToAnalyze);
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(draftPrice);
    const numericStock = Number(draftStock);

    if (!draftName.trim()) {
      toast.error("Bác vui lòng điền tên sản phẩm hiển thị trên Chợ.");
      return;
    }
    if (!numericPrice || numericPrice <= 0) {
      toast.error("Bác vui lòng điền giá bán hợp lệ (lớn hơn 0 VNĐ).");
      return;
    }
    if (!numericStock || numericStock <= 0) {
      toast.error("Bác vui lòng điền số lượng mở bán (lớn hơn 0).");
      return;
    }
    if (!draftUnit.trim()) {
      toast.error("Bác vui lòng điền đơn vị tính (ví dụ: kg, túi, hộp, nải...).");
      return;
    }

    const created = publishFarmerProduct({
      name: draftName.trim(),
      category: draftCategory,
      priceVnd: numericPrice,
      unitLabel: draftUnit.trim(),
      stockKg: numericStock,
      batchCode: draftBatchCode.trim() || generateBatchCode("NF-BT"),
      shortDescription: draftDescription.trim(),
      image: activePhotoSrc,
      farmId: "farm-ba-tu-demo",
    });

    setPublishedProduct(created);
    setHideAiChatOnSubflow(false);
    toast.success(`Đã đăng bán "${created.name}" lên Chợ OCOP NaiFarm!`);
  };

  return (
    <WorkspaceShell
      workspaceId="W02"
      title="Đăng bán nông sản 3 bước với Trợ lý AI"
      subtitle="Thao tác mộc mạc, gần gũi — Chọn ảnh vườn, nói tự nhiên bằng giọng địa phương, AI điền bản nháp để bác kiểm tra"
      scopeBadge="Trợ lý AI NAI Farm — OCOP Đồng Nai"
      navItems={[
        {
          label: "Quay về Không gian Nhà vườn",
          href: "/farmer",
          icon: <ArrowLeft className="h-5 w-5" aria-hidden="true" />,
        },
        {
          label: "Bước 1: Chọn ảnh nông sản",
          href: "#step-1",
          active: step === 1 && !publishedProduct,
          onClick: () => {
            setPublishedProduct(null);
            setStep(1);
          },
          icon: <Camera className="h-5 w-5" aria-hidden="true" />,
        },
        {
          label: "Bước 2: Nói hoặc gõ mô tả",
          href: "#step-2",
          active: step === 2 && !publishedProduct,
          onClick: () => {
            setPublishedProduct(null);
            setStep(2);
          },
          icon: <Mic className="h-5 w-5" aria-hidden="true" />,
        },
        {
          label: "Bước 3: Kiểm tra & Đăng bán",
          href: "#step-3",
          active: step === 3 && !publishedProduct,
          onClick: () => {
            setPublishedProduct(null);
            setStep(3);
          },
          icon: <Sparkles className="h-5 w-5" aria-hidden="true" />,
        },
      ]}
    >
      <div className="space-y-6 text-[17px] leading-[1.6]">
        {/* High-contrast 3-Step Wizard Navigation */}
        <ol className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {[
            { num: 1 as const, label: "1. Chọn ảnh nông sản" },
            { num: 2 as const, label: "2. Nói hoặc gõ lời kể" },
            { num: 3 as const, label: "3. Kiểm tra & Đăng bán" },
          ].map((item) => {
            const isCurrent = step === item.num && !publishedProduct;
            const isDone = publishedProduct !== null || step > item.num;
            return (
              <li
                key={item.num}
                className={`flex min-h-[54px] items-center justify-center rounded-[16px] border-2 px-4 text-center font-bold text-[18px] transition-all ${isCurrent
                    ? "border-[#245B3D] bg-[#245B3D] text-white shadow-md shadow-[#245B3D]/20"
                    : isDone
                      ? "border-[#6C9C5B] bg-[#E6F3E9] text-[#24603B]"
                      : "border-[#D6DED2] bg-white text-[#52645A]"
                  }`}
              >
                {item.label}
              </li>
            );
          })}
        </ol>

        {/* State: Đã đăng bán thành công */}
        {publishedProduct ? (
          <Card className="border-2 border-[#24603B] bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
              <img
                src={publishedProduct.image}
                alt={publishedProduct.name}
                className="h-48 w-full rounded-[18px] object-cover md:w-60 border-2 border-[#E6F3E9] shadow"
              />
              <div className="space-y-3.5">
                <Badge tone="success" className="text-sm px-3 py-1 font-bold">
                  ✓ Đã đăng bán thành công trên Chợ OCOP
                </Badge>
                <h2 className="text-2xl font-bold text-[#25352B] sm:text-3xl">
                  {publishedProduct.name}
                </h2>
                <p className="text-xl font-bold text-[#245B3D] tabular-nums">
                  {formatVnd(publishedProduct.priceVnd)} / {publishedProduct.unitLabel} · Sẵn sàng
                  cung ứng: {publishedProduct.stockKg} {publishedProduct.unitLabel}
                </p>
                <p className="text-base text-[#52645A]">
                  Mã lô truy xuất nguồn gốc:{" "}
                  <span className="font-bold text-[#25352B] bg-[#F5F3E9] px-2.5 py-1 rounded-[8px]">
                    {publishedProduct.batchCode}
                  </span>
                </p>
                <div className="flex flex-wrap gap-3 pt-3">
                  <Link
                    href={`/products/${publishedProduct.slug}`}
                    className="inline-flex min-h-[54px] items-center justify-center rounded-[14px] bg-[#245B3D] px-6 text-[18px] font-bold text-white shadow hover:bg-[#19472E] transition"
                  >
                    Xem sản phẩm ngoài Chợ ngay
                  </Link>
                  <Link
                    href={`/trace/${publishedProduct.batchCode}`}
                    className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-[14px] border-2 border-[#245B3D] bg-white px-5 text-[17px] font-bold text-[#245B3D] hover:bg-[#EAF0E5] transition"
                  >
                    <QrCode className="h-5 w-5" aria-hidden="true" />
                    <span>Xem hộ chiếu QR</span>
                  </Link>
                  <Link
                    href="/farmer"
                    className="inline-flex min-h-[54px] items-center justify-center rounded-[14px] border border-[#D6DED2] bg-[#F5F3E9] px-5 text-[17px] font-semibold text-[#25352B] hover:bg-[#E8E6DB] transition"
                  >
                    Về Không gian Nhà vườn
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ) : null}

        {/* BƯỚC 1: CHỌN ẢNH NÔNG SẢN */}
        {!publishedProduct && step === 1 ? (
          <Card id="step-1" className="p-6 sm:p-7 space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-[#25352B]">
                Bước 1: Chọn ảnh nông sản thu hoạch hôm nay
              </h2>
              <p className="text-base text-[#52645A]">
                Bác chọn nhanh một ảnh mẫu nông sản Đồng Nai bên dưới (bấm lại để bỏ chọn), hoặc bấm tải ảnh thật từ máy/điện thoại.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SAMPLE_PHOTOS.map((sample) => {
                const selected = !customPhotoData && selectedSampleId === sample.id;
                return (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSamplePhoto(sample)}
                    className={`group overflow-hidden rounded-[18px] border-2 text-left transition-all cursor-pointer ${selected
                        ? "border-[#245B3D] ring-4 ring-[#245B3D]/20 bg-[#EAF0E5] shadow-md"
                        : "border-[#D6DED2] bg-white hover:border-[#6C9C5B] hover:shadow-sm"
                      }`}
                  >
                    <div className="relative">
                      <img
                        src={sample.src}
                        alt={sample.label}
                        className="h-40 w-full object-cover transition group-hover:scale-102"
                      />
                      {selected ? (
                        <span className="absolute top-2 right-2 rounded-full bg-[#245B3D] p-1 text-white shadow">
                          <CheckCircle2 className="h-5 w-5" />
                        </span>
                      ) : null}
                    </div>
                    <div className="p-3.5 space-y-1">
                      <p className="font-bold text-[#25352B] text-[17px]">{sample.label}</p>
                      <p className="text-xs text-[#52645A]">
                        {selected ? "✓ Đang chọn ảnh này (Bấm lại để bỏ chọn)" : "Bấm để chọn hình ảnh này"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] border-2 border-dashed border-[#788A7B]/60 bg-[#F5F3E9] p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <img
                  src={activePhotoSrc}
                  alt="Ảnh đã chọn"
                  className="h-20 w-20 rounded-[14px] object-cover border-2 border-[#D6DED2] shadow-sm"
                />
                <div>
                  <p className="font-bold text-[#25352B] text-lg">
                    {customPhotoData
                      ? "Đang sử dụng ảnh bác vừa tải lên từ máy"
                      : selectedSampleId
                        ? `Đang chọn ảnh mẫu: ${SAMPLE_PHOTOS.find((p) => p.id === selectedSampleId)?.label}`
                        : "Chưa chọn ảnh (Bác có thể chọn ảnh mẫu ở trên hoặc tải ảnh máy)"}
                  </p>
                  <p className="text-sm text-[#52645A]">
                    {customPhotoData || selectedSampleId
                      ? "Ảnh đã sẵn sàng. Bác có thể bấm 'Bỏ chọn ảnh' nếu muốn đổi ý."
                      : "Hỗ trợ chụp trực tiếp từ camera điện thoại hoặc ảnh có sẵn trong máy."}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {(customPhotoData || selectedSampleId) && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClearPhoto}
                    className="text-[#A32D2D] hover:bg-[#FDECEC] text-sm font-bold min-h-[48px] px-4 cursor-pointer"
                  >
                    <X className="h-4 w-4 mr-1.5" />
                    <span>Bỏ chọn ảnh</span>
                  </Button>
                )}
                <label className="inline-flex min-h-[52px] items-center gap-2.5 rounded-[14px] border-2 border-[#245B3D] bg-white px-6 font-bold text-[#245B3D] text-[17px] hover:bg-[#EAF0E5] cursor-pointer shadow-sm transition">
                  <Upload className="h-5 w-5" aria-hidden="true" />
                  <span>{customPhotoData ? "Đổi ảnh khác từ máy" : "Tải ảnh từ máy / Camera"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="farmer"
                size="lg"
                className="min-h-[54px] px-8 text-[18px] font-bold shadow-md cursor-pointer"
                onClick={() => setStep(2)}
              >
                Tiếp tục sang Bước 2 (Kể về nông sản)
              </Button>
            </div>
          </Card>
        ) : null}

        {/* BƯỚC 2: NÓI HOẶC GÕ LỜI KỂ */}
        {!publishedProduct && step === 2 ? (
          <Card id="step-2" className="p-6 sm:p-7 space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-[#25352B] sm:text-3xl">
                Bước 2: Bác kể tự nhiên về mẻ nông sản hôm nay
              </h2>
              <p className="text-base text-[#52645A]">
                Bác chỉ cần bấm nút micro và nói tự nhiên (ví dụ: loại nông sản, số túi, số ký, giá muốn bán...).
                Trợ lý AI sẽ nghe và tự động nhận diện chữ số tiếng Việt, đơn vị và sắp xếp vào bản nháp.
              </p>
            </div>

            {/* Error or Fallback Warning */}
            {micErrorMessage ? (
              <div
                role="alert"
                className="rounded-[16px] border border-[#A32D2D]/40 bg-[#FDECEC] p-4 text-[#A32D2D] shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 shrink-0 mt-0.5 text-[#A32D2D]" aria-hidden="true" />
                  <div className="space-y-1">
                    <p className="font-bold text-[17px]">Thông báo micro</p>
                    <p className="text-sm leading-relaxed">{micErrorMessage}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Micro Interaction Arena */}
            <div className="relative overflow-hidden rounded-[24px] border-2 border-[#245B3D]/30 bg-gradient-to-b from-[#FAF8F0] to-[#EBF3E8] p-6 sm:p-8 text-center space-y-6 shadow-sm">
              <div className="flex flex-col items-center justify-center">
                {/* Big Interactive Micro Button */}
                <div className="relative my-3">
                  {/* Ping effect when recording */}
                  {isRecording ? (
                    <span
                      className="absolute -inset-4 rounded-full bg-red-500 opacity-40 animate-ping pointer-events-none"
                      aria-hidden="true"
                    />
                  ) : null}

                  <button
                    type="button"
                    onClick={handleToggleRecording}
                    disabled={isTranscribing}
                    aria-label={
                      isRecording
                        ? "Dừng ghi âm lời nói"
                        : isTranscribing
                          ? "Đang xử lý giọng nói..."
                          : "Bấm vào icon micro để nói"
                    }
                    className={`relative z-10 flex h-28 w-28 sm:h-36 sm:w-36 items-center justify-center rounded-full transition-all duration-300 cursor-pointer shadow-xl select-none ${isRecording
                        ? "bg-[#DC2626] text-white border-4 border-red-200 ring-8 ring-red-400/50 scale-105 active:scale-95 shadow-red-500/50"
                        : isTranscribing
                          ? "bg-[#2563EB] text-white border-4 border-blue-200 ring-8 ring-blue-300/40 shadow-blue-500/30 cursor-wait"
                          : "bg-white text-[#245B3D] border-4 border-[#245B3D] hover:bg-[#EAF0E5] hover:scale-105 active:scale-95 ring-4 ring-[#245B3D]/20"
                      }`}
                  >
                    {isRecording ? (
                      <Mic className="h-16 w-16 sm:h-20 sm:w-20 text-white animate-pulse" aria-hidden="true" />
                    ) : isTranscribing ? (
                      <Loader2 className="h-16 w-16 sm:h-20 sm:w-20 text-white animate-spin" aria-hidden="true" />
                    ) : (
                      <Mic className="h-16 w-16 sm:h-20 sm:w-20 text-[#245B3D]" aria-hidden="true" />
                    )}
                  </button>
                </div>

                {/* State 1: Đang thu âm */}
                {isRecording ? (
                  <div className="mt-3 space-y-4 max-w-xl mx-auto">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#FDECEC] px-5 py-2 border border-[#DC2626]/40 text-[#DC2626] font-extrabold text-xl tabular-nums shadow-sm">
                      <span className="h-3.5 w-3.5 rounded-full bg-[#DC2626] animate-ping" />
                      <span>Đang nghe: 00:{String(recordSeconds).padStart(2, "0")}</span>
                    </div>

                    {/* Sóng âm thanh sinh động */}
                    <div className="flex items-center justify-center gap-1.5 h-12 py-1">
                      {[35, 75, 50, 95, 60, 100, 70, 90, 45, 85, 40, 80].map((height, idx) => (
                        <span
                          key={idx}
                          className="w-1.5 bg-[#DC2626] rounded-full animate-pulse"
                          style={{
                            height: `${height}%`,
                            animationDelay: `${(idx * 0.1).toFixed(2)}s`,
                          }}
                        />
                      ))}
                    </div>

                    <div className="space-y-1">
                      <p className="text-2xl font-black text-[#DC2626]">
                        Đang nghe bác nói... Nói xong bấm lại vào micro để Dừng
                      </p>
                      <p className="text-base text-[#52645A]">
                        🌾 Bác cứ nói thong thả: loại nông sản, số túi/ký hái hôm nay, giá muốn bán, vị trái chín...
                      </p>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <Button
                        type="button"
                        variant="destructive"
                        size="lg"
                        onClick={handleStopRecording}
                        className="min-h-[56px] px-8 text-[18px] font-bold shadow-lg cursor-pointer"
                      >
                        <Square className="h-5 w-5 fill-current mr-2" aria-hidden="true" />
                        <span>Dừng ghi âm (Hoặc bấm lại vào micro)</span>
                      </Button>
                    </div>
                  </div>
                ) : isTranscribing ? (
                  /* State 2: Hệ thống đang xử lý giọng nói */
                  <div className="mt-3 space-y-3 max-w-lg mx-auto">
                    <div className="inline-flex items-center gap-2.5 rounded-full bg-blue-50 px-5 py-2 border border-blue-200 text-[#2563EB] font-bold text-lg shadow-sm">
                      <Loader2 className="h-5 w-5 animate-spin text-[#2563EB]" />
                      <span>Hệ thống đang chuyển lời nói thành văn bản...</span>
                    </div>
                    <p className="text-base text-[#52645A]">
                      Vui lòng đợi giây lát, đang nhận dạng lời nói của bác...
                    </p>
                  </div>
                ) : (
                  /* State 3: Bình thường */
                  <div className="mt-3 space-y-2 max-w-xl mx-auto">
                    <h3 className="text-2xl font-extrabold text-[#25352B]">
                      Bấm vào icon micro để nói
                    </h3>
                    <p className="text-base text-[#52645A] leading-relaxed">
                      Khi ấn vào micro, icon sẽ chuyển sang <strong className="text-[#DC2626]">MÀU ĐỎ</strong> và bắt đầu lắng nghe.
                      Bác kể xong chỉ cần bấm lại vào icon micro (hoặc nút Dừng) để hệ thống tự động ghi lại.
                    </p>
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <Button
                        type="button"
                        variant="farmer"
                        size="lg"
                        onClick={handleStartRecording}
                        className="min-h-[54px] px-8 text-[18px] font-bold shadow-md hover:scale-102 transition cursor-pointer"
                      >
                        <Mic className="h-6 w-6 mr-2" aria-hidden="true" />
                        <span>Bắt đầu nói (AI ASR chuẩn 16kHz)</span>
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="lg"
                        onClick={handleStartBrowserSpeechRecognition}
                        className="min-h-[54px] px-5 text-[16px] font-semibold text-[#245B3D] border-[#245B3D]/30 hover:bg-white bg-white/80 transition cursor-pointer"
                        title="Nhận dạng giọng nói tiếng Việt trực tiếp bằng trình duyệt Web Speech API"
                      >
                        <Volume2 className="h-5 w-5 mr-2 text-[#245B3D]" aria-hidden="true" />
                        <span>Nói qua trình duyệt (Web Speech)</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Prompts For Farmers */}
            <div className="rounded-[16px] border border-[#D6DED2] bg-[#F5F3E9] p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-[#245B3D]">
                <Volume2 className="h-5 w-5 shrink-0" />
                <span className="font-bold text-[17px]">
                  Bác cũng có thể bấm chọn nhanh các câu nói mẫu thường gặp:
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {QUICK_VOICE_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTranscript(p.text);
                      toast.success(`Đã chọn: "${p.label}"`);
                    }}
                    className="min-h-[46px] rounded-full border border-[#245B3D]/30 bg-white px-4 text-sm font-semibold text-[#245B3D] hover:bg-[#245B3D] hover:text-white transition shadow-sm cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Transcript Textarea Editable */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="farmer-transcript"
                  className="font-bold text-[#25352B] text-lg flex items-center gap-2"
                >
                  <span>Khung ghi nhận lời nói của bác:</span>
                  <span className="text-xs font-normal text-[#52645A] bg-white px-2 py-0.5 rounded border">
                    Bác có thể sửa trực tiếp
                  </span>
                </label>
                {transcript && (
                  <button
                    type="button"
                    onClick={() => setTranscript("")}
                    className="text-sm text-[#A32D2D] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Xóa trắng</span>
                  </button>
                )}
              </div>
              <textarea
                id="farmer-transcript"
                rows={3}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Ví dụ: Tôi có một trăm hai mươi túi hạt điều. Mọi người có thể mua ăn để bổ sung sức khỏe..."
                className="w-full rounded-[14px] border-2 border-[#D6DED2] bg-white p-4 text-[19px] text-[#25352B] focus:border-[#245B3D] focus:ring-2 focus:ring-[#245B3D]/20 outline-none leading-relaxed"
              />
            </div>

            {/* Navigation buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <Button
                variant="secondary"
                size="lg"
                className="min-h-[54px] px-6 text-[17px] font-semibold cursor-pointer"
                onClick={() => {
                  if (isRecording) handleStopRecording();
                  setStep(1);
                }}
              >
                Quay lại Bước 1 (Chọn ảnh)
              </Button>
              <Button
                variant="farmer"
                size="lg"
                disabled={isGeneratingDraft}
                className="min-h-[54px] px-8 text-[18px] font-bold shadow-md cursor-pointer"
                onClick={() => handleGenerateDraftWithAi()}
              >
                <Sparkles className="h-6 w-6" aria-hidden="true" />
                <span>Tạo bản nháp AI minh họa</span>
              </Button>
            </div>
          </Card>
        ) : null}

        {/* BƯỚC 3: XEM LẠI BẢN NHÁP AI & ĐĂNG BÁN */}
        {!publishedProduct && step === 3 ? (
          <Card id="step-3" className="p-6 sm:p-7 space-y-6">
            {isGeneratingDraft ? (
              <div className="py-16 text-center space-y-4">
                <div className="relative mx-auto h-16 w-16 flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#245B3D] opacity-30"></span>
                  <Sparkles className="h-10 w-10 text-[#245B3D] animate-spin" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-[#25352B]">
                    AI NAI Farm đang phân tích hình ảnh và lời nói của bác...
                  </p>
                  <p className="text-base text-[#52645A]">
                    Trợ lý AI đang trích xuất số lượng, đơn vị, giá bán từ lời kể của bác...
                  </p>
                </div>
              </div>
            ) : (
              <>
                <DemoBanner
                  title="Bản nháp do AI trích xuất — Bác kiểm tra kỹ lại nhé!"
                  detail={
                    aiDraftSource === "vision" || aiDraftSource === "deepseek-vision"
                      ? "✨ Trợ lý AI đã phân tích ảnh nông sản và lời nói của bác. Những trường bác chưa nói giá, số lượng hay đơn vị được ĐỂ TRỐNG để bác tự điền."
                      : "✨ Thông tin đã được trích xuất. Những trường còn thiếu được ĐỂ TRỐNG theo đúng lời kể của bác, bác điền nốt rồi bấm Đăng bán nhé."
                  }
                />

                <form onSubmit={handlePublish} className="space-y-5">
                  {/* Photo & Name Grid */}
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <div className="md:col-span-1 space-y-2">
                      <label className="block font-bold text-[#25352B] text-base">
                        Ảnh nông sản đăng bán
                      </label>
                      <div className="relative overflow-hidden rounded-[16px] border-2 border-[#D6DED2] bg-[#F5F3E9]">
                        <img
                          src={activePhotoSrc}
                          alt="Ảnh sản phẩm"
                          className="h-44 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="absolute bottom-2 right-2 rounded-[10px] bg-black/70 px-3 py-1.5 text-xs font-bold text-white hover:bg-black transition cursor-pointer"
                        >
                          Đổi ảnh khác
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <label
                          htmlFor="draft-name"
                          className="mb-1.5 block font-bold text-[#25352B] text-lg"
                        >
                          Tên sản phẩm hiển thị trên Chợ: <span className="text-[#A32D2D]">*</span>
                        </label>
                        <input
                          id="draft-name"
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                          placeholder="Ví dụ: Hạt điều rang củi vỏ lụa Đồng Nai..."
                          className="min-h-[52px] w-full rounded-[14px] border-2 border-[#D6DED2] bg-white px-4 text-lg font-bold text-[#25352B] focus:border-[#245B3D] focus:ring-2 focus:ring-[#245B3D]/20 outline-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="draft-category"
                          className="mb-1.5 block font-bold text-[#25352B] text-lg"
                        >
                          Nhóm phân loại sản phẩm:
                        </label>
                        <select
                          id="draft-category"
                          value={draftCategory}
                          onChange={(e) =>
                            setDraftCategory(e.target.value as Product["category"])
                          }
                          className="min-h-[52px] w-full rounded-[14px] border-2 border-[#D6DED2] bg-white px-4 text-base font-semibold text-[#25352B] focus:border-[#245B3D] focus:ring-2 focus:ring-[#245B3D]/20 outline-none cursor-pointer"
                        >
                          <option value="Trái cây tươi">Trái cây tươi</option>
                          <option value="Hạt & Cà phê">Hạt & Cà phê</option>
                          <option value="Mật ong & Đặc sản">Mật ong & Đặc sản</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Price, Stock, Unit Row */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Giá bán */}
                    <div className="rounded-[16px] border border-[#D6DED2] bg-[#FDFDFB] p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="draft-price"
                          className="font-bold text-[#25352B] text-base"
                        >
                          Giá bán (VNĐ) <span className="text-[#A32D2D]">*</span>
                        </label>
                        {!draftPrice && (
                          <span className="text-xs font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded">
                            (Chưa có — Bác điền nhé)
                          </span>
                        )}
                      </div>
                      <input
                        id="draft-price"
                        type="number"
                        min={1000}
                        step={1000}
                        placeholder="Ví dụ: 35000"
                        value={draftPrice}
                        onChange={(e) => setDraftPrice(e.target.value)}
                        className={`min-h-[52px] w-full rounded-[12px] border-2 px-4 text-xl font-bold tabular-nums outline-none ${!draftPrice
                            ? "border-[#F59E0B] bg-[#FFFBEB] text-[#D97706]"
                            : "border-[#D6DED2] bg-white text-[#245B3D]"
                          }`}
                      />
                      <p className="text-xs text-[#52645A]">
                        {draftPrice ? `Hiển thị: ${formatVnd(Number(draftPrice))}` : "Để trống nếu lời nói chưa có"}
                      </p>
                    </div>

                    {/* Số lượng mở bán */}
                    <div className="rounded-[16px] border border-[#D6DED2] bg-[#FDFDFB] p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="draft-stock"
                          className="font-bold text-[#25352B] text-base"
                        >
                          Số lượng mở bán <span className="text-[#A32D2D]">*</span>
                        </label>
                        {!draftStock && (
                          <span className="text-xs font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded">
                            (Chưa có — Bác điền nhé)
                          </span>
                        )}
                      </div>
                      <input
                        id="draft-stock"
                        type="number"
                        min={1}
                        placeholder="Ví dụ: 120"
                        value={draftStock}
                        onChange={(e) => setDraftStock(e.target.value)}
                        className={`min-h-[52px] w-full rounded-[12px] border-2 px-4 text-xl font-bold tabular-nums outline-none ${!draftStock
                            ? "border-[#F59E0B] bg-[#FFFBEB] text-[#D97706]"
                            : "border-[#D6DED2] bg-white text-[#25352B]"
                          }`}
                      />
                      <p className="text-xs text-[#52645A]">
                        {draftStock ? `Tổng số lượng: ${draftStock} ${draftUnit || "đơn vị"}` : "Để trống nếu lời nói chưa có"}
                      </p>
                    </div>

                    {/* Đơn vị tính có validation & cảnh báo */}
                    <div className="rounded-[16px] border border-[#D6DED2] bg-[#FDFDFB] p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="draft-unit"
                          className="font-bold text-[#25352B] text-base"
                        >
                          Đơn vị tính <span className="text-[#A32D2D]">*</span>
                        </label>
                        {!draftUnit.trim() && (
                          <span className="text-xs font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded">
                            (Chưa có — Bác điền nhé)
                          </span>
                        )}
                      </div>
                      <input
                        id="draft-unit"
                        placeholder="Ví dụ: túi, kg, hộp, gói..."
                        value={draftUnit}
                        onChange={(e) => setDraftUnit(e.target.value)}
                        className={`min-h-[52px] w-full rounded-[12px] border-2 px-4 text-base font-semibold outline-none ${!draftUnit.trim()
                            ? "border-[#F59E0B] bg-[#FFFBEB] text-[#D97706]"
                            : "border-[#D6DED2] bg-white text-[#25352B]"
                          }`}
                      />
                      <p className="text-xs text-[#52645A]">
                        {!draftUnit.trim() ? "Bắt buộc điền đơn vị (túi, gói, kg, hộp...)" : "Đơn vị tính cho mỗi lượt bán"}
                      </p>
                    </div>
                  </div>

                  {/* Batch Code */}
                  <div>
                    <label
                      htmlFor="draft-batch"
                      className="mb-1.5 block font-bold text-[#25352B] text-base"
                    >
                      Mã lô QR truy xuất OCOP (Tự động tạo theo chuẩn Đồng Nai):
                    </label>
                    <input
                      id="draft-batch"
                      value={draftBatchCode}
                      onChange={(e) => setDraftBatchCode(e.target.value)}
                      className="min-h-[50px] w-full rounded-[12px] border border-[#D6DED2] bg-[#F5F3E9] px-4 text-base font-bold text-[#245B3D] tabular-nums"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="draft-desc"
                      className="mb-1.5 block font-bold text-[#25352B] text-base"
                    >
                      Lời tâm sự giới thiệu nông sản gửi đến người tiêu dùng:
                    </label>
                    <textarea
                      id="draft-desc"
                      rows={3}
                      value={draftDescription}
                      onChange={(e) => setDraftDescription(e.target.value)}
                      placeholder="Mô tả về độ ngọt, quy trình chăm sóc tự nhiên tại vườn..."
                      className="w-full rounded-[14px] border-2 border-[#D6DED2] bg-white p-4 text-base text-[#25352B] focus:border-[#245B3D] outline-none leading-relaxed"
                    />
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#D6DED2]">
                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      className="min-h-[54px] px-6 text-[17px] font-semibold cursor-pointer"
                      onClick={() => setStep(2)}
                    >
                      Sửa lại lời nói (Bước 2)
                    </Button>
                    <Button
                      type="submit"
                      variant="farmer"
                      size="lg"
                      className="min-h-[56px] px-8 text-[19px] font-extrabold shadow-lg hover:scale-101 transition cursor-pointer"
                    >
                      <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                      <span>Xác nhận & Đăng bán lên Chợ OCOP</span>
                    </Button>
                  </div>
                </form>
              </>
            )}
          </Card>
        ) : null}
      </div>
    </WorkspaceShell>
  );
}
