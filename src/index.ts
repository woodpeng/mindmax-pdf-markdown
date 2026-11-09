/**
 * PDF → Markdown.
 *
 * A PDF's text layer records where every character sits on the page. This
 * library rebuilds the document from that geometry — reading order across
 * columns, paragraph joins, headings, lists, tables, footnotes and links —
 * and returns Markdown that reads like the original.
 *
 * The conversion is split in two so callers can use either half:
 *
 *   1. `convertPdfToMarkdown(doc)` — hand it an opened pdf.js document and get
 *      Markdown back. It loads the text layer and renders it.
 *   2. `readPdfTextLayer(doc)` / `pdfTextLayerToMarkdown(layer)` — the same two
 *      halves, separately, for callers that already hold a text layer or want
 *      the structural text without the Markdown escaping pass.
 *
 * `buildPdfTextMap` is the structural core and is exported on its own: its
 * `text` output is the canonical reading text, with page and item ranges that
 * callers can anchor into.
 *
 * Nothing here depends on a pdf.js package at runtime. The `Pdf*Like` types are
 * structural, so any build of pdf.js — browser, Node legacy, or a stand-in in a
 * test — satisfies them.
 */

export {
  buildPdfTextMap,
  insertPdfPageMarkers,
  insertPdfPageMarkersSlice,
  pageNumberAtOffset,
  pdfItemStrOffset,
  pdfItemTextOffset,
} from './text-map.js';
export type {
  PdfItemTextRange,
  PdfPageTextMap,
  PdfTextItemLike,
  PdfTextMap,
  PdfTextRange,
} from './text-map.js';

export { readPdfTextLayer } from './text-layer.js';
export type {
  PdfLinkLike,
  PdfTextContentLike,
  PdfTextLayer,
  PdfTextLayerDocumentLike,
  PdfTextLayerPageLike,
  ReadPdfTextLayerOptions,
} from './text-layer.js';

export { convertPdfToMarkdown, pdfTextLayerToMarkdown, renderPdfMarkdown } from './markdown.js';
export type {
  ConvertPdfToMarkdownOptions,
  PdfMarkdownRender,
  PdfMarkdownResult,
} from './markdown.js';

export {
  BLANK_PAGE_CHARS,
  BLANK_PAGE_RATIO_FOR_SCAN,
  MIN_CHARS_PER_PDF_PAGE,
  assessPdfPageText,
  assessPdfTextLayer,
  decodePdfTextLayerIssues,
  encodePdfTextLayerIssues,
  isGarbledPage,
  isMathPage,
  pdfLooksScanned,
  plainTextLooksGarbled,
} from './quality.js';
export type { PdfPageTextQuality, PdfTextLayerIssues } from './quality.js';

export {
  cleanOutlineTitle,
  outlineSectionForPage,
  resolvePdfOutline,
} from './outline.js';
export type { PdfOutlineDocumentLike, PdfOutlineEntry } from './outline.js';

export {
  derivePdfHeuristicOutline,
  derivePdfStructOutline,
  resolvePdfOutlineAuto,
} from './derived-outline.js';
export type {
  PdfOutlineAutoDocumentLike,
  PdfStructPageLike,
  PdfStyledItemLike,
  PdfStyledPageLike,
} from './derived-outline.js';

export { collectPdfArtifactFlags, pdfIsTagged } from './artifacts.js';
export type { PdfArtifactPageLike, PdfTaggedProbePageLike } from './artifacts.js';

export { detectTables } from './table.js';
export type { TableBlock, TableItemLike } from './table.js';

/** Depth for a flat table of contents, inferred from its numbering
 *  (第X部/第X章/第X节, Chapter N, 1.2.3). Used by the PDF heuristic; exported
 *  because the same inference is useful on EPUB NCX and other flat TOCs. */
export { inferTocDepth } from './toc-depth.js';

/**
 * Bumped whenever `buildPdfTextMap().text` changes for the same input.
 *
 * Consumers that anchor annotations, comments or citations to character
 * offsets in that text MUST pin a minor version and re-anchor when this value
 * changes. Markdown rendering can change without bumping it: offsets are into
 * the canonical text, not into the rendered Markdown.
 */
export const CANONICAL_TEXT_VERSION = '1';
