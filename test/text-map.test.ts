// Tests for reading/pdfText: the extracted-text ↔ PDF text-layer mapping must
// exactly reproduce the historical extraction algorithm (main process) while
// tracking page/item offsets for the renderer (spec 20 §2).

import { describe, expect, it } from 'vitest';
import {
  buildPdfTextMap,
  insertPdfPageMarkers,
  pageNumberAtOffset,
  pdfItemStrOffset,
  pdfItemTextOffset,
  type PdfTextItemLike,
} from '../src/text-map.js';
import { cleanOutlineTitle, outlineSectionForPage } from '../src/outline.js';
import { collectPdfArtifactFlags } from '../src/artifacts.js';

/** The pre-spec-20 extraction algorithm, verbatim — outputs must stay equal. */
function legacyExtract(pages: PdfTextItemLike[][]): string {
  const parts: string[] = [];
  for (const items of pages) {
    let t = '';
    for (const it of items) t += it.str + (it.hasEOL ? '\n' : '');
    parts.push(t.trim());
  }
  return parts.join('\n\n').trim();
}

const p1: PdfTextItemLike[] = [
  { str: 'Hello ' }, { str: 'world', hasEOL: true }, { str: 'line2', hasEOL: true },
];
const p2: PdfTextItemLike[] = [{ str: '  Page two starts here' }, { str: ' and ends.', hasEOL: true }];
const blank: PdfTextItemLike[] = [{ str: '   ', hasEOL: true }];

describe('buildPdfTextMap', () => {
  it('matches the legacy extraction text', () => {
    const map = buildPdfTextMap([p1, p2]);
    expect(map.text).toBe(legacyExtract([p1, p2]));
  });

  it('item ranges slice back to the item text', () => {
    const map = buildPdfTextMap([p1, p2]);
    const page0 = map.pages[0];
    expect(map.text.slice(page0.items[0].start, page0.items[0].end)).toBe('Hello ');
    expect(map.text.slice(page0.items[1].start, page0.items[1].end)).toBe('world');
    const page1 = map.pages[1];
    expect(map.text.slice(page1.start, page1.end)).toBe('Page two starts here and ends.');
    expect(map.text.slice(page1.items[0].start, page1.items[0].end)).toBe('Page two starts here');
  });

  it('handles blank edge pages and \\r normalization', () => {
    const p: PdfTextItemLike[] = [{ str: 'A\r\nB' }, { str: '\rC', hasEOL: true }];
    const map = buildPdfTextMap([blank, p, blank]);
    expect(map.text).toBe('A\nB\nC');
    expect(map.pages[0].start).toBe(map.pages[0].end);
    expect(map.text.slice(map.pages[1].items[0].start, map.pages[1].items[0].end)).toBe('A\nB');
  });

  it('records srcStart when trimming cuts into an item', () => {
    const map = buildPdfTextMap([p2]);
    expect(map.pages[0].items[0].srcStart).toBe(2);      // page-leading '  ' trimmed
    expect(map.pages[0].items[1].srcStart).toBe(0);
    // document-level trim cutting into the first non-blank page
    const map2 = buildPdfTextMap([blank, [{ str: '  X' }]]);
    expect(map2.text).toBe('X');
    expect(map2.pages[1].items[0].srcStart).toBe(2);
  });

  it('handles an effectively empty PDF', () => {
    const map = buildPdfTextMap([blank]);
    expect(map.text).toBe('');
    expect(map.pages).toHaveLength(1);
  });
});

describe('buildPdfTextMap — geometry-aware paragraph reconstruction', () => {
  // One item per visual line (hasEOL each). transform = [h,0,0,h,x,y]:
  // e(4)=x, f(5)=y baseline. Lines descend the page as y decreases.
  const gi = (str: string, x: number, y: number, w: number, h = 12): PdfTextItemLike =>
    ({ str, hasEOL: true, transform: [h, 0, 0, h, x, y], width: w, height: h });

  it('joins CJK soft-wrapped lines and splits at short sentence-final lines', () => {
    const page: PdfTextItemLike[] = [
      gi('第四部分系统比较哈蒂与杜威的教育哲学揭示', 100, 700, 300), // full-width wrap
      gi('二者的深层亲缘性。', 100, 684, 150),                       // short + 。 → ends para
      gi('第五部分作为结论正面阐述这一论题。', 100, 668, 160),        // next paragraph
    ];
    const map = buildPdfTextMap([page]);
    expect(map.text).toBe(
      '第四部分系统比较哈蒂与杜威的教育哲学揭示二者的深层亲缘性。\n\n第五部分作为结论正面阐述这一论题。',
    );
    // Item ranges still slice back exactly (anchor mapping intact).
    const it0 = map.pages[0].items[0];
    expect(map.text.slice(it0.start, it0.end)).toBe('第四部分系统比较哈蒂与杜威的教育哲学揭示');
    const it2 = map.pages[0].items[2];
    expect(map.text.slice(it2.start, it2.end)).toBe('第五部分作为结论正面阐述这一论题。');
  });

  it('treats list-marker lines as separate blocks (目录)', () => {
    const page: PdfTextItemLike[] = [
      gi('目录', 100, 700, 40),
      gi('- 引言', 100, 680, 80),
      gi('- 研究方法与文献说明', 100, 664, 160),
      gi('- 第一章 结果与效率', 100, 648, 160),
    ];
    const map = buildPdfTextMap([page]);
    expect(map.text).toBe('目录\n\n- 引言\n\n- 研究方法与文献说明\n\n- 第一章 结果与效率');
  });

  it('joins Western wraps with a space and de-hyphenates line-end hyphens', () => {
    const wrap: PdfTextItemLike[] = [gi('hello', 100, 700, 200), gi('world today.', 100, 684, 200)];
    expect(buildPdfTextMap([wrap]).text).toBe('hello world today.');

    const hyphen: PdfTextItemLike[] = [gi('The estab-', 100, 700, 250), gi('lished order.', 100, 684, 120)];
    const map = buildPdfTextMap([hyphen]);
    expect(map.text).toBe('The established order.');
    const it0 = map.pages[0].items[0];
    expect(map.text.slice(it0.start, it0.end)).toBe('The estab'); // trailing '-' dropped
  });

  it('stitches a paragraph that continues across a page break', () => {
    const p1: PdfTextItemLike[] = [gi('这一段在页尾没有写完继续到', 100, 120, 300)]; // runs to margin, no 。
    const p2: PdfTextItemLike[] = [gi('下一页开头接着往下讲。', 100, 700, 300)];
    expect(buildPdfTextMap([p1, p2]).text).toBe('这一段在页尾没有写完继续到下一页开头接着往下讲。');
  });

  it('splits pages with \\n\\n when the previous page ends a sentence', () => {
    const p1: PdfTextItemLike[] = [gi('上一页在这里结束。', 100, 120, 150)]; // short + 。
    const p2: PdfTextItemLike[] = [gi('新一页另起一段。', 100, 700, 150)];
    expect(buildPdfTextMap([p1, p2]).text).toBe('上一页在这里结束。\n\n新一页另起一段。');
  });

  it('promotes larger-font chapter/section lines to markdown headings, split off from body', () => {
    // Body copy at h=12 (the doc-wide dominant size); headings set larger.
    // Before the fix "1.1 …" ran straight into the body paragraph below it.
    const page: PdfTextItemLike[] = [
      gi('第一章 结果与效率', 100, 700, 200, 18),                    // # via 第X章 + larger font
      gi('1.1 方法论基础', 100, 676, 160, 15),                      // ## via dotted numbering
      gi('哈蒂研究纲领的方法论起点是对教育实证研究现状', 100, 656, 320), // body, wraps
      gi('的直接回应他将八百余项元分析纳入统一的比较', 100, 640, 320),   // wrap continuation
      gi('框架。', 100, 624, 60),                                    // short + 。 closes the paragraph
    ];
    const map = buildPdfTextMap([page]);
    expect(map.text).toBe(
      '# 第一章 结果与效率\n\n## 1.1 方法论基础\n\n'
      + '哈蒂研究纲领的方法论起点是对教育实证研究现状的直接回应他将八百余项元分析纳入统一的比较框架。',
    );
    // The `#`/`##` prefixes map to no item; item text still slices back exactly.
    const h1 = map.pages[0].items[0];
    expect(map.text.slice(h1.start, h1.end)).toBe('第一章 结果与效率');
    const h2 = map.pages[0].items[1];
    expect(map.text.slice(h2.start, h2.end)).toBe('1.1 方法论基础');
    const body = map.pages[0].items[2];
    expect(map.text.slice(body.start, body.end)).toBe('哈蒂研究纲领的方法论起点是对教育实证研究现状');
  });
});

describe('buildPdfTextMap — list blocks (hanging indent)', () => {
  const gi = (str: string, x: number, y: number, w: number, h = 12, fontName?: string): PdfTextItemLike =>
    ({ str, hasEOL: true, transform: [h, 0, 0, h, x, y], width: w, height: h, fontName });

  // A reference list: markers at the left margin, wrapped lines hanging-indented
  // to the text column. Before the fix each wrap became a '\n\n' mid-entry.
  const refs: PdfTextItemLike[] = [
    gi('1. Dewey, J. (1916). Democracy and Education: An Introduction to the Philosophy of', 100, 700, 400),
    gi('Education. New York: Macmillan.', 118, 684, 180),
    gi('2. Dewey, J. (1933). How We Think: A Restatement of the Relation of Reflective Thinking', 100, 668, 400),
    gi('to the Educative Process. Boston: D. C. Heath.', 118, 652, 250),
    gi('3. Dewey, J. (1938). Experience and Education. New York: Macmillan.', 100, 636, 330),
  ];

  it('rejoins hanging-indent wraps into their list item', () => {
    const map = buildPdfTextMap([refs]);
    expect(map.text).toBe(
      '1. Dewey, J. (1916). Democracy and Education: An Introduction to the Philosophy of Education. New York: Macmillan.'
      + '\n\n2. Dewey, J. (1933). How We Think: A Restatement of the Relation of Reflective Thinking to the Educative Process. Boston: D. C. Heath.'
      + '\n\n3. Dewey, J. (1938). Experience and Education. New York: Macmillan.',
    );
    const wrap = map.pages[0].items[1];
    expect(map.text.slice(wrap.start, wrap.end)).toBe('Education. New York: Macmillan.');
  });

  it('joins all lines of a three-line item, ignoring pdf.js zero-width EOL items', () => {
    // pdf.js closes a visual line with an empty zero-width item parked back at
    // the block's marker column. Counted into the line box it reported the
    // third line as starting 18pt left of the second, and the item's tail was
    // split off as its own block.
    const eol = (x: number): PdfTextItemLike =>
      ({ str: '', hasEOL: true, transform: [11, 0, 0, 11, x, 0], width: 0, height: 0 });
    const seg = (str: string, x: number, y: number, w: number): PdfTextItemLike =>
      ({ str, hasEOL: false, transform: [11, 0, 0, 11, x, y], width: w, height: 11 });
    const page: PdfTextItemLike[] = [
      seg('本文正文段落写到右边距为止用来确立页面的正文列与行距。', 72, 730, 460), eol(72),
      seg('16. Bergeron, P.-J., & Rivard, L. (2017). How to Engage in Pseudoscience with Real Data: A', 90, 700, 447), eol(90),
      seg('Criticism of John Hattie\'s Arguments in Visible Learning from the Perspective of a', 108, 685, 395), eol(90),
      seg('Statistician. McGill Journal of Education, 52(1).', 108, 670, 228), eol(90),
      seg('17. Prange, K. (2005). Die Zeigestruktur der Erziehung.', 90, 655, 250), eol(90),
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text).toContain(
      '16. Bergeron, P.-J., & Rivard, L. (2017). How to Engage in Pseudoscience with Real Data: '
      + 'A Criticism of John Hattie\'s Arguments in Visible Learning from the Perspective of a '
      + 'Statistician. McGill Journal of Education, 52(1).\n\n17. Prange',
    );
  });

  it('continues a list item across a page break', () => {
    const p1 = [refs[0]!];
    const p2 = [gi('Education. New York: Macmillan.', 118, 700, 180)];
    expect(buildPdfTextMap([p1, p2]).text).toBe(
      '1. Dewey, J. (1916). Democracy and Education: An Introduction to the Philosophy of Education. New York: Macmillan.',
    );
  });

  it('a short numbered line never absorbs the indented paragraph below it', () => {
    // Same-size "1. 引言" (heading detection off): guard A — the marker line
    // stopped far short of the right margin, so it never wrapped.
    const page: PdfTextItemLike[] = [
      gi('1. 引言', 100, 700, 60),
      gi('哈蒂研究纲领的方法论起点是对教育实证研究现状的直接回应他将八百余项', 124, 680, 400),
      gi('元分析纳入统一的比较框架。', 100, 664, 150),
    ];
    expect(buildPdfTextMap([page]).text).toBe(
      '1. 引言\n\n哈蒂研究纲领的方法论起点是对教育实证研究现状的直接回应他将八百余项元分析纳入统一的比较框架。',
    );
  });

  it('keeps a first-line-indented paragraph out of the list above it (lookahead)', () => {
    const page: PdfTextItemLike[] = [
      gi('1. 第一条要点在这里展开说明并且一直写到右边距为止形成折行', 100, 700, 400),
      gi('继续写完这一条的剩余内容。', 118, 684, 160),
      gi('　这是一个另起的自然段它的首行有缩进而后续行回到左边距上', 118, 660, 400),
      gi('后续行确实回到了页面左边距。', 100, 644, 170),
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text).toContain('形成折行继续写完这一条的剩余内容。');
    expect(text).toContain('。\n\n这是一个另起的自然段');
  });

  it('opens a list that starts directly under a heading', () => {
    const page: PdfTextItemLike[] = [
      gi('研究方法', 100, 700, 120, 18),                                        // heading (larger font)
      gi('• 第一条要点在这里展开说明并且一直写到右边距为止形成折行', 100, 676, 400),
      gi('继续写完这一条的剩余内容。', 118, 660, 160),
    ];
    expect(buildPdfTextMap([page]).text).toBe(
      '# 研究方法\n\n- 第一条要点在这里展开说明并且一直写到右边距为止形成折行继续写完这一条的剩余内容。',
    );
  });

  it('restores the space pdf.js drops between a number marker and its text', () => {
    // The marker and the text are separate runs; nothing bridges the tab stop.
    const page: PdfTextItemLike[] = [
      { str: '1.', hasEOL: false, transform: [12, 0, 0, 12, 90, 700], width: 10, height: 12 },
      { str: 'Dewey, J. (1916). Democracy and Education: An Introduction to the Philosophy of', hasEOL: true, transform: [12, 0, 0, 12, 113, 700], width: 380, height: 12 },
      { str: 'Education. New York: Macmillan.', hasEOL: true, transform: [12, 0, 0, 12, 113, 684], width: 180, height: 12 },
    ];
    const map = buildPdfTextMap([page]);
    expect(map.text).toBe(
      '1. Dewey, J. (1916). Democracy and Education: An Introduction to the Philosophy of Education. New York: Macmillan.',
    );
    const body = map.pages[0].items[1];
    expect(map.text.slice(body.start, body.end))
      .toBe('Dewey, J. (1916). Democracy and Education: An Introduction to the Philosophy of');
  });

  it('normalizes bullet glyphs to markdown "- "', () => {
    const page: PdfTextItemLike[] = [
      gi('• 引言', 100, 700, 80),
      gi('• 研究方法与文献说明', 100, 684, 160),
    ];
    const map = buildPdfTextMap([page]);
    expect(map.text).toBe('- 引言\n\n- 研究方法与文献说明');
    const it0 = map.pages[0].items[0];
    expect(map.text.slice(it0.start, it0.end)).toBe('引言');   // '• ' replaced by the prefix
    expect(it0.srcStart).toBe(2);
  });
});

describe('buildPdfTextMap — indented blocks and wrapped headings', () => {
  const gi = (str: string, x: number, y: number, w: number, h = 12): PdfTextItemLike =>
    ({ str, hasEOL: true, transform: [h, 0, 0, h, x, y], width: w, height: h });

  it('keeps an indented quote block as one paragraph', () => {
    // Quotes are inset on BOTH sides, so their lines never reach the page's
    // right margin — they are measured against their own column.
    const page: PdfTextItemLike[] = [
      gi('杜威在经验与自然中写道:', 72, 700, 200),
      gi('"工具的使用意味着可以对自然能量的分布与运作作出预测在工具的', 102, 670, 390),
      gi('使用之中理智才开始介入自然使自然依照人的目的而被重新建构', 102, 654, 370),
      gi('起来。"', 102, 638, 60),
      gi('这里杜威揭示了技术使用与理智活动之间的深层关联。', 72, 608, 300),
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text).toContain('可以对自然能量的分布与运作作出预测在工具的使用之中理智才开始介入自然使自然依照人的目的而被重新建构起来。"');
    expect(text).toContain('。"\n\n这里杜威揭示了');
  });

  it('joins a heading that wrapped onto a second line', () => {
    const page: PdfTextItemLike[] = [
      gi('John Dewey on the Humanization of Technology and', 72, 700, 460, 20),
      gi('the Future of Education', 72, 673, 200, 20),   // gap 27 ≈ 1.36 × 20
      gi('John Dewey (1859–1952) stands as one of the most influential', 72, 630, 460),
      gi('philosophers of the twentieth century, and his work on the', 72, 614, 450),
      gi('relation between technology and experience remains widely', 72, 598, 445),
      gi('discussed today.', 72, 582, 130),
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text.startsWith('# John Dewey on the Humanization of Technology and the Future of Education\n\n')).toBe(true);
    expect(text).not.toContain('# the Future');
  });

  it('recovers a heading whose first half was rejected for its trailing comma', () => {
    const page: PdfTextItemLike[] = [
      gi('2. Philosophical Foundations of Dewey Thought: Pragmatism,', 72, 700, 440, 16),
      gi('Instrumentalism, and Naturalism', 72, 678, 230, 16),
      gi('To understand Dewey reflections on technology and education,', 72, 640, 460),
      gi('one must first grasp his philosophical foundations, which he', 72, 624, 455),
      gi('preferred to call instrumentalism rather than pragmatism, a', 72, 608, 450),
      gi('label he thought too loose.', 72, 592, 210),
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text.startsWith('## 2. Philosophical Foundations of Dewey Thought: Pragmatism, Instrumentalism, and Naturalism\n\n')).toBe(true);
  });

  it('does not merge two adjacent headings that merely share a size', () => {
    const page: PdfTextItemLike[] = [
      gi('第一章 结果与效率', 72, 700, 150, 18),
      gi('第二章 教育学的对象', 72, 660, 170, 18),   // short first line → never wrapped
      gi('哈蒂研究纲领的方法论起点是对教育实证研究现状的直接回应他将八百余项', 72, 620, 440),
      gi('元分析纳入统一的比较框架并以效应量作为共同的量尺贯穿全部章节的', 72, 604, 430),
      gi('论述与判断。', 72, 588, 90),
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text).toContain('# 第一章 结果与效率\n\n# 第二章 教育学的对象');
  });
});

describe('buildPdfTextMap — same-size headings (font identity + isolation)', () => {
  const gi = (str: string, x: number, y: number, w: number, fontName: string, h = 12): PdfTextItemLike =>
    ({ str, hasEOL: true, transform: [h, 0, 0, h, x, y], width: w, height: h, fontName });

  /** Body copy at 16pt leading — the page's normal line spacing. */
  const body = (y: number, extra = false): PdfTextItemLike[] => [
    gi('哈蒂的研究纲领以元分析为基础在方法论上追求可比的效应量', 100, y, 400, 'body'),
    gi('并把课堂实践排成一份可操作的清单它的方法论起点是对教育', 100, y - 16, 400, 'body'),
    gi('实证研究现状的直接回应他将八百余项元分析纳入统一的比较', 100, y - 32, 400, 'body'),
    ...(extra ? [gi('框架并以效应量作为共同的量尺贯穿全部章节的论述。', 100, y - 48, 380, 'body')] : []),
  ];

  it('promotes an isolated same-size line set in a non-body font', () => {
    const page: PdfTextItemLike[] = [
      ...body(700, true),
      gi('参考文献', 100, 612, 60, 'bold'),         // same size, own font, air above and below
      ...body(574, true),
    ];
    expect(buildPdfTextMap([page]).text).toContain('\n\n## 参考文献\n\n');
  });

  it('does not promote the same line when it is set in the body font', () => {
    const page: PdfTextItemLike[] = [
      ...body(700, true),
      gi('参考文献', 100, 612, 60, 'body'),
      ...body(574, true),
    ];
    expect(buildPdfTextMap([page]).text).not.toContain('#');
  });

  it('promotes a lone same-size numbered chapter line even in the body font', () => {
    const page: PdfTextItemLike[] = [
      ...body(700, true),
      gi('第二章 经验与思维', 100, 612, 140, 'body'),
      ...body(574, true),
    ];
    expect(buildPdfTextMap([page]).text).toContain('\n\n# 第二章 经验与思维\n\n');
  });

  it('does not promote members of a numbered series (a list, not headings)', () => {
    const page: PdfTextItemLike[] = [
      ...body(700, true),
      gi('第一章 教育的目的', 100, 612, 140, 'body'),
      gi('第二章 经验与思维', 100, 572, 140, 'body'),
      gi('第三章 民主与教育', 100, 532, 140, 'body'),
    ];
    expect(buildPdfTextMap([page]).text).not.toContain('#');
  });

  it('ignores a running header that repeats at the same page edge', () => {
    // Set larger than body, so the size gate would promote it — only the
    // repeat across pages says it is furniture.
    const mk = (n: number): PdfTextItemLike[] => [
      gi(`第 ${n} 页 · 教育哲学导论`, 100, 700, 160, 'bold', 16),
      ...body(660, true),
    ];
    expect(buildPdfTextMap([mk(1), mk(2), mk(3)]).text).not.toContain('#');
    // Two pages is not yet a pattern — the same line still reads as a heading.
    expect(buildPdfTextMap([mk(1), mk(2)]).text).toContain('## 第 1 页 · 教育哲学导论');
  });

  it('never promotes a page-opening line on same-size evidence alone', () => {
    // A paragraph continuing onto the next page: short first line, own font
    // mix, air below — everything but MEASURED air above, which it cannot have.
    const pages: PdfTextItemLike[][] = [
      body(700, true),
      [gi('个最尖锐的批评它是否遗忘了民主?', 100, 700, 200, 'italic'), ...body(660, true)],
    ];
    expect(buildPdfTextMap(pages).text).not.toContain('#');
  });

  it('keeps a chapter title that also runs as a page header', () => {
    // The header is set at body size in a heading font — exactly what gate 2
    // promotes — so only the size bucket in the running-header key tells the
    // three repeats apart from the one large title on the chapter's own page.
    const headerPage = (): PdfTextItemLike[] => [
      gi('第二章 经验与思维', 100, 700, 140, 'bold'),
      ...body(660, true),
    ];
    const pages: PdfTextItemLike[][] = [
      headerPage(), headerPage(), headerPage(),
      [gi('第二章 经验与思维', 100, 700, 200, 'bold', 20), ...body(660, true)],
    ];
    const text = buildPdfTextMap(pages).text;
    expect(text).toContain('# 第二章 经验与思维');
    expect(text.match(/#+ 第二章 经验与思维/g)).toHaveLength(1);   // only the large one
  });
});

describe('pageNumberAtOffset', () => {
  it('maps offsets to pages, skipping blank pages', () => {
    const map = buildPdfTextMap([blank, [{ str: 'A\nB' }, { str: 'C', hasEOL: true }]]);
    expect(pageNumberAtOffset(map, 0)).toBe(2);
    expect(pageNumberAtOffset(map, map.text.length - 1)).toBe(2);
    expect(pageNumberAtOffset(map, -1)).toBeNull();
  });

  it('resolves between-page offsets to the nearest page before', () => {
    const map = buildPdfTextMap([p1, p2]);
    const gap = map.pages[0].end;   // inside the '\n\n' separator
    expect(pageNumberAtOffset(map, gap)).toBe(1);
  });
});

describe('insertPdfPageMarkers', () => {
  it('inserts markers at page starts (prefix-shifted)', () => {
    const map = buildPdfTextMap([p1, p2]);
    const prefix = '# doc\n\n';
    const marked = insertPdfPageMarkers(prefix + map.text, map.pages.map((p) => p.start + prefix.length));
    expect(marked).toContain('【第1页】');
    expect(marked).toContain('【第2页】\nPage two');
  });

  it('keeps original page numbers across blank pages', () => {
    const map = buildPdfTextMap([p1, blank, p2]);
    const marked = insertPdfPageMarkers(map.text, map.pages.map((p) => p.start));
    expect(marked).toContain('【第3页】\nPage two');
  });

  it('ignores out-of-range offsets', () => {
    expect(insertPdfPageMarkers('abc', [999])).toBe('abc');
    expect(insertPdfPageMarkers('abc', [])).toBe('abc');
  });
});

describe('section-tagged markers (pdfOutline)', () => {
  const outline = [
    { title: '引言', page: 1, y: 700 },
    { title: '方法', page: 2 },
  ];

  it('tags markers with the section active at each page', () => {
    const map = buildPdfTextMap([p1, p2]);
    const marked = insertPdfPageMarkers(map.text, map.pages.map((p) => p.start), outline);
    expect(marked).toContain('【第1页·引言】');
    expect(marked).toContain('【第2页·方法】\nPage two');
  });

  it('falls back to page-only markers before the first section', () => {
    const map = buildPdfTextMap([p1, p2]);
    const marked = insertPdfPageMarkers(map.text, map.pages.map((p) => p.start), [{ title: '方法', page: 2 }]);
    expect(marked).toContain('【第1页】');
    expect(marked).toContain('【第2页·方法】');
  });

  it('inserts markdown headings at outline pages, before the page marker', () => {
    const map = buildPdfTextMap([p1, p2]);
    const marked = insertPdfPageMarkers(map.text, map.pages.map((p) => p.start), [
      { title: '引言', page: 1 },
      { title: '方法', page: 2, depth: 1 },
    ]);
    expect(marked).toContain('# 引言\n【第1页·引言】');
    expect(marked).toContain('## 方法\n【第2页·方法】\nPage two');
  });

  it('stacks multiple outline entries starting on the same page', () => {
    const map = buildPdfTextMap([p1, p2]);
    const marked = insertPdfPageMarkers(map.text, map.pages.map((p) => p.start), [
      { title: '第一章', page: 2 },
      { title: '1.1 背景', page: 2, depth: 1 },
    ]);
    expect(marked).toContain('# 第一章\n## 1.1 背景\n【第2页·1.1 背景】');
  });

  it('outlineSectionForPage picks the last section at or before the page', () => {
    expect(outlineSectionForPage(outline, 1)).toBe('引言');
    expect(outlineSectionForPage(outline, 3)).toBe('方法');
    expect(outlineSectionForPage([{ title: '方法', page: 2 }], 1)).toBeUndefined();
  });

  it('cleanOutlineTitle strips delimiters, collapses whitespace, caps length', () => {
    expect(cleanOutlineTitle('  2.1 【方法】\n概述\t ')).toBe('2.1 方法 概述');
    expect(cleanOutlineTitle('x'.repeat(60))).toBe(`${'x'.repeat(40)}…`);
  });
});

// ── Page furniture, reading order, footnotes, tables (layout pass) ──────────

describe('buildPdfTextMap — running headers and footers', () => {
  const gi = (str: string, x: number, y: number, w: number, h = 12, fontName = 'body'): PdfTextItemLike =>
    ({ str, hasEOL: true, transform: [h, 0, 0, h, x, y], width: w, height: h, fontName });

  /** Four body lines at 16pt leading, running to the right margin. `n` keeps
   *  each page's copy distinct — real body text does not repeat, and the
   *  repeat rule is what identifies furniture. */
  const body = (y: number, n = 0): PdfTextItemLike[] => [
    gi(`哈蒂的研究纲领以元分析为基础在方法论上追求可比的效应量而第${n}`, 100, y, 400),
    gi('把课堂实践排成一份可操作的清单它的方法论起点是对教育实证', 100, y - 16, 400),
    gi('研究现状的直接回应他将八百余项元分析纳入统一的比较框架并', 100, y - 32, 400),
    gi(`以效应量作为共同的量尺贯穿全部章节的论述与判断第${n}`, 100, y - 48, 400),
  ];

  it('drops a running header that pdf.js emits at the END of the page stream', () => {
    // The real shape of the bug: the header is drawn last, so stream order
    // splices it into the last sentence of the page it heads.
    const page = (n: number): PdfTextItemLike[] => [
      ...body(700, n),
      gi(`06/04/2026, 10:15 第${n}章 道家的天下教育学`, 60, 740, 300, 8, 'small'),
    ];
    const text = buildPdfTextMap([page(1), page(2), page(3)]).text;
    expect(text).not.toContain('道家的天下教育学');
    expect(text).not.toContain('06/04/2026');
  });

  it('drops a bare page number and stitches the paragraph across it', () => {
    const p1: PdfTextItemLike[] = [...body(700, 1), gi('1', 300, 40, 8, 10)];
    const p2: PdfTextItemLike[] = [...body(700, 2), gi('2', 300, 40, 8, 10)];
    const text = buildPdfTextMap([p1, p2]).text;
    expect(text).not.toMatch(/^\d+$/m);
    // the last body line of page 1 runs straight into the first of page 2
    expect(text).toContain('贯穿全部章节的论述与判断第1哈蒂的研究纲领');
  });

  it('keeps furniture out of the page metrics, so the body is not read as indented', () => {
    // The footer starts 40pt left of the text column. Counted into bodyLeft it
    // made every body line look first-line-indented, splitting the paragraph
    // at every wrap.
    const page = (n: number): PdfTextItemLike[] => [
      ...body(700, n),
      gi(`https://example.com/doc ${n}/9`, 60, 40, 480, 8, 'small'),
    ];
    const text = buildPdfTextMap([page(1), page(2), page(3)]).text;
    expect(text).not.toContain('example.com');
    // one unbroken paragraph — every wrap would have been a '\n\n' when the
    // footer's left edge counted as the page's text column
    expect(text).toContain(
      '哈蒂的研究纲领以元分析为基础在方法论上追求可比的效应量而第1把课堂实践排成一份可操作的清单'
      + '它的方法论起点是对教育实证研究现状的直接回应他将八百余项元分析纳入统一的比较框架并'
      + '以效应量作为共同的量尺贯穿全部章节的论述与判断第1',
    );
  });

  it('keeps a body-size line at the page edge that neither repeats nor is a number', () => {
    const p1: PdfTextItemLike[] = [gi('这一页开头另有一句话', 100, 760, 200), ...body(700, 1)];
    const p2: PdfTextItemLike[] = [gi('另一页开头的另一句话', 100, 760, 200), ...body(700, 2)];
    const text = buildPdfTextMap([p1, p2]).text;
    expect(text).toContain('这一页开头另有一句话');
    expect(text).toContain('另一页开头的另一句话');
  });

  it('never empties a sparse page', () => {
    // Three lines, all of them separated: the walk stops two lines short.
    const page: PdfTextItemLike[] = [
      gi('1', 300, 760, 8, 10), gi('孤零零的一行正文', 100, 600, 200), gi('2', 300, 40, 8, 10),
    ];
    expect(buildPdfTextMap([page, page, page]).text).toContain('孤零零的一行正文');
  });
});

describe('buildPdfTextMap — heading size ladder', () => {
  const gi = (str: string, x: number, y: number, w: number, h = 12, fontName = 'body'): PdfTextItemLike =>
    ({ str, hasEOL: true, transform: [h, 0, 0, h, x, y], width: w, height: h, fontName });
  const body = (y: number, n = 0): PdfTextItemLike[] => [
    gi(`庄子与孟子共处于战国中期面对着同一个历史现实旧有的礼乐秩第${n}`, 100, y, 400),
    gi('序已经崩塌诸侯争霸的暴力政治日趋残酷知识分子们面临一个根', 100, y - 16, 400),
    gi(`本性的时代问题在这样的乱世中人应当如何保存自己的生命第${n}`, 100, y - 32, 380),
  ];

  it('never nests a larger heading under a smaller one', () => {
    // 15pt lands on ### by ratio and 12pt bold on ## by the same-size rule —
    // the inversion the document-wide ladder exists to repair.
    const page: PdfTextItemLike[] = [
      gi('第一节 庄子一书的背景', 100, 740, 200, 18, 'bold'),
      ...body(700, 1),
      gi('一、问题的提出', 100, 620, 160, 15, 'bold'),
      ...body(580, 2),
      gi('（一）战国时代', 100, 500, 140, 12, 'bold'),
      ...body(460, 3),
    ];
    const text = buildPdfTextMap([page]).text;
    const level = (title: string): number =>
      new RegExp(`(#+) ${title.replace(/[（）]/g, (c) => `\\${c}`)}`).exec(text)![1]!.length;
    expect(text).toContain('# 第一节 庄子一书的背景');
    expect(level('第一节 庄子一书的背景')).toBeLessThan(level('一、问题的提出'));
    expect(level('一、问题的提出')).toBeLessThan(level('（一）战国时代'));
  });

  it('promotes a heading set like the others even at a page edge, where air cannot be measured', () => {
    // isIsolated needs measured air on BOTH sides; the last line of a page has
    // none below it. Three confirmed headings in the same style vouch for it.
    const withHeading = (title: string, n: number): PdfTextItemLike[] => [
      ...body(700, n), gi(title, 100, 600, 140, 12, 'bold'), ...body(560, n + 10),
    ];
    const pages: PdfTextItemLike[][] = [
      withHeading('（一）文本现状', 1),
      withHeading('（二）内篇的地位', 2),
      withHeading('（三）老庄之别', 3),
      [...body(700, 4), gi('（四）内篇的核心地位与教育哲学地图', 100, 600, 260, 12, 'bold')],
    ];
    expect(buildPdfTextMap(pages).text).toContain('（四）内篇的核心地位与教育哲学地图');
    expect(buildPdfTextMap(pages).text).toMatch(/#+ （四）内篇的核心地位与教育哲学地图/);
  });
});

describe('buildPdfTextMap — false-positive headings (prose / formulas / figure labels)', () => {
  const gi = (str: string, x: number, y: number, w: number, h = 10, fontName = 'body', hasEOL = true): PdfTextItemLike =>
    ({ str, hasEOL, transform: [h, 0, 0, h, x, y], width: w, height: h, fontName });

  /** English body copy at 10pt — the paper's dominant size. */
  const enBody = (y: number, n = 0): PdfTextItemLike[] => [
    gi(`Recurrent neural networks, long short-term memory and gated recurrent ${n}`, 100, y, 400),
    gi('networks in particular, have been firmly established as state of the art', 100, y - 14, 400),
    gi('approaches in sequence modeling and transduction problems such as', 100, y - 28, 400),
  ];

  it('does not promote attribution prose that merely sits at heading size', () => {
    // "Attention Is All You Need" page 1: the Google reproduction grant is set
    // in the same 12pt face as "Abstract" and opens the TOC with a 78-char
    // sentence if the size gate alone decides.
    const page: PdfTextItemLike[] = [
      gi('Provided proper attribution is provided, Google hereby grants permission to', 100, 740, 450, 12, 'note'),
      gi('reproduce the tables and figures in this paper solely for use in journalistic or', 100, 726, 450, 12, 'note'),
      gi('scholarly works.', 100, 712, 120, 12, 'note'),
      gi('Abstract', 100, 680, 80, 12, 'head'),
      ...enBody(650),
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text.startsWith('Provided proper attribution is provided')).toBe(true);
    expect(text).not.toContain('# Provided');
    expect(text).toContain('## Abstract');
  });

  it('does not promote formulas as headings', () => {
    const page: PdfTextItemLike[] = [
      ...enBody(700),
      gi('MultiHead(Q, K, V ) = Concat(head1, ..., headh)W O', 100, 620, 320, 12, 'math'),
      ...enBody(580),
    ];
    expect(buildPdfTextMap([page]).text).not.toContain('#');
  });

  it('does not promote heatmap axis labels scattered at caption size', () => {
    // Attention-map pages: isolated tokens at slightly under body size, each on
    // its own baseline so isolation looks perfect. "we"/"application" must not
    // become chapters just because they are not set in a body font.
    const page: PdfTextItemLike[] = [
      ...enBody(700),
      gi('The', 130, 620, 30, 9.3, 'lab'),
      gi('Law', 145, 618, 30, 9.3, 'lab'),
      gi('will', 160, 616, 30, 9.3, 'lab'),
      gi('we', 200, 560, 20, 9.3, 'lab'),
      gi('application', 220, 500, 60, 9.3, 'lab'),
      gi('Input-Input Layer5', 100, 440, 160, 16, 'fig'),
      ...enBody(400),
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text).not.toContain('#');
    expect(text).toContain('we');
    expect(text).toContain('application');
    expect(text).toContain('Input-Input Layer5');
  });

  it('keeps a real section head that shares a hasEOL run with a figure label', () => {
    // Page 13 of "Attention Is All You Need": "Attention Visualizations" and
    // "Input-Input Layer5" are one hasEOL group at different baselines — they
    // used to concatenate into one bogus chapter title.
    const page: PdfTextItemLike[] = [
      ...enBody(740),
      gi('Attention Visualizations', 108, 710, 160, 12, 'head', false),
      gi('Input-Input Layer5', 108, 715, 170, 16.3, 'fig', true),
      gi('It', 127, 632, 12, 7.8, 'lab'),
      gi('is', 139, 632, 12, 7.8, 'lab'),
      ...enBody(580),
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text).toContain('## Attention Visualizations');
    expect(text).not.toContain('Attention VisualizationsInput-Input');
    expect(text).not.toContain('# Input-Input Layer5');
    expect(text).not.toContain('Attention Visualizations\nInput-Input Layer5');
  });
});

describe('buildPdfTextMap — footnotes', () => {
  const gi = (str: string, x: number, y: number, w: number, h = 12): PdfTextItemLike =>
    ({ str, hasEOL: true, transform: [h, 0, 0, h, x, y], width: w, height: h, fontName: 'body' });
  const body = (y: number): PdfTextItemLike[] => [
    gi('值得注意的是这种稀少的历史记录本身正符合庄子的哲学立场庄', 100, y, 400),
    gi('子是一个刻意抵抗被历史记录的思想家他用毕生精力告诉我们任', 100, y - 16, 400),
    gi('何被固定在历史记录中的我都已经不是真实', 100, y - 32, 400),
  ];

  it('keeps the note as its own block, never soft-joined to the body', () => {
    const p1: PdfTextItemLike[] = [
      ...body(700),
      gi('¹ 关于庄孟之争的思想史分析参见葛兆光中国思想史第一卷', 100, 560, 400, 10),
      gi('上海复旦大学出版社2001年第286340页', 100, 544, 300, 10),
    ];
    const p2: PdfTextItemLike[] = [gi('的我名与实之间永远有无法弥合的裂缝。', 100, 700, 300)];
    const text = buildPdfTextMap([p1, p2]).text;
    // note text survives, as one paragraph, joined across its own wrap
    expect(text).toContain(
      '\n\n¹ 关于庄孟之争的思想史分析参见葛兆光中国思想史第一卷上海复旦大学出版社2001年第286340页\n\n',
    );
    // the body line before it keeps its own paragraph, and the next page opens
    // a new one — a page whose text ends in a note cannot be stitched across
    // without gluing the note to it.
    expect(text).toContain('都已经不是真实\n\n¹');
    expect(text.endsWith('\n\n的我名与实之间永远有无法弥合的裂缝。')).toBe(true);
  });
});

describe('buildPdfTextMap — reading order', () => {
  const gi = (str: string, x: number, y: number, w: number, h = 12): PdfTextItemLike =>
    ({ str, hasEOL: true, transform: [h, 0, 0, h, x, y], width: w, height: h, fontName: 'body' });

  it('reads by geometry, not by the order the producer drew the lines in', () => {
    // The real case: pdf.js hands back the running header last, and anything
    // drawn out of order lands wherever the producer put it in the stream.
    const page: PdfTextItemLike[] = [
      gi('第二句画在下面而在流里排在前面。', 100, 680, 200),
      gi('第一句画在上面。', 100, 700, 200),
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text.indexOf('第一句')).toBeLessThan(text.indexOf('第二句'));
  });

  it('reads a two-column layout column by column', () => {
    const col = (x: number, tag: string): PdfTextItemLike[] =>
      [0, 1, 2, 3, 4, 5].map((k) => gi(`${tag}${k}的这一行文字排满整栏宽度`, x, 700 - k * 16, 200));
    // interleaved in the stream, as a producer drawing row by row would
    const left = col(80, '左');
    const right = col(320, '右');
    const page: PdfTextItemLike[] = [];
    for (let k = 0; k < 6; k++) { page.push(left[k]!, right[k]!); }
    const text = buildPdfTextMap([page]).text;
    expect(text.indexOf('左5')).toBeLessThan(text.indexOf('右0'));
  });

  it('reads a three-column page whose gutters are narrower than an em', () => {
    // The Federal Register: three 168pt columns, 9pt gutters, 10pt type. The
    // middle column alone holds no more lines than the "thinly covered"
    // allowance, so the sweep sees one run from the first gutter to the
    // second — both gutters must still be cut, or the page reads as a table.
    const col = (x: number, tag: string): PdfTextItemLike[] =>
      Array.from({ length: 12 }, (_, k) => gi(`${tag}${k} line of running prose set to the measure`, x, 700 - k * 11, 168, 10));
    const page = [...col(45, 'L'), ...col(222, 'M'), ...col(399, 'R')];
    const text = buildPdfTextMap([page]).text;
    expect(text).not.toContain('|');
    expect(text.indexOf('L11')).toBeLessThan(text.indexOf('M0'));
    expect(text.indexOf('M11')).toBeLessThan(text.indexOf('R0'));
  });

  it('reads columns under a title that spans both of them', () => {
    // The spanning line crosses every gutter, so it cannot be allowed to veto
    // the column split; it separates the strip above from the strip below.
    const col = (x: number, tag: string, y0: number): PdfTextItemLike[] =>
      [0, 1, 2, 3, 4, 5].map((k) => gi(`${tag}${k}的这一行文字排满整栏宽度`, x, y0 - k * 16, 200));
    const page: PdfTextItemLike[] = [
      gi('一篇论文的标题横跨两栏排在页面的最上方位置', 80, 740, 440, 18),
      ...col(80, '左', 700), ...col(320, '右', 700),
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text.indexOf('论文的标题')).toBeLessThan(text.indexOf('左0'));
    expect(text.indexOf('左5')).toBeLessThan(text.indexOf('右0'));
  });

  // A Chinese journal page: A4, 10.3pt body, columns 231.6pt wide with a 21pt
  // gutter that full-width punctuation hanging at the left column's edge
  // narrows to ~15pt. Paragraphs open with a 2em indent in both columns.
  const cjkCol = (x: number, tag: string, y0: number, n = 6): PdfTextItemLike[] =>
    [...Array(n)].map((_, k) => gi(
      `${tag}${k}${k === n - 1 ? '收尾。' : '的这一行文字排满整栏宽度，'}`,
      k === 0 ? x + 20.6 : x, y0 - k * 16, k === 0 ? 211 : (k === n - 1 ? 120 : 237.4), 10.3,
    ));

  it('finds a narrow CJK gutter narrowed further by hanging punctuation', () => {
    const page: PdfTextItemLike[] = [...cjkCol(63.9, '左', 700), ...cjkCol(316.7, '右', 700)];
    const text = buildPdfTextMap([page]).text;
    expect(text.indexOf('左5')).toBeLessThan(text.indexOf('右0'));
    expect(text).not.toContain('|');
  });

  it('measures indents against the line\'s own column, not the page', () => {
    // Against the page's left edge every right-column line is "indented", and
    // each one used to open a new paragraph.
    const page: PdfTextItemLike[] = [...cjkCol(63.9, '左', 700), ...cjkCol(316.7, '右', 700)];
    const text = buildPdfTextMap([page]).text;
    expect(text).toContain('右0的这一行文字排满整栏宽度，右1');
    expect(text).toContain('右4的这一行文字排满整栏宽度，右5收尾。');
  });

  it('reads columns under centred lines that cross the gutter without spanning the page', () => {
    // A paper's first page: masthead, authors and affiliation are centred over
    // the gutter but far narrower than the page. Each used to veto the split.
    const page: PdfTextItemLike[] = [
      gi('基于奇异值分解的评估方法', 200, 780, 210, 16),
      gi('郑震 严迎建 刘燕江', 240, 760, 130, 10.3),
      gi('(信息工程大学三院，河南 郑州 450001)', 213, 744, 186, 10.3),
      ...cjkCol(63.9, '左', 700), ...cjkCol(316.7, '右', 700),
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text.indexOf('郑震')).toBeLessThan(text.indexOf('左0'));
    expect(text.indexOf('左5')).toBeLessThan(text.indexOf('右0'));
    expect(text).not.toContain('|');
  });
});

describe('buildPdfTextMap — tables', () => {
  const cell = (str: string, x: number, y: number, w: number, eol = false): PdfTextItemLike =>
    ({ str, hasEOL: eol, transform: [11, 0, 0, 11, x, y], width: w, height: 11, fontName: 'body' });

  it('emits a markdown table, with item ranges still slicing back', () => {
    const page: PdfTextItemLike[] = [
      cell('部分', 80, 700, 40), cell('章节', 200, 700, 40), cell('重写', 320, 700, 40, true),
      cell('一', 80, 680, 20), cell('学习', 200, 680, 40), cell('是', 320, 680, 20, true),
      cell('二', 80, 660, 20), cell('心流', 200, 660, 40), cell('否', 320, 660, 20, true),
    ];
    const map = buildPdfTextMap([page]);
    expect(map.text).toBe(
      '| 部分 | 章节 | 重写 |\n| --- | --- | --- |\n| 一 | 学习 | 是 |\n| 二 | 心流 | 否 |',
    );
    const it4 = map.pages[0]!.items[4]!;
    expect(map.text.slice(it4.start, it4.end)).toBe('学习');
  });

  it('joins a cell that wrapped onto a second line', () => {
    const page: PdfTextItemLike[] = [
      cell('章节', 80, 700, 40), cell('核心问题', 200, 700, 80, true),
      cell('学习', 80, 670, 40), cell('你真的会学', 200, 670, 100, true),
      cell('吗？', 200, 655, 40, true),
      cell('心流', 80, 625, 40), cell('什么是最好的状态？', 200, 625, 180, true),
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text).toContain('| 学习 | 你真的会学吗？ |');
    expect(text).toContain('| 心流 | 什么是最好的状态？ |');
  });

  it('does not mistake a hanging-indent reference list for a table', () => {
    const gi = (str: string, x: number, y: number, w: number): PdfTextItemLike =>
      ({ str, hasEOL: true, transform: [12, 0, 0, 12, x, y], width: w, height: 12, fontName: 'body' });
    const page: PdfTextItemLike[] = [
      gi('1. Dewey, J. (1916). Democracy and Education: An Introduction to the', 100, 700, 400),
      gi('Philosophy of Education. New York: Macmillan.', 118, 684, 220),
      gi('2. Dewey, J. (1933). How We Think: A Restatement of the Relation of', 100, 668, 400),
      gi('Reflective Thinking. Boston: D. C. Heath.', 118, 652, 200),
    ];
    expect(buildPdfTextMap([page]).text).not.toContain('|');
  });
});

describe('buildPdfTextMap — watermarks and tagged artifacts', () => {
  const gi = (str: string, x: number, y: number, w: number): PdfTextItemLike =>
    ({ str, hasEOL: true, transform: [12, 0, 0, 12, x, y], width: w, height: 12, fontName: 'body' });

  it('drops rotated glyph runs (watermarks, vertical sidebars)', () => {
    const page: PdfTextItemLike[] = [
      gi('正文第一行写到右边距为止形成折行继续', 100, 700, 400),
      gi('第二行把这一段写完。', 100, 684, 200),
      // 45° rotated watermark
      { str: '内部资料请勿外传', hasEOL: true, transform: [8, 8, -8, 8, 250, 400], width: 100, height: 11 },
    ];
    expect(buildPdfTextMap([page]).text).not.toContain('内部资料请勿外传');
  });

  it('drops /Artifact-tagged items and ignores the tagging when it swallows the page', () => {
    const page: PdfTextItemLike[] = [
      { ...gi('第 3 页', 300, 760, 60), artifact: true },
      gi('正文第一行写到右边距为止形成折行继续', 100, 700, 400),
      gi('第二行把这一段写完。', 100, 684, 200),
    ];
    expect(buildPdfTextMap([page]).text).toBe('正文第一行写到右边距为止形成折行继续第二行把这一段写完。');

    const mistagged: PdfTextItemLike[] = page.map((it) => ({ ...it, artifact: true }));
    expect(buildPdfTextMap([mistagged]).text).toContain('正文第一行');
  });
});

describe('collectPdfArtifactFlags', () => {
  /** A marked-content stream as pdf.js emits it with includeMarkedContent. */
  const page = (items: unknown[]) => ({ getTextContent: async () => ({ items }) });
  const begin = (tag: string): unknown => ({ type: 'beginMarkedContentProps', id: null, tag });
  const end = (): unknown => ({ type: 'endMarkedContent' });
  const text = (str: string): unknown => ({ str, hasEOL: true });

  it('flags text inside an /Artifact scope, including nested content', async () => {
    expect(await collectPdfArtifactFlags(page([
      begin('Artifact'), text('第 3 页'), begin('Span'), text('· 教育哲学'), end(), end(),
      begin('P'), text('这是一段正文，长度足够超过页眉页脚，不会触发误标保护。'), end(),
    ]))).toEqual([true, true, false]);
  });

  it('reports nothing for an untagged page, so callers fall back to geometry', async () => {
    expect(await collectPdfArtifactFlags(page([text('没有标记的正文')]))).toEqual([]);
  });

  it('ignores tagging that would swallow the page', async () => {
    expect(await collectPdfArtifactFlags(page([
      begin('Artifact'), text('这一整页都被错误地标成了 Artifact'), end(),
      begin('P'), text('短'), end(),
    ]))).toEqual([]);
  });

  it('survives a page whose text content cannot be read', async () => {
    expect(await collectPdfArtifactFlags({ getTextContent: async () => { throw new Error('boom'); } })).toEqual([]);
  });
});

describe('buildPdfTextMap — furniture by repetition across pages', () => {
  const gi = (str: string, x: number, y: number, w: number, h = 12, fontName = 'body'): PdfTextItemLike =>
    ({ str, hasEOL: true, transform: [h, 0, 0, h, x, y], width: w, height: h, fontName });
  // Real body copy differs from page to page, and it differs in WORDS: the
  // repeat key digit-normalizes, so a synthetic page marker must not be a
  // number or every page's copy reads as the same line.
  const marks = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const body = (y: number, n: string): PdfTextItemLike[] => [
    gi(`正文第一行写到右边距为止形成折行继续往下第${n}段`, 100, y, 400),
    gi(`第二行接着写这一段的中间部分内容并继续折行第${n}段`, 100, y - 16, 400),
    gi(`第三行接着写这一段的后半部分内容并继续折行第${n}段`, 100, y - 32, 400),
    gi(`第四行把这一段收尾第${n}段`, 100, y - 48, 400),
  ];

  it('drops a running head set in body type, tight against the text block', () => {
    // No size difference and no extra air: repetition at a fixed height is the
    // only thing that gives it away.
    const pages = marks.map((n) => [gi('教育哲学导论 · 第一章', 100, 716, 200, 12, 'body'), ...body(700, n)]);
    const text = buildPdfTextMap(pages).text;
    expect(text).not.toContain('教育哲学导论');
    expect(text).toContain('正文第一行');
  });

  it('drops a watermark printed BETWEEN body lines, not at a page edge', () => {
    const pages = marks.map((n) => [
      gi(`正文第一行写到右边距为止形成折行继续往下第${n}段`, 100, 700, 400),
      gi(`第二行接着写这一段的中间部分内容并继续折行第${n}段`, 100, 684, 400),
      gi('机密文件请勿外传', 250, 670, 120, 30, 'wm'),
      gi(`第三行接着写这一段的后半部分内容并继续折行第${n}段`, 100, 668, 400),
      gi(`第四行把这一段收尾第${n}段`, 100, 652, 400),
    ]);
    const text = buildPdfTextMap(pages).text;
    expect(text).not.toContain('机密文件');
    expect(text).toContain('正文第一行');
  });

  it('drops a running head on a two-page document (threshold follows the page count)', () => {
    const pages = ['甲', '乙'].map((n) => [gi('课程讲义 · 第一讲', 100, 740, 160, 12, 'body'), ...body(700, n)]);
    const text = buildPdfTextMap(pages).text;
    expect(text).not.toContain('课程讲义');
    expect(text).toContain('正文第一行');
  });

  it('drops a recto running head printed on only two pages of a short paper', () => {
    // Journals alternate recto/verso heads and skip the opening page: a 6-page
    // paper prints each head twice or three times. Left in, the head was
    // spliced into the sentence running across the page break.
    const pages = marks.slice(0, 6).map((n, k) => [
      ...(k === 2 || k === 4 ? [gi('华中科技大学学报 第53卷', 100, 740, 200, 12, 'body')] : []),
      ...body(700, n),
    ]);
    const text = buildPdfTextMap(pages).text;
    expect(text).not.toContain('华中科技大学学报');
    expect(text).toContain('正文第一行');
  });

  it('keeps repeated CONTENT: form labels printed at the same place on every page', () => {
    // Same text, same height, fifty pages — but inside the body block and set
    // in body type, which is what separates a field label from furniture.
    const pages = [...Array(50)].map((_, k) => [
      gi('姓名：', 100, 700, 60),
      gi(`第${marks[k % 10]}位受访者的回答内容写到右边距为止形成折行`, 200, 700, 300),
      gi('联系方式：', 100, 684, 80),
      gi(`第${marks[k % 10]}位受访者的联系方式内容写到右边距为止折行`, 200, 684, 300),
      gi(`备注第${marks[k % 10]}行的内容写到右边距为止形成折行继续`, 100, 668, 400),
      gi(`备注第${marks[k % 10]}行的第二段内容写到右边距为止折行`, 100, 652, 400),
    ]);
    expect(buildPdfTextMap(pages).text.match(/姓名：/g)).toHaveLength(50);
  });

  it('abandons the rule wholesale when it would eat the document', () => {
    // A document that really does repeat its body copy: no signal is worth
    // deleting a quarter of the text over.
    const page: PdfTextItemLike[] = [
      gi('这一页的每一行在每一页上都完全相同的第一行', 100, 700, 400),
      gi('这一页的每一行在每一页上都完全相同的第二行', 100, 684, 400),
      gi('这一页的每一行在每一页上都完全相同的第三行', 100, 668, 400),
      gi('这一页的每一行在每一页上都完全相同的第四行', 100, 652, 400),
    ];
    const text = buildPdfTextMap([page, page, page]).text;
    expect(text).toContain('完全相同的第一行');
  });
});

describe('buildPdfTextMap — inline formulas', () => {
  // Item shapes as pdf.js reports them for a Chinese journal's formulas.
  const fi = (str: string, x: number, y: number, w: number, o: { h?: number; eol?: boolean; shear?: number } = {}): PdfTextItemLike => {
    const h = o.h ?? 10.3;
    return { str, hasEOL: o.eol ?? false, transform: [h, 0, o.shear ?? 0, h, x, y], width: w, height: str ? h : 0, fontName: 'body' };
  };
  const prose = (y: number, tag: string): PdfTextItemLike =>
    fi(`${tag}这一行正文写满整栏宽度并继续折行到下一行去`, 63.9, y, 231.6, { eol: true });

  it('keeps a formula whose superscript precedes its subscripts on one line, not a table', () => {
    // "A_{m×n} = U_{m×m} Σ_{m×n} V^T_{n×n}， (1)": the superscript T is the top
    // item, and pdf.js closes it with a blank EOL item before the subscripts.
    const page: PdfTextItemLike[] = [
      prose(330, '甲'), prose(318, '乙'),
      fi('A', 127.7, 302.7, 6.9), fi('m×n', 135.2, 300.8, 13.5, { h: 5.4 }),
      fi('=', 152.4, 302.7, 5.8), fi('U', 161.8, 302.7, 7.4), fi('m×m', 169.8, 300.8, 14.8, { h: 5.4 }),
      fi('Σ', 186.3, 302.7, 6.4), fi('m×n', 193.3, 300.8, 13.5, { h: 5.4 }),
      fi('V', 206.7, 302.7, 6.9), fi('T', 215.9, 306.8, 3.3, { h: 5.4 }),
      fi('', 214.2, 300.8, 0, { h: 5.4, eol: true }), fi('n×n', 214.2, 300.8, 12.3, { h: 5.4 }),
      fi('，', 227.2, 302.6, 10.3), fi('(1)', 283.5, 302.6, 12.2, { eol: true }),
      prose(286, '丙'), prose(270, '丁'),
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text).not.toContain('|');
    expect(text).toMatch(/V\s*Tn×n，\s*\(1\)/);
  });

  it('keeps an oblique minus sign and does not break the line at it', () => {
    // pdf.js drops a blank EOL item where the sheared glyph starts.
    const page: PdfTextItemLike[] = [
      fi('所对应明文组别的标签，剩余', 63.9, 551.1, 137.7), fi('v=m', 203.2, 551.1, 19.2),
      fi('', 222.6, 551.1, 0, { eol: true, shear: 2.2 }), fi('-', 222.6, 551.1, 5.1, { shear: 2.2 }),
      fi('t', 227.8, 551.1, 2.9), fi('行作为验证数', 232.2, 551.1, 63.4, { eol: true }),
    ];
    expect(buildPdfTextMap([page]).text).toBe('所对应明文组别的标签，剩余v=m-t行作为验证数');
  });

  it('still drops text whose baseline is tilted (a watermark)', () => {
    const wm: PdfTextItemLike = { str: '内部资料', hasEOL: true, transform: [8, 8, -8, 8, 200, 400], width: 60, height: 11, fontName: 'wm' };
    const page = [prose(700, '甲'), prose(684, '乙'), prose(668, '丙'), wm];
    expect(buildPdfTextMap([page]).text).not.toContain('内部资料');
  });

  it('reads a glyph overprinted for fake bold once', () => {
    const page: PdfTextItemLike[] = [
      fi('式中：', 63.9, 286.8, 31.6), fi('∑', 95.9, 286.8, 10.3, { shear: 2.2 }), fi('∑', 95.9, 286.8, 10.3, { shear: 2.2 }),
      fi('为奇异值矩阵；', 106.5, 286.8, 74.2, { eol: true }),
    ];
    expect(buildPdfTextMap([page]).text).toBe('式中：∑为奇异值矩阵；');
  });

  it('never reads a stretched delimiter as a heading or lets it swallow the next line', () => {
    const page: PdfTextItemLike[] = [
      prose(380, '甲'), prose(364, '乙'),
      fi('P(G≥l) =', 107.9, 340.3, 50), fi('(', 173.1, 334.5, 3.5, { h: 36.7 }), fi(')', 183.7, 334.5, 3.5, { h: 36.7 }),
      fi('v', 178.0, 346.6, 4.6, { eol: true }), fi('p(1-p)．', 190.1, 340.3, 50), fi('(8)', 283.5, 339.4, 12.2, { eol: true }),
      fi('由式(7)可得：', 84.9, 317.0, 65, { eol: true }),
      fi('E(G)=vp；D(G)=vp(1-p)．', 104.1, 302.3, 150), fi('(9)', 283.5, 301.2, 12.2, { eol: true }),
      prose(286, '丙'), prose(270, '丁'),
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text).not.toMatch(/^#/m);
    expect(text).not.toContain('|');
    expect(text).toContain('由式(7)可得：');
  });
});

describe('buildPdfTextMap — mid-line EOL items next to a gutter', () => {
  it('still splits a row-by-row two-column stream at a blank EOL item that opens the right column', () => {
    const gi = (str: string, x: number, y: number, w: number, eol: boolean): PdfTextItemLike =>
      ({ str, hasEOL: eol, transform: [10.3, 0, 0, 10.3, x, y], width: w, height: str ? 10.3 : 0, fontName: 'body' });
    const page: PdfTextItemLike[] = [];
    for (let k = 0; k < 6; k++) {
      const y = 700 - k * 16;
      page.push(gi(`左${k}的这一行文字排满整栏宽度，`, 63.9, y, 237.4, false));
      page.push(gi('', 316.7, y, 0, true));
      page.push(gi(`右${k}的这一行文字排满整栏宽度，`, 316.7, y, 237.4, true));
    }
    const text = buildPdfTextMap([page]).text;
    expect(text.indexOf('左5')).toBeLessThan(text.indexOf('右0'));
  });
});

// A CJK journal page: body copy 10.5pt on a 468pt measure (x 68–536) with a
// 2em first-line indent, notes and tables in 9pt. Shapes as pdf.js reports
// them for a CNKI-typeset paper.
describe('buildPdfTextMap — CJK journal layout', () => {
  const L = 68;
  const R = 536;
  const ln = (str: string, x: number, y: number, w: number, h = 10.5, eol = true): PdfTextItemLike =>
    ({ str, hasEOL: eol, transform: [h, 0, 0, h, x, y], width: w, height: h, fontName: 'body' });
  /** A full line of body copy (runs to the right margin). */
  const full = (str: string, y: number, x = L): PdfTextItemLike => ln(str, x, y, R - x);
  /** A paragraph: indented first line, full lines, short sentence-final end. */
  const para = (y: number, tag: string, lines = 3): PdfTextItemLike[] => [
    full(`${tag}起段落首行缩进两格写满整栏宽度的正文内容`, y, L + 21),
    ...Array.from({ length: lines - 2 }, (_, k) => full(`${tag}中间一行同样写满整栏宽度的正文内容第${k}行`, y - 15.6 * (k + 1))),
    ln(`${tag}结束。`, L, y - 15.6 * (lines - 1), 60),
  ];

  it('measures body size by characters, so many short note lines do not turn body copy into headings', () => {
    // Ten note lines against four body lines, but far fewer characters.
    const notes = Array.from({ length: 10 }, (_, k) => ln(`${'①②③④⑤⑥⑦⑧⑨⑩'[k]}同上。`, L + 9, 300 - 13.9 * k, 36, 9));
    const text = buildPdfTextMap([[...para(700, '甲', 4), ...notes]]).text;
    expect(text).not.toContain('#');
    expect(text).toContain('甲起段落首行缩进两格写满整栏宽度的正文内容甲中间一行');
  });

  it('opens a note at each enclosed numeral and rejoins its flush-left wrap', () => {
    const page = [
      ...para(700, '甲'), ...para(650, '乙'),
      ln('①参见张某、李某：《数字普惠金融促进包容性增长的机理及有效性检验》，《统计研究》2021年第10', L + 9, 200, R - L - 9, 9),
      ln('期，第62—75页。', L, 186.1, 70, 9),
      ln('②参见王某：《数字经济赋能城乡融合发展》，《福建论坛》2025年第9期，第67—77页。', L + 9, 172.2, 380, 9),
      ln('③参见赵某：《互联网金融空间集聚效应分析》，《国际金融研究》2017年第8期，第75—85页。', L + 9, 158.3, 390, 9),
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text).toContain('\n\n①参见张某、李某：《数字普惠金融促进包容性增长的机理及有效性检验》，《统计研究》2021年第10期，第62—75页。\n\n②参见');
    expect(text).toContain('第67—77页。\n\n③参见');
  });

  it('keeps a flush-left wrap that opens with "（2）" inside its paragraph when paragraphs are indented', () => {
    const page = [
      ...para(700, '甲'), ...para(640, '乙'),
      full('本文借鉴王奇等的做法选取以下控制变量：（1）政府行为，采用政府财政支出的对数表示；', 580, L + 21),
      full('（2）传统金融，采用金融机构年末贷款余额的对数表示；（3）工业化水平，采用工业企业数量', 564.4),
      ln('的对数表示。', L, 548.8, 60),
      ...para(533.2, '丙'),
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text).toContain('对数表示；（2）传统金融');
    expect(text).toContain('工业企业数量的对数表示。');
  });

  it('does not let a display formula reach the margin by its equation number', () => {
    const page = [
      ...para(700, '甲'),
      ln('再次，构建三次产业综合发展水平指数，衡量县域整体产业发展质量：', L + 21, 640, 320),
      ln('T = αf1 + βf2 + δf3', L + 21, 624.4, 90, 10.5, false), ln('（6）', 495, 624.4, 23),
      full('其中，参考学界通用的均等赋值思路，设定权重，测算得到县域三次产业融合度并', 608.8, L + 21),
      ln('据此展开。', L, 593.2, 50),
      ...para(577.6, '乙'),
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text).toMatch(/（6）\n\n其中，参考/);
  });

  it('squeezes letter-spaced type, and the item range maps back around the squeezed spaces', () => {
    const page = [
      ...para(700, '甲'), ...para(650, '乙'),
      ln('*', L + 5, 200, 4.4, 9, false),
      ln('基 金 项 目 ：', L + 10, 200, 49, 9, false),
      ln('国 家 社 会 科 学 基 金 青 年 项 目', L + 56, 200, 119, 9),
    ];
    const map = buildPdfTextMap([page]);
    expect(map.text).toContain('基金项目：国家社会科学基金青年项目');
    const idx = page.findIndex((it) => it.str.startsWith('国'));
    const r = map.pages[0]!.items[idx]!;
    expect(r.squeezed?.length).toBeGreaterThan(0);
    for (let k = 0; k < r.end - r.start; k++) {
      const o = pdfItemStrOffset(r, k);
      expect(page[idx]!.str[o]).toBe(map.text[r.start + k]);
      expect(pdfItemTextOffset(r, o)).toBe(k);
    }
    // A lone space among unspaced CJK is the typesetter's air, and stays.
    const kept = buildPdfTextMap([[...para(700, '甲'), ln('宁夏大学 经济管理学院，宁夏 银川', 122, 600, 160)]]).text;
    expect(kept).toContain('宁夏大学 经济管理学院，宁夏 银川');
  });

  it('reads a full-width colon between ASCII as ASCII, but leaves CJK sentence punctuation', () => {
    const page = [
      ...para(700, '甲'),
      ln('2025年10月23日，', L, 600, 90, 9, false),
      ln('https', 160, 600, 17.4, 9, false), ln('：', 177.4, 600, 8.8, 9, false),
      ln('//www.example.com/politics/c.html', 181.9, 600, 140, 9, false),
      ln('，', 322, 600, 8.8, 9, false), ln('(1)', 335, 600, 12, 9),
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text).toContain('https://www.example.com/politics/c.html，(1)');
  });

  it('joins a line that breaks after a slash without a space', () => {
    const gi = (str: string, x: number, y: number, w: number): PdfTextItemLike =>
      ({ str, hasEOL: true, transform: [11, 0, 0, 11, x, y], width: w, height: 11 });
    const text = buildPdfTextMap([[
      gi('The light data come from the DMSP/', 72, 700, 470),
      gi('OLS archive maintained by NOAA.', 72, 686, 200),
    ]]).text;
    expect(text).toBe('The light data come from the DMSP/OLS archive maintained by NOAA.');
  });

  it('rejoins an inset note whose wrap falls back left of its indented first line', () => {
    const page = [
      ...para(700, '甲'), ...para(650, '乙'),
      ln('注：表中***、**、*分别表示在1%、5%、10%水平下显著。括号内的数值表示聚类到县域层面的稳健标准', 98.6, 500, 407.5, 9),
      ln('误，下表同', 80.6, 485.7, 40, 9),
      ...para(460, '丙'),
    ];
    expect(buildPdfTextMap([page]).text).toContain('稳健标准误，下表同');
  });
});

describe('buildPdfTextMap — headings against the body around them', () => {
  const gi = (str: string, x: number, y: number, w: number, h: number): PdfTextItemLike =>
    ({ str, hasEOL: true, transform: [h, 0, 0, h, x, y], width: w, height: h, fontName: 'body' });

  it('finds numbered section heads set in capitals at or under body size', () => {
    // IEEE: "I. INTRODUCTION" in small caps that measure 8pt against 10pt
    // body, centred in the column, with "A. Lettered" subsections in italics.
    const body = (y: number, n: number): PdfTextItemLike[] => Array.from({ length: n }, (_, k) =>
      gi(`Body line ${y}-${k} of running prose that fills the column measure`, 50, y - k * 12, 250, 10));
    const page: PdfTextItemLike[] = [
      ...body(760, 3),
      gi('I. INTRODUCTION', 136, 712, 77, 8),
      ...body(696, 8),
      gi('2. AN EXTENDED ALGORITHM WITH A FREE', 60, 590, 230, 10),
      gi('SEMI-MAJOR AXIS', 125, 578, 100, 10),
      ...body(560, 8),
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text).toMatch(/^#+ I\. INTRODUCTION$/m);
    expect(text).toMatch(/^#+ 2\. AN EXTENDED ALGORITHM WITH A FREE SEMI-MAJOR AXIS$/m);
    expect(text).not.toMatch(/^#+ Body/m);
  });

  it('keeps a centred title that wraps over two lines one heading', () => {
    // Centred, so neither line runs to the margin, and set across the columns
    // in a strip of its own, where the leading is read off the baselines.
    const body = Array.from({ length: 10 }, (_, k) =>
      gi(`Body line ${k} of running prose that fills the whole text measure`, 60, 640 - k * 12, 490, 10));
    const page: PdfTextItemLike[] = [
      gi('Phi-3 Technical Report:', 224, 720, 164, 17),
      gi('A Highly Capable Language Model Locally on Your Phone', 102, 698, 408, 17),
      ...body,
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text).toMatch(/^# Phi-3 Technical Report: A Highly Capable Language Model Locally on Your Phone$/m);
  });

  it('does not make headings of text set larger than a document full of small print', () => {
    // An annotated edition: pages of 8pt index outweigh the 10pt text, so
    // the document's body size is 8pt — and each 10pt line, measured against
    // it, "stood out" as a heading.
    const index = Array.from({ length: 3 }, (_, p) => Array.from({ length: 40 }, (_, k) =>
      gi(`Index entry ${p}-${k}, with its references ......... 12, 34, 56`, 72, 740 - k * 9, 400, 8)));
    const text = [
      'When vacancies happen in the Representation from any State',
      'the Executive Authority thereof shall issue Writs of Election',
      'to fill such Vacancies. The House of Representatives shall',
      'chuse their Speaker and other Officers; and shall have the',
      'sole Power of Impeachment, and the Senate of the United',
      'States shall be composed of two Senators from each State',
    ];
    const page = text.map((t, k) => gi(t, 72, 700 - k * 12, 400, 10));
    expect(buildPdfTextMap([page, ...index]).text).not.toMatch(/^#/m);
  });
});

describe('buildPdfTextMap — tables by gutters', () => {
  const c = (str: string, cx: number, y: number, w: number, h = 9): PdfTextItemLike =>
    ({ str, hasEOL: true, transform: [h, 0, 0, h, cx - w / 2, y], width: w, height: h, fontName: 'body' });
  const rows = (text: string): string[] => text.split('\n').filter((l) => l.startsWith('|') && !l.startsWith('| ---'));

  it('finds centred columns whatever each cell\'s width, and keeps a wrapped centred cell in its row', () => {
    const page = [
      c('变量', 120, 700, 18), c('样本量', 220, 700, 27), c('均值', 320, 700, 18), c('作用阐释', 440, 700, 36),
      c('乡村振兴', 120, 684, 36), c('13 810', 220, 684, 25), c('1.207 4', 320, 684, 28),
      c('表征县域乡村振兴整体发展', 440, 684, 108), c('水平', 440, 673, 18),
      c('传统金融发展', 120, 657, 54), c('13 810', 220, 657, 25), c('13.443 3', 320, 657, 33), c('剥离', 440, 657, 18),
      c('数字化程度', 120, 641, 45), c('13 810', 220, 641, 25), c('0.952 0', 320, 641, 28), c('反映程度', 440, 641, 36),
    ];
    expect(rows(buildPdfTextMap([page]).text)).toEqual([
      '| 变量 | 样本量 | 均值 | 作用阐释 |',
      '| 乡村振兴 | 13 810 | 1.207 4 | 表征县域乡村振兴整体发展水平 |',
      '| 传统金融发展 | 13 810 | 13.443 3 | 剥离 |',
      '| 数字化程度 | 13 810 | 0.952 0 | 反映程度 |',
    ]);
  });

  it('reads a sparse regression table with its two-line header and a group header spanning columns', () => {
    const page = [
      c('（1）', 170, 600, 19), c('（2）', 230, 600, 19), c('（3）', 290, 600, 19), c('（4）', 350, 600, 19),
      c('变量', 110, 592, 18), c('地理区位异质性', 200, 592, 63), c('经济基础异质性', 320, 592, 63),
      c('dif', 110, 576, 10), c('0.609 8***', 170, 576, 34), c('0.539 6***', 230, 576, 34),
      c('(0.055 6)', 170, 560, 42), c('(0.053 9)', 230, 560, 42),
      c('width', 110, 544, 20), c('0.271 0***', 290, 544, 34),
      c('(0.034 0)', 290, 528, 42),
      c('N', 110, 512, 6), c('13 810', 170, 512, 25), c('13 810', 230, 512, 25), c('13 810', 290, 512, 25), c('13 810', 350, 512, 25),
    ];
    // The header sits in the page's lower half in note-size type: "（1）" is
    // a column head there, not a note marker.
    const pad = Array.from({ length: 4 }, (_, k) => ({
      str: '正文一行写满整栏宽度的内容用来撑开页面的上半部分', hasEOL: true,
      transform: [10.5, 0, 0, 10.5, 68, 760 - 15.6 * k], width: 468, height: 10.5, fontName: 'body',
    }));
    expect(rows(buildPdfTextMap([[...pad, ...page]]).text)).toEqual([
      '| 变量 | （1）地理区位异质性 | （2） | （3）经济基础异质性 | （4） |',
      '| dif | 0.609 8*** | 0.539 6*** |  |  |',
      '|  | (0.055 6) | (0.053 9) |  |  |',
      '| width |  |  | 0.271 0*** |  |',
      '|  |  |  | (0.034 0) |  |',
      '| N | 13 810 | 13 810 | 13 810 | 13 810 |',
    ]);
  });

  it('does not read a display formula as a table', () => {
    // χ := a / (m+a) = (1+α)/2 — numerator, main line and denominator each on
    // a baseline of their own, the pieces lining up like a grid.
    const page = [
      c('a', 250, 706, 6), c('1 +α', 330, 706, 22),
      c('a := m+ 2mu,', 120, 700, 60), c('χ :=', 200, 700, 22), c('= .', 290, 700, 14),
      c('m+a', 250, 694, 22), c('2', 330, 694, 6),
    ];
    expect(buildPdfTextMap([page]).text).not.toContain('|');
  });

  it('keeps a title set over the columns out of the table under it', () => {
    const page = [
      c('2026年7月', 90, 775, 44), c('新疆大学学报', 300, 775, 54), c('Jul.,2026', 510, 775, 40),
      c('第54卷第4期', 90, 764, 54), c('Journal of Xinjiang University', 300, 764, 112), c('Vol.54,No.4', 510, 764, 45),
      c('数字金融如何赋能乡村振兴？', 300, 707, 234, 17.6),
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text).not.toMatch(/\|[^\n]*数字金融如何赋能/);
    expect(text).toContain('数字金融如何赋能乡村振兴？');
  });
});

// A two-column CJK journal page (columns x 64–296 and 317–554), 10.5pt body
// with a 2em first-line indent, English abstract, notes, captions and
// references in 9pt.
describe('buildPdfTextMap — two-column CJK journal', () => {
  const C1 = 64;
  const C2 = 317;
  const W = 232;
  const ln = (str: string, x: number, y: number, w: number, o: { h?: number; font?: string; eol?: boolean } = {}): PdfTextItemLike => {
    const h = o.h ?? 10.5;
    return { str, hasEOL: o.eol ?? true, transform: [h, 0, 0, h, x, y], width: w, height: h, fontName: o.font ?? 'body' };
  };
  /** A column paragraph: indented opening, full lines, optional short end. */
  const colPara = (x: number, y: number, tag: string, lines: number, ends = true): PdfTextItemLike[] =>
    Array.from({ length: lines }, (_, k) => {
      const last = ends && k === lines - 1;
      return ln(last ? `${tag}末行。` : `${tag}第${k}行写满整栏宽度的正文内容`, k === 0 ? x + 21 : x, y - 15.8 * k, last ? 50 : (k === 0 ? W - 21 : W));
    });

  it('finds body size by inked length, so a Latin-dense abstract and reference list do not outvote CJK body copy', () => {
    const latin = (y: number, k: number): PdfTextItemLike =>
      ln(`[${k}] SMITH J, DOE A, et al. A study of leakage assessment with neural networks[J]. Journal of Things, 2021, 4(2): 1-13.`, C1, y, 490, { h: 9 });
    // Four reference lines carry more characters than the twenty body lines,
    // but far less line length.
    const page = [
      ...colPara(C1, 700, '甲', 10), ...colPara(C2, 700, '乙', 10),
      ...Array.from({ length: 4 }, (_, k) => latin(500 - 14.3 * k, k + 1)),
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text).not.toContain('#');
    expect(text).toContain('甲第0行写满整栏宽度的正文内容甲第1行');
  });

  it('reads unmarked page-foot notes after both columns, and stitches the paragraph they would cut across the page break', () => {
    const p1 = [
      ...colPara(C1, 700, '甲', 3),
      ...colPara(C1, 652.6, '乙', 4, false),
      ...colPara(C2, 700, '乙续', 7, false).map((it, k) => (k === 0 ? { ...it, transform: [10.5, 0, 0, 10.5, C2, 700] } : it)),
      ln('收稿日期 2023-12-13．', 77, 560, 96, { h: 9 }),
      ln('作者简介 郑某(1996—)，男，博士；严某(通信作者)，教授，E-mail:abc@163.com．', 77, 546, 390, { h: 9 }),
      ln('基金项目 国家自然科学基金资助项目(62302519)．', 77, 532, 205, { h: 9 }),
    ];
    const p2 = [ln('但当实施评估时须对能耗数据进行预处理．', C1, 700, 200), ...colPara(C1, 684.2, '丙', 3)];
    const text = buildPdfTextMap([p1, p2]).text;
    // The left column's last line runs straight into the right column's first.
    expect(text).toContain('乙第3行写满整栏宽度的正文内容乙续第0行');
    // The notes come between the paragraphs, not inside one.
    expect(text).toMatch(/甲末行。\n\n收稿日期[^\n]*\n\n作者简介[^\n]*\n\n基金项目[^\n]*\n\n乙第0行/);
    expect(text).toContain('乙续第6行写满整栏宽度的正文内容但当实施评估时');
  });

  it('keeps numbered display equations out of tables, each on a line of its own', () => {
    const page = [
      ...colPara(C1, 700, '甲', 3),
      ln('设明文的分组数为 f，此时至少有 l 条能量迹被正确分组的概率为', C1 + 21, 652.6, W - 21),
      ln('P(G≥l) =∑p(1-p)．', 108, 636.8, 144, { eol: false }), ln('(8)', 284, 636.8, 12),
      ln('由式(7)可得：', C1 + 21, 621, 65),
      ln('E(G) =vp；D(G) =vp(1-p)．', 104, 605.2, 151, { eol: false }), ln('(9)', 284, 605.2, 12),
      ln('定理1若随机变量X具有数学期望μ，方差', C1 + 21, 589.4, W - 21),
      ln('σ2，则对于任意正数ε有', C1, 573.6, 109),
      ...colPara(C1, 557.8, '乙', 3),
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text).not.toContain('|');
    expect(text).toContain('(8)\n\n由式(7)可得：');
    expect(text).toContain('(9)\n\n定理1');
  });

  it('lifts a figure caption out of the paragraph it cuts, and out from between two pages of one paragraph', () => {
    const p1 = [...colPara(C1, 700, '甲', 6), ...colPara(C2, 700, '乙', 6, false)];
    const p2 = [
      ln('图 1 仿真环境验证结果', 258, 626, 96, { h: 9 }),          // spanning the columns, above the text
      ln('图 2 为对比结果．', C1, 603.5, 81),
      ln('由图 2 可知：当能量迹样本量小于 2 200 时，', C1 + 21, 587.7, W - 21),
      ln('图 2 仿真环境本研究和文献[15]方法评估耗时对比', 79, 417, 200, { h: 9 }),
      ln('二分类方法的耗时更少，此后本研究方法耗时更', C2, 603.5, W),
      ln('少．', C2, 587.7, 20),
      ...colPara(C2, 571.9, '丙', 6),
      ln('图 3 基于 ASCAD 数据集的验证结果', 233, 300, 146, { h: 9 }),
      ...colPara(C1, 280, '丁', 6), ...colPara(C2, 280, '戊', 6),
    ];
    const text = buildPdfTextMap([p1, p2]).text;
    expect(text).toContain('乙第5行写满整栏宽度的正文内容图 2 为对比结果．');
    expect(text).toContain('当能量迹样本量小于 2 200 时，二分类方法的耗时更少');
    expect(text).toContain('\n\n图 1 仿真环境验证结果\n\n');
    expect(text).toMatch(/\n\n图 2 仿真环境本研究和文献\[15\]方法评估耗时对比\n\n由图 2 可知/);
  });

  it('reads bold-numbered sub-headings, and keeps section numbers and decimals whole', () => {
    const page = [
      ...colPara(C1, 760, '甲', 8),
      ln('3.1 ', C1, 633.6, 16, { font: 'bold', eol: false }), ln('实验配置及实验数据', C1 + 24, 633.6, 94, { font: 'bold' }),
      ln('3.1.1 ', C1, 617.8, 24, { font: 'bold', eol: false }), ln('实验配置', C1 + 31, 617.8, 42),
      ...colPara(C1, 602, '乙', 3),
      ln('19.6%，16.5% 和 13.6%．本研究方法和文献方法的耗时对比如图', C1, 554.6, W),
      ln('6 所示．', C1, 538.8, 40),
      ...colPara(C1, 523, '丙', 8),
    ];
    const text = buildPdfTextMap([page]).text;
    expect(text).toMatch(/\n\n#+ 3\.1 实验配置及实验数据\n\n#+ 3\.1\.1 实验配置\n\n/);
    expect(text).toContain('\n\n19.6%，16.5%');
  });

  it('squeezes tracking across a whole justified line, CJK beside Latin words included', () => {
    const page = [
      ...colPara(C1, 700, '甲', 3),
      ln('利 用', C1 + 21, 652.6, 21, { eol: false }), ln('Chipwhisperer', C1 + 45, 652.6, 62, { eol: false }),
      ln('开 发 板 采 集 加', C1 + 110, 652.6, 70, { eol: false }), ln('RSM', C1 + 183, 652.6, 20, { eol: false }),
      ln('掩 码', C1 + 206, 652.6, 26),
      ln('AES-128 算法的能耗展开验证．', C1, 636.8, 140),
    ];
    expect(buildPdfTextMap([page]).text).toContain('利用Chipwhisperer开发板采集加RSM掩码AES-128');
  });

  it('joins a line that breaks after a dash without a space', () => {
    const page = [
      ...colPara(C1, 700, '甲', 3),
      ln('①参见某某：《某某研究》，《经济地理》2020 年第 12 期，第 56—', C1 + 9, 300, W - 9, { h: 9 }),
      ln('62 页。', C1, 286, 30, { h: 9 }),
    ];
    expect(buildPdfTextMap([page]).text).toContain('第 56—62 页。');
  });
});
