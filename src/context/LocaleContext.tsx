"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { MESSAGES_VI } from "@/lib/i18n/messages-vi";
import { MESSAGES_EN } from "@/lib/i18n/messages-en";
import type { Messages } from "@/lib/i18n/types";
import type { CurrencyDisplayMode, Locale } from "@/types/naifarm";

const LOCALE_STORAGE_KEY = "naifarm_locale_v4";
const CURRENCY_STORAGE_KEY = "naifarm_currency_mode_v4";

const listeners = new Set<() => void>();
let cachedLocale: Locale | null = null;
let cachedCurrency: CurrencyDisplayMode | null = null;

function notifySubscribers() {
  for (const listener of listeners) listener();
}

function subscribeLocaleStore(listener: () => void) {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    const onPop = () => {
      cachedLocale = null;
      notifySubscribers();
    };
    window.addEventListener("popstate", onPop);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("popstate", onPop);
    };
  }
  return () => {
    listeners.delete(listener);
  };
}

function getLocaleSnapshot(): Locale {
  if (typeof window === "undefined") return "vi";
  const urlLang = new URLSearchParams(window.location.search).get("lang");
  if (urlLang === "en" || urlLang === "vi") {
    if (cachedLocale !== urlLang) {
      cachedLocale = urlLang;
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, urlLang);
        document.cookie = `naifarm_locale=${urlLang}; path=/; max-age=2592000; SameSite=Lax`;
      } catch {
        // Ignore storage errors
      }
    }
    return urlLang;
  }
  if (cachedLocale) return cachedLocale;
  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved === "en" || saved === "vi") {
      cachedLocale = saved;
      return saved;
    }
  } catch {
    // Ignore storage errors
  }
  return "vi";
}

function getCurrencySnapshot(): CurrencyDisplayMode {
  if (typeof window === "undefined") return "vnd";
  if (cachedCurrency) return cachedCurrency;
  try {
    const saved = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (saved === "vnd_usd_est" || saved === "vnd") {
      cachedCurrency = saved;
      return saved;
    }
  } catch {
    // Ignore storage errors
  }
  return "vnd";
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: Messages;
  currencyMode: CurrencyDisplayMode;
  setCurrencyMode: (next: CurrencyDisplayMode) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore<Locale>(
    subscribeLocaleStore,
    getLocaleSnapshot,
    () => "vi",
  );
  const currencyMode = useSyncExternalStore<CurrencyDisplayMode>(
    subscribeLocaleStore,
    getCurrencySnapshot,
    () => "vnd",
  );

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    cachedLocale = next;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
        document.cookie = `naifarm_locale=${next}; path=/; max-age=2592000; SameSite=Lax`;
        document.documentElement.lang = next;
        const url = new URL(window.location.href);
        if (next === "en") url.searchParams.set("lang", "en");
        else url.searchParams.delete("lang");
        window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
      } catch {
        // Ignore history/storage restrictions
      }
    }
    notifySubscribers();
  }, []);

  const setCurrencyMode = useCallback((next: CurrencyDisplayMode) => {
    cachedCurrency = next;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(CURRENCY_STORAGE_KEY, next);
      } catch {
        // Ignore storage errors
      }
    }
    notifySubscribers();
  }, []);

  const t: Messages = locale === "en" ? MESSAGES_EN : MESSAGES_VI;

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t, currencyMode, setCurrencyMode }),
    [locale, setLocale, t, currencyMode, setCurrencyMode],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      locale: "vi",
      setLocale: () => {},
      t: MESSAGES_VI,
      currencyMode: "vnd",
      setCurrencyMode: () => {},
    };
  }
  return ctx;
}
