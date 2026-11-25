"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  RefreshCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell";
import { ProduceAnatomy2D } from "@/components/products/ProduceAnatomy2D";
import { Badge, Button, Card, DemoBanner } from "@/components/ui/Primitives";
import { cn } from "@/lib/format";

function OpenLearningInner() {
  const searchParams = useSearchParams();
  const lessonSlugParam = searchParams.get("lesson");
  const { lessons, setActiveWorkspace } = useDemoStore();

  const initialLesson =
    lessons.find((l) => l.slug === lessonSlugParam) ?? lessons[0];
  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    initialLesson?.id ?? "",
  );
  const [answers, setAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    setActiveWorkspace("W03");
  }, [setActiveWorkspace]);

  const activeLesson =
    lessons.find((l) => l.id === selectedLessonId) ?? lessons[0];

  const pickedOption = answers[activeLesson.id];
  const isAnswered = pickedOption !== undefined;
  const correctCount = lessons.filter(
    (l) => answers[l.id] === l.quizQuestion.correctIndex,
  ).length;

  return (
    <WorkspaceShell
      workspaceId="W03"
      title="Góc học mở & Thẻ giải phẫu Nông sản 2D"
      subtitle="12 bài học thực hành nông nghiệp Đồng Nai cho học sinh, sinh viên và cộng đồng"
      scopeBadge="Học liệu mở · Không cần tài khoản · Chuẩn 2D nhẹ"
      navItems={[
        {
          label: `12 Bài học Đồng Nai`,
          href: "#lesson",
          active: true,
          icon: <BookOpen className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: "Thẻ giải phẫu 2D",
          href: "#anatomy-2d",
          icon: <Layers className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: `Kiểm tra nhanh (${correctCount}/${lessons.length})`,
          href: "#quiz",
          icon: <Sparkles className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: "Về Nhiệm vụ Thanh niên",
          href: "/volunteer",
          icon: <Award className="h-4 w-4" aria-hidden="true" />,
        },
      ]}
    >
      <div className="space-y-8">
        {/* 12-Lesson Picker */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-[#25352B]">
              Thư viện 12 chuyên đề Nông nghiệp Đồng Nai (NaiAcademy)
            </h2>
            <span className="text-xs font-semibold text-[#245B3D]">
              Đã trả lời đúng {correctCount}/{lessons.length} bài
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson, idx) => {
              const active = lesson.id === activeLesson.id;
              const solved = answers[lesson.id] === lesson.quizQuestion.correctIndex;
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => setSelectedLessonId(lesson.id)}
                  className={cn(
                    "flex items-start justify-between gap-2 rounded-[14px] border p-3.5 text-left transition cursor-pointer",
                    active
                      ? "border-[#245B3D] bg-[#EAF0E5] shadow-[0_2px_8px_rgba(36,91,61,0.1)]"
                      : "border-[#D6DED2] bg-white hover:bg-[#FAF8F1]",
                  )}
                >
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-[#245B3D]">
                      Bài {String(idx + 1).padStart(2, "0")} · {lesson.topicTag}
                    </span>
                    <p className="mt-0.5 line-clamp-2 text-xs font-bold text-[#25352B]">
                      {lesson.title}
                    </p>
                    <p className="mt-1 text-[11px] text-[#52645A]">
                      {lesson.durationLabel} · {lesson.regionName}
                    </p>
                  </div>
                  {solved ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#24603B]" aria-hidden="true" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>

        {/* Active Micro-learning Lesson */}
        <section id="lesson">
          <Card className="overflow-hidden">
            <div className="border-b border-[#D6DED2] bg-[#EAF0E5] p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="success">{activeLesson.topicTag}</Badge>
                <Badge tone="neutral">{activeLesson.levelLabel}</Badge>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#245B3D]">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {activeLesson.durationLabel}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-[#52645A]">
                  <MapPin className="h-3.5 w-3.5 text-[#245B3D]" aria-hidden="true" />
                  {activeLesson.regionName} ({activeLesson.regionCode})
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-bold text-[#25352B]">{activeLesson.title}</h2>
              <p className="mt-2 text-sm text-[#52645A]">{activeLesson.summary}</p>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6">
              {activeLesson.sections.map((sec) => (
                <article
                  key={sec.heading}
                  className="grid grid-cols-1 items-center gap-5 rounded-[14px] border border-[#D6DED2] bg-[#F5F3E9] p-4 md:grid-cols-[200px_minmax(0,1fr)]"
                >
                  <img
                    src={sec.image}
                    alt={sec.heading}
                    className="h-40 w-full rounded-[12px] object-cover"
                  />
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-[#25352B]">{sec.heading}</h3>
                    <p className="text-sm leading-relaxed text-[#52645A]">{sec.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </Card>
        </section>

        {/* Interactive Quiz */}
        <section id="quiz">
          <Card className="space-y-5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D6DED2] pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#25352B]">
                  Câu hỏi ôn tập · {activeLesson.title}
                </h2>
                <p className="text-sm text-[#52645A]">
                  Chọn đáp án để xem giải thích thực tế gắn với canh tác và truy xuất QR.
                </p>
              </div>
              {Object.keys(answers).length > 0 ? (
                <Button variant="secondary" size="sm" onClick={() => setAnswers({})}>
                  <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                  <span>Đặt lại đáp án</span>
                </Button>
              ) : null}
            </div>

            <div className="space-y-3 rounded-[14px] border border-[#D6DED2] bg-[#F5F3E9] p-4">
              <p className="font-bold text-[#25352B]">{activeLesson.quizQuestion.prompt}</p>
              <div className="grid grid-cols-1 gap-2">
                {activeLesson.quizQuestion.options.map((opt, idx) => {
                  const isSelected = pickedOption === idx;
                  const isCorrect = idx === activeLesson.quizQuestion.correctIndex;
                  let style = "border-[#D6DED2] bg-white text-[#25352B] hover:border-[#6C9C5B]";
                  if (isAnswered) {
                    if (isCorrect) {
                      style = "border-[#24603B] bg-[#E6F3E9] text-[#24603B] font-semibold";
                    } else if (isSelected) {
                      style = "border-[#A32D2D] bg-[#FDECEC] text-[#A32D2D]";
                    }
                  }
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [activeLesson.id]: idx }))
                      }
                      className={`flex min-h-[46px] items-center justify-between gap-2 rounded-[10px] border px-4 py-2 text-left text-sm transition cursor-pointer ${style}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#24603B]" aria-hidden="true" />
                      ) : isAnswered && isSelected && !isCorrect ? (
                        <XCircle className="h-4 w-4 shrink-0 text-[#A32D2D]" aria-hidden="true" />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {isAnswered ? (
                <p className="rounded-[10px] bg-white px-3.5 py-2 text-xs text-[#25352B]">
                  <strong className="text-[#245B3D]">Giải thích: </strong>
                  {activeLesson.quizQuestion.explanation}
                </p>
              ) : null}
            </div>

            {isAnswered && pickedOption === activeLesson.quizQuestion.correctIndex ? (
              <DemoBanner
                title="Hoàn thành chính xác bài học mở (Demo)"
                detail="Bạn có thể khám phá thêm cấu tạo nông sản 2D bên dưới hoặc xem mặt hàng thực tế ngoài Chợ OCOP."
              />
            ) : null}
          </Card>
        </section>

        {/* Interactive 2D Produce Anatomy */}
        <section id="anatomy-2d" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#25352B]">
                Khám phá cấu tạo nông sản Đồng Nai 2D (Dữ liệu thực hành)
              </h2>
              <p className="text-sm text-[#52645A]">
                Chạm trực tiếp vào từng lớp mặt cắt để xem chỉ số Brix, vùng đất và quy trình thu
                hái — hiển thị nhanh, rõ nét trên mọi thiết bị di động.
              </p>
            </div>
            <Link
              href="/products/buoi-da-xanh-tan-trieu"
              className="text-sm font-bold text-[#245B3D] underline"
            >
              Xem trang đặt mua Bưởi Tân Triều →
            </Link>
          </div>
          <ProduceAnatomy2D
            key={activeLesson.anatomyTarget}
            initialProduce={activeLesson.anatomyTarget}
            allowSwitch
          />
        </section>
      </div>
    </WorkspaceShell>
  );
}

export default function OpenLearningPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1280px] px-4 py-12 text-sm text-[#52645A]">
          Đang tải thư viện bài học NaiAcademy...
        </div>
      }
    >
      <OpenLearningInner />
    </Suspense>
  );
}
