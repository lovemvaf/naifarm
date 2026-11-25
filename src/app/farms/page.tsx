"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Sprout, Users } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { localizeAdminUnitName } from "@/lib/i18n/domain-en";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { Badge, Card, DemoBanner } from "@/components/ui/Primitives";

export default function FarmsDirectoryPage() {
  const { locale } = useLocale();
  const isEn = locale === "en";
  const { farms } = useDemoStore();

  return (
    <div className="mx-auto max-w-[1280px] space-y-6 px-4 py-8 lg:px-8">
      <div>
        <Badge tone="success">
          {isEn ? "Dong Nai Orchard Profiles" : "Hồ sơ Nhà vườn Đồng Nai"}
        </Badge>
        <h1 className="mt-2 font-editorial text-3xl font-semibold text-[#25352B]">
          {isEn ? "Participating Orchards & Cooperatives" : "Mạng lưới Nhà vườn & Hợp tác xã Tham gia"}
        </h1>
        <p className="mt-1 text-sm text-[#52645A]">
          {isEn
            ? "Orchard stories, cultivation area, truthful OCOP dossier status, and local youth digitization partners."
            : "Ghi nhận câu chuyện làm vườn, diện tích canh tác, tình trạng hồ sơ OCOP trung thực và đội thanh niên tình nguyện hỗ trợ số hóa."}
        </p>
      </div>

      <DemoBanner
        title={isEn ? "Record Provenance & Disclosure" : "Phân biệt trạng thái hồ sơ"}
        detail={
          isEn
            ? "Orchard owners self-declare profile details and harvest logs; items without official authority verification carry an explicit disclosure badge."
            : "Nhà vườn tự khai thông tin và nhật ký; hồ sơ chưa được cơ quan có thẩm quyền xác minh OCOP chính thức sẽ gắn nhãn rõ ràng."
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {farms.map((farm) => (
          <Card key={farm.id} className="flex flex-col overflow-hidden">
            <img
              src={farm.bannerImage}
              alt={isEn && farm.enName ? farm.enName : farm.name}
              className="h-52 w-full object-cover"
            />
            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge tone={farm.ocopStatus === "coop_checked_demo" ? "success" : "warning"}>
                    {farm.ocopStatus === "coop_checked_demo" && isEn
                      ? "Co-op Document Checked (Sample)"
                      : farm.ocopStatus !== "coop_checked_demo" && isEn
                      ? "Self-declared by Farm"
                      : farm.ocopLabel}
                  </Badge>
                  <span className="tabular-nums text-xs font-semibold text-[#52645A]">
                    {isEn ? `Area: ${farm.areaHa} ha` : `Quy mô: ${farm.areaHa} ha`}
                  </span>
                </div>
                <h2 className="mt-2 font-editorial text-xl font-semibold text-[#25352B]">
                  {isEn && farm.enName ? farm.enName : farm.name}
                </h2>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#52645A]">
                  <MapPin className="h-3.5 w-3.5 text-[#245B3D]" aria-hidden="true" />
                  <span>{localizeAdminUnitName(farm.addressLabel, undefined, locale)}</span>
                </p>
                <p className="mt-2 text-sm text-[#52645A]">
                  {isEn && farm.enStorySummary ? farm.enStorySummary : farm.storySummary}
                </p>

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
                  href={buildLocalizedHref(`/farms/${farm.slug}`, locale)}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#19472E]"
                >
                  <span>{isEn ? "Open orchard profile" : "Vào hồ sơ nhà vườn"}</span>
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
