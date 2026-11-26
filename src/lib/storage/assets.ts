const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function assetUrl(key?: string | null): string {
  if (!key) return "";
  const trimmed = key.trim();
  if (!trimmed) return "";
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  if (SUPABASE_URL) {
    return `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/${trimmed}`;
  }
  return trimmed.startsWith("stitch/")
    ? `/images/${trimmed.replace(/\.webp$/i, ".jpg")}`
    : `/${trimmed}`;
}
