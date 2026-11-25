"use client";

import React from "react";
import { CalendarDays, CheckCircle2, FileText, UserCheck } from "lucide-react";
import type { DiaryEntry } from "@/types/naifarm";

export function ProductionDiaryTimeline({
  entries,
  title = "Nhật ký sản xuất & mùa vụ",
  limit,
}: {
  entries: DiaryEntry[];
  title?: string;
  limit?: number;
}) {
  const visible = limit ? entries.slice(0, limit) : entries;

  if (visible.length === 0) {
    return (
      <div className="rounded-[14px] border border-dashed border-[#D6DED2] bg-[#FAF8F1] p-6 text-center text-xs text-[#52645A]">
        Chưa có bản ghi nhật ký nào cho mùa vụ hoặc lô hàng này.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-base font-bold text-[#25352B]">
        <FileText className="h-4 w-4 text-[#245B3D]" aria-hidden="true" />
        <span>
          {title} ({entries.length} bản ghi)
        </span>
      </h3>

      <ol className="relative space-y-3 border-l-2 border-[#D6DED2] pl-5">
        {visible.map((entry) => (
          <li key={entry.id} className="relative">
            <span
              aria-hidden="true"
              className="absolute -left-[27px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#245B3D]"
            />
            <div className="rounded-[12px] border border-[#D6DED2] bg-white p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 tabular-nums text-xs font-bold text-[#245B3D]">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    {entry.dateLabel}
                  </span>
                  <span className="rounded-full bg-[#F5F3E9] px-2.5 py-0.5 text-[11px] font-semibold text-[#25352B]">
                    {entry.stage}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    entry.sourceDeclaration.includes("HTX")
                      ? "bg-[#E6F3E9] text-[#24603B]"
                      : entry.sourceDeclaration.includes("Thanh niên")
                      ? "bg-[#E8F2F8] text-[#245B78]"
                      : "bg-[#FFF2D8] text-[#80520C]"
                  }`}
                >
                  {entry.sourceDeclaration.includes("HTX") ? (
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <UserCheck className="h-3 w-3" aria-hidden="true" />
                  )}
                  {entry.sourceDeclaration}
                </span>
              </div>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#25352B]">{entry.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#52645A]">{entry.detail}</p>
                  <p className="mt-1.5 text-[11px] text-[#52645A]">
                    Người ghi nhận: <strong>{entry.actorName}</strong> · Mã lô:{" "}
                    <strong className="tabular-nums text-[#245B3D]">{entry.batchCode}</strong>
                  </p>
                </div>
                {entry.photo ? (
                  <img
                    src={entry.photo}
                    alt={entry.title}
                    className="h-16 w-24 shrink-0 rounded-[10px] border border-[#D6DED2] object-cover"
                  />
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
