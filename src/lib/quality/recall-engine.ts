import type { DemoOrder, TraceBatch } from "@/types/naifarm";

export interface LotGenealogyReport {
  batch: TraceBatch;
  parents: TraceBatch[];
  children: TraceBatch[];
  quantityConservationNote: string;
}

export function traceLotGenealogy(
  batchCode: string,
  allBatches: TraceBatch[],
): LotGenealogyReport | null {
  const byCode = new Map(allBatches.map((b) => [b.batchCode.toUpperCase(), b]));
  const target = byCode.get(batchCode.trim().toUpperCase());
  if (!target) return null;

  const parents = (target.parentBatchCodes ?? [])
    .map((code) => byCode.get(code.toUpperCase()))
    .filter((b): b is TraceBatch => Boolean(b));

  const children = [
    ...(target.childBatchCodes ?? []).map((code) => byCode.get(code.toUpperCase())),
    ...allBatches.filter((b) =>
      (b.parentBatchCodes ?? []).some((p) => p.toUpperCase() === target.batchCode.toUpperCase()),
    ),
  ]
    .filter((b): b is TraceBatch => Boolean(b))
    .filter((b, idx, arr) => arr.findIndex((x) => x.batchCode === b.batchCode) === idx);

  const parentTotalKg = parents.reduce((sum, p) => sum + (p.quantityKg ?? 0), 0);
  const childTotalKg = children.reduce((sum, c) => sum + (c.quantityKg ?? 0), 0);

  let quantityConservationNote = "Lô đơn độc lập: lượng xuất/tồn bảo toàn trong nội bộ lô.";
  if (parents.length > 0) {
    quantityConservationNote = `Lô gộp nguồn từ ${parents.length} lô mẹ (${parents.map((p) => p.batchCode).join(", ")}), tổng nguồn cấp: ${parentTotalKg} kg.`;
  } else if (children.length > 0) {
    quantityConservationNote = `Lô gốc ${target.quantityKg ?? 0} kg chia/góp sang ${children.length} lô con (tổng quy mô lô con: ${childTotalKg} kg).`;
  }

  return {
    batch: target,
    parents,
    children,
    quantityConservationNote,
  };
}

export interface RecallImpactAnalysis {
  rootBatchCode: string;
  affectedBatchCodes: string[];
  affectedOrders: DemoOrder[];
  affectedQuantityKg: number;
  blockedForSale: boolean;
}

export function impactAnalysisForRecall(
  rootBatchCode: string,
  allBatches: TraceBatch[],
  allOrders: DemoOrder[],
): RecallImpactAnalysis {
  const byCode = new Map(allBatches.map((b) => [b.batchCode.toUpperCase(), b]));
  const visited = new Set<string>();
  const queue = [rootBatchCode.trim().toUpperCase()];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (visited.has(curr)) continue;
    visited.add(curr);
    const batch = byCode.get(curr);
    if (!batch) continue;
    for (const c of batch.childBatchCodes ?? []) {
      if (!visited.has(c.toUpperCase())) queue.push(c.toUpperCase());
    }
    for (const candidate of allBatches) {
      if ((candidate.parentBatchCodes ?? []).some((p) => p.toUpperCase() === curr)) {
        if (!visited.has(candidate.batchCode.toUpperCase())) {
          queue.push(candidate.batchCode.toUpperCase());
        }
      }
    }
  }

  const affectedBatchCodes = Array.from(visited);
  const affectedSet = new Set(affectedBatchCodes);
  const affectedOrders = allOrders.filter(
    (o) =>
      o.status !== "cancelled" &&
      o.items.some((item) => item.batchCode && affectedSet.has(item.batchCode.toUpperCase())),
  );

  const affectedQuantityKg = affectedBatchCodes.reduce(
    (sum, code) => sum + (byCode.get(code)?.quantityKg ?? 0),
    0,
  );

  return {
    rootBatchCode: rootBatchCode.trim().toUpperCase(),
    affectedBatchCodes,
    affectedOrders,
    affectedQuantityKg,
    blockedForSale: affectedBatchCodes.some((c) => {
      const st = byCode.get(c)?.lotStatus;
      return st === "quarantine" || st === "recalled" || st === "expired";
    }),
  };
}
