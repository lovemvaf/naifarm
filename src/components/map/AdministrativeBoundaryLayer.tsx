"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Database, Info } from "lucide-react";
import {
  ADMINISTRATIVE_METADATA,
  getPhuocSonNotice,
  getUpgradedPhuong2026List,
} from "@/lib/geography/administrative-lookup";

export function AdministrativeBoundaryLayer() {
  const [expanded, setExpanded] = useState(false);
  const phuocSon = getPhuocSonNotice();
  const upgraded = getUpgradedPhuong2026List();

  return (
    <div className="rounded-[14px] border border-[#D6DED2] bg-[#FAF8F1] p-4 text-xs text-[#25352B]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-start gap-2">
          <Database className="mt-0.5 h-4 w-4 shrink-0 text-[#245B3D]" aria-hidden="true" />
          <div>
            <p className="font-bold text-[#245B3D]">
              Nguồn dữ liệu Địa giới Thành phố Đồng Nai ({ADMINISTRATIVE_METADATA.mocRaSoat}):{" "}
              {ADMINISTRATIVE_METADATA.totalUnits} đơn vị ({ADMINISTRATIVE_METADATA.phuongCount} Phường,{" "}
              {ADMINISTRATIVE_METADATA.xaCount} Xã)
            </p>
            <p className="mt-0.5 text-[#52645A]">
              Trạng thái GIS chính thức: <code>chua_xac_minh_toa_do_va_polygon</code> (0/95 ranh giới
              polygon được xác minh — bản đồ không tự vẽ đường ranh giới pháp lý giả mạo).
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-[#D6DED2] bg-white px-3 font-semibold text-[#245B3D] hover:bg-[#EAF0E5]"
        >
          <span>{expanded ? "Thu gọn chi tiết" : "Xem chi tiết 25/11/2026"}</span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" /> : <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />}
        </button>
      </div>

      {expanded ? (
        <div className="mt-3 grid grid-cols-1 gap-3 border-t border-[#D6DED2] pt-3 md:grid-cols-2">
          <div className="rounded-[10px] border border-[#D6DED2] bg-white p-3">
            <p className="font-bold text-[#245B3D]">
              10 Xã nâng cấp thành Phường năm 2026
            </p>
            <p className="mt-1 leading-relaxed text-[#52645A]">
              {upgraded.map((u) => `${u.tenDayDu} (${u.maDvhc})`).join(" · ")}
            </p>
          </div>

          {phuocSon ? (
            <div className="rounded-[10px] border border-[#D7A34D] bg-[#FFF2D8]/50 p-3">
              <p className="flex items-center gap-1.5 font-bold text-[#80520C]">
                <Info className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Trạng thái hồ sơ Xã Phước Sơn ({phuocSon.unit.maDvhc})</span>
              </p>
              <p className="mt-1 leading-relaxed text-[#52645A]">
                Diện tích hiện hành: <strong>{phuocSon.currentAreaKm2} km²</strong>. Đề xuất tiếp nhận
                từ Lâm Đồng nâng tổng diện tích lên{" "}
                <strong>{phuocSon.proposedAreaKm2} km²</strong> đang ở trạng thái chủ trương, chưa áp
                dụng chính thức ({phuocSon.legalNote}).
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
