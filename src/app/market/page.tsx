import { redirect } from "next/navigation";

export default async function MarketRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (Array.isArray(v)) {
      for (const item of v) qs.append(k, item);
    } else if (typeof v === "string") {
      qs.set(k, v);
    }
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  redirect(`/marketplace${suffix}`);
}
