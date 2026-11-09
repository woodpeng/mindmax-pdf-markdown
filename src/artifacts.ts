// Tagged-PDF /Artifact detection: the deterministic channel for stripping page
// furniture. A Tagged PDF marks running headers, footers, page numbers and
// watermarks as `/Artifact` marked content — the producer telling us outright
// that the text is layout, not content. Where it exists this beats every
// geometric heuristic in text-map.ts, which stays as the fallback for the
// majority of PDFs that ship no tags at all.
//
// Feed the result into buildPdfTextMap. A caller that skips this pass builds
// different text from one that runs it, for the same PDF.

/** Marked-content stream item — `tag` is present at runtime (pdf.js emits it
 *  for begin/beginProps) even though its published typedef omits it. */
interface MarkedItemLike {
  type?: string;
  tag?: string | null;
  str?: string;
}

/** Structural subset of pdf.js PDFPageProxy this pass needs. */
export interface PdfArtifactPageLike {
  getTextContent(opts: { includeMarkedContent: boolean }): Promise<{ items: unknown[] }>;
}

/** Structural subset of pdf.js PDFPageProxy the tagging probe needs. */
export interface PdfTaggedProbePageLike {
  getStructTree(): Promise<unknown | null>;
}

/**
 * Is this document tagged at all? Untagged PDFs are the majority, and the
 * artifact pass costs a second text-content parse per page, so callers probe
 * the first page once and skip the whole pass when it comes back untagged.
 * Both sides run the same probe on the same document, so they either both take
 * the artifact channel or both fall back to geometry.
 */
export async function pdfIsTagged(firstPage: PdfTaggedProbePageLike): Promise<boolean> {
  const tree = await firstPage.getStructTree().catch(() => null);
  return tree !== null && tree !== undefined;
}

/** Ignore the tagging when it would swallow this much of a page: a producer
 *  that marks body copy as artifact is mis-tagged, and losing the page is far
 *  worse than keeping a header line. */
const MAX_ARTIFACT_SHARE = 0.4;

/**
 * Per-item `is artifact` flags for one page, aligned to the page's text items
 * in `getTextContent()` order (the same `'str' in item` sequence both callers
 * already hold — pdf.js emits identical text items with and without marked
 * content, only interleaving the scope markers).
 *
 * Returns an empty array when the page carries no artifact tagging, so callers
 * can treat "untagged" and "failed" identically and fall back to geometry.
 */
export async function collectPdfArtifactFlags(page: PdfArtifactPageLike): Promise<boolean[]> {
  const content = await page.getTextContent({ includeMarkedContent: true }).catch(() => null);
  if (!content) return [];

  const flags: boolean[] = [];
  let chars = 0;
  let artifactChars = 0;
  // Depth of open /Artifact scopes; nested marked content inside an artifact
  // stays artifact, so a counter is enough (no need to keep the tag stack).
  let depth = 0;
  let artifactDepth = 0;
  for (const raw of content.items) {
    const item = raw as MarkedItemLike;
    if (item.type === 'beginMarkedContent' || item.type === 'beginMarkedContentProps') {
      depth++;
      if (artifactDepth === 0 && item.tag === 'Artifact') artifactDepth = depth;
    } else if (item.type === 'endMarkedContent') {
      if (artifactDepth === depth) artifactDepth = 0;
      depth = Math.max(0, depth - 1);
    } else if (typeof item.str === 'string') {
      const isArtifact = artifactDepth > 0;
      flags.push(isArtifact);
      const n = item.str.replace(/\s+/g, '').length;
      chars += n;
      if (isArtifact) artifactChars += n;
    }
  }

  if (artifactChars === 0) return [];
  if (chars > 0 && artifactChars / chars > MAX_ARTIFACT_SHARE) return [];
  return flags;
}
