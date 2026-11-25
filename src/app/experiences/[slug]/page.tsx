import React, { Suspense } from "react";
import { ExperienceBookingCheckout } from "@/components/experiences/ExperienceBookingCheckout";

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1360px] px-4 py-12 text-sm text-[#52645A]">
          Đang mở gói trải nghiệm vườn...
        </div>
      }
    >
      <ExperienceBookingCheckout tourSlug={decodeURIComponent(slug)} />
    </Suspense>
  );
}
