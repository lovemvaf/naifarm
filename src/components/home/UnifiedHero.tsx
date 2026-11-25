"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, Pause, Play, Sprout } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useSeasonalTheme } from "@/context/SeasonalThemeContext";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { cn } from "@/lib/format";

const AUTOPLAY_MS = 7000;

/**
 * Respectful 3:2 SVG Flag of Vietnam with centered 5-point gold star.
 * Shown ONLY on approved national/cultural festival slides — never as a language selector.
 */
function VietnamFlagEmblem({ label }: { label: string }) {
  return (
    <svg
      viewBox="0 0 36 24"
      width={36}
      height={24}
      role="img"
      aria-label={label}
      className="shrink-0 rounded-[3px] border border-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.22)]"
    >
      <rect width="36" height="24" fill="#DA251D" />
      <polygon
        fill="#FFCD00"
        points="18,4.2 20.1,10.7 26.9,10.7 21.4,14.6 23.5,21.1 18,17.1 12.5,21.1 14.6,14.6 9.1,10.7 15.9,10.7"
      />
    </svg>
  );
}

/**
 * Lightweight, non-interactive vector corner accents for festive/seasonal slides.
 * Hidden on narrow mobile viewports so focal imagery and typography stay crisp.
 */
function HeroSeasonalCornerAccents({
  showBlossoms,
  showLanterns,
  showNationalFlag,
  isEn,
}: {
  showBlossoms: boolean;
  showLanterns: boolean;
  showNationalFlag: boolean;
  isEn: boolean;
}) {
  return (
    <>
      {showBlossoms ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 180 120"
          className="pointer-events-none absolute top-0 left-0 z-10 hidden h-[96px] w-[144px] opacity-85 sm:block lg:h-[118px] lg:w-[178px]"
        >
          <path
            d="M0 10 C 36 16, 62 34, 96 58"
            stroke="#5A3E24"
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M36 24 C 52 12, 74 10, 92 20"
            stroke="#5A3E24"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="48" cy="22" r="7.5" fill="#F4C44E" />
          <circle cx="48" cy="22" r="2.6" fill="#C47C1A" />
          <circle cx="76" cy="18" r="6" fill="#F9D56E" />
          <circle cx="76" cy="18" r="2" fill="#C47C1A" />
          <circle cx="88" cy="48" r="7" fill="#F4C44E" />
          <circle cx="88" cy="48" r="2.3" fill="#C47C1A" />
          <ellipse cx="62" cy="36" rx="7" ry="3.2" transform="rotate(-24 62 36)" fill="#528A47" />
          <ellipse cx="26" cy="28" rx="6.5" ry="3" transform="rotate(28 26 28)" fill="#6C9C5B" />
        </svg>
      ) : null}

      {showLanterns ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 64 110"
          className="pointer-events-none absolute top-0 left-4 z-10 hidden h-[92px] w-[52px] opacity-90 lg:block"
        >
          <line x1="32" y1="0" x2="32" y2="20" stroke="#D7A34D" strokeWidth="2" />
          <rect x="24" y="18" width="16" height="5" rx="2" fill="#D7A34D" />
          <ellipse cx="32" cy="44" rx="18" ry="22" fill="#B92B22" stroke="#F4C465" strokeWidth="1.5" />
          <path d="M24 23 C 19 36, 19 52, 24 65" stroke="#F4C465" strokeWidth="1" fill="none" opacity="0.7" />
          <path d="M40 23 C 45 36, 45 52, 40 65" stroke="#F4C465" strokeWidth="1" fill="none" opacity="0.7" />
          <rect x="25" y="64" width="14" height="5" rx="2" fill="#D7A34D" />
          <line x1="32" y1="69" x2="32" y2="96" stroke="#C93329" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      ) : null}

      {showNationalFlag ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-3 right-3 z-10 hidden items-center gap-2 rounded-full border border-white/50 bg-[#183D2A]/82 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-xs sm:inline-flex lg:top-4 lg:right-4"
        >
          <VietnamFlagEmblem label={isEn ? "National Flag of Vietnam" : "Quốc kỳ Việt Nam"} />
          <span className="hidden md:inline">
            {isEn ? "Dong Nai · Vietnam" : "Đồng Nai · Việt Nam"}
          </span>
        </div>
      ) : null}
    </>
  );
}

export function UnifiedHero() {
  const { locale } = useLocale();
  const isEn = locale === "en";
  const { activeTheme, slides, override } = useSeasonalTheme();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPausedByUser, setIsPausedByUser] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const totalSlides = slides.length;
  const safeIndex = totalSlides > 0 ? activeIndex % totalSlides : 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setPrefersReducedMotion(mq.matches);
    syncMotion();
    mq.addEventListener?.("change", syncMotion);

    const onVisibility = () => setIsTabHidden(document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      mq.removeEventListener?.("change", syncMotion);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const isAutoplayRunning =
    totalSlides > 1 &&
    !isPausedByUser &&
    !isHovered &&
    !isFocusedWithin &&
    !prefersReducedMotion &&
    !isTabHidden;

  useEffect(() => {
    if (!isAutoplayRunning) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalSlides);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [isAutoplayRunning, totalSlides]);

  const goPrev = useCallback(() => {
    if (totalSlides <= 1) return;
    setActiveIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goNext = useCallback(() => {
    if (totalSlides <= 1) return;
    setActiveIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t0 = e.touches[0];
    if (!t0) return;
    touchStartXRef.current = t0.clientX;
    touchStartYRef.current = t0.clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartXRef.current === null || touchStartYRef.current === null) return;
      const t0 = e.changedTouches[0];
      if (!t0) return;
      const dx = t0.clientX - touchStartXRef.current;
      const dy = t0.clientY - touchStartYRef.current;
      touchStartXRef.current = null;
      touchStartYRef.current = null;
      if (Math.abs(dx) >= 42 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        if (dx < 0) goNext();
        else goPrev();
      }
    },
    [goNext, goPrev],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    },
    [goNext, goPrev],
  );

  const currentSlide = slides[safeIndex];
  if (!currentSlide) return null;

  const decorAllowed = override.decorationsEnabled;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={isEn ? "NaiFarm seasonal highlights" : "Sự kiện và mùa vụ nổi bật NaiFarm"}
      data-v9-hero="true"
      data-active-slide={safeIndex}
      data-seasonal-theme={activeTheme.id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocusedWithin(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsFocusedWithin(false);
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      className="group/hero relative h-[364px] w-full overflow-hidden rounded-[20px] border border-[#D4DDD0] bg-[#EAF0E5] shadow-[0_8px_28px_rgba(24,61,42,0.09)] sm:h-[376px] sm:rounded-[22px] lg:h-[404px]"
    >
      {/* Stacked Crossfade Full-Bleed Slides — Strict Constant Frame Height */}
      {slides.map((slide, idx) => {
        const isActive = idx === safeIndex;
        const slideTitle = isEn ? slide.titleEn : slide.titleVi;
        const slideBadge = isEn ? slide.badgeEn : slide.badgeVi;
        const slideRibbon = isEn ? slide.ribbonEn : slide.ribbonVi;
        const slideSubtitle = isEn ? slide.subtitleEn : slide.subtitleVi;
        const primaryCtaLabel = isEn ? slide.ctaLabelEn : slide.ctaLabelVi;
        const secondaryCtaLabel = isEn ? slide.secondaryCtaLabelEn : slide.secondaryCtaLabelVi;

        return (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${idx + 1} / ${totalSlides}: ${slideTitle}`}
            aria-hidden={!isActive}
            data-slide-id={slide.id}
            data-slide-active={isActive ? "true" : "false"}
            className={cn(
              "v9-hero-fade absolute inset-0 h-full w-full",
              isActive ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0",
            )}
          >
            {/* Full-bleed Responsive WebP Photography with Vertical Mobile Art Direction */}
            <picture className="absolute inset-0 block h-full w-full">
              <source media="(min-width: 768px)" srcSet={slide.desktopWebp} type="image/webp" />
              <source media="(max-width: 767px)" srcSet={slide.mobileWebp} type="image/webp" />
              <img
                src={slide.fallbackJpg}
                alt={isEn ? slide.altEn : slide.altVi}
                loading={idx === 0 ? "eager" : "lazy"}
                fetchPriority={idx === 0 ? "high" : "auto"}
                decoding="async"
                className="h-full w-full object-cover object-center select-none"
              />
            </picture>

            {/* Sunlit Radial Legibility Scrim — Keeps Center Typography >= 7:1 Contrast While Framing Produce Edges */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 74% 84% at 50% 48%, rgba(253, 251, 244, 0.93) 0%, rgba(253, 251, 244, 0.84) 48%, rgba(250, 247, 236, 0.42) 78%, rgba(24, 61, 42, 0.24) 100%)",
              }}
            />

            {/* Subtle Seasonal Corner Ornaments (Non-interactive, Desktop/Tablet Only) */}
            {decorAllowed ? (
              <HeroSeasonalCornerAccents
                showBlossoms={idx === 0 ? activeTheme.decorationAssets.showBlossoms : false}
                showLanterns={idx === 0 ? activeTheme.decorationAssets.showLanterns : false}
                showNationalFlag={slide.showNationalFlag}
                isEn={isEn}
              />
            ) : null}

            {/* Locked Central Editorial Grid — Guarantees <= 2px CTA/Title Drift Across Slides and VI/EN */}
            <div className="relative z-20 mx-auto grid h-full max-w-[760px] grid-rows-[26px_64px_28px_40px_44px] content-center items-center justify-items-center gap-y-2 px-3.5 pb-9 text-center sm:grid-rows-[30px_76px_32px_42px_46px] sm:gap-y-2.5 sm:px-14 sm:pb-6 lg:grid-rows-[32px_86px_34px_42px_48px] lg:gap-y-3">
              {/* Row 1: Brand/Theme Pill */}
              <div className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-[#245B3D]/20 bg-white/95 px-2.5 text-[11px] font-semibold text-[#1E4D33] shadow-xs sm:h-[28px] sm:px-3 sm:text-xs">
                <Sprout className="h-3.5 w-3.5 shrink-0 text-[#245B3D]" aria-hidden="true" />
                <span className="truncate max-w-[220px] sm:max-w-[340px]">{slideBadge}</span>
              </div>

              {/* Row 2: Festival Serif Heading (Fixed Height Track, Clamped to 2 Lines) */}
              {idx === 0 ? (
                <h1
                  id="hero-heading"
                  style={{ color: slide.titleColorHex }}
                  className="font-editorial line-clamp-2 max-w-[22ch] text-[22px] leading-[1.15] font-bold tracking-[-0.015em] drop-shadow-[0_1px_0_rgba(255,255,255,0.85)] sm:text-[34px] lg:text-[42px]"
                >
                  {slideTitle}
                </h1>
              ) : (
                <h2
                  style={{ color: slide.titleColorHex }}
                  className="font-editorial line-clamp-2 max-w-[22ch] text-[22px] leading-[1.15] font-bold tracking-[-0.015em] drop-shadow-[0_1px_0_rgba(255,255,255,0.85)] sm:text-[34px] lg:text-[42px]"
                >
                  {slideTitle}
                </h2>
              )}

              {/* Row 3: Harvest Ribbon Tagline */}
              <div
                style={{
                  backgroundColor: activeTheme.accentTokens.ribbonBg,
                  color: activeTheme.accentTokens.ribbonText,
                }}
                className="inline-flex max-w-full items-center justify-center rounded-full border border-[#D7A34D]/60 px-3 py-1 text-[11px] font-bold tracking-[0.005em] shadow-xs sm:px-3.5 sm:text-[12.5px]"
              >
                <span className="line-clamp-1">{slideRibbon}</span>
              </div>

              {/* Row 4: Concise Value Subtitle */}
              <p className="line-clamp-2 max-w-[54ch] text-[12px] leading-[1.42] font-medium text-[#25352B] sm:text-[13.5px] lg:text-[14.5px]">
                {slideSubtitle}
              </p>

              {/* Row 5: Locked Dual CTA Row */}
              <div
                data-hero-cta-row="true"
                className="flex items-center justify-center gap-2 sm:gap-3"
              >
                <Link
                  href={buildLocalizedHref(slide.ctaHref, locale)}
                  tabIndex={isActive ? 0 : -1}
                  className="inline-flex h-[40px] items-center justify-center gap-1 rounded-full bg-[#245B3D] px-3.5 text-[12px] font-semibold text-white shadow-[0_3px_12px_rgba(24,61,42,0.24)] transition-colors hover:bg-[#183D2A] sm:h-[44px] sm:min-w-[162px] sm:gap-1.5 sm:px-6 sm:text-[13.5px]"
                >
                  <span className="whitespace-nowrap">{primaryCtaLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
                </Link>
                <Link
                  href={buildLocalizedHref(slide.secondaryCtaHref, locale)}
                  tabIndex={isActive ? 0 : -1}
                  className="inline-flex h-[40px] items-center justify-center gap-1 rounded-full border border-[#245B3D]/45 bg-white/96 px-3 text-[12px] font-semibold text-[#1E4D33] shadow-xs transition-colors hover:bg-[#EAF0E5] sm:h-[44px] sm:min-w-[158px] sm:gap-1.5 sm:px-5 sm:text-[13.5px]"
                >
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-[#245B3D]" aria-hidden="true" />
                  <span className="whitespace-nowrap">{secondaryCtaLabel}</span>
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {/* Hover-Reveal & Focus-Visible Edge Prev/Next Arrows (Desktop mid-edge hidden at rest; Mobile anchored at bottom corners away from text) */}
      {totalSlides > 1 ? (
        <>
          <button
            type="button"
            data-hero-nav="prev"
            onClick={goPrev}
            aria-label={isEn ? "Previous hero slide" : "Slide trước"}
            className="absolute bottom-2.5 left-2.5 z-30 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/65 bg-[#183D2A]/78 text-white shadow-md backdrop-blur-xs transition-opacity duration-200 hover:bg-[#183D2A] focus-visible:opacity-100 md:top-1/2 md:bottom-auto md:left-3.5 md:h-10 md:w-10 md:-translate-y-1/2 md:opacity-0 md:group-hover/hero:opacity-100 md:group-focus-within/hero:opacity-100 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            data-hero-nav="next"
            onClick={goNext}
            aria-label={isEn ? "Next hero slide" : "Slide tiếp theo"}
            className="absolute right-2.5 bottom-2.5 z-30 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/65 bg-[#183D2A]/78 text-white shadow-md backdrop-blur-xs transition-opacity duration-200 hover:bg-[#183D2A] focus-visible:opacity-100 md:top-1/2 md:right-3.5 md:bottom-auto md:h-10 md:w-10 md:-translate-y-1/2 md:opacity-0 md:group-hover/hero:opacity-100 md:group-focus-within/hero:opacity-100 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
          </button>
        </>
      ) : null}

      {/* Bottom Indicator Bar: WAI-ARIA compliant tablist (tabs only) + sibling Pause/Play Control */}
      {totalSlides > 1 ? (
        <div className="absolute inset-x-0 bottom-2.5 z-30 flex items-center justify-center gap-2 px-4 sm:bottom-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/55 bg-[#183D2A]/72 px-2.5 py-1.5 backdrop-blur-xs">
            <div
              role="tablist"
              aria-label={isEn ? "Choose highlight slide" : "Chọn slide nổi bật"}
              className="inline-flex items-center gap-1.5"
            >
              {slides.map((slide, idx) => {
                const selected = idx === safeIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-label={
                      isEn
                        ? `Slide ${idx + 1}: ${slide.titleEn}`
                        : `Slide ${idx + 1}: ${slide.titleVi}`
                    }
                    onClick={() => setActiveIndex(idx)}
                    className={cn(
                      "h-2 rounded-full transition-all duration-200 cursor-pointer",
                      selected ? "w-6 bg-[#F4C465]" : "w-2 bg-white/75 hover:bg-white",
                    )}
                  />
                );
              })}
            </div>
            <span className="mx-1 h-3 w-px bg-white/30" aria-hidden="true" />
            <button
              type="button"
              data-hero-pause="true"
              aria-pressed={isPausedByUser}
              onClick={() => setIsPausedByUser((p) => !p)}
              aria-label={
                isPausedByUser
                  ? isEn
                    ? "Resume hero slideshow"
                    : "Tiếp tục chuyển slide"
                  : isEn
                  ? "Pause hero slideshow"
                  : "Tạm dừng chuyển slide"
              }
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-white/95 hover:bg-white/20 cursor-pointer"
            >
              {isPausedByUser || prefersReducedMotion ? (
                <Play className="h-3 w-3 fill-current" aria-hidden="true" />
              ) : (
                <Pause className="h-3 w-3 fill-current" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
