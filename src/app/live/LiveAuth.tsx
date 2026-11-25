"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Primitives";
import { liveClients } from "@/lib/live/client";

export function LiveAuth({ token }: { token: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (token) return <Button variant="secondary" onClick={() => void liveClients().then(({ auth }) => auth.auth.signOut())}>Đăng xuất</Button>;
  if (!open) return <Button variant="secondary" onClick={() => setOpen(true)}>Đăng nhập pilot</Button>;
  return <form className="flex flex-wrap items-end gap-3" onSubmit={async (event) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const { auth } = await liveClients();
      const result = await auth.auth.signInWithPassword({ email: String(values.get("email")), password: String(values.get("password")) });
      if (result.error) throw new Error("Không đăng nhập được. Kiểm tra email và mật khẩu pilot.");
      setOpen(false);
    } catch (error) { setError(error instanceof Error ? error.message : "Không đăng nhập được."); }
    finally { setBusy(false); }
  }}>
    <label className="grid gap-1 text-sm">Email<input required name="email" type="email" autoComplete="username" className="rounded-lg border p-2" /></label>
    <label className="grid gap-1 text-sm">Mật khẩu<input required name="password" type="password" autoComplete="current-password" className="rounded-lg border p-2" /></label>
    <Button disabled={busy} type="submit">Đăng nhập</Button>
    {error && <p role="alert" className="w-full text-sm text-red-800">{error}</p>}
  </form>;
}
