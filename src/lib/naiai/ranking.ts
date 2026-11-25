export type RankedEvidence = { id: string; content: string; title: string; href: string; vectorRank?: number; textRank?: number; similarity?: number; entityMatch?: boolean; score?: number };

export function reciprocalRankFusion(vector: RankedEvidence[], lexical: RankedEvidence[], limit = 20) {
  const combined = new Map<string, RankedEvidence & { score: number }>();
  for (const [rank, item] of vector.entries()) {
    const current = combined.get(item.id) ?? { ...item, score: 0 };
    current.vectorRank = rank + 1;
    current.score += 1 / (60 + rank + 1);
    combined.set(item.id, current);
  }
  for (const [rank, item] of lexical.entries()) {
    const current = combined.get(item.id) ?? { ...item, score: 0 };
    current.textRank = rank + 1;
    current.score += 1 / (60 + rank + 1);
    combined.set(item.id, current);
  }
  return [...combined.values()].sort((a, b) => Number(b.entityMatch) - Number(a.entityMatch) || b.score - a.score).slice(0, limit);
}

export function rerankEvidence(items: RankedEvidence[], question: string) {
  const terms = question.toLocaleLowerCase("vi").split(/[^\p{L}\p{N}-]+/u).filter(term => term.length > 2);
  return items.map(item => {
    const text = `${item.title} ${item.content}`.toLocaleLowerCase("vi");
    const coverage = terms.length ? terms.filter(term => text.includes(term)).length / terms.length : 0;
    const exactCode = /\bNF-[A-Z0-9-]+\b/i.exec(question)?.[0];
    const exactEntity = Boolean(exactCode && text.includes(exactCode.toLocaleLowerCase("vi")));
    return { ...item, score: (item.score ?? 0) + coverage * 0.02 + (item.similarity ?? 0) * 0.01 + (exactEntity ? 1 : 0) };
  }).sort((a, b) => Number(b.entityMatch) - Number(a.entityMatch) || b.score - a.score);
}
