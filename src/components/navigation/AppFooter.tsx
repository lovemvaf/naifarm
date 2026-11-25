"use client";

import React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useCms } from "@/context/CmsContext";
import { useSeasonalTheme } from "@/context/SeasonalThemeContext";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";

export function AppFooter() {
  const { locale, t } = useLocale();
  const isEn = locale === "en";
  const { getBlock } = useCms();
  const { activeTheme } = useSeasonalTheme();
  const footerCms = getBlock("footer.brand");
  const resolvedTagline =
    (isEn ? footerCms?.publishedEnTitle : footerCms?.publishedViTitle) || t.brand.tagline;
  const lhref = (href: string) => buildLocalizedHref(href, locale);

  const footerGroups = [
    {
      title: t.nav.footerGroupShop,
      links: [
        { href: "/marketplace", label: isEn ? "Dong Nai OCOP Market" : "Chợ nông sản Đồng Nai" },
        { href: "/farms", label: isEn ? "Orchard & Co-op Directory" : "Danh bạ nhà vườn & HTX" },
        { href: "/explore", label: isEn ? "Orchard Map & Tours" : "Bản đồ & Du lịch vườn" },
        { href: "/quality", label: isEn ? "Quality & OCOP Center" : "Trung tâm chất lượng" },
        { href: "/trace/scan", label: isEn ? "Scan QR Passport" : "Quét tem truy xuất QR" },
      ],
    },
    {
      title: t.nav.footerGroupCommunity,
      links: [
        { href: "/farmer", label: isEn ? "Orchard Owner Space" : "Không gian Nhà nông" },
        { href: "/volunteer", label: isEn ? "Youth Volunteers" : "Thanh niên Tình nguyện" },
        { href: "/learn", label: isEn ? "9-Track Agri Learning" : "Học tập Nông nghiệp" },
        { href: "/live", label: isEn ? "OCOP Live Story Hub" : "Phòng OCOP Live" },
        { href: "/events", label: t.nav.calendar },
      ],
    },
    {
      title: t.nav.footerGroupSupport,
      links: [
        { href: "/sign-in", label: isEn ? "Sign in / Switch role" : "Đăng nhập / Đổi vai trò" },
        { href: "/search", label: isEn ? "Sitewide Search" : "Tìm kiếm toàn trang" },
        { href: "/account/favorites", label: t.nav.favorites },
        { href: "/policies", label: isEn ? "Data Integrity Policy" : "Chính sách & Minh bạch" },
      ],
    },
  ];

  return (
    <footer
      style={{ backgroundColor: activeTheme.decorationAssets.footerLandscapeTint || "#EFECE0" }}
      className="mt-6 border-t border-[#D4DDD0] pb-20 transition-colors duration-300 md:pb-5"
    >
      <div className="mx-auto max-w-[1280px] px-3 py-5 sm:px-4 lg:px-6 lg:py-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12">
          <div className="sm:col-span-2 lg:col-span-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/stitch/stitch-01.jpg"
                alt={t.brand.name}
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg border border-[#D4DDD0] object-cover"
              />
              <div>
                <span className="block text-[15px] leading-tight font-bold text-[#245B3D]">
                  {t.brand.name} · {t.brand.subtitle}
                </span>
                <span className="block text-[11px] text-[#52645A]">{t.brand.cityLabel}</span>
              </div>
            </div>
            <p className="mt-2 font-editorial text-[13px] font-semibold text-[#25352B]">
              {resolvedTagline}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[#52645A]">
              {(isEn ? footerCms?.publishedEnBody : footerCms?.publishedViBody) ||
                (isEn
                  ? "Connecting Dong Nai orchards, transparent seasonal logs, QR traceability, bilingual learning, and local youth volunteers."
                  : "Kết nối nông sản Đồng Nai, nhật ký mùa vụ minh bạch, truy xuất QR, học tập song ngữ và thanh niên tình nguyện địa phương.")}
            </p>
          </div>

          {footerGroups.map((group, idx) => (
            <div key={group.title} className={idx === 2 ? "lg:col-span-2" : "lg:col-span-3"}>
              {/* Mobile accordion */}
              <details className="group rounded-[12px] border border-[#D6DED2] bg-white/70 px-3 py-2 sm:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-bold text-[#25352B]">
                  <span>{group.title}</span>
                  <ChevronDown
                    className="h-4 w-4 text-[#52645A] transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <ul className="mt-2 space-y-1.5 border-t border-[#D6DED2] pt-2 text-xs text-[#52645A]">
                  {group.links.map((item) => (
                    <li key={item.href}>
                      <Link href={lhref(item.href)} className="block py-0.5 hover:text-[#245B3D]">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>

              {/* Desktop compact link list */}
              <div className="hidden sm:block">
                <h2 className="text-xs font-bold tracking-wide text-[#25352B] uppercase">
                  {group.title}
                </h2>
                <ul className="mt-2 space-y-1.5 text-[13px] text-[#44564C]">
                  {group.links.map((item) => (
                    <li key={item.href}>
                      <Link href={lhref(item.href)} className="hover:text-[#245B3D] hover:underline">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-1.5 border-t border-[#D4DDD0] pt-3 text-[11.5px] text-[#52645A] md:flex-row md:items-center md:justify-between md:pr-16">
          <span>{t.brand.footerCopyright}</span>
          <span>{t.brand.footerExperienceDisclaimer}</span>
        </div>
      </div>
    </footer>
  );
}
