/**
 * Convert one PDF to Markdown on the command line.
 *
 *   pnpm example:node paper.pdf > paper.md
 *   pnpm example:node paper.pdf --out paper.md
 *
 * The interesting part is not the loop — it is the pdf.js options. cMaps and
 * standard font data are what make CJK text and some Latin fonts come out at
 * all; wasm is needed for certain compressed streams.
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { convertPdfToMarkdown } from '../../src/index.js';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outFile = outIdx >= 0 ? args[outIdx + 1] : undefined;
const input = args.find((a, i) => !a.startsWith('--') && (outIdx < 0 || i !== outIdx + 1));

if (!input) {
  console.error('usage: pdf2md <file.pdf> [--out <file.md>]');
  process.exit(2);
}

const require = createRequire(import.meta.url);
const nativeImport = new Function('s', 'return import(s)') as (s: string) => Promise<unknown>;

async function main(): Promise<void> {
  const pdfjs = await nativeImport(pathToFileURL(require.resolve('pdfjs-dist/legacy/build/pdf.mjs')).href) as typeof import('pdfjs-dist/legacy/build/pdf.mjs');
  const root = path.dirname(require.resolve('pdfjs-dist/package.json'));
  const asset = (dir: string) => `${path.join(root, dir).replace(/\\/g, '/')}/`;

  const data = new Uint8Array(await readFile(input!));
  const task = pdfjs.getDocument({
    data,
    cMapUrl: asset('cmaps'),
    standardFontDataUrl: asset('standard_fonts'),
    wasmUrl: asset('wasm'),
    verbosity: 0,
  });
  const doc = await task.promise;

  try {
    const result = await convertPdfToMarkdown(doc);
    if (!result.ok) {
      console.error(`${input}: no text (${result.reason}) — ${result.pageCount} pages`);
      process.exitCode = 1;
      return;
    }
    if (outFile) await writeFile(outFile, result.markdown);
    else process.stdout.write(result.markdown);
    console.error(`${result.pageCount} pages · ${result.links} links${result.textLayerIssues ? ` · ${result.textLayerIssues.mathPages} maths pages, ${result.textLayerIssues.garbledPages} garbled pages` : ''}`);
  } finally {
    await task.destroy();
  }
}

void main();
