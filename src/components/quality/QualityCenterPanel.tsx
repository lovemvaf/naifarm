"use client";

import React, { useMemo, useState } from "react";
import { AlertTriangle, ExternalLink, Filter, Search, ShieldCheck } from "lucide-react";
import {
  CREDENTIAL_TYPES,
  CREDENTIAL_TYPE_MAP,
  LIFECYCLE_STATUS_LABELS,
  evaluateCredentialDisplay,
} from "@/lib/quality/credential-registry";
import { INITIAL_CREDENTIAL_RECORDS } from "@/data/fixtures/quality-credentials";
import { CredentialDetailDrawer } from "./CredentialDetailDrawer";
import { Badge, Card } from "@/components/ui/Primitives";
import type { CredentialKind, CredentialLifecycleStatus, CredentialRecord, SourceKind } from "@/types/naifarm";

const KIND_LABELS: Record<"all" | CredentialKind, string> = {
  all: "Tất cả nhóm (26 loại)",
  certificate: "Chứng nhận chung",
  rating: "Xếp hạng OCOP (3–5 sao)",
  identifier: "Mã định danh vùng/cơ sở",
  gi: "Chỉ dẫn địa lý (GI)",
  trace_mechanism: "QR truy xuất",
  legal_facility: "ATTP cơ sở",
  food_safety_system: "HACCP / ISO 22000 / FSSC / GMP",
  qms: "ISO 9001",
  gap: "GAP (VietGAP / GLOBALG.A.P. / ASIAGAP)",
  organic: "Hữu cơ (TCVN / USDA / EU / JAS)",
  sustainability: "Bền vững (RA / Fairtrade / 4C)",
  aquaculture: "Thủy sản tham khảo (ASC / BAP)",
};

interface QualityCenterPanelProps {
  records?: CredentialRecord[];
  roleMode?: "public" | "farmer" | "coordinator" | "verifier" | "admin";
  onChangeStatus?: (recordId: string, nextStatus: CredentialLifecycleStatus, note: string) => void;
  onRenew?: (recordId: string) => void;
}

export function QualityCenterPanel({
  records = INITIAL_CREDENTIAL_RECORDS,
  roleMode = "public",
  onChangeStatus,
  onRenew,
}: QualityCenterPanelProps) {
  const [kindFilter, setKindFilter] = useState<"all" | CredentialKind>("all");
  const [originFilter, setOriginFilter] = useState<"all" | SourceKind>("all");
  const [expiryFilter, setExpiryFilter] = useState<"all" | "expiring" | "expired" | "revoked">("all");
  const [searchText, setSearchText] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  const filteredTypes = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return CREDENTIAL_TYPES.filter((t) => {
      if (kindFilter !== "all" && t.kind !== kindFilter) return false;
      if (!q) return true;
      return `${t.id} ${t.displayName} ${t.summary}`.toLowerCase().includes(q);
    });
  }, [kindFilter, searchText]);

  const evaluatedRecords = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return records
      .map((rec) => ({
        rec,
        typeDef: CREDENTIAL_TYPE_MAP.get(rec.typeId),
        evalRes: evaluateCredentialDisplay(rec),
      }))
      .filter(({ rec, typeDef, evalRes }) => {
        if (kindFilter !== "all" && typeDef?.kind !== kindFilter) return false;
        if (originFilter !== "all" && rec.origin !== originFilter) return false;
        if (expiryFilter === "expiring") {
          const band = evalRes.expiryAlertBand;
          if (band !== "7d" && band !== "30d" && band !== "60d" && band !== "90d") return false;
        } else if (expiryFilter === "expired") {
          if (evalRes.effectiveStatus !== "expired" && evalRes.effectiveStatus !== "historical_check_required") {
            return false;
          }
        } else if (expiryFilter === "revoked") {
          if (evalRes.effectiveStatus !== "revoked" && evalRes.effectiveStatus !== "suspended") {
            return false;
          }
        }
        if (!q) return true;
        return `${rec.typeId} ${typeDef?.displayName ?? ""} ${rec.holderLegalName} ${rec.certificateNumber ?? ""} ${rec.decisionNumber ?? ""}`
          .toLowerCase()
          .includes(q);
      });
  }, [records, kindFilter, originFilter, expiryFilter, searchText]);

  const selectedRecord = records.find((r) => r.id === selectedRecordId) ?? null;

  return (
    <div className="space-y-6">
      {/* Filter Toolbar */}
      <Card className="space-y-3 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-5">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#52645A]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm Q01–Q26, VietGAP, OCOP, Trọng Đức, Suối Gấm..."
              aria-label="Tìm tiêu chuẩn và hồ sơ chất lượng"
              className="min-h-[40px] w-full rounded-[10px] border border-[#788A7B] bg-white pr-3 pl-9 text-xs"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value as "all" | CredentialKind)}
              aria-label="Lọc theo nhóm tiêu chuẩn"
              className="min-h-[40px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
            >
              {(Object.keys(KIND_LABELS) as ("all" | CredentialKind)[]).map((k) => (
                <option key={k} value={k}>
                  {KIND_LABELS[k]}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value as "all" | SourceKind)}
              aria-label="Lọc theo nguồn dữ liệu"
              className="min-h-[40px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
            >
              <option value="all">Tất cả nguồn</option>
              <option value="public_reference">Nguồn công bố thật</option>
              <option value="synthetic">Hồ sơ mẫu trải nghiệm</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value as typeof expiryFilter)}
              aria-label="Lọc theo cảnh báo hiệu lực"
              className="min-h-[40px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
            >
              <option value="all">Mọi hiệu lực</option>
              <option value="expiring">Sắp hết hạn (7–90 ngày)</option>
              <option value="expired">Hết hạn / Lịch sử</option>
              <option value="revoked">Thu hồi / Đình chỉ</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 26 Credential Types Directory */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
            <Filter className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
            <span>Sổ đăng ký 26 loại Tiêu chuẩn &amp; Định danh ({filteredTypes.length}/26)</span>
          </h3>
          <span className="text-xs text-[#52645A]">
            Tách rõ xếp hạng, định danh vùng, chỉ dẫn địa lý, truy xuất QR và hệ thống quản lý chất lượng
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTypes.map((typeDef) => {
            const matchingCount = records.filter((r) => r.typeId === typeDef.id).length;
            return (
              <Card key={typeDef.id} className="flex flex-col justify-between p-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-[#EAF0E5] px-2 py-0.5 font-mono text-xs font-bold text-[#245B3D]">
                      {typeDef.id}
                    </span>
                    <Badge tone="neutral">{typeDef.kind}</Badge>
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-[#25352B]">{typeDef.displayName}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-[#52645A]">{typeDef.summary}</p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#EAF0E5] pt-2.5 text-[11px]">
                  <span className="font-semibold text-[#245B3D]">
                    {matchingCount} hồ sơ gắn loại này
                  </span>
                  <a
                    href={typeDef.sourceUrlPrimary}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[#52645A] hover:text-[#245B3D] hover:underline"
                  >
                    <span>Cổng tra cứu</span>
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Credential Records List */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-[#25352B]">
          Danh sách Hồ sơ chất lượng &amp; Trạng thái đối chiếu ({evaluatedRecords.length})
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {evaluatedRecords.map(({ rec, typeDef, evalRes }) => (
            <Card key={rec.id} className="flex flex-col justify-between p-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone="neutral">{rec.typeId}</Badge>
                    <Badge tone={rec.origin === "public_reference" ? "info" : "warning"}>
                      {rec.origin === "public_reference" ? "Nguồn công bố" : "Hồ sơ mẫu"}
                    </Badge>
                    {evalRes.expiryAlertBand && evalRes.expiryAlertBand !== "expired" ? (
                      <Badge tone="warning">Cảnh báo {evalRes.expiryAlertBand}</Badge>
                    ) : null}
                  </div>
                  <Badge tone={evalRes.canShowBadge ? "success" : "danger"}>
                    {evalRes.canShowBadge ? (
                      <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                    ) : (
                      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                    )}
                    <span>{LIFECYCLE_STATUS_LABELS[evalRes.effectiveStatus]}</span>
                  </Badge>
                </div>

                <h4 className="text-sm font-bold text-[#25352B]">
                  {typeDef?.displayName} — {rec.holderLegalName}
                </h4>
                <p className="text-xs text-[#52645A]">{rec.scopeDescription}</p>
                <p className="text-[11px] text-[#52645A]">
                  Số hiệu: <span className="font-mono font-semibold">{rec.decisionNumber || rec.certificateNumber || "Chưa có số hiệu"}</span>{" "}
                  · Hết hạn: {rec.validTo || "Chưa xác định"}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[#EAF0E5] pt-2.5 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedRecordId(rec.id)}
                  className="font-semibold text-[#245B3D] hover:underline cursor-pointer"
                >
                  Xem bằng chứng &amp; lịch sử →
                </button>
                {rec.sourceUrl ? (
                  <a
                    href={rec.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#52645A] hover:text-[#245B3D] hover:underline"
                  >
                    <span>Nguồn gốc</span>
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <CredentialDetailDrawer
        record={selectedRecord}
        allRecords={records}
        onClose={() => setSelectedRecordId(null)}
        roleMode={roleMode}
        onChangeStatus={onChangeStatus}
        onRenew={onRenew}
      />
    </div>
  );
}
