const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function assetUrl(key?: string | null): string {
  if (!key) return "";
  if (
    key.startsWith("http") ||
    key.startsWith("data:") ||
    key.startsWith("blob:") ||
    key.startsWith("/")
  ) {
    return key;
  }
  if (SUPABASE_URL) {
    return `${SUPABASE_URL}/storage/v1/object/public/${key}`;
  }
  return key.startsWith("stitch/") ? `/images/${key}` : `/${key}`;
}
