"use client";

import React, { useEffect } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  FileText,
  RefreshCw,
  ShieldAlert,
  X,
} from "lucide-react";
import {
  CREDENTIAL_TYPE_MAP,
  LIFECYCLE_STATUS_LABELS,
  QUALITY_SOURCE_REGISTRY,
  evaluateCredentialDisplay,
} from "@/lib/quality/credential-registry";
import { INITIAL_EVIDENCE_ITEMS } from "@/data/fixtures/quality-credentials";
import { Badge, Button } from "@/components/ui/Primitives";
import type { CredentialLifecycleStatus, CredentialRecord } from "@/types/naifarm";

interface CredentialDetailDrawerProps {
  record: CredentialRecord | null;
  allRecords: CredentialRecord[];
  onClose: () => void;
  roleMode?: "public" | "farmer" | "coordinator" | "verifier" | "admin";
  onChangeStatus?: (recordId: string, nextStatus: CredentialLifecycleStatus, note: string) => void;
  onRenew?: (recordId: string) => void;
}

export function CredentialDetailDrawer({
  record,
  allRecords,
  onClose,
  roleMode = "public",
  onChangeStatus,
  onRenew,
}: CredentialDetailDrawerProps) {
  useEffect(() => {
    if (!record) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [record, onClose]);

  if (!record) return null;

  const typeDef = CREDENTIAL_TYPE_MAP.get(record.typeId);
  const evalResult = evaluateCredentialDisplay(record);
  const evidences = record.evidenceIds
    .map((id) => INITIAL_EVIDENCE_ITEMS.find((ev) => ev.id === id))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  const previousRecord = record.renewedFromId
    ? allRecords.find((r) => r.id === record.renewedFromId)
    : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#25352B]/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label={`Chi tiết hồ sơ ${record.id}`}
      onClick={onClose}
    >
      <div
        className="h-full w-full max-w-lg overflow-y-auto border-l border-[#D6DED2] bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#D6DED2] pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="neutral">{record.typeId}</Badge>
              <Badge tone={record.origin === "public_reference" ? "info" : "warning"}>
                {record.origin === "public_reference" ? "Nguồn công bố tham khảo" : "Hồ sơ mẫu"}
              </Badge>
            </div>
            <h2 className="mt-2 font-editorial text-xl font-semibold text-[#25352B]">
              {typeDef?.displayName ?? record.typeId}
            </h2>
            <p className="text-xs text-[#52645A]">{record.holderLegalName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng chi tiết hồ sơ"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D6DED2] text-[#25352B] hover:bg-[#EAF0E5] cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 space-y-5 text-sm">
          {/* Status & Badge Suppression Explanation */}
          <div
            className={`rounded-[14px] border p-4 text-xs ${
              evalResult.canShowBadge
                ? "border-[#245B3D]/30 bg-[#E6F3E9] text-[#24603B]"
                : "border-[#D7A34D] bg-[#FFF2D8] text-[#80520C]"
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {evalResult.canShowBadge ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <span>{LIFECYCLE_STATUS_LABELS[evalResult.effectiveStatus]}</span>
            </div>
            <p className="mt-1.5 leading-relaxed">{evalResult.reason}</p>
          </div>

          {/* Core Metadata */}
          <div className="grid grid-cols-1 gap-3 rounded-[14px] border border-[#D6DED2] bg-[#FAF8F1] p-4 text-xs sm:grid-cols-2">
            <div>
              <p className="text-[#52645A]">Đơn vị / Cơ quan công bố</p>
              <p className="mt-0.5 font-semibold text-[#25352B]">{record.issuer}</p>
            </div>
            <div>
              <p className="text-[#52645A]">Số giấy / Số quyết định</p>
              <p className="mt-0.5 font-mono font-semibold text-[#25352B]">
                {record.decisionNumber || record.certificateNumber || "Chưa ghi nhận số hiệu"}
              </p>
            </div>
            <div>
              <p className="text-[#52645A]">Hiệu lực từ</p>
              <p className="mt-0.5 tabular-nums font-semibold text-[#25352B]">
                {record.validFrom || "Chưa xác định"}
              </p>
            </div>
            <div>
              <p className="text-[#52645A]">Hết hạn ngày</p>
              <p className="mt-0.5 flex items-center gap-1 tabular-nums font-semibold text-[#25352B]">
                <CalendarClock className="h-3.5 w-3.5 text-[#245B3D]" aria-hidden="true" />
                <span>{record.validTo || "Chưa rõ thời hạn"}</span>
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#52645A]">
              Phạm vi áp dụng
            </h3>
            <p className="rounded-[12px] border border-[#D6DED2] bg-white p-3 text-xs leading-relaxed text-[#25352B]">
              {record.scopeDescription}
            </p>
          </div>

          {previousRecord ? (
            <div className="rounded-[12px] border border-[#D6DED2] bg-[#F5F3E9] p-3 text-xs">
              <p className="font-bold text-[#245B3D]">Chuỗi gia hạn (không ghi đè lịch sử)</p>
              <p className="mt-1 text-[#52645A]">
                Gia hạn từ hồ sơ <span className="font-mono font-semibold">{previousRecord.id}</span> (
                {previousRecord.certificateNumber || previousRecord.decisionNumber} —{" "}
                {LIFECYCLE_STATUS_LABELS[previousRecord.lifecycleStatus]}).
              </p>
            </div>
          ) : null}

          {/* Evidence & Source Registry Links */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#52645A]">
              Bằng chứng &amp; Cổng đối chiếu nguồn ({evidences.length})
            </h3>
            {evidences.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-[#A32D2D]/40 bg-[#FDECEC]/60 p-3 text-xs text-[#A32D2D]">
                Chưa có tài liệu đính kèm — nhãn không được phép hiển thị là đã xác minh.
              </div>
            ) : (
              <div className="space-y-2">
                {evidences.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-[12px] border border-[#D6DED2] bg-white p-3 text-xs"
                  >
                    <p className="flex items-center gap-1.5 font-semibold text-[#25352B]">
                      <FileText className="h-3.5 w-3.5 text-[#245B3D]" aria-hidden="true" />
                      <span>{ev.sourceTitle}</span>
                    </p>
                    {ev.page ? (
                      <p className="mt-0.5 text-[11px] text-[#52645A]">Vị trí trang: {ev.page}</p>
                    ) : null}
                    <p className="mt-0.5 text-[11px] text-[#52645A]">
                      Kiểm tra ngày: {ev.checkedAt} · {ev.licenseOrPermission}
                    </p>
                    {ev.uri.startsWith("http") ? (
                      <a
                        href={ev.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 font-semibold text-[#245B3D] underline"
                      >
                        <span>Mở nguồn công bố gốc</span>
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            )}

            {typeDef ? (
              <div className="rounded-[12px] bg-[#FAF8F1] p-3 text-xs">
                <p className="font-semibold text-[#25352B]">Cổng tra cứu tiêu chuẩn {typeDef.id}:</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {typeDef.verificationSources.map((srcKey) => {
                    const src = QUALITY_SOURCE_REGISTRY[srcKey];
                    if (!src) return null;
                    return (
                      <a
                        key={srcKey}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-[#D6DED2] bg-white px-2.5 py-1 text-[11px] font-medium text-[#245B3D] hover:bg-[#EAF0E5]"
                      >
                        <span>{src.label}</span>
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          {/* Role Actions (Coordinator / Verifier / Admin / Farmer) */}
          {roleMode !== "public" && onChangeStatus ? (
            <div className="space-y-2 border-t border-[#D6DED2] pt-4">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#25352B]">
                <ShieldAlert className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                <span>Thao tác nghiệp vụ theo vai trò</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {(roleMode === "coordinator" || roleMode === "admin") && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      onChangeStatus(
                        record.id,
                        "document_matched",
                        "Đối chiếu bản chụp hồ sơ đầy đủ (Hồ sơ mẫu).",
                      )
                    }
                  >
                    Đánh dấu đã đối chiếu tài liệu
                  </Button>
                )}
                {(roleMode === "verifier" || roleMode === "admin") && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() =>
                      onChangeStatus(
                        record.id,
                        "source_verified",
                        "Cơ quan chuyên môn xác minh nguồn công bố hợp lệ.",
                      )
                    }
                  >
                    Xác minh từ nguồn gốc
                  </Button>
                )}
                {(roleMode === "verifier" || roleMode === "admin") && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      onChangeStatus(record.id, "revoked", "Thu hồi/ẩn nhãn do không đáp ứng đối chiếu.")
                    }
                  >
                    Thu hồi / Ẩn nhãn
                  </Button>
                )}
                {onRenew && (roleMode === "farmer" || roleMode === "admin") ? (
                  <Button size="sm" variant="gold" onClick={() => onRenew(record.id)}>
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Tạo bản gia hạn mới</span>
                  </Button>
                ) : null}
              </div>
              <p className="text-[11px] text-[#52645A]">
                Lưu ý: Ứng dụng không tự cấp giấy chứng nhận OCOP/VietGAP pháp lý; mọi thay đổi chỉ cập nhật bản ghi trong không gian trải nghiệm kèm nhật ký kiểm toán.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
