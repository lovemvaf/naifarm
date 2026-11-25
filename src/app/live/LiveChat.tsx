"use client";

import { useRef, useState } from "react";
import { Button, Card } from "@/components/ui/Primitives";
import { liveFetch, useLiveData, type LiveMessage } from "@/lib/live/client";

const messageTime = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });

export function LiveChat({ id, token, writable, moderate = false }: { id: string; token: string; writable: boolean; moderate?: boolean }) {
  const path = `/${id}/messages`;
  const [limit, setLimit] = useState(30);
  const { data, error, realtimeError, refresh } = useLiveData<{ messages: LiveMessage[]; more: boolean }>(`${path}?limit=${limit}`, id);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const requestId = useRef<string | null>(null);

  async function change(method: "POST" | "DELETE", payload: object) {
    setBusy(true);
    setActionError("");
    try {
      await liveFetch(path, { method, body: JSON.stringify(payload) }, token);
      refresh();
      return true;
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Không thể cập nhật chat.");
      return false;
    } finally { setBusy(false); }
  }

  return <Card className="space-y-3 p-4">
    <h2 className="font-bold">Trò chuyện</h2>
    {(error || realtimeError || actionError) && <p role="status" className="text-sm text-amber-900">{actionError || error || realtimeError}</p>}
    {data?.more && <Button size="sm" variant="secondary" onClick={() => setLimit((count) => count + 30)}>Xem tin nhắn trước</Button>}
    <ul className="max-h-72 space-y-2 overflow-auto" aria-live="polite">
      {(data?.messages ?? []).map((item) => <li key={item.id} className="break-words text-sm">
        <div className="flex flex-wrap items-baseline gap-x-2"><b>{item.sender_name}</b>
          {item.is_host && <span className="text-xs font-medium">Chủ phiên</span>}
          <time dateTime={item.created_at} className="text-xs">{messageTime.format(new Date(item.created_at))}</time>
        </div>
        <span>{item.body}</span>
        {moderate && <button type="button" disabled={busy} className="ml-2 underline" onClick={() => void change("DELETE", { messageId: item.id })}>Ẩn tin nhắn</button>}
      </li>)}
    </ul>
    {data && data.messages.length === 0 && <p className="text-sm">Chưa có tin nhắn.</p>}
    {writable && token && <form className="flex gap-2" onSubmit={async (event) => {
      event.preventDefault();
      if (!message.trim() || busy) return;
      requestId.current ??= crypto.randomUUID();
      if (await change("POST", { body: message, clientMessageId: requestId.current })) {
        setMessage("");
        requestId.current = null;
      }
    }}>
      <input aria-label="Tin nhắn" placeholder="Nhắn với nhà vườn" maxLength={500} className="min-w-0 flex-1 rounded-lg border p-2" value={message} onChange={(event) => { requestId.current = null; setMessage(event.target.value); }} />
      <Button type="submit" disabled={busy || !message.trim()}>Gửi</Button>
    </form>}
    {writable && !token && <p className="text-sm">Đăng nhập pilot để gửi tin nhắn.</p>}
  </Card>;
}
