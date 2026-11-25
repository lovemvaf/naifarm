const FORMULA_TRIGGER_REGEX = /^[=+\-@\t\r]/;

/**
 * Neutralizes spreadsheet formula injection (CWE-1236) by prefixing an apostrophe
 * before any text value starting with =, +, -, @, tab, or CR.
 */
export function sanitizeCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  const raw = String(value);
  const safe = FORMULA_TRIGGER_REGEX.test(raw) ? `'${raw}` : raw;
  const escaped = safe.replace(/"/g, '""');
  return `"${escaped}"`;
}

export interface CsvExportMetadata {
  reportTitle: string;
  periodLabel: string;
  scopeLabel: string;
}

export function buildScopedCsvContent(
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][],
  meta: CsvExportMetadata,
): string {
  const headerBlock = [
    [meta.reportTitle, "NaiFarm · Không gian trải nghiệm"],
    ["Kỳ dữ liệu", meta.periodLabel],
    ["Phạm vi áp dụng", meta.scopeLabel],
    ["Lưu ý trung thực", "Báo cáo tổng hợp trải nghiệm nội bộ — không phải chứng từ kế toán pháp lý"],
    [],
  ];

  const lines: string[] = [
    ...headerBlock.map((r) => r.map(sanitizeCsvCell).join(",")),
    headers.map(sanitizeCsvCell).join(","),
    ...rows.map((r) => r.map(sanitizeCsvCell).join(",")),
  ];

  // UTF-8 BOM guarantees clean Vietnamese accents in Excel on Windows
  return `\uFEFF${lines.join("\r\n")}`;
}

export function triggerCsvDownload(filename: string, csvContent: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
