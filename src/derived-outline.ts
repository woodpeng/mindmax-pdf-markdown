// Cascade for a PDF's outline: bookmarks (resolvePdfOutline) → tagged structure
// tree (H1..H6 roles — what a Word export looks like by default: tagging on,
// bookmarks off) → font-size / numbering heuristic. The cascade order and the
// heuristic details live here once, so every caller of resolvePdfOutlineAuto
// gets the same titles for the same PDF.

import {
  cleanOutlineTitle, resolvePdfOutline,
  type PdfOutlineDocumentLike, type PdfOutlineEntry,
} from './outline.js';
import { inferTocDepth } from './toc-depth.js';

/** Structural subset of pdf.js TextItem the font heuristic needs. */
export interface PdfStyledItemLike {
  str: string;
  /** pdf.js text matrix [a,b,c,d,e,f] — [4]/[5] are x/y in PDF user space,
   *  hypot([2],[3]) is the rendered font size. */
  transform?: number[] | null;
}

export interface PdfStyledPageLike {
  items: PdfStyledItemLike[];
  /** Page height in PDF user space (page.view[3] - page.view[1]) — NOT the
   *  rotated viewport height; item y coordinates live in unrotated user space. */
  height: number;
}

interface PdfStructContentLike { type: string; id?: string | null }
interface PdfStructNodeLike { role?: string; children?: (PdfStructNodeLike | PdfStructContentLike)[] }

/** Structural subset of pdf.js PDFPageProxy the struct-tree pass needs. */
export interface PdfStructPageLike {
  getStructTree(): Promise<PdfStructNodeLike | null>;
  getTextContent(opts: { includeMarkedContent: boolean }): Promise<{ items: unknown[] }>;
}

/** Structural subset of pdf.js PDFDocumentProxy for the full cascade. */
export interface PdfOutlineAutoDocumentLike extends PdfOutlineDocumentLike {
  numPages: number;
  getPage(pageNumber: number): Promise<PdfStructPageLike>;
}

/** Fallback passes stop after this many pages: books this long virtually
 *  always ship bookmarks, and per-page struct-tree walks aren't free. */
const MAX_FALLBACK_PAGES = 600;
/** Fraction of page height treated as running header/footer territory. */
const EDGE_ZONE = 0.08;

/**
 * Resolve a PDF's outline from the best available source: real bookmarks,
 * else Tagged-PDF heading roles, else font-size/numbering heuristics over the
 * text layer. `styledPages` must be the same getTextContent items both sides
 * already hold (filtered to `'str' in item`), so the heuristic sees an
 * identical stream in the main process and the renderer.
 */
export async function resolvePdfOutlineAuto(
  doc: PdfOutlineAutoDocumentLike,
  styledPages: PdfStyledPageLike[],
): Promise<PdfOutlineEntry[]> {
  const bookmarks = await resolvePdfOutline(doc).catch(() => [] as PdfOutlineEntry[]);
  if (bookmarks.length > 0) return bookmarks;
  const struct = await derivePdfStructOutline(doc).catch(() => [] as PdfOutlineEntry[]);
  if (struct.length > 0) return struct;
  return derivePdfHeuristicOutline(styledPages);
}

// ── Tagged-PDF structure tree ────────────────────────────────────────────────

const STRUCT_HEADING_RE = /^H([1-6])?$/i;

function isStructNode(n: PdfStructNodeLike | PdfStructContentLike): n is PdfStructNodeLike {
  return typeof (n as PdfStructContentLike).type !== 'string';
}

function collectStructContentIds(node: PdfStructNodeLike, ids: Set<string>): void {
  for (const child of node.children ?? []) {
    if (isStructNode(child)) collectStructContentIds(child, ids);
    else if (child.type === 'content' && typeof child.id === 'string') ids.add(child.id);
  }
}

/** Heading nodes (H / H1..H6) in tree order; each with the marked-content ids
 *  of its whole subtree. Headings don't nest, so matching stops the descent. */
function collectStructHeadings(node: PdfStructNodeLike, out: { level: number; ids: Set<string> }[]): void {
  const m = typeof node.role === 'string' ? STRUCT_HEADING_RE.exec(node.role) : null;
  if (m) {
    const ids = new Set<string>();
    collectStructContentIds(node, ids);
    if (ids.size > 0) out.push({ level: m[1] ? Number(m[1]) : 1, ids });
    return;
  }
  for (const child of node.children ?? []) {
    if (isStructNode(child)) collectStructHeadings(child, out);
  }
}

/**
 * Outline from a Tagged PDF's structure tree: heading roles point (via
 * marked-content ids) at runs in the text-content stream, which yields the
 * heading text plus a y position for in-page jumps. Untagged PDFs (no struct
 * tree anywhere) fall through cheaply — getStructTree returns null before any
 * extra text pass happens. Yields [] unless at least 2 headings resolve.
 */
export async function derivePdfStructOutline(doc: PdfOutlineAutoDocumentLike): Promise<PdfOutlineEntry[]> {
  const raw: { title: string; page: number; y?: number; level: number }[] = [];
  const pageCount = Math.min(doc.numPages, MAX_FALLBACK_PAGES);
  for (let p = 1; p <= pageCount; p++) {
    const page = await doc.getPage(p);
    const tree = await page.getStructTree().catch(() => null);
    if (!tree) continue;
    const headings: { level: number; ids: Set<string> }[] = [];
    collectStructHeadings(tree, headings);
    if (headings.length === 0) continue;

    // Index both the full content id and its `_mcN` suffix — id prefixes have
    // varied across pdf.js versions, mcids are unique within a page either way.
    const byId = new Map<string, number>();
    headings.forEach((h, i) => {
      for (const id of h.ids) {
        byId.set(id, i);
        const mc = /_mc\d+$/.exec(id);
        if (mc) byId.set(mc[0], i);
      }
    });

    const content = await page.getTextContent({ includeMarkedContent: true }).catch(() => null);
    if (!content) continue;
    const texts: string[] = headings.map(() => '');
    const ys: (number | undefined)[] = headings.map(() => undefined);
    // Heading index per open marked-content scope (undefined = not a heading).
    const stack: (number | undefined)[] = [];
    for (const rawItem of content.items) {
      const item = rawItem as { type?: string; id?: string | null; str?: string; transform?: number[] | null };
      if (item.type === 'beginMarkedContentProps' || item.type === 'beginMarkedContent') {
        const id = typeof item.id === 'string' ? item.id : null;
        stack.push(id === null ? undefined : byId.get(id) ?? byId.get(/_mc\d+$/.exec(id)?.[0] ?? ''));
      } else if (item.type === 'endMarkedContent') {
        stack.pop();
      } else if (typeof item.str === 'string' && item.str.trim().length > 0) {
        let hi: number | undefined;
        for (let s = stack.length - 1; s >= 0; s--) {
          if (stack[s] !== undefined) { hi = stack[s]; break; }
        }
        if (hi !== undefined) {
          texts[hi] = texts[hi] ? `${texts[hi]}${item.str}` : item.str;
          if (ys[hi] === undefined && item.transform && item.transform.length >= 6) {
            ys[hi] = item.transform[5]! + Math.hypot(item.transform[2]!, item.transform[3]!);
          }
        }
      }
    }
    headings.forEach((h, i) => {
      const title = cleanOutlineTitle(texts[i]!);
      if (title) raw.push({ title, page: p, y: ys[i], level: h.level });
    });
  }

  if (raw.length < 2) return [];
  // Compact the H levels that occur to 0-based depths; keep the top 3 levels
  // (same spirit as the bookmark path's maxDepth).
  const levels = [...new Set(raw.map((e) => e.level))].sort((a, b) => a - b);
  const depthOf = new Map(levels.map((l, i) => [l, i] as const));
  const entries = raw
    .filter((e) => depthOf.get(e.level)! <= 2)
    .map(({ level, y, ...e }) => (y === undefined
      ? { ...e, depth: depthOf.get(level)! }
      : { ...e, y, depth: depthOf.get(level)! }));
  return entries.length >= 2 ? entries : [];
}

// ── Font-size / numbering heuristic ─────────────────────────────────────────

/** Strong section-numbering prefixes that qualify a body-size line as a
 *  heading candidate (bold-only headings are invisible here — pdf.js text
 *  items don't expose reliable font weight). Bare "1.2" / "一、" prefixes are
 *  deliberately NOT strong: enumerated lists share them at body size. */
const STRONG_NUM_RE = /^(?:第\s*[0-9一二三四五六七八九十百千零〇两]+\s*(?:[部篇卷编章回讲课]|小?节)|附录|(?:chapter|part|section|appendix)\s+\S)/i;

function itemSize(item: PdfStyledItemLike): number | null {
  const t = item.transform;
  if (!t || t.length < 6) return null;
  const size = Math.hypot(t[2]!, t[3]!);
  return Number.isFinite(size) && size > 0 ? size : null;
}

/**
 * Last-resort outline for PDFs with neither bookmarks nor tags: find the
 * dominant body-text size, then treat short standalone lines that are clearly
 * larger (or carry strong chapter numbering) as headings. Depth comes from
 * numbering patterns (inferTocDepth) when they discriminate, else from size
 * tiers. Printed-TOC pages, running headers/footers and page numbers are
 * filtered out. Deterministic — safe to run on both sides. Returns [] when
 * the evidence is too thin or too noisy to trust.
 */
export function derivePdfHeuristicOutline(pages: PdfStyledPageLike[]): PdfOutlineEntry[] {
  const scanned = pages.slice(0, MAX_FALLBACK_PAGES);

  // Dominant body size: char-weighted mode over all items, 0.5pt buckets.
  const weights = new Map<number, number>();
  for (const page of scanned) {
    for (const item of page.items) {
      const size = itemSize(item);
      if (size === null) continue;
      const chars = item.str.replace(/\s+/g, '').length;
      if (chars === 0) continue;
      const key = Math.round(size * 2) / 2;
      weights.set(key, (weights.get(key) ?? 0) + chars);
    }
  }
  let bodySize = 0;
  let bestWeight = 0;
  for (const [size, w] of weights) {
    if (w > bestWeight || (w === bestWeight && size < bodySize)) { bestWeight = w; bodySize = size; }
  }
  if (bodySize === 0) return [];

  interface Candidate { text: string; size: number; y: number; page: number; bySize: boolean }
  const candidates: Candidate[] = [];
  const pagesOfText = new Map<string, Set<number>>();

  scanned.forEach((page, pi) => {
    // Assemble visual lines: consecutive stream items sharing a baseline y.
    // Stream order (not global y-sort) keeps multi-column layouts intact.
    interface Line { text: string; size: number; y: number }
    const lines: Line[] = [];
    let cur: Line | null = null;
    for (const item of page.items) {
      const size = itemSize(item);
      if (size === null || !item.str.trim()) continue;
      const y = item.transform![5]!;
      if (cur && Math.abs(y - cur.y) <= 2.5) {
        cur.text += item.str;
        cur.size = Math.max(cur.size, size);
      } else {
        if (cur) lines.push(cur);
        cur = { text: item.str, size, y };
      }
    }
    if (cur) lines.push(cur);

    const pageCandidates: Candidate[] = [];
    for (const line of lines) {
      const text = line.text.replace(/\s+/g, ' ').trim();
      if (text.length < 2 || text.length > 60) continue;
      if (/[。，、；：,;:]$/.test(text)) continue;                       // mid-sentence line
      if (/^[0-9IVXLCDMivxlcdm\s.·．…—–\-/()（）]+$/.test(text)) continue; // page numbers / rules
      if (/[.·．…]{4,}/.test(text)) continue;                            // printed-TOC leader dots
      if (page.height > 0) {
        const rel = line.y / page.height;
        if (rel < EDGE_ZONE || rel > 1 - EDGE_ZONE) continue;            // header/footer zone
      }
      const bySize = line.size >= bodySize + 0.75 && line.size >= bodySize * 1.12;
      const byNumbering = STRONG_NUM_RE.test(text) && text.length <= 30 && line.size >= bodySize - 0.25;
      if (!bySize && !byNumbering) continue;
      pageCandidates.push({ text, size: line.size, y: line.y, page: pi + 1, bySize });
    }
    // A page bristling with candidates is a printed TOC or cover collage.
    if (pageCandidates.length > 8) return;
    for (const c of pageCandidates) {
      candidates.push(c);
      let set = pagesOfText.get(c.text);
      if (!set) { set = new Set(); pagesOfText.set(c.text, set); }
      set.add(c.page);
    }
  });

  // Running headers repeat across pages; a real heading occurs once or twice
  // (chapter start + printed TOC — but TOC pages were dropped above).
  let kept = candidates.filter((c) => (pagesOfText.get(c.text)?.size ?? 1) < 3);
  if (kept.length > scanned.length * 3) kept = kept.filter((c) => c.bySize);
  if (kept.length < 2 || kept.length > scanned.length * 3) return [];

  // Depth: numbering patterns first, size tiers as fallback.
  let depths = inferTocDepth(kept.map((c) => c.text));
  if (!depths.some((d) => d > 0)) {
    const sizes = [...new Set(kept.map((c) => Math.round(c.size * 2) / 2))].sort((a, b) => b - a);
    const tierOf = new Map(sizes.map((s, i) => [s, Math.min(i, 2)] as const));
    depths = kept.map((c) => tierOf.get(Math.round(c.size * 2) / 2)!);
  }

  return kept
    .map((c, i) => ({ title: cleanOutlineTitle(c.text), page: c.page, y: c.y + c.size, depth: depths[i]! }))
    .filter((e) => e.title.length > 0);
}
