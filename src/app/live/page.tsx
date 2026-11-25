import React, { Suspense } from "react";
import { LiveRoomView } from "@/components/live/LiveRoomView";

export default function LiveHubPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1360px] px-4 py-12 text-sm text-[#52645A]">
          Đang mở Phòng OCOP Live...
        </div>
      }
    >
      <LiveRoomView />
    </Suspense>
  );
}
