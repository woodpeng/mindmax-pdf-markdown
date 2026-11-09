// PDF → Markdown, as a deliverable file rather than as reading text.
//
// buildPdfTextMap already rebuilds the document's structure (paragraphs,
// reading order across columns, headings, lists, tables, footnotes) and emits
// it Markdown-shaped. That text is the canonical text that offsets are stored
// against, so it must not change for export's sake. Everything a file handed to
// a user additionally needs is layered on top here, driven by the map's item
// ranges — the one reliable record of which characters came from the PDF
// (content) and which the assembler wrote (`#`, `- `, table pipes,
// separators):
//
//  - content characters that Markdown would read as syntax are escaped
//    ("$5" is not maths, "*" is not emphasis, "1990. A year" is not a list);
//  - hyperlink annotations become [text](url).
//
// So improving buildPdfTextMap improves reading, AI answers and this export at
// once; this layer only owns what is specific to handing out a .md file.

import { assessPdfTextLayer, pdfLooksScanned, type PdfTextLayerIssues } from './quality.js';
import { buildPdfTextMap, type PdfTextItemLike, type PdfTextMap } from './text-map.js';
import { readPdfTextLayer, type PdfLinkLike, type PdfTextLayer, type PdfTextLayerDocumentLike, type PdfTextLayerPageLike } from './text-layer.js';

// ── Escaping ────────────────────────────────────────────────────────────────

const WORD_CHAR_RE = /[\p{L}\p{N}]/u;
const HTML_START_RE = /[A-Za-z/!?]/;
const ENTITY_RE = /^&(?:#\d{1,7}|#[xX][0-9a-fA-F]{1,6}|[A-Za-z][A-Za-z0-9]{1,31});/;
/** A bracket pair this far apart is not going to be read as one link label. */
const MAX_LABEL_CHARS = 300;

/** Line-start escapes: offsets of the character to backslash. Only lines that
 *  open with PDF content are considered — a heading or list prefix the
 *  assembler wrote is intended syntax, not something to neutralize. */
function lineStartEscapes(text: string, content: Uint8Array): Set<number> {
  const out = new Set<number>();
  let ls = 0;
  while (ls <= text.length) {
    let le = text.indexOf('\n', ls);
    if (le < 0) le = text.length;
    if (le > ls && content[ls]) {
      const line = text.slice(ls, le);
      if (/^#{1,6}(?:\s|$)/.test(line) || line[0] === '>' || /^\+(?:\s|$)/.test(line)) out.add(ls);
      // GFM ordered lists take up to nine digits; the assembler's own list
      // detection stops at three, so a longer number is a year or an amount.
      const ordinal = /^(\d{4,})[.)](?:\s|$)/.exec(line);
      if (ordinal) out.add(ls + ordinal[1]!.length);
      // A run of '=' or '-' right under a text line turns that line into a
      // setext heading.
      if (ls >= 2 && text[ls - 2] !== '\n' && /^(?:=+|-+)[ \t]*$/.test(line)) out.add(ls);
    }
    ls = le + 1;
  }
  return out;
}

/** Does the '[' at `i` open something Markdown would parse — an inline or
 *  reference link, a footnote reference, or a link definition? Plain citation
 *  brackets ("[12]") are left alone so the file stays readable as text. */
function bracketIsSyntax(text: string, i: number): boolean {
  if (text[i + 1] === '^') return true;
  let j = i + 1;
  const stop = Math.min(text.length, i + MAX_LABEL_CHARS);
  while (j < stop && text[j] !== ']' && text[j] !== '\n') j++;
  if (text[j] !== ']') return false;
  const next = text[j + 1];
  if (next === '(' || next === '[') return true;
  return next === ':' && (i === 0 || text[i - 1] === '\n');
}

/** Escaped form of one content character, given its surroundings. */
function escapeChar(text: string, i: number, inLinkText: boolean): string {
  const c = text[i]!;
  switch (c) {
    case '\\': case '`': case '*': case '$': case '~':
      return `\\${c}`;
    case '_':
      return WORD_CHAR_RE.test(text[i - 1] ?? '') && WORD_CHAR_RE.test(text[i + 1] ?? '') ? c : '\\_';
    case '=':
      return text[i + 1] === '=' ? '\\=' : c;          // ==highlight==
    case '<':
      return HTML_START_RE.test(text[i + 1] ?? '') ? '\\<' : c;
    case '&':
      return ENTITY_RE.test(text.slice(i, i + 40)) ? '\\&' : c;
    case '[':
      return inLinkText || bracketIsSyntax(text, i) ? '\\[' : c;
    case ']':
      return inLinkText ? '\\]' : c;
    default:
      return c;
  }
}

// ── Links ───────────────────────────────────────────────────────────────────

interface LinkSpan {
  start: number;
  end: number;
  url: string;
}

/** Share of an item's width a link box must cover to claim the item. Items
 *  are whole text runs: a link covering a fraction of one ("see example.com
 *  for details") cannot be cut at a character, so it is left as plain text. */
const LINK_ITEM_COVER = 0.7;

function itemBox(it: PdfTextItemLike): { x: number; y: number; w: number; h: number } | null {
  const t = it.transform;
  if (!t || t.length < 6 || !(typeof it.width === 'number' && it.width > 0)) return null;
  const h = it.height && it.height > 0 ? it.height : Math.hypot(t[2]!, t[3]!);
  return { x: t[4]!, y: t[5]!, w: it.width, h };
}

function coversItem(rect: PdfLinkLike['rect'], box: { x: number; y: number; w: number; h: number }): boolean {
  const [x1, y1, x2, y2] = rect;
  const overlap = Math.min(box.x + box.w, x2) - Math.max(box.x, x1);
  if (overlap < LINK_ITEM_COVER * box.w) return false;
  const mid = box.y + 0.35 * box.h;                       // baseline + about half an x-height
  const pad = 0.25 * box.h;
  return mid >= y1 - pad && mid <= y2 + pad;
}

/** "https://www.example.com/" and "example.com" are the same visible link. */
const linkKey = (s: string): string =>
  s.trim().toLowerCase().replace(/^mailto:/, '').replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');

function linkSpans(map: PdfTextMap, pageItems: PdfTextItemLike[][], links: PdfLinkLike[][], content: Uint8Array): LinkSpan[] {
  const spans: LinkSpan[] = [];
  const { text } = map;
  links.forEach((pageLinks, p) => {
    const items = pageItems[p] ?? [];
    const ranges = map.pages[p]?.items ?? [];
    for (const link of pageLinks) {
      const hit: { start: number; end: number }[] = [];
      items.forEach((it, k) => {
        const r = ranges[k];
        const box = itemBox(it);
        if (r && r.end > r.start && box && coversItem(link.rect, box)) hit.push(r);
      });
      if (hit.length === 0) continue;
      hit.sort((a, b) => a.start - b.start);
      // The claimed items must read as one run of text: only whitespace the
      // assembler put between them, never a line or table-cell boundary.
      let ok = true;
      for (let k = 1; k < hit.length && ok; k++) {
        if (!/^[ \t]*$/.test(text.slice(hit[k - 1]!.end, hit[k]!.start))) ok = false;
      }
      const start = hit[0]!.start;
      const end = Math.max(...hit.map((r) => r.end));
      const label = text.slice(start, end);
      if (!ok || label.includes('\n') || !label.trim()) continue;
      for (let k = start; k < end && ok; k++) if (!content[k] && text[k] === '|') ok = false;
      if (!ok) continue;
      // A printed URL is already a link to every Markdown reader (GFM
      // autolinks); wrapping it in [url](url) only adds noise.
      if (linkKey(label) === linkKey(link.url)) continue;
      spans.push({ start, end, url: link.url });
    }
  });
  spans.sort((a, b) => a.start - b.start);
  // One link per run of text: a second annotation over the same words (PDFs
  // often stack them per line of a wrapped link) adds nothing.
  return spans.filter((s, k) => k === 0 || s.start >= spans[k - 1]!.end);
}

/** Markdown link destination: bare when unambiguous, else in angle brackets. */
function linkDestination(url: string): string {
  return /[\s()<>]/.test(url) ? `<${url.replace(/[<>]/g, encodeURIComponent).replace(/\s/g, '%20')}>` : url;
}

// ── Rendering ───────────────────────────────────────────────────────────────

export interface PdfMarkdownRender {
  markdown: string;
  /** Hyperlinks carried over as [text](url). */
  links: number;
}

/**
 * Render a built PDF text map as a Markdown file: escape the PDF's own
 * characters where Markdown would misread them and restore hyperlinks.
 * Pure: `pageItems` / `links` are the inputs the map was built from.
 */
export function renderPdfMarkdown(map: PdfTextMap, pageItems: PdfTextItemLike[][], links: PdfLinkLike[][] = []): PdfMarkdownRender {
  const { text } = map;
  const content = new Uint8Array(text.length);
  for (const page of map.pages) {
    for (const r of page.items) content.fill(1, r.start, r.end);
  }
  const atLineStart = lineStartEscapes(text, content);
  const spans = linkSpans(map, pageItems, links, content);

  const out: string[] = [];
  let s = 0;
  let span = spans[0];
  for (let i = 0; i < text.length; i++) {
    if (span && i === span.start) out.push('[');
    const inLink = !!span && i >= span.start && i < span.end;
    if (!content[i]) out.push(text[i]!);
    else if (atLineStart.has(i)) out.push(`\\${text[i]}`);
    else out.push(escapeChar(text, i, inLink));
    if (span && i === span.end - 1) {
      out.push(`](${linkDestination(span.url)})`);
      span = spans[++s];
    }
  }
  return { markdown: out.join(''), links: spans.length };
}

// ── Conversion ──────────────────────────────────────────────────────────────

export type PdfMarkdownResult =
  | {
    ok: true;
    markdown: string;
    pageCount: number;
    /** Pages whose maths lost its structure or whose glyphs are unmapped —
     *  the converter cannot repair either, the caller should say so. */
    textLayerIssues: PdfTextLayerIssues | null;
    links: number;
  }
  | { ok: false; reason: 'scanned' | 'empty'; pageCount: number };

export interface ConvertPdfToMarkdownOptions {
  cancelled?: () => boolean;
  onPage?: (pageNumber: number, pageCount: number) => void;
}

/**
 * Convert an opened pdf.js document to Markdown. The caller owns loading and
 * destroying the document (pdf.js builds and asset paths differ per host).
 * Returns null only when `cancelled` fired.
 */
export async function convertPdfToMarkdown<P extends PdfTextLayerPageLike>(
  doc: PdfTextLayerDocumentLike<P>,
  opts?: ConvertPdfToMarkdownOptions & { cancelled?: undefined },
): Promise<PdfMarkdownResult>;
export async function convertPdfToMarkdown<P extends PdfTextLayerPageLike>(
  doc: PdfTextLayerDocumentLike<P>,
  opts: ConvertPdfToMarkdownOptions,
): Promise<PdfMarkdownResult | null>;
export async function convertPdfToMarkdown<P extends PdfTextLayerPageLike>(
  doc: PdfTextLayerDocumentLike<P>,
  opts: ConvertPdfToMarkdownOptions = {},
): Promise<PdfMarkdownResult | null> {
  const layer = await readPdfTextLayer(doc, {
    links: true,
    cancelled: opts.cancelled,
    onPage: (_page, _content, n) => opts.onPage?.(n, doc.numPages),
  });
  return layer && pdfTextLayerToMarkdown(layer);
}

/**
 * The pure half of {@link convertPdfToMarkdown}: a text layer already read by
 * {@link readPdfTextLayer} (with `links: true`) to Markdown. Pass `map` when the
 * caller has built the canonical text for its own use — the regression corpus
 * gates on that text and must not assemble it twice.
 */
export function pdfTextLayerToMarkdown(
  layer: PdfTextLayer,
  map: PdfTextMap = buildPdfTextMap(layer.pageItems),
): PdfMarkdownResult {
  if (pdfLooksScanned(map, layer.pageCount)) return { ok: false, reason: 'scanned', pageCount: layer.pageCount };
  if (!map.text.trim()) return { ok: false, reason: 'empty', pageCount: layer.pageCount };
  const rendered = renderPdfMarkdown(map, layer.pageItems, layer.links);
  return {
    ok: true,
    markdown: `${rendered.markdown}\n`,
    pageCount: layer.pageCount,
    textLayerIssues: assessPdfTextLayer(layer.pageItems),
    links: rendered.links,
  };
}
