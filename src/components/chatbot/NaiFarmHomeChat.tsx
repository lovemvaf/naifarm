"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowUp,
  ImagePlus,
  Leaf,
  MessageCircle,
  Minimize2,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLocale } from "@/context/LocaleContext";
import { cn } from "@/lib/format";

type SourceReference = { title: string; href?: string };
type Message = {
  role: "user" | "assistant";
  text: string;
  image?: string;
  sources?: SourceReference[];
  cards?: { title: string; image: string; href: string; label: string }[];
};

const DRAFT_KEY = "naiai-home-draft-v9";
const OPEN_KEY = "naiai-home-open-v9";

const formatAnswer = (text: string) =>
  text.replace(/\*\*([\s\S]*?)\*\*/g, "$1").replace(/\\\*/g, "");
const withoutImage = (message: Message): Message => {
  const copy = { ...message };
  delete copy.image;
  return copy;
};

function SourceLink({ source, isEn }: { source: SourceReference; isEn: boolean }) {
  return source.href ? (
    <a
      className="mt-2 flex items-center gap-1 font-semibold text-[#245B3D] underline underline-offset-2"
      href={source.href}
      target={source.href.startsWith("http") ? "_blank" : undefined}
      rel={source.href.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {source.title} →
    </a>
  ) : (
    <span className="mt-2 block text-xs text-[#52645A]">
      {isEn ? "Reference:" : "Tài liệu tham khảo:"} {source.title}
    </span>
  );
}

export function NaiFarmHomeChat() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const isEn = locale === "en";
  const isCheckout = pathname.startsWith("/checkout");
  const isPdp = pathname.startsWith("/products/");
  const prompts = isEn
    ? ["Trace batch NF-DEMO-001", "How to list farm produce?", "How do youth support growers?"]
    : ["Tra lô NF-DEMO-001", "Đăng bán nông sản thế nào?", "Thanh niên hỗ trợ nhà vườn ra sao?"];
  const greeting = isEn
    ? "Hello! I can help you trace QR origins, explore Dong Nai produce, or guide orchard growers and youth volunteers."
    : "Xin chào! Mình có thể giúp bạn tra mã QR nguồn gốc, tìm nông sản Đồng Nai hoặc hướng dẫn nhà vườn và thanh niên.";

  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [zoom, setZoom] = useState(0);
  const [error, setError] = useState("");
  const [session, setSession] = useState(() =>
    typeof window === "undefined"
      ? ""
      : sessionStorage.getItem("naiai-home-session") ?? crypto.randomUUID(),
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const tail = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const abort = useRef<AbortController | null>(null);
  const failed = useRef<{ text: string; photo: File | null } | null>(null);

  const displayMessages =
    messages.length === 0 ? [{ role: "assistant" as const, text: greeting }] : messages;

  // Restore session history, draft, and open preference safely on client
  useEffect(() => {
    if (!session) return;
    sessionStorage.setItem("naiai-home-session", session);
    try {
      const saved = sessionStorage.getItem(`naiai-home-${session}`);
      if (saved) {
        const restored = JSON.parse(saved) as Message[];
        requestAnimationFrame(() => setMessages(restored.map(withoutImage)));
      }
      const savedDraft = sessionStorage.getItem(DRAFT_KEY);
      if (savedDraft) requestAnimationFrame(() => setInput(savedDraft));
      const savedOpen = sessionStorage.getItem(OPEN_KEY);
      if (savedOpen === "1") requestAnimationFrame(() => setOpen(true));
    } catch {
      sessionStorage.removeItem(`naiai-home-${session}`);
    }
  }, [session]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(DRAFT_KEY, input);
    } catch {
      // Ignore storage error
    }
  }, [input]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(OPEN_KEY, open ? "1" : "0");
    } catch {
      // Ignore storage error
    }
  }, [open]);

  useEffect(() => {
    tail.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, busy, open, minimized]);

  useEffect(() => {
    if (!open) return;
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setMinimized(false);
        launcher.current?.focus();
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [open]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => () => {
    abort.current?.abort();
  }, []);

  async function send(text: string, retry = false) {
    const question = text.trim();
    const current = retry ? failed.current?.photo ?? null : photo;
    if ((!question && !current) || busy) return;
    if (current && !["image/jpeg", "image/png", "image/webp"].includes(current.type)) {
      setError(
        isEn
          ? "Please choose a JPEG, PNG, or WebP image."
          : "Vui lòng chọn ảnh JPEG, PNG hoặc WebP.",
      );
      return;
    }
    const baseMessages = displayMessages;
    const next = retry
      ? baseMessages
      : [
          ...baseMessages,
          {
            role: "user" as const,
            text:
              question || (isEn ? "Please help me inspect this photo." : "Hãy giúp tôi đọc ảnh này."),
            ...(preview ? { image: preview } : {}),
          },
        ].slice(-30);
    setMessages(next);
    setInput("");
    setPhoto(null);
    setPreview("");
    setError("");
    setBusy(true);
    const controller = new AbortController();
    abort.current = controller;
    try {
      const form = new FormData();
      form.set("question", question);
      form.set("sessionId", session);
      form.set(
        "history",
        JSON.stringify(
          baseMessages.slice(-6).map(({ role, text: value }) => ({ role, content: value })),
        ),
      );
      if (current) form.set("image", current);
      const response = await fetch("/api/nai-ai/chat", {
        method: "POST",
        body: form,
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error ||
            (isEn
              ? "NaiAI could not reply right now. Please try again."
              : "NaiAI chưa thể trả lời. Vui lòng thử lại."),
        );
      const result = [
        ...next,
        {
          role: "assistant" as const,
          text: data.answer as string,
          sources: data.sources as Message["sources"],
          cards: data.cards as Message["cards"],
        },
      ].slice(-30);
      failed.current = null;
      setMessages(result);
      sessionStorage.setItem(`naiai-home-${session}`, JSON.stringify(result.map(withoutImage)));
    } catch (cause) {
      if (!controller.signal.aborted) {
        failed.current = { text: question, photo: current };
        setError(
          cause instanceof Error
            ? cause.message
            : isEn
            ? "Connection interrupted. Please try again."
            : "Kết nối bị gián đoạn. Vui lòng thử lại.",
        );
      }
    } finally {
      if (abort.current === controller) abort.current = null;
      setBusy(false);
    }
  }

  if (isCheckout) return null;

  return (
    <>
      {!open ? (
        <button
          ref={launcher}
          type="button"
          data-naiai-launcher="home"
          onClick={() => {
            setOpen(true);
            setMinimized(false);
          }}
          aria-label={isEn ? "Open NaiAI assistant" : "Mở trợ lý NaiAI"}
          className={cn(
            "fixed right-3 z-40 flex h-13 w-13 cursor-pointer items-center justify-center rounded-full bg-[#245B3D] text-white shadow-[0_8px_28px_rgba(24,61,42,.28)] transition hover:-translate-y-0.5 hover:bg-[#183D2A] sm:right-5 md:bottom-5 md:h-14 md:w-14",
            isPdp
              ? "bottom-[calc(8.6rem+env(safe-area-inset-bottom))]"
              : "bottom-[calc(4.6rem+env(safe-area-inset-bottom))]",
          )}
        >
          <MessageCircle size={22} aria-hidden="true" />
          <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#89B57C]" />
        </button>
      ) : null}

      {/* STRICTLY NON-MODAL FLOATING PANEL (role="region", NO backdrop, NO scroll lock, NO focus trap) */}
      {open ? (
        <aside
          role="region"
          data-naiai-panel="home"
          aria-label={isEn ? "NaiAI · NaiFarm Assistant" : "NaiAI · Trợ lý NaiFarm"}
          className={cn(
            "fixed right-3 z-40 flex flex-col overflow-hidden rounded-[20px] border border-[#D6DED2] bg-[#FCFCF8] shadow-[0_14px_44px_rgba(24,61,42,.22)] transition-[height,width] duration-200 sm:right-5 md:bottom-5",
            isPdp
              ? "bottom-[calc(8.4rem+env(safe-area-inset-bottom))]"
              : "bottom-[calc(4.5rem+env(safe-area-inset-bottom))]",
            minimized
              ? "h-[54px] w-[min(280px,calc(100vw-24px))]"
              : zoom === 0
              ? "h-[min(500px,62dvh)] w-[min(368px,calc(100vw-24px))] sm:h-[min(540px,calc(100dvh-110px))]"
              : "h-[min(620px,74dvh)] w-[min(460px,calc(100vw-24px))] sm:h-[min(660px,calc(100dvh-110px))]",
          )}
        >
          <header className="flex shrink-0 items-center justify-between gap-2 bg-[#183D2A] px-3.5 py-2.5 text-white">
            <button
              type="button"
              onClick={() => minimized && setMinimized(false)}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Leaf size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-[13px] leading-tight font-bold whitespace-nowrap">
                  NaiAI{" "}
                  <span className="font-normal text-white/75">
                    {isEn ? "· Assistant" : "· Trợ lý"}
                  </span>
                </h2>
                {!minimized ? (
                  <p className="truncate text-[10.5px] text-white/80">
                    {isEn ? "Non-blocking helper" : "Hỗ trợ song song, không khóa trang"}
                  </p>
                ) : null}
              </div>
            </button>

            <div className="flex shrink-0 items-center gap-0.5">
              {!minimized ? (
                <>
                  <button
                    type="button"
                    aria-label={isEn ? "Shrink chat" : "Thu nhỏ khung chat"}
                    title={isEn ? "Shrink chat" : "Thu nhỏ"}
                    disabled={zoom === 0}
                    onClick={() => setZoom(0)}
                    className="cursor-pointer rounded-lg p-1 hover:bg-white/15 disabled:opacity-40"
                  >
                    <Minus size={15} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label={isEn ? "Expand chat" : "Mở rộng khung chat"}
                    title={isEn ? "Expand chat" : "Mở rộng"}
                    disabled={zoom === 1}
                    onClick={() => setZoom(1)}
                    className="cursor-pointer rounded-lg p-1 hover:bg-white/15 disabled:opacity-40"
                  >
                    <Plus size={15} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label={isEn ? "New conversation" : "Cuộc trò chuyện mới"}
                    title={isEn ? "New chat" : "Hội thoại mới"}
                    onClick={() => {
                      abort.current?.abort();
                      failed.current = null;
                      setInput("");
                      setPhoto(null);
                      setPreview("");
                      const id = crypto.randomUUID();
                      sessionStorage.setItem("naiai-home-session", id);
                      setSession(id);
                      setMessages([]);
                      setError("");
                    }}
                    className="cursor-pointer rounded-lg p-1 hover:bg-white/15"
                  >
                    <RotateCcw size={15} aria-hidden="true" />
                  </button>
                </>
              ) : null}

              <button
                type="button"
                aria-label={
                  minimized
                    ? isEn
                      ? "Restore NaiAI chat"
                      : "Mở lại khung chat NaiAI"
                    : isEn
                    ? "Minimize NaiAI chat"
                    : "Thu gọn thanh NaiAI"
                }
                title={minimized ? (isEn ? "Restore" : "Mở lại") : isEn ? "Minimize" : "Thu gọn"}
                onClick={() => setMinimized((m) => !m)}
                className="cursor-pointer rounded-lg p-1 hover:bg-white/15"
              >
                <Minimize2 size={15} aria-hidden="true" />
              </button>

              <button
                type="button"
                aria-label={isEn ? "Close NaiAI assistant" : "Đóng trợ lý NaiAI"}
                onClick={() => {
                  setOpen(false);
                  setMinimized(false);
                  launcher.current?.focus();
                }}
                className="cursor-pointer rounded-lg p-1 hover:bg-white/15"
              >
                <X size={17} aria-hidden="true" />
              </button>
            </div>
          </header>

          {!minimized ? (
            <>
              <div className="flex items-center gap-1.5 border-b border-[#E9EBE2] bg-[#F2F4EC] px-3.5 py-1.5 text-[11px] text-[#52645A]">
                <ShieldCheck size={13} className="shrink-0 text-[#245B3D]" aria-hidden="true" />
                <span className="truncate">
                  {isEn
                    ? "Grounded in NaiFarm records with cited sources."
                    : "Dựa trên hồ sơ NaiFarm và nguồn công khai."}
                </span>
              </div>

              <div aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-3.5 py-3">
                {displayMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-[15px] px-3.5 py-2.5 text-[13px] leading-[1.6] ${
                        message.role === "user"
                          ? "rounded-br-sm bg-[#245B3D] text-white"
                          : "rounded-bl-sm border border-[#E8EAE2] bg-white text-[#26362D] shadow-xs"
                      }`}
                    >
                      {message.image ? (
                        <img
                          src={message.image}
                          alt={isEn ? "Uploaded image" : "Ảnh bạn gửi"}
                          className="mb-2 max-h-32 w-full rounded-lg object-cover"
                        />
                      ) : null}
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }: { children?: ReactNode }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                          strong: ({ children }: { children?: ReactNode }) => <strong className="font-bold">{children}</strong>,
                          ul: ({ children }: { children?: ReactNode }) => (
                            <ul className="my-1.5 list-disc space-y-0.5 pl-4">{children}</ul>
                          ),
                          ol: ({ children }: { children?: ReactNode }) => (
                            <ol className="my-1.5 list-decimal space-y-0.5 pl-4">{children}</ol>
                          ),
                          a: ({ href, children }: { href?: string; children?: ReactNode }) => (
                            <a
                              href={href}
                              target={href?.startsWith("http") ? "_blank" : undefined}
                              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                              className={`font-semibold underline underline-offset-2 ${
                                message.role === "user" ? "text-white" : "text-[#245B3D]"
                              }`}
                            >
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {message.role === "assistant" ? formatAnswer(message.text) : message.text}
                      </ReactMarkdown>
                      {message.cards?.map((card) => (
                        <a
                          key={card.href + card.title}
                          href={card.href}
                          target={card.href.startsWith("http") ? "_blank" : undefined}
                          rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="mt-2.5 block overflow-hidden rounded-xl border border-[#E8EAE2] bg-[#FCFCF8]"
                        >
                          <img
                            src={card.image}
                            alt={card.title}
                            loading="lazy"
                            className="h-24 w-full object-cover"
                          />
                          <span className="block px-2.5 py-1.5">
                            <span className="block text-[10px] font-semibold tracking-wide text-[#52645A] uppercase">
                              {card.label}
                            </span>
                            <span className="text-xs font-semibold text-[#245B3D]">
                              {card.title} →
                            </span>
                          </span>
                        </a>
                      ))}
                      {message.sources?.map((source) => (
                        <SourceLink
                          key={source.href ?? source.title}
                          source={source}
                          isEn={isEn}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                {busy ? (
                  <div className="flex items-center gap-2 text-xs text-[#52645A]">
                    <span className="animate-pulse">●</span>{" "}
                    {isEn ? "NaiAI is checking matching records…" : "NaiAI đang tìm thông tin…"}
                  </div>
                ) : null}
                <div ref={tail} />
              </div>

              {displayMessages.length < 3 ? (
                <div className="flex flex-wrap gap-1.5 px-3.5 pb-2">
                  {prompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => send(prompt)}
                      className="cursor-pointer rounded-full border border-[#D6DED2] bg-white px-2.5 py-1 text-[11px] font-medium text-[#245B3D] hover:bg-[#EFF4EA]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              ) : null}

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void send(input);
                }}
                className="border-t border-[#E9EBE2] bg-white px-3 pt-2.5 pb-2.5"
              >
                <div className="flex items-end gap-1.5 rounded-[14px] border border-[#D6DED2] bg-[#FBFCF8] p-1.5">
                  <label
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#52645A] hover:bg-[#EFF4EA]"
                    aria-label={isEn ? "Attach image" : "Đính kèm ảnh"}
                  >
                    <ImagePlus size={18} aria-hidden="true" />
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        if (file.size > 3 * 1024 * 1024) {
                          setError(
                            isEn ? "Maximum image size is 3 MB." : "Ảnh tối đa 3 MB.",
                          );
                          return;
                        }
                        if (preview) URL.revokeObjectURL(preview);
                        setPhoto(file);
                        setPreview(URL.createObjectURL(file));
                        setError("");
                      }}
                    />
                  </label>
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void send(input);
                      }
                    }}
                    rows={1}
                    placeholder={
                      isEn ? "Ask about produce, QR, seasons…" : "Hỏi về nông sản, QR, mùa vụ…"
                    }
                    className="max-h-20 min-h-9 flex-1 resize-none bg-transparent px-1 py-1.5 text-sm outline-none placeholder:text-[#5E7064]"
                  />
                  <button
                    type="submit"
                    disabled={busy || (!input.trim() && !photo)}
                    aria-label={isEn ? "Send question" : "Gửi câu hỏi"}
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-[#245B3D] text-white disabled:opacity-40"
                  >
                    <ArrowUp size={18} aria-hidden="true" />
                  </button>
                </div>
                {preview ? (
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(preview);
                      setPreview("");
                      setPhoto(null);
                    }}
                    className="mt-1.5 cursor-pointer text-xs text-[#52645A]"
                  >
                    {isEn ? "Remove selected image ×" : "Bỏ ảnh đã chọn ×"}
                  </button>
                ) : null}
                {error ? (
                  <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-[#A32D2D]">
                    <span>{error}</span>
                    <button
                      type="button"
                      onClick={() =>
                        void send(
                          failed.current?.text ?? displayMessages.at(-1)?.text ?? "",
                          true,
                        )
                      }
                      className="cursor-pointer font-bold underline"
                    >
                      {isEn ? "Retry" : "Thử lại"}
                    </button>
                  </div>
                ) : null}
              </form>
            </>
          ) : null}
        </aside>
      ) : null}
    </>
  );
}
