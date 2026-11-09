// Outline resolution: bookmarks first, tagged structure tree second, font-size
// heuristic third. These tests pin the cascade order and the flattening rules,
// because callers match section names against these titles verbatim.

import { describe, expect, it } from 'vitest';
import {
  cleanOutlineTitle,
  derivePdfStructOutline,
  outlineSectionForPage,
  resolvePdfOutline,
  resolvePdfOutlineAuto,
  type PdfOutlineAutoDocumentLike,
  type PdfOutlineEntry,
} from '../src/index.js';

describe('cleanOutlineTitle', () => {
  it('strips marker delimiters and collapses whitespace', () => {
    expect(cleanOutlineTitle('【第一章】\n  Introduction\tto  RAG ')).toBe('第一章 Introduction to RAG');
  });

  it('caps long titles', () => {
    const title = cleanOutlineTitle('x'.repeat(60));
    expect(title).toHaveLength(41);
    expect(title.endsWith('…')).toBe(true);
  });

  it('keeps a title that is exactly at the cap untouched', () => {
    const exact = 'y'.repeat(40);
    expect(cleanOutlineTitle(exact)).toBe(exact);
  });
});

describe('resolvePdfOutline', () => {
  const ref = { num: 7, gen: 0 };

  const doc = (outline: unknown, pageIndex = async () => 4) => ({
    getOutline: async () => outline as never,
    getDestination: async (id: string) => (id === 'ch2' ? [ref, { name: 'XYZ' }, null, 700] : null),
    getPageIndex: pageIndex,
  });

  it('flattens nested bookmarks with depths, pages and destination y', async () => {
    const entries = await resolvePdfOutline(doc([
      { title: 'Chapter 1', dest: [ref, { name: 'FitH' }, 650], items: [
        { title: '1.1 Scope', dest: [{ num: 8, gen: 0 }, { name: 'XYZ' }, 0, 400, 0] },
      ] },
      { title: 'Chapter 2', dest: 'ch2' },
    ]));
    // Stable sort by page: same-page entries keep document order, so a child
    // bookmark stays between its parent and the next chapter.
    expect(entries).toEqual([
      { title: 'Chapter 1', page: 5, y: 650, depth: 0 },
      { title: '1.1 Scope', page: 5, y: 400, depth: 1 },
      { title: 'Chapter 2', page: 5, y: 700, depth: 0 },
    ]);
  });

  it('skips bookmarks whose page cannot be resolved', async () => {
    const entries = await resolvePdfOutline(doc([
      { title: 'Broken', dest: [{ bad: true }, { name: 'XYZ' }] },
      { title: 'Good', dest: [ref, { name: 'XYZ' }, null, 10] },
    ], async () => { throw new Error('no such ref'); }));
    expect(entries).toEqual([]);
  });

  it('returns nothing when the PDF has no bookmarks', async () => {
    expect(await resolvePdfOutline(doc(null))).toEqual([]);
    expect(await resolvePdfOutline(doc([]))).toEqual([]);
  });

  it('stops at maxDepth', async () => {
    const deep = { title: 'Too deep', dest: [ref, { name: 'XYZ' }, null, 1], items: [
      { title: 'Deeper', dest: [ref, { name: 'XYZ' }, null, 1] },
    ] };
    const entries = await resolvePdfOutline(doc([{ title: 'Top', dest: [ref, { name: 'XYZ' }, null, 1], items: [deep] }]), 2);
    expect(entries.map((e) => e.title)).toEqual(['Top', 'Too deep']);
  });
});

describe('outlineSectionForPage', () => {
  const outline: PdfOutlineEntry[] = [
    { title: 'Intro', page: 1 },
    { title: 'Method', page: 5 },
  ];

  it('returns the last section starting at or before the page', () => {
    expect(outlineSectionForPage(outline, 3)).toBe('Intro');
    expect(outlineSectionForPage(outline, 5)).toBe('Method');
    expect(outlineSectionForPage(outline, 99)).toBe('Method');
  });

  it('returns undefined before the first section', () => {
    expect(outlineSectionForPage([{ title: 'Later', page: 4 }], 1)).toBeUndefined();
  });
});

/** A doc whose structure tree has two headings on page 1. */
function structDoc(): PdfOutlineAutoDocumentLike {
  const page = {
    view: [0, 0, 600, 800],
    getStructTree: async () => ({
      role: 'Document',
      children: [
        { role: 'H1', children: [{ type: 'content', id: 'p1_mc1' }] },
        { role: 'H2', children: [{ type: 'content', id: 'p1_mc2' }] },
      ],
    }),
    getTextContent: async () => ({
      items: [
        { type: 'beginMarkedContentProps', id: 'p1_mc1' },
        { str: 'Introduction', transform: [12, 0, 0, 12, 100, 700] },
        { type: 'endMarkedContent' },
        { type: 'beginMarkedContentProps', id: 'p1_mc2' },
        { str: 'Details', transform: [11, 0, 0, 11, 100, 650] },
        { type: 'endMarkedContent' },
      ],
    }),
  };
  return {
    numPages: 1,
    getPage: async () => page as never,
    getOutline: async () => null,
    getDestination: async () => null,
    getPageIndex: async () => 0,
  };
}

describe('derivePdfStructOutline', () => {
  it('reads heading roles through marked content and compacts their levels', async () => {
    const entries = await derivePdfStructOutline(structDoc());
    expect(entries.map((e) => [e.title, e.page, e.depth])).toEqual([
      ['Introduction', 1, 0],
      ['Details', 1, 1],
    ]);
  });

  it('yields nothing for an untagged document', async () => {
    const doc = { ...structDoc(), getPage: async () => ({ view: [0, 0, 600, 800], getStructTree: async () => null, getTextContent: async () => ({ items: [] }) }) as never };
    expect(await derivePdfStructOutline(doc)).toEqual([]);
  });
});

describe('resolvePdfOutlineAuto — cascade', () => {
  it('prefers bookmarks, then the structure tree', async () => {
    const withBookmarks = {
      ...structDoc(),
      getOutline: async () => [{ title: 'From bookmark', dest: [{}, { name: 'XYZ' }, null, 10] }],
      getPageIndex: async () => 0,
    };
    expect((await resolvePdfOutlineAuto(withBookmarks, [])).map((e) => e.title)).toEqual(['From bookmark']);

    const withoutBookmarks = structDoc();
    expect((await resolvePdfOutlineAuto(withoutBookmarks, [])).map((e) => e.title)).toEqual(['Introduction', 'Details']);
  });

  it('falls back to the text layer when there is no structure tree', async () => {
    const doc = {
      numPages: 1,
      getPage: async () => ({ view: [0, 0, 600, 800], getStructTree: async () => null, getTextContent: async () => ({ items: [] }) }) as never,
      getOutline: async () => null,
      getDestination: async () => null,
      getPageIndex: async () => 0,
    };
    // No styled pages either: the heuristic has nothing to work with.
    expect(await resolvePdfOutlineAuto(doc, [])).toEqual([]);
  });
});
