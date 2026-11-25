"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useSeasonalTheme } from "@/context/SeasonalThemeContext";

function resolveRouteIntensity(pathname: string): "none" | "light" | "medium" | "high" {
  if (
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/farmer") ||
    pathname.startsWith("/organization") ||
    pathname.startsWith("/coordinator") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/sign-")
  ) {
    return "none";
  }
  if (pathname === "/") return "high";
  if (pathname.startsWith("/products/")) return "light";
  return "medium";
}

/**
 * Lightweight, non-interactive perimeter seasonal ornaments for wide desktop viewports.
 * Strictly pointer-events: none, aria-hidden: true, hidden on narrow mobile & operational routes,
 * never causes horizontal overflow or intercepts clicks/scroll.
 */
export function SeasonalPageDecor() {
  const pathname = usePathname();
  const { activeTheme, override } = useSeasonalTheme();
  const intensity = resolveRouteIntensity(pathname);

  if (!override.decorationsEnabled || intensity === "none") return null;

  const opacityClass =
    intensity === "high" ? "opacity-90" : intensity === "medium" ? "opacity-55" : "opacity-35";

  return (
    <div
      aria-hidden="true"
      data-seasonal-theme={activeTheme.id}
      className={`pointer-events-none fixed inset-x-0 top-20 z-0 hidden overflow-hidden xl:block ${opacityClass}`}
      style={{ height: "340px" }}
    >
      {/* Subtle left botanical corner bough */}
      <svg
        viewBox="0 0 180 220"
        className="absolute top-0 left-0 h-[220px] w-[160px]"
        fill="none"
      >
        <path
          d="M-8 14 C 36 28, 72 64, 96 112"
          stroke="#4C7C47"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.45"
        />
        <ellipse cx="38" cy="40" rx="18" ry="8" transform="rotate(-24 38 40)" fill="#6C9C5B" opacity="0.34" />
        <ellipse cx="64" cy="68" rx="16" ry="7" transform="rotate(18 64 68)" fill="#245B3D" opacity="0.26" />
        <ellipse cx="26" cy="76" rx="14" ry="6" transform="rotate(34 26 76)" fill="#6C9C5B" opacity="0.28" />
        {activeTheme.decorationAssets.showBlossoms ? (
          <>
            <circle cx="52" cy="46" r="6" fill="#F2BE42" opacity="0.65" />
            <circle cx="52" cy="46" r="2.2" fill="#B45309" opacity="0.7" />
            <circle cx="80" cy="86" r="5" fill="#F2BE42" opacity="0.55" />
            <circle cx="80" cy="86" r="1.8" fill="#B45309" opacity="0.65" />
          </>
        ) : null}
      </svg>

      {/* Subtle right botanical corner bough */}
      <svg
        viewBox="0 0 180 220"
        className="absolute top-0 right-0 h-[220px] w-[160px] -scale-x-100"
        fill="none"
      >
        <path
          d="M-8 14 C 36 28, 72 64, 96 112"
          stroke="#4C7C47"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.45"
        />
        <ellipse cx="38" cy="40" rx="18" ry="8" transform="rotate(-24 38 40)" fill="#6C9C5B" opacity="0.34" />
        <ellipse cx="64" cy="68" rx="16" ry="7" transform="rotate(18 64 68)" fill="#245B3D" opacity="0.26" />
        {activeTheme.decorationAssets.showLanterns ? (
          <g opacity="0.58">
            <line x1="68" y1="0" x2="68" y2="28" stroke="#B45309" strokeWidth="1.5" />
            <rect x="57" y="28" width="22" height="26" rx="11" fill="#C83428" />
            <rect x="63" y="25" width="10" height="4" rx="2" fill="#D7A34D" />
            <rect x="63" y="54" width="10" height="4" rx="2" fill="#D7A34D" />
          </g>
        ) : null}
      </svg>
    </div>
  );
}
