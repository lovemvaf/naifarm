"use client";

import React, { useState } from "react";
import { AlertTriangle, Check, Lock, ShieldCheck } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import {
  CAPABILITY_DEFINITIONS,
  detectConflictOrExpiry,
} from "@/lib/permissions/access-control";
import { notifyError, notifyInfo } from "@/lib/toast";
import { Badge, Button, Card } from "@/components/ui/Primitives";
import type { WorkspaceId } from "@/types/naifarm";

const WORKSPACES: WorkspaceId[] = ["W01", "W02", "W03", "W04", "W05", "W06"];

export function PermissionMatrix() {
  const { adminGrants, toggleAdminGrant } = useDemoStore();
  const [reasonMap, setReasonMap] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      {/* Capabilities vs Workspaces Table */}
      <Card className="space-y-4 p-5">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
            <ShieldCheck className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
            <span>Ma trận phân quyền 6 không gian làm việc</span>
          </h2>
          <p className="mt-1 text-xs text-[#52645A]">
            Mỗi quyền phê duyệt tài chính hoặc giờ công đều gắn cơ chế tách quyền Maker ≠ Checker.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#D6DED2] text-[#52645A]">
                <th className="py-2 pr-3 font-semibold">Tác vụ nghiệp vụ</th>
                {WORKSPACES.map((w) => (
                  <th key={w} className="px-2 py-2 text-center font-bold text-[#25352B]">
                    {w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEFE6]">
              {CAPABILITY_DEFINITIONS.map((cap) => (
                <tr key={cap.key}>
                  <td className="py-2.5 pr-3">
                    <p className="font-semibold text-[#25352B]">{cap.label}</p>
                    <p className="text-[11px] text-[#52645A]">
                      {cap.description}
                      {cap.makerCheckerRequired ? " · Bắt buộc Maker ≠ Checker" : ""}
                    </p>
                  </td>
                  {WORKSPACES.map((w) => {
                    const has = cap.allowedWorkspaces.includes(w);
                    return (
                      <td key={w} className="px-2 py-2.5 text-center">
                        {has ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#E6F3E9] text-[#24603B]">
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                        ) : (
                          <span className="text-[#9AA89D]">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Active Scoped Grants + Mandatory Reason + Before/After Audit */}
      <Card className="space-y-4 p-5">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
            <Lock className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
            <span>Quản lý cấp/thu hồi quyền theo phạm vi xã/phường ({adminGrants.length})</span>
          </h3>
          <p className="mt-1 text-xs text-[#52645A]">
            Bắt buộc nhập lý do thay đổi trước khi bật hoặc thu hồi quyền. Hệ thống tự động lưu ảnh chụp Trước/Sau vào nhật ký kiểm toán.
          </p>
        </div>

        <div className="space-y-3">
          {adminGrants.map((grant) => {
            const check = detectConflictOrExpiry(grant);
            return (
              <div
                key={grant.id}
                className="rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-4 text-xs"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-[#245B3D]">{grant.id}</span>
                      <span className="font-bold text-[#25352B]">{grant.accountName}</span>
                      <Badge tone={grant.active ? "success" : "danger"}>
                        {grant.active ? "Đang hiệu lực" : "Đã thu hồi"}
                      </Badge>
                      <Badge tone="neutral">{grant.workspaceScope}</Badge>
                    </div>
                    <p className="mt-1 text-[#52645A]">
                      Tổ chức: {grant.organizationName} · Phạm vi: <strong>{grant.unitScope}</strong>
                    </p>
                    <p className="mt-0.5 font-semibold text-[#25352B]">Quyền: {grant.capability}</p>
                    <p className="mt-0.5 text-[11px] text-[#52645A]">Lý do gần nhất: {grant.lastReason}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {check.hasIssue ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF2D8] px-2.5 py-1 text-[11px] font-semibold text-[#80520C]">
                        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{check.statusText}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-[#24603B]">{check.statusText}</span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={reasonMap[grant.id] ?? ""}
                    onChange={(e) => setReasonMap((prev) => ({ ...prev, [grant.id]: e.target.value }))}
                    placeholder="Nhập lý do cấp/thu hồi (bắt buộc để ghi nhận nhật ký Trước/Sau)..."
                    aria-label={`Lý do điều chỉnh quyền ${grant.id}`}
                    className="min-h-[38px] flex-1 rounded-[8px] border border-[#788A7B] bg-white px-3 text-xs"
                  />
                  <Button
                    size="sm"
                    variant={grant.active ? "destructive" : "primary"}
                    onClick={() => {
                      const reason = (reasonMap[grant.id] ?? "").trim();
                      if (!reason) {
                        notifyError("Bắt buộc nhập lý do thay đổi trước khi thu hồi hoặc cấp lại quyền.");
                        return;
                      }
                      toggleAdminGrant(grant.id, reason);
                      setReasonMap((prev) => ({ ...prev, [grant.id]: "" }));
                      notifyInfo(
                        grant.active
                          ? `Đã thu hồi quyền ${grant.id} (đã lưu Trước/Sau vào Audit Log).`
                          : `Đã kích hoạt lại quyền ${grant.id} (đã lưu Trước/Sau vào Audit Log).`,
                      );
                    }}
                  >
                    {grant.active ? "Thu hồi quyền" : "Cấp lại quyền"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
