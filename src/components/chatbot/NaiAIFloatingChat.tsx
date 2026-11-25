"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  MessageSquare,
  Minimize2,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { localizeProductName, localizeUnit } from "@/lib/i18n/domain-en";
import { cn, formatVnd } from "@/lib/format";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { runGlobalSearch } from "@/lib/search/search-engine";
import { AI_WORKSPACE_CONFIG } from "@/data/demo/ai-scripts";
import type { WorkspaceId } from "@/types/naifarm";

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  linkLabel?: string;
  linkHref?: string;
  productSlug?: string;
}

const FLOAT_DRAFT_KEY = "naiai-floating-draft-v9";
const FLOAT_OPEN_KEY = "naiai-floating-open-v9";
const FLOAT_MSGS_KEY = "naiai-floating-msgs-v9";

function inferWorkspaceFromPath(pathname: string, fallback: WorkspaceId): WorkspaceId {
  if (pathname.startsWith("/farmer")) return "W02";
  if (pathname.startsWith("/volunteer")) return "W03";
  if (pathname.startsWith("/coordinator")) return "W04";
  if (pathname.startsWith("/organization")) return "W05";
  if (pathname.startsWith("/admin")) return "W06";
  if (
    pathname.startsWith("/account") ||
    pathname === "/" ||
    pathname.startsWith("/marketplace") ||
    pathname.startsWith("/learn") ||
    pathname.startsWith("/live") ||
    pathname.startsWith("/explore") ||
    pathname.startsWith("/events")
  ) {
    return "W01";
  }
  return fallback;
}

export function NaiAIFloatingChat() {
  const pathname = usePathname();
  const { locale, t } = useLocale();
  const isEn = locale === "en";
  const {
    authUser,
    activeWorkspace,
    hideAiChatOnSubflow,
    products,
    farms,
    batches,
    lessons,
    missions,
    tourPackages,
    livestreams,
    campaigns,
  } = useDemoStore();

  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messagesByKey, setMessagesByKey] = useState<Record<string, ChatMessage[]>>({});
  const msgSeqRef = useRef(0);
  const launcherRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      const savedDraft = sessionStorage.getItem(FLOAT_DRAFT_KEY);
      if (savedDraft) requestAnimationFrame(() => setInput(savedDraft));
      const savedOpen = sessionStorage.getItem(FLOAT_OPEN_KEY);
      if (savedOpen === "1") requestAnimationFrame(() => setOpen(true));
      const savedMsgs = sessionStorage.getItem(FLOAT_MSGS_KEY);
      if (savedMsgs) {
        const parsed = JSON.parse(savedMsgs) as Record<string, ChatMessage[]>;
        requestAnimationFrame(() => setMessagesByKey(parsed));
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(FLOAT_DRAFT_KEY, input);
    } catch {
      // Ignore
    }
  }, [input]);

  useEffect(() => {
    try {
      sessionStorage.setItem(FLOAT_OPEN_KEY, open ? "1" : "0");
    } catch {
      // Ignore
    }
  }, [open]);

  useEffect(() => {
    try {
      if (Object.keys(messagesByKey).length > 0) {
        sessionStorage.setItem(FLOAT_MSGS_KEY, JSON.stringify(messagesByKey));
      }
    } catch {
      // Ignore
    }
  }, [messagesByKey]);

  const effectiveWs = inferWorkspaceFromPath(pathname, activeWorkspace);
  const stateKey = `${effectiveWs}:${locale}`;
  const wsConfig = AI_WORKSPACE_CONFIG[effectiveWs];
  const defaultGreeting: ChatMessage = {
    id: `greet-${stateKey}`,
    sender: "ai",
    text: isEn ? wsConfig.greetingEn : wsConfig.greeting,
  };
  const messages: ChatMessage[] = messagesByKey[stateKey] ?? [defaultGreeting];

  // Auto-hide on homepage (rendered via NaiFarmHomeChat), checkout, or active recording subflows
  const suppressedByRoute =
    pathname === "/" || pathname.startsWith("/checkout") || hideAiChatOnSubflow;

  useEffect(() => {
    if (!open || suppressedByRoute) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMinimized(false);
        launcherRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, suppressedByRoute]);

  if (suppressedByRoute) return null;

  const isMinorAccount = Boolean(authUser?.isMinor);

  const handleClearChat = () => {
    setMessagesByKey((prev) => ({
      ...prev,
      [stateKey]: [defaultGreeting],
    }));
  };

  const handleAsk = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const q = trimmed.toLowerCase();
    msgSeqRef.current += 1;
    const seq = msgSeqRef.current;

    const asksRestrictedAlcohol =
      q.includes("rượu") || q.includes("wine") || q.includes("bia") || q.includes("alcohol");
    const asksSensitiveSafety =
      q.includes("thuốc") ||
      q.includes("pesticide") ||
      q.includes("liều lượng") ||
      q.includes("dosage") ||
      q.includes("bệnh") ||
      q.includes("cấp chứng nhận");

    let aiReply: ChatMessage | null = null;

    if (isMinorAccount && asksRestrictedAlcohol) {
      aiReply = {
        id: `ai-${seq}`,
        sender: "ai",
        text: isEn
          ? "Minor learner mode restricts adult-only fermented beverages. Let's explore open 2D lessons or fresh orchard produce instead."
          : "Chế độ tài khoản dưới 18 tuổi ẩn nội dung đồ uống có cồn. Bạn có thể khám phá bài học 2D hoặc nông sản tươi sạch.",
        linkLabel: isEn ? "Open 2D Academy" : "Mở Học tập 2D",
        linkHref: "/learn",
      };
    } else if (asksSensitiveSafety) {
      aiReply = {
        id: `ai-${seq}`,
        sender: "ai",
        text: isEn
          ? "NaiAI only retrieves verified app catalog data and does not provide pesticide dosages, plant diagnosis, or official certifications. Please consult agricultural specialists or Quality Standards."
          : "NaiAI chỉ tra cứu dữ liệu công khai trong ứng dụng — không tư vấn liều lượng thuốc BVTV hay cấp chứng nhận thật. Vui lòng trao đổi với chuyên môn hoặc xem Trung tâm chất lượng.",
        linkLabel: t.nav.quality,
        linkHref: "/quality",
      };
    } else {
      const matchedChip = wsConfig.chips.find((c) => {
        const pVi = c.prompt.toLowerCase();
        const pEn = c.promptEn.toLowerCase();
        return pVi === q || pEn === q;
      });

      if (matchedChip) {
        aiReply = {
          id: `ai-${seq}`,
          sender: "ai",
          text: isEn ? matchedChip.replyEn : matchedChip.reply,
          linkLabel: isEn
            ? matchedChip.linkLabelEn ?? matchedChip.linkLabel
            : matchedChip.linkLabel,
          linkHref: matchedChip.linkHref,
          productSlug: matchedChip.productSlug,
        };
      } else {
        const safeProducts = isMinorAccount ? products.filter((p) => !p.adultOnly) : products;
        const searchHits = runGlobalSearch(
          trimmed,
          {
            products: safeProducts,
            farms,
            batches,
            lessons,
            missions,
            tours: tourPackages,
            livestreams,
            campaigns,
          },
          4,
        ).results;

        const topProductHit = searchHits.find((h) => h.kind === "product");
        const topMatchedProd = topProductHit
          ? safeProducts.find((p) => `/products/${p.slug}` === topProductHit.href)
          : undefined;

        if (topMatchedProd) {
          const pName = localizeProductName(topMatchedProd, locale);
          const pUnit = localizeUnit(topMatchedProd.unitLabel, locale);
          aiReply = {
            id: `ai-${seq}`,
            sender: "ai",
            text: isEn
              ? `Matched catalog item: ${pName} from ${topMatchedProd.farmName} — ${formatVnd(topMatchedProd.priceVnd, locale)}/${pUnit} (lot ${topMatchedProd.batchCode}).`
              : `Tìm thấy trong dữ liệu thực: ${pName} (${topMatchedProd.farmName}) · ${formatVnd(topMatchedProd.priceVnd, locale)}/${pUnit}, mã lô ${topMatchedProd.batchCode}.`,
            linkLabel: pName,
            linkHref: `/products/${topMatchedProd.slug}`,
            productSlug: topMatchedProd.slug,
          };
        } else if (searchHits.length > 0) {
          const best = searchHits[0];
          const second = searchHits[1];
          aiReply = {
            id: `ai-${seq}`,
            sender: "ai",
            text: isEn
              ? `Found "${best.title}" (${best.kindLabel} · ${best.subtitle})${second ? `, and "${second.title}".` : "."}`
              : `Kết quả khớp trên NaiFarm: "${best.title}" (${best.kindLabel} · ${best.subtitle})${second ? `, ngoài ra còn "${second.title}".` : "."}`,
            linkLabel: isEn ? `Open ${best.title}` : `Xem ${best.title}`,
            linkHref: best.href,
          };
        }
      }
    }

    if (!aiReply) {
      aiReply = {
        id: `ai-${seq}`,
        sender: "ai",
        text: isEn
          ? "No exact local match found. Try a quick topic chip below or search across all 168 produce items, 40 farms, 28 tours, and QR records."
          : "Chưa tìm thấy mục khớp trực tiếp. Bạn có thể bấm câu gợi ý bên dưới hoặc mở tìm kiếm toàn trang.",
        linkLabel: isEn ? "Open Global Search" : "Mở Tìm kiếm toàn trang",
        linkHref: `/search?q=${encodeURIComponent(trimmed)}`,
      };
    }

    setMessagesByKey((prev) => {
      const base = prev[stateKey] ?? [defaultGreeting];
      return {
        ...prev,
        [stateKey]: [
          ...base,
          { id: `user-${seq}`, sender: "user", text: trimmed },
          aiReply!,
        ],
      };
    });
    setInput("");
  };

  const isPdpRoute = pathname.startsWith("/products/");

  return (
    <div
      className={cn(
        "pointer-events-none fixed right-3 z-40 sm:right-5 md:bottom-5",
        isPdpRoute
          ? "bottom-[calc(8.6rem+env(safe-area-inset-bottom))]"
          : "bottom-[calc(4.6rem+env(safe-area-inset-bottom))]",
      )}
    >
      {!open ? (
        <button
          ref={launcherRef}
          type="button"
          data-naiai-launcher="floating"
          onClick={() => {
            setOpen(true);
            setMinimized(false);
          }}
          aria-label={t.ai.launcherLabel}
          className="pointer-events-auto group flex h-13 w-13 cursor-pointer items-center justify-center rounded-full bg-[#245B3D] text-white shadow-[0_8px_24px_rgba(24,61,42,0.24)] transition-transform duration-150 hover:scale-105 hover:bg-[#183D2A] md:h-14 md:w-14"
        >
          <Sparkles className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" strokeWidth={1.75} />
        </button>
      ) : (
        /* STRICTLY NON-MODAL FLOATING PANEL (role="region", NO backdrop, NO scroll lock) */
        <aside
          role="region"
          data-naiai-panel="floating"
          aria-label={t.ai.panelTitle}
          className={cn(
            "pointer-events-auto flex flex-col overflow-hidden rounded-[18px] border border-[#D6DED2] bg-white shadow-[0_14px_42px_rgba(24,61,42,0.22)] transition-[height,width] duration-200",
            minimized
              ? "h-[52px] w-[min(276px,calc(100vw-24px))]"
              : "max-h-[min(510px,62dvh)] w-[min(368px,calc(100vw-24px))] md:max-h-[min(530px,calc(100dvh-110px))]",
          )}
        >
          <header className="flex shrink-0 items-center justify-between gap-2 bg-[#183D2A] px-3.5 py-2.5 text-white">
            <button
              type="button"
              onClick={() => minimized && setMinimized(false)}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-[13px] leading-tight font-bold">{t.ai.panelTitle}</h2>
                {!minimized ? (
                  <p className="truncate text-[10.5px] text-[#EAF0E5]">
                    {isEn ? "Non-blocking local search" : "Tra cứu song song · Không khóa trang"}
                  </p>
                ) : null}
              </div>
            </button>
            <div className="flex shrink-0 items-center gap-0.5">
              {!minimized ? (
                <button
                  type="button"
                  onClick={handleClearChat}
                  aria-label={isEn ? "Clear conversation" : "Xóa cuộc trò chuyện"}
                  title={isEn ? "Clear chat" : "Xóa hội thoại"}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg hover:bg-white/15"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setMinimized((m) => !m)}
                aria-label={
                  minimized
                    ? isEn
                      ? "Restore assistant"
                      : "Mở lại trợ lý"
                    : isEn
                    ? "Minimize assistant"
                    : "Thu gọn trợ lý"
                }
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg hover:bg-white/15"
              >
                <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setMinimized(false);
                  launcherRef.current?.focus();
                }}
                aria-label={t.nav.closeButton}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg hover:bg-white/15"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </header>

          {!minimized ? (
            <>
              <div className="border-b border-[#D6DED2] bg-[#EAF0E5]/60 px-3 py-1.5 text-[11px] text-[#52645A]">
                {isMinorAccount ? t.ai.minorRestrictedNotice : t.ai.localNotice}
              </div>

              <div className="flex-1 space-y-2.5 overflow-y-auto p-3">
                {messages.map((m) => {
                  const linkedProd =
                    m.productSlug &&
                    (!isMinorAccount ||
                      !products.find((p) => p.slug === m.productSlug)?.adultOnly)
                      ? products.find((p) => p.slug === m.productSlug)
                      : undefined;
                  return (
                    <div
                      key={m.id}
                      className={m.sender === "user" ? "flex justify-end" : "flex justify-start"}
                    >
                      <div
                        className={
                          m.sender === "user"
                            ? "max-w-[85%] rounded-[14px] rounded-br-xs bg-[#245B3D] px-3 py-2 text-[13px] text-white"
                            : "max-w-[90%] space-y-2 rounded-[14px] rounded-bl-xs border border-[#D6DED2] bg-[#F5F3E9] px-3 py-2 text-[13px] text-[#25352B]"
                        }
                      >
                        <p>{m.text}</p>
                        {linkedProd ? (
                          <Link
                            href={buildLocalizedHref(`/products/${linkedProd.slug}`, locale)}
                            className="flex items-center gap-2 rounded-[10px] border border-[#D6DED2] bg-white p-2 hover:bg-[#EAF0E5]"
                          >
                            <img
                              src={linkedProd.image}
                              alt={localizeProductName(linkedProd, locale)}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-bold text-[#25352B]">
                                {localizeProductName(linkedProd, locale)}
                              </p>
                              <p className="text-xs font-semibold text-[#A52C22]">
                                {formatVnd(linkedProd.priceVnd, locale)}/
                                {localizeUnit(linkedProd.unitLabel, locale)}
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                          </Link>
                        ) : m.linkHref && m.linkLabel ? (
                          <Link
                            href={buildLocalizedHref(m.linkHref, locale)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#245B3D] underline"
                          >
                            <span>{m.linkLabel}</span>
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-[#D6DED2] bg-[#F5F3E9]/70 px-3 py-2">
                <div className="mb-1.5 flex flex-wrap gap-1.5">
                  {wsConfig.chips.map((chip) => {
                    const chipPrompt = isEn ? chip.promptEn : chip.prompt;
                    return (
                      <button
                        key={chip.prompt}
                        type="button"
                        onClick={() => handleAsk(chipPrompt)}
                        className="cursor-pointer rounded-full border border-[#D6DED2] bg-white px-2.5 py-1 text-[11px] font-medium text-[#245B3D] hover:bg-[#EAF0E5]"
                      >
                        {chipPrompt}
                      </button>
                    );
                  })}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAsk(input);
                  }}
                  className="flex items-center gap-1.5"
                >
                  <label htmlFor="naiai-input" className="sr-only">
                    {t.ai.launcherLabel}
                  </label>
                  <input
                    id="naiai-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.ai.inputPlaceholder}
                    className="min-h-[38px] flex-1 rounded-[10px] border border-[#788A7B] bg-white px-2.5 text-sm text-[#25352B]"
                  />
                  <button
                    type="submit"
                    aria-label={t.ai.sendBtn}
                    className="flex h-[38px] w-[38px] shrink-0 cursor-pointer items-center justify-center rounded-[10px] bg-[#245B3D] text-white hover:bg-[#183D2A]"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                  </button>
                </form>
              </div>
            </>
          ) : null}
        </aside>
      )}
    </div>
  );
}
