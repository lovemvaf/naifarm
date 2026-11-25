import React, { Suspense } from "react";
import { InteractiveLessonPlayer } from "@/components/learn/InteractiveLessonPlayer";

export default async function LearnLessonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1360px] px-4 py-12 text-sm text-[#52645A]">
          Đang tải bài học tương tác...
        </div>
      }
    >
      <InteractiveLessonPlayer lessonSlug={decodeURIComponent(slug)} />
    </Suspense>
  );
}
