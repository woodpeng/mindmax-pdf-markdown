// Depth inference for FLAT tables of contents. Many EPUBs (especially converted
// ones) ship a single-level NCX, and the PDF heuristic outline
// (derived-outline.ts) starts out flat — the hierarchy only exists in the title
// numbering (第X部/第X章/第X节, Chapter N, 1.2.3 …). Shared by the EPUB outline
// builder and the PDF heuristic so both structure titles the same way.

/** Rank of part-level dividers (部/篇/卷/编/Part) — the only titles bare
 *  (unnumbered) entries may nest under, see inferTocDepth. */
const PART_RANK = 0;

/**
 * Hierarchy rank of one TOC title, from its numbering pattern; smaller =
 * higher level. Returns null for unnumbered titles (封面/前言/…). Ranks are
 * sparse on purpose — only their ORDER matters; inferTocDepth compacts the
 * ranks that actually occur down to depths 0,1,2….
 */
function rankOf(label: string): number | null {
  const t = label.trim();
  if (/^第\s*[0-9一二三四五六七八九十百千零〇两]+\s*[部篇卷编]/.test(t)) return PART_RANK;
  if (/^part\s+\S/i.test(t)) return PART_RANK;
  if (/^第\s*[0-9一二三四五六七八九十百千零〇两]+\s*[章回讲课]/.test(t)) return 10;
  if (/^(?:chapter|appendix)\s+\S/i.test(t)) return 10;
  // Illustrated editions (Gutenberg's Pride and Prejudice) prefix the chapter
  // number with the heading plate's caption: "He rode a black horse. CHAPTER
  // III." / "“On the Stairs.” CHAPTERXXVII." — the number sits at the END.
  if (/\bchapter\s*(?:[ivxlcdm]+|\d{1,3})\.?$/i.test(t)) return 10;
  if (/^附录/.test(t)) return 10;
  if (/^第\s*[0-9一二三四五六七八九十百千零〇两]+\s*小?节/.test(t)) return 20;
  if (/^section\s+\S/i.test(t)) return 20;
  // Dotted numbering: "3 标题" / "3. Title" → chapter, "1.2" → section,
  // "1.2.3" → subsection. {1,3} digit cap keeps years ("1984") from matching.
  const dotted = /^(\d{1,3})((?:[.．]\d{1,3})*)(?=$|[\s.．、)）:：—–-])/.exec(t);
  if (dotted) {
    const segments = 1 + (dotted[2] ? dotted[2].split(/[.．]/).length - 1 : 0);
    return Math.min(segments, 4) * 10;
  }
  // "一、" enumeration: between 章 and 节 when both appear alongside it.
  if (/^[一二三四五六七八九十]+\s*[、.．]/.test(t)) return 15;
  return null;
}

/**
 * Infer a depth (0-based) per title for a flat TOC. Conservative by design:
 * a list with no recognizable numbering, or a uniformly-numbered list (all
 * "第N章"), stays entirely at depth 0.
 *
 * Numbered titles get a depth from their rank order. Unnumbered titles are the
 * tricky part: a book like 《脑科学讲义》 numbers only its 部分 dividers and
 * leaves the chapter titles under them bare — those chapters must become
 * children, yet a stray 封面/后记 must NOT. The rule that separates them: an
 * unnumbered title drops one level below the most recent numbered title ONLY
 * when that title is a part-level divider (部/篇/卷/编/Part); otherwise it
 * stays at depth 0 (front/back matter, or leaves under a deeper numbered
 * heading we don't try to nest). A chapter that merely happens to be depth 0
 * (a book with no parts) is not a divider: bare titles after it are the
 * book's own unnumbered siblings (license, afterword, a chapter whose label we
 * failed to parse), not its children. Depths are capped at 3.
 */
export function inferTocDepth(labels: string[]): number[] {
  const ranks = labels.map((l) => rankOf(l));
  const present = [...new Set(ranks.filter((r): r is number => r !== null))].sort((a, b) => a - b);
  if (present.length === 0) return labels.map(() => 0);
  const depthOf = new Map(present.map((r, i) => [r, Math.min(i, 3)] as const));

  let lastNumberedRank: number | null = null;
  return ranks.map((r) => {
    if (r !== null) {
      lastNumberedRank = r;
      return depthOf.get(r)!;
    }
    return lastNumberedRank === PART_RANK ? 1 : 0;
  });
}
