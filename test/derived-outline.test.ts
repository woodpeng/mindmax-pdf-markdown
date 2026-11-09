// Tests for reading/pdfDerivedOutline: the heuristic (font-size/numbering)
// outline for PDFs with neither bookmarks nor tags. The struct-tree pass needs
// a live pdf.js document and is exercised end-to-end instead.

import { describe, expect, it } from 'vitest';
import { derivePdfHeuristicOutline, type PdfStyledPageLike } from '../src/derived-outline.js';

const HEIGHT = 800;

/** One text item on its own line at the given y / size. */
function line(str: string, y: number, size: number) {
  return { str, transform: [size, 0, 0, size, 72, y] };
}

/** A page of body text (size 10) with optional extra lines mixed in. */
function bodyPage(extra: { str: string; y: number; size: number }[] = []): PdfStyledPageLike {
  const items = [];
  for (let i = 0; i < 20; i++) {
    items.push(line(`这是一行普通的正文内容，用来撑起主字号的统计权重，第 ${i} 行。`, 700 - i * 25, 10));
  }
  for (const e of extra) items.push(line(e.str, e.y, e.size));
  return { items, height: HEIGHT };
}

describe('derivePdfHeuristicOutline', () => {
  it('finds larger-font headings and tiers depth by size', () => {
    const pages = [
      bodyPage([{ str: '第一章 绪论', y: 720, size: 18 }, { str: '研究背景', y: 400, size: 14 }]),
      bodyPage([{ str: '第二章 方法', y: 720, size: 18 }]),
    ];
    const outline = derivePdfHeuristicOutline(pages);
    expect(outline.map((e) => [e.title, e.page, e.depth])).toEqual([
      ['第一章 绪论', 1, 0],
      ['研究背景', 1, 1],
      ['第二章 方法', 2, 0],
    ]);
    // y points at the top of the glyphs (baseline + size) for scroll targets
    expect(outline[0]!.y).toBeCloseTo(738);
  });

  it('prefers numbering-pattern depth over size tiers when patterns discriminate', () => {
    const pages = [
      bodyPage([{ str: '第一章 绪论', y: 720, size: 18 }, { str: '第一节 背景', y: 400, size: 14 }]),
      bodyPage([{ str: '第二章 方法', y: 720, size: 18 }]),
    ];
    const outline = derivePdfHeuristicOutline(pages);
    expect(outline.map((e) => [e.title, e.depth])).toEqual([
      ['第一章 绪论', 0],
      ['第一节 背景', 1],
      ['第二章 方法', 0],
    ]);
  });

  it('accepts strong chapter numbering even at body size', () => {
    const pages = [
      bodyPage([{ str: '第一章 绪论', y: 500, size: 10 }]),
      bodyPage([{ str: '第二章 方法', y: 500, size: 10 }]),
    ];
    const titles = derivePdfHeuristicOutline(pages).map((e) => e.title);
    expect(titles).toEqual(['第一章 绪论', '第二章 方法']);
  });

  it('ignores running headers, page numbers and header/footer zones', () => {
    const pages = [1, 2, 3, 4].map((n) => bodyPage([
      { str: '深入理解某某系统', y: 770, size: 12 },   // running header (edge zone + repeats)
      { str: String(n), y: 20, size: 10 },              // page number
      { str: `第${n}章 标题`, y: 700, size: 18 },
    ]));
    const titles = derivePdfHeuristicOutline(pages).map((e) => e.title);
    expect(titles).toEqual(['第1章 标题', '第2章 标题', '第3章 标题', '第4章 标题']);
  });

  it('drops printed-TOC pages (leader dots or candidate floods)', () => {
    const tocLines = Array.from({ length: 12 }, (_, i) => (
      { str: `第${i + 1}章 标题………………${i + 10}`, y: 700 - i * 30, size: 10 }
    ));
    const pages = [
      bodyPage(tocLines),
      bodyPage([{ str: '第一章 绪论', y: 720, size: 18 }]),
      bodyPage([{ str: '第二章 方法', y: 720, size: 18 }]),
    ];
    const titles = derivePdfHeuristicOutline(pages).map((e) => e.title);
    expect(titles).toEqual(['第一章 绪论', '第二章 方法']);
  });

  it('returns [] when there is no heading evidence', () => {
    expect(derivePdfHeuristicOutline([bodyPage(), bodyPage()])).toEqual([]);
  });

  it('joins multi-item heading lines without inventing spaces', () => {
    const pages = [
      bodyPage([]),
      bodyPage([]),
    ];
    pages[0]!.items.push(
      { str: '第一章', transform: [18, 0, 0, 18, 72, 720] },
      { str: ' 绪论', transform: [18, 0, 0, 18, 130, 720] },
    );
    pages[1]!.items.push(line('第二章 方法', 720, 18));
    const titles = derivePdfHeuristicOutline(pages).map((e) => e.title);
    expect(titles).toEqual(['第一章 绪论', '第二章 方法']);
  });
});
