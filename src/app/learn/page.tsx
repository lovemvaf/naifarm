"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe2,
  MapPin,
  ShieldAlert,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import { AMBASSADOR_PHRASES } from "@/data/fixtures/youth-ambassador-academy";
import { buildLocalizedHref } from "@/lib/navigation/safe-nav";
import { cn } from "@/lib/format";
import { notifyInfo } from "@/lib/toast";
import { ProduceAnatomy2D } from "@/components/products/ProduceAnatomy2D";
import { Badge, Button, Card, DemoBanner } from "@/components/ui/Primitives";
import type { AmbassadorLevel } from "@/types/naifarm";

const LEVEL_OPTIONS: ("all" | AmbassadorLevel)[] = [
  "all",
  "A1",
  "A2",
  "B1",
  "FieldLab",
  "LocalAgri",
];

function OpenLearningHubInner() {
  const searchParams = useSearchParams();
  const { locale, t } = useLocale();
  const isEn = locale === "en";
  const { lessons, learningProgress, authUser } = useDemoStore();

  const initialLevelParam = searchParams.get("level") as AmbassadorLevel | null;
  const [levelFilter, setLevelFilter] = useState<"all" | AmbassadorLevel>(
    initialLevelParam && LEVEL_OPTIONS.includes(initialLevelParam)
      ? initialLevelParam
      : "all",
  );
  const [activeAnatomy, setActiveAnatomy] = useState<"pomelo" | "rambutan" | "cashew" | "durian">(
    "pomelo",
  );

  const filteredLessons = useMemo(() => {
    if (levelFilter === "all") return lessons;
    return lessons.filter((l) => (l.ambassadorLevel ?? "LocalAgri") === levelFilter);
  }, [lessons, levelFilter]);

  const speakPhrase = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      notifyInfo(t.learn.speechFallbackNote);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.92;
      window.speechSynthesis.speak(u);
    } catch {
      notifyInfo(t.learn.speechFallbackNote);
    }
  };

  return (
    <div className="mx-auto max-w-[1360px] space-y-8 px-4 py-8 lg:px-8">
      {/* Public Hero Header (Never hijacks workspace into W03!) */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="success">{t.learn.ambassadorBadge}</Badge>
            <Badge tone="info">VI / EN · A1 → B1 + 2D</Badge>
          </div>
          <h1 className="mt-2 font-editorial text-2xl font-semibold text-[#25352B] sm:text-3xl">
            {t.learn.academyTitle}
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm text-[#52645A]">{t.learn.academySubtitle}</p>
        </div>

        <Card className="flex items-center gap-4 px-4 py-3">
          <div>
            <p className="text-[11px] font-semibold text-[#52645A]">
              {t.learn.practicePointsLabel}
            </p>
            <p className="tabular-nums text-lg font-bold text-[#245B3D]">
              {learningProgress.practicePoints} pts · {learningProgress.completedLessonIds.length}/
              {lessons.length} {isEn ? "lessons" : "bài"}
            </p>
          </div>
          {authUser?.workspaceId === "W03" ? (
            <Link
              href={buildLocalizedHref("/volunteer", locale)}
              className="inline-flex min-h-[38px] items-center rounded-[10px] border border-[#245B3D] bg-[#EAF0E5] px-3 text-xs font-semibold text-[#245B3D]"
            >
              {isEn ? "Go to W03 Missions" : "Về Nhiệm vụ W03"}
            </Link>
          ) : null}
        </Card>
      </div>

      {authUser?.isMinor ? (
        <div className="flex items-start gap-2.5 rounded-[14px] border border-[#D7A34D] bg-[#FFF2D8] px-4 py-3 text-xs text-[#80520C]">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{t.learn.minorSafetyNotice}</p>
        </div>
      ) : null}

      <DemoBanner title={t.learn.ambassadorBadge} detail={t.learn.volunteerHoursSeparateNote} />

      {/* Quick 12+ Bilingual Seed Phrases Preview Strip */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#25352B]">
            <Globe2 className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
            <span>
              {isEn
                ? `Essential Orchard Hospitality Phrases (${AMBASSADOR_PHRASES.length})`
                : `Bộ mẫu câu Đại sứ Đón khách Song ngữ (${AMBASSADOR_PHRASES.length} thẻ)`}
            </span>
          </h2>
          <Link
            href={buildLocalizedHref(
              "/learn/dong-nai-greetings-and-agricultural-origins-a1?tab=flashcards&returnTo=/learn",
              locale,
            )}
            className="text-xs font-bold text-[#245B3D] underline"
          >
            {isEn ? "Practice all flashcards & matching →" : "Mở thẻ lật & trò chơi ghép cặp →"}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {AMBASSADOR_PHRASES.slice(0, 8).map((p) => (
            <Card key={p.id} className="flex flex-col justify-between p-3.5">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <Badge tone="neutral">{p.level}</Badge>
                  <button
                    type="button"
                    onClick={() => speakPhrase(p.enText)}
                    aria-label={`${t.learn.listenPronunciationCta}: ${p.enText}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF0E5] text-[#245B3D] hover:bg-[#D6DED2] cursor-pointer"
                  >
                    <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
                <p className="mt-2 text-sm font-bold text-[#25352B]">{p.enText}</p>
                <p className="mt-1 text-xs text-[#52645A]">{p.viText}</p>
              </div>
              <p className="mt-2 font-mono text-[11px] text-[#687A70]">{p.pronunciationHint}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Level Filter + All 20 Interactive Lessons */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-bold text-[#25352B]">
            <BookOpen className="h-5 w-5 text-[#245B3D]" aria-hidden="true" />
            <span>
              {isEn
                ? `NaiAcademy Curriculum (${filteredLessons.length})`
                : `Thư viện Chuyên đề & Đại sứ Song ngữ (${filteredLessons.length})`}
            </span>
          </h2>

          <div className="flex flex-wrap gap-1.5">
            {LEVEL_OPTIONS.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                className={cn(
                  "min-h-[36px] rounded-full px-3.5 text-xs font-semibold transition-colors cursor-pointer",
                  levelFilter === lvl
                    ? "bg-[#245B3D] text-white"
                    : "border border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#EAF0E5]",
                )}
              >
                {lvl === "all" ? t.learn.levelAll : lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLessons.map((lesson, idx) => {
            const solved = learningProgress.quizAnswers[lesson.id] === lesson.quizQuestion.correctIndex;
            const href = buildLocalizedHref(
              `/learn/${lesson.slug}?returnTo=${encodeURIComponent(buildLocalizedHref("/learn", locale))}`,
              locale,
            );
            return (
              <Card key={lesson.id} className="flex flex-col justify-between overflow-hidden">
                <div>
                  <img
                    src={lesson.image}
                    alt={isEn && lesson.titleEn ? lesson.titleEn : lesson.title}
                    className="h-40 w-full object-cover"
                  />
                  <div className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-[#245B3D]">
                        #{String(idx + 1).padStart(2, "0")} ·{" "}
                        {isEn && lesson.topicTagEn ? lesson.topicTagEn : lesson.topicTag}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {lesson.ambassadorLevel ? (
                          <Badge tone="info">{lesson.ambassadorLevel}</Badge>
                        ) : null}
                        {solved ? (
                          <CheckCircle2 className="h-4 w-4 text-[#24603B]" aria-hidden="true" />
                        ) : null}
                      </div>
                    </div>
                    <h3 className="mt-1.5 line-clamp-2 text-base font-bold text-[#25352B]">
                      {isEn && lesson.titleEn ? lesson.titleEn : lesson.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-xs text-[#52645A]">
                      {isEn && lesson.summaryEn ? lesson.summaryEn : lesson.summary}
                    </p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#52645A]">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-[#245B3D]" aria-hidden="true" />
                        {isEn && lesson.durationLabelEn ? lesson.durationLabelEn : lesson.durationLabel}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#245B3D]" aria-hidden="true" />
                        {lesson.regionName}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#D6DED2] bg-[#FAF8F1] px-4 py-3">
                  <Link
                    href={href}
                    className="inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#245B3D] px-4 text-xs font-semibold text-white hover:bg-[#19472E]"
                  >
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t.learn.startLessonCta}</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Interactive 2D Produce Anatomy Preview */}
      <section id="anatomy-2d" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#25352B]">
              {isEn
                ? "Interactive 2D Produce Anatomy"
                : "Thẻ giải phẫu Nông sản Đồng Nai 2D (Dữ liệu thực hành)"}
            </h2>
            <p className="text-sm text-[#52645A]">
              {isEn
                ? "Inspect layers, Brix metrics, soil notes, and QR workflow on mobile and desktop."
                : "Chạm từng lớp mặt cắt để xem chỉ số Brix, vùng đất và quy trình thu hái."}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={activeAnatomy === "pomelo" ? "primary" : "secondary"}
              onClick={() => setActiveAnatomy("pomelo")}
            >
              {isEn ? "Pomelo" : "Bưởi"}
            </Button>
            <Button
              size="sm"
              variant={activeAnatomy === "cashew" ? "primary" : "secondary"}
              onClick={() => setActiveAnatomy("cashew")}
            >
              {isEn ? "Cashew" : "Hạt điều"}
            </Button>
          </div>
        </div>
        <ProduceAnatomy2D key={activeAnatomy} initialProduce={activeAnatomy} allowSwitch />
      </section>
    </div>
  );
}

export default function OpenLearningPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1360px] px-4 py-12 text-sm text-[#52645A]">
          Đang tải thư viện NaiAcademy...
        </div>
      }
    >
      <OpenLearningHubInner />
    </Suspense>
  );
}
