"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  Lock,
  MapPin,
  MessageSquare,
  Puzzle,
  RefreshCcw,
  RotateCw,
  ShieldAlert,
  Sparkles,
  Unlock,
  Volume2,
  XCircle,
} from "lucide-react";
import { useDemoStore } from "@/context/DemoStoreContext";
import { useLocale } from "@/context/LocaleContext";
import {
  ACADEMY_QUESTION_BANK,
  AMBASSADOR_PHRASES,
  ROLEPLAY_SCENARIOS,
} from "@/data/fixtures/youth-ambassador-academy";
import {
  buildLocalizedHref,
  loadRoomSessionState,
  sanitizeReturnTo,
  saveRoomSessionState,
} from "@/lib/navigation/safe-nav";
import { cn } from "@/lib/format";
import { notifyInfo, notifySuccess } from "@/lib/toast";
import { ProduceAnatomy2D } from "@/components/products/ProduceAnatomy2D";
import { MediaPlayer } from "@/components/media/MediaPlayer";
import { resolveCategoryMedia } from "@/data/reference/media-library";
import { CertificatePreviewModal } from "@/components/credentials/CertificatePreviewModal";
import {
  resolveAchievementCredential,
  type AchievementCredential,
} from "@/lib/credentials/achievement-registry";
import { Badge, Button, Card, DemoBanner } from "@/components/ui/Primitives";

type LessonTab = "content" | "flashcards" | "matching" | "quiz" | "roleplay" | "anatomy";
const VALID_LESSON_TABS: LessonTab[] = [
  "content",
  "flashcards",
  "matching",
  "quiz",
  "roleplay",
  "anatomy",
];

export function InteractiveLessonPlayer({ lessonSlug }: { lessonSlug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale, t } = useLocale();
  const isEn = locale === "en";

  const {
    hydrated,
    authUser,
    lessons,
    learningProgress,
    recordLearningQuizAnswer,
    toggleMasteredPhrase,
    recordMatchedPair,
    recordRoleplayChoice,
  } = useDemoStore();

  const lesson = useMemo(
    () => lessons.find((l) => l.slug === lessonSlug) ?? lessons[0],
    [lessons, lessonSlug],
  );

  const safeReturnTo = sanitizeReturnTo(searchParams.get("returnTo"), "/learn");
  const urlTab = searchParams.get("tab") as LessonTab | null;

  const [localTab, setLocalTab] = useState<LessonTab | null>(null);
  const [flippedCardIds, setFlippedCardIds] = useState<Record<string, boolean>>({});
  const [selectedEnId, setSelectedEnId] = useState<string | null>(null);
  const [selectedViId, setSelectedViId] = useState<string | null>(null);
  const [matchMismatch, setMatchMismatch] = useState(false);
  const [bankAnswers, setBankAnswers] = useState<Record<string, number>>({});
  const [freeBrowse, setFreeBrowse] = useState(false);
  const [unlockedStepIdx, setUnlockedStepIdx] = useState<number>(() =>
    urlTab && VALID_LESSON_TABS.includes(urlTab) ? Math.max(0, VALID_LESSON_TABS.indexOf(urlTab)) : 0,
  );
  const [previewCert, setPreviewCert] = useState<AchievementCredential | null>(null);

  const cachedTab =
    typeof window !== "undefined"
      ? loadRoomSessionState(`learn:${lesson?.slug ?? lessonSlug}`)?.tab
      : undefined;
  const activeTab: LessonTab =
    urlTab && VALID_LESSON_TABS.includes(urlTab)
      ? urlTab
      : localTab ??
        (cachedTab && VALID_LESSON_TABS.includes(cachedTab as LessonTab)
          ? (cachedTab as LessonTab)
          : "content");

  const currentStepIdx = Math.max(0, VALID_LESSON_TABS.indexOf(activeTab));

  const handleTabChange = (nextTab: LessonTab) => {
    const nextIdx = VALID_LESSON_TABS.indexOf(nextTab);
    if (!freeBrowse && nextIdx > unlockedStepIdx) {
      notifyInfo(
        isEn
          ? `Complete Step ${unlockedStepIdx + 1} first, or enable Free Browse above.`
          : `Hãy hoàn thành Bước ${unlockedStepIdx + 1} hoặc bật Chế độ tự do bên trên.`,
      );
      return;
    }
    setLocalTab(nextTab);
    saveRoomSessionState(`learn:${lesson?.slug ?? lessonSlug}`, { tab: nextTab });
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", nextTab);
    if (locale === "en") params.set("lang", "en");
    else params.delete("lang");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleAdvanceStep = () => {
    const nextIdx = Math.min(VALID_LESSON_TABS.length - 1, currentStepIdx + 1);
    const nextTab = VALID_LESSON_TABS[nextIdx];
    setUnlockedStepIdx((prev) => Math.max(prev, nextIdx));
    setLocalTab(nextTab);
    saveRoomSessionState(`learn:${lesson?.slug ?? lessonSlug}`, { tab: nextTab });
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", nextTab);
    if (locale === "en") params.set("lang", "en");
    else params.delete("lang");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const openLessonCertificate = () => {
    const cert = resolveAchievementCredential("NF-CERT-2026-002", {
      recipientName: authUser?.name ?? (isEn ? "NaiAcademy Learner" : "Học viên NaiAcademy"),
      programVi: `Hoàn thành 6 bước: ${lesson?.title ?? ""}`,
      programEn: `Completed 6-Step Course: ${lesson?.titleEn ?? lesson?.title ?? ""}`,
      scoreText: `${learningProgress.practicePoints} pts · 6/6 steps`,
    });
    if (cert) setPreviewCert(cert);
  };

  const lessonPhrases = useMemo(() => {
    if (!lesson) return AMBASSADOR_PHRASES.slice(0, 6);
    const exact = AMBASSADOR_PHRASES.filter((p) => p.lessonId === lesson.id);
    if (exact.length >= 4) return exact;
    const byLevel = AMBASSADOR_PHRASES.filter(
      (p) => p.level === (lesson.ambassadorLevel ?? "A1"),
    );
    const merged = [...exact];
    for (const p of [...byLevel, ...AMBASSADOR_PHRASES]) {
      if (!merged.some((m) => m.id === p.id) && merged.length < 6) {
        merged.push(p);
      }
    }
    return merged;
  }, [lesson]);

  const matchingPairs = useMemo(() => lessonPhrases.slice(0, 5), [lessonPhrases]);
  const shuffledViPairs = useMemo(() => {
    return [...matchingPairs].sort((a, b) => a.viText.localeCompare(b.viText));
  }, [matchingPairs]);

  const lessonBankQuestions = useMemo(() => {
    if (!lesson) return [];
    const matching = ACADEMY_QUESTION_BANK.filter((q) => q.lessonId === lesson.id);
    if (matching.length > 0) return matching.slice(0, 6);
    return ACADEMY_QUESTION_BANK.slice(0, 4);
  }, [lesson]);

  const lessonRoleplays = useMemo(() => {
    if (!lesson) return [];
    const matching = ROLEPLAY_SCENARIOS.filter((rp) => rp.lessonId === lesson.id);
    if (matching.length > 0) return matching;
    return ROLEPLAY_SCENARIOS.slice(0, 2);
  }, [lesson]);

  const speakPhrase = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      notifyInfo(t.learn.speechFallbackNote);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      utter.rate = 0.92;
      window.speechSynthesis.speak(utter);
    } catch {
      notifyInfo(t.learn.speechFallbackNote);
    }
  };

  const tryMatchPair = (nextEn: string | null, nextVi: string | null) => {
    if (!nextEn || !nextVi) return;
    if (nextEn === nextVi) {
      recordMatchedPair(nextEn);
      setMatchMismatch(false);
      setSelectedEnId(null);
      setSelectedViId(null);
      notifySuccess(isEn ? "Matched correctly! (+5 practice pts)" : "Ghép cặp chính xác! (+5 điểm luyện tập)");
    } else {
      setMatchMismatch(true);
      setTimeout(() => {
        setSelectedEnId(null);
        setSelectedViId(null);
        setMatchMismatch(false);
      }, 650);
    }
  };

  if (!hydrated || !lesson) {
    return (
      <div className="mx-auto max-w-[1360px] px-4 py-12 text-sm text-[#52645A]">
        {isEn ? "Loading interactive lesson..." : "Đang mở bài học tương tác..."}
      </div>
    );
  }

  const corePicked = learningProgress.quizAnswers[lesson.id];
  const coreAnswered = corePicked !== undefined;
  const lessonTitle = isEn && lesson.titleEn ? lesson.titleEn : lesson.title;
  const lessonTopic = isEn && lesson.topicTagEn ? lesson.topicTagEn : lesson.topicTag;
  const lessonLevel = isEn && lesson.levelLabelEn ? lesson.levelLabelEn : lesson.levelLabel;
  const lessonSummary = isEn && lesson.summaryEn ? lesson.summaryEn : lesson.summary;

  return (
    <div className="mx-auto max-w-[1360px] space-y-6 px-4 py-6 lg:px-8">
      {/* Breadcrumb & Safe Return */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#52645A]">
          <Link href={buildLocalizedHref("/", locale)} className="hover:text-[#245B3D]">
            {isEn ? "Home" : "Trang chủ"}
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={buildLocalizedHref("/learn", locale)} className="hover:text-[#245B3D]">
            {t.nav.learn}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-[#25352B]">{lesson.id}</span>
        </div>

        <Link
          href={buildLocalizedHref(safeReturnTo, locale)}
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[10px] border border-[#D6DED2] bg-white px-3 text-xs font-semibold text-[#25352B] hover:bg-[#EAF0E5]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{t.nav.backButton}</span>
        </Link>
      </nav>

      {/* Minor Safeguarding Banner */}
      {authUser?.isMinor ? (
        <div className="flex items-start gap-2.5 rounded-[14px] border border-[#D7A34D] bg-[#FFF2D8] px-4 py-3 text-xs text-[#80520C]">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{t.learn.minorSafetyNotice}</p>
        </div>
      ) : null}

      {/* Lesson Hero */}
      <Card className="overflow-hidden">
        <div className="border-b border-[#D6DED2] bg-[#EAF0E5] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="success">{lessonTopic}</Badge>
              <Badge tone="neutral">{lessonLevel}</Badge>
              {lesson.ambassadorLevel ? <Badge tone="gold">{lesson.ambassadorLevel}</Badge> : null}
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#245B3D]">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {isEn && lesson.durationLabelEn ? lesson.durationLabelEn : lesson.durationLabel}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-[#52645A]">
                <MapPin className="h-3.5 w-3.5 text-[#245B3D]" aria-hidden="true" />
                {lesson.regionName} ({lesson.regionCode})
              </span>
            </div>

            <div className="rounded-[12px] border border-[#D6DED2] bg-white px-3 py-1.5 text-xs">
              <span className="text-[#52645A]">{t.learn.practicePointsLabel}: </span>
              <strong className="tabular-nums text-[#245B3D]">
                {learningProgress.practicePoints} pts
              </strong>
            </div>
          </div>

          <h1 className="mt-3 font-editorial text-2xl font-bold text-[#25352B] sm:text-3xl">
            {lessonTitle}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-[#52645A]">{lessonSummary}</p>
        </div>

        {/* Sequential 6-Step Progress Bar & Free-Browse Teacher Toggle */}
        <div className="border-b border-[#D6DED2] bg-[#FAF8F1] px-6 py-3 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#245B3D]">
              <span>
                {isEn
                  ? `Sequential Lesson · Step ${currentStepIdx + 1} / 6`
                  : `Lộ trình tuần tự · Bước ${currentStepIdx + 1} / 6`}
              </span>
              <span className="rounded-full bg-[#EAF0E5] px-2 py-0.5 text-[11px] font-semibold">
                {Math.round(((currentStepIdx + 1) / 6) * 100)}%
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFreeBrowse((v) => !v)}
              aria-pressed={freeBrowse}
              className={cn(
                "inline-flex min-h-[32px] items-center gap-1.5 rounded-full border px-3 text-[11px] font-semibold transition cursor-pointer",
                freeBrowse
                  ? "border-[#245B3D] bg-[#EAF0E5] text-[#245B3D]"
                  : "border-[#D6DED2] bg-white text-[#52645A]",
              )}
            >
              {freeBrowse ? (
                <Unlock className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{freeBrowse ? (isEn ? "Free browse: ON" : "Chế độ tự do: BẬT") : isEn ? "Free browse" : "Mở xem tự do"}</span>
            </button>
          </div>

          <div
            role="tablist"
            aria-label={isEn ? "6-step learning sequence" : "Lộ trình học 6 bước"}
            className="flex flex-wrap gap-2"
          >
            {(
              [
                { id: "content", label: `1. ${t.learn.tabContent}`, icon: BookOpen },
                { id: "flashcards", label: `2. ${t.learn.tabFlashcards}`, icon: RotateCw },
                { id: "matching", label: `3. ${t.learn.tabMatching}`, icon: Puzzle },
                { id: "quiz", label: `4. ${t.learn.tabQuiz}`, icon: Sparkles },
                { id: "roleplay", label: `5. ${t.learn.tabRoleplay}`, icon: MessageSquare },
                { id: "anatomy", label: `6. ${t.learn.tabAnatomy}`, icon: Layers },
              ] as const
            ).map((item, idx) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              const locked = !freeBrowse && idx > unlockedStepIdx;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleTabChange(item.id)}
                  className={cn(
                    "inline-flex min-h-[40px] items-center gap-1.5 rounded-[10px] px-3.5 text-xs font-semibold transition-colors cursor-pointer",
                    active
                      ? "bg-[#245B3D] text-white"
                      : locked
                      ? "border border-[#D6DED2] bg-[#F5F3E9] text-[#687A70] opacity-75"
                      : "border border-[#D6DED2] bg-white text-[#25352B] hover:bg-[#EAF0E5]",
                  )}
                >
                  {locked ? (
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* TAB 1: CONTENT + REGIONAL MEDIA */}
          {activeTab === "content" ? (
            <div className="space-y-5">
              {lesson.sections.map((sec) => (
                <article
                  key={sec.heading}
                  className="grid grid-cols-1 items-center gap-5 rounded-[14px] border border-[#D6DED2] bg-[#F5F3E9] p-4 md:grid-cols-[220px_minmax(0,1fr)]"
                >
                  <img
                    src={sec.image}
                    alt={isEn && sec.headingEn ? sec.headingEn : sec.heading}
                    className="h-44 w-full rounded-[12px] object-cover"
                  />
                  <div className="space-y-2">
                    <h2 className="text-lg font-bold text-[#25352B]">
                      {isEn && sec.headingEn ? sec.headingEn : sec.heading}
                    </h2>
                    <p className="text-sm leading-relaxed text-[#52645A]">
                      {isEn && sec.bodyEn ? sec.bodyEn : sec.body}
                    </p>
                  </div>
                </article>
              ))}
              <MediaPlayer
                asset={resolveCategoryMedia(lesson.topicTag, lesson.anatomyTarget)}
                compact
              />
            </div>
          ) : null}

          {/* TAB 2: FLASHCARDS */}
          {activeTab === "flashcards" ? (
            <div className="space-y-4">
              <DemoBanner title={t.learn.ambassadorBadge} detail={t.learn.speechFallbackNote} />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {lessonPhrases.map((phrase) => {
                  const flipped = Boolean(flippedCardIds[phrase.id]);
                  const mastered = learningProgress.masteredPhraseIds.includes(phrase.id);
                  return (
                    <Card key={phrase.id} className="flex flex-col justify-between p-4">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <Badge tone="neutral">
                            {phrase.level} · {phrase.id}
                          </Badge>
                          <button
                            type="button"
                            onClick={() => toggleMasteredPhrase(phrase.id)}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold cursor-pointer",
                              mastered
                                ? "bg-[#E6F3E9] text-[#24603B]"
                                : "bg-[#F5F3E9] text-[#52645A]",
                            )}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>
                              {mastered
                                ? isEn
                                  ? "Mastered"
                                  : "Đã thuộc"
                                : isEn
                                ? "Mark known"
                                : "Đánh dấu thuộc"}
                            </span>
                          </button>
                        </div>

                        <button
                          type="button"
                          aria-pressed={flipped}
                          onClick={() =>
                            setFlippedCardIds((prev) => ({
                              ...prev,
                              [phrase.id]: !prev[phrase.id],
                            }))
                          }
                          className="mt-3 flex min-h-[126px] w-full flex-col justify-center rounded-[12px] border border-[#D6DED2] bg-[#FAF8F1] p-4 text-left transition hover:border-[#245B3D] cursor-pointer"
                        >
                          {!flipped ? (
                            <>
                              <span className="text-[11px] font-bold text-[#245B3D]">
                                ENGLISH · CLICK TO FLIP
                              </span>
                              <p className="mt-1.5 text-base font-bold text-[#25352B]">
                                {phrase.enText}
                              </p>
                              <p className="mt-1 font-mono text-xs text-[#52645A]">
                                {phrase.pronunciationHint}
                              </p>
                            </>
                          ) : (
                            <>
                              <span className="text-[11px] font-bold text-[#80520C]">
                                TIẾNG VIỆT
                              </span>
                              <p className="mt-1.5 text-base font-bold text-[#25352B]">
                                {phrase.viText}
                              </p>
                              <p className="mt-1.5 text-xs text-[#52645A]">
                                {isEn ? phrase.contextEn : phrase.contextVi}
                              </p>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            setFlippedCardIds((prev) => ({
                              ...prev,
                              [phrase.id]: !prev[phrase.id],
                            }))
                          }
                        >
                          <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{t.learn.flipCardCta}</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => speakPhrase(phrase.enText)}
                        >
                          <Volume2 className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
                          <span>{isEn ? "Speak" : "Nghe"}</span>
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* TAB 3: KEYBOARD MATCHING GAME */}
          {activeTab === "matching" ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-[#25352B]">{t.learn.matchPrompt}</p>
                {matchMismatch ? (
                  <Badge tone="danger">
                    {isEn ? "Not a match — try another pair" : "Chưa khớp — thử ghép cặp khác"}
                  </Badge>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#52645A]">
                    English
                  </h3>
                  {matchingPairs.map((item) => {
                    const matched = learningProgress.matchedPairIds.includes(item.id);
                    const selected = selectedEnId === item.id;
                    return (
                      <button
                        key={`en-${item.id}`}
                        type="button"
                        disabled={matched}
                        onClick={() => {
                          setSelectedEnId(item.id);
                          tryMatchPair(item.id, selectedViId);
                        }}
                        className={cn(
                          "flex min-h-[48px] w-full items-center justify-between rounded-[12px] border px-4 py-2 text-left text-sm transition cursor-pointer",
                          matched
                            ? "border-[#24603B] bg-[#E6F3E9] text-[#24603B]"
                            : selected
                            ? "border-[#245B3D] bg-[#EAF0E5] font-bold text-[#245B3D]"
                            : "border-[#D6DED2] bg-white hover:bg-[#FAF8F1]",
                        )}
                      >
                        <span>{item.enText}</span>
                        {matched ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : null}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#52645A]">
                    Tiếng Việt
                  </h3>
                  {shuffledViPairs.map((item) => {
                    const matched = learningProgress.matchedPairIds.includes(item.id);
                    const selected = selectedViId === item.id;
                    return (
                      <button
                        key={`vi-${item.id}`}
                        type="button"
                        disabled={matched}
                        onClick={() => {
                          setSelectedViId(item.id);
                          tryMatchPair(selectedEnId, item.id);
                        }}
                        className={cn(
                          "flex min-h-[48px] w-full items-center justify-between rounded-[12px] border px-4 py-2 text-left text-sm transition cursor-pointer",
                          matched
                            ? "border-[#24603B] bg-[#E6F3E9] text-[#24603B]"
                            : selected
                            ? "border-[#245B3D] bg-[#EAF0E5] font-bold text-[#245B3D]"
                            : "border-[#D6DED2] bg-white hover:bg-[#FAF8F1]",
                        )}
                      >
                        <span>{item.viText}</span>
                        {matched ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {/* TAB 4: UNLIMITED QUIZ + QUESTION BANK */}
          {activeTab === "quiz" ? (
            <div className="space-y-6">
              {/* Primary Lesson Question */}
              <div className="space-y-3 rounded-[14px] border border-[#D6DED2] bg-[#F5F3E9] p-4">
                <p className="text-xs font-bold text-[#245B3D]">
                  {isEn ? "Core Lesson Check" : "Câu hỏi trọng tâm bài học"}
                </p>
                <p className="font-bold text-[#25352B]">
                  {isEn && lesson.quizQuestion.promptEn
                    ? lesson.quizQuestion.promptEn
                    : lesson.quizQuestion.prompt}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {(isEn && lesson.quizQuestion.optionsEn
                    ? lesson.quizQuestion.optionsEn
                    : lesson.quizQuestion.options
                  ).map((opt, idx) => {
                    const isSelected = corePicked === idx;
                    const isCorrect = idx === lesson.quizQuestion.correctIndex;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          recordLearningQuizAnswer(
                            lesson.id,
                            idx,
                            idx === lesson.quizQuestion.correctIndex,
                          )
                        }
                        className={cn(
                          "flex min-h-[46px] items-center justify-between gap-2 rounded-[10px] border px-4 py-2 text-left text-sm transition cursor-pointer",
                          coreAnswered && isCorrect
                            ? "border-[#24603B] bg-[#E6F3E9] font-semibold text-[#24603B]"
                            : coreAnswered && isSelected && !isCorrect
                            ? "border-[#A32D2D] bg-[#FDECEC] text-[#A32D2D]"
                            : "border-[#D6DED2] bg-white text-[#25352B] hover:border-[#6C9C5B]",
                        )}
                      >
                        <span>{opt}</span>
                        {coreAnswered && isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#24603B]" />
                        ) : coreAnswered && isSelected && !isCorrect ? (
                          <XCircle className="h-4 w-4 shrink-0 text-[#A32D2D]" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                {coreAnswered ? (
                  <p className="rounded-[10px] bg-white px-3.5 py-2 text-xs text-[#25352B]">
                    <strong className="text-[#245B3D]">
                      {isEn ? "Explanation: " : "Giải thích: "}
                    </strong>
                    {isEn && lesson.quizQuestion.explanationEn
                      ? lesson.quizQuestion.explanationEn
                      : lesson.quizQuestion.explanation}
                  </p>
                ) : null}
              </div>

              {/* Practice Question Bank Items */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-bold text-[#25352B]">
                    {isEn
                      ? `Practice Question Bank (${lessonBankQuestions.length})`
                      : `Ngân hàng câu hỏi ôn tập (${lessonBankQuestions.length})`}
                  </h2>
                  {Object.keys(bankAnswers).length > 0 ? (
                    <Button variant="secondary" size="sm" onClick={() => setBankAnswers({})}>
                      <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{t.learn.resetPracticeCta}</span>
                    </Button>
                  ) : null}
                </div>

                {lessonBankQuestions.map((qb) => {
                  const picked = bankAnswers[qb.id];
                  const answered = picked !== undefined;
                  const opts = isEn ? qb.optionsEn : qb.optionsVi;
                  return (
                    <div
                      key={qb.id}
                      className="space-y-2.5 rounded-[14px] border border-[#D6DED2] bg-white p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="neutral">{qb.id}</Badge>
                        <Badge tone="info">{qb.level}</Badge>
                        <span className="text-xs text-[#52645A]">{qb.learningObjective}</span>
                      </div>
                      <p className="text-sm font-bold text-[#25352B]">
                        {isEn ? qb.promptEn : qb.promptVi}
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {opts.map((opt, idx) => {
                          const isSelected = picked === idx;
                          const isCorrect = idx === qb.correctIndex;
                          return (
                            <button
                              key={`${qb.id}-${idx}`}
                              type="button"
                              onClick={() =>
                                setBankAnswers((prev) => ({ ...prev, [qb.id]: idx }))
                              }
                              className={cn(
                                "flex min-h-[42px] items-center justify-between gap-2 rounded-[10px] border px-3.5 py-2 text-left text-xs transition cursor-pointer",
                                answered && isCorrect
                                  ? "border-[#24603B] bg-[#E6F3E9] font-semibold text-[#24603B]"
                                  : answered && isSelected && !isCorrect
                                  ? "border-[#A32D2D] bg-[#FDECEC] text-[#A32D2D]"
                                  : "border-[#D6DED2] bg-[#FAF8F1] hover:bg-[#EAF0E5]",
                              )}
                            >
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                      {answered ? (
                        <p className="text-xs text-[#52645A]">
                          {isEn ? qb.explanationEn : qb.explanationVi}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* TAB 5: BILINGUAL ROLEPLAY */}
          {activeTab === "roleplay" ? (
            <div className="space-y-5">
              {lessonRoleplays.map((rp) => {
                const pickedOptId = learningProgress.roleplayChoices[rp.id];
                const pickedOpt = rp.options.find((o) => o.id === pickedOptId);
                return (
                  <Card key={rp.id} className="space-y-3 border border-[#D6DED2] bg-[#FAF8F1] p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="gold">
                        {rp.id} · {rp.level}
                      </Badge>
                      <span className="text-xs text-[#52645A]">{rp.contextDataNote}</span>
                    </div>
                    <h2 className="text-lg font-bold text-[#25352B]">
                      {isEn ? rp.titleEn : rp.titleVi}
                    </h2>
                    <p className="rounded-[10px] bg-white p-3 text-sm italic text-[#25352B]">
                      {isEn ? rp.customerPromptEn : rp.customerPromptVi}
                    </p>

                    <div className="space-y-2">
                      {rp.options.map((opt) => {
                        const selected = pickedOptId === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => recordRoleplayChoice(rp.id, opt.id, opt.scoreDelta)}
                            className={cn(
                              "block w-full rounded-[12px] border p-3.5 text-left text-xs transition cursor-pointer",
                              selected
                                ? opt.isRecommended
                                  ? "border-[#24603B] bg-[#E6F3E9] text-[#24603B]"
                                  : "border-[#A32D2D] bg-[#FDECEC] text-[#A32D2D]"
                                : "border-[#D6DED2] bg-white hover:border-[#245B3D]",
                            )}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-semibold">
                                {isEn ? opt.textEn : opt.textVi}
                              </span>
                              <Badge tone="neutral">{opt.rubricDimension}</Badge>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {pickedOpt ? (
                      <div className="rounded-[10px] border border-[#D6DED2] bg-white p-3 text-xs">
                        <strong className="text-[#245B3D]">
                          {isEn ? "Feedback: " : "Nhận xét rubric: "}
                        </strong>
                        <span>{isEn ? pickedOpt.feedbackEn : pickedOpt.feedbackVi}</span>
                      </div>
                    ) : null}
                  </Card>
                );
              })}
            </div>
          ) : null}

          {/* TAB 6: 2D PRODUCE ANATOMY & COMPLETION CERTIFICATE */}
          {activeTab === "anatomy" ? (
            <div className="space-y-5">
              <ProduceAnatomy2D
                key={lesson.anatomyTarget}
                initialProduce={lesson.anatomyTarget}
                allowSwitch
              />
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-[#245B3D]/30 bg-[#EAF0E5] p-4">
                <div>
                  <p className="text-sm font-bold text-[#245B3D]">
                    {isEn ? "Step 6 Complete · Completion Certificate Ready" : "Hoàn thành Bước 6 · Sẵn sàng xuất Chứng nhận PDF"}
                  </p>
                  <p className="text-xs text-[#52645A]">
                    {isEn
                      ? "Preview your completion record with scannable QR and export A4 landscape PDF."
                      : "Xem trước chứng nhận có mã QR đối chiếu và tải xuống bản PDF chuẩn tiếng Việt."}
                  </p>
                </div>
                <Button variant="gold" size="sm" onClick={openLessonCertificate}>
                  <Award className="h-4 w-4" aria-hidden="true" />
                  <span>{isEn ? "Preview & Download PDF" : "Xem & Tải Chứng nhận PDF"}</span>
                </Button>
              </div>
            </div>
          ) : null}

          {/* Unified Sequential Step Navigation Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#D6DED2] pt-4">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentStepIdx === 0}
              onClick={() => handleTabChange(VALID_LESSON_TABS[Math.max(0, currentStepIdx - 1)])}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              <span>{isEn ? "Previous step" : "Quay lại bước trước"}</span>
            </Button>

            <span className="text-xs font-semibold text-[#52645A]">
              {isEn ? `Step ${currentStepIdx + 1} of 6` : `Bước ${currentStepIdx + 1} / 6`}
            </span>

            {currentStepIdx < VALID_LESSON_TABS.length - 1 ? (
              <Button variant="primary" size="sm" onClick={handleAdvanceStep}>
                <span>
                  {isEn ? `Continue to Step ${currentStepIdx + 2}` : `Tiếp tục Bước ${currentStepIdx + 2}`}
                </span>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button variant="gold" size="sm" onClick={openLessonCertificate}>
                <Award className="h-4 w-4" aria-hidden="true" />
                <span>{isEn ? "Completion Certificate" : "Nhận Chứng nhận"}</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      <DemoBanner title={t.learn.practicePointsLabel} detail={t.learn.volunteerHoursSeparateNote} />

      <CertificatePreviewModal credential={previewCert} onClose={() => setPreviewCert(null)} />
    </div>
  );
}
