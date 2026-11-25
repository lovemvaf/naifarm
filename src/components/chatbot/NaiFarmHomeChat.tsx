"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, ImagePlus, Leaf, MessageCircle, Minus, Plus, RotateCcw, ShieldCheck, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type SourceReference = { title: string; href?: string };
type Message = { role: "user" | "assistant"; text: string; image?: string; sources?: SourceReference[]; cards?: { title: string; image: string; href: string; label: string }[] };

const prompts = ["Tra lô NF-DEMO-001", "Đăng bán nông sản thế nào?", "Thanh niên hỗ trợ nhà vườn ra sao?"];
const formatAnswer = (text: string) => text.replace(/\*\*([\s\S]*?)\*\*/g, "$1").replace(/\\\*/g, "");
const withoutImage = (message: Message): Message => { const copy = { ...message }; delete copy.image; return copy; };

function SourceLink({ source }: { source: SourceReference }) {
  return source.href
    ? <a className="mt-2 flex items-center gap-1 font-semibold text-[#245B3D] underline underline-offset-2" href={source.href} target={source.href.startsWith("http") ? "_blank" : undefined} rel={source.href.startsWith("http") ? "noopener noreferrer" : undefined}>{source.title} →</a>
    : <span className="mt-2 block text-xs text-[#52645A]">Tài liệu tham khảo: {source.title}</span>;
}

export function NaiFarmHomeChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [zoom, setZoom] = useState(0);
  const [error, setError] = useState("");
  const [session, setSession] = useState(() => typeof window === "undefined" ? "" : sessionStorage.getItem("naiai-home-session") ?? crypto.randomUUID());
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: "Xin chào! Mình có thể giúp bạn tra mã QR nguồn gốc, tìm nông sản Đồng Nai hoặc hướng dẫn nhà vườn và thanh niên." }]);
  const tail = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const abort = useRef<AbortController | null>(null);
  const failed = useRef<{ text: string; photo: File | null } | null>(null);

  useEffect(() => {
    sessionStorage.setItem("naiai-home-session", session);
    try { const saved=sessionStorage.getItem(`naiai-home-${session}`);if(saved){const restored=JSON.parse(saved) as Message[];requestAnimationFrame(()=>setMessages(restored.map(withoutImage)));} }
    catch { sessionStorage.removeItem(`naiai-home-${session}`); }
  }, [session]);
  useEffect(() => { tail.current?.scrollIntoView({ block: "end", behavior: "smooth" }); }, [messages, busy, open]);
  useEffect(() => { if (!open) return; const listener = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); launcher.current?.focus(); } }; window.addEventListener("keydown", listener); return () => window.removeEventListener("keydown", listener); }, [open]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => () => { abort.current?.abort(); }, []);


  async function send(text: string, retry = false) {
    const question = text.trim();
    const current = retry ? failed.current?.photo ?? null : photo;
    if ((!question && !current) || busy) return;
    if (current && !["image/jpeg", "image/png", "image/webp"].includes(current.type)) { setError("Vui lòng chọn ảnh JPEG, PNG hoặc WebP."); return; }
    const next = retry ? messages : [...messages, { role: "user" as const, text: question || "Hãy giúp tôi đọc ảnh này.", ...(preview ? { image: preview } : {}) }].slice(-30);
    setMessages(next); setInput(""); setPhoto(null); setPreview(""); setError(""); setBusy(true);
    const controller = new AbortController(); abort.current = controller;
    try {
      const form = new FormData();
      form.set("question", question); form.set("sessionId", session); form.set("history", JSON.stringify(messages.slice(-6).map(({ role, text: value }) => ({ role, content: value }))));
      if (current) form.set("image", current);
      const response = await fetch("/api/nai-ai/chat", { method: "POST", body: form, signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "NaiAI chưa thể trả lời. Vui lòng thử lại.");
      const result = [...next, { role: "assistant" as const, text: data.answer as string, sources: data.sources as Message["sources"], cards: data.cards as Message["cards"] }].slice(-30);
      failed.current = null; setMessages(result); sessionStorage.setItem(`naiai-home-${session}`, JSON.stringify(result.map(withoutImage)));
    } catch (cause) {
      if (!controller.signal.aborted) { failed.current = { text: question, photo: current }; setError(cause instanceof Error ? cause.message : "Kết nối bị gián đoạn. Vui lòng thử lại."); }
    } finally { if (abort.current === controller) abort.current = null; setBusy(false); }
  }

  return <>
    {!open && <button ref={launcher} onClick={() => setOpen(true)} aria-label="Mở trợ lý NaiAI" className="fixed bottom-[calc(5.2rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#245B3D] text-white shadow-[0_8px_30px_rgba(37,53,43,.28)] transition hover:-translate-y-1 hover:bg-[#19472E] lg:bottom-6 lg:right-6"><MessageCircle size={23}/><span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#89B57C]"/></button>}
    {open && <section role="dialog" aria-modal="true" aria-label="NaiAI · Trợ lý NaiFarm" onKeyDown={(event) => { if (event.key !== "Tab") return; const targets = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), textarea:not([disabled])')]; if (event.shiftKey && document.activeElement === targets[0]) { event.preventDefault(); targets.at(-1)?.focus(); } else if (!event.shiftKey && document.activeElement === targets.at(-1)) { event.preventDefault(); targets[0]?.focus(); } }} className={`fixed inset-x-0 bottom-0 z-50 flex flex-col overflow-hidden border border-[#D6DED2] bg-[#FCFCF8] shadow-[0_-12px_60px_rgba(37,53,43,.2)] pb-[env(safe-area-inset-bottom)] transition-[height,width] duration-200 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:rounded-[24px] ${zoom===0?"h-[min(84dvh,680px)] rounded-t-[26px] sm:h-[min(620px,calc(100dvh-3rem))] sm:w-[390px]":zoom===1?"h-[min(91dvh,790px)] rounded-t-[26px] sm:h-[min(760px,calc(100dvh-3rem))] sm:w-[500px]": "h-[min(96dvh,900px)] rounded-t-[26px] sm:h-[min(880px,calc(100dvh-3rem))] sm:w-[min(680px,calc(100vw-3rem))]"}`}>
      <header className="flex items-center justify-between gap-2 bg-[#245B3D] px-4 py-3.5 text-white sm:px-5"><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15"><Leaf size={20}/></span><div className="min-w-0"><h2 className="truncate whitespace-nowrap text-sm font-bold">NaiAI <span className="font-medium text-white/75">· Trợ lý NaiFarm</span></h2><p className="mt-1 truncate text-[11px] text-white/80">Đồng hành cùng nhà vườn Đồng Nai</p></div></div><div className="flex shrink-0 items-center gap-0.5"><button aria-label="Thu nhỏ khung chat" title="Thu nhỏ khung chat" disabled={zoom===0} onClick={()=>setZoom(level=>Math.max(level-1,0))} className="rounded-lg p-1.5 hover:bg-white/15 disabled:opacity-40"><Minus size={17}/></button><button aria-label="Phóng to khung chat" title="Phóng to khung chat" disabled={zoom===2} onClick={()=>setZoom(level=>Math.min(level+1,2))} className="rounded-lg p-1.5 hover:bg-white/15 disabled:opacity-40"><Plus size={17}/></button><button aria-label="Cuộc trò chuyện mới" title="Cuộc trò chuyện mới" onClick={() => { abort.current?.abort(); failed.current=null; setInput(""); setPhoto(null); setPreview(""); const id=crypto.randomUUID(); sessionStorage.setItem("naiai-home-session",id); setSession(id); setMessages([{role:"assistant",text:"Xin chào! Mình có thể giúp bạn tra mã QR nguồn gốc, tìm nông sản Đồng Nai hoặc hướng dẫn nhà vườn và thanh niên."}]); setError(""); }} className="rounded-lg p-1.5 hover:bg-white/15"><RotateCcw size={17}/></button><button autoFocus aria-label="Đóng trợ lý NaiAI" onClick={() => { setOpen(false); launcher.current?.focus(); }} className="rounded-lg p-1.5 hover:bg-white/15"><X size={20}/></button></div></header>
      <div className="flex items-center gap-2 border-b border-[#E9EBE2] bg-[#F2F4EC] px-4 py-2 text-[11px] leading-relaxed text-[#52645A]"><ShieldCheck size={14} className="shrink-0 text-[#245B3D]"/> Câu trả lời dựa trên hồ sơ NaiFarm và nguồn được ghi rõ.</div>
      <div aria-live="polite" className="flex-1 space-y-4 overflow-y-auto px-4 py-4">{messages.map((message,index)=><div key={index} className={`flex ${message.role==="user"?"justify-end":"justify-start"}`}><div className={`max-w-[92%] rounded-[18px] px-4 py-3 text-[13px] leading-[1.75] ${message.role==="user"?"rounded-br-md bg-[#245B3D] text-white":"rounded-bl-md border border-[#E8EAE2] bg-white text-[#26362D] shadow-sm"}`}>{message.image&&<img src={message.image} alt="Ảnh bạn gửi" className="mb-2 max-h-36 w-full rounded-xl object-cover"/>}<ReactMarkdown remarkPlugins={[remarkGfm]} components={{p:({children})=><p className="mb-2 last:mb-0">{children}</p>,strong:({children})=><strong className="font-bold">{children}</strong>,ul:({children})=><ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,ol:({children})=><ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,li:({children})=><li className="pl-0.5">{children}</li>,h1:({children})=><h3 className="mb-2 mt-3 text-base font-bold first:mt-0">{children}</h3>,h2:({children})=><h3 className="mb-2 mt-3 text-sm font-bold first:mt-0">{children}</h3>,a:({href,children})=><a href={href} target={href?.startsWith("http")?"_blank":undefined} rel={href?.startsWith("http")?"noopener noreferrer":undefined} className={`font-semibold underline underline-offset-2 ${message.role==="user"?"text-white":"text-[#245B3D]"}`}>{children}</a>}}>{message.role === "assistant" ? formatAnswer(message.text) : message.text}</ReactMarkdown>{message.cards?.map(card=><a key={card.href+card.title} href={card.href} target={card.href.startsWith("http")?"_blank":undefined} rel={card.href.startsWith("http")?"noopener noreferrer":undefined} className="mt-3 block overflow-hidden rounded-xl border border-[#E8EAE2] bg-[#FCFCF8]"><img src={card.image} alt={card.title} loading="lazy" className="h-32 w-full object-cover"/><span className="block px-3 py-2"><span className="block text-[10px] font-semibold uppercase tracking-wide text-[#718075]">{card.label}</span><span className="font-semibold text-[#245B3D]">{card.title} →</span></span></a>)}{message.sources?.map(source=><SourceLink key={source.href ?? source.title} source={source}/>)}</div></div>)}{busy&&<div className="flex items-center gap-2 text-xs text-[#52645A]"><span className="animate-pulse">●</span> NaiAI đang tìm thông tin phù hợp…</div>}<div ref={tail}/></div>
      {messages.length<3&&<div className="flex flex-wrap gap-2 px-4 pb-3">{prompts.map(prompt=><button key={prompt} onClick={()=>send(prompt)} className="rounded-full border border-[#D6DED2] bg-white px-3 py-2 text-[11px] font-medium text-[#245B3D] hover:bg-[#EFF4EA]">{prompt}</button>)}</div>}
      <form onSubmit={event=>{event.preventDefault();void send(input);}} className="border-t border-[#E9EBE2] bg-white px-3.5 pb-3 pt-3"><div className="flex items-end gap-2 rounded-[18px] border border-[#D6DED2] bg-[#FBFCF8] p-2"><label className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-[#52645A] hover:bg-[#EFF4EA]" aria-label="Đính kèm ảnh"><ImagePlus size={19}/><input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={event=>{const file=event.target.files?.[0];if(!file)return;if(file.size>3*1024*1024){setError("Ảnh tối đa 3 MB.");return;}if(preview)URL.revokeObjectURL(preview);setPhoto(file);setPreview(URL.createObjectURL(file));setError("");}}/></label><textarea value={input} onChange={event=>setInput(event.target.value)} onKeyDown={event=>{if(event.key==="Enter"&&!event.shiftKey){event.preventDefault();void send(input);}}} rows={1} placeholder="Hỏi về nông sản, QR, mùa vụ…" className="max-h-24 min-h-10 flex-1 resize-none bg-transparent px-1 py-2 text-sm outline-none placeholder:text-[#89948C]"/><button type="submit" disabled={busy||(!input.trim()&&!photo)} aria-label="Gửi câu hỏi" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#245B3D] text-white disabled:opacity-40"><ArrowUp size={19}/></button></div>{preview&&<button type="button" onClick={()=>{URL.revokeObjectURL(preview);setPreview("");setPhoto(null);}} className="mt-2 text-xs text-[#52645A]">Bỏ ảnh đã chọn ×</button>}{error&&<div className="mt-2 flex items-center justify-between gap-2 text-xs text-[#A32D2D]">{error}<button type="button" onClick={()=>void send(failed.current?.text??messages.at(-1)?.text??"", true)} className="font-bold underline">Thử lại</button></div>}<p className="mt-2 text-center text-[10px] text-[#879188]">Thông tin lô và giá là dữ liệu demo NaiFarm.</p></form>
    </section>}
  </>;
}

