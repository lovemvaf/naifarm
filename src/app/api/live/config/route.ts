import { jsonError, liveJson, publicLiveSupabaseConfig } from "@/lib/live/server";

export function GET() {
  try {
    return liveJson(publicLiveSupabaseConfig());
  } catch (error) { return jsonError(error); }
}
