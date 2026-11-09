// Text-layer health check: does the extracted text look damaged, and does the
// page look like maths? The signals are counted, so these tests pin the
// thresholds rather than any heuristic taste.

import { describe, expect, it } from 'vitest';
import {
  BLANK_PAGE_CHARS,
  assessPdfPageText,
  assessPdfTextLayer,
  decodePdfTextLayerIssues,
  encodePdfTextLayerIssues,
  isGarbledPage,
  isMathPage,
  pdfLooksScanned,
  plainTextLooksGarbled,
} from '../src/index.js';
import { buildPdfTextMap, type PdfTextItemLike } from '../src/text-map.js';

const item = (str: string): PdfTextItemLike => ({ str, hasEOL: true });

/** Five private-use glyphs on five distinct code points: unmapped, not bullets. */
const GARBLED = '\uE000\uE001\uE002\uE003\uE004';

describe('garbled text', () => {
  it('flags a page whose unmapped glyphs are varied, not one glyph repeated', () => {
    expect(isGarbledPage(assessPdfPageText([item(`x ${GARBLED} y`)]))).toBe(true);
    // One private-use code point repeated 30 times is a Symbol-font bullet or a
    // circled footnote number, not a failed mapping.
    expect(isGarbledPage(assessPdfPageText([item(`x ${'\uE583'.repeat(30)} y`)]))).toBe(false);
  });

  it('ignores the Symbol/Wingdings range and replacement-free text', () => {
    expect(isGarbledPage(assessPdfPageText([item('✓ ✓ ✓ ✓ ✓ ordinary words here')]))).toBe(false);
    expect(isGarbledPage(assessPdfPageText([item('Plain prose, nothing wrong with it.')]))).toBe(false);
  });

  it('applies the same thresholds to plain text without geometry', () => {
    expect(plainTextLooksGarbled(`a ${GARBLED} b`)).toBe(true);
    expect(plainTextLooksGarbled('a normal sentence, no damage at all')).toBe(false);
  });
});

describe('maths pages', () => {
  it('counts maths symbols and reports a page of them', () => {
    const q = assessPdfPageText([item('f(x) = ∑∫ ≤ ∈ ∀ ∂')]);
    expect(q.mathSymbols).toBeGreaterThanOrEqual(6);
    expect(isMathPage(q)).toBe(true);
  });

  it('does not count prose Greek letters, but does count isolated ones', () => {
    const prose = assessPdfPageText([item('η ελληνική γλώσσα είναι παλιά')]);
    expect(isMathPage(prose)).toBe(false);
    const isolated = assessPdfPageText([item('where α is the rate and β the offset, so α β γ δ ε ζ η')]);
    expect(isolated.mathSymbols).toBeGreaterThan(0);
  });

  it('counts a flattened script by its geometry, not by its text', () => {
    const base = 'E = mc';
    const items: PdfTextItemLike[] = [
      { str: base, hasEOL: false, transform: [12, 0, 0, 12, 100, 700], width: 48, height: 12 },
      { str: '2', hasEOL: true, transform: [9, 0, 0, 9, 149, 705], width: 5, height: 9 },
    ];
    expect(assessPdfPageText(items).scripts).toBe(0); // a bare digit is not formula-like
    const withLetter: PdfTextItemLike[] = [
      { str: base, hasEOL: false, transform: [12, 0, 0, 12, 100, 700], width: 48, height: 12 },
      { str: 'n', hasEOL: true, transform: [9, 0, 0, 9, 149, 705], width: 5, height: 9 },
    ];
    expect(assessPdfPageText(withLetter).scripts).toBe(1);
  });
});

describe('assessPdfTextLayer', () => {
  it('returns null for a healthy document', () => {
    expect(assessPdfTextLayer([[item('An ordinary page of prose.')]])).toBeNull();
    expect(assessPdfTextLayer([])).toBeNull();
  });

  it('reports a short document on a single bad page', () => {
    const issues = assessPdfTextLayer([[item(`see ${'\uE000\uE001\uE002\uE003\uE004'} here`)]]);
    expect(issues).toEqual({ mathPages: 0, garbledPages: 1, pages: 1 });
  });

  it('needs a pattern before reporting a long document', () => {
    const bad = [item(`x ${GARBLED}`)];
    const good = [item('ordinary page of prose')];
    const one = assessPdfTextLayer([bad, good, good, good, good, good, good]);
    expect(one).toBeNull();
    const many = assessPdfTextLayer([bad, bad, bad, good, good, good, good]);
    expect(many?.garbledPages).toBe(3);
  });
});

describe('scanned detection', () => {
  const map = (text: string, pages: number) => buildPdfTextMap(Array.from({ length: pages }, () => [item(text)]));

  it('calls a document with almost no text a scan', () => {
    expect(pdfLooksScanned(map('a', 10), 10)).toBe(true);
  });

  it('keeps a sparse but real text layer', () => {
    expect(pdfLooksScanned(map('x'.repeat(BLANK_PAGE_CHARS + 5), 3), 3)).toBe(false);
  });

  it('does not call a text-rich document a scan even with blank pages', () => {
    const pages = Array.from({ length: 10 }, (_, i) => [item(i === 0 ? 'word '.repeat(300) : '')]);
    const rich = buildPdfTextMap(pages);
    expect(pdfLooksScanned(rich, 10)).toBe(false);
  });
});

describe('issues round-trip', () => {
  it('survives encode/decode', () => {
    const issues = { mathPages: 3, garbledPages: 1, pages: 40 };
    expect(decodePdfTextLayerIssues(encodePdfTextLayerIssues(issues))).toEqual(issues);
  });

  it('rejects anything that is not a non-empty verdict', () => {
    expect(decodePdfTextLayerIssues('nope')).toBeUndefined();
    expect(decodePdfTextLayerIssues('{not json')).toBeUndefined();
    expect(decodePdfTextLayerIssues(JSON.stringify({ v: { mathPages: 0, garbledPages: 0, pages: 9 } }))).toBeUndefined();
    expect(decodePdfTextLayerIssues(JSON.stringify({ v: { mathPages: 1, pages: 'x' } }))).toBeUndefined();
  });
});
