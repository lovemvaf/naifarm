"use client";

import Image from "next/image";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Box,
  CheckCircle2,
  Clock,
  RefreshCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { WorkspaceShell } from "@/components/navigation/WorkspaceShell";
import { Badge, Button, Card, DemoBanner } from "@/components/ui/Primitives";
import { CASHEW_LESSON } from "@/data/demo/community";
import { PomeloViewer3DHost } from "@/components/three/PomeloViewer3DHost";
import { assetUrl } from "@/lib/storage/assets";

export default function OpenLearningPage() {
  const { setActiveWorkspace } = useDemoStore();
  const [answers, setAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    setActiveWorkspace("W03");
  }, [setActiveWorkspace]);

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = CASHEW_LESSON.quiz.length;
  const score = CASHEW_LESSON.quiz.reduce(
    (acc, q) => (answers[q.id] === q.correctIndex ? acc + 1 : acc),
    0
  );

  return (
    <WorkspaceShell
      workspaceId="W03"
      title="Góc học mở & Khám phá Nông sản 3D"
      subtitle="Giáo dục thực hành nông nghiệp Đồng Nai cho học sinh, sinh viên và cộng đồng"
      scopeBadge="Học liệu mở · Không cần tài khoản"
      navItems={[
        {
          label: "Bài học Hạt điều Đồng Nai (15')",
          href: "#lesson",
          active: true,
          icon: <BookOpen className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: "Trắc nghiệm nhanh (3 câu)",
          href: "#quiz",
          icon: <Sparkles className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: "Mô hình 3D Bưởi Tân Triều",
          href: "#pomelo-3d",
          icon: <Box className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: "Trở về Nhiệm vụ Thanh niên",
          href: "/volunteer",
          icon: <Award className="h-4 w-4" aria-hidden="true" />,
        },
      ]}
    >
      <div className="space-y-8">
        {/* Micro-learning Lesson (S20) */}
        <section id="lesson">
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-surface-soft p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="success">Học liệu mở (S20)</Badge>
                <Badge tone="neutral">{CASHEW_LESSON.level}</Badge>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {CASHEW_LESSON.duration}
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-bold text-foreground">{CASHEW_LESSON.title}</h2>
              <p className="mt-2 text-sm text-muted">{CASHEW_LESSON.objective}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 p-6">
              {CASHEW_LESSON.sections.map((sec) => (
                <article
                  key={sec.heading}
                  className="grid grid-cols-1 items-center gap-5 rounded-[14px] border border-border bg-background p-4 md:grid-cols-[200px_minmax(0,1fr)]"
                >
                  <Image
                    src={assetUrl(sec.image)}
                    alt={sec.heading}
                    className="h-40 w-full rounded-[12px] object-cover"
                    width={512}
                    height={279}
                  />
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-foreground">{sec.heading}</h3>
                    <p className="text-sm leading-relaxed text-muted">{sec.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </Card>
        </section>

        {/* Interactive Quiz (S21) */}
        <section id="quiz">
          <Card className="p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Trắc nghiệm kiểm tra nhanh (S21)
                </h2>
                <p className="text-sm text-muted">
                  Chọn đáp án để nhận giải thích kiến thức nông nghiệp & truy xuất QR ngay lập tức.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-surface-soft px-4 py-1.5 text-sm font-bold text-primary tabular-nums">
                  Điểm: {score}/{totalQuestions}
                </span>
                {answeredCount > 0 ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setAnswers({})}
                  >
                    <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                    <span>Làm lại</span>
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="space-y-5">
              {CASHEW_LESSON.quiz.map((q, qIdx) => {
                const picked = answers[q.id];
                const isAnswered = picked !== undefined;
                return (
                  <div
                    key={q.id}
                    className="rounded-[14px] border border-border bg-background p-4 space-y-3"
                  >
                    <p className="font-bold text-foreground">
                      Câu {qIdx + 1}: {q.question}
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt, idx) => {
                        const isSelected = picked === idx;
                        const isCorrect = idx === q.correctIndex;
                        let style =
                          "border-border bg-white text-foreground hover:border-leaf";
                        if (isAnswered) {
                          if (isCorrect) {
                            style = "border-success bg-success-bg text-success font-semibold";
                          } else if (isSelected) {
                            style = "border-danger bg-danger-bg text-danger";
                          }
                        }
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: idx }))}
                            className={`flex min-h-[46px] items-center justify-between gap-2 rounded-[10px] border px-4 py-2 text-left text-sm transition cursor-pointer ${style}`}
                          >
                            <span>{opt}</span>
                            {isAnswered && isCorrect ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                            ) : isAnswered && isSelected && !isCorrect ? (
                              <XCircle className="h-4 w-4 shrink-0 text-danger" />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>

                    {isAnswered ? (
                      <p className="rounded-[10px] bg-white px-3.5 py-2 text-xs text-foreground">
                        <span className="font-bold text-primary">Giải thích: </span>
                        {q.explanation}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {answeredCount === totalQuestions ? (
              <DemoBanner
                title={`Hoàn thành bài học — Đạt ${score}/${totalQuestions} câu đúng`}
                detail="Bạn có thể khám phá thêm sản phẩm Hạt điều Xuân Lộc ngoài Chợ hoặc chuyển sang Trải nghiệm mô hình 3D Bưởi Tân Triều bên dưới."
              />
            ) : null}
          </Card>
        </section>

        {/* Interactive 3D Tan Trieu Pomelo Anatomy (S22) */}
        <section id="pomelo-3d" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Khám phá cấu tạo nông sản 3D — Bưởi Tân Triều (S22)
              </h2>
              <p className="text-sm text-muted">
                Xoay 360°, cắt đôi trực quan và chạm vào 4 điểm thông tin cấu tạo vỏ – cùi – tép –
                cuống lá.
              </p>
            </div>
            <Link
              href="/products/buoi-da-xanh-tan-trieu"
              className="text-sm font-bold text-primary underline"
            >
              Xem trang đặt mua Bưởi Tân Triều →
            </Link>
          </div>
          <PomeloViewer3DHost autoOpen={false} />
        </section>
      </div>
    </WorkspaceShell>
  );
}
