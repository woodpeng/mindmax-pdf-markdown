// Tests for reading/pdfMarkdown + reading/pdfTextLayer: the export layer over
// buildPdfTextMap must escape only the PDF's own characters (never the syntax
// the assembler wrote) and carry hyperlink annotations over.

import { describe, expect, it } from 'vitest';
import { buildPdfTextMap, type PdfTextItemLike } from '../src/text-map.js';
import { convertPdfToMarkdown, renderPdfMarkdown } from '../src/markdown.js';
import { readPdfTextLayer, type PdfLinkLike, type PdfTextLayerPageLike } from '../src/text-layer.js';

/** Plain-text items (no geometry → legacy assembly): one line each. */
const lines = (...strs: string[]): PdfTextItemLike[] => strs.map((str) => ({ str, hasEOL: true }));

const md = (pages: PdfTextItemLike[][], links?: PdfLinkLike[][]): string =>
  renderPdfMarkdown(buildPdfTextMap(pages), pages, links).markdown;

/** One item per visual line with geometry: transform = [h,0,0,h,x,y]. */
const gi = (str: string, x: number, y: number, w: number, h = 12): PdfTextItemLike =>
  ({ str, hasEOL: true, transform: [h, 0, 0, h, x, y], width: w, height: h });

describe('renderPdfMarkdown — escaping', () => {
  it('escapes inline syntax characters that come from the PDF', () => {
    expect(md([lines('Costs $5 and $10 * 2 `x` a\\b ~ok~')])).toBe(
      'Costs \\$5 and \\$10 \\* 2 \\`x\\` a\\\\b \\~ok\\~',
    );
  });

  it('keeps word-internal underscores and plain citation brackets', () => {
    expect(md([lines('snake_case _lead see [12] and [3, 4]')])).toBe('snake_case \\_lead see [12] and [3, 4]');
  });

  it('escapes brackets only where Markdown would parse them', () => {
    expect(md([lines('a [label](x) b [^1] c')])).toBe('a \\[label](x) b \\[^1] c');
  });

  it('escapes HTML-looking tags, entities and highlight marks, not comparisons', () => {
    expect(md([lines('<div> a < b &amp; AT&T ==hi==')])).toBe('\\<div> a < b \\&amp; AT&T \\==hi\\==');
  });

  it('neutralizes line-start syntax the PDF text happens to open with', () => {
    expect(md([lines('# not a heading')])).toBe('\\# not a heading');
    expect(md([lines('> not a quote')])).toBe('\\> not a quote');
    expect(md([lines('1990. A year, not a list')])).toBe('1990\\. A year, not a list');
  });

  it('never escapes the syntax the assembler wrote', () => {
    const page: PdfTextItemLike[] = [
      gi('目录', 100, 700, 40),
      gi('• 引言', 100, 680, 80),
      gi('• 方法', 100, 664, 80),
    ];
    expect(md([page])).toBe('目录\n\n- 引言\n\n- 方法');
  });
});

describe('renderPdfMarkdown — links', () => {
  const page: PdfTextItemLike[] = [
    { str: 'Read the ', transform: [12, 0, 0, 12, 100, 700], width: 50, height: 12 },
    { str: 'project page', transform: [12, 0, 0, 12, 150, 700], width: 70, height: 12 },
    { str: ' for details.', hasEOL: true, transform: [12, 0, 0, 12, 220, 700], width: 60, height: 12 },
  ];

  it('wraps the covered run in [text](url)', () => {
    const links: PdfLinkLike[][] = [[{ url: 'https://example.com/p', rect: [149, 697, 221, 712] }]];
    expect(md([page], links)).toBe('Read the [project page](https://example.com/p) for details.');
  });

  it('leaves a link alone when its box covers only part of a run', () => {
    const links: PdfLinkLike[][] = [[{ url: 'https://example.com/p', rect: [150, 697, 170, 712] }]];
    expect(md([page], links)).toBe('Read the project page for details.');
  });

  it('does not wrap a printed URL that is its own link', () => {
    const urlPage: PdfTextItemLike[] = [
      { str: 'https://example.com/', hasEOL: true, transform: [12, 0, 0, 12, 100, 700], width: 120, height: 12 },
    ];
    const links: PdfLinkLike[][] = [[{ url: 'https://example.com', rect: [99, 697, 221, 712] }]];
    expect(md([urlPage], links)).toBe('https://example.com/');
  });

  it('puts a destination with spaces or parentheses in angle brackets', () => {
    const links: PdfLinkLike[][] = [[{ url: 'https://en.wikipedia.org/wiki/Set_(mathematics)', rect: [149, 697, 221, 712] }]];
    expect(md([page], links)).toBe('Read the [project page](<https://en.wikipedia.org/wiki/Set_(mathematics)>) for details.');
  });
});

/** Minimal pdf.js stand-in for the async pass. */
function fakeDoc(pages: { items: PdfTextItemLike[]; annotations?: unknown[] }[]) {
  const proxies: PdfTextLayerPageLike[] = pages.map((p) => ({
    view: [0, 0, 600, 800],
    getStructTree: async () => null,
    getTextContent: async () => ({ items: p.items }),
    getAnnotations: async () => p.annotations ?? [],
  }));
  return { numPages: proxies.length, getPage: async (n: number) => proxies[n - 1]! };
}

describe('readPdfTextLayer / convertPdfToMarkdown', () => {
  it('collects only safe web links, rect normalized', async () => {
    const doc = fakeDoc([{
      items: lines('x'),
      annotations: [
        { subtype: 'Link', url: 'https://a.example', rect: [10, 20, 5, 2] },
        { subtype: 'Link', url: 'javascript:alert(1)', rect: [0, 0, 1, 1] },
        { subtype: 'Widget', url: 'https://b.example', rect: [0, 0, 1, 1] },
      ],
    }]);
    const layer = await readPdfTextLayer(doc, { links: true });
    expect(layer?.links).toEqual([[{ url: 'https://a.example', rect: [5, 2, 10, 20] }]]);
  });

  it('stops when cancelled', async () => {
    const doc = fakeDoc([{ items: lines('a') }, { items: lines('b') }]);
    expect(await readPdfTextLayer(doc, { cancelled: () => true })).toBeNull();
  });

  it('reports a PDF without a text layer as scanned', async () => {
    const doc = fakeDoc([{ items: [] }, { items: [] }]);
    expect(await convertPdfToMarkdown(doc)).toEqual({ ok: false, reason: 'scanned', pageCount: 2 });
  });

  it('converts a text PDF end to end', async () => {
    const body = 'This page has enough ordinary text to count as a real text layer, priced at $5 per copy for everyone.';
    const doc = fakeDoc([{ items: lines(body) }]);
    const result = await convertPdfToMarkdown(doc);
    expect(result).toMatchObject({ ok: true, pageCount: 1, links: 0 });
    expect(result?.ok && result.markdown).toBe(`${body.replace('$', '\\$')}\n`);
  });
});
