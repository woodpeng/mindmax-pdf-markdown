// PDF text layer → canonical text.
//
// Deterministic by construction: the same items always produce the same text,
// on any engine and platform. That property is what lets a caller store an
// annotation as a character offset and still find it later. Two different
// assemblies of the same PDF would put the same highlight in two places, so
// build the text here rather than in the caller — and bump
// CANONICAL_TEXT_VERSION when the output changes (see src/index.ts).

import { outlineSectionForPage, type PdfOutlineEntry } from './outline.js';
import { detectTables, type TableBlock, type TableItemLike } from './table.js';

/** Subset of pdf.js TextItem the mapping depends on. Geometry fields are
 *  optional: when present (real PDF extraction from pdf.js), buildPdfTextMap
 *  reconstructs paragraphs from the page layout; when absent (plain-text
 *  callers and tests), it falls back to the legacy one-newline-per-EOL
 *  assembly so those callers see byte-identical output. */
export interface PdfTextItemLike {
  str: string;
  hasEOL?: boolean;
  /** pdf.js transform matrix [a,b,c,d,e,f]: e (index 4) = x, f (index 5) = y
   *  baseline, both in user space. */
  transform?: number[];
  /** Horizontal advance width of the item, same units as transform x. */
  width?: number;
  /** Glyph box height (≈ font size), same units as transform y. */
  height?: number;
  /** pdf.js TextItem.fontName — the font's internal loadedName ("g_d0_f1"),
   *  an IDENTITY, not a descriptive name: it never spells out "Bold". Used
   *  only to tell a line's font APART from the document's dominant body font
   *  (a bold/italic heading loads as a different font), which is how same-size
   *  headings are found. Both sides must pass it or the two assemblies drift. */
  fontName?: string;
  /** Tagged-PDF `/Artifact` marked content — running headers, footers, page
   *  numbers, watermarks the producer itself declared to be layout rather than
   *  content (see collectPdfArtifactFlags). Dropped outright when set;
   *  untagged PDFs leave it undefined and fall back to the geometric furniture
   *  pass. Both sides must resolve it identically or the assemblies drift. */
  artifact?: boolean;
}

/** Character range [start, end) in the final text. Empty ranges mean the
 *  item's characters were trimmed away entirely. */
export interface PdfTextRange {
  start: number;
  end: number;
}

/** Where an item's characters landed in the final text. When page/document
 *  trimming cut characters off the item's front, `srcStart` is the offset of
 *  the first surviving character within the item's (normalized) `str` — the
 *  mapping back from a text offset to an item's own characters needs it. */
export interface PdfItemTextRange extends PdfTextRange {
  srcStart: number;
  /** Offsets into the item's `str`, inside the span the item contributes,
   *  whose characters were squeezed out of the text rather than trimmed off
   *  an end — pdf.js's tracking spaces in letter-spaced type ("基 金 项 目"),
   *  control codes. Sorted. Absent when nothing was squeezed, which is the
   *  common case: the item's text is then exactly `str.slice(srcStart)`.
   *  Read it through pdfItemStrOffset / pdfItemTextOffset. */
  squeezed?: number[];
}

/** Offset into the item's `str` of the item's k-th character in the text
 *  (k = end - start gives the end of the span). */
export function pdfItemStrOffset(item: PdfItemTextRange, k: number): number {
  let at = item.srcStart + k;
  for (const cut of item.squeezed ?? []) if (cut <= at) at++;
  return at;
}

/** Inverse of pdfItemStrOffset: how many of the item's text characters lie
 *  before `strOffset` in its `str`, clamped to the item's span. */
export function pdfItemTextOffset(item: PdfItemTextRange, strOffset: number): number {
  let k = strOffset - item.srcStart;
  for (const cut of item.squeezed ?? []) if (cut < strOffset) k--;
  return Math.min(Math.max(k, 0), item.end - item.start);
}

export interface PdfPageTextMap extends PdfTextRange {
  /** One range per input item, in item order (same index as getTextContent). */
  items: PdfItemTextRange[];
}

export interface PdfTextMap {
  text: string;
  pages: PdfPageTextMap[];
}

const clampRange = (r: PdfTextRange, shift: number, max: number): PdfTextRange => ({
  start: Math.min(Math.max(r.start - shift, 0), max),
  end: Math.min(Math.max(r.end - shift, 0), max),
});

/**
 * Build the canonical text for a PDF from per-page text items, tracking where
 * every page and item lands in the final string.
 *
 * Two assembly modes, chosen by whether the items carry layout geometry:
 *  - Geometry present (real pdf.js extraction): reconstruct paragraphs from the
 *    page layout — soft-wrapped lines are joined, true paragraph boundaries
 *    become '\n\n', and paragraphs that run across a page break are stitched
 *    back together. See buildGeomTextMap.
 *  - Geometry absent (plain-text callers / tests): the legacy assembly — each
 *    item contributes `str` (\r\n and lone \r normalized to \n) plus '\n' when
 *    hasEOL; pages are trimmed, joined with '\n\n', and the whole is trimmed.
 *
 * Pass FULL pdf.js TextItems, not a projection of them: the geometry fields are
 * what select the first mode, and dropping any of them silently falls back to
 * the legacy assembly — different text, same input.
 */
export function buildPdfTextMap(pages: PdfTextItemLike[][]): PdfTextMap {
  const hasGeometry = pages.some((pg) => pg.some((it) => Array.isArray(it.transform) && it.transform.length >= 6));
  return hasGeometry ? buildGeomTextMap(pages) : buildLegacyTextMap(pages);
}

function buildLegacyTextMap(pages: PdfTextItemLike[][]): PdfTextMap {
  // Per page: raw concatenation with item ranges, then trim with offset bookkeeping.
  const pageTexts: string[] = [];
  const pageItems: PdfItemTextRange[][] = [];

  for (const items of pages) {
    let raw = '';
    const ranges: PdfTextRange[] = [];
    for (const item of items) {
      const str = item.str.replace(/\r\n?/g, '\n');
      const start = raw.length;
      raw += str;
      ranges.push({ start, end: raw.length });
      if (item.hasEOL) raw += '\n';
    }
    const trimmed = raw.trim();
    const lead = trimmed.length === 0 ? 0 : raw.indexOf(trimmed[0]!);
    pageTexts.push(trimmed);
    pageItems.push(ranges.map((r) => ({
      ...clampRange(r, lead, trimmed.length),
      srcStart: Math.min(Math.max(lead - r.start, 0), r.end - r.start),
    })));
  }

  // Join pages, then trim the whole text (leading/trailing blank pages leave
  // '\n\n' runs at the edges) — shift every range accordingly.
  const joined = pageTexts.join('\n\n');
  const text = joined.trim();
  const lead = text.length === 0 ? 0 : joined.indexOf(text[0]!);

  const outPages: PdfPageTextMap[] = [];
  let base = 0;
  for (let i = 0; i < pageTexts.length; i++) {
    const pageLen = pageTexts[i]!.length;
    const page: PdfPageTextMap = {
      ...clampRange({ start: base, end: base + pageLen }, lead, text.length),
      items: pageItems[i]!.map((r) => ({
        ...clampRange({ start: base + r.start, end: base + r.end }, lead, text.length),
        srcStart: r.srcStart + Math.min(Math.max(lead - (base + r.start), 0), r.end - r.start),
      })),
    };
    outPages.push(page);
    base += pageLen + 2; // '\n\n' separator
  }

  return { text, pages: outPages };
}

// ── Geometry-aware paragraph reconstruction ─────────────────────────────────
// A PDF text layer is just positioned glyph runs: pdf.js sets hasEOL at every
// *visual* line end, which is a line-wrap signal, not a paragraph signal. The
// legacy assembly turned each wrap into '\n' (a Markdown soft break) and each
// page into '\n\n', so a whole page collapsed into one paragraph and a
// paragraph spanning a page break got split. Here we recover real paragraphs
// from the layout: line spacing, first-line indent, short/sentence-final lines,
// list markers, and page-boundary continuation.

/** No space is inserted when joining across a CJK/Japanese/Korean boundary.
 *  The radical blocks (⺀-⿟) are in the list on purpose: PDF producers
 *  routinely encode an ordinary hanzi as the Kangxi radical that looks the same
 *  (U+2F3C for 心), and without them every such line join gained a space. */
const CJK_JOIN_RE = /[⺀-⿟　-〿぀-ヿ㐀-䶿一-鿿豈-﫿＀-￯가-힯]/;
/** Sentence-terminating punctuation (optionally trailed by closing marks). */
const SENTENCE_END_RE = /[。．.!！?？…]["'”’）)\]】」』]*$/;
/** A line that begins a list item or a numbered/chapter heading starts a block.
 *  "3.1" and "1.5 倍" open with a number and a dot too, but a section number
 *  or a decimal is not an item marker. */
const LIST_MARKER_RE = /^(?:[-–—•·*‣▪◦]\s|\d{1,3}[.)、）](?!\d)\s?|[（(]\s*\d{1,3}\s*[)）]|[一二三四五六七八九十]+[、.]\s?|第\s*[0-9一二三四五六七八九十百千]+\s*[章节部分回讲篇课编卷])/;
/** Bullet markers, normalized to Markdown's '- ' on emit (Markdown does not
 *  recognize '•'/'▪'/'·', so an un-normalized bullet list renders as prose).
 *  The separator class is every space a PDF may emit but never a newline. */
const BULLET_MARKER_RE = /^[-–—•·*‣▪◦][ \t\u00a0\u3000]+/;
/** Level given to a same-size heading found by font/isolation rather than by
 *  size tier — there is no size ladder to rank it on. */
const SAME_SIZE_HEADING_LEVEL = 2;

/** A title never ends mid-phrase on a function word. Scientific PDFs open with
 *  legal/attribution prose set in the same size as section heads ("Provided
 *  proper attribution is provided, Google hereby grants permission to"), and
 *  the size gate alone promotes it. Only applied to long lines: a short wrapped
 *  title half ("… Technology and") legitimately ends on one. */
const DANGLING_WORD_RE = /\b(?:to|of|and|or|the|a|an|in|for|with|on|at|by|from|as|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|shall|should|can|could|may|might|must|not|no|but|if|then|than|so|such|when|while|where|that|which|who|whom|this|these|those|it|its|their|our|your|my|me|him|her|us|them|he|she|they|we|you)$/i;
/** Attention-map / heatmap axis labels ("Input-Input Layer5", "<pad>…") that
 *  figure pages scatter at heading sizes. A real section head is never one of
 *  these. */
const FIGURE_LABEL_RE = /^(?:<pad>|<eos>|<unk>|<sep>|<cls>|<mask>)|^[A-Za-z]+[-–—][A-Za-z]+(?:[-–—][A-Za-z]+)*\s+Layer\s*\d+\b|\bLayer\s*\d+\s*$/i;
/** Past this length a dangling function word is mid-sentence prose, not a
 *  wrapped title half (the longest real title half seen in the wild is ~50). */
const PROSE_LINE_CHARS = 55;

/** Text that may open a section. Shared by both heading passes so a prose
 *  sentence, a formula, or a figure's axis label is never promoted — whatever
 *  its font size or isolation says. */
function looksLikeHeadingText(text: string): boolean {
  if (!text) return false;
  if (/[=≈≤≥±×÷∑∏√∫]/.test(text)) return false;   // formula / equation
  // Mostly brackets and symbols: a formula's stretched delimiters ("( )v"
  // around a binomial) are drawn three times body size. A ratio, not a count,
  // so a one-character heading ("序") still stands.
  const glyphs = text.replace(/\s+/g, '');
  if ((glyphs.match(/[\p{L}\p{N}]/gu) ?? []).length < 0.5 * glyphs.length) return false;
  if (/@/.test(text)) return false;                // emails in author bylines
  if (text.length >= PROSE_LINE_CHARS && DANGLING_WORD_RE.test(text)) return false;
  if (FIGURE_LABEL_RE.test(text)) return false;    // figure annotation
  if (/^[a-z]+$/.test(text)) return false;         // "we", "application"
  return true;
}

/** A line opening a footnote: a superscript run, a reference symbol, an
 *  enclosed numeral, or a parenthesised number. Plain "12 " also opens one,
 *  but only on a line set smaller than body copy (FOOTNOTE_NUMBER_RE) —
 *  otherwise every numbered list item at the foot of a page would become a
 *  footnote. Enclosed numerals (①⑴⒈ ❶➀ ㉑㊱) are how Chinese and Japanese
 *  typesetting numbers its notes; without them a page of notes had no
 *  opener at all and ran together into one paragraph. */
const FOOTNOTE_MARKER_RE = /^(?:[¹²³⁰-₟]+|[*†‡§¶]{1,3}|[①-⓿❶-➓㉑-㉟㊱-㊿]|[（([【]\s*\d{1,3}\s*[)）\]】])/;
const FOOTNOTE_NUMBER_RE = /^\d{1,3}[.)]?[ \t ]/;
/** A line that is nothing but a page number, in any of the shapes a running
 *  footer uses. Anchored at both ends: "第 3 页 · 教育哲学导论" is a running
 *  header carrying a title, and must be judged by the repeat rule instead. */
const PAGE_NUMBER_RE = /^[-–—([【]?\s*(?:\d{1,4}|[ivxlcdm]{1,7}|[IVXLCDM]{1,7}|第\s*\d{1,4}\s*页|page\s*\d{1,4}(?:\s*(?:of|\/)\s*\d{1,4})?|\d{1,4}\s*\/\s*\d{1,4})\s*[-–—)\]】]?$/i;

/** How far in from its column's left edge a note line may start: a
 *  first-line indent plus a hanging marker. */
const NOTE_INSET_EMS = 4;
/** Furniture rules only run on pages with enough lines to measure a normal
 *  line spacing against. */
const MIN_LINES_FOR_FURNITURE = 4;
/** How many lines at each page edge may be furniture (title + page number). */
const MAX_EDGE_LINES = 2;
/** A furniture line must be set clear of the body block by this much more
 *  than the page's normal leading. */
const EDGE_SEP_RATIO = 1.3;
/** Same text at the same page edge on this many pages = running furniture.
 *  Capped at the document's page count, so a 2-page handout still gets the
 *  signal (`min(3, pages)`, and never on a single-page document). */
const MIN_FURNITURE_REPEATS = 3;
/** Up to this many pages, two repeats are enough for the repeat rule. Journals
 *  alternate recto/verso running heads and skip the opening page, so a 6-page
 *  paper prints its verso head twice — measured in the wild, spliced into the
 *  middle of the sentence that ran across the page break. */
const SHORT_DOC_PAGES = 8;
/** How far a repeated line's baseline may wander from page to page and still
 *  count as printed at the same place. Running heads are placed by the
 *  producer, not by the text flow, so in practice they do not move at all. */
const FURNITURE_POS_TOL = 3;
/** The repeat rule may not remove more than this share of the document's
 *  characters. On a dense page furniture is 2-3% of the text, but on a sparse
 *  one — a slide deck, a short handout — the same running foot can be a tenth
 *  of it, so the cap has to sit well above the typical case: it is there to
 *  catch the rule misfiring wholesale (a document that repeats its body copy),
 *  not to second-guess it. Past this the rule is abandoned, not trimmed. */
const MAX_FURNITURE_SHARE = 0.25;
/** Longer than this and it is body copy that happens to sit at the edge. */
const MAX_FURNITURE_CHARS = 120;
/** Rotated items — watermarks, vertical sidebars, stamps — are layout,
 *  not reading matter, when the page is otherwise upright. Past this share the
 *  page IS the rotated one (landscape content, a rotated scan) and its text
 *  must be kept. */
const MAX_ROTATED_SHARE = 0.5;
/** Past this share of a page's characters, `/Artifact` tagging is mis-applied
 *  rather than descriptive, and gets ignored (mirrors collectPdfArtifactFlags). */
const MAX_ARTIFACT_SHARE = 0.4;
/** An inner gap wider than this many ems is a tab stop, not word spacing:
 *  justified CJK and Latin text alike stretch a space to about one em. */
const TAB_GAP_EMS = 3;
/** A short last run set off by more than any word space is a right-aligned
 *  tag: "(9)" after its formula, a page number in a contents line. */
const TAG_GAP_EMS = 1.5;
const MAX_TAG_CHARS = 6;
/** Heading sizes within this many points are one tier of the size ladder. */
const HEADING_TIER_TOL = 0.6;
/** Two lines of one wrapped heading sit at most this many of its ems apart
 *  (~1.36–1.75 in the wild); separate headings stacked, ≥2.1. */
const HEADING_WRAP_LEADING = 1.9;

const isCjkChar = (c: string | undefined): boolean => !!c && CJK_JOIN_RE.test(c);
const endsSentence = (t: string): boolean => SENTENCE_END_RE.test(t);

/** Section/chapter numbering at the very start of a line → heading level
 *  (1 = top). Only consulted for a line already judged a heading candidate —
 *  larger than body text, or body-size but isolated — so ordinary prose that
 *  merely opens with "第四部分…" or a decimal like "1.5 倍" never becomes a
 *  heading. `null` = no numbering pattern. */
function numberingLevel(text: string): number | null {
  const dotted = /^(\d{1,3}(?:\.\d{1,3})+)(?![\d.])/.exec(text);
  if (dotted) return Math.min((dotted[1]!.match(/\./g)?.length ?? 0) + 1, 6);
  if (/^第\s*[0-9一二三四五六七八九十百千零〇两]+\s*(?:[部篇卷编章回讲课])/.test(text)) return 1;
  if (/^第\s*[0-9一二三四五六七八九十百千零〇两]+\s*小?节/.test(text)) return 2;
  if (/^(?:chapter|part)\b/i.test(text)) return 1;
  if (/^(?:section|appendix)\b/i.test(text)) return 2;
  return null;
}

/** Doc-wide facts a heading judgement needs beyond the line itself. */
interface HeadingCtx {
  docBodyH: number;
  /** The page's own body size when the page clearly has one (pageBodyHeight),
   *  else 0. */
  pageBodyH: number;
  /** The line is one of a run set solid at one size (setSolidRuns): running
   *  text, whatever its size says. */
  inSolidRun: boolean;
  /** Every font carrying a real share of the document's characters. Body copy
   *  routinely spans several font subsets (Latin / CJK / punctuation load as
   *  separate fonts), so "not the single most common font" is NOT evidence of
   *  a heading — "not one of the body fonts at all" is. */
  docBodyFonts: Set<string>;
  m: PageMetrics;
  /** Another line on the page carries the same marker family at the same x —
   *  the line is one item of a list, so its numbering proves nothing. */
  inSeries: boolean;
  /** The line's text repeats at the same page edge across the document
   *  (running header/footer), so it is furniture, never a heading. */
  repeatedEdge: boolean;
}

/** A heading stands alone: it stops short of the right margin and has MEASURED
 *  air above and below, more than the page's normal line spacing. The air must
 *  be measured — an `Infinity` gap (first or last line of a page, column break)
 *  is absence of evidence, and counting it as air promoted a paragraph that
 *  merely continued onto a new page. This is the whole basis for calling a
 *  SAME-SIZE line a heading, so it is deliberately strict. */
function isIsolated(line: LineInfo, m: PageMetrics): boolean {
  const fh = line.fontH || m.medFontH || 1;
  if (line.endX >= m.bodyRight - 2 * fh) return false;   // ran to the margin → body copy
  if (m.medGap <= 0) return false;                       // single-line page → no evidence
  if (!Number.isFinite(line.gapAbove) || !Number.isFinite(line.gapBelow)) return false;
  return line.gapAbove > 1.25 * m.medGap && line.gapBelow > 1.25 * m.medGap;
}

/**
 * Markdown heading level for a visual line, or `null` when it is body text.
 *
 * Two independent gates, because not every PDF sets headings larger:
 *  1. SIZE — a line ≥12% taller than the document's dominant body height.
 *     Numbering fixes the level (第X章 → #, 1.1 → ##, 1.1.1 → ###); an
 *     unnumbered larger line (引言 / 结论) takes a size tier.
 *  2. SAME SIZE — a line set at body size is a heading only on much stronger
 *     evidence: it must be isolated (see isIsolated) AND either be set in a
 *     different font from body copy (bold/italic headings load as their own
 *     font — this is why `fontName` is threaded through) or carry chapter
 *     numbering that is not part of a list series on the page.
 *
 * Lines that end in sentence/clause punctuation or run long are prose under
 * both gates — this is what keeps a same-size "第四部分系统比较…" paragraph
 * from being mis-promoted.
 */
function headingLevel(line: LineInfo, ctx: HeadingCtx): number | null {
  if (!line.hasGeom || line.fontH <= 0 || ctx.docBodyH <= 0) return null;
  if (line.text.length > 80) return null;
  if (/[。，、；：,;.]$/.test(line.text)) return null;
  if (!looksLikeHeadingText(line.text)) return null;
  if (ctx.repeatedEdge) return null;
  const n = numberingLevel(line.text);
  // Size is measured against the body copy around the line. Usually that is
  // the document's, but a document can carry more small print than body —
  // an annotated edition's index and notes outweigh its 10pt text, and
  // against their 8pt every line of that text "stood out" as a heading.
  // A page set in a larger body than the document's is read on its own.
  // Nor does size alone make a heading of a line in a paragraph's worth of
  // lines at that size (setSolidRuns): the other tests below still may.
  const bodyH = Math.max(ctx.docBodyH, ctx.pageBodyH);
  if (line.fontH >= bodyH * 1.12 && !ctx.inSolidRun) {
    if (n !== null) return n;
    return line.fontH >= bodyH * 1.5 ? 1 : line.fontH >= bodyH * 1.28 ? 2 : 3;
  }
  if (isCapsSectionHead(line, ctx.m, bodyH)) return CAPS_SECTION_LEVEL;
  if (line.fontH < bodyH * 0.95) return null;     // footnotes / captions
  // Numbered, with the numbering set in a type of its own, and stopping
  // short of the margin: "3.1.1 实验配置" in bold numerals at body size, set
  // solid between the lines around it, where isolation has nothing to see.
  if (n !== null && line.leadFont && ctx.docBodyFonts.size > 0 && !ctx.docBodyFonts.has(line.leadFont)
    && !looksWrapped(line, ctx.m)) return n;
  if (!isIsolated(line, ctx.m)) return null;
  if (ctx.docBodyFonts.size > 0 && line.fontName && !ctx.docBodyFonts.has(line.fontName)) {
    return n ?? SAME_SIZE_HEADING_LEVEL;
  }
  if (n !== null && !ctx.inSeries) return n;
  return null;
}

/** "I. INTRODUCTION", "4. DISCUSSION AND CONCLUSIONS": a numbered section
 *  head set in capitals, the way IEEE, REVTeX and AASTeX journals set them —
 *  at body size, or in small caps that measure SHORTER than body type, so
 *  neither the size gate nor the same-size gate sees them. What gives them
 *  away is the setting: centred in the column, or set off by air above and
 *  indented. The air below often cannot be measured (the head sits at a
 *  column top, or its section starts in the next column), so it is not
 *  asked for. A numbered line of capitals in prose is rare; centred or
 *  indented under a gap, it is a heading. */
function isCapsSectionHead(line: LineInfo, m: PageMetrics, bodyH: number): boolean {
  if (line.fontH < bodyH * 0.75 || !CAPS_SECTION_RE.test(line.text)) return false;
  const fh = line.fontH;
  const indent = line.startX - m.bodyLeft;
  const centred = Math.abs(indent - (m.bodyRight - line.endX)) <= 2 * fh;
  const aired = Number.isFinite(line.gapAbove) && m.medGap > 0 && line.gapAbove > 1.25 * m.medGap;
  return (centred && indent >= 2 * fh) || (aired && (centred || indent >= 2 * fh));
}
/** Roman, arabic or letter numbering, then capitals only (three in a row at
 *  least), no lower case anywhere. */
const CAPS_SECTION_RE = /^(?:[IVXL]{1,6}|\d{1,2}|[A-Z])\.\s+(?=[^\p{Ll}]*\p{Lu}{3})[^\p{Ll}]+$/u;
const CAPS_SECTION_LEVEL = 2;
const LETTERED_SUBSECTION_RE = /^[A-Z]\.\s+\p{Lu}/u;

/** Is this line one of several similarly-marked lines sharing an x on the page
 *  (1. / 2. / 3. …)? A series is a list; a lone numbered line may be a heading. */
function inMarkerSeries(line: LineInfo, lines: LineInfo[]): boolean {
  if (!line.hasGeom || !LIST_MARKER_RE.test(line.text)) return false;
  const tol = 0.5 * (line.fontH || 1);
  let siblings = 0;
  for (const l of lines) {
    if (l === line || !l.hasGeom || !LIST_MARKER_RE.test(l.text)) continue;
    if (Math.abs(l.startX - line.startX) <= tol) siblings++;
  }
  return siblings >= 1;
}

interface Geom { x: number; y: number; w: number; h: number; }

function geomOf(it: PdfTextItemLike): Geom | null {
  const t = it.transform;
  if (!t || t.length < 6) return null;
  const h = it.height && it.height > 0 ? it.height : (Math.hypot(t[2]!, t[3]!) || Math.abs(t[3]!) || 0);
  return { x: t[4]!, y: t[5]!, w: it.width ?? 0, h };
}

interface LineInfo {
  idxs: number[];      // item indices making up this visual line
  spans: number[];     // start offset of each item's str within `C`
  C: string;           // concatenated normalized strs of the line
  lead: number;        // leading-whitespace length in `C`
  trail: number;       // trailing-whitespace length in `C` (bumped +1 to de-hyphenate)
  text: string;        // trimmed line text
  empty: boolean;
  hasGeom: boolean;
  startX: number; endX: number; baseline: number; fontH: number;
  /** Widest horizontal gap between two inked runs of the line. Wrapped prose
   *  is set solid; a wide gap is a tab stop or a right-aligned tag — the
   *  equation number of a display formula, a TOC page number — and means the
   *  line's own text ended well short of where its ink does. */
  maxGap: number;
  /** Gap before the line's last run of ink when that run is short — a
   *  right-aligned tag: an equation number, a TOC page number. 0 otherwise. */
  tagGap: number;
  /** Length of the line the ink covers, gaps left out. */
  inkWidth: number;
  fontName: string;    // char-weighted dominant font id of the line ('' when unknown)
  leadFont: string;    // font of the line's first inked run — where numbering sits
  gapAbove: number;    // baseline gap to the previous non-empty line (Infinity at a boundary)
  gapBelow: number;
  sepBefore: string;   // separator before this line (set in the pairing pass)
  rawLevel: number;    // heading level from this line alone (0 = body copy)
  hLevel: number;      // markdown heading level after the doc-wide size ladder
  headingCont: boolean; // second/third line of a heading that wrapped — no own '#'
  prefix: string;      // emitted before the content ('## ', '- '); maps to no item
  skip: number;        // chars of the trimmed content the prefix replaces
  drop: boolean;       // running header/footer/watermark — never emitted
  footnote: boolean;   // page-foot note: its own block, never joined to body
  atFoot: boolean;     // in the note zone under the body block: emitted after the body
  table: TableBlock | null;  // emitted as part of a markdown table instead
}

interface PageMetrics { bodyLeft: number; bodyRight: number; medFontH: number; medGap: number; }

/** Metrics of the text column a line sits in. Every test on a line reads
 *  that line's own column: at a column switch, or under a caption spanning
 *  both columns, the line above sits in another one, and measured against
 *  the current column's right edge a full-width caption "ran to the margin". */
type MetricsOf = (l: LineInfo) => PageMetrics;

/** Doc-wide facts page assembly reads. */
interface DocStyle {
  /** Body text size (dominantHeight). */
  bodyH: number;
  /** Paragraphs open with a first-line indent (opensParagraphsIndented). */
  indentOpens: boolean;
}

const EMPTY_METRICS: PageMetrics = { bodyLeft: 0, bodyRight: 0, medFontH: 0, medGap: 0 };

interface PageAsm {
  text: string;
  items: PdfItemTextRange[];
  empty: boolean;
  first?: LineInfo;
  last?: LineInfo;
  /** Metrics of the text column `first` / `last` sit in. */
  firstMetrics: PageMetrics;
  lastMetrics: PageMetrics;
  /** Block still open at the page's last line — a reference list or a quote
   *  that runs across a page break continues into the next page's first line. */
  blockAtEnd: BlockState | null;
  /** The page's text ends with a footnote block or a table rather than with
   *  body copy. The body paragraph may well run on to the next page, but its
   *  last line is no longer the last thing in this page's text, so nothing can
   *  be stitched onto it without gluing the note or table to the next page. */
  endsWithBlock: boolean;
}

/** Key for spotting running headers/footers: the same furniture repeats at the
 *  page edge with only the page number changing. The size bucket is part of the
 *  key on purpose — a chapter title printed as a running header is set much
 *  smaller than the same title on its opening page, so keying on text alone
 *  would suppress the real heading along with the furniture. */
const edgeKey = (line: LineInfo): string =>
  `${Math.round((line.fontH || 0) * 2) / 2}|${line.text.replace(/\s+/g, ' ').replace(/\d+/g, '#').trim()}`;

/** Fonts carrying at least a tenth of the document's characters. Body copy
 *  routinely spans several font subsets (Latin / CJK / punctuation load
 *  separately), so this is a SET, and "not the most common font" is never
 *  evidence of anything on its own — "not a body font at all" is. */
function dominantFonts(entries: Iterable<{ font: string | undefined; chars: number }>): Set<string> {
  const weights = new Map<string, number>();
  let total = 0;
  for (const { font, chars } of entries) {
    if (!font || chars === 0) continue;
    total += chars;
    weights.set(font, (weights.get(font) ?? 0) + chars);
  }
  return new Set([...weights].filter(([, w]) => w >= total * 0.1).map(([name]) => name));
}

/** The document's body text size: the glyph height that sets the most line
 *  length. Neither lines nor characters measure that. Lines don't: a
 *  regression table breaks into dozens of two-character lines, and a CJK
 *  journal paper's 9pt notes and tables set 607 lines against 377 of 10.5pt
 *  body. Characters don't either, because scripts differ in density: a
 *  bilingual paper's English abstract and reference list pack twice the
 *  characters per line that its CJK body does, and outweighed it. Either
 *  way every body line read as "larger than body" and became a heading.
 *  Inked length is script-neutral: 147k pt of 10.5pt against 52k of 9pt in
 *  the first paper, 48k against 33k in the second. */
function dominantHeight(lines: LineInfo[]): number {
  const weights = new Map<number, number>();
  for (const l of lines) {
    if (l.empty || !l.hasGeom || l.fontH <= 0) continue;
    weights.set(l.fontH, (weights.get(l.fontH) ?? 0) + l.inkWidth);
  }
  let best = 0;
  let bestChars = 0;
  for (const [h, w] of weights) if (w > bestChars) { bestChars = w; best = h; }
  return best;
}

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)]!;
}

function buildLines(items: PdfTextItemLike[], strs: string[]): LineInfo[] {
  // pdf.js only sets hasEOL where the producer emitted one. A figure page often
  // draws a real section head and the figure's own axis label in one run —
  // "Attention Visualizations" + "Input-Input Layer5" arrive as one hasEOL
  // group at different baselines and concatenate into a single bogus title.
  // Split those runs into visual rows before judging anything.
  const groups: number[][] = [];
  let cur: number[] = [];
  let curY = 0;
  let curH = 0;
  let curEnd = -Infinity;
  const flush = (): void => {
    if (cur.length > 0) groups.push(cur);
    cur = [];
    curY = 0;
    curH = 0;
    curEnd = -Infinity;
  };
  // A larger drawing at a fresh baseline is a new row (section head + the
  // figure title under it). A smaller one is a super/subscript riding the
  // same row — never split those off, or "Illia Polosukhin∗" loses its
  // asterisk and the name alone looks like a heading. Same-size runs only
  // split on a real leading jump.
  const sameRow = (g: Geom): boolean => {
    const grows = g.h > curH * 1.15;
    const shrinks = g.h < curH * 0.85;
    const tol = grows
      ? 2.5
      : shrinks
        ? Math.max(8, 1.5 * curH)
        : Math.max(2.5, 0.3 * Math.max(curH, g.h));
    return Math.abs(g.y - curY) <= tol;
  };
  for (let i = 0; i < items.length; i++) {
    const g = geomOf(items[i]!);
    if (cur.length > 0 && g && !sameRow(g)) flush();
    if (cur.length === 0 && g) { curY = g.y; curH = g.h; }
    else if (g) curH = Math.max(curH, g.h);
    cur.push(i);
    if (g && strs[i]!.trim().length > 0) curEnd = Math.max(curEnd, g.x + g.w);
    if (items[i]!.hasEOL && !midLineEol(i, g)) flush();
  }
  flush();

  /** pdf.js also emits a blank, zero-width hasEOL item where the font or the
   *  text matrix changes mid-line — before an oblique minus sign ("v=m−t"),
   *  before the subscripts that follow a superscript ("Vᵀₙₓₙ"). It sits on
   *  the line's own row, right at its current end, and the text after it goes
   *  on along the row. Breaking there cut formulas into separate paragraphs.
   *  A real line end next to a column gutter fails the "right at the end"
   *  test: the next column starts a gutter away. */
  function midLineEol(i: number, g: Geom | null): boolean {
    if (!g || strs[i]!.trim().length > 0 || g.w > 0.5 || cur.length < 2) return false;
    const em = curH || g.h || 1;
    if (g.x < curEnd - em || g.x > curEnd + 0.5 * em) return false;
    const next = i + 1 < items.length ? geomOf(items[i + 1]!) : null;
    return !!next && sameRow(next) && next.x >= g.x - 0.5 * em;
  }

  return groups.map((idxs) => {
    let C = '';
    const spans: number[] = [];
    for (const i of idxs) { spans.push(C.length); C += strs[i]!; }
    const trimmed = C.trim();
    const empty = trimmed.length === 0;
    const lead = empty ? C.length : C.indexOf(trimmed[0]!);
    const trail = empty ? 0 : C.length - lead - trimmed.length;
    const geoms = idxs.map((i) => geomOf(items[i]!)).filter((g): g is Geom => g !== null);
    const hasGeom = geoms.length > 0;
    // The line's BOX comes only from items that put ink on the page. pdf.js
    // ends a line with a zero-width empty item that carries hasEOL, and that
    // item sits back at the block's marker column — counted in, it reported a
    // hanging-indented continuation as starting 18pt to the left of where it
    // does, which broke the third line of every wrapped list item away.
    const inkedIdxs = idxs.filter((i) => strs[i]!.trim().length > 0 && geomOf(items[i]!) !== null);
    const inked = inkedIdxs.map((i) => geomOf(items[i]!)!);
    const box = inked.length > 0 ? inked : geoms;
    let maxGap = 0;
    let inkWidth = 0;
    let reach = -Infinity;
    // The last run: inked items after the line's last gap wider than half
    // an em (letter and word spacing stay under it).
    let lastGap = 0;
    let lastChars = 0;
    const byX = inkedIdxs.map((i) => ({ i, g: geomOf(items[i]!)! })).sort((a, b) => a.g.x - b.g.x);
    for (const { i, g } of byX) {
      const gap = Number.isFinite(reach) ? g.x - reach : 0;
      maxGap = Math.max(maxGap, gap);
      if (gap > 0.5 * g.h) { lastGap = gap; lastChars = 0; }
      lastChars += strs[i]!.replace(/\s+/g, '').length;
      inkWidth += Math.max(0, g.x + g.w - Math.max(g.x, reach));
      reach = Math.max(reach, g.x + g.w);
    }
    const tagGap = lastChars <= MAX_TAG_CHARS ? lastGap : 0;
    // Dominant font AND dominant glyph height of the line, both weighted by
    // non-space character count. Neither may be a max/any: one CJK punctuation
    // item can carry a taller glyph box (and its own font subset) than the
    // words around it, and taking the max promoted a plain body line to a
    // heading because a single "?" measured 16pt against 11pt body copy.
    const fontWeights = new Map<string, number>();
    const heightWeights = new Map<number, number>();
    for (let k = 0; k < idxs.length; k++) {
      const i = idxs[k]!;
      const chars = strs[i]!.replace(/\s+/g, '').length;
      if (chars === 0) continue;
      const name = items[i]!.fontName;
      if (name) fontWeights.set(name, (fontWeights.get(name) ?? 0) + chars);
      const g = geomOf(items[i]!);
      if (g && g.h > 0) {
        const bucket = Math.round(g.h * 2) / 2;
        heightWeights.set(bucket, (heightWeights.get(bucket) ?? 0) + chars);
      }
    }
    let fontName = '';
    let bestFontChars = 0;
    for (const [name, w] of fontWeights) if (w > bestFontChars) { bestFontChars = w; fontName = name; }
    let fontH = 0;
    let bestHeightChars = 0;
    for (const [h, w] of heightWeights) {
      if (w > bestHeightChars || (w === bestHeightChars && h > fontH)) { bestHeightChars = w; fontH = h; }
    }
    return {
      idxs, spans, C, lead, trail, text: trimmed, empty, hasGeom,
      startX: hasGeom ? Math.min(...box.map((g) => g.x)) : 0,
      endX: hasGeom ? Math.max(...box.map((g) => g.x + g.w)) : 0,
      maxGap,
      tagGap,
      inkWidth,
      baseline: hasGeom ? box[0]!.y : 0,   // items in a line share ~one baseline
      // Whitespace-only lines have no weighted height; fall back to the max.
      fontH: fontH > 0 ? fontH : (hasGeom ? Math.max(...geoms.map((g) => g.h)) : 0),
      fontName,
      leadFont: inkedIdxs.length > 0 ? (items[inkedIdxs[0]!]!.fontName ?? '') : '',
      gapAbove: Infinity,
      gapBelow: Infinity,
      sepBefore: '',
      rawLevel: 0,
      hLevel: 0,
      headingCont: false,
      prefix: '',
      skip: 0,
      drop: false,
      footnote: false,
      atFoot: false,
      table: null,
    };
  });
}

// ── Page furniture ──────────────────────────────────────────────────────────
// Running headers, footers and page numbers are the single biggest source of
// extracted-text pollution, and they do two kinds of damage. The obvious one:
// their text lands in the middle of the prose — pdf.js emits them wherever the
// producer drew them, which is routinely at the END of the page's content
// stream, so a header is spliced into the last sentence of the page it heads.
// The quiet one: they sit outside the text block, so counting them into
// pageMetrics widens bodyLeft/bodyRight (measured 20pt each way in the wild)
// and every rule calibrated on those margins — first-line indent, "did this
// line run to the margin", heading isolation — drifts with them.
//
// So furniture is identified and dropped BEFORE any metric is taken, and it is
// identified geometrically (top/bottom by baseline), never by position in the
// item stream.

/** Page lines sorted top-to-bottom by baseline — the only order in which
 *  "first line on the page" means anything. */
function byBaseline(lines: LineInfo[]): LineInfo[] {
  return lines.filter((l) => !l.empty && l.hasGeom).sort((a, b) => b.baseline - a.baseline);
}

/**
 * The document's repeated furniture: lines that print the SAME text, in the
 * same size, at the same height, on page after page.
 *
 * This is the signal the whole problem is built on — a running head, a running
 * foot, a watermark and a stamp are all defined by recurring identically —
 * and it is strong enough to stand without the spacing evidence the edge rules
 * need. Which matters, because the two commonest failures are exactly the ones
 * spacing cannot see: a running head set in body type tight against the text
 * block, and a watermark printed BETWEEN body lines rather than outside them.
 *
 * Text is digit-normalized, so the page number inside a running head does not
 * make each page's copy unique. Position is compared as a spread rather than a
 * grid, so no line falls between quantization buckets, and only the baseline is
 * required to hold still — alternating recto/verso heads swap x every page.
 *
 * Corroboration, to keep repetition from eating repeated CONTENT (a form's
 * field labels, printed at the same place on fifty pages, are content): a
 * repeated line must also either sit outside its page's body block, or be set
 * differently from body copy. And if the rule as a whole would take more than
 * a few percent of the document, it is misfiring and gets dropped entirely.
 */
function repeatedFurniture(
  pageLines: LineInfo[][],
  docBodyH: number,
  bodyFonts: Set<string>,
): Set<LineInfo> {
  const pageCount = pageLines.filter((lines) => lines.some((l) => !l.empty && l.hasGeom)).length;
  if (pageCount < 2) return new Set();
  const needed = pageCount <= SHORT_DOC_PAGES ? 2 : MIN_FURNITURE_REPEATS;

  interface Entry { lines: LineInfo[]; pages: Set<number>; minY: number; maxY: number }
  const index = new Map<string, Entry>();
  let totalChars = 0;
  pageLines.forEach((lines, page) => {
    for (const l of lines) {
      if (l.empty || !l.hasGeom) continue;
      totalChars += l.text.length;
      if (l.text.length > MAX_FURNITURE_CHARS) continue;
      const key = edgeKey(l);
      const entry = index.get(key);
      if (!entry) index.set(key, { lines: [l], pages: new Set([page]), minY: l.baseline, maxY: l.baseline });
      else {
        entry.lines.push(l);
        entry.pages.add(page);
        entry.minY = Math.min(entry.minY, l.baseline);
        entry.maxY = Math.max(entry.maxY, l.baseline);
      }
    }
  });

  const repeated = new Set<LineInfo>();
  for (const entry of index.values()) {
    if (entry.pages.size < needed) continue;
    if (entry.maxY - entry.minY > FURNITURE_POS_TOL) continue;
    for (const l of entry.lines) repeated.add(l);
  }
  if (repeated.size === 0) return repeated;

  // The body block is what is left once the repeats are set aside — measured
  // per page, since a repeat sitting just above the text block on one page is
  // furniture there whatever it does elsewhere.
  const bodyRange = pageLines.map((lines) => {
    const ys = lines.filter((l) => !l.empty && l.hasGeom && !repeated.has(l)).map((l) => l.baseline);
    return ys.length > 0 ? { top: Math.max(...ys), bottom: Math.min(...ys) } : null;
  });

  const accepted = new Set<LineInfo>();
  let takenChars = 0;
  pageLines.forEach((lines, page) => {
    const range = bodyRange[page];
    for (const l of lines) {
      if (!repeated.has(l)) continue;
      const outside = range === null || l.baseline > range.top || l.baseline < range.bottom;
      const setApart = (docBodyH > 0 && l.fontH > 0 && Math.abs(l.fontH - docBodyH) > 0.15 * docBodyH)
        || (bodyFonts.size > 0 && !!l.fontName && !bodyFonts.has(l.fontName));
      if (!outside && !setApart) continue;
      accepted.add(l);
      takenChars += l.text.length;
    }
  });
  return totalChars > 0 && takenChars > MAX_FURNITURE_SHARE * totalChars ? new Set() : accepted;
}

/**
 * Mark running headers/footers on every page, and report which edge lines
 * repeat across the document (the heading pass still needs to know: a repeated
 * line that survives the drop rules must never be promoted to a heading).
 *
 * Two passes. First `repeatedFurniture`, which catches everything printed
 * identically page after page — the strong case. What is left for the edge
 * rules here is furniture whose TEXT changes from page to page, and so cannot
 * be recognised by repetition: a running head carrying the current section's
 * title, a footer with a date. Three signals, none sufficient alone:
 *  - REPEATED at the same edge, in the same size, on ≥3 pages (the page number
 *    inside it varies, so the key digit-normalizes);
 *  - SMALL: set smaller than body copy while the line it borders is body copy;
 *  - SEPARATED: set clear of the body block, with more air than the page's own
 *    leading.
 * A bare page number is furniture on its own. Otherwise it takes two: repeated
 * AND (separated OR small), or small AND separated.
 */
function dropFurniture(pageLines: LineInfo[][], docBodyH: number, bodyFonts: Set<string>): Set<string> {
  for (const line of repeatedFurniture(pageLines, docBodyH, bodyFonts)) line.drop = true;

  const edgeCounts = new Map<string, number>();
  for (const lines of pageLines) {
    const geo = byBaseline(lines);
    const edges = [
      ...geo.slice(0, MAX_EDGE_LINES),
      ...geo.slice(Math.max(MAX_EDGE_LINES, geo.length - MAX_EDGE_LINES)),
    ];
    for (const key of new Set(edges.map(edgeKey))) edgeCounts.set(key, (edgeCounts.get(key) ?? 0) + 1);
  }
  const repeatedEdges = new Set(
    [...edgeCounts].filter(([, n]) => n >= MIN_FURNITURE_REPEATS).map(([k]) => k),
  );

  for (const lines of pageLines) {
    // Lines the repeat pass already took are out of the way: the walk resumes
    // from the outermost SURVIVING line, and the page's leading is measured
    // without them.
    const geo = byBaseline(lines).filter((l) => !l.drop);
    if (geo.length < MIN_LINES_FOR_FURNITURE) continue;
    const gaps: number[] = [];
    for (let i = 1; i < geo.length; i++) {
      const g = geo[i - 1]!.baseline - geo[i]!.baseline;
      if (g > 0) gaps.push(g);
    }
    const medGap = median(gaps);
    if (medGap <= 0) continue;

    /** `innerH` is the font height of the line just inside this one: a
     *  footnote block's own lines are small too, so "smaller than body" is
     *  only evidence when what it borders IS body copy. */
    const isFurniture = (line: LineInfo, innerH: number, separated: boolean): boolean => {
      if (line.text.length > MAX_FURNITURE_CHARS) return false;
      if (PAGE_NUMBER_RE.test(line.text)) return true;
      // A lone small line at the page foot could also be a one-line footnote —
      // its marker says so, and a footnote is content.
      const small = docBodyH > 0
        && line.fontH > 0 && line.fontH < 0.85 * docBodyH
        && innerH >= 0.9 * docBodyH
        && !FOOTNOTE_MARKER_RE.test(line.text);
      const repeated = repeatedEdges.has(edgeKey(line));
      return (repeated && (separated || small)) || (small && separated);
    };

    // Walk in from each edge while the lines keep testing as furniture; the
    // walk stops two lines short of the page so a sparse page can never be
    // emptied out entirely.
    for (let k = 0; k < MAX_EDGE_LINES && k < geo.length - 2; k++) {
      const gap = geo[k]!.baseline - geo[k + 1]!.baseline;
      if (!isFurniture(geo[k]!, geo[k + 1]!.fontH, gap > EDGE_SEP_RATIO * medGap)) break;
      geo[k]!.drop = true;
    }
    for (let k = 0; k < MAX_EDGE_LINES && k < geo.length - 2; k++) {
      const i = geo.length - 1 - k;
      const gap = geo[i - 1]!.baseline - geo[i]!.baseline;
      if (!isFurniture(geo[i]!, geo[i - 1]!.fontH, gap > EDGE_SEP_RATIO * medGap)) break;
      geo[i]!.drop = true;
    }
  }
  return repeatedEdges;
}

// ── Reading order ───────────────────────────────────────────────────────────
// buildLines groups items in CONTENT-STREAM order, which is the order the
// producer drew them in, not the order they are read in. For single-column
// body copy the two normally agree; for anything else — a two-column paper,
// text boxes, a table whose cells pdf.js closes one at a time — they do not.
// Reordering by geometry is safe for the first case and repairs the rest.

/** Split lines at the given gutters, left column first. */
function splitAtCuts(lines: LineInfo[], cuts: number[]): LineInfo[][] {
  const groups: LineInfo[][] = cuts.map(() => []).concat([[]]);
  for (const l of lines) {
    let g = 0;
    for (let i = 0; i < cuts.length; i++) if (l.startX >= cuts[i]!) g = i + 1;
    groups[g]!.push(l);
  }
  return groups;
}

/** The gutters between a page's text columns, or [] when it is not a column
 *  layout. Deliberately strict: a real column layout has a gutter no column
 *  line crosses, columns wide enough to hold prose, many lines each, and lines
 *  that fill their column (body copy set to the measure). Tables and
 *  hanging-indent lists put text at several x positions too, and must NOT be
 *  read column-first.
 *
 *  `lines` excludes page-spanning lines (a title, a full-width figure caption):
 *  they cross every gutter by definition, and letting them veto the sweep is
 *  what made a paper with a spanning title read as one interleaved column.
 *
 *  Narrower lines may cross a gutter too — a centred author line, a figure
 *  caption under a full-width figure, a short title on a paper's first page.
 *  They are too short for the 60% "spans" test yet each one used to veto the
 *  split for the whole page. So a gutter may be crossed by a FEW lines; the
 *  caller treats those like spanning lines (`crossesCut`). */
function columnCuts(lines: LineInfo[], left: number, right: number, grid: number[]): number[] {
  const width = right - left;
  if (lines.length < 10 || width <= 0) return [];

  // Coverage of the x axis at 1pt resolution: how many line boxes cross each x.
  const bins = Math.ceil(width) + 1;
  const cover = new Array<number>(bins).fill(0);
  for (const l of lines) {
    const a = Math.max(0, Math.ceil(l.startX - left));
    const b = Math.min(bins - 1, Math.floor(l.endX - left));
    for (let x = a; x <= b; x++) cover[x]!++;
  }
  // A paper's first page is the worst case: masthead, author and affiliation
  // lines, all centred over the gutter, measured 7 of 31 lines in the wild.
  // The crossers are read in place as separators, so letting a third of the
  // lines cross costs nothing; the column checks below keep tables out.
  const allowance = Math.floor(lines.length / 3);
  // The gap is sized in ems, not as a share of the page: CJK journals set a
  // ~2em gutter, and full-width punctuation hanging at a column's right edge
  // (，。：) eats one of them — 15pt on an A4 page, under any page-share bar
  // that still keeps tables out.
  const bodyH = median(lines.map((l) => l.fontH));
  const minGap = Math.max(0.02 * width, bodyH);
  const candidates: { cut: number; cover: number; side?: number }[] = [];
  for (let x = 0; x < bins;) {
    if (cover[x]! > allowance) { x++; continue; }
    // A run of thinly covered x; cut at its least covered stretches. Usually
    // there is one, but on a three-column page each column holds about a
    // third of the lines — no more than the allowance — so the middle column
    // is "thin" too, and the run reaches from the first gutter to the second.
    // Both gutters bottom out at the run's minimum, and each is a cut.
    let end = x;
    while (end + 1 < bins && cover[end + 1]! <= allowance) end++;
    let min = Infinity;
    for (let k = x; k <= end; k++) min = Math.min(min, cover[k]!);
    for (let k = x; k <= end; k++) {
      if (cover[k] !== min) continue;
      let hi = k;
      while (hi < end && cover[hi + 1] === min) hi++;
      candidates.push({ cut: left + (k + hi) / 2, cover: min });
      k = hi;
    }
    x = end + 1;
  }
  const accepted: { cut: number; cover: number; side?: number }[] = [];
  for (const cand of candidates) {
    const { cut } = cand;
    if (cut - left < 0.2 * width || right - cut < 0.2 * width) continue;
    // Two stretches of one gutter's air (a line ending inside it) are one cut.
    // Only that close: two cuts a column apart that cannot both hold are left
    // for the column checks below to sort out.
    const prev = accepted[accepted.length - 1];
    if (prev && cut - prev.cut < 2 * bodyH) continue;
    // Measured without the lines that cross it, the gutter must be real air.
    const rest = lines.filter((l) => !(l.startX < cut && l.endX > cut));
    const before = rest.filter((l) => l.endX <= cut).map((l) => l.endX);
    const after = rest.filter((l) => l.startX >= cut).map((l) => l.startX);
    // A column on each side, not one short last line of a paragraph that
    // happens to stop before a centred line begins.
    if (before.length < 5 || after.length < 5) continue;
    // A gutter no line touches at all, with a full column on each side, is a
    // column break even when narrower than an em: newspaper-style layouts
    // (the Federal Register's three columns) set a ~0.9em gutter.
    const clean = cand.cover === 0 && before.length >= 10 && after.length >= 10;
    if (Math.min(...after) - Math.max(...before) >= (clean ? 0.6 * bodyH : minGap)) {
      accepted.push({ ...cand, side: Math.min(before.length, after.length) });
    }
  }

  const cuts = accepted.map((c) => c.cut);
  if (cuts.length > 0 && cuts.length <= 3 && columnsHold(lines, cuts, width, allowance, bodyH, grid)) return cuts;
  // A stray gap — air beside a centred heading block, between a decree's
  // signature lines — can pass as a gutter next to the real one, and together
  // they fail the column checks the real one alone would pass. A stray gap
  // has barely a column's worth of lines on one side; and the cut that stays
  // must be where the document's other pages put their gutter. A gap with a
  // column's worth on both sides is no stray: on a page with a full-width
  // table it is the table's own column rule, and cutting the page at the
  // gutter without it splits the table down the middle.
  const kept = accepted.filter((c) => c.side! >= 10);
  const keptCuts = kept.map((c) => c.cut);
  if (kept.length > 0 && kept.length < accepted.length
    && keptCuts.every((c) => grid.some((g) => Math.abs(g - c) <= bodyH))
    && columnsHold(lines, keptCuts, width, allowance, bodyH, grid)) return keptCuts;
  return [];
}

/** The column checks for one set of cuts (see columnCuts). */
function columnsHold(lines: LineInfo[], cuts: number[], width: number, allowance: number, bodyH: number, grid: number[]): boolean {
  const crossers = lines.filter((l) => crossesCut(l, cuts));
  if (crossers.length > allowance) return false;
  // A page laid out on the document's own column grid — the gutters its other
  // pages were split at — is a column page even when its lines do not fill
  // the measure: a two-column contents list or a run of short clauses. Those
  // short lines are what the fill test keeps tables out by, so the grid is
  // only trusted when nothing crosses the gutter.
  const onGrid = crossers.length <= 2 && cuts.every((c) => grid.some((g) => Math.abs(g - c) <= bodyH));
  for (const g of splitAtCuts(lines.filter((l) => !crossesCut(l, cuts)), cuts)) {
    if (g.length < 5) return false;
    const gLeft = Math.min(...g.map((l) => l.startX));
    const gRight = Math.max(...g.map((l) => l.endX));
    if (gRight - gLeft < 0.2 * width) return false;
    // Column copy runs to its own right edge; table cells stop far short of it.
    const fill = median(g.map((l) => (l.endX - l.startX) / (gRight - gLeft)));
    if (fill < 0.8 && !onGrid) return false;
  }
  return true;
}

/** Gutter positions the document is set on: a cut found, at the same x within
 *  a few points, on at least three pages and a quarter of those that found
 *  any. One odd page with a gutter does not make a grid. */
function columnGrid(pageCuts: number[][]): number[] {
  const all = pageCuts.flat().sort((a, b) => a - b);
  const pagesWithCuts = pageCuts.filter((c) => c.length > 0).length;
  const grid: number[] = [];
  for (let i = 0; i < all.length;) {
    let j = i;
    while (j + 1 < all.length && all[j + 1]! - all[j]! <= 4) j++;
    const n = j - i + 1;
    if (n >= 3 && n >= 0.25 * pagesWithCuts) grid.push(all[i + (n >> 1)]!);
    i = j + 1;
  }
  return grid;
}

/** Is this gutter-crossing line two column lines set on one baseline — words
 *  on each side of a gutter no item of it crosses? Counted in letters: a table
 *  row crossing the gutter carries figures, or a short label, on one side. */
function gluedAcross(line: LineInfo, items: PdfTextItemLike[], strs: string[], cuts: number[]): boolean {
  return cuts.some((cut) => {
    let left = 0;
    let right = 0;
    for (const i of line.idxs) {
      const g = geomOf(items[i]!);
      if (!g) continue;
      const chars = (strs[i]!.match(/\p{L}/gu) ?? []).length;
      if (g.x + g.w <= cut) left += chars;
      else if (g.x >= cut) right += chars;
      else if (chars > 0) return false;
    }
    return left >= 8 && right >= 8;
  });
}

/** Does the line's box run across one of the gutters? */
function crossesCut(l: LineInfo, cuts: number[]): boolean {
  return cuts.some((c) => l.startX < c && l.endX > c);
}

/** Top-to-bottom, left-to-right within a band. Bands are formed in one pass so
 *  the comparison stays a total order (a pairwise y tolerance is not one). */
function sortByReading(group: LineInfo[], streamIdx: Map<LineInfo, number>): LineInfo[] {
  const byY = [...group].sort((a, b) => (b.baseline - a.baseline) || (streamIdx.get(a)! - streamIdx.get(b)!));
  const out: LineInfo[] = [];
  let band: LineInfo[] = [];
  let bandY = 0;
  const flush = (): void => {
    band.sort((a, b) => (a.startX - b.startX) || (streamIdx.get(a)! - streamIdx.get(b)!));
    out.push(...band);
    band = [];
  };
  for (const l of byY) {
    if (band.length > 0 && bandY - l.baseline <= 0.5 * (l.fontH || 1)) { band.push(l); continue; }
    flush();
    band = [l];
    bandY = l.baseline;
  }
  flush();
  return out;
}

/** A run of lines read as one group: a stretch of one text column (`col` is
 *  its index, left to right), or a line spanning the gutters (`col` = -1). */
interface ReadingGroup { lines: LineInfo[]; col: number; }

/** The page's non-empty, non-furniture lines in reading order, grouped by text
 *  column. The grouping is not just an implementation detail of the ordering:
 *  table detection must run inside ONE column, or a two-column layout — text
 *  at two x positions sharing baselines — reads as a two-column table. */
function readingOrder(lines: LineInfo[], grid: number[] = []): { groups: ReadingGroup[]; cuts: number[] } {
  const live = lines.filter((l) => !l.empty && !l.drop);
  if (live.length === 0) return { groups: [], cuts: [] };
  // A page pdf.js gave no geometry for can only be trusted in stream order.
  if (live.some((l) => !l.hasGeom)) return { groups: [{ lines: live, col: 0 }], cuts: [] };
  const streamIdx = new Map(live.map((l, i) => [l, i]));

  const left = Math.min(...live.map((l) => l.startX));
  const right = Math.max(...live.map((l) => l.endX));
  const spans = (l: LineInfo): boolean => l.endX - l.startX > 0.6 * (right - left);
  const cuts = columnCuts(live.filter((l) => !spans(l)), left, right, grid);
  if (cuts.length === 0) return { groups: [{ lines: sortByReading(live, streamIdx), col: 0 }], cuts };

  // Column layout: a line that crosses the gutters (a title, a wide figure or
  // table) belongs to neither column and separates what is above it from what
  // is below. So the page reads as horizontal strips, each read column by
  // column, with the spanning lines between them.
  const groups: ReadingGroup[] = [];
  let strip: LineInfo[] = [];
  const flush = (): void => {
    if (strip.length === 0) return;
    splitAtCuts(strip, cuts).forEach((g, col) => {
      if (g.length > 0) groups.push({ lines: sortByReading(g, streamIdx), col });
    });
    strip = [];
  };
  for (const l of sortByReading(live, streamIdx)) {
    if (spans(l) || crossesCut(l, cuts)) { flush(); groups.push({ lines: [l], col: -1 }); continue; }
    strip.push(l);
  }
  flush();
  return { groups, cuts };
}

/** Baseline gaps between neighbours in reading order — evidence for heading
 *  isolation, footnote blocks and list-item ends. A non-positive gap means a
 *  column or page boundary rather than leading, so it stays "unknown". */
function computeGaps(ordered: LineInfo[]): void {
  for (let i = 1; i < ordered.length; i++) {
    const prev = ordered[i - 1]!;
    const cur = ordered[i]!;
    if (!prev.hasGeom || !cur.hasGeom) continue;
    const gap = prev.baseline - cur.baseline;
    if (gap <= 0) continue;
    cur.gapAbove = gap;
    prev.gapBelow = gap;
  }
}

/**
 * Mark the page-foot note block. Footnotes are content — they stay in the text
 * — but they are not part of the paragraph above them: they must never be
 * soft-joined to body copy, and the body paragraph they interrupt has to
 * stitch across them to the next page.
 *
 * Two ways in. The note ZONE is geometric: the run of small type at the very
 * foot of the page, set off from the body above it by extra air. It needs no
 * markers, which CNKI-style labelled notes ("收稿日期 …", "作者简介 …") do
 * not carry, and it spans the columns the way such notes do. Only the zone is
 * moved out of the reading order (`atFoot`): it lies under the whole body
 * block, so emitting it after the body reorders nothing that is read in
 * sequence. Marker-opened notes are found line by line in the lower half as
 * well — notes set in body size or inside one column — and kept in place:
 * "[4]" in the lower half may just as well open a reference list's entry.
 */
function markFootnotes(ordered: LineInfo[], metricsOf: MetricsOf, docBodyH: number): void {
  const geo = ordered.filter((l) => l.hasGeom);
  if (geo.length < MIN_LINES_FOR_FURNITURE) return;
  const top = Math.max(...geo.map((l) => l.baseline));
  const bottom = Math.min(...geo.map((l) => l.baseline));
  const cutoff = bottom + 0.5 * (top - bottom);   // notes live in the lower half

  const small = (l: LineInfo): boolean => docBodyH > 0 && l.fontH > 0 && l.fontH < 0.9 * docBodyH;
  // A note is set to the column's measure: it starts at the column's left
  // edge, or a first-line indent in from it. A line starting mid-column is a
  // table cell or a figure label — "（1）" heading a regression table's
  // column is no note marker, whatever its size and place on the page.
  const atMeasure = (l: LineInfo): boolean => {
    const m = metricsOf(l);
    return l.startX - m.bodyLeft <= NOTE_INSET_EMS * (l.fontH || m.medFontH || 1);
  };

  const fromFoot = [...geo].sort((a, b) => a.baseline - b.baseline);
  let k = 0;
  while (k < fromFoot.length && small(fromFoot[k]!) && atMeasure(fromFoot[k]!) && !fromFoot[k]!.rawLevel) k++;
  if (k > 0 && k < fromFoot.length) {
    const above = fromFoot[k]!;
    const m = metricsOf(above);
    if (m.medGap > 0 && above.baseline - fromFoot[k - 1]!.baseline > 1.2 * m.medGap) {
      for (const l of fromFoot.slice(0, k)) { l.footnote = true; l.atFoot = true; }
    }
  }

  let inBlock = false;
  for (const l of ordered) {
    const m = metricsOf(l);
    if (!l.hasGeom || l.baseline > cutoff || l.rawLevel > 0 || !atMeasure(l)) { inBlock = false; continue; }
    if (l.footnote) { inBlock = true; continue; }
    const opens = FOOTNOTE_MARKER_RE.test(l.text) || (small(l) && FOOTNOTE_NUMBER_RE.test(l.text));
    // The block is set off from the body by a rule or extra air; inside it the
    // lines run at normal leading.
    if (opens && (small(l) || m.medGap <= 0 || l.gapAbove > 1.2 * m.medGap)) {
      l.footnote = true;
      inBlock = true;
      continue;
    }
    if (inBlock && (m.medGap <= 0 || l.gapAbove <= 1.5 * m.medGap)) { l.footnote = true; continue; }
    inBlock = false;
  }
}

// ── Heading size ladder ─────────────────────────────────────────────────────
// headingLevel judges one line against body copy, so it can only place that
// line on an absolute scale (≥1.5× body → #, ≥1.28× → ##, …). Across a whole
// document that scale inverts: a 15pt section head lands on ### by ratio while
// a 12pt bold head lands on ## by the same-size rule, and the smaller type ends
// up ABOVE the larger one in the outline. The repair is document-wide: rank the
// heading sizes that actually occur, and make depth strictly follow the rank.

/** How a heading is set: its size bucket and its font. Lines matching a style
 *  the document has already established elsewhere need less local evidence. */
const headingStyle = (l: LineInfo): string => `${Math.round(l.fontH * 2) / 2}|${l.fontName}`;
/** A style has to appear this often before it counts as the document's own. */
const MIN_STYLE_MEMBERS = 3;

/**
 * Second heading pass: promote lines set exactly like the headings already
 * confirmed elsewhere in the document.
 *
 * isIsolated demands MEASURED air above and below, which a heading printed as
 * the last line of a page cannot have — nothing follows it to measure against.
 * Locally that is indistinguishable from a paragraph opening, so the first pass
 * is right to refuse it; across the document it is not ambiguous at all, since
 * the same size and font have already been established as heading style. The
 * air that CAN be measured still has to be there.
 */
function promoteByHeadingStyle(
  pages: { ordered: LineInfo[]; metricsOf: MetricsOf }[],
  repeatedEdges: Set<string>,
  docBodyH: number,
  docBodyFonts: Set<string>,
): void {
  const styles = new Map<string, number>();
  const levels = new Map<string, number>();
  // A heading set in body type itself (a capitals section head at body size)
  // establishes no heading style: its size and font are the body's, and every
  // short isolated body line — a formula, a lead-in — would match it.
  const bodyStyle = (l: LineInfo): boolean =>
    docBodyFonts.has(l.fontName) && Math.abs(l.fontH - docBodyH) <= 0.05 * docBodyH;
  for (const { ordered } of pages) {
    for (const l of ordered) {
      if (l.rawLevel <= 0 || l.fontH <= 0 || bodyStyle(l)) continue;
      const key = headingStyle(l);
      styles.set(key, (styles.get(key) ?? 0) + 1);
      levels.set(key, Math.min(levels.get(key) ?? 6, l.rawLevel));
    }
  }

  for (const { ordered, metricsOf } of pages) {
    for (const l of ordered) {
      if (l.rawLevel > 0 || !l.hasGeom || l.fontH <= 0) continue;
      const metrics = metricsOf(l);
      const key = headingStyle(l);
      if ((styles.get(key) ?? 0) < MIN_STYLE_MEMBERS) continue;
      if (l.text.length > 80 || /[。，、；：,;.]$/.test(l.text)) continue;
      if (!looksLikeHeadingText(l.text)) continue;
      if (repeatedEdges.has(edgeKey(l))) continue;
      const fh = l.fontH || metrics.medFontH || 1;
      if (l.endX >= metrics.bodyRight - 2 * fh) continue;          // ran to the margin → body copy
      if (metrics.medGap <= 0) continue;
      // Unmeasurable air (page/column edge) is allowed here — that is the whole
      // point — but air that IS measurable must be real.
      if (Number.isFinite(l.gapAbove) && l.gapAbove <= 1.25 * metrics.medGap) continue;
      if (Number.isFinite(l.gapBelow) && l.gapBelow <= 1.25 * metrics.medGap) continue;
      if (!Number.isFinite(l.gapAbove) && !Number.isFinite(l.gapBelow)) continue;
      l.rawLevel = numberingLevel(l.text) ?? levels.get(key) ?? SAME_SIZE_HEADING_LEVEL;
    }
  }
}

/** Distinct heading sizes, largest first, sizes within a point merged. */
function headingTiers(heads: LineInfo[], size: (l: LineInfo) => number): number[] {
  const sizes = [...new Set(heads.map(size))].sort((a, b) => b - a);
  const tiers: number[] = [];
  for (const s of sizes) {
    if (tiers.length === 0 || tiers[tiers.length - 1]! - s > HEADING_TIER_TOL) tiers.push(s);
  }
  return tiers;
}

/** Assign final heading levels so that a larger size is never deeper than a
 *  smaller one, keeping each tier's own most-confident level as the floor. */
function assignHeadingLevels(heads: LineInfo[], capsHeads: Set<LineInfo>, bodyH: number): void {
  // Small caps measure shorter than the body type they are set in: ranked by
  // that height a capitals section head would sit under its own subsections.
  const size = (l: LineInfo): number => (capsHeads.has(l) ? Math.max(l.fontH, bodyH) : l.fontH);
  const tiers = headingTiers(heads, size);
  const tierOf = (l: LineInfo): number => {
    let t = tiers.length - 1;
    for (let i = 0; i < tiers.length; i++) if (size(l) >= tiers[i]! - HEADING_TIER_TOL) { t = i; break; }
    return t;
  };
  const members: LineInfo[][] = tiers.map(() => []);
  for (const l of heads) members[tierOf(l)]!.push(l);

  let prev = 0;
  for (let i = 0; i < tiers.length; i++) {
    const group = members[i]!;
    if (group.length === 0) continue;
    const minRaw = Math.min(...group.map((l) => l.rawLevel));
    const depths = group.map((l) => numberingLevel(l.text)).filter((d): d is number => d !== null);
    const minDepth = depths.length > 0 ? Math.min(...depths) : null;
    const level = Math.min(Math.max(minRaw, prev + 1), 6);
    for (const l of group) {
      // Within one size, numbering still separates 1. from 1.1.
      const d = minDepth === null ? null : numberingLevel(l.text);
      const offset = d === null || minDepth === null ? 0 : Math.max(0, d - minDepth);
      l.hLevel = Math.min(level + offset, 6);
    }
    prev = level;
  }

  // Under capitals section heads ("I. INTRODUCTION"), lettered heads in
  // another type ("A. Anisotropy field", "B. DAC" in italics) are their
  // subsections, whatever size each is set in. A lettered head in the
  // sections' own type is an appendix ("A. TAKING INTO ACCOUNT …").
  const sections = heads.filter((l) => capsHeads.has(l) && !LETTERED_SUBSECTION_RE.test(l.text));
  const sectionStyles = new Set(sections.map(headingStyle));
  const capsLevel = Math.min(...sections.map((l) => l.hLevel));
  if (Number.isFinite(capsLevel)) {
    for (const l of heads) {
      if (l.hLevel <= capsLevel && LETTERED_SUBSECTION_RE.test(l.text) && !sectionStyles.has(headingStyle(l))) {
        l.hLevel = Math.min(capsLevel + 1, 6);
      }
    }
  }
}

/** Lines in a run of SOLID_RUN_LINES or more set at one size and at body
 *  leading, one under the next. That is running text at whatever size it is
 *  set: a heading wraps to two or three lines, not a paragraph's worth. It
 *  matters where the body size is not the document's — a page whose notes
 *  outweigh its text, a preface set larger — and every line of a paragraph
 *  would otherwise "stand out" by size. */
function setSolidRuns(ordered: LineInfo[]): Set<LineInfo> {
  const out = new Set<LineInfo>();
  let run: LineInfo[] = [];
  const flush = (): void => {
    if (run.length >= SOLID_RUN_LINES) for (const l of run) out.add(l);
    run = [];
  };
  for (const l of ordered) {
    if (l.empty || !l.hasGeom || l.fontH <= 0) { flush(); continue; }
    const prev = run[run.length - 1];
    const joins = prev && Math.abs(prev.fontH - l.fontH) <= 0.05 * l.fontH
      && Number.isFinite(l.gapAbove) && l.gapAbove > 0 && l.gapAbove <= 1.6 * l.fontH;
    if (!joins) flush();
    run.push(l);
  }
  flush();
  return out;
}
const SOLID_RUN_LINES = 4;

/** The page's body size, when the page has body copy to measure: one size
 *  carrying most of the page's ink, over enough lines that it is running text
 *  rather than a title page's few large lines. 0 when there is no such size. */
function pageBodyHeight(lines: LineInfo[]): number {
  const h = dominantHeight(lines);
  if (h <= 0) return 0;
  let atH = 0;
  let lineCount = 0;
  let total = 0;
  for (const l of lines) {
    if (l.empty || !l.hasGeom || l.fontH <= 0) continue;
    total += l.inkWidth;
    if (l.fontH === h) { atH += l.inkWidth; lineCount++; }
  }
  return lineCount >= 8 && atH >= 0.5 * total ? h : 0;
}

function pageMetrics(lines: LineInfo[]): PageMetrics {
  const geo = lines.filter((l) => !l.empty && l.hasGeom);
  const bodyLeft = geo.length > 0 ? Math.min(...geo.map((l) => l.startX)) : 0;
  const bodyRight = geo.length > 0 ? Math.max(...geo.map((l) => l.endX)) : 0;
  const medFontH = median(geo.map((l) => l.fontH).filter((h) => h > 0));
  const gaps: number[] = [];
  for (let i = 1; i < geo.length; i++) {
    const g = geo[i - 1]!.baseline - geo[i]!.baseline;
    if (g > 0) gaps.push(g);
  }
  return { bodyLeft, bodyRight, medFontH, medGap: median(gaps) };
}

/** Two glyph heights are one type size, within the rounding of glyph boxes
 *  (heights are bucketed to half a point). Tight on purpose: CJK body copy
 *  and its notes and captions sit a step apart on the type scale — 10.5pt
 *  against 9pt is 14%. Unknown heights never separate anything. */
const sameHeight = (a: number, b: number): boolean =>
  a <= 0 || b <= 0 || Math.abs(a - b) <= Math.max(0.5, 0.08 * Math.max(a, b));
const sameSize = (a: LineInfo, b: LineInfo): boolean => sameHeight(a.fontH, b.fontH);

/** Is the break between two consecutive lines a paragraph boundary? */
function isParaBreak(prev: LineInfo, next: LineInfo, metricsOf: MetricsOf): boolean {
  if (!prev.hasGeom || !next.hasGeom) return false;   // no layout to judge → keep flowing
  if (LIST_MARKER_RE.test(next.text)) return true;    // list / chapter heading
  const m = metricsOf(next);
  const mp = metricsOf(prev);
  // A paragraph is set in one size: a caption under a figure and the body
  // line after it are two blocks however close they sit.
  if (!sameSize(prev, next)) return true;
  // A line closed by a right-aligned tag — a display formula's number — is
  // complete; what follows starts afresh ("…， (1)" / "式中：…").
  if (prev.tagGap > TAG_GAP_EMS * (prev.fontH || mp.medFontH || 1)) return true;
  // First-line indent — only when there is a real text column to measure
  // against, and only when the line does not fall back left of the one above:
  // after an indented first line that wrapped, a line further left is that
  // paragraph going on in an inset block (a table's note set to the table's
  // width), however far it still sits from the page margin. "Wrapped" means a
  // long line that ran out of room — an equation number alone at the right
  // margin reaches it too.
  const fallsBack = next.startX < prev.startX - 0.5 * (next.fontH || m.medFontH || 1);
  const wrapped = looksWrapped(prev, mp) && prev.endX - prev.startX > 0.5 * (mp.bodyRight - mp.bodyLeft);
  if (isIndented(next, m) && !(fallsBack && wrapped)) return true;
  // A short line ending a sentence (didn't run to the right margin).
  if (endsSentence(prev.text) && prev.endX < mp.bodyRight - 2 * (prev.fontH || mp.medFontH || 1)) return true;
  // Extra vertical whitespace relative to the page's normal line spacing.
  const gap = prev.baseline - next.baseline;
  if (m.medGap > 0 && gap > 1.5 * m.medGap) return true;
  return false;
}

/**
 * Does this document open its paragraphs with a first-line indent? Measured
 * where the answer is unambiguous: the line after a short, sentence-final
 * line is a paragraph opening, so how those lines sit is the document's own
 * paragraph style. It is read off body copy only: headings and notes are set
 * apart by other means, and a reference list or a caption has a style of its
 * own — a reference list's flush "[8] …" entries outvoted a paper's indented
 * paragraphs.
 */
function opensParagraphsIndented(
  pages: { columns: LineInfo[][]; metricsOf: MetricsOf }[],
  bodyH: number,
): boolean {
  let openings = 0;
  let indented = 0;
  for (const { columns, metricsOf } of pages) {
    for (const column of columns) {
      for (let i = 1; i < column.length; i++) {
        const prev = column[i - 1]!;
        const cur = column[i]!;
        if (!prev.hasGeom || !cur.hasGeom || prev.rawLevel || cur.rawLevel || prev.footnote || cur.footnote) continue;
        if (!sameHeight(prev.fontH, bodyH) || !sameHeight(cur.fontH, bodyH) || LIST_MARKER_RE.test(cur.text)
          || FOOTNOTE_MARKER_RE.test(cur.text)) continue;
        const m = metricsOf(cur);
        if (!endsSentence(prev.text) || looksWrapped(prev, m)) continue;
        openings++;
        if (isIndented(cur, m)) indented++;
      }
    }
  }
  return openings >= MIN_STYLE_MEMBERS && indented >= 0.6 * openings;
}

/** In a document that indents its paragraph openings, a line set flush after
 *  a line that ran to the margin is a wrap — whatever it opens with. Inline
 *  enumerations ("…表示；（2）传统金融…") and reference ranges ("第 56—" /
 *  "62 页。") wrap onto a fresh line all the time, and read by their first
 *  characters alone they became list items and footnotes, splitting the
 *  sentence in two. */
function isFlushWrap(prev: LineInfo, cur: LineInfo, metricsOf: MetricsOf, doc: DocStyle): boolean {
  if (!doc.indentOpens || !prev.hasGeom || !cur.hasGeom || cur.hLevel) return false;
  // The indent style is the body's: it says nothing about an abstract or a
  // reference list set in a size of its own.
  if (!sameHeight(prev.fontH, doc.bodyH) || !sameHeight(cur.fontH, doc.bodyH)) return false;
  const m = metricsOf(cur);
  if (!looksWrapped(prev, metricsOf(prev)) || isIndented(cur, m)) return false;
  return m.medGap <= 0 || prev.baseline - cur.baseline <= 1.5 * m.medGap;
}

// ── List blocks ─────────────────────────────────────────────────────────────
// A list sits in its own text column, inset from the page's left margin, and
// EVERY line of an item — the marker line and its wrapped lines alike — starts
// on that column (hanging-indent styles push the wrapped lines a little
// further right, but they never come back to the page margin). isParaBreak's
// first-line-indent rule measures indent against the PAGE's left edge, so it
// reads every line of the list as "a new indented paragraph starts here" and
// splits mid-item — the bug this state machine fixes (a reference list came
// out with a blank line inside every entry).
//
// The fix is to measure against the list block's own left edge instead. The
// guards that keep it honest never look at font size, because LIST_MARKER_RE
// also matches a numbered HEADING ("1. 引言"): when headingLevel misses one
// (same-size headings), the marker line must still not swallow the paragraph
// below it.

/** An open block whose lines share a left edge of their own: a list item, or
 *  any run the first-line-indent rule cut off (block quotes are the common
 *  case — indented on BOTH sides, so their lines never reach the page's right
 *  margin either). */
interface BlockState {
  leftX: number;           // the block's left edge (a list item's marker line)
  contX: number | null;    // the continuation column, fixed by the first wrapped line
}

/** Did this line run out of column — is the break after it a WRAP rather than
 *  the end of a block? Ragged-right Western text stops a long word short of
 *  the margin (a reference entry measured 33pt / 3em of slack in the wild), so
 *  the tolerance is a fraction of the column width, not a couple of ems.
 *  `leftX` is the enclosing block's left edge: a block inset from the page
 *  margin is assumed inset on the right by as much, which is what lets an
 *  indented quote be measured against its own column instead of the page's. */
function looksWrapped(line: LineInfo, m: PageMetrics, leftX = m.bodyLeft): boolean {
  const fh = line.fontH || m.medFontH || 1;
  // Reached the margin by a tab or a right-aligned tag, not by filling.
  if (line.maxGap > TAB_GAP_EMS * fh || line.tagGap > TAG_GAP_EMS * fh) return false;
  const right = m.bodyRight - Math.max(0, leftX - m.bodyLeft);
  return line.endX >= right - Math.max(2.5 * fh, 0.15 * (right - leftX));
}

/** The first-line-indent test, shared by isParaBreak (where it starts a new
 *  block) and the pairing pass (where it says which block just opened). */
function isIndented(line: LineInfo, m: PageMetrics): boolean {
  return m.bodyRight - m.bodyLeft > 3 * (m.medFontH || 1)
    && line.startX - m.bodyLeft > 0.8 * (line.fontH || m.medFontH || 1);
}

/**
 * Is `cur` a wrapped continuation of the open block rather than a new one?
 * Guards:
 *  A. `prev` must look wrapped, measured against the BLOCK's column. A short
 *     marker line ("1. 引言") plainly did not wrap, so a heading can never
 *     absorb the paragraph under it, whatever its font size — this is what
 *     makes the heading/list ambiguity safe.
 *  B. `cur` sits on the block's column: flush with its left edge (the common
 *     case) or hanging-indented up to ~4 em, never left of it. Once the first
 *     wrapped line has fixed the column, the rest of the block stays on it.
 *  C. Lookahead: if the line AFTER `cur` drops back to the page's left edge,
 *     `cur` is the indented FIRST line of an ordinary paragraph, not a
 *     continuation — first-line indent looks exactly like a hanging indent
 *     until you see what follows it.
 *  D. A vertical jump well past the page's line spacing ends the block.
 */
function isBlockContinuation(
  prev: LineInfo,
  cur: LineInfo,
  next: LineInfo | undefined,
  block: BlockState,
  metricsOf: MetricsOf,
): boolean {
  if (!prev.hasGeom || !cur.hasGeom || !sameSize(prev, cur)) return false;
  if (cur.hLevel || LIST_MARKER_RE.test(cur.text)) return false;
  const m = metricsOf(cur);
  const fh = cur.fontH || m.medFontH || 1;
  if (!looksWrapped(prev, metricsOf(prev), block.leftX)) return false;                      // A
  const dx = cur.startX - block.leftX;
  if (dx < -0.5 * fh || dx > 4 * fh) return false;                                          // B
  if (block.contX !== null && Math.abs(cur.startX - block.contX) > 0.5 * fh) return false;  // B
  // C — only for the block's FIRST continuation: that is where an indented line
  // is genuinely ambiguous. Once the block's column is established, a following
  // line back at the page margin is just the paragraph after the block. The
  // line after must also be set solid: in the first-line-indent reading it is
  // the SAME paragraph's second line, whereas a new block after the list is
  // separated by extra space (60pt against 15pt of leading, in the wild).
  if (block.contX === null && next && next.hasGeom && !next.hLevel && !LIST_MARKER_RE.test(next.text)
    && cur.startX - next.startX > 0.5 * fh
    && Math.abs(next.startX - m.bodyLeft) <= 0.5 * fh
    && (m.medGap <= 0 || next.gapAbove <= 1.5 * m.medGap)) return false;
  const gap = prev.baseline - cur.baseline;
  if (m.medGap > 0 && gap > 2 * m.medGap) return false;                                     // D
  return true;
}

/** One entry of a page's emit plan: a line, or a table standing in for the
 *  lines its cells came from. */
type PlanEntry = { line: LineInfo; table: null } | { line: null; table: TableBlock };

/**
 * Move floats out of the paragraphs they cut through, in place.
 *
 * A figure and its caption float: the typesetter drops them wherever they
 * fit, and the paragraph runs on around them — "…当能量迹样本量小于 2 200
 * 时，" [figure, "图 2 …耗时对比"] "二分类方法的耗时更少…". Read in place,
 * the caption splits a sentence in two. A float is a run of lines not set in
 * body size (captions, figure labels) that is not a heading, between a body
 * line that has not finished and one that carries on from it.
 *
 * It goes to whichever side of the paragraph keeps the page's own edges on
 * body copy: before the paragraph when the paragraph starts on this page,
 * after it when it came from the previous one — the caption at the top of a
 * page must not stand between the two halves of a paragraph either.
 * `carried` is the previous page's last line when that page stopped in
 * mid-paragraph; only then can a page open on a continuation.
 */
function liftFloats(plan: PlanEntry[], metricsOf: MetricsOf, doc: DocStyle, carried: LineInfo | null): void {
  const lineAt = (i: number): LineInfo | null => plan[i]?.line ?? null;
  const body = (l: LineInfo | null): l is LineInfo =>
    !!l && l.hasGeom && !l.hLevel && doc.bodyH > 0 && l.fontH > 0 && sameHeight(l.fontH, doc.bodyH);
  const floating = (l: LineInfo | null): boolean => !!l && l.hasGeom && !l.hLevel && !body(l);
  /** Do `a` and `b` belong to one paragraph, read as if adjacent? */
  const joins = (a: LineInfo | null, b: LineInfo | null): boolean => body(a) && body(b) && !isParaBreak(a, b, metricsOf);
  /** Does `l` carry on the paragraph the previous page broke off? */
  const continuesCarried = (l: LineInfo): boolean => !!carried && body(carried) && body(l) && sameSize(carried, l)
    && !isIndented(l, metricsOf(l)) && !LIST_MARKER_RE.test(l.text);

  for (let i = 0; i < plan.length; i++) {
    if (!floating(lineAt(i))) continue;
    let j = i;
    while (floating(lineAt(j))) j++;
    const a = lineAt(i - 1);
    const b = lineAt(j);
    if (!body(b)) { i = j; continue; }
    const interrupts = a
      ? body(a) && !endsSentence(a.text) && looksWrapped(a, metricsOf(a)) && joins(a, b)
      : continuesCarried(b);
    if (!interrupts) { i = j; continue; }
    const run = plan.splice(i, j - i);
    // The paragraph's start, walking back from `a`; reaching the page's top
    // without a paragraph opening means it began on the previous page.
    let start = i - 1;
    while (start > 0 && joins(lineAt(start - 1), lineAt(start))) start--;
    const opensHere = a !== null && (start > 0 || !continuesCarried(lineAt(0)!));
    if (opensHere) {
      plan.splice(start, 0, ...run);
      i = i + run.length - 1;
    } else {
      let end = i;
      while (joins(lineAt(end), lineAt(end + 1))) end++;
      plan.splice(end + 1, 0, ...run);
      i = end + run.length;
    }
  }
}

/** Separator for a soft-wrapped (same-paragraph) line break, plus whether the
 *  previous line's trailing hyphen should be dropped (Western hyphenation). */
function softSeparator(prev: LineInfo, next: LineInfo): { sep: string; dehyphen: boolean } {
  const a = prev.text;
  const last = a[a.length - 1];
  const first = next.text[0];
  if (last === '-' && /[A-Za-z]/.test(a[a.length - 2] ?? '') && /[A-Za-z]/.test(first ?? '')) {
    return { sep: '', dehyphen: true };
  }
  if (isCjkChar(last) || isCjkChar(first)) return { sep: '', dehyphen: false };
  // A break after a joining mark is inside a token: a slash ("DMSP/OLS",
  // "and/or", a URL), a dash ("第 56—62 页", "pp. 13–15"), a hyphen between
  // digits ("1000-2820"). A word space is never set right after one.
  if (last === '/' || last === '—' || last === '–' || (last === '-' && /\d/.test(a[a.length - 2] ?? ''))) {
    return { sep: '', dehyphen: false };
  }
  return { sep: ' ', dehyphen: false };
}

/** `ordered` is the page's live lines in reading order (furniture already
 *  dropped, heading levels already fixed on the document's size ladder). */
function assembleGeomPage(
  strs: string[],
  ordered: LineInfo[],
  metricsOf: MetricsOf,
  doc: DocStyle,
  carried: LineInfo | null,
): PageAsm {
  for (const l of ordered) {
    if (!l.hLevel) continue;
    l.prefix = `${'#'.repeat(l.hLevel)} `;
    // A printed-TOC entry promoted by size arrives as "- 参考文献"; the bullet
    // is layout, not title text, and "## - 参考文献" is not a heading Markdown
    // (or a reader) makes sense of.
    const bullet = BULLET_MARKER_RE.exec(l.text);
    if (bullet) l.skip = bullet[0].length;
  }

  // A long heading wraps like any other line. Two lines of one heading are set
  // solid — measured at ~1.36× the heading's font size in the wild, against
  // ≥2.1× between separate headings — and share a font size; their heading
  // LEVELS can differ, since the first half usually carries the numbering that
  // fixes the level and the second half falls back to a size tier.
  //
  // A centred heading wraps short of both margins, so "ran to the margin"
  // cannot see it; two lines centred on one axis, set solid, can. And a
  // heading set across columns sits in a strip of its own, where the gap to
  // the line above reads as unmeasurable — the baselines still measure it.
  const sameSizeSolid = (prev: LineInfo, cur: LineInfo, strict = false): boolean => {
    if (Math.abs(prev.fontH - cur.fontH) > 0.5) return false;
    if (numberingLevel(cur.text) !== null || LIST_MARKER_RE.test(cur.text)) return false;
    const m = metricsOf(prev);
    const fh = prev.fontH || m.medFontH || 1;
    const gap = Number.isFinite(cur.gapAbove) ? cur.gapAbove
      : !strict && prev.hasGeom && cur.hasGeom ? prev.baseline - cur.baseline : Infinity;
    if (!(gap > 0 && gap <= (strict ? 1.7 : HEADING_WRAP_LEADING) * fh)) return false;
    return looksWrapped(prev, m) || (!strict && centredPair(prev, cur, m));
  };
  const centredPair = (prev: LineInfo, cur: LineInfo, m: PageMetrics): boolean => {
    const fh = prev.fontH || m.medFontH || 1;
    const mid = (l: LineInfo): number => (l.startX + l.endX) / 2;
    const slackL = prev.startX - m.bodyLeft;
    return slackL > fh
      && Math.abs(slackL - (m.bodyRight - prev.endX)) <= 2 * fh
      && Math.abs(mid(prev) - mid(cur)) <= 1.5 * fh;
  };

  // First half rejected only for its trailing comma ("…Thought: Pragmatism,"),
  // leaving the second half to stand alone as a heading — promote it back.
  for (let i = 1; i < ordered.length; i++) {
    const prev = ordered[i - 1]!;
    const cur = ordered[i]!;
    if (!cur.hLevel || prev.hLevel || !prev.hasGeom) continue;
    if (!/[,，]$/.test(prev.text) || prev.text.length > 80) continue;
    // Strictly: a centred author list ends its lines in commas too, and its
    // last line is no heading's first half.
    if (!sameSizeSolid(prev, cur, true)) continue;
    prev.hLevel = cur.hLevel;
    prev.prefix = `${'#'.repeat(cur.hLevel)} `;
    const bullet = BULLET_MARKER_RE.exec(prev.text);
    if (bullet) prev.skip = bullet[0].length;
  }

  // Emitted separately the halves become two sibling headings ("# John Dewey
  // on the Humanization of Technology and" / "# the Future of Education").
  for (let i = 1; i < ordered.length; i++) {
    const prev = ordered[i - 1]!;
    const cur = ordered[i]!;
    if (!prev.hLevel || !cur.hLevel) continue;
    if (!sameSizeSolid(prev, cur)) continue;
    cur.headingCont = true;
    cur.prefix = '';
    cur.skip = 0;
  }

  // Pairing pass: decide the separator that precedes each non-empty line, and
  // track the open list item so its wrapped lines rejoin it.
  const startsList = (l: LineInfo): boolean =>
    !l.hLevel && !l.footnote && l.hasGeom && LIST_MARKER_RE.test(l.text);
  // Returns the new state instead of assigning it: a closure assignment would
  // be invisible to control-flow analysis and narrow `list` to null below.
  const openList = (l: LineInfo): BlockState => {
    const bullet = BULLET_MARKER_RE.exec(l.text);
    // pdf.js emits the marker and the text as separate runs and does not always
    // synthesize the gap between them, so a numbered item can arrive as
    // "1.Dewey…" — which Markdown does not read as a list item at all.
    const tight = /^(\d{1,3}[.)])(?=[^\s\d])/.exec(l.text);
    if (bullet && bullet[0] !== '- ') { l.prefix = '- '; l.skip = bullet[0].length; }
    else if (tight) { l.prefix = `${tight[1]!} `; l.skip = tight[1]!.length; }
    return { leftX: l.startX, contX: null };
  };
  // The emit plan: lines in reading order, with each table standing in for the
  // lines its cells came from, and the page's notes after its body — wherever
  // the reading order met them. Notes at the foot of a two-column page sit
  // under both columns; read in place they cut the left column off from the
  // right one in mid-sentence. Everything after this point walks the plan, so
  // a table both separates the paragraphs around it and keeps its own order.
  const plan: PlanEntry[] = [];
  const notes: PlanEntry[] = [];
  const emittedTables = new Set<TableBlock>();
  for (const l of ordered) {
    if (l.table) {
      if (!emittedTables.has(l.table)) { emittedTables.add(l.table); plan.push({ line: null, table: l.table }); }
      continue;
    }
    (l.atFoot ? notes : plan).push({ line: l, table: null });
  }
  liftFloats(plan, metricsOf, doc, carried);
  const bodyEntries = plan.length;
  plan.push(...notes);

  let block: BlockState | null = null;
  let prev: LineInfo | null = null;
  let acrossTable = false;
  let blockAtLastBody: BlockState | null = null;
  for (let i = 0; i < plan.length; i++) {
    const cur = plan[i]!.line;
    if (cur === null) { acrossTable = true; block = null; continue; }
    const next = plan[i + 1]?.line ?? undefined;
    const soft = (): void => {
      const { sep, dehyphen } = softSeparator(prev!, cur);
      cur.sepBefore = sep;
      if (dehyphen) prev!.trail += 1;   // swallow the trailing '-'
    };
    if (prev === null) {
      // First line of the page — nothing to pair it with, but a table may
      // already have been emitted above it.
      if (acrossTable) cur.sepBefore = '\n\n';
      block = startsList(cur) ? openList(cur) : null;
    } else if (acrossTable) {
      cur.sepBefore = '\n\n';           // a table always closes the block before it
      block = startsList(cur) ? openList(cur) : null;
    } else if (cur.headingCont) {
      soft();                           // wrapped heading — same line as its first half
      block = null;
    } else if (cur.hLevel) {
      cur.sepBefore = '\n\n';           // a heading always stands on its own paragraph
      block = null;
    } else if (cur.footnote !== prev.footnote || (cur.footnote && FOOTNOTE_MARKER_RE.test(cur.text))) {
      // Notes are their own blocks: never soft-joined to the body they
      // interrupt, and each marker opens a fresh one whose wraps rejoin it.
      cur.sepBefore = '\n\n';
      block = { leftX: cur.startX, contX: null };
    } else if (!prev.hLevel && isFlushWrap(prev, cur, metricsOf, doc)) {
      soft();
    } else if (startsList(cur)) {
      // Sibling items stay separate blocks. Checked before `prev.hLevel` so a
      // list opening right under a heading still opens (the common case).
      cur.sepBefore = '\n\n';
      block = openList(cur);
    } else if (prev.hLevel) {
      cur.sepBefore = '\n\n';
      block = isIndented(cur, metricsOf(cur)) ? { leftX: cur.startX, contX: null } : null;
    } else if (block && isBlockContinuation(prev, cur, next, block, metricsOf)) {
      soft();
      if (block.contX === null) block.contX = cur.startX;
    } else if (isParaBreak(prev, cur, metricsOf)) {
      cur.sepBefore = '\n\n';
      // An indented line that broke the paragraph opens a block of its own —
      // a quote's remaining lines sit on the same inset column and must rejoin
      // it instead of each being read as another indented paragraph.
      block = isIndented(cur, metricsOf(cur)) ? { leftX: cur.startX, contX: null } : null;
    } else {
      soft();                           // flush wrap — an open block stays open…
      // …unless the wrap came back LEFT of the block's edge. No line of a
      // hanging-indent block ever does (guard B), so the block was the
      // indented first line of an ordinary paragraph, and keeping it open
      // let the next indented paragraph opening pass for its continuation.
      if (block && cur.startX < block.leftX - 0.5 * (cur.fontH || metricsOf(cur).medFontH || 1)) block = null;
    }
    if (!cur.footnote) blockAtLastBody = block;
    prev = cur;
    acrossTable = false;
  }

  // Emit: whitespace is trimmed at every line boundary, so item ranges only
  // ever lose characters off their front (srcStart) or their tail (shorter end).
  // A heading line gets a `#`… prefix and a bullet its normalized '- '; those
  // characters map to no item (like the '\n\n' separators and a table's pipes),
  // so contentStart is taken AFTER the prefix is appended and `skip` drops what
  // it replaced. Items on dropped (furniture) lines keep the empty range they
  // were initialized with — they exist in the layout but not in the text.
  const itemRanges: PdfItemTextRange[] = strs.map(() => ({ start: 0, end: 0, srcStart: 0 }));
  let out = '';
  let emittedAny = false;

  /** Append one table cell, tracking where each item's characters landed. */
  const appendCell = (idxs: number[], table: TableBlock): void => {
    let tail = '';
    let spaced = false;
    for (const i of idxs) {
      const s = strs[i]!;
      const t = s.trim();
      if (t.length === 0) { itemRanges[i] = { start: out.length, end: out.length, srcStart: 0 }; continue; }
      // Cell text is stitched from separate runs and from wrapped lines. On
      // one line the layout says where the air is ("1." + "学习" gets a
      // space, "(" + "0.055 6" does not); across a wrap it cannot, and Latin
      // needs its word space back while CJK must not gain one.
      const wrap = table.lineStart.has(i);
      if (tail !== '' && (wrap ? !isCjkChar(tail) && !isCjkChar(t[0]) : spaced)) out += ' ';
      spaced = table.gapAfter.has(i);
      const start = out.length;
      out += t;
      itemRanges[i] = { start, end: out.length, srcStart: s.indexOf(t[0]!) };
      tail = t[t.length - 1]!;
    }
  };

  // Notes are emitted after the body, but ahead of a last paragraph that runs
  // on to the next page: that one has to end the page's text, or it can never
  // be stitched to its continuation. Its opening line keeps the paragraph
  // break it already has. When that paragraph is the page's only one, it is
  // also continued FROM the previous page, so the notes stay last.
  let emit = plan;
  const lastBody = plan[bodyEntries - 1]?.line;
  if (notes.length > 0 && lastBody && !endsSentence(lastBody.text) && looksWrapped(lastBody, metricsOf(lastBody))) {
    let open = bodyEntries - 1;
    while (open > 0 && plan[open]!.line !== null && !plan[open]!.line!.sepBefore.includes('\n\n')) open--;
    if (plan[open]!.line === null) open++;   // the paragraph opens right under a table
    if (open > 0) emit = [...plan.slice(0, open), ...notes, ...plan.slice(open, bodyEntries)];
  }

  for (const entry of emit) {
    if (entry.table) {
      if (emittedAny) out += '\n\n';
      emittedAny = true;
      entry.table.rows.forEach((row, r) => {
        if (r > 0) out += '\n';
        out += '|';
        for (let c = 0; c < entry.table.columns; c++) {
          out += ' ';
          appendCell(row[c] ?? [], entry.table);
          out += ' |';
        }
        if (r === 0) out += `\n|${' --- |'.repeat(entry.table.columns)}`;
      });
      continue;
    }
    const li = entry.line;
    if (emittedAny) out += li.sepBefore;
    emittedAny = true;
    out += li.prefix;
    const contentStart = out.length;
    const to = Math.max(li.lead, li.C.length - li.trail);
    const from = Math.min(li.lead + li.skip, to);
    out += li.C.slice(from, to);
    for (let k = 0; k < li.idxs.length; k++) {
      const i = li.idxs[k]!;
      const ci = li.spans[k]!;
      const len = strs[i]!.length;
      const s = Math.min(Math.max(ci, from), to);
      const e = Math.min(Math.max(ci + len, from), to);
      itemRanges[i] = {
        start: contentStart + (s - from),
        end: contentStart + (e - from),
        srcStart: Math.max(0, Math.min(len, s - ci)),
      };
    }
  }

  // Cross-page stitching reads the page's BODY edges: a paragraph running onto
  // the next page is continued by the last line of body copy, not by the
  // footnotes or the table printed under it.
  const body = emit.flatMap((e) => (e.line && !e.line.footnote ? [e.line] : []));
  const tail = emit[emit.length - 1];
  return {
    text: out,
    items: itemRanges,
    empty: ordered.length === 0,
    first: body[0],
    last: body[body.length - 1],
    firstMetrics: body[0] ? metricsOf(body[0]) : EMPTY_METRICS,
    lastMetrics: body.length > 0 ? metricsOf(body[body.length - 1]!) : EMPTY_METRICS,
    blockAtEnd: blockAtLastBody,
    endsWithBlock: !!tail && (tail.line === null || tail.line.footnote),
  };
}

/** Separator between two adjacent non-empty pages: '\n\n' unless the previous
 *  page's last line looks like it runs straight into the next page's first. */
function crossPageSep(prev: PageAsm, next: PageAsm, doc: DocStyle): string {
  const pl = prev.last;
  const nf = next.first;
  if (prev.endsWithBlock) return '\n\n';
  if (!pl || !nf || !pl.hasGeom || !nf.hasGeom) return '\n\n';
  if (pl.hLevel || nf.hLevel) return '\n\n';   // a heading never merges across a page break
  if (!sameSize(pl, nf)) return '\n\n';
  const nextIndented = isIndented(nf, next.firstMetrics);
  // A block broken by the page break: the next page opens on the same inset
  // column, so the indent is continuation, not a new paragraph.
  const open = prev.blockAtEnd;
  const fh = nf.fontH || next.firstMetrics.medFontH || 1;
  const dx = open ? nf.startX - open.leftX : 0;
  const blockContinues = !!open
    && dx >= -0.5 * fh && dx <= 4 * fh
    && (open.contX === null || Math.abs(dx - (open.contX - open.leftX)) <= 0.5 * fh);
  const continues =
    !endsSentence(pl.text)                                                   // page ended mid-sentence
    && looksWrapped(pl, prev.lastMetrics, open ? open.leftX : prev.lastMetrics.bodyLeft)
    && (!LIST_MARKER_RE.test(nf.text) || (doc.indentOpens && sameHeight(nf.fontH, doc.bodyH) && !nextIndented))
    && (!nextIndented || blockContinues);
  return continues ? softSeparator(pl, nf).sep : '\n\n';
}

/** Normalized item strings for one page, with the runs that are layout rather
 *  than reading matter blanked out: `/Artifact`-tagged content (the producer's
 *  own word for furniture) and rotated glyph runs (watermarks, vertical
 *  sidebars). Blanking rather than removing keeps item indices — and therefore
 *  any offset mapping back onto the items — aligned. */
function normalizePageStrs(items: PdfTextItemLike[]): string[] {
  const strs = items.map((it) => it.str.replace(/\r\n?/g, '\n'));
  const inked = items.filter((it, i) => strs[i]!.trim().length > 0);
  if (inked.length === 0) return strs;

  const rotated = items.map((it) => {
    const t = it.transform;
    if (!t || t.length < 6) return false;
    // Only a tilted BASELINE (b) is rotation. A shear with a level baseline
    // (c alone) is oblique type — synthetic italic, a slanted ∑ or minus sign
    // in a formula — and is reading matter; dropping it lost "∑" from
    // "式中：∑ 为奇异值矩阵" and the minus from "v=m−t".
    const scale = Math.max(Math.abs(t[0]!), Math.abs(t[3]!), 1e-6);
    return Math.abs(t[1]!) > 0.2 * scale;
  });
  // A page whose text is MOSTLY rotated is a rotated page, not a watermarked
  // one — dropping it would delete the content.
  const rotatedInked = items.filter((it, i) => rotated[i] && strs[i]!.trim().length > 0).length;
  const dropRotated = rotatedInked < MAX_ROTATED_SHARE * inked.length;

  // Same defence for the tagging as collectPdfArtifactFlags applies at the
  // source: a producer that marks a page's body copy as /Artifact is
  // mis-tagged, and losing the page is far worse than keeping a header line.
  let artifactChars = 0;
  let inkedChars = 0;
  for (let i = 0; i < items.length; i++) {
    const chars = strs[i]!.replace(/\s+/g, '').length;
    inkedChars += chars;
    if (items[i]!.artifact === true) artifactChars += chars;
  }
  const useArtifacts = inkedChars === 0 || artifactChars / inkedChars <= MAX_ARTIFACT_SHARE;

  // Fake bold: the producer draws the same glyph run twice, a hair apart.
  // Kept, "∑" read as "∑∑".
  const overprint = items.map((it, i) => {
    const prev = items[i - 1];
    if (!prev || strs[i]!.trim().length === 0 || strs[i] !== strs[i - 1]) return false;
    const a = geomOf(it);
    const b = geomOf(prev);
    if (!a || !b) return false;
    const tol = 0.15 * (a.h || 1);
    return Math.abs(a.x - b.x) <= tol && Math.abs(a.y - b.y) <= tol;
  });

  return strs.map((s, i) => {
    if (useArtifacts && items[i]!.artifact === true) return '';
    if (dropRotated && rotated[i]) return '';
    if (overprint[i]) return '';
    return s;
  });
}

/** Control codes carry no reading matter: an unmapped glyph (the ring of a
 *  composed ⑪) comes through as U+0000. */
const CONTROL_RE = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

/**
 * Characters of an item's `str` that are layout, not text, squeezed out
 * before anything reads the strings. Returns the squeezed strings and, per
 * item, the offsets removed from the original (see PdfItemTextRange.squeezed).
 *
 * Tracking: pdf.js reads a glyph advance wider than the font's own as a word
 * space, so letter-spaced type — a justified line stretched by tracking, a
 * spaced-out label — arrives as "基 金 项 目 ：". Tracking is set on a whole
 * LINE, and CJK is never word-spaced, so a line in which every pair of CJK
 * neighbours is split by one space is tracked type, and those spaces go —
 * in every run of the line, the two-character "利 用" beside "Chipwhisperer"
 * included. The space between a CJK character and a Latin word stays: that
 * one the typesetter puts there. A line with CJK set solid anywhere
 * ("宁夏大学 经济管理学院") has real air in its spaces, and keeps all of them.
 */
function squeezeStrs(strs: string[], lines: LineInfo[]): { strs: string[]; cuts: number[][] } {
  const drops = strs.map((str) => new Set([...str.matchAll(CONTROL_RE)].map((m) => m.index!)));
  /** Not a letter or digit of a Latin word: CJK, or punctuation around it. */
  const nonLatin = (c: string | undefined): boolean => !!c && /\S/.test(c) && !/[A-Za-z0-9]/.test(c);
  for (const line of lines) {
    const spaced: [number, number][] = [];
    let solid = 0;
    for (const i of line.idxs) {
      const str = strs[i]!;
      for (let k = 1; k < str.length; k++) {
        if (isCjkChar(str[k - 1]) && isCjkChar(str[k])) solid++;
        if (str[k] === ' ' && nonLatin(str[k - 1]) && nonLatin(str[k + 1])
          && (isCjkChar(str[k - 1]) || isCjkChar(str[k + 1]))) spaced.push([i, k]);
      }
    }
    if (solid === 0 && spaced.length >= 2) for (const [i, k] of spaced) drops[i]!.add(k);
  }
  const cuts = strs.map(() => [] as number[]);
  const out = strs.map((str, i) => {
    const drop = drops[i]!;
    if (drop.size === 0) return str;
    cuts[i] = [...drop].sort((a, b) => a - b);
    // Offsets are UTF-16 units throughout, and only BMP units are dropped.
    return str.split('').filter((_, k) => !drop.has(k)).join('');
  });
  return { strs: out, cuts };
}

/** Full-width forms that keep their width whatever their neighbours. */
const KEEP_FULLWIDTH = '，．；！？（）［］｛｝｟｠';

/**
 * Full-width ASCII forms (：／＠…) between two ASCII characters, folded to
 * ASCII. CJK fonts carry their own colon and parentheses, and a producer
 * setting a URL or a code inside CJK copy often takes them from there:
 * "https：//www…" prints as a URL and must read as one — to the reader, and
 * to search. Between CJK characters the full-width form is the right one and
 * stays, and so do sentence punctuation and brackets anywhere: "…Vᵀ，(1)" is
 * a CJK sentence going on after a formula, and "（2026）" is CJK typography
 * around a number — brackets also come in pairs, and folding one side by its
 * neighbours read "(6）". A one-for-one substitution, so every item range
 * stays valid. Neighbours are read across item boundaries in stream order,
 * which is the order an inline run is drawn in.
 */
function foldFullwidth(strs: string[]): string[] {
  const flat: { i: number; k: number }[] = [];
  strs.forEach((str, i) => { for (let k = 0; k < str.length; k++) flat.push({ i, k }); });
  const charAt = (n: number): string => (n >= 0 && n < flat.length ? strs[flat[n]!.i]![flat[n]!.k]! : '');
  const out = strs.map((str) => str.split(''));
  for (let n = 0; n < flat.length; n++) {
    const code = charAt(n).charCodeAt(0);
    if (code < 0xff01 || code > 0xff5e || KEEP_FULLWIDTH.includes(charAt(n))) continue;
    if (!/[!-~]/.test(charAt(n - 1)) || !/[!-~]/.test(charAt(n + 1))) continue;
    out[flat[n]!.i]![flat[n]!.k] = String.fromCharCode(code - 0xfee0);
  }
  return out.map((chars) => chars.join(''));
}

/** Restate an item range built over squeezed strings in terms of the item's
 *  original `str`. Ranges over the squeezed string are contiguous, so only
 *  srcStart moves, and the cuts falling inside the span are listed. */
function unsqueezeRange(r: PdfItemTextRange, cuts: number[]): PdfItemTextRange {
  if (cuts.length === 0) return r;
  let src = r.srcStart;
  for (const cut of cuts) if (cut <= src) src++;
  const inside: number[] = [];
  let at = src;
  for (let k = 1; k < r.end - r.start; k++) {
    at++;
    while (cuts.includes(at)) { inside.push(at); at++; }
  }
  return inside.length > 0 ? { ...r, srcStart: src, squeezed: inside } : { ...r, srcStart: src };
}

/** Tables whose cells would break the Markdown they are emitted into. A cell
 *  carrying a pipe or a newline cannot be written without escaping it, and
 *  escaping would shift every item range off its source characters. */
function tableIsEmittable(table: TableBlock, strs: string[]): boolean {
  for (const idx of table.itemIdxs) {
    if (/[|\n]/.test(strs[idx] ?? '')) return false;
  }
  return true;
}

function buildGeomTextMap(pages: PdfTextItemLike[][]): PdfTextMap {
  // Pre-scan every page's lines first: page furniture, the document's body
  // height and the heading size ladder are all doc-wide facts that individual
  // pages cannot be assembled without.
  const scans = pages.map((items) => {
    // Lines are found on the strings as given and found again once they are
    // cleaned: tracking is a property of the line, and squeezing it out moves
    // no ink, so both passes group the same items.
    const given = normalizePageStrs(items);
    const { strs: squeezed, cuts } = squeezeStrs(given, buildLines(items, given));
    const strs = foldFullwidth(squeezed);
    return { items, strs, cuts, lines: buildLines(items, strs) };
  });

  // Furniture first, on a rough body height and font set — running heads are a
  // small share of the text, so they cannot move either statistic far, and
  // every metric taken after this point is free of them.
  const roughBodyH = dominantHeight(scans.flatMap((s) => s.lines));
  const repeatedEdges = dropFurniture(
    scans.map((s) => s.lines),
    roughBodyH,
    dominantFonts(scans.flatMap((s) => s.items.map((it, i) => ({
      font: it.fontName, chars: s.strs[i]!.replace(/\s+/g, '').length,
    })))),
  );

  // Column layout is decided per page, then once more for the pages that
  // found none, against the gutters the rest of the document is set on.
  const firstPass = scans.map((s) => readingOrder(s.lines));
  const grid = columnGrid(firstPass.map((r) => r.cuts));
  const prepared = scans.map((s, p) => {
    const { groups, cuts } = firstPass[p]!.cuts.length === 0 && grid.length > 0
      ? readingOrder(s.lines, grid)
      : firstPass[p]!;
    const columns = groups.map((g) => g.lines);
    const ordered = columns.flat();
    // Gaps are measured down a column: the jump from the foot of one column to
    // the head of the next is a layout artefact, not line spacing.
    for (const column of columns) computeGaps(column);
    const metrics = pageMetrics(ordered);
    // Indent and "ran to the margin" are judged against the line's own text
    // column. Measured against the page, every right-column line of a
    // two-column paper starts half a page "indented" and each one opened a
    // new paragraph. Gutter-spanning lines keep the page's metrics; a
    // single-column page has one column, so its metrics are the page's.
    const colLines = new Map<number, LineInfo[]>();
    for (const g of groups) {
      if (g.col >= 0) colLines.set(g.col, [...(colLines.get(g.col) ?? []), ...g.lines]);
    }
    const lineMetrics = new Map<LineInfo, PageMetrics>();
    for (const lines of colLines.values()) {
      const m = pageMetrics(lines);
      for (const l of lines) lineMetrics.set(l, m);
    }
    const metricsOf = (l: LineInfo): PageMetrics => lineMetrics.get(l) ?? metrics;
    // Table detection runs inside one text column, or a column layout — text
    // at two x positions sharing baselines — reads as a two-column table. The
    // exception is a table wider than a column: each of its rows crosses the
    // gutter and is a group of its own, so consecutive spanning groups are
    // searched together.
    // Not every crossing line is a table row, though: a line of each column
    // glued into one (OCR does this) sets prose on both sides of the gutter,
    // and a run of them reads as a two-column table. Those stay on their own.
    const glued = (g: ReadingGroup): boolean => g.lines.length === 1 && gluedAcross(g.lines[0]!, s.items, s.strs, cuts);
    const tableUnits: LineInfo[][] = [];
    groups.forEach((g, k) => {
      const prev = groups[k - 1];
      if (g.col === -1 && prev?.col === -1 && !glued(g) && !glued(prev)) tableUnits[tableUnits.length - 1]!.push(...g.lines);
      else tableUnits.push([...g.lines]);
    });
    return { ...s, columns, ordered, metrics, metricsOf, tableUnits };
  });

  const docBodyH = dominantHeight(prepared.flatMap((s) => s.ordered));

  // Body fonts, char-weighted over what survived: a same-size line is heading
  // evidence only when its font is outside this set (headingLevel gate 2).
  const docBodyFonts = dominantFonts(prepared.flatMap((s) => s.ordered.flatMap((line) => line.idxs.map((i) => ({
    font: s.items[i]!.fontName, chars: s.strs[i]!.replace(/\s+/g, '').length,
  })))));

  // Headings: judge each line on its own first, then rank the sizes that
  // actually occur so a bigger heading is never nested under a smaller one.
  const capsHeads = new Set<LineInfo>();
  for (const s of prepared) {
    const pageBodyH = pageBodyHeight(s.ordered);
    const solid = setSolidRuns(s.ordered);
    for (const l of s.ordered) {
      l.rawLevel = headingLevel(l, {
        docBodyH,
        pageBodyH,
        inSolidRun: solid.has(l),
        docBodyFonts,
        m: s.metricsOf(l),
        inSeries: inMarkerSeries(l, s.ordered),
        repeatedEdge: repeatedEdges.has(edgeKey(l)),
      }) ?? 0;
      if (l.rawLevel === CAPS_SECTION_LEVEL && CAPS_SECTION_RE.test(l.text)) capsHeads.add(l);
    }
    // A capitals section head that wraps ("2. AN EXTENDED ALGORITHM WITH A
    // FREE" / "SEMI-MAJOR AXIS"): the second line carries no numbering of
    // its own, so isCapsSectionHead cannot see it — but set solid under the
    // first, in capitals, it is the rest of the head.
    for (let i = 1; i < s.ordered.length; i++) {
      const prev = s.ordered[i - 1]!;
      const cur = s.ordered[i]!;
      if (!capsHeads.has(prev) || cur.rawLevel > 0) continue;
      if (!/^[^\p{Ll}]*\p{Lu}{3}[^\p{Ll}]*$/u.test(cur.text) || cur.text.length > 80) continue;
      if (Math.abs(cur.fontH - prev.fontH) > 0.05 * prev.fontH) continue;
      if (!Number.isFinite(cur.gapAbove) || cur.gapAbove > 1.6 * cur.fontH) continue;
      cur.rawLevel = prev.rawLevel;
      capsHeads.add(cur);
    }
  }
  promoteByHeadingStyle(prepared, repeatedEdges, docBodyH, docBodyFonts);
  // Unnumbered heads in the capitals heads' own type (ACKNOWLEDGMENTS,
  // REFERENCES), found by promoteByHeadingStyle, rank with them.
  const capsStyles = new Set([...capsHeads].map(headingStyle));
  const heads = prepared.flatMap((s) => s.ordered.filter((l) => l.rawLevel > 0));
  for (const l of heads) {
    if (capsStyles.has(headingStyle(l)) && /^[^\p{Ll}]*\p{Lu}{3}[^\p{Ll}]*$/u.test(l.text)) capsHeads.add(l);
  }
  assignHeadingLevels(heads, capsHeads, docBodyH);

  for (const s of prepared) markFootnotes(s.ordered, s.metricsOf, docBodyH);

  // Tables: rows and columns are only visible in the item geometry, since
  // pdf.js ends a CELL with hasEOL and the lines above interleave columns.
  // Scanned per table unit (see tableUnits above), so a column layout is never
  // read as a table.
  for (const s of prepared) {
    for (const column of s.tableUnits) {
      const cells: TableItemLike[] = [];
      for (const l of column) {
        for (const i of l.idxs) {
          const g = geomOf(s.items[i]!);
          if (g) cells.push({ idx: i, x: g.x, y: g.y, w: g.w, h: g.h, str: s.strs[i]! });
        }
      }
      for (const table of detectTables(cells)) {
        if (!tableIsEmittable(table, s.strs)) continue;
        for (const l of column) {
          if (l.idxs.some((i) => table.itemIdxs.has(i))) l.table = table;
        }
      }
    }
  }

  const doc: DocStyle = { bodyH: docBodyH, indentOpens: opensParagraphsIndented(prepared, docBodyH) };
  let text = '';
  const outPages: PdfPageTextMap[] = [];
  let prevNonEmpty: PageAsm | null = null;

  for (const s of prepared) {
    // A page is assembled knowing whether the previous one stopped in
    // mid-paragraph: a float at the top of this page must then make way for
    // the paragraph's continuation (liftFloats).
    const carried = prevNonEmpty && !prevNonEmpty.endsWithBlock && prevNonEmpty.last
      && !endsSentence(prevNonEmpty.last.text) && looksWrapped(prevNonEmpty.last, prevNonEmpty.lastMetrics)
      ? prevNonEmpty.last : null;
    const asm = assembleGeomPage(s.strs, s.ordered, s.metricsOf, doc, carried);
    if (asm.empty) {
      const at = text.length;
      outPages.push({ start: at, end: at, items: asm.items.map(() => ({ start: at, end: at, srcStart: 0 })) });
      continue;
    }
    const sep = text.length === 0 ? '' : (prevNonEmpty ? crossPageSep(prevNonEmpty, asm, doc) : '\n\n');
    text += sep;
    const base = text.length;
    text += asm.text;
    outPages.push({
      start: base,
      end: base + asm.text.length,
      items: asm.items.map((r) => ({ start: base + r.start, end: base + r.end, srcStart: r.srcStart })),
    });
    prevNonEmpty = asm;
  }

  // Lines are already edge-trimmed, so a leading/trailing trim is normally a
  // no-op; guard it anyway and shift every range if it bites.
  const trimmed = text.trim();
  const lead = trimmed.length === 0 ? 0 : text.indexOf(trimmed[0]!);
  const shifted = trimmed.length === text.length ? outPages : outPages.map((p) => ({
    ...clampRange(p, lead, trimmed.length),
    items: p.items.map((r) => ({
      ...clampRange(r, lead, trimmed.length),
      srcStart: r.srcStart + Math.min(Math.max(lead - r.start, 0), r.end - r.start),
    })),
  }));
  // Every range so far indexes the squeezed strings; callers address the
  // item strings pdf.js gave them.
  return {
    text: trimmed,
    pages: shifted.map((p, pi) => ({ ...p, items: p.items.map((r, i) => unsqueezeRange(r, scans[pi]!.cuts[i]!)) })),
  };
}

/**
 * Insert page markers (【第N页】, or 【第N页·章节】 when the PDF's bookmark
 * outline is available) at each page start, so text handed to a model carries
 * page provenance the model can cite. The model copies markers verbatim, so
 * section names in citations come from the outline, never from model
 * inference.
 * `pageOffsets` are page-start offsets into `text` (possibly prefix-shifted by
 * the caller); out-of-range or non-increasing entries are skipped.
 *
 * Outline entries additionally become Markdown heading lines (`#`/`##`/… by
 * nesting depth) at their first page, placed just BEFORE that page's marker so
 * the marker lands inside the section it opens. PDF extractions carry no `#`
 * headings of their own, so without this every downstream structure consumer —
 * markdownBlocks (doc_overview sections / get_section navigation) and
 * chunkPage (embedding `[section]` prefixes, chunk-summary labels) — sees a
 * PDF as one flat run of paragraphs.
 *
 * `docLabel`, when given, prefixes every marker (【docLabel·第N页】) — callers
 * now pass it for every pinned PDF (spec: uniform marker shape), so the model
 * always has a filename to copy verbatim instead of composing one itself.
 */
export function insertPdfPageMarkers(text: string, pageOffsets: number[], outline?: PdfOutlineEntry[], docLabel?: string): string {
  // Marker numbers must track the ORIGINAL page index — blank pages can share
  // an offset with their successor and must not shift later page numbers.
  const entries = pageOffsets
    .map((offset, i) => ({ offset, page: i + 1 }))
    .filter((e, i) => Number.isInteger(e.offset) && e.offset >= 0 && e.offset <= text.length
      && (i === 0 || e.offset >= pageOffsets[i - 1]!));
  if (entries.length === 0) return text;

  const headingsByPage = new Map<number, string[]>();
  for (const entry of outline ?? []) {
    const title = entry.title.trim();
    if (!title) continue;
    const level = Math.min(Math.max((entry.depth ?? 0) + 1, 1), 6);
    const lines = headingsByPage.get(entry.page) ?? [];
    lines.push(`${'#'.repeat(level)} ${title}`);
    headingsByPage.set(entry.page, lines);
  }

  let out = '';
  let cursor = 0;
  for (const { offset, page } of entries) {
    out += text.slice(cursor, offset);
    if (out.length > 0 && !out.endsWith('\n')) out += '\n';
    for (const heading of headingsByPage.get(page) ?? []) out += `${heading}\n`;
    const section = outline ? outlineSectionForPage(outline, page) : undefined;
    const prefix = docLabel ? `${docLabel}·` : '';
    out += section ? `【${prefix}第${page}页·${section}】\n` : `【${prefix}第${page}页】\n`;
    cursor = offset;
  }
  out += text.slice(cursor);
  return out;
}

/**
 * Slice variant of insertPdfPageMarkers, for text that was stored WITHOUT
 * markers: decorate the slice just before showing it, rather than at build
 * time. Inserts only 【第N页】/【第N页·章节】 markers — never outline heading
 * lines, since headings added here would duplicate whatever structure the
 * caller already carries.
 *
 * `sliceFrom` is the slice's start offset in the canonical text. A slice that
 * opens mid-page gets its containing page's marker prepended, so every
 * decorated excerpt carries page provenance.
 *
 * `docLabel`, when given, prefixes every marker — same always-on rule as
 * `insertPdfPageMarkers`.
 */
export function insertPdfPageMarkersSlice(
  text: string,
  sliceFrom: number,
  pageOffsets: number[],
  outline?: PdfOutlineEntry[],
  docLabel?: string,
): string {
  const sliceTo = sliceFrom + text.length;
  const markerFor = (page: number): string => {
    const section = outline ? outlineSectionForPage(outline, page) : undefined;
    const prefix = docLabel ? `${docLabel}·` : '';
    return section ? `【${prefix}第${page}页·${section}】` : `【${prefix}第${page}页】`;
  };

  // Same validity rule as insertPdfPageMarkers: page numbers track the
  // ORIGINAL index; skip negative / non-increasing offsets.
  let openingPage: number | null = null;
  const inside: { offset: number; page: number }[] = [];
  for (let i = 0; i < pageOffsets.length; i++) {
    const offset = pageOffsets[i]!;
    if (!Number.isInteger(offset) || offset < 0) continue;
    if (i > 0 && offset < pageOffsets[i - 1]!) continue;
    if (offset <= sliceFrom) { openingPage = i + 1; continue; }
    if (offset < sliceTo) inside.push({ offset, page: i + 1 });
  }
  if (openingPage === null && inside.length === 0) return text;

  let out = openingPage !== null ? `${markerFor(openingPage)}\n` : '';
  let cursor = 0;
  for (const { offset, page } of inside) {
    out += text.slice(cursor, offset - sliceFrom);
    if (out.length > 0 && !out.endsWith('\n')) out += '\n';
    out += `${markerFor(page)}\n`;
    cursor = offset - sliceFrom;
  }
  out += text.slice(cursor);
  return out;
}

/** Page number (1-based) containing the given text offset. Offsets between
 *  pages resolve to the nearest page before them; offsets before every page
 *  (e.g. inside the heading prefix) return null. */
export function pageNumberAtOffset(map: PdfTextMap, offset: number): number | null {
  let nearestBefore: number | null = null;
  for (let i = 0; i < map.pages.length; i++) {
    const page = map.pages[i]!;
    if (page.end <= page.start) continue;   // blank page — never a home
    if (offset < page.start) break;
    if (offset < page.end) return i + 1;
    nearestBefore = i + 1;
  }
  return nearestBefore;
}
