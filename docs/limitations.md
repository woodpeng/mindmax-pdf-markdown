# Limitations

Every item here is a real behaviour, not a missing feature that will arrive next month. Knowing which one you are hitting saves an afternoon.

## No text layer, no output

A scanned page is an image of text. There is nothing to rebuild, and the library will not guess.

```ts
const result = await convertPdfToMarkdown(doc);
if (!result.ok && result.reason === 'scanned') {
  // route to OCR
}
```

`pdfLooksScanned` makes the call from two signals: text length per page, and the share of pages that are effectively blank. A slide deck with twelve words per page clears it; a scan does not.

A PDF can also fail with `reason: 'empty'` — a text layer exists but holds nothing but whitespace.

## Equations arrive flattened

PDF has no equation structure. A superscript is a character at a smaller size, a fraction is three characters at different heights, and a root is a radical glyph next to its contents.

- `x²` becomes `x2`
- `a/b` set as a fraction becomes `ab` or `a b`
- Glyphs from a maths font without a `ToUnicode` map become private-use code points

`assessPdfTextLayer` counts the pages where this is happening (symbol density, flattened-script geometry) so you can send exactly those pages to a maths-aware tool instead of the whole document:

```ts
const issues = assessPdfTextLayer(layer.pageItems);
// { mathPages: 7, garbledPages: 0, pages: 32 } | null
```

It never repairs anything. Reporting is the whole job.

## Emphasis and images are not carried over

Bold, italic, colour, font family, images, figure captions as captions — none of it. You get text and its structure. A caption ends up as a paragraph like any other.

If you need the figure, read it from the PDF; this library is not an extractor.

## Layouts where the heuristics guess wrong

| Layout | What tends to happen |
|---|---|
| Posters, infographics, brochures | Reading order becomes whichever block the geometry suggests; text can interleave |
| Forms with label/value pairs | Labels and values arrive as separate lines, in an order that may not pair them |
| Slides exported to PDF | Large type everywhere, so headings are promoted too eagerly |
| Tables with merged cells | Columns collapse; the table can come out as paragraphs |
| Tables with no gutter | Detected as body text — sometimes correctly |
| Right-to-left scripts | Column and reading-order heuristics assume left-to-right flow; expect errors |
| Vertical CJK typesetting | Treated as rotated text and dropped as furniture |

## Streaming

The whole document is read before rendering. A large report is held as text items, then as text, then as Markdown. There is no streaming interface yet (see [ROADMAP](../ROADMAP.md)).

## pdf.js version

The library is tested against `pdfjs-dist` 6.x. Because it only uses structural types, other versions usually work — but the text layer is what pdf.js produces, so a change in its item stream changes the output. If you upgrade pdf.js and the output shifts, that is where to look, and it is a corpus case worth filing.

## What "no dependencies" does not mean

It means zero runtime dependencies in the published package. In Node you still need `pdfjs-dist` to produce the document object — that is the caller's dependency, and deliberately not pinned by this package.
