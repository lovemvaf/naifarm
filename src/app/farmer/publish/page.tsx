"use client";

import Image from "next/image";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Mic,
  MicOff,
  QrCode,
  Sparkles,
  Square,
  Upload,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell";
import { Badge, Button, Card, DemoBanner } from "@/components/ui/Primitives";
import { formatVnd } from "@/lib/format";
import type { Product } from "@/types/naifarm";
import { assetUrl } from "@/lib/storage/assets";
import { uploadImage } from "@/lib/storage/upload";

const SAMPLE_PHOTOS = [
  {
    id: "rambutan",
    label: "Chôm chôm Java mới hái",
    src: "stitch/stitch-40.webp",
    defaultName: "Chôm chôm Java Long Khánh mới hái",
    defaultCategory: "Trái cây tươi" as Product["category"],
    defaultPrice: 35000,
    defaultStock: 30,
    defaultTranscript: "Tôi có 30 ký chôm chôm Java hái sáng nay, bán 35 nghìn một ký.",
  },
  {
    id: "durian",
    label: "Sầu riêng Ri6 tại vườn",
    src: "stitch/stitch-49.webp",
    defaultName: "Sầu riêng Ri6 chín cây vườn Ba Tư",
    defaultCategory: "Trái cây tươi" as Product["category"],
    defaultPrice: 120000,
    defaultStock: 25,
    defaultTranscript: "Hôm nay vườn có khoảng 25 ký sầu riêng Ri6 tuyển chọn, bán 120 nghìn một ký.",
  },
  {
    id: "pomelo",
    label: "Bưởi da xanh Tân Triều",
    src: "stitch/stitch-53.webp",
    defaultName: "Bưởi da xanh Cù lao Tân Triều lứa mới",
    defaultCategory: "Trái cây tươi" as Product["category"],
    defaultPrice: 55000,
    defaultStock: 40,
    defaultTranscript: "Sáng nay tôi cắt 40 ký bưởi da xanh ruột hồng, giá 55 nghìn một ký.",
  },
  {
    id: "cashew",
    label: "Hạt điều rang củi đóng hộp",
    src: "stitch/stitch-39.webp",
    defaultName: "Hạt điều rang củi vỏ lụa đóng gói mới",
    defaultCategory: "Hạt & Cà phê" as Product["category"],
    defaultPrice: 145000,
    defaultStock: 20,
    defaultTranscript: "Tôi vừa rang 20 hộp hạt điều vỏ lụa 500 gam, bán 145 nghìn một hộp.",
  },
];

export default function FarmerPublishWizardPage() {
  const { setActiveWorkspace, setHideAiChatOnSubflow, publishFarmerProduct, profile } =
    useDemoStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSampleId, setSelectedSampleId] = useState<string>("rambutan");
  const [customPhotoKey, setCustomPhotoKey] = useState<string | null>(null);
  const [customPhotoPreview, setCustomPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Voice simulation states (Step 2)
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [micSimulatedError, setMicSimulatedError] = useState(false);
  const [transcript, setTranscript] = useState(SAMPLE_PHOTOS[0].defaultTranscript);

  // AI Draft generation & Step 3 editable fields
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [draftName, setDraftName] = useState(SAMPLE_PHOTOS[0].defaultName);
  const [draftCategory, setDraftCategory] = useState<Product["category"]>(
    SAMPLE_PHOTOS[0].defaultCategory
  );
  const [draftPrice, setDraftPrice] = useState(String(SAMPLE_PHOTOS[0].defaultPrice));
  const [draftUnit, setDraftUnit] = useState("kg");
  const [draftStock, setDraftStock] = useState(String(SAMPLE_PHOTOS[0].defaultStock));
  const [draftBatchCode, setDraftBatchCode] = useState("NF-BT-2026-09");
  const [draftDescription, setDraftDescription] = useState(
    "Chôm chôm Java hái đầu buổi sáng tại vườn Ba Tư (Long Khánh), cơm dày, tróc hạt tự nhiên."
  );

  const [publishedProduct, setPublishedProduct] = useState<Product | null>(null);

  useEffect(() => {
    setActiveWorkspace("W02");
    return () => {
      setHideAiChatOnSubflow(false);
    };
  }, [setActiveWorkspace, setHideAiChatOnSubflow]);

  // Hide floating NaiAI widget when actively recording so the 56px Stop button is unobstructed
  useEffect(() => {
    setHideAiChatOnSubflow(isRecording);
  }, [isRecording, setHideAiChatOnSubflow]);

  useEffect(() => {
    if (!isRecording) return;
    const id = window.setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRecording]);

  const activePhotoSrc =
    customPhotoKey ??
    SAMPLE_PHOTOS.find((p) => p.id === selectedSampleId)?.src ??
    SAMPLE_PHOTOS[0].src;
  const activePhotoPreview = customPhotoPreview ?? assetUrl(activePhotoSrc);

  const handleSelectSamplePhoto = (sample: (typeof SAMPLE_PHOTOS)[number]) => {
    setCustomPhotoKey(null);
    setCustomPhotoPreview(null);
    setSelectedSampleId(sample.id);
    setTranscript(sample.defaultTranscript);
    setDraftName(sample.defaultName);
    setDraftCategory(sample.defaultCategory);
    setDraftPrice(String(sample.defaultPrice));
    setDraftStock(String(sample.defaultStock));
    setDraftUnit(sample.id === "cashew" ? "hộp 500g" : "kg");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomPhotoPreview(URL.createObjectURL(file));
    setUploadingPhoto(true);
    try {
      const key = await uploadImage("product-images", file);
      setCustomPhotoKey(key);
      toast.success(`Đã nén WebP và tải ảnh "${file.name}" lên Supabase Storage.`);
    } catch {
      setCustomPhotoKey(null);
      setCustomPhotoPreview(null);
      toast.error("Không tải được ảnh lên Supabase Storage. Vui lòng thử lại.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleStopRecordingAndGenerate = () => {
    setIsRecording(false);
    setMicSimulatedError(false);
    const chosen = SAMPLE_PHOTOS.find((p) => p.id === selectedSampleId) ?? SAMPLE_PHOTOS[0];
    if (!transcript.trim()) {
      setTranscript(chosen.defaultTranscript);
    }
    buildDraftFromTranscript(transcript.trim() || chosen.defaultTranscript);
  };

  const buildDraftFromTranscript = (spokenText: string) => {
    setIsGeneratingDraft(true);
    setStep(3);
    const lower = spokenText.toLowerCase();

    // Parse simple numbers cleanly from Vietnamese farmer phrase if user typed custom values
    const kgMatch = lower.match(/(\d+)\s*(ký|kg|hộp)/i);
    const priceMatch = lower.match(/(\d+)\s*(nghìn|ngàn|k)/i);
    if (kgMatch) setDraftStock(kgMatch[1]);
    if (priceMatch) setDraftPrice(String(Number(priceMatch[1]) * 1000));

    if (lower.includes("sầu riêng")) {
      setDraftName("Sầu riêng Ri6 hái mới — Nhà vườn Ba Tư");
      setDraftCategory("Trái cây tươi");
      setDraftDescription(
        `AI gợi ý từ mô tả của bác: Sầu riêng Ri6 thu hoạch trực tiếp tại vườn Long Khánh ("${spokenText}").`
      );
    } else if (lower.includes("bưởi")) {
      setDraftName("Bưởi da xanh Tân Triều hái sáng nay");
      setDraftCategory("Trái cây tươi");
      setDraftDescription(
        `AI gợi ý từ mô tả của bác: Bưởi da xanh múi hồng mọng nước ("${spokenText}").`
      );
    } else if (lower.includes("điều")) {
      setDraftName("Hạt điều rang củi vỏ lụa Đồng Nai");
      setDraftCategory("Hạt & Cà phê");
      setDraftDescription(
        `AI gợi ý từ mô tả của bác: Hạt điều rang củi giữ nguyên vỏ lụa giòn bùi ("${spokenText}").`
      );
    } else {
      setDraftName((prev) => prev || "Chôm chôm Java hái sáng nay — Nhà vườn Ba Tư");
      setDraftDescription(
        `AI gợi ý từ mô tả của bác: "${spokenText}". Thu hoạch sáng nay tại Long Khánh, cân đúng ký tại vườn.`
      );
    }

    window.setTimeout(() => {
      setIsGeneratingDraft(false);
    }, 450);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadingPhoto) {
      toast.error("Ảnh đang được tải lên, vui lòng đợi trong giây lát.");
      return;
    }
    if (!profile?.farmId) {
      toast.error("Tài khoản chưa được gắn với nhà vườn. Vui lòng liên hệ quản trị viên.");
      return;
    }
    const numericPrice = Number(draftPrice);
    const numericStock = Number(draftStock);
    if (!draftName.trim() || !numericPrice || numericPrice <= 0 || !numericStock || numericStock <= 0) {
      toast.error("Bác vui lòng kiểm tra lại tên sản phẩm, giá bán và số lượng lớn hơn 0.");
      return;
    }

    try {
      const created = await publishFarmerProduct({
        name: draftName.trim(),
        category: draftCategory,
        priceVnd: numericPrice,
        unitLabel: draftUnit.trim() || "kg",
        stockKg: numericStock,
        batchCode: draftBatchCode.trim() || `NF-BT-${Date.now().toString().slice(-4)}`,
        shortDescription: draftDescription.trim(),
        image: activePhotoSrc,
        farmId: profile.farmId,
      });

      setPublishedProduct(created);
      setHideAiChatOnSubflow(false);
      toast.success(`Đã đăng "${created.name}" lên Chợ OCOP NaiFarm!`);
    } catch {
      toast.error("Không đăng được sản phẩm. Bác kiểm tra lại đăng nhập và thử lại.");
    }
  };

  return (
    <WorkspaceShell
      workspaceId="W02"
      title="Đăng bán nông sản 3 bước"
      subtitle="Không cần điền bảng phức tạp — chọn ảnh, nói hoặc gõ mô tả, kiểm tra và đăng ngay"
      scopeBadge="AI tạo bản nháp minh họa — Bác kiểm tra lại"
      navItems={[
        {
          label: "Quay về Không gian Nhà vườn",
          href: "/farmer",
          icon: <ArrowLeft className="h-5 w-5" aria-hidden="true" />,
        },
        {
          label: "Bước 1: Chọn ảnh",
          href: "#step-1",
          active: step === 1 && !publishedProduct,
          onClick: () => {
            setPublishedProduct(null);
            setStep(1);
          },
          icon: <Camera className="h-5 w-5" aria-hidden="true" />,
        },
        {
          label: "Bước 2: Nói hoặc gõ",
          href: "#step-2",
          active: step === 2 && !publishedProduct,
          onClick: () => {
            setPublishedProduct(null);
            setStep(2);
          },
          icon: <Mic className="h-5 w-5" aria-hidden="true" />,
        },
        {
          label: "Bước 3: Xem lại & Đăng",
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
        {/* 3-step high-contrast progress bar */}
        <ol className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            { num: 1 as const, label: "1. Chụp / chọn ảnh" },
            { num: 2 as const, label: "2. Nói hoặc gõ mô tả" },
            { num: 3 as const, label: "3. Kiểm tra & Đăng bán" },
          ].map((item) => {
            const isCurrent = step === item.num && !publishedProduct;
            const isDone = publishedProduct !== null || step > item.num;
            return (
              <li
                key={item.num}
                className={`flex min-h-[52px] items-center justify-center rounded-[14px] border-2 px-4 text-center font-bold ${
                  isCurrent
                    ? "border-primary bg-primary text-white"
                    : isDone
                    ? "border-leaf bg-success-bg text-success"
                    : "border-border bg-white text-muted"
                }`}
              >
                {item.label}
              </li>
            );
          })}
        </ol>

        {/* Published Celebration State */}
        {publishedProduct ? (
          <Card className="border-2 border-success bg-white p-6 sm:p-8">
            <div className="flex flex-col items-start gap-5 md:flex-row md:items-center">
              <Image
                src={assetUrl(publishedProduct.image)}
                alt={publishedProduct.name}
                className="h-44 w-full rounded-[16px] object-cover md:w-56"
                width={512}
                height={279}
              />
              <div className="space-y-3">
                <Badge tone="success">Đã đăng bán thành công trên Chợ OCOP</Badge>
                <h2 className="text-2xl font-bold text-foreground">{publishedProduct.name}</h2>
                <p className="text-lg font-bold text-primary tabular-nums">
                  {formatVnd(publishedProduct.priceVnd)} / {publishedProduct.unitLabel} · Sẵn có{" "}
                  {publishedProduct.stockKg} {publishedProduct.unitLabel}
                </p>
                <p className="text-sm text-muted">
                  Mã lô truy xuất tự động: <span className="font-bold text-foreground">{publishedProduct.batchCode}</span>
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href={`/products/${publishedProduct.slug}`}
                    className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-primary px-6 font-bold text-white hover:bg-primary-hover"
                  >
                    Xem sản phẩm ngoài Chợ ngay
                  </Link>
                  <Link
                    href={`/trace/${publishedProduct.batchCode}`}
                    className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[12px] border border-primary bg-white px-5 font-semibold text-primary hover:bg-surface-soft"
                  >
                    <QrCode className="h-5 w-5" aria-hidden="true" />
                    <span>Xem hộ chiếu QR</span>
                  </Link>
                  <Link
                    href="/farmer"
                    className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] border border-border bg-background px-5 font-semibold text-foreground"
                  >
                    Về Không gian Nhà vườn
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ) : null}

        {/* STEP 1: PHOTO PICKER */}
        {!publishedProduct && step === 1 ? (
          <Card id="step-1" className="p-6 space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Bước 1: Chọn ảnh nông sản của bác</h2>
              <p className="text-base text-muted">
                Bác có thể bấm nhanh một ảnh mẫu vườn Đồng Nai hoặc tải ảnh thật từ điện thoại.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SAMPLE_PHOTOS.map((sample) => {
                const selected = !customPhotoKey && selectedSampleId === sample.id;
                return (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSamplePhoto(sample)}
                    className={`overflow-hidden rounded-[16px] border-2 text-left transition cursor-pointer ${
                      selected
                        ? "border-primary ring-2 ring-primary/30 bg-surface-soft"
                        : "border-border bg-white hover:border-leaf"
                    }`}
                  >
                    <Image
                      src={assetUrl(sample.src)}
                      alt={sample.label}
                      className="h-36 w-full object-cover"
                      width={512}
                      height={279}
                    />
                    <div className="p-3">
                      <p className="font-bold text-foreground">{sample.label}</p>
                      <p className="text-sm font-semibold text-primary tabular-nums">
                        {formatVnd(sample.defaultPrice)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-dashed border-input bg-background p-4">
              <div className="flex items-center gap-3">
                <Image
                  src={activePhotoPreview}
                  alt="Ảnh đã chọn"
                  className="h-16 w-16 rounded-[10px] object-cover border border-border"
                  width={512}
                  height={279}
                />
                <div>
                  <p className="font-bold text-foreground">Hoặc tải ảnh từ máy / điện thoại</p>
                  <p className="text-sm text-muted">
                    Tự động nén WebP và lưu trên Supabase Storage
                  </p>
                </div>
              </div>
              <label className="inline-flex min-h-[48px] items-center gap-2 rounded-[12px] border border-primary bg-white px-5 font-semibold text-primary hover:bg-surface-soft cursor-pointer">
                <Upload className="h-5 w-5" aria-hidden="true" />
                <span>Chọn ảnh từ máy</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
            </div>

            <div className="flex justify-end">
              <Button variant="farmer" onClick={() => setStep(2)}>
                Tiếp tục sang Bước 2 (Nói hoặc gõ mô tả)
              </Button>
            </div>
          </Card>
        ) : null}

        {/* STEP 2: VOICE SIMULATION + FALLBACK TEXT */}
        {!publishedProduct && step === 2 ? (
          <Card id="step-2" className="p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Bước 2: Nói tự nhiên về nông sản hôm nay
                </h2>
                <p className="text-base text-muted">
                  Ví dụ: &ldquo;Tôi có 30 ký chôm chôm Java hái sáng nay, bán 35 nghìn một ký.&rdquo;
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsRecording(false);
                  setMicSimulatedError((prev) => !prev);
                }}
                className="min-h-[44px] rounded-full border border-border bg-background px-4 text-sm font-semibold text-muted hover:bg-surface-soft cursor-pointer"
              >
                {micSimulatedError ? "Đóng chế độ lỗi mic" : "Thử trạng thái lỗi mic (Fallback)"}
              </button>
            </div>

            {micSimulatedError ? (
              <div
                role="alert"
                className="rounded-[14px] border border-danger/35 bg-danger-bg p-4 text-danger"
              >
                <div className="flex items-start gap-2.5">
                  <MicOff className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-bold">Chưa thu được tiếng micro (Trạng thái dự phòng)</p>
                    <p className="text-sm">
                      Trình duyệt chưa cấp quyền micro hoặc vườn đang ồn. Bác hãy gõ vài chữ ngắn
                      vào khung bên dưới hoặc bấm &ldquo;Dùng câu mẫu Chú Ba Tư&rdquo;.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="rounded-[16px] border border-border bg-background p-5 text-center space-y-4">
              {isRecording ? (
                <>
                  <p className="text-lg font-bold text-danger tabular-nums">
                    Đang ghi âm mô phỏng: 00:{String(recordSeconds).padStart(2, "0")}
                  </p>
                  <p className="mx-auto max-w-xl rounded-[12px] bg-white px-4 py-3 text-base italic text-foreground">
                    &ldquo;{transcript}&rdquo;
                  </p>
                  <Button
                    variant="destructive"
                    size="lg"
                    className="min-h-[58px] px-8 text-[18px] font-bold"
                    onClick={handleStopRecordingAndGenerate}
                  >
                    <Square className="h-5 w-5 fill-current" aria-hidden="true" />
                    <span>Dừng ghi âm & Tạo bản nháp</span>
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Button
                    variant="farmer"
                    onClick={() => {
                      setMicSimulatedError(false);
                      setRecordSeconds(1);
                      setIsRecording(true);
                    }}
                  >
                    <Mic className="h-6 w-6" aria-hidden="true" />
                    <span>Bấm để nói mô tả sản phẩm</span>
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setTranscript("Tôi có 30 ký chôm chôm Java hái sáng nay, bán 35 nghìn một ký.");
                      toast.success("Đã điền câu mẫu Chú Ba Tư Long Khánh.");
                    }}
                    className="min-h-[44px] rounded-full border border-primary bg-white px-4 text-sm font-semibold text-primary hover:bg-surface-soft cursor-pointer"
                  >
                    Điền nhanh câu mẫu Chú Ba Tư (30 ký · 35 nghìn)
                  </button>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="farmer-transcript" className="mb-1.5 block font-bold text-foreground">
                Nội dung lời nói / chữ bác muốn AI chuyển thành tin đăng:
              </label>
              <textarea
                id="farmer-transcript"
                rows={3}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full rounded-[12px] border border-border bg-white p-4 text-[18px] text-foreground"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button variant="secondary" size="lg" onClick={() => setStep(1)}>
                Quay lại Bước 1
              </Button>
              <Button
                variant="farmer"
                onClick={() => buildDraftFromTranscript(transcript.trim() || SAMPLE_PHOTOS[0].defaultTranscript)}
              >
                <Sparkles className="h-5 w-5" aria-hidden="true" />
                <span>Tạo bản nháp AI minh họa</span>
              </Button>
            </div>
          </Card>
        ) : null}

        {/* STEP 3: REVIEW AI DRAFT & PUBLISH (S10) */}
        {!publishedProduct && step === 3 ? (
          <Card id="step-3" className="p-6 space-y-5">
            {isGeneratingDraft ? (
              <div className="py-12 text-center space-y-3">
                <Sparkles className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
                <p className="text-xl font-bold text-foreground">
                  Đang sắp xếp lời nói của bác thành bản nháp...
                </p>
                <p className="text-base text-muted">Vui lòng đợi trong giây lát.</p>
              </div>
            ) : (
              <>
                <DemoBanner
                  title="AI gợi ý minh họa — vui lòng kiểm tra lại"
                  detail="Hệ thống điền sẵn từ câu mô tả của bác. Bác có thể sửa trực tiếp tên hàng, giá bán, số lượng trước khi bấm Đăng."
                />

                <form onSubmit={handlePublish} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="draft-name" className="mb-1.5 block font-bold text-foreground">
                        Tên sản phẩm hiển thị trên Chợ
                      </label>
                      <input
                        id="draft-name"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        className="min-h-[50px] w-full rounded-[12px] border border-border bg-white px-4 text-base text-foreground"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="draft-category"
                        className="mb-1.5 block font-bold text-foreground"
                      >
                        Nhóm sản phẩm
                      </label>
                      <select
                        id="draft-category"
                        value={draftCategory}
                        onChange={(e) => setDraftCategory(e.target.value as Product["category"])}
                        className="min-h-[50px] w-full rounded-[12px] border border-border bg-white px-4 text-base text-foreground"
                      >
                        <option value="Trái cây tươi">Trái cây tươi</option>
                        <option value="Hạt & Cà phê">Hạt & Cà phê</option>
                        <option value="Mật ong & Đặc sản">Mật ong & Đặc sản</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label htmlFor="draft-price" className="mb-1.5 block font-bold text-foreground">
                        Giá bán (VNĐ)
                      </label>
                      <input
                        id="draft-price"
                        type="number"
                        min={1000}
                        step={1000}
                        value={draftPrice}
                        onChange={(e) => setDraftPrice(e.target.value)}
                        className="min-h-[50px] w-full rounded-[12px] border border-border bg-white px-4 text-base font-bold text-primary tabular-nums"
                      />
                    </div>
                    <div>
                      <label htmlFor="draft-stock" className="mb-1.5 block font-bold text-foreground">
                        Số lượng mở bán
                      </label>
                      <input
                        id="draft-stock"
                        type="number"
                        min={1}
                        value={draftStock}
                        onChange={(e) => setDraftStock(e.target.value)}
                        className="min-h-[50px] w-full rounded-[12px] border border-border bg-white px-4 text-base font-bold text-foreground tabular-nums"
                      />
                    </div>
                    <div>
                      <label htmlFor="draft-unit" className="mb-1.5 block font-bold text-foreground">
                        Đơn vị tính
                      </label>
                      <input
                        id="draft-unit"
                        value={draftUnit}
                        onChange={(e) => setDraftUnit(e.target.value)}
                        className="min-h-[50px] w-full rounded-[12px] border border-border bg-white px-4 text-base text-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="draft-batch" className="mb-1.5 block font-bold text-foreground">
                      Mã lô QR tự tạo (có thể sửa)
                    </label>
                    <input
                      id="draft-batch"
                      value={draftBatchCode}
                      onChange={(e) => setDraftBatchCode(e.target.value)}
                      className="min-h-[50px] w-full rounded-[12px] border border-border bg-white px-4 text-base font-semibold text-primary tabular-nums"
                    />
                  </div>

                  <div>
                    <label htmlFor="draft-desc" className="mb-1.5 block font-bold text-foreground">
                      Lời giới thiệu cho người mua
                    </label>
                    <textarea
                      id="draft-desc"
                      rows={3}
                      value={draftDescription}
                      onChange={(e) => setDraftDescription(e.target.value)}
                      className="w-full rounded-[12px] border border-border bg-white p-4 text-base text-foreground"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <Button type="button" variant="secondary" size="lg" onClick={() => setStep(2)}>
                      Sửa lại lời nói (Bước 2)
                    </Button>
                    <Button type="submit" variant="farmer">
                      <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                      <span>Xác nhận & Đăng bán lên Chợ</span>
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
