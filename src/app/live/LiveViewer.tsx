"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LiveKitStage } from "./LiveKitStage";
import { LiveChat } from "./LiveChat";
import { useDemoStore } from "@/context/DemoStoreContext";
import { INITIAL_FARMS } from "@/data/demo/farms";
import { Button, Card } from "@/components/ui/Primitives";
import { formatVnd } from "@/lib/format";
import { useLiveAuth, useLiveData, type LiveSession } from "@/lib/live/client";

const canWatch = (session: LiveSession) => ["live", "reconnecting"].includes(session.status);
const scheduledDate = (value: string) => new Date(value).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

export function LiveViewer({ sessionId }: { sessionId?: string }) {
  const router = useRouter();
  const { token } = useLiveAuth();
  const directory = useLiveData<{ sessions: LiveSession[] }>(sessionId ? null : "");
  const selected = useLiveData<{ session: LiveSession }>(sessionId ? `/${sessionId}` : null, sessionId);
  const sessions = directory.data?.sessions ?? [];
  const session = sessionId ? selected.data?.session : sessions.find(canWatch);
  const error = selected.error || directory.error || selected.realtimeError || directory.realtimeError;
  const { products, addToCart } = useDemoStore();
  const product = products.find((item) => item.id === session?.pinned_product_id);
  const selectedLiveProducts = products.filter((item) => session?.product_ids.includes(item.id));
  const mockLiveProducts = selectedLiveProducts.length >= 3 ? selectedLiveProducts : products.slice(0, 8);
  const available = !!product && product.seasonStatus === "in_season" && product.stockKg > 0;
  const farm = INITIAL_FARMS.find((item) => item.id === session?.farm_id);

  function orderProduct(productId: string, checkout: boolean) {
    const result = addToCart(productId, 1);
    if (!result.ok) toast.error(result.message);
    else if (checkout) router.push("/checkout");
    else toast.success(result.message);
  }

  return <section className="mx-auto max-w-screen-2xl space-y-6 px-4 py-8 lg:px-8">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-editorial text-3xl font-semibold">{sessionId && session ? session.title : "NaiFarm Live"}</h1>
        <p className="text-sm">{farm?.name ?? "Phát trực tiếp từ nhà vườn Đồng Nai"}</p>
        {session?.host_name && <p className="text-sm">Chủ phiên · {session.host_name}</p>}
      </div>
      <nav className="flex flex-wrap items-center gap-4 text-sm">
        {sessionId && <Link href="/live" className="underline">Danh sách phiên</Link>}
        <Link href="/live/studio" className="underline">Studio phát sóng</Link>
      </nav>
    </header>
    {error && <div role="alert" className="space-y-2 rounded-lg bg-amber-50 p-4 text-amber-900"><p>{error}</p>
      <Button size="sm" onClick={sessionId ? selected.refresh : directory.refresh}>Tải lại</Button></div>}
    <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,0.85fr)]">
      <Card className="space-y-4 p-4">
        {session && canWatch(session) && session.room_ready
          ? <LiveKitStage key={session.id} sessionId={session.id} role="viewer" selectedCameraIdentity={session.selected_camera_identity}
            mockEngagement mockProducts={mockLiveProducts} />
          : <div className="flex aspect-video items-center justify-center rounded-xl bg-[#25352B] p-4 text-center text-white">
            {session?.status === "scheduled" ? session.scheduled_at ? `Lên lịch ${scheduledDate(session.scheduled_at)}` : "Phiên đang chờ nhà vườn lên sóng"
              : session?.status === "ended" ? "Phiên đã kết thúc" : session?.status === "cancelled" ? "Phiên đã hủy"
              : selected.data || directory.data ? "Chưa có phiên đang phát" : error ? "Chưa tải được phòng phát" : "Đang tải…"}
          </div>}
        {session && <>
          {!sessionId && <Link className="text-lg font-bold underline" href={`/live/${session.id}`}>{session.title}</Link>}
          {session.description && <p className="text-sm">{session.description}</p>}
        </>}
        {product && <div className="space-y-2 rounded-lg bg-[#EAF0E5] p-3">
          <p className="font-semibold">
            <Link href={`/products/${product.slug}`} className="underline">{product.name}</Link> · {formatVnd(product.priceVnd)}/{product.unitLabel}
          </p>
          <p className="text-xs">{available ? `Kho demo còn ${product.stockKg} ${product.unitLabel}` : "Tạm hết hàng demo"}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href={`/trace/${product.batchCode}`} className="text-sm underline">Truy xuất QR</Link>
            <Button size="sm" disabled={!available} onClick={() => orderProduct(product.id, false)}>Thêm vào giỏ demo</Button>
            <Button size="sm" variant="secondary" disabled={!available} onClick={() => orderProduct(product.id, true)}>Đặt nhanh (COD Demo)</Button>
          </div>
        </div>}
      </Card>
      {session && <LiveChat key={session.id} id={session.id} token={token} writable={canWatch(session)} />}
    </div>
    {!sessionId && directory.data && <section className="space-y-3">
      <h2 className="text-xl font-bold">Lịch phát sóng</h2>
      {sessions.filter((item) => !canWatch(item)).map((item) => {
        const scheduledFarm = INITIAL_FARMS.find((entry) => entry.id === item.farm_id);
        return <Card key={item.id} className="flex flex-wrap items-center gap-4 p-4">
          {scheduledFarm && <figure className="w-28 shrink-0">
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image src={scheduledFarm.bannerImage} alt="" fill sizes="112px" className="object-cover" />
            </div>
            {scheduledFarm.isDemo && <figcaption className="text-xs">Ảnh minh họa</figcaption>}
          </figure>}
          <div className="min-w-0 flex-1">
            <Link href={`/live/${item.id}`} className="break-words font-semibold underline">{item.title}</Link>
            {scheduledFarm && <p className="text-sm">{scheduledFarm.name}</p>}
            {item.host_name && <p className="text-sm">Chủ phiên · {item.host_name}</p>}
            <p className="text-sm">{item.status === "starting" ? "Đang mở phòng"
              : item.scheduled_at ? scheduledDate(item.scheduled_at) : "Phát khi nhà vườn sẵn sàng"}</p>
          </div>
        </Card>;
      })}
      {!sessions.some((item) => !canWatch(item)) && <p className="text-sm">Chưa có lịch phát.</p>}
    </section>}
  </section>;
}
