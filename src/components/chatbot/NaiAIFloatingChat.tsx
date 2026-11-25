"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, MessageSquare, Send, Sparkles, X } from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
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
  const { authUser, activeWorkspace, hideAiChatOnSubflow, products } = useDemoStore();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messagesByWs, setMessagesByWs] = useState<Partial<Record<WorkspaceId, ChatMessage[]>>>({});
  const msgSeqRef = useRef(0);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const effectiveWs = inferWorkspaceFromPath(pathname, activeWorkspace);
  const wsConfig = AI_WORKSPACE_CONFIG[effectiveWs];
  const messages: ChatMessage[] = messagesByWs[effectiveWs] ?? [
    {
      id: `greet-${effectiveWs}`,
      sender: "ai",
      text: wsConfig.greeting,
    },
  ];

  // Auto-hide on checkout or during farmer voice recording / active subflows per DESIGN.md
  const suppressedByRoute = pathname === "/" || pathname.startsWith("/checkout") || hideAiChatOnSubflow;

  useEffect(() => {
    if (!open || suppressedByRoute) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, suppressedByRoute]);

  if (suppressedByRoute) return null;

  const handleAsk = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const q = trimmed.toLowerCase();
    msgSeqRef.current += 1;
    const seq = msgSeqRef.current;

    const matchedChip = wsConfig.chips.find(
      (c) =>
        c.prompt.toLowerCase() === q ||
        (q.includes("chôm chôm") && c.prompt.toLowerCase().includes("chôm chôm")) ||
        (q.includes("qr") && c.prompt.toLowerCase().includes("qr")) ||
        (q.includes("giao") && c.prompt.toLowerCase().includes("nhận hàng")) ||
        (q.includes("đăng") && c.prompt.toLowerCase().includes("đăng"))
    );

    const matchedProduct = products.find((p) =>
      q.includes(p.name.toLowerCase().split(" ")[0]) && q.includes(p.name.toLowerCase().split(" ")[1] || "")
    );

    let aiReply: ChatMessage;
    if (matchedChip) {
      aiReply = {
        id: `ai-${effectiveWs}-${seq}`,
        sender: "ai",
        text: matchedChip.reply,
        linkLabel: matchedChip.linkLabel,
        linkHref: matchedChip.linkHref,
        productSlug: matchedChip.productSlug,
      };
    } else if (matchedProduct) {
      aiReply = {
        id: `ai-${effectiveWs}-${seq}`,
        sender: "ai",
        text: `${matchedProduct.name} (${matchedProduct.farmName}) hiện có giá tham khảo ${new Intl.NumberFormat("vi-VN").format(matchedProduct.priceVnd)} đ/${matchedProduct.unitLabel}, lô ${matchedProduct.batchCode}.`,
        linkLabel: `Mở ${matchedProduct.name}`,
        linkHref: `/products/${matchedProduct.slug}`,
        productSlug: matchedProduct.slug,
      };
    } else if (q.includes("thuốc") || q.includes("bệnh") || q.includes("chứng nhận thật")) {
      aiReply = {
        id: `ai-${effectiveWs}-${seq}`,
        sender: "ai",
        text: "NaiAI ở chế độ trợ giúp kịch bản chỉ tra cứu danh mục sản phẩm hiện có, không tự tư vấn thuốc bảo vệ thực vật hay cấp xác nhận OCOP. Vui lòng trao đổi với cán bộ chuyên môn hoặc điều phối viên.",
      };
    } else {
      aiReply = {
        id: `ai-${effectiveWs}-${seq}`,
        sender: "ai",
        text: "Đang ở chế độ Trợ giúp theo kịch bản. Bạn có thể chọn nhanh một câu gợi ý phía trên hoặc mở trực tiếp Chợ OCOP / Hộ chiếu QR để xem thông tin chi tiết.",
        linkLabel: "Về Chợ OCOP",
        linkHref: "/marketplace",
      };
    }

    setMessagesByWs((prev) => {
      const base = prev[effectiveWs] ?? [
        { id: `greet-${effectiveWs}`, sender: "ai", text: wsConfig.greeting },
      ];
      return {
        ...prev,
        [effectiveWs]: [
          ...base,
          { id: `user-${effectiveWs}-${seq}`, sender: "user", text: trimmed },
          aiReply,
        ],
      };
    });
    setInput("");
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 lg:bottom-6 lg:right-6">
      {!open ? (
        <button
          ref={launcherRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Mở trợ lý NaiAI"
          className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#245B3D] text-white shadow-[0_8px_24px_rgba(37,53,43,0.22)] transition-transform duration-150 hover:scale-105 hover:bg-[#19472E] cursor-pointer"
        >
          <Sparkles className="h-6 w-6" aria-hidden="true" strokeWidth={1.75} />
        </button>
      ) : (
        <section
          role="dialog"
          aria-label="NaiAI · Trợ lý NaiFarm"
          className="flex max-h-[85dvh] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-[18px] border border-[#D6DED2] bg-white shadow-[0_16px_48px_rgba(37,53,43,0.22)] lg:max-h-[540px]"
        >
          <header className="flex items-center justify-between bg-[#245B3D] px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <MessageSquare className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-bold leading-tight">
                  {t.ai.panelTitle} ({effectiveWs})
                </h2>
                <p className="text-[11px] text-[#EAF0E5]">
                  {isEn ? "Scripted local guidance · No external API" : "Trợ giúp theo kịch bản · Không gọi API ngoài"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                launcherRef.current?.focus();
              }}
              aria-label={t.nav.closeButton}
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/15 cursor-pointer"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <div className="border-b border-[#D6DED2] bg-[#EAF0E5]/60 px-3 py-2 text-[11px] text-[#52645A]">
            {authUser?.isMinor ? t.ai.minorRestrictedNotice : t.ai.localNotice}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3.5">
            {messages.map((m) => {
              const linkedProd = m.productSlug
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
                        ? "max-w-[85%] rounded-[14px] rounded-br-xs bg-[#245B3D] px-3.5 py-2.5 text-sm text-white"
                        : "max-w-[90%] space-y-2 rounded-[14px] rounded-bl-xs border border-[#D6DED2] bg-[#F5F3E9] px-3.5 py-2.5 text-sm text-[#25352B]"
                    }
                  >
                    <p>{m.text}</p>
                    {linkedProd ? (
                      <Link
                        href={buildLocalizedHref(`/products/${linkedProd.slug}`, locale)}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 rounded-[10px] border border-[#D6DED2] bg-white p-2 hover:bg-[#EAF0E5]"
                      >
                        <img
                          src={linkedProd.image}
                          alt={linkedProd.name}
                          className="h-11 w-11 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-[#25352B]">{linkedProd.name}</p>
                          <p className="text-xs font-semibold text-[#245B3D]">
                            {new Intl.NumberFormat("vi-VN").format(linkedProd.priceVnd)} đ/{linkedProd.unitLabel}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                      </Link>
                    ) : m.linkHref && m.linkLabel ? (
                      <Link
                        href={buildLocalizedHref(m.linkHref, locale)}
                        onClick={() => setOpen(false)}
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
            <div className="mb-2 flex flex-wrap gap-1.5">
              {wsConfig.chips.map((chip) => (
                <button
                  key={chip.prompt}
                  type="button"
                  onClick={() => handleAsk(chip.prompt)}
                  className="rounded-full border border-[#D6DED2] bg-white px-2.5 py-1 text-xs font-medium text-[#245B3D] hover:bg-[#EAF0E5] cursor-pointer"
                >
                  {chip.prompt}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk(input);
              }}
              className="flex items-center gap-2"
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
                className="min-h-[42px] flex-1 rounded-[10px] border border-[#788A7B] bg-white px-3 text-sm text-[#25352B]"
              />
              <button
                type="submit"
                aria-label={t.ai.sendBtn}
                className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-[#245B3D] text-white hover:bg-[#19472E] cursor-pointer"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
