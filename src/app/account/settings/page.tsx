"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, MapPin, Plus, RotateCcw, Settings, Trash2, User } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { ADMINISTRATIVE_UNITS } from "@/lib/geography/administrative-lookup";
import { notifyError, notifyInfo, notifySuccess } from "@/lib/toast";
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell";
import { Badge, Card } from "@/components/ui/Primitives";

export default function AccountSettingsPage() {
  const {
    authUser,
    addressBook,
    addAddressEntry,
    removeAddressEntry,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    resetDemoState,
  } = useDemoStore();

  const [label, setLabel] = useState("");
  const [recipientName, setRecipientName] = useState(authUser?.name ?? "Ngọc Linh");
  const [phoneDemo, setPhoneDemo] = useState("090x xxx 888");
  const [detailAddress, setDetailAddress] = useState("");
  const [unitCode, setUnitCode] = useState("26041");

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const res = addAddressEntry({
      label,
      recipientName,
      phoneDemo,
      detailAddress,
      administrativeUnitCode: unitCode,
    });
    if (!res.ok) {
      notifyError(res.message);
      return;
    }
    notifySuccess(res.message);
    setLabel("");
    setDetailAddress("");
  };

  return (
    <WorkspaceShell
      workspaceId="W01"
      title="Cài đặt Tài khoản, Địa chỉ & Thông báo"
      subtitle="Quản lý sổ địa chỉ nhận hàng, hộp thông báo và khôi phục trạng thái không gian trải nghiệm"
      scopeBadge="Dữ liệu lưu cục bộ trên trình duyệt"
      navItems={[
        { label: "Tổng quan cá nhân", href: "/account", icon: <User className="h-4 w-4" /> },
        { label: "Cài đặt & Địa chỉ", href: "/account/settings", icon: <Settings className="h-4 w-4" />, active: true },
      ]}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Card className="space-y-4 p-5 lg:col-span-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
              <MapPin className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              <span>Thêm địa chỉ mới (Thành phố Đồng Nai)</span>
            </h2>
            <form onSubmit={handleAddAddress} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="addr-label" className="block text-xs font-semibold text-[#25352B]">
                    Tên gợi nhớ
                  </label>
                  <input
                    id="addr-label"
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Ví dụ: Nhà vườn, Cơ quan"
                    className="mt-1 min-h-[42px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="addr-rec" className="block text-xs font-semibold text-[#25352B]">
                    Người nhận
                  </label>
                  <input
                    id="addr-rec"
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="mt-1 min-h-[42px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="addr-unit" className="block text-xs font-semibold text-[#25352B]">
                  Phường / Xã thuộc Thành phố Đồng Nai
                </label>
                <select
                  id="addr-unit"
                  value={unitCode}
                  onChange={(e) => setUnitCode(e.target.value)}
                  className="mt-1 min-h-[42px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
                >
                  {ADMINISTRATIVE_UNITS.map((u) => (
                    <option key={u.maDvhc} value={u.maDvhc}>
                      {u.tenDayDu} ({u.maDvhc})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="addr-detail" className="block text-xs font-semibold text-[#25352B]">
                    Số nhà / Đường / Ấp
                  </label>
                  <input
                    id="addr-detail"
                    type="text"
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                    placeholder="Số 25 Đường Lê Duẩn"
                    className="mt-1 min-h-[42px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="addr-phone" className="block text-xs font-semibold text-[#25352B]">
                    Số liên hệ mẫu
                  </label>
                  <input
                    id="addr-phone"
                    type="text"
                    value={phoneDemo}
                    onChange={(e) => setPhoneDemo(e.target.value)}
                    className="mt-1 min-h-[42px] w-full rounded-[10px] border border-[#788A7B] bg-white px-3 text-xs"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#19472E] cursor-pointer"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Lưu địa chỉ nhận hàng</span>
              </button>
            </form>
          </Card>

          <Card className="space-y-3 p-5 lg:col-span-6">
            <h2 className="text-base font-bold text-[#25352B]">
              Danh sách địa chỉ đã lưu ({addressBook.length})
            </h2>
            <div className="space-y-2.5">
              {addressBook.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start justify-between gap-3 rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-3 text-xs"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#25352B]">{entry.label}</span>
                      {entry.isDefault ? <Badge tone="success">Mặc định</Badge> : null}
                    </div>
                    <p className="mt-0.5 text-[#52645A]">
                      {entry.recipientName} · {entry.phoneDemo}
                    </p>
                    <p className="mt-1 font-medium text-[#25352B]">{entry.fullAddress}</p>
                  </div>
                  {!entry.isDefault ? (
                    <button
                      type="button"
                      onClick={() => {
                        removeAddressEntry(entry.id);
                        notifyInfo("Đã xóa địa chỉ khỏi sổ cá nhân.");
                      }}
                      className="rounded-lg p-1.5 text-[#A32D2D] hover:bg-[#FDECEC] cursor-pointer"
                      aria-label={`Xóa địa chỉ ${entry.label}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card id="notifications" className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
              <Bell className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
              <span>Hộp thông báo ({notifications.length})</span>
            </h2>
            <button
              type="button"
              onClick={() => {
                markAllNotificationsRead();
                notifySuccess("Đã đánh dấu tất cả thông báo là đã đọc.");
              }}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[10px] border border-[#D6DED2] bg-white px-3 text-xs font-semibold text-[#245B3D] hover:bg-[#EAF0E5] cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Đánh dấu tất cả đã đọc</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="flex items-start justify-between gap-3 rounded-[12px] border border-[#D6DED2] bg-white p-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#25352B]">{n.title}</span>
                    {!n.read ? <Badge tone="warning">Chưa đọc</Badge> : null}
                  </div>
                  <p className="mt-1 text-[#52645A]">{n.message}</p>
                  <p className="mt-1 text-[11px] text-[#687A70]">{n.createdAtLabel}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Link
                    href={n.href}
                    onClick={() => markNotificationRead(n.id)}
                    className="font-semibold text-[#245B3D] hover:underline"
                  >
                    Mở →
                  </Link>
                  {!n.read ? (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(n.id)}
                      className="text-[11px] text-[#52645A] hover:underline cursor-pointer"
                    >
                      Đã đọc
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex flex-wrap items-center justify-between gap-4 border-[#D6DED2] bg-[#FAF8F1] p-5">
          <div>
            <p className="text-sm font-bold text-[#25352B]">Cài đặt không gian trải nghiệm</p>
            <p className="mt-0.5 text-xs text-[#52645A]">
              Khôi phục lại giỏ hàng, đơn hàng, nhật ký mùa vụ và quyền hạn về dữ liệu mẫu ban đầu.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              resetDemoState();
              notifySuccess("Đã đặt lại dữ liệu trải nghiệm mặc định.");
            }}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[10px] border border-[#D6DED2] bg-white px-4 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5] cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Đặt lại dữ liệu trải nghiệm</span>
          </button>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
