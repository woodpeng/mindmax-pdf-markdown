// Text-layer health check: the text came out complete but not correct.
//
// "Is there any text" is a different question from "is this text usable".
// LaTeX- and Word-typeset papers and textbooks pass the first and fail the
// second: the text layer is complete and the page looks fine, but pdf.js
// flattens the maths — superscripts rejoin the baseline (x² → x2), fraction and
// radical structure disappears, and glyphs without a ToUnicode map land in the
// private use area. The result is unusable for anything downstream that reads
// meaning rather than words.
//
// This module never repairs anything. It only reports, so a caller can tell the
// user which pages are worth checking or re-processing.
//
// Signals are counted, never keyword-matched, so they are language- and
// subject-neutral:
//   1. Unmapped glyphs: private use area / U+FFFD / C0 controls — objective
//      damage.
//   2. Maths symbols: the Mathematical Operators blocks, Mathematical
//      Alphanumeric Symbols, isolated Greek letters — there is maths here.
//   3. Flattened scripts: short runs on the same line with a smaller type size
//      and a shifted baseline — direct geometric evidence that structure was
//      lost.
// A stray hit on one page (a footnote marker, a lone α) does not count; only a
// pattern across the document does.

import type { PdfTextItemLike } from './text-map.js';

/** Document-level verdict. Only set when a threshold was crossed (see
 *  assessPdfTextLayer); null means "nothing worth mentioning". */
export interface PdfTextLayerIssues {
  /** Pages containing maths whose structure the extraction loses. */
  mathPages: number;
  /** Pages with many unmapped glyphs (garbled text). */
  garbledPages: number;
  /** Total pages, so a caller can say "about N of M pages". */
  pages: number;
}

export interface PdfPageTextQuality {
  /** Non-whitespace characters. */
  chars: number;
  /** Unmapped glyphs. */
  garbled: number;
  /** Distinct code points among the unmapped glyphs. */
  garbledDistinct: number;
  /** Maths symbols, isolated Greek letters included. */
  mathSymbols: number;
  /** Flattened script runs. */
  scripts: number;
}

/** A page counts as a maths page at this combined symbol + script score. A body
 *  page with a footnote marker and one ≤ scores far below; a page of real
 *  derivation scores tens. */
const MATH_PAGE_SCORE = 6;
/** A page counts as garbled at this many unmapped glyphs across at least
 *  GARBLED_PAGE_DISTINCT code points. Bullets often sit at U+F0xx in a Symbol
 *  font (excluded below), and some producers put every circled footnote number
 *  into ONE private-use code point reused dozens of times per page — that is one
 *  glyph drawn repeatedly, not a failed mapping. Real mapping failures (a maths
 *  font with no ToUnicode) scatter across many code points. */
const GARBLED_PAGE_CHARS = 5;
const GARBLED_PAGE_DISTINCT = 3;

function isGarbledCodePoint(cp: number): boolean {
  if (cp === 0xfffd) return true;
  // C0 controls (tab/newline excepted): the other place pdf.js puts a glyph it
  // could not encode.
  if (cp < 0x20 && cp !== 0x09 && cp !== 0x0a && cp !== 0x0d) return true;
  // Private use area, except U+F000–F0FF — the conventional Symbol/Wingdings
  // range (bullets, checkboxes) that Word-exported PDFs are full of. Counting it
  // would produce false alarms.
  return cp >= 0xe000 && cp <= 0xf8ff && !(cp >= 0xf000 && cp <= 0xf0ff);
}

function isMathCodePoint(cp: number): boolean {
  return (cp >= 0x2200 && cp <= 0x22ff)      // Mathematical Operators ∑∫≤∈…
    || (cp >= 0x2a00 && cp <= 0x2aff)        // Supplemental Mathematical Operators
    || (cp >= 0x27c0 && cp <= 0x27ef)        // Misc Mathematical Symbols-A
    || (cp >= 0x2980 && cp <= 0x29ff)        // Misc Mathematical Symbols-B
    || (cp >= 0x1d400 && cp <= 0x1d7ff);     // Mathematical Alphanumeric Symbols 𝑥𝐀
}

function isGreekLetter(cp: number): boolean {
  return cp >= 0x0391 && cp <= 0x03c9;
}

function isLetter(ch: string): boolean {
  return /\p{L}/u.test(ch);
}

/** The character-level counts (no geometry). A Greek letter counts as a maths
 *  symbol only when ISOLATED — in Greek prose they come in words; and when Greek
 *  letters are a large share of the page's letters the whole term is dropped
 *  (single-letter articles ο/η in a Greek document are isolated too). */
function countChars(text: string): { chars: number; garbled: number; garbledDistinct: number; mathSymbols: number } {
  const chars = [...text];
  let nonSpace = 0;
  let garbled = 0;
  const garbledCodes = new Set<number>();
  let math = 0;
  let letters = 0;
  let greek = 0;
  let isolatedGreek = 0;
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!;
    const cp = ch.codePointAt(0)!;
    if (!/\s/.test(ch)) nonSpace++;
    if (isGarbledCodePoint(cp)) { garbled++; garbledCodes.add(cp); continue; }
    if (isMathCodePoint(cp)) { math++; continue; }
    if (isLetter(ch)) {
      letters++;
      if (isGreekLetter(cp)) {
        greek++;
        const prev = chars[i - 1];
        const next = chars[i + 1];
        if (!(prev && isLetter(prev)) && !(next && isLetter(next))) isolatedGreek++;
      }
    }
  }
  const greekIsProse = letters > 0 && greek / letters > 0.3;
  return { chars: nonSpace, garbled, garbledDistinct: garbledCodes.size, mathSymbols: math + (greekIsProse ? 0 : isolatedGreek) };
}

/** A superscript counts only when it looks like maths: it contains a Latin or
 *  Greek letter, a maths symbol, or + = ′ −. Anything else — digits, circled
 *  numbers ②③, asterisks and daggers, private-use footnote markers — is a
 *  footnote or a superscript citation (Nature style runs a dozen a page; Chinese
 *  journals seven or eight ①②). The cost is that a bare numeric exponent x² is
 *  not counted; pages with real maths have plenty of other signal. */
const FORMULA_LIKE_SUPERSCRIPT_RE = /[A-Za-z\u0391-\u03c9\u2200-\u22ff+=′\u2212]/;

/** A flattened script: on the same line as the preceding run, noticeably smaller,
 *  off the baseline, adjacent, and short. pdf.js splits items whenever the font
 *  or size changes, so a TeX superscript is naturally its own run. */
function countScripts(items: PdfTextItemLike[]): number {
  let count = 0;
  let prev: { x: number; y: number; w: number; h: number } | null = null;
  for (const it of items) {
    const t = it.transform;
    const str = it.str.trim();
    if (!t || t.length < 6 || !it.height || it.height <= 0 || !str) { prev = null; continue; }
    // Rotated or slanted text has no meaningful baseline.
    if (Math.abs(t[1]!) > 1e-3 || Math.abs(t[2]!) > 1e-3) { prev = null; continue; }
    const cur = { x: t[4]!, y: t[5]!, w: it.width ?? 0, h: it.height };
    if (prev && [...str].length <= 4 && cur.h <= prev.h * 0.85) {
      const dy = cur.y - prev.y;
      const gap = cur.x - (prev.x + prev.w);
      const adjacent = gap > -prev.h * 0.5 && gap < prev.h * 0.6;
      const offset = Math.abs(dy) >= prev.h * 0.12 && Math.abs(dy) <= prev.h * 0.75;
      if (adjacent && offset) {
        const superscript = dy > 0;
        if (!superscript || FORMULA_LIKE_SUPERSCRIPT_RE.test(str)) count++;
        // A script is usually followed by a return to the baseline: keep the
        // baseline run as the comparison point, advancing x past the script.
        prev = { x: prev.x, y: prev.y, h: prev.h, w: cur.x + cur.w - prev.x };
        continue;
      }
    }
    prev = cur;
  }
  return count;
}

/**
 * Does a page of already-extracted plain text look garbled? Same character
 * thresholds as isGarbledPage, without the TextItem geometry. Useful for
 * per-page warnings when the document-level PdfTextLayerIssues only tells you
 * how many pages are affected, not which ones.
 */
export function plainTextLooksGarbled(text: string): boolean {
  const counts = countChars(text);
  return counts.garbled >= GARBLED_PAGE_CHARS && counts.garbledDistinct >= GARBLED_PAGE_DISTINCT;
}

export function assessPdfPageText(items: PdfTextItemLike[]): PdfPageTextQuality {
  const counts = countChars(items.map((it) => it.str).join(' '));
  return { ...counts, scripts: countScripts(items) };
}

/** Document-level threshold: a short document hits on one page; a long one has to
 *  show a pattern (≥2 pages and ≥ the given ratio) — a single maths page in a
 *  300-page book is not worth re-processing the book for. */
function enoughPages(hit: number, pages: number, ratio: number): boolean {
  if (hit === 0) return false;
  if (pages <= 4) return true;
  return hit >= Math.max(2, Math.ceil(pages * ratio));
}

export function isMathPage(q: PdfPageTextQuality): boolean {
  return q.mathSymbols + q.scripts >= MATH_PAGE_SCORE;
}

export function isGarbledPage(q: PdfPageTextQuality): boolean {
  return q.garbled >= GARBLED_PAGE_CHARS && q.garbledDistinct >= GARBLED_PAGE_DISTINCT;
}

/**
 * Health check for a whole PDF's text layer. Returns null when there is nothing
 * worth mentioning — which is most documents. Input is the same per-page pdf.js
 * TextItems that buildPdfTextMap takes, not the assembled text.
 */
export function assessPdfTextLayer(pageItems: PdfTextItemLike[][]): PdfTextLayerIssues | null {
  const pages = pageItems.length;
  if (pages === 0) return null;
  let mathPages = 0;
  let garbledPages = 0;
  for (const items of pageItems) {
    const q = assessPdfPageText(items);
    if (isMathPage(q)) mathPages++;
    if (isGarbledPage(q)) garbledPages++;
  }
  const math = enoughPages(mathPages, pages, 0.05);
  const garbled = enoughPages(garbledPages, pages, 0.03);
  if (!math && !garbled) return null;
  return { mathPages: math ? mathPages : 0, garbledPages: garbled ? garbledPages : 0, pages };
}

/** Serialize for frontmatter. Wrapped in an object on purpose: a bare JSON array
 *  hits the YAML frontmatter parser's inline-array branch. */
export function encodePdfTextLayerIssues(issues: PdfTextLayerIssues): string {
  return JSON.stringify({ v: issues });
}

export function decodePdfTextLayerIssues(raw: unknown): PdfTextLayerIssues | undefined {
  if (typeof raw !== 'string' || !raw.startsWith('{')) return undefined;
  try {
    const v = (JSON.parse(raw) as { v?: Partial<PdfTextLayerIssues> }).v;
    if (!v || typeof v.pages !== 'number') return undefined;
    const mathPages = Number(v.mathPages) || 0;
    const garbledPages = Number(v.garbledPages) || 0;
    if (mathPages === 0 && garbledPages === 0) return undefined;
    return { mathPages, garbledPages, pages: v.pages };
  } catch {
    return undefined;
  }
}

// ── Scanned-document test (is there text at all?) ───────────────────────────
// A real text layer runs far above this per-page average. Pages below
// BLANK_PAGE_CHARS count as blank, and blank must be the majority before a
// document is called scanned — a slide-style PDF with few words per page still
// clears the bar on most pages and is not mistaken for a scan.

export const MIN_CHARS_PER_PDF_PAGE = 100;
export const BLANK_PAGE_CHARS = 20;
export const BLANK_PAGE_RATIO_FOR_SCAN = 0.6;

/** Does the output of buildPdfTextMap look like a scan (no usable text layer)? */
export function pdfLooksScanned(map: { text: string; pages: readonly { start: number; end: number }[] }, pageCount: number): boolean {
  const blankPages = map.pages.filter((p) => p.end - p.start < BLANK_PAGE_CHARS).length;
  return map.text.length < pageCount * MIN_CHARS_PER_PDF_PAGE
    && blankPages / pageCount >= BLANK_PAGE_RATIO_FOR_SCAN;
}
