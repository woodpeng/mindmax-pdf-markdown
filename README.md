# PDF → Markdown

**A PDF's text layer knows where every character sits. This library puts the document back together from that geometry — headings, columns, tables, lists and links — and returns Markdown that reads like the original.**

Zero dependencies · ~4,000 lines of TypeScript · runs in Node and in a browser tab · no native code, no models, no network.

[![npm](https://img.shields.io/npm/v/@mindmax/pdf-markdown)](https://www.npmjs.com/package/@mindmax/pdf-markdown)
[![CI](https://github.com/woodpeng/mindmax-pdf-markdown/actions/workflows/ci.yml/badge.svg)](https://github.com/woodpeng/mindmax-pdf-markdown/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-Apache--2.0-blue)](LICENSE)
[![bundle](https://img.shields.io/badge/bundle-25%20kB%20gzip-brightgreen)](scripts/check-size.mjs)

```bash
npm install @mindmax/pdf-markdown
```

Try it without installing: **[the live converter](https://mindmax.me/tools/pdf-to-markdown/)** runs this library in the browser, with the PDF never leaving the machine.

---

## The problem

Copy text out of a PDF and you get the text layer as the file stores it: a line break at the end of every printed line, the page number sitting in the middle of a sentence, two columns read straight across, a table delivered as a column of fragments. The words are all there; the document is not.

This library reads the geometry — type size, baselines, x positions, marked content — and rebuilds the structure before it writes anything:

| In the PDF | In the Markdown |
|---|---|
| Larger type, `3.1`, a line on its own | `### 3.1 Experimental Setup` |
| Wrapped lines of one paragraph | One paragraph, line breaks removed, hyphenation repaired mid-word |
| A paragraph that runs onto the next page | Still one paragraph |
| Two columns | Left column first, then right |
| Rows and columns of cells | A GFM table |
| Bullets, numbered items, hanging indents | `- item`, `1. item`, continuation lines joined |
| A running header, footer, page number, watermark | Removed |
| A link annotation over some words | `[those words](https://…)` |
| `$5`, `*`, `1990. A year` as body text | Escaped, so Markdown does not read them as syntax |

## What it does not do

Stated plainly, because you will find out anyway:

- **Scanned PDFs.** A scan is a picture of a page. There is no text layer to rebuild and this library will not invent one — `convertPdfToMarkdown` returns `{ ok: false, reason: 'scanned' }` so you can send the file to OCR instead.
- **Equations.** A PDF does not store equation structure. `x²` arrives as `x2` and fractions lose their bars. `assessPdfTextLayer` tells you which pages are affected so you can route them elsewhere.
- **Images, bold and italic.** You get text and structure. Figures stay in the PDF and emphasis is not marked.
- **Unusual layouts.** Posters, forms, slides saved as PDF and tables without column gutters can come out in a surprising order, or as paragraphs where you expected a table.

## Usage

The library never loads pdf.js itself: you pass an opened pdf.js document, and the `Pdf*Like` types are structural, so any build satisfies them (browser, Node legacy, or a fake in a test).

### Node

```ts
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { convertPdfToMarkdown } from '@mindmax/pdf-markdown';

const require = createRequire(import.meta.url);
const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');

// cMaps and standard fonts are not optional: without them, CJK text comes out
// as punctuation and some Latin fonts as nothing at all.
const pdfjsRoot = path.dirname(require.resolve('pdfjs-dist/package.json'));
const asset = (dir: string) => `${path.join(pdfjsRoot, dir).replace(/\\/g, '/')}/`;

const doc = await getDocument({
  data: new Uint8Array(await readFile('paper.pdf')),
  cMapUrl: asset('cmaps'),
  standardFontDataUrl: asset('standard_fonts'),
  wasmUrl: asset('wasm'),
}).promise;

const result = await convertPdfToMarkdown(doc);
if (result.ok) {
  console.log(result.markdown);
  console.log(`${result.pageCount} pages, ${result.links} links`);
  if (result.textLayerIssues) console.warn('some pages need a look:', result.textLayerIssues);
} else {
  console.warn(`no text: ${result.reason}`);
}
await doc.destroy();
```

`examples/node` is this, as a CLI: `pdf2md paper.pdf > paper.md`.

### Browser

```ts
import { getDocument } from 'pdfjs-dist';
import { convertPdfToMarkdown } from '@mindmax/pdf-markdown';

const doc = await getDocument({ data: await file.arrayBuffer() }).promise;
const result = await convertPdfToMarkdown(doc, {
  onPage: (page, total) => progress(page / total),
});
```

`examples/browser` is a drag-and-drop page that does exactly this.

### Two halves, if you need them

```ts
import { readPdfTextLayer, pdfTextLayerToMarkdown, buildPdfTextMap } from '@mindmax/pdf-markdown';

// Read the text layer once, then convert it — or use the canonical text yourself.
const layer = await readPdfTextLayer(doc, { links: true });
const map = buildPdfTextMap(layer.pageItems);   // map.text is the canonical reading text
const result = pdfTextLayerToMarkdown(layer, map);
```

## API

| Export | What it is for |
|---|---|
| `convertPdfToMarkdown(doc, opts?)` | Whole job: read the text layer, rebuild, escape, return Markdown |
| `pdfTextLayerToMarkdown(layer, map?)` | The pure half: an already-read layer to Markdown |
| `renderPdfMarkdown(map, pageItems, links?)` | Render an existing map; no reading, no async |
| `readPdfTextLayer(doc, opts?)` | The pdf.js pass: text items, artifact flags, styled pages, links |
| `buildPdfTextMap(pages)` | The structural core: canonical text plus page/item ranges |
| `assessPdfTextLayer(pageItems)` | Health check: maths pages, garbled pages — or `null` |
| `resolvePdfOutlineAuto(doc, styledPages)` | Outline from bookmarks, then tagged structure, then type size |
| `detectTables(items)` | Table detection over one page's geometry |
| `CANONICAL_TEXT_VERSION` | Bumped when `buildPdfTextMap().text` changes for the same input |

### Anchoring to text

`buildPdfTextMap().text` is deterministic: same input, same string, on every platform. If you store an annotation, a comment or a citation as a character offset into that text, **pin the minor version** and re-anchor when `CANONICAL_TEXT_VERSION` changes. Markdown rendering is free to change without bumping it — offsets are into the canonical text, not into the rendered output.

## How it works

```
pdf.js text items (str, transform, height, font, marked-content ids)
        │
        ├─ artifacts.ts     /Artifact marked content → page furniture, stated by the file
        │
        ├─ text-map.ts      baselines → lines → blocks: reading order across columns,
        │                   paragraph joins, hyphenation, headings by size and numbering,
        │                   lists by indent, tables by gutters, repeated-line furniture
        │
        ├─ outline.ts       bookmarks  →  tagged structure tree  →  type-size heuristic
        │
        └─ markdown.ts      escape only the PDF's own characters, restore link annotations
```

Two details that matter more than they look:

- **Nothing is timing-, locale- or float-tolerance-dependent.** The output feeds offsets that must survive a restart; determinism is a correctness requirement, not a nicety.
- **The layout heuristics are the whole trick.** Reading order, running-header detection, heading promotion and table gutters are where the library earns its keep, and where most contributions go.

## Quality

- **170 unit tests**, 97% statement coverage.
- **A 22-document regression corpus** with human-checked assertions: two-column papers, IEEE and Chinese journal layouts, tables, footnotes, a 1930s OCR'd NACA report, the US Constitution, a Chinese government gazette. Every document records its licence and sha256; the converted text is compared against a snapshot and against assertions in the same run.

```bash
pnpm eval --fetch   # download the corpus (82 MB, sha256 checked)
pnpm eval           # assertions + snapshots; exit code 1 on any regression
```

The corpus is the project's memory: every bug reported with a document becomes a case that never stops running. See [eval/README.md](eval/README.md).

## Contributing

The most valuable contribution is not code — it is **a PDF that converts badly**, with a licence that lets us keep its converted text:

- [Submit a corpus case](https://github.com/woodpeng/mindmax-pdf-markdown/issues/new?template=corpus_case.yml) — filing it is already an improvement.
- [Report a bug](https://github.com/woodpeng/mindmax-pdf-markdown/issues/new?template=bug_report.yml) when you cannot share the document.
- Read [CONTRIBUTING.md](CONTRIBUTING.md) before a PR: tests, the corpus workflow, and the DCO sign-off.

Good first issues are labelled [`good first issue`](https://github.com/woodpeng/mindmax-pdf-markdown/labels/good%20first%20issue).

## Licence

Apache-2.0. The corpus is separate: the converted texts stay under each document's own licence — see [eval/corpus/ATTRIBUTION.md](eval/corpus/ATTRIBUTION.md). "MindMax" is a trademark; see [TRADEMARKS.md](TRADEMARKS.md).

---

Built and maintained by [MindMax](https://mindmax.me), where it powers PDF reading and conversion in a knowledge app. Extracted and opened because a good PDF parser should not be a proprietary advantage.
