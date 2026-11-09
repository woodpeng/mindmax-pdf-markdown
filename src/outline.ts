// PDF bookmark outline → flat section entries.
//
// Titles pass through cleanOutlineTitle here, once. Callers that store a
// section name and later match it against an entry rely on both sides going
// through the same cleaning — otherwise a trailing page number or a stray
// space makes the strings differ while looking identical.

export interface PdfOutlineEntry {
  /** cleaned bookmark title (see cleanOutlineTitle) */
  title: string;
  /** 1-based page number */
  page: number;
  /** destination top in PDF user space (origin bottom-left), when the
   *  bookmark carries one (XYZ / FitH / FitBH destinations) */
  y?: number;
  /** nesting depth (0-based) */
  depth?: number;
}

interface PdfOutlineNodeLike {
  title: string;
  dest: string | unknown[] | null;
  items?: PdfOutlineNodeLike[] | null;
}

/** Structural subset of pdf.js PDFDocumentProxy this module needs — keeps
 *  core free of a pdfjs-dist dependency (same pattern as PdfTextItemLike). */
export interface PdfOutlineDocumentLike {
  getOutline(): Promise<PdfOutlineNodeLike[] | null>;
  getDestination(id: string): Promise<unknown[] | null>;
  getPageIndex(ref: object): Promise<number>;
}

const MAX_TITLE_CHARS = 40;

/** Normalize a bookmark title for markers and matching: strip the marker
 *  delimiters and line breaks, collapse whitespace, cap length. */
export function cleanOutlineTitle(title: string): string {
  const t = title.replace(/[【】\r\n\t]/g, ' ').replace(/\s+/g, ' ').trim();
  return t.length > MAX_TITLE_CHARS ? `${t.slice(0, MAX_TITLE_CHARS)}…` : t;
}

/** y coordinate of an explicit destination, for the kinds that carry one:
 *  [ref, {name:'XYZ'}, x, y, zoom] / [ref, {name:'FitH'|'FitBH'}, y]. */
function destY(dest: unknown[]): number | undefined {
  const kind = (dest[1] as { name?: unknown } | null | undefined)?.name;
  const y = kind === 'XYZ' ? dest[3] : kind === 'FitH' || kind === 'FitBH' ? dest[2] : undefined;
  return typeof y === 'number' && Number.isFinite(y) ? y : undefined;
}

async function pageOf(doc: PdfOutlineDocumentLike, ref: unknown): Promise<number | null> {
  // Explicit destinations normally hold a page ref object; some PDFs store a
  // 0-based page number instead.
  if (typeof ref === 'number') return Number.isInteger(ref) && ref >= 0 ? ref + 1 : null;
  if (ref === null || typeof ref !== 'object') return null;
  try {
    return (await doc.getPageIndex(ref)) + 1;
  } catch {
    return null;
  }
}

/**
 * Flatten a document's bookmark outline (top `maxDepth` levels — deeper
 * entries are noise for citations) into entries sorted by page. Bookmarks
 * whose destination can't be resolved are skipped; PDFs without a usable
 * outline yield [] and callers degrade to derived outlines (see
 * pdfDerivedOutline.ts) or page-only markers/jumps.
 */
export async function resolvePdfOutline(doc: PdfOutlineDocumentLike, maxDepth = 3): Promise<PdfOutlineEntry[]> {
  const roots = await doc.getOutline();
  if (!roots || roots.length === 0) return [];
  const entries: PdfOutlineEntry[] = [];
  const walk = async (nodes: PdfOutlineNodeLike[], depth: number): Promise<void> => {
    for (const node of nodes) {
      const dest = typeof node.dest === 'string'
        ? await doc.getDestination(node.dest).catch(() => null)
        : node.dest;
      if (Array.isArray(dest) && dest.length > 0) {
        const title = cleanOutlineTitle(node.title ?? '');
        const page = await pageOf(doc, dest[0]);
        if (title && page !== null) {
          const y = destY(dest);
          entries.push(y === undefined ? { title, page, depth: depth - 1 } : { title, page, y, depth: depth - 1 });
        }
      }
      if (depth < maxDepth && node.items && node.items.length > 0) await walk(node.items, depth + 1);
    }
  };
  await walk(roots, 1);
  // Stable sort: defends against out-of-order bookmarks while keeping
  // in-page document order.
  entries.sort((a, b) => a.page - b.page);
  return entries;
}

/** The section a page belongs to: the last outline entry starting at or
 *  before it. Mid-page section starts make any single per-page label
 *  approximate — this picks the section most of the page's content is in. */
export function outlineSectionForPage(outline: PdfOutlineEntry[], page: number): string | undefined {
  let current: string | undefined;
  for (const e of outline) {
    if (e.page > page) break;
    current = e.title;
  }
  return current;
}
