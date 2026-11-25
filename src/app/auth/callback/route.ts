import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ROLE_HOME: Record<string, string> = {
  customer: "/account",
  farmer: "/farmer",
  volunteer: "/volunteer",
  coordinator: "/coordinator",
  organization: "/organization",
  admin: "/admin",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : null;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const userId = data.user?.id;
      let destination = next ?? "/account";
      if (!next && userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();
        const role = (profile?.role as string | undefined) ?? "customer";
        destination = ROLE_HOME[role] ?? "/account";
      }
      return NextResponse.redirect(new URL(destination, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/login", url.origin));
}