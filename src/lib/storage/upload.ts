import { createClient } from "@/lib/supabase/client";

async function toWebp(file: File, maxWidth = 1600, quality = 0.8): Promise<Blob> {
  if (typeof createImageBitmap !== "function") return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? file), "image/webp", quality);
  });
}

export async function uploadImage(
  bucket: "product-images" | "evidence",
  file: File
): Promise<string> {
  const supabase = createClient();
  const blob = await toWebp(file);
  const contentType = blob.type || "image/webp";
  const extension = contentType.split("/")[1]?.replace("jpeg", "jpg") ?? "webp";
  const name = `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(name, blob, { contentType, upsert: true });
  if (error) throw error;
  return `${bucket}/${name}`;
}
