"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Sprout, Users } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { Badge, Card, DemoBanner } from "@/components/ui/Primitives";

export default function FarmsDirectoryPage() {
  const { farms } = useDemoStore();

  return (
    <div className="mx-auto max-w-[1280px] space-y-6 px-4 py-8 lg:px-8">
      <div>
        <Badge tone="success">R1 · Hồ sơ Nhà vườn Đồng Nai</Badge>
        <h1 className="mt-2 font-editorial text-3xl font-semibold text-[#25352B]">
          Mạng lưới Nhà vườn & Hợp tác xã Tham gia
        </h1>
        <p className="mt-1 text-sm text-[#52645A]">
          Ghi nhận câu chuyện làm vườn, diện tích canh tác, tình trạng hồ sơ OCOP trung thực và
          đội thanh niên tình nguyện hỗ trợ số hóa.
        </p>
      </div>

      <DemoBanner
        title="Phân biệt trạng thái hồ sơ"
        detail="Nhà vườn tự khai thông tin và nhật ký; hồ sơ chưa được cơ quan có thẩm quyền xác minh OCOP chính thức sẽ gắn nhãn rõ ràng."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {farms.map((farm) => (
          <Card key={farm.id} className="overflow-hidden flex flex-col">
            <img
              src={farm.bannerImage}
              alt={farm.name}
              className="h-52 w-full object-cover"
            />
            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge tone={farm.ocopStatus === "coop_checked_demo" ? "success" : "warning"}>
                    {farm.ocopLabel}
                  </Badge>
                  <span className="tabular-nums text-xs font-semibold text-[#52645A]">
                    Quy mô: {farm.areaHa} ha
                  </span>
                </div>
                <h2 className="mt-2 font-editorial text-xl font-semibold text-[#25352B]">
                  {farm.name}
                </h2>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#52645A]">
                  <MapPin className="h-3.5 w-3.5 text-[#245B3D]" aria-hidden="true" />
                  <span>{farm.addressLabel}</span>
                </p>
                <p className="mt-2 text-sm text-[#52645A]">{farm.storySummary}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {farm.mainCrops.map((crop) => (
                    <span
                      key={crop}
                      className="inline-flex items-center gap-1 rounded-full bg-[#F5F3E9] px-2.5 py-1 text-xs font-medium text-[#25352B]"
                    >
                      <Sprout className="h-3 w-3 text-[#245B3D]" aria-hidden="true" />
                      {crop}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#D6DED2] pt-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#245B3D]">
                  <Users className="h-4 w-4" aria-hidden="true" />
                  <span>{farm.youthSupporters[0]}</span>
                </span>
                <Link
                  href={`/farms/${farm.slug}`}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#19472E]"
                >
                  <span>Vào hồ sơ nhà vườn</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
