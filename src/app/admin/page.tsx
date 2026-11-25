"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { History, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell";
import { Badge, Button, Card } from "@/components/ui/Primitives";

export default function AdminWorkspacePage() {
  const {
    hydrated,
    adminGrants,
    auditLogs,
    setActiveWorkspace,
    toggleAdminGrant,
  } = useDemoStore();

  const [pendingGrantId, setPendingGrantId] = useState<string | null>(null);
  const [reasonInput, setReasonInput] = useState(
    "Điều chỉnh phân quyền theo phạm vi đơn vị W04/W05."
  );

  useEffect(() => {
    setActiveWorkspace("W06");
  }, [setActiveWorkspace]);

  const handleConfirmToggle = async () => {
    if (!pendingGrantId) return;
    if (!reasonInput.trim()) {
      toast.error("Vui lòng nhập lý do trước khi thay đổi quyền hạn.");
      return;
    }
    try {
      await toggleAdminGrant(pendingGrantId, reasonInput.trim());
      toast.success(`Đã cập nhật quyền ${pendingGrantId} và ghi vào Nhật ký kiểm toán.`);
      setPendingGrantId(null);
    } catch {
      toast.error("Không cập nhật được quyền hạn. Vui lòng thử lại.");
    }
  };

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-12 text-sm text-muted">
        Đang mở Không gian Quản trị Quyền hạn...
      </div>
    );
  }

  return (
    <WorkspaceShell
      workspaceId="W06"
      title="Quản trị Hệ thống & Phân quyền"
      subtitle="Ma trận cấp quyền có thời hạn & giới hạn đơn vị kèm Nhật ký kiểm toán chỉ đọc"
      scopeBadge="RBAC thật với Supabase Auth & RLS"
      navItems={[
        {
          label: "Ma trận Cấp quyền W01–W06",
          href: "#grants",
          active: true,
          icon: <KeyRound className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: `Nhật ký Kiểm toán (${auditLogs.length})`,
          href: "#audit-logs",
          icon: <History className="h-4 w-4" aria-hidden="true" />,
        },
      ]}
    >
      <div className="space-y-6">
        {/* Scoped Capability Grants Matrix (S66-S68) */}
        <section id="grants" className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-foreground">
              Ma trận Quyền hạn Có thời hạn ({adminGrants.length})
            </h2>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Mọi thay đổi yêu cầu ghi lý do
            </span>
          </div>

          <div className="space-y-3">
            {adminGrants.map((grant) => (
              <Card key={grant.id} className="p-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="tabular-nums text-xs font-bold text-primary">
                        {grant.id}
                      </span>
                      <Badge tone="neutral">{grant.workspaceScope}</Badge>
                      <Badge tone={grant.active ? "success" : "danger"}>
                        {grant.active ? "Đang hiệu lực" : "Đã tạm thu hồi"}
                      </Badge>
                    </div>
                    <h3 className="mt-1 text-base font-bold text-foreground">
                      {grant.accountName} — {grant.organizationName}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted">
                      Quyền cấp: <code className="rounded bg-surface-soft px-1.5 py-0.5 text-primary">{grant.capability}</code> ·
                      Phạm vi: <span className="font-semibold text-foreground">{grant.unitScope}</span> · Hết hạn{" "}
                      {grant.expiresAt}
                    </p>
                  </div>

                  <Button
                    variant={grant.active ? "destructive" : "primary"}
                    size="sm"
                    onClick={() => {
                      setPendingGrantId(grant.id);
                      setReasonInput(
                        grant.active
                          ? `Tạm thu hồi quyền thử nghiệm ${grant.id} để kiểm thử an toàn.`
                          : `Kích hoạt lại quyền có thời hạn ${grant.id} theo phạm vi ${grant.unitScope}.`
                      );
                    }}
                  >
                    {grant.active ? "Thu hồi quyền" : "Kích hoạt lại"}
                  </Button>
                </div>

                <p className="rounded-[10px] bg-background px-3 py-2 text-xs text-muted">
                  <span className="font-semibold text-foreground">Lý do gần nhất: </span>
                  {grant.lastReason}
                </p>

                {pendingGrantId === grant.id ? (
                  <div className="rounded-[12px] border border-primary bg-surface-soft/70 p-3.5 space-y-2.5">
                    <label
                      htmlFor={`reason-${grant.id}`}
                      className="block text-xs font-bold text-foreground"
                    >
                      Xác nhận lý do thay đổi quyền {grant.id} (bắt buộc để ghi Audit Log):
                    </label>
                    <input
                      id={`reason-${grant.id}`}
                      value={reasonInput}
                      onChange={(e) => setReasonInput(e.target.value)}
                      className="min-h-[42px] w-full rounded-[10px] border border-border bg-white px-3 text-sm"
                    />
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm" onClick={() => void handleConfirmToggle()}>
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        <span>Xác nhận & Ghi nhật ký</span>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPendingGrantId(null)}
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        </section>

        {/* Read-only Audit Log Table (S75) */}
        <section id="audit-logs" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-foreground">
              Nhật ký Kiểm toán Hệ thống (Chỉ đọc · S75)
            </h2>
            <Badge tone="neutral">Append-only</Badge>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-soft text-xs font-semibold text-primary">
                  <tr>
                    <th className="px-4 py-3">Thời gian</th>
                    <th className="px-4 py-3">Chủ thể</th>
                    <th className="px-4 py-3">Hành động</th>
                    <th className="px-4 py-3">Đối tượng</th>
                    <th className="px-4 py-3">Ghi chú minh bạch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-soft">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-background/60">
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted tabular-nums">
                        {log.time}
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">{log.actor}</td>
                      <td className="px-4 py-3">
                        <code className="rounded bg-surface-soft px-2 py-0.5 text-xs font-semibold text-primary">
                          {log.action}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-foreground tabular-nums">
                        {log.target}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">{log.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </div>
    </WorkspaceShell>
  );
}
