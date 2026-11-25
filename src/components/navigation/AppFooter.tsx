"use client";

import React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useCms } from "@/context/CmsContext";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";

export function AppFooter() {
  const { locale, t } = useLocale();
  const isEn = locale === "en";
  const { getBlock } = useCms();
  const footerCms = getBlock("footer.brand");
  const resolvedTagline =
    (isEn ? footerCms?.publishedEnTitle : footerCms?.publishedViTitle) || t.brand.tagline;
  const lhref = (href: string) => buildLocalizedHref(href, locale);

  const footerGroups = [
    {
      title: t.nav.footerGroupShop,
      links: [
        { href: "/marketplace", label: isEn ? "Dong Nai OCOP Market" : "Chợ nông sản Đồng Nai" },
        { href: "/farms", label: isEn ? "Orchard & Cooperative Directory" : "Danh bạ nhà vườn & HTX" },
        { href: "/explore", label: isEn ? "Orchard Map & Agritourism" : "Bản đồ & Du lịch miệt vườn" },
        { href: "/quality", label: isEn ? "Quality & OCOP Standards" : "Trung tâm chất lượng & OCOP" },
        { href: "/trace/scan", label: isEn ? "Scan QR Traceability Tag" : "Quét tem truy xuất nguồn gốc" },
      ],
    },
    {
      title: t.nav.footerGroupCommunity,
      links: [
        { href: "/farmer", label: isEn ? "Orchard Owner Space" : "Góc Nhà vườn & HTX" },
        { href: "/volunteer", label: isEn ? "Youth Volunteers" : "Thanh niên Tình nguyện" },
        { href: "/learn", label: isEn ? "Bilingual Produce Learning" : "Học tập & Khám phá nông sản" },
        { href: "/live", label: isEn ? "OCOP Live Story Hub" : "Phòng OCOP Live" },
        { href: "/events", label: t.nav.calendar },
      ],
    },
    {
      title: t.nav.footerGroupSupport,
      links: [
        { href: "/sign-in", label: isEn ? "Sign in / Role switcher" : "Đăng nhập / Chọn vai trò" },
        { href: "/search", label: isEn ? "Sitewide Search" : "Tìm kiếm toàn trang" },
        { href: "/account/favorites", label: t.nav.favorites },
        { href: "/policies", label: isEn ? "Data Integrity & Safeguarding" : "Chính sách & Minh bạch dữ liệu" },
      ],
    },
  ];

  return (
    <footer className="mt-8 border-t border-[#D6DED2] bg-[#EFECE0] pb-20 lg:pb-8">
      <div className="mx-auto max-w-[1360px] px-4 py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12">
          <div className="sm:col-span-2 lg:col-span-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/stitch/stitch-01.jpg"
                alt={t.brand.name}
                width={34}
                height={34}
                className="h-9 w-9 rounded-lg border border-[#D6DED2] object-cover"
              />
              <div>
                <span className="block text-base font-bold text-[#245B3D]">
                  {t.brand.name} · {t.brand.subtitle}
                </span>
                <span className="block text-[11px] text-[#52645A]">{t.brand.cityLabel}</span>
              </div>
            </div>
            <p className="mt-3 font-editorial text-sm font-semibold text-[#25352B]">
              {resolvedTagline}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[#52645A]">
              {(isEn ? footerCms?.publishedEnBody : footerCms?.publishedViBody) ||
                (isEn
                  ? "Connecting Dong Nai family orchards, honest seasonal logs, QR lot traceability, bilingual youth ambassadors, and orchard tour experiences."
                  : "Nền tảng kết nối nông sản Đồng Nai, nhật ký mùa vụ minh bạch, truy xuất nguồn gốc QR, học tập song ngữ và thanh niên tình nguyện đồng hành cùng nhà vườn địa phương.")}
            </p>
          </div>

          {footerGroups.map((group, idx) => (
            <div key={group.title} className={idx === 2 ? "lg:col-span-2" : "lg:col-span-3"}>
              {/* Mobile accordion */}
              <details className="group rounded-[12px] border border-[#D6DED2] bg-[#F5F3E9]/70 px-3.5 py-2.5 sm:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-[#25352B]">
                  <span>{group.title}</span>
                  <ChevronDown
                    className="h-4 w-4 text-[#52645A] transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <ul className="mt-2.5 space-y-2 border-t border-[#D6DED2] pt-2.5 text-sm text-[#52645A]">
                  {group.links.map((item) => (
                    <li key={item.href}>
                      <Link href={lhref(item.href)} className="block py-0.5 hover:text-[#245B3D]">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>

              {/* Desktop list */}
              <div className="hidden sm:block">
                <h2 className="text-sm font-bold text-[#25352B]">{group.title}</h2>
                <ul className="mt-3 space-y-2 text-sm text-[#52645A]">
                  {group.links.map((item) => (
                    <li key={item.href}>
                      <Link href={lhref(item.href)} className="hover:text-[#245B3D]">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-[#D6DED2] pt-5 pb-12 text-xs text-[#52645A] sm:pb-2 md:flex-row md:items-center md:justify-between md:pr-16">
          <span>{t.brand.footerCopyright}</span>
          <span>{t.brand.footerExperienceDisclaimer}</span>
        </div>
      </div>
    </footer>
  );
}
