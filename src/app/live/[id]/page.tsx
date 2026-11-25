import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { LiveRoomView } from "@/components/live/LiveRoomView";
import { LiveViewer } from "../LiveViewer";

export default async function LiveRoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id === "demo") notFound();
  const isLiveSessionId = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id);

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1360px] px-4 py-12 text-sm text-[#52645A]">
          Đang tải phòng OCOP Live {id}...
        </div>
      }
    >
      {isLiveSessionId ? <LiveViewer sessionId={id} /> : <LiveRoomView routeRoomId={id} />}
    </Suspense>
  );
}
