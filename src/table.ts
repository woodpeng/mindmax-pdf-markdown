// Table detection over a PDF page's text-layer geometry. buildPdfTextMap
// (text-map.ts) uses it to emit Markdown tables instead of the shredded prose a
// table otherwise becomes. The detection must stay deterministic — no timing,
// no locale, no floating-point comparison without an explicit tolerance —
// because the text it shapes is what offsets are stored against.
//
// Why items and not lines: pdf.js ends a *cell* with hasEOL, not a row, so the
// line grouping buildPdfTextMap uses cuts a table row into fragments that
// interleave columns. Columns are only visible in the raw x positions, which is
// what this pass clusters on.

/** One inked text-layer item, already resolved to page geometry. */
export interface TableItemLike {
  /** Index into the page's item array — how results map back to text ranges. */
  idx: number;
  x: number;
  y: number;
  /** Horizontal advance width. */
  w: number;
  /** Glyph box height (≈ font size). */
  h: number;
  str: string;
}

export interface TableBlock {
  /** Every item that belongs to the table, for O(1) membership tests. */
  itemIdxs: Set<number>;
  /** rows[r][c] = the item indices of that cell, in reading order ('' = empty). */
  rows: number[][][];
  columns: number;
  /** Baseline of the table's first band — where it sits in the reading order. */
  top: number;
  /** Items followed, inside their own cell, by visible horizontal air. pdf.js
   *  hands the gap over as a padding run of its own, which never reaches the
   *  cell (only inked items do), so without this "1." and "学习" would be
   *  emitted as "1.学习". */
  gapAfter: Set<number>;
  /** Items that open a new line inside their cell — a wrapped cell's second
   *  line. Only there is the break between two items not measurable as air:
   *  Latin needs its word space back, CJK must not gain one. */
  lineStart: Set<number>;
}

/** A run of items sharing one baseline. */
interface Band {
  /** [left, right] extent of each cell, parallel to `starts`. */
  spans: [number, number][];
  /** Baseline of the band's first body-size item: sub/superscripts ride off it. */
  y: number;
  /** Height of the anchoring item. */
  h: number;
  items: TableItemLike[];
  /** Index into `items` of each cell's first item. */
  starts: number[];
}

const median = (xs: number[]): number => {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)]!;
};

/** A gap this wide (in em) between two items is a cell boundary rather than
 *  the word spacing a justified line stretches to. Table gutters measured
 *  3–7 em in the wild; inter-word stretch stays well under 2. */
const CELL_GAP_EM = 1.6;
/** Narrowest gutter that still separates two columns, in em. A cell may
 *  intrude into a gutter (a wider cell in a centred column), but it may not
 *  close it up. */
const MIN_GUTTER_EM = 0.5;
/** A table is set in one size: a band whose text is this much larger than the
 *  table's is a title or a heading drawn over the table's columns. */
const MAX_BAND_SIZE_RATIO = 1.3;
/** A vertical gap this much larger than the table's normal line spacing ends
 *  the logical row: cells wrap at normal leading, rows are set further apart. */
const ROW_GAP_RATIO = 1.3;
/** Two-column PAGE LAYOUTS also put text at two x positions on shared
 *  baselines. What tells them apart is cell length: layout columns carry
 *  running prose, table cells carry labels. */
const MAX_MEAN_CELL_CHARS_2COL = 40;
/** Past this many columns the shape is a grid FORM (an invoice, a certificate)
 *  whose merged boxes read as a new column each — not a table with rows to
 *  line up. Emitting it as Markdown buys structure that is not there and pays
 *  in pipes, so those regions stay ordinary lines. */
const MAX_COLUMNS = 8;

/**
 * Find the tables on one page.
 *
 * The shape being matched: several baselines that each carry text in two or
 * more cells, separated by gutters — vertical strips of air that no cell on
 * any of those baselines crosses. Gutters, not cell start positions, because
 * cells are as often centred as left-aligned, and a wrapped cell's second
 * line starts wherever its width puts it. Ordinary prose has one cell per
 * baseline and runs across every gutter; a hanging-indent list has two x
 * positions, but they never share a baseline — which is why the gutters must
 * be proposed by a multi-cell band and hold across the bands under it.
 */
export function detectTables(items: TableItemLike[]): TableBlock[] {
  const inked = items.filter((it) => it.str.trim().length > 0 && it.h > 0);
  if (inked.length < 6) return [];
  const medH = median(inked.map((it) => it.h)) || 1;

  const bands = buildBands(inked, medH);
  if (bands.length < 2) return [];

  const blocks: TableBlock[] = [];
  let i = 0;
  while (i < bands.length) {
    const block = growTable(bands, i, medH);
    if (!block) { i++; continue; }
    blocks.push(block.table);
    i = block.end;
  }
  return blocks;
}

/** Group items into baselines, then split each baseline into cells at gaps. */
function buildBands(inked: TableItemLike[], medH: number): Band[] {
  const sorted = [...inked].sort((a, b) => (b.y - a.y) || (a.x - b.x));
  const bands: Band[] = [];
  // The band's baseline is a body-size glyph's, not its first item's. Sorted
  // top down, a superscript comes first: anchored on it, an inline formula's
  // subscripts (6pt below the "T" of "A = UΣVᵀ") fell out into a band of their
  // own, and the formula read as a two-row table. Nor may a stretched
  // delimiter anchor it (a binomial's 37pt parentheses): the band's reach is
  // measured in body ems, or it swallows the text line under the formula.
  const bodySize = (h: number): boolean => h >= 0.85 * medH && h <= 1.25 * medH;
  for (const it of sorted) {
    const last = bands[bands.length - 1];
    if (last && Math.abs(last.y - it.y) <= 0.5 * medH) {
      last.items.push(it);
      if (!bodySize(last.h) && bodySize(it.h)) { last.y = it.y; last.h = it.h; }
    } else bands.push({ y: it.y, h: it.h, items: [it], starts: [], spans: [] });
  }
  for (const band of bands) {
    band.items.sort((a, b) => a.x - b.x);
    let prevEnd = -Infinity;
    band.items.forEach((it, k) => {
      const em = it.h || medH;
      if (k === 0 || it.x - prevEnd > CELL_GAP_EM * em) {
        band.starts.push(k);
        band.spans.push([it.x, it.x + it.w]);
      }
      const span = band.spans[band.spans.length - 1]!;
      span[1] = Math.max(span[1], it.x + it.w);
      prevEnd = Math.max(prevEnd, it.x + it.w);
    });
  }
  return bands;
}

/**
 * The table's columns as x intervals, left to right: the union of its cells'
 * extents. What separates two columns is a gutter — a strip no cell crosses —
 * not where the cells happen to start: a centred column starts every cell at
 * a different x, and a wrapped cell's second line starts at yet another.
 *
 * Returns null when `span` cannot join without closing a gutter: it bridges
 * two columns, or comes within MIN_GUTTER_EM of one it does not touch.
 */
function addSpan(columns: [number, number][], span: [number, number], minGutter: number): [number, number][] | null {
  const [a, b] = span;
  const touched = columns.filter(([l, r]) => a <= r && b >= l);
  if (touched.length > 1) return null;
  const merged: [number, number] = touched.length === 1
    ? [Math.min(a, touched[0]![0]), Math.max(b, touched[0]![1])]
    : [a, b];
  const rest = columns.filter((c) => !touched.includes(c));
  if (rest.some(([l, r]) => merged[0] <= r + minGutter && merged[1] >= l - minGutter)) return null;
  return [...rest, merged].sort((x, y) => x[0] - y[0]);
}

/** Dominant glyph height of a band, weighted by characters. */
function bandHeight(band: Band): number {
  const weights = new Map<number, number>();
  for (const it of band.items) {
    const key = Math.round(it.h * 2) / 2;
    weights.set(key, (weights.get(key) ?? 0) + it.str.trim().length);
  }
  let best = 0;
  let bestChars = 0;
  for (const [h, w] of weights) if (w > bestChars) { bestChars = w; best = h; }
  return best;
}

/** Do any of these spans close the gutter between columns j and j+1? */
const closesGutter = (spans: [number, number][], columns: [number, number][], j: number): boolean =>
  spans.some(([a, b]) => a < columns[j + 1]![0] && b > columns[j]![1]);

/**
 * The columns the table's ink leaves room for: every inked item's extent,
 * merged wherever two come within `minGutter`. Measured over items rather
 * than cells, so a header whose two labels sit closer than a cell break
 * ("变量名称 变量符号") still splits once the rows below show the gutter.
 */
function inkColumns(items: TableItemLike[], minGutter: number): [number, number][] {
  const sorted = [...items].sort((a, b) => a.x - b.x);
  const out: [number, number][] = [];
  for (const it of sorted) {
    const last = out[out.length - 1];
    if (last && it.x <= last[1] + minGutter) last[1] = Math.max(last[1], it.x + it.w);
    else out.push([it.x, it.x + it.w]);
  }
  return out;
}

/** Formula ink: math and modifier symbols (which a math font without a
 *  Unicode map also lands on — ˇ ˆ ´), brackets and bars, Greek, and the
 *  Mathematical Alphanumeric block. */
const FORMULA_CHAR_RE = /[\p{Sm}\p{Sk}()[\]{}|∣∥′″]|\p{Script=Greek}|[\u{1D400}-\u{1D7FF}]/gu;
/** A word: three Latin letters running, or two Han characters. */
const WORD_RE = /\p{Script=Latin}{3,}|\p{Script=Han}{2,}/gu;
/** Share of formula ink past which a short-celled grid is a formula. Measured
 *  on real tables: numbers with ± and units stay under 0.1; display formulas
 *  run 0.15–0.9. */
const FORMULA_CHAR_SHARE = 0.15;

/**
 * A display formula: a fraction's numerator and denominator, a sum's limits,
 * stretched brackets and the main line each sit on a baseline of their own,
 * and the air between the pieces lines up like a grid. What gives it away is
 * the ink — formula symbols in quantity, barely a word per row, and cells of
 * a symbol or two. A table of figures has digits, not operators; a table of
 * labels has words.
 */
function looksLikeFormula(member: Band[], rows: number[][][], cellChars: number[]): boolean {
  const text = member.flatMap((b) => b.items.map((it) => it.str)).join(' ');
  const ink = text.replace(/\s+/g, '').length;
  if (ink === 0) return false;
  const formula = (text.match(FORMULA_CHAR_RE) ?? []).length;
  const words = (text.match(WORD_RE) ?? []).length;
  return formula >= FORMULA_CHAR_SHARE * ink && words <= 3 * rows.length && median(cellChars) <= 16;
}

/** An equation number: "(8)", "（2.3）", "(4a)". */
const EQUATION_TAG_RE = /^[(（]\s*\d{1,3}(?:[.-]\d{1,3})?[a-z]?\s*[)）]$/;

/** Cell texts of a band, left to right. */
const cellTexts = (band: Band): string[] =>
  band.starts.map((s0, k) => band.items.slice(s0, band.starts[k + 1] ?? band.items.length).map((it) => it.str).join('').trim());

/**
 * A numbered display equation: content, then, a cell apart, its one
 * equation number. Two of them a few lines apart line up exactly like a
 * two-column table — content left, number in a column of its own — but they
 * are a formula each, and the prose between them ("由式(7)可得：") is body
 * copy. A band numbering several columns ("(1) (2) (3)", a regression
 * table's header) is a table row and stays one.
 */
function isNumberedEquation(band: Band): boolean {
  const cells = cellTexts(band);
  return cells.length >= 2 && EQUATION_TAG_RE.test(cells[cells.length - 1]!)
    && cells.filter((t) => EQUATION_TAG_RE.test(t)).length === 1;
}

/**
 * Try to grow a table starting at `from`. Returns the block and the band index
 * to resume scanning at, or null when the bands there are not a table.
 */
function growTable(bands: Band[], from: number, medH: number): { table: TableBlock; end: number } | null {
  if (bands[from]!.starts.length < 2 || isNumberedEquation(bands[from]!)) return null;

  // The first multi-cell band proposes the gutters; a band under it joins the
  // table when its cells fit between them. A cell that spans columns — a
  // group header over two of them — closes a gutter or two; a band that
  // closes EVERY gutter is a line of prose running across the table, and
  // ends it.
  const minGutter = MIN_GUTTER_EM * medH;
  let columns: [number, number][] = [];
  for (const span of bands[from]!.spans) {
    const next = addSpan(columns, span, minGutter);
    if (!next) return null;
    columns = next;
  }
  const tableH = bandHeight(bands[from]!);
  const member: Band[] = [bands[from]!];
  /** Items of the cells that closed a gutter. */
  const spanning = new Set<TableItemLike>();
  let multiCell = 1;

  let end = from + 1;
  for (; end < bands.length; end++) {
    const band = bands[end]!;
    if (bandHeight(band) > MAX_BAND_SIZE_RATIO * tableH || isNumberedEquation(band)) break;
    let next = columns;
    const bridging: number[] = [];
    band.spans.forEach((span, k) => {
      const added = addSpan(next, span, minGutter);
      if (added) next = added;
      else bridging.push(k);
    });
    const bridged = bridging.map((k) => band.spans[k]!);
    if (bridged.length > 0 && next.slice(1).every((_, j) => closesGutter(bridged, next, j))) break;
    columns = next;
    for (const k of bridging) {
      for (let n = band.starts[k]!; n < (band.starts[k + 1] ?? band.items.length); n++) spanning.add(band.items[n]!);
    }
    member.push(band);
    if (band.starts.length >= 2) multiCell++;
  }
  // A trailing single-cell band is the paragraph AFTER the table when it sits
  // in the table's first column (that is where body copy resumes), and the
  // last row's wrapped cell when it sits in any later one.
  while (member.length > 0) {
    const last = member[member.length - 1]!;
    if (last.starts.length >= 2) break;
    const [l] = last.spans[0]!;
    if (l > columns[0]![1]) break;
    member.pop();
    end--;
  }

  // The columns themselves are measured on the rows that set them out:
  // multi-cell bands, without the cells that closed a gutter. A lone label
  // centred over several columns ("lnlight" over a regression table's four)
  // falls in a gutter and would otherwise open a column of its own. And a
  // "cell" that closed a gutter is often two cells set closer than a cell
  // break — "(0.038 2）(0.052 2）" — which the other rows then pull apart.
  columns = inkColumns(
    member.filter((b) => b.starts.length >= 2).flatMap((b) => b.items).filter((it) => !spanning.has(it)),
    minGutter,
  );

  if (multiCell < 2 || columns.length < 2 || columns.length > MAX_COLUMNS) return null;
  if (member.length < 3 && columns.length < 3) return null;

  // Ink is placed in pieces: the items of a band closer together than a
  // gutter, the same unit the columns were measured in. A piece joins the
  // column holding its centre (or the nearest one), so a "(" set at the
  // gutter's edge stays with the number it opens, and a label centred over
  // two columns lands in one of them whole.
  const pieceColumn = new Map<TableItemLike, number>();
  const nearestColumn = (x: number): number => {
    let best = 0;
    let bestDist = Infinity;
    columns.forEach(([l, r], c) => {
      const d = x < l ? l - x : x > r ? x - r : 0;
      if (d < bestDist) { bestDist = d; best = c; }
    });
    return best;
  };
  for (const band of member) {
    let piece: TableItemLike[] = [];
    let reach = -Infinity;
    const place = (): void => {
      if (piece.length === 0) return;
      const c = nearestColumn((piece[0]!.x + reach) / 2);
      for (const it of piece) pieceColumn.set(it, c);
    };
    for (const it of band.items) {
      if (piece.length > 0 && it.x > reach + minGutter) { place(); piece = []; reach = -Infinity; }
      piece.push(it);
      reach = Math.max(reach, it.x + it.w);
    }
    place();
  }
  const columnOf = (it: TableItemLike): number => pieceColumn.get(it)!;
  const lineStart = new Set<number>();
  const rows = buildRows(member, columns, columnOf, lineStart);
  if (rows.length < 2) return null;

  const charsByIdx = new Map<number, number>();
  for (const band of member) for (const it of band.items) charsByIdx.set(it.idx, it.str.trim().length);
  const cellChars: number[] = [];
  for (const row of rows) {
    for (const cell of row) {
      if (cell.length > 0) cellChars.push(cell.reduce((n, idx) => n + (charsByIdx.get(idx) ?? 0), 0));
    }
  }
  if (columns.length === 2 && median(cellChars) > MAX_MEAN_CELL_CHARS_2COL) return null;
  if (looksLikeFormula(member, rows, cellChars)) return null;

  const itemIdxs = new Set<number>();
  const gapAfter = new Set<number>();
  for (const band of member) {
    for (const it of band.items) itemIdxs.add(it.idx);
    band.items.forEach((it, k) => {
      const next = band.items[k + 1];
      // Only air INSIDE a cell counts; the air before the next cell is the
      // column gutter, and the next line of a wrapped cell is not on this band.
      if (!next || columnOf(next) !== columnOf(it)) return;
      if (next.x - (it.x + it.w) > 0.25 * (it.h || medH)) gapAfter.add(it.idx);
    });
  }
  return {
    table: { itemIdxs, rows, columns: columns.length, top: member[0]!.y, gapAfter, lineStart },
    end: Math.max(end, from + 1),
  };
}

/** Split the table's bands into logical rows (a wrapped cell keeps its row)
 *  and drop each band's items into their column. */
function buildRows(
  member: Band[],
  columns: unknown[],
  columnOf: (it: TableItemLike) => number,
  lineStart: Set<number>,
): number[][][] {
  const gaps: number[] = [];
  for (let i = 1; i < member.length; i++) {
    const g = member[i - 1]!.y - member[i]!.y;
    if (g > 0) gaps.push(g);
  }
  // Rows are told from wrapped cells by spacing: a cell wraps at the leading
  // of its own text, rows are set further apart. That only works when both
  // scales are present — in a table whose cells all fit on one line the
  // spacing is uniform, and then EVERY band is a row of its own. The base is
  // the tightest gap — the wrap leading itself. Any statistic further up
  // lands on the row spacing once wraps are rare (a regression table wraps
  // only its two-line header: two gaps of 8pt among a dozen of 16pt), and
  // measured against itself the whole table merged into one row. A stray
  // tight gap errs the safe way: more rows, never fewer.
  const sortedGaps = [...gaps].sort((a, b) => a - b);
  const spread = sortedGaps.length > 0 ? sortedGaps[sortedGaps.length - 1]! - sortedGaps[0]! : 0;
  const uniform = sortedGaps.length === 0 || spread <= 0.25 * sortedGaps[sortedGaps.length - 1]!;
  const rowGap = uniform ? 0 : sortedGaps[0]! * ROW_GAP_RATIO;

  const rows: number[][][] = [];
  let cur: number[][] | null = null;
  for (let i = 0; i < member.length; i++) {
    const band = member[i]!;
    const gap = i === 0 ? Infinity : member[i - 1]!.y - band.y;
    if (cur === null || gap > rowGap) {
      cur = columns.map(() => []);
      rows.push(cur);
    }
    const opened = new Set<number>();
    for (const it of band.items) {
      const c = columnOf(it);
      if (!opened.has(c) && cur[c]!.length > 0) lineStart.add(it.idx);
      opened.add(c);
      cur[c]!.push(it.idx);
    }
  }
  return rows;
}
