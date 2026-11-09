/**
 * PDF → Markdown regression corpus.
 *
 *   pnpm eval --fetch     download the PDFs in manifest.json into cache/ (sha256 checked)
 *   pnpm eval             compare output against snapshots and assertions
 *   pnpm eval --update    accept the current output as the new snapshot
 *   pnpm eval --only nist run only ids containing "nist"
 *
 * Three things are compared per document, and they answer different questions:
 *
 *  1. The canonical text (`buildPdfTextMap().text`) by sha256. It is what
 *     annotations and citations anchor into, so a change means existing offsets
 *     may drift: intentional changes bump CANONICAL_TEXT_VERSION, anything else
 *     is a regression.
 *  2. The Markdown snapshot in golden/<id>.md — "what it looks like now", not
 *     "what it should look like". Every change needs a human to read the diff.
 *  3. The assertions in manifest.json — facts a human checked against the PDF:
 *     this heading is a heading, this running header must not appear. `expect`
 *     must pass; `todo` records known defects and is expected to fail.
 *
 * Snapshots gate "did it change", assertions gate "is the change right".
 *
 * The PDFs themselves are not in the repo: most licences cover redistributing
 * the converted text with attribution, not shipping the file. `--fetch`
 * downloads by URL and verifies sha256.
 */

import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildPdfTextMap, pdfTextLayerToMarkdown, readPdfTextLayer, type PdfMarkdownResult } from '../src/index.js';

interface Assertions {
  /** Overall verdict: normal / scanned / no text. */
  result?: 'ok' | 'scanned' | 'empty';
  /** Must appear as a WHOLE line (heading, list item, table header row…). */
  lines?: string[];
  /** Must be a heading — at any level. */
  headings?: string[];
  /** Must appear as a substring. */
  contains?: string[];
  /** Must NOT appear (running headers, page numbers, watermarks, hyphenation debris). */
  absent?: string[];
  minHeadings?: number;
  maxHeadings?: number;
  minTables?: number;
  /** Upper bound: catches body text, maths or columns misread as a table. */
  maxTables?: number;
  minLinks?: number;
  /** Should the text-layer health check report maths? */
  mathFlagged?: boolean;
  /** Should the text-layer health check report garbled glyphs? */
  garbledFlagged?: boolean;
}

interface CorpusDoc {
  id: string;
  url: string;
  sha256: string;
  bytes: number;
  license: string;
  source: string;
  lang: string;
  layout: string[];
  expect?: Assertions;
  /** Known defect: fails today, move into expect once fixed. */
  todo?: Assertions & { note?: string };
}

interface Summary {
  result: 'ok' | 'scanned' | 'empty';
  pages: number;
  textChars: number;
  textSha256: string;
  mdChars: number;
  headings: number;
  tables: number;
  links: number;
  mathPages: number;
  garbledPages: number;
}

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'corpus');
const CACHE = path.join(ROOT, 'cache');
const GOLDEN = path.join(ROOT, 'golden');
const OUT = path.join(ROOT, 'out');

const sha256 = (data: Uint8Array | string) => createHash('sha256').update(data).digest('hex');

// ── pdf.js ──────────────────────────────────────────────────────────────────
// Same resource options the library documents for Node: without cMaps, Chinese
// PDFs come out as punctuation only.

type Pdfjs = typeof import('pdfjs-dist/legacy/build/pdf.mjs');

async function loadPdfjs(): Promise<{ pdfjs: Pdfjs; assets: Record<string, string> }> {
  const require_ = createRequire(import.meta.url);
  const nativeImport = new Function('s', 'return import(s)') as (s: string) => Promise<unknown>;
  const pdfjs = (await nativeImport(pathToFileURL(require_.resolve('pdfjs-dist/legacy/build/pdf.mjs')).href)) as Pdfjs;
  const root = path.dirname(require_.resolve('pdfjs-dist/package.json'));
  const dir = (name: string) => `${path.join(root, name).replace(/\\/g, '/')}/`;
  return { pdfjs, assets: { wasmUrl: dir('wasm'), cMapUrl: dir('cmaps'), standardFontDataUrl: dir('standard_fonts') } };
}

// ── Download ────────────────────────────────────────────────────────────────

async function fetchDoc(doc: CorpusDoc): Promise<string> {
  const file = path.join(CACHE, `${doc.id}.pdf`);
  try {
    await fs.access(file);
    return 'cached';
  } catch { /* not cached yet */ }
  const res = await fetch(doc.url, { headers: { 'User-Agent': 'Mozilla/5.0 (pdf-markdown-corpus)' }, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = new Uint8Array(await res.arrayBuffer());
  if (sha256(data) !== doc.sha256) throw new Error('sha256 does not match the manifest (upstream file changed?) — not written to cache');
  await fs.writeFile(file, data);
  return `${(data.length / 1e6).toFixed(1)} MB`;
}

// ── Counting and assertions ─────────────────────────────────────────────────

function countTables(md: string): number {
  return md.split('\n').filter((l) => /^\|(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(l)).length;
}

function countHeadings(md: string): number {
  return md.split('\n').filter((l) => /^#{1,6} /.test(l)).length;
}

function checkAssertions(a: Assertions, summary: Summary, md: string): string[] {
  const failures: string[] = [];
  const lineSet = new Set(md.split('\n'));
  const headingSet = new Set([...lineSet].filter((l) => /^#{1,6} /.test(l)).map((l) => l.replace(/^#{1,6} /, '')));
  if (a.result && a.result !== summary.result) failures.push(`result should be ${a.result}, got ${summary.result}`);
  for (const l of a.lines ?? []) if (!lineSet.has(l)) failures.push(`missing whole line: ${JSON.stringify(l)}`);
  for (const h of a.headings ?? []) if (!headingSet.has(h)) failures.push(`not a heading: ${JSON.stringify(h)}`);
  for (const s of a.contains ?? []) if (!md.includes(s)) failures.push(`missing text: ${JSON.stringify(s)}`);
  for (const s of a.absent ?? []) if (md.includes(s)) failures.push(`should not appear: ${JSON.stringify(s)}`);
  if (a.minHeadings !== undefined && summary.headings < a.minHeadings) failures.push(`headings ${summary.headings} < ${a.minHeadings}`);
  if (a.maxHeadings !== undefined && summary.headings > a.maxHeadings) failures.push(`headings ${summary.headings} > ${a.maxHeadings}`);
  if (a.maxTables !== undefined && summary.tables > a.maxTables) failures.push(`tables ${summary.tables} > ${a.maxTables}`);
  if (a.minTables !== undefined && summary.tables < a.minTables) failures.push(`tables ${summary.tables} < ${a.minTables}`);
  if (a.minLinks !== undefined && summary.links < a.minLinks) failures.push(`links ${summary.links} < ${a.minLinks}`);
  if (a.mathFlagged !== undefined && (summary.mathPages > 0) !== a.mathFlagged) {
    failures.push(a.mathFlagged ? 'should report maths, did not' : `should not report maths, reported ${summary.mathPages} pages`);
  }
  if (a.garbledFlagged !== undefined && (summary.garbledPages > 0) !== a.garbledFlagged) {
    failures.push(a.garbledFlagged ? 'should report garbled text, did not' : `should not report garbled text, reported ${summary.garbledPages} pages`);
  }
  return failures;
}

/** Line-level added/removed counts (multiset difference — an approximation of
 *  diff size; use `git diff --no-index` to read the actual change). */
function lineDelta(before: string, after: string): { added: number; removed: number } {
  const count = new Map<string, number>();
  for (const l of before.split('\n')) count.set(l, (count.get(l) ?? 0) + 1);
  let added = 0;
  for (const l of after.split('\n')) {
    const n = count.get(l) ?? 0;
    if (n > 0) count.set(l, n - 1);
    else added++;
  }
  let removed = 0;
  for (const n of count.values()) removed += n;
  return { added, removed };
}

async function readText(file: string): Promise<string | null> {
  try {
    return await fs.readFile(file, 'utf8');
  } catch {
    return null;
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const fetchMissing = args.includes('--fetch');
  const update = args.includes('--update');
  const onlyIdx = args.indexOf('--only');
  const only = onlyIdx >= 0 ? args[onlyIdx + 1] : undefined;

  const manifest = JSON.parse(await fs.readFile(path.join(ROOT, 'manifest.json'), 'utf8')) as { documents: CorpusDoc[] };
  const docs = manifest.documents.filter((d) => !only || d.id.includes(only));
  await Promise.all([CACHE, GOLDEN, path.join(OUT, 'text')].map((d) => fs.mkdir(d, { recursive: true })));

  if (fetchMissing) {
    for (const doc of docs) {
      try {
        console.log(`↓ ${doc.id}  ${await fetchDoc(doc)}`);
      } catch (error) {
        console.log(`✗ ${doc.id}  download failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  const { pdfjs, assets } = await loadPdfjs();
  const summaryFile = path.join(GOLDEN, 'summary.json');
  const golden = JSON.parse((await readText(summaryFile)) ?? '{}') as Record<string, Summary>;
  const nextGolden: Record<string, Summary> = { ...golden };

  let ran = 0;
  let missing = 0;
  let regressions = 0;
  let changed = 0;
  let todoOpen = 0;
  const promotable: string[] = [];

  for (const doc of docs) {
    const file = path.join(CACHE, `${doc.id}.pdf`);
    let data: Uint8Array;
    try {
      data = new Uint8Array(await fs.readFile(file));
    } catch {
      missing++;
      console.log(`· ${doc.id}  not cached (run with --fetch)`);
      continue;
    }
    if (sha256(data) !== doc.sha256) {
      regressions++;
      console.log(`✗ ${doc.id}  cached file does not match the manifest sha256 — delete cache/${doc.id}.pdf and --fetch again`);
      continue;
    }

    const started = Date.now();
    const task = pdfjs.getDocument({ data, verbosity: 0, ...assets });
    const pdf = await task.promise;
    let result: PdfMarkdownResult;
    let text: string;
    try {
      const layer = await readPdfTextLayer(pdf, { links: true });
      const map = buildPdfTextMap(layer.pageItems);
      text = map.text;
      result = pdfTextLayerToMarkdown(layer, map);
    } finally {
      await task.destroy();
    }
    const ms = Date.now() - started;
    ran++;

    const md = result.ok ? result.markdown : '';
    const summary: Summary = {
      result: result.ok ? 'ok' : result.reason,
      pages: result.pageCount,
      textChars: text.length,
      textSha256: sha256(text),
      mdChars: md.length,
      headings: countHeadings(md),
      tables: countTables(md),
      links: result.ok ? result.links : 0,
      mathPages: result.ok ? result.textLayerIssues?.mathPages ?? 0 : 0,
      garbledPages: result.ok ? result.textLayerIssues?.garbledPages ?? 0 : 0,
    };
    // Canonical text goes in its own tree so `git diff --no-index` can compare
    // golden/ and out/ as two whole directories.
    await fs.writeFile(path.join(OUT, 'text', `${doc.id}.txt`), text);
    if (md) await fs.writeFile(path.join(OUT, `${doc.id}.md`), md);

    const notes: string[] = [];
    const prev = golden[doc.id];
    const goldenMd = (await readText(path.join(GOLDEN, `${doc.id}.md`))) ?? '';
    if (!prev) {
      notes.push('new document, no snapshot yet');
      changed++;
    } else {
      if (prev.textSha256 !== summary.textSha256) {
        notes.push(`⚠ canonical text changed (${prev.textChars} → ${summary.textChars} chars): offsets into it are affected; if intended, bump CANONICAL_TEXT_VERSION`);
      }
      if (goldenMd !== md) {
        const { added, removed } = lineDelta(goldenMd, md);
        notes.push(`Markdown changed: about +${added} / −${removed} lines`);
      }
      for (const key of ['result', 'headings', 'tables', 'links', 'mathPages', 'garbledPages'] as const) {
        if (prev[key] !== summary[key]) notes.push(`${key} ${prev[key]} → ${summary[key]}`);
      }
      if (notes.length) changed++;
    }

    const failures = doc.expect ? checkAssertions(doc.expect, summary, md) : [];
    regressions += failures.length ? 1 : 0;
    const todoFailures = doc.todo ? checkAssertions(doc.todo, summary, md) : [];
    if (doc.todo) {
      if (todoFailures.length) todoOpen++;
      else promotable.push(doc.id);
    }

    const mark = failures.length ? '✗' : notes.length ? '△' : '✓';
    const stat = `${summary.pages}p · ${summary.headings} headings · ${summary.tables} tables · ${summary.links} links` +
      (summary.mathPages ? ` · ${summary.mathPages} maths pages` : '') + (summary.garbledPages ? ` · ${summary.garbledPages} garbled pages` : '');
    console.log(`${mark} ${doc.id}  [${summary.result}] ${stat}  ${ms}ms`);
    for (const f of failures) console.log(`    ✗ ${f}`);
    for (const n of notes) console.log(`    △ ${n}`);
    for (const f of todoFailures) console.log(`    ○ todo: ${f}`);

    if (update) {
      nextGolden[doc.id] = summary;
      const goldenFile = path.join(GOLDEN, `${doc.id}.md`);
      if (md) await fs.writeFile(goldenFile, md);
      else await fs.rm(goldenFile, { force: true });
    }
  }

  if (update) {
    const sorted = Object.fromEntries(Object.keys(nextGolden).sort().map((k) => [k, nextGolden[k]]));
    await fs.writeFile(summaryFile, `${JSON.stringify(sorted, null, 2)}\n`);
  }

  console.log(`\nran ${ran}${missing ? `, ${missing} not cached` : ''} · ${regressions} assertion failures · ${changed} differ from snapshot${update ? ' (snapshots updated)' : ''} · ${todoOpen} open todos`);
  if (promotable.length) console.log(`todo now passes for: ${promotable.join(', ')} — move it into expect`);
  if (changed && !update) console.log('Read the diff: git diff --no-index -- eval/corpus/golden eval/corpus/out (out/text/ holds the canonical text)');
  if (regressions || (changed && !update) || ran === 0) process.exitCode = 1;
}

void main();
