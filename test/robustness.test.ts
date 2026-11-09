// Malformed and hostile input. A PDF text layer is untrusted data: coordinates
// can be NaN, pages can be empty, one item can be a whole book. None of that may
// throw, hang, or write "NaN" into the output.

import { describe, expect, it } from 'vitest';
import {
  buildPdfTextMap,
  convertPdfToMarkdown,
  readPdfTextLayer,
  renderPdfMarkdown,
  type PdfTextItemLike,
  type PdfTextLayerPageLike,
} from '../src/index.js';

const item = (str: string, extra: Partial<PdfTextItemLike> = {}): PdfTextItemLike => ({ str, hasEOL: true, ...extra });

describe('buildPdfTextMap — degenerate documents', () => {
  it('handles no pages and empty pages', () => {
    expect(buildPdfTextMap([]).text).toBe('');
    const empty = buildPdfTextMap([[], [], []]);
    expect(empty.text).toBe('');
    expect(empty.pages).toHaveLength(3);
  });

  it('accepts items with no geometry at all', () => {
    expect(buildPdfTextMap([[item('a'), item('b')]]).text).toBe('a\nb');
  });

  it('falls back to the legacy assembly when a transform is too short to use', () => {
    const map = buildPdfTextMap([[item('a', { transform: [12, 0, 0] }), item('b', { transform: [12, 0, 0] })]]);
    expect(map.text).toBe('a\nb');
  });

  it('survives non-finite coordinates without leaking them into the text', () => {
    const pages = [[
      item('first line of text', { transform: [12, 0, 0, 12, Number.NaN, 700], width: 100, height: 12 }),
      item('second line of text', { transform: [12, 0, 0, 12, 100, Number.POSITIVE_INFINITY], width: 100, height: 12 }),
      item('third line of text', { transform: [12, 0, 0, 12, 100, 660], width: 100, height: 12 }),
    ]];
    const map = buildPdfTextMap(pages);
    expect(map.text).toContain('first line of text');
    expect(map.text).not.toMatch(/NaN|Infinity/);
  });

  it('keeps every range inside the text and ordered', () => {
    const map = buildPdfTextMap([
      [item('alpha', { transform: [12, 0, 0, 12, 100, 700], width: 30, height: 12 })],
      [item('beta', { transform: [12, 0, 0, 12, 100, 700], width: 30, height: 12 })],
    ]);
    for (const page of map.pages) {
      expect(page.start).toBeGreaterThanOrEqual(0);
      expect(page.end).toBeLessThanOrEqual(map.text.length);
      expect(page.start).toBeLessThanOrEqual(page.end);
      for (const r of page.items) {
        expect(r.start).toBeGreaterThanOrEqual(page.start);
        expect(r.end).toBeLessThanOrEqual(page.end);
      }
    }
  });

  it('is deterministic', () => {
    const pages = [[item('one', { transform: [12, 0, 0, 12, 10, 10], width: 20, height: 12 })]];
    expect(buildPdfTextMap(pages).text).toBe(buildPdfTextMap(pages).text);
  });

  it('does not blow up on a very long single item or many duplicate items', () => {
    const long = 'word '.repeat(20_000);
    expect(buildPdfTextMap([[item(long)]]).text.length).toBe(long.trimEnd().length);
    const dup = buildPdfTextMap([[item('same'), item('same'), item('same')]]);
    expect(dup.text.split('\n')).toHaveLength(3);
  });

  it('keeps an empty item as a blank line without corrupting neighbouring offsets', () => {
    expect(buildPdfTextMap([[item('left'), item(''), item('right')]]).text).toBe('left\n\nright');
  });
});

describe('renderPdfMarkdown — degenerate input', () => {
  it('renders an empty map as an empty string', () => {
    const map = buildPdfTextMap([]);
    expect(renderPdfMarkdown(map, []).markdown).toBe('');
  });

  it('does not mutate the map it is given', () => {
    const pages = [[item('a $5 note', { transform: [12, 0, 0, 12, 10, 10], width: 40, height: 12 })]];
    const map = buildPdfTextMap(pages);
    const before = map.text;
    renderPdfMarkdown(map, pages, []);
    expect(map.text).toBe(before);
    expect(pages[0]![0]!.str).toBe('a $5 note');
  });
});

describe('readPdfTextLayer — hostile documents', () => {
  const page = (items: unknown[], annotations?: () => Promise<unknown[]>): PdfTextLayerPageLike => ({
    view: [0, 0, 600, 800],
    getStructTree: async () => null,
    getTextContent: async () => ({ items }),
    ...(annotations ? { getAnnotations: annotations } : {}),
  });

  it('accepts an empty document', async () => {
    const layer = await readPdfTextLayer({ numPages: 0, getPage: async () => page([]) });
    expect(layer?.pageCount).toBe(0);
    expect(layer?.pageItems).toEqual([]);
  });

  it('drops items that are not text items', async () => {
    const layer = await readPdfTextLayer({
      numPages: 1,
      getPage: async () => page([null, 42, 'stray', { str: 'kept' }]),
    });
    expect(layer?.pageItems[0]!.map((i) => i.str)).toEqual(['kept']);
  });

  it('treats a page without getAnnotations as having no links', async () => {
    const layer = await readPdfTextLayer({ numPages: 1, getPage: async () => page([{ str: 'x' }]) }, { links: true });
    expect(layer?.links).toEqual([[]]);
  });

  it('treats a failing annotation read as having no links', async () => {
    const layer = await readPdfTextLayer(
      { numPages: 1, getPage: async () => page([{ str: 'x' }], async () => { throw new Error('broken'); }) },
      { links: true },
    );
    expect(layer?.links).toEqual([[]]);
  });

  it('converts an empty document to "scanned" rather than throwing', async () => {
    const doc = { numPages: 1, getPage: async () => page([]) };
    expect(await convertPdfToMarkdown(doc)).toEqual({ ok: false, reason: 'scanned', pageCount: 1 });
  });
});
