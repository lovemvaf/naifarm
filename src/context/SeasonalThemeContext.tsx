"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDemoStore } from "@/context/DemoStoreContext";
import {
  buildV9HeroSlides,
  resolveActiveSeasonalTheme,
  type SeasonalHeroSlide,
  type SeasonalOverrideState,
  type SeasonalThemeConfig,
  type SeasonalThemeId,
} from "@/lib/seasonal/themes";

const SEASONAL_STORAGE_KEY = "naifarm_seasonal_override_v9";

const DEFAULT_OVERRIDE: SeasonalOverrideState = {
  forcedThemeId: null,
  expiresAtIso: null,
  decorationsEnabled: true,
};

interface SeasonalThemeContextValue {
  activeTheme: SeasonalThemeConfig;
  allThemes: SeasonalThemeConfig[];
  slides: SeasonalHeroSlide[];
  override: SeasonalOverrideState;
  isOverrideActive: boolean;
  setPreviewTheme: (themeId: SeasonalThemeId | null, expiresAtIso?: string | null) => void;
  setDecorationsEnabled: (enabled: boolean) => void;
  resetSeasonalOverride: () => void;
}

const SeasonalThemeContext = createContext<SeasonalThemeContextValue | null>(null);

export function SeasonalThemeProvider({ children }: { children: React.ReactNode }) {
  const { activeClockIso } = useDemoStore();
  const [override, setOverride] = useState<SeasonalOverrideState>(DEFAULT_OVERRIDE);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SEASONAL_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<SeasonalOverrideState>;
      requestAnimationFrame(() => {
        setOverride({
          forcedThemeId: parsed.forcedThemeId ?? null,
          expiresAtIso: parsed.expiresAtIso ?? null,
          decorationsEnabled: parsed.decorationsEnabled ?? true,
        });
      });
    } catch {
      // Ignore storage errors
    }
  }, []);

  const persist = useCallback((next: SeasonalOverrideState) => {
    setOverride(next);
    try {
      window.localStorage.setItem(SEASONAL_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const setPreviewTheme = useCallback(
    (themeId: SeasonalThemeId | null, expiresAtIso: string | null = null) => {
      persist({ ...override, forcedThemeId: themeId, expiresAtIso });
    },
    [override, persist],
  );

  const setDecorationsEnabled = useCallback(
    (enabled: boolean) => {
      persist({ ...override, decorationsEnabled: enabled });
    },
    [override, persist],
  );

  const resetSeasonalOverride = useCallback(() => {
    persist(DEFAULT_OVERRIDE);
  }, [persist]);

  const resolved = useMemo(
    () => resolveActiveSeasonalTheme(activeClockIso, override),
    [activeClockIso, override],
  );

  const slides = useMemo(() => buildV9HeroSlides(resolved.theme), [resolved.theme]);

  const value = useMemo<SeasonalThemeContextValue>(
    () => ({
      activeTheme: resolved.theme,
      allThemes: resolved.allThemes,
      slides,
      override,
      isOverrideActive: resolved.isOverrideActive,
      setPreviewTheme,
      setDecorationsEnabled,
      resetSeasonalOverride,
    }),
    [resolved, slides, override, setPreviewTheme, setDecorationsEnabled, resetSeasonalOverride],
  );

  return (
    <SeasonalThemeContext.Provider value={value}>{children}</SeasonalThemeContext.Provider>
  );
}

export function useSeasonalTheme(): SeasonalThemeContextValue {
  const ctx = useContext(SeasonalThemeContext);
  if (!ctx) {
    const fallback = resolveActiveSeasonalTheme("2026-11-25T12:00:00+07:00", DEFAULT_OVERRIDE);
    return {
      activeTheme: fallback.theme,
      allThemes: fallback.allThemes,
      slides: buildV9HeroSlides(fallback.theme),
      override: DEFAULT_OVERRIDE,
      isOverrideActive: false,
      setPreviewTheme: () => {},
      setDecorationsEnabled: () => {},
      resetSeasonalOverride: () => {},
    };
  }
  return ctx;
}
