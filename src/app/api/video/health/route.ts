import { NextResponse } from "next/server";
import { probeWorkerHealth } from "@/lib/video-studio/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await probeWorkerHealth();
  return NextResponse.json(health, {
    headers: { "Cache-Control": "no-store" },
  });
}
