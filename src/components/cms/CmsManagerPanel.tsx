"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Download,
  Eye,
  FileJson,
  History,
  ImagePlus,
  Laptop,
  RotateCcw,
  Save,
  Send,
  Smartphone,
  Tablet,
  Upload,
} from "lucide-react";
import { useCms } from "@/context/CmsContext";
import { useLocale } from "@/context/LocaleContext";
import { useSeasonalTheme } from "@/context/SeasonalThemeContext";
import type { SeasonalThemeId } from "@/lib/seasonal/themes";
import { ASSET_MANIFEST } from "@/data/reference/asset-manifest";
import { validateUploadImageFile } from "@/lib/cms/idb-storage";
import { cn } from "@/lib/format";
import { notifyError, notifySuccess } from "@/lib/toast";
import { Badge, Button, Card, DemoBanner } from "@/components/ui/Primitives";

interface CmsManagerPanelProps {
  scopeMode: "full" | "farmer" | "organization";
  actorName: string;
}

export function CmsManagerPanel({ scopeMode, actorName }: CmsManagerPanelProps) {
  const { locale } = useLocale();
  const isEn = locale === "en";
  const {
    activeTheme,
    allThemes,
    override,
    isOverrideActive,
    setPreviewTheme,
    setDecorationsEnabled,
    resetSeasonalOverride,
  } = useSeasonalTheme();
  const {
    cmsReady,
    blocks,
    revisions,
    assets,
    saveDraft,
    submitForReview,
    publishLocal,
    rollbackRevision,
    registerUploadedAsset,
    exportCmsJson,
    importCmsJson,
    resetCmsDefaults,
  } = useCms();

  const scopedBlocks = useMemo(() => {
    if (scopeMode === "farmer") return blocks.filter((b) => b.scope === "farmer" || b.scope === "product");
    if (scopeMode === "organization") return blocks.filter((b) => b.scope === "organization" || b.scope === "banner");
    return blocks;
  }, [blocks, scopeMode]);

  const [selectedId, setSelectedId] = useState<string>(scopedBlocks[0]?.id ?? "hero.main");
  const currentBlock = scopedBlocks.find((b) => b.id === selectedId) ?? scopedBlocks[0];

  const [viTitle, setViTitle] = useState(currentBlock?.draftViTitle ?? "");
  const [enTitle, setEnTitle] = useState(currentBlock?.draftEnTitle ?? "");
  const [viBody, setViBody] = useState(currentBlock?.draftViBody ?? "");
  const [enBody, setEnBody] = useState(currentBlock?.draftEnBody ?? "");
  const [imageUrl, setImageUrl] = useState(currentBlock?.imageUrl ?? "");
  const [focalPoint, setFocalPoint] = useState(currentBlock?.focalPoint ?? "50% 50%");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewLocale, setPreviewLocale] = useState<"vi" | "en">(locale);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const selectBlock = (id: string) => {
    setSelectedId(id);
    const next = blocks.find((b) => b.id === id);
    if (next) {
      setViTitle(next.draftViTitle);
      setEnTitle(next.draftEnTitle);
      setViBody(next.draftViBody);
      setEnBody(next.draftEnBody);
      setImageUrl(next.imageUrl ?? "");
      setFocalPoint(next.focalPoint ?? "50% 50%");
    }
  };

  if (!cmsReady || !currentBlock) {
    return (
      <Card className="p-6 text-sm text-[#52645A]">
        {isEn ? "Initializing IndexedDB local CMS..." : "Đang mở bộ lưu trữ CMS cục bộ IndexedDB..."}
      </Card>
    );
  }

  const blockRevisions = revisions.filter((r) => r.blockId === currentBlock.id);
  const statusCount = {
    published: scopedBlocks.filter((b) => b.status === "published").length,
    inReview: scopedBlocks.filter((b) => b.status === "in_review").length,
    draft: scopedBlocks.filter((b) => b.status === "draft").length,
  };

  const handleSaveDraft = async () => {
    await saveDraft(
      currentBlock.id,
      {
        draftViTitle: viTitle,
        draftEnTitle: enTitle,
        draftViBody: viBody,
        draftEnBody: enBody,
        imageUrl: imageUrl || undefined,
        focalPoint,
      },
      actorName,
    );
    notifySuccess(isEn ? "Saved CMS draft to IndexedDB." : "Đã lưu bản nháp vào IndexedDB.");
  };

  const handleSubmitReview = async () => {
    await handleSaveDraft();
    await submitForReview(currentBlock.id, actorName);
    notifySuccess(isEn ? "Submitted block for review." : "Đã gửi khối nội dung chờ duyệt.");
  };

  const handlePublishLocal = async () => {
    await saveDraft(
      currentBlock.id,
      {
        draftViTitle: viTitle,
        draftEnTitle: enTitle,
        draftViBody: viBody,
        draftEnBody: enBody,
        imageUrl: imageUrl || undefined,
        focalPoint,
      },
      actorName,
    );
    await publishLocal(currentBlock.id, actorName);
    notifySuccess(
      isEn
        ? `Published "${currentBlock.labelEn}" locally — live across this browser.`
        : `Đã xuất bản cục bộ "${currentBlock.labelVi}" — cập nhật ngay trên giao diện.`,
    );
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const valid = validateUploadImageFile(file);
    if (!valid.ok) {
      notifyError(valid.reason);
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result ?? "");
      if (!dataUrl.startsWith("data:image/")) return;
      await registerUploadedAsset({
        assetId: `UP-${Date.now()}`,
        name: file.name,
        mime: file.type,
        bytes: file.size,
        dataUrl,
        uploadedAtIso: new Date().toISOString(),
      });
      setImageUrl(dataUrl);
      notifySuccess(isEn ? `Uploaded ${file.name} to IndexedDB.` : `Đã lưu ảnh ${file.name} vào IndexedDB.`);
    };
    reader.readAsDataURL(file);
  };

  const handleExportJson = () => {
    const json = exportCmsJson();
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `naifarm-cms-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 2500);
    notifySuccess(isEn ? "Exported CMS JSON backup." : "Đã xuất bản sao lưu JSON CMS.");
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await importCmsJson(String(reader.result ?? ""), actorName);
      if (res.ok) {
        notifySuccess(res.message);
      } else {
        notifyError(res.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5">
      <DemoBanner
        title={isEn ? "IndexedDB Local Website CMS (Browser Persistence)" : "Quản trị Nội dung Website Cục bộ (IndexedDB CMS)"}
        detail={
          isEn
            ? "Edits published here take effect immediately in your browser and include version rollback + JSON backup. No public cloud mutation occurs without Supabase credentials."
            : "Bản xuất bản lưu trong IndexedDB sẽ cập nhật tức thì trên giao diện trình duyệt này kèm lịch sử rollback và xuất/nhập JSON (không tự ghi lên máy chủ ngoài)."
        }
      />

      {/* V9 Seasonal & Festival Decoration Engine Control (11 Themes, Preview, Toggle & Auto-Expiry) */}
      {scopeMode !== "farmer" ? (
        <Card className="space-y-3 border-[#245B3D]/30 bg-[#FAF8F1] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-[#25352B]">
                {isEn
                  ? "Seasonal & Festival Theme Engine (11 Themes · Vietnam Calendar)"
                  : "Hệ thống Giao diện Sự kiện & Mùa vụ (11 chủ đề · Lịch Việt Nam)"}
              </p>
              <p className="text-xs text-[#52645A]">
                {isEn
                  ? `Currently active: ${activeTheme.nameEn}${isOverrideActive ? " (Manual Preview Override)" : " (Auto Calendar)"}`
                  : `Đang hiển thị: ${activeTheme.nameVi}${isOverrideActive ? " (Xem trước thủ công)" : " (Tự động theo lịch)"}`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#D6DED2] bg-white px-3 py-1.5 text-xs font-semibold text-[#25352B]">
                <input
                  type="checkbox"
                  checked={override.decorationsEnabled}
                  onChange={(e) => setDecorationsEnabled(e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#245B3D]"
                />
                <span>{isEn ? "Seasonal ornaments" : "Trang trí mùa vụ"}</span>
              </label>
              {isOverrideActive ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    resetSeasonalOverride();
                    notifySuccess(
                      isEn
                        ? "Restored automatic seasonal calendar resolution."
                        : "Đã quay về chế độ tự động theo lịch sự kiện Việt Nam.",
                    );
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isEn ? "Auto Calendar" : "Về lịch tự động"}</span>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {allThemes.map((themeItem) => {
              const selected = activeTheme.id === themeItem.id;
              return (
                <button
                  key={themeItem.id}
                  type="button"
                  onClick={() => {
                    const expires24h = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
                    setPreviewTheme(themeItem.id as SeasonalThemeId, expires24h);
                    notifySuccess(
                      isEn
                        ? `Previewing "${themeItem.nameEn}" (24h local override).`
                        : `Đang xem trước "${themeItem.nameVi}" (tự hoàn tác sau 24 giờ).`,
                    );
                  }}
                  className={cn(
                    "flex cursor-pointer flex-col items-start rounded-[12px] border p-2.5 text-left text-xs transition-colors",
                    selected
                      ? "border-[#245B3D] bg-[#EAF0E5] text-[#183D2A]"
                      : "border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#F5F3E9]",
                  )}
                >
                  <div className="flex w-full items-center justify-between gap-1">
                    <span className="font-bold line-clamp-1">
                      {isEn ? themeItem.nameEn : themeItem.nameVi}
                    </span>
                    <span
                      className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                      style={{ backgroundColor: themeItem.accentTokens.heroTitleColor }}
                      aria-hidden="true"
                    />
                  </div>
                  <span className="mt-1 text-[10.5px] text-[#52645A]">
                    {themeItem.startAt
                      ? `${themeItem.startAt.slice(5, 10)} → ${themeItem.endAt?.slice(5, 10)}`
                      : isEn
                      ? "Always / Manual"
                      : "Mặc định / Thủ công"}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      ) : null}

      {/* Top Status & Export/Import Strip */}
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge tone="success">Published: {statusCount.published}</Badge>
          <Badge tone="warning">Review: {statusCount.inReview}</Badge>
          <Badge tone="neutral">Draft: {statusCount.draft}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={handleExportJson}>
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isEn ? "Export JSON" : "Xuất JSON"}</span>
          </Button>
          <Button size="sm" variant="secondary" onClick={() => jsonInputRef.current?.click()}>
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isEn ? "Import JSON" : "Nhập JSON"}</span>
          </Button>
          <input
            ref={jsonInputRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={handleImportJson}
          />
          {scopeMode === "full" ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                await resetCmsDefaults();
                notifySuccess(isEn ? "CMS restored to defaults." : "Đã khôi phục nội dung CMS mặc định.");
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isEn ? "Reset CMS" : "Khôi phục gốc"}</span>
            </Button>
          ) : null}
        </div>
      </Card>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        {/* Left Sidebar: Content Slots */}
        <Card className="space-y-2 p-3 lg:col-span-4">
          <p className="px-2 text-xs font-bold text-[#52645A]">
            {isEn ? "Editable Content Slots" : "Vùng nội dung cho phép chỉnh sửa"}
          </p>
          {scopedBlocks.map((b) => {
            const active = b.id === currentBlock.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => selectBlock(b.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-[12px] border p-3 text-left text-xs transition cursor-pointer",
                  active
                    ? "border-[#245B3D] bg-[#EAF0E5] text-[#245B3D]"
                    : "border-[#D6DED2] bg-white hover:bg-[#FAF8F1]",
                )}
              >
                <div className="min-w-0">
                  <p className="truncate font-bold">{isEn ? b.labelEn : b.labelVi}</p>
                  <p className="truncate text-[11px] text-[#52645A]">
                    <FileJson className="mr-1 inline h-3 w-3" aria-hidden="true" />
                    {b.id}
                  </p>
                </div>
                <Badge
                  tone={b.status === "published" ? "success" : b.status === "in_review" ? "warning" : "neutral"}
                >
                  {b.status}
                </Badge>
              </button>
            );
          })}
        </Card>

        {/* Right Side-by-Side VI/EN Editor + Asset Picker + Multi-Device Preview */}
        <div className="space-y-4 lg:col-span-8">
          <Card className="space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAEFE6] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#25352B]">
                  {isEn ? currentBlock.labelEn : currentBlock.labelVi}
                </h3>
                <p className="text-[11px] text-[#52645A]">
                  {isEn ? "Last updated by" : "Cập nhật lần cuối"}: {currentBlock.updatedBy} ·{" "}
                  {currentBlock.updatedAtIso.slice(0, 16).replace("T", " ")}
                </p>
              </div>
              <Badge tone="info">{currentBlock.status.toUpperCase()}</Badge>
            </div>

            {/* Side-by-Side VI / EN Title & Body */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3">
                <p className="text-xs font-bold text-[#245B3D]">Tiếng Việt (VI)</p>
                <textarea
                  rows={2}
                  value={viTitle}
                  onChange={(e) => setViTitle(e.target.value)}
                  aria-label="Tiêu đề Tiếng Việt"
                  placeholder="Tiêu đề hiển thị (VI)"
                  className="min-h-[40px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 py-2 text-xs font-semibold"
                />
                <textarea
                  rows={3}
                  value={viBody}
                  onChange={(e) => setViBody(e.target.value)}
                  aria-label="Mô tả Tiếng Việt"
                  placeholder="Nội dung chi tiết (VI)"
                  className="w-full rounded-[10px] border border-[#788A7B] bg-white p-2.5 text-xs"
                />
              </div>

              <div className="space-y-2 rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3">
                <p className="text-xs font-bold text-[#245B3D]">English (EN)</p>
                <textarea
                  rows={2}
                  value={enTitle}
                  onChange={(e) => setEnTitle(e.target.value)}
                  aria-label="English title"
                  placeholder="Headline (EN)"
                  className="min-h-[40px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 py-2 text-xs font-semibold"
                />
                <textarea
                  rows={3}
                  value={enBody}
                  onChange={(e) => setEnBody(e.target.value)}
                  aria-label="English body"
                  placeholder="Supporting copy (EN)"
                  className="w-full rounded-[10px] border border-[#788A7B] bg-white p-2.5 text-xs"
                />
              </div>
            </div>

            {/* Media Asset Picker + Validated Upload + Focal Point */}
            <div className="grid grid-cols-1 gap-4 rounded-[12px] border border-[#D6DED2] bg-white p-3.5 md:grid-cols-12">
              <div className="space-y-2 md:col-span-6">
                <label htmlFor="cms-img-select" className="block text-xs font-semibold text-[#25352B]">
                  {isEn ? "Select Verified Asset or Upload (<=2MB)" : "Chọn ảnh đã duyệt hoặc Tải ảnh cục bộ (≤ 2 MB)"}
                </label>
                <select
                  id="cms-img-select"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="min-h-[40px] w-full rounded-[10px] border border-[#788A7B] bg-white px-2.5 text-xs"
                >
                  <option value="">{isEn ? "Default template image" : "Giữ ảnh mặc định của khung"}</option>
                  {assets.map((up) => (
                    <option key={up.assetId} value={up.dataUrl}>
                      [Uploaded] {up.name}
                    </option>
                  ))}
                  {ASSET_MANIFEST.slice(0, 28).map((a) => (
                    <option key={a.assetId} value={a.localPath}>
                      {a.assetId} · {a.localPath.split("/").pop()}
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{isEn ? "Upload image (JPG/PNG/WebP)" : "Tải ảnh lên IndexedDB"}</span>
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={handleUploadImage}
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-6">
                <label htmlFor="cms-focal" className="block text-xs font-semibold text-[#25352B]">
                  {isEn ? "Crop Focal Point" : "Điểm tâm khung hình (Focal point)"}
                </label>
                <select
                  id="cms-focal"
                  value={focalPoint}
                  onChange={(e) => setFocalPoint(e.target.value)}
                  className="min-h-[40px] w-full rounded-[10px] border border-[#788A7B] bg-white px-2.5 text-xs"
                >
                  <option value="50% 50%">Center (50% 50%)</option>
                  <option value="50% 25%">Top Subject (50% 25%)</option>
                  <option value="50% 75%">Lower Harvest (50% 75%)</option>
                  <option value="25% 50%">Left Focus (25% 50%)</option>
                  <option value="75% 50%">Right Focus (75% 50%)</option>
                </select>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="CMS crop preview"
                    style={{ objectPosition: focalPoint }}
                    className="h-24 w-full rounded-[10px] border border-[#D6DED2] object-cover"
                  />
                ) : null}
              </div>
            </div>

            {/* Workflow Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 border-t border-[#EAEFE6] pt-3">
              <Button size="sm" variant="secondary" onClick={() => void handleSaveDraft()}>
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{isEn ? "Save Draft" : "Lưu bản nháp"}</span>
              </Button>
              <Button size="sm" variant="ghost" onClick={() => void handleSubmitReview()}>
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{isEn ? "Submit Review" : "Gửi duyệt"}</span>
              </Button>
              <Button size="sm" variant="primary" onClick={() => void handlePublishLocal()}>
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{isEn ? "Publish Locally" : "Xuất bản Cục bộ"}</span>
              </Button>
            </div>
          </Card>

          {/* Responsive Preview Frame */}
          <Card className="space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#25352B]">
                <Eye className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                <span>{isEn ? "Live Responsive Draft Preview" : "Xem trước giao diện theo thiết bị"}</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreviewLocale(previewLocale === "vi" ? "en" : "vi")}
                  className="rounded-lg border border-[#D6DED2] bg-[#FAF8F1] px-2.5 py-1 text-[11px] font-bold text-[#245B3D] cursor-pointer"
                >
                  {previewLocale.toUpperCase()}
                </button>
                {(
                  [
                    { id: "desktop", icon: Laptop, label: "Desktop" },
                    { id: "tablet", icon: Tablet, label: "Tablet" },
                    { id: "mobile", icon: Smartphone, label: "Mobile" },
                  ] as const
                ).map((dev) => {
                  const DIcon = dev.icon;
                  return (
                    <button
                      key={dev.id}
                      type="button"
                      onClick={() => setPreviewDevice(dev.id)}
                      aria-label={dev.label}
                      className={cn(
                        "rounded-lg border px-2 py-1 text-xs cursor-pointer",
                        previewDevice === dev.id
                          ? "border-[#245B3D] bg-[#245B3D] text-white"
                          : "border-[#D6DED2] bg-white text-[#52645A]",
                      )}
                    >
                      <DIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center rounded-[14px] border border-[#D6DED2] bg-[#F5F3E9] p-4">
              <div
                className={cn(
                  "rounded-[14px] border border-[#D6DED2] bg-white p-4 shadow-sm transition-[width]",
                  previewDevice === "mobile"
                    ? "w-[320px]"
                    : previewDevice === "tablet"
                    ? "w-[540px]"
                    : "w-full",
                )}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Device preview"
                    style={{ objectPosition: focalPoint }}
                    className="mb-3 h-32 w-full rounded-[10px] object-cover"
                  />
                ) : null}
                <h4 className="whitespace-pre-line font-editorial text-lg font-bold text-[#25352B]">
                  {previewLocale === "en" ? enTitle : viTitle}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-[#52645A]">
                  {previewLocale === "en" ? enBody : viBody}
                </p>
              </div>
            </div>
          </Card>

          {/* Version History & Rollback */}
          <Card className="space-y-2.5 p-4">
            <h4 className="flex items-center gap-1.5 text-xs font-bold text-[#25352B]">
              <History className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              <span>
                {isEn
                  ? `Revision History & Rollback (${blockRevisions.length})`
                  : `Lịch sử chỉnh sửa & Khôi phục phiên bản (${blockRevisions.length})`}
              </span>
            </h4>
            {blockRevisions.length === 0 ? (
              <p className="text-xs text-[#52645A]">
                {isEn ? "No local revisions recorded for this slot yet." : "Chưa có bản ghi chỉnh sửa cục bộ cho khối này."}
              </p>
            ) : (
              <div className="space-y-2">
                {blockRevisions.slice(0, 6).map((rev) => (
                  <div
                    key={rev.revisionId}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-[#EAEFE6] bg-[#FAF8F1] px-3 py-2 text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#245B3D]">{rev.action}</span> · {rev.actor} ·{" "}
                      <span className="text-[#52645A]">{rev.savedAtIso.slice(0, 19).replace("T", " ")}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        await rollbackRevision(rev.revisionId, actorName);
                        selectBlock(rev.blockId);
                        notifySuccess(isEn ? "Rolled back & published previous snapshot." : "Đã khôi phục phiên bản trước đó.");
                      }}
                    >
                      <RotateCcw className="h-3 w-3" aria-hidden="true" />
                      <span>{isEn ? "Rollback" : "Khôi phục"}</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
