// The one pdf.js text-layer pass every PDF consumer runs before buildPdfTextMap.
//
// Anything that reads a PDF needs the same per-page inputs: the text items
// (with `/Artifact` flags resolved on tagged PDFs) for buildPdfTextMap, and the
// styled pages for resolvePdfOutlineAuto. Those inputs decide the canonical
// text, and every offset anyone stores is an offset into that text — so they
// must be gathered identically by every caller. One implementation here,
// instead of a copy per caller, is what keeps that true.
//
// Structural types only: this package does not depend on pdfjs-dist. Callers
// pass their own pdf.js document (browser build, Node legacy build, or a fake).

import { collectPdfArtifactFlags, pdfIsTagged, type PdfArtifactPageLike, type PdfTaggedProbePageLike } from './artifacts.js';
import type { PdfStyledPageLike } from './derived-outline.js';
import type { PdfTextItemLike } from './text-map.js';

/** Structural subset of pdf.js TextContent. */
export interface PdfTextContentLike {
  items: unknown[];
}

/** Structural subset of pdf.js PDFPageProxy the text-layer pass reads. */
export interface PdfTextLayerPageLike extends PdfArtifactPageLike, PdfTaggedProbePageLike {
  getTextContent(opts?: { includeMarkedContent?: boolean }): Promise<PdfTextContentLike>;
  /** [x1, y1, x2, y2] page box in user space. */
  view: number[];
  getAnnotations?(opts?: { intent?: string }): Promise<unknown[]>;
}

/** Structural subset of pdf.js PDFDocumentProxy. */
export interface PdfTextLayerDocumentLike<P extends PdfTextLayerPageLike = PdfTextLayerPageLike> {
  numPages: number;
  getPage(pageNumber: number): Promise<P>;
}

/** A web/mail hyperlink annotation on a page. */
export interface PdfLinkLike {
  url: string;
  /** [x1, y1, x2, y2] in PDF user space — the same space as text item transforms. */
  rect: [number, number, number, number];
}

export interface PdfTextLayer {
  pageCount: number;
  /** Per page, the text items buildPdfTextMap takes (artifact flags resolved). */
  pageItems: PdfTextItemLike[][];
  /** Per page, the input resolvePdfOutlineAuto takes. */
  styledPages: PdfStyledPageLike[];
  /** Per page hyperlinks; only filled when `links: true` was asked for. */
  links: PdfLinkLike[][];
}

export interface ReadPdfTextLayerOptions<P extends PdfTextLayerPageLike> {
  /** Also collect hyperlink annotations (costs one annotation parse per page). */
  links?: boolean;
  /** Called after each page's text content is read — the reading view keeps
   *  the page proxies and text contents for drawing its text layer. */
  onPage?: (page: P, content: Awaited<ReturnType<P['getTextContent']>>, pageNumber: number) => void;
  /** Polled between pages; returning true abandons the pass (result null). */
  cancelled?: () => boolean;
}

/** Text items of a getTextContent() result. Without includeMarkedContent pdf.js
 *  emits only TextItems, so the filter is a guard, not a reordering: indices
 *  stay aligned with the page's text-layer divs. */
function textItemsOf(content: PdfTextContentLike): PdfTextItemLike[] {
  return content.items.filter((item): item is PdfTextItemLike =>
    typeof item === 'object' && item !== null && typeof (item as { str?: unknown }).str === 'string');
}

/** Only the fields buildPdfTextMap reads — copied explicitly so every caller
 *  feeds the identical item shape whatever its pdf.js build adds. */
function toTextItem(it: PdfTextItemLike, artifact: boolean | undefined): PdfTextItemLike {
  return {
    str: it.str,
    hasEOL: it.hasEOL,
    transform: it.transform,
    width: it.width,
    height: it.height,
    fontName: it.fontName,
    ...(artifact !== undefined ? { artifact } : {}),
  };
}

const SAFE_LINK_RE = /^(?:https?:\/\/|mailto:)/i;

async function pageLinks(page: PdfTextLayerPageLike): Promise<PdfLinkLike[]> {
  if (!page.getAnnotations) return [];
  const annotations = await page.getAnnotations({ intent: 'display' }).catch(() => [] as unknown[]);
  const links: PdfLinkLike[] = [];
  for (const raw of annotations) {
    const a = raw as { subtype?: unknown; url?: unknown; rect?: unknown };
    if (a.subtype !== 'Link' || typeof a.url !== 'string' || !SAFE_LINK_RE.test(a.url)) continue;
    if (!Array.isArray(a.rect) || a.rect.length < 4 || !a.rect.every((n) => typeof n === 'number' && Number.isFinite(n))) continue;
    const [x1, y1, x2, y2] = a.rect as number[];
    links.push({
      url: a.url,
      rect: [Math.min(x1!, x2!), Math.min(y1!, y2!), Math.max(x1!, x2!), Math.max(y1!, y2!)],
    });
  }
  return links;
}

/**
 * Read every page's text layer once. Tagged PDFs declare their running
 * heads/footers as `/Artifact` — the one non-heuristic way to strip them — so
 * the first page is probed and, when tagged, each page gets an artifact pass.
 */
export async function readPdfTextLayer<P extends PdfTextLayerPageLike>(
  doc: PdfTextLayerDocumentLike<P>,
  opts?: ReadPdfTextLayerOptions<P> & { cancelled?: undefined },
): Promise<PdfTextLayer>;
export async function readPdfTextLayer<P extends PdfTextLayerPageLike>(
  doc: PdfTextLayerDocumentLike<P>,
  opts: ReadPdfTextLayerOptions<P>,
): Promise<PdfTextLayer | null>;
export async function readPdfTextLayer<P extends PdfTextLayerPageLike>(
  doc: PdfTextLayerDocumentLike<P>,
  opts: ReadPdfTextLayerOptions<P> = {},
): Promise<PdfTextLayer | null> {
  const pageCount = doc.numPages;
  const pageItems: PdfTextItemLike[][] = [];
  const styledPages: PdfStyledPageLike[] = [];
  const links: PdfLinkLike[][] = [];
  const tagged = pageCount > 0 && await pdfIsTagged(await doc.getPage(1));
  for (let i = 1; i <= pageCount; i++) {
    if (opts.cancelled?.()) return null;
    const page = await doc.getPage(i);
    const content = await page.getTextContent() as Awaited<ReturnType<P['getTextContent']>>;
    const artifacts = tagged ? await collectPdfArtifactFlags(page) : [];
    if (opts.cancelled?.()) return null;
    opts.onPage?.(page, content, i);
    const items = textItemsOf(content);
    const useArtifacts = artifacts.length === items.length;
    pageItems.push(items.map((it, k) => toTextItem(it, useArtifacts ? artifacts[k] : undefined)));
    styledPages.push({ items, height: page.view[3]! - page.view[1]! });
    if (opts.links) links.push(await pageLinks(page));
  }
  return { pageCount, pageItems, styledPages, links };
}
