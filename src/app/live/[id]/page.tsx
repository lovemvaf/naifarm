import React, { Suspense } from "react";
import { LiveRoomView } from "@/components/live/LiveRoomView";

export default async function LiveRoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1360px] px-4 py-12 text-sm text-[#52645A]">
          Đang tải phòng OCOP Live {id}...
        </div>
      }
    >
      <LiveRoomView routeRoomId={decodeURIComponent(id)} />
    </Suspense>
  );
}
