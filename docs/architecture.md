# How the conversion works

Four passes, each with one job. The order is not an implementation detail — later passes read what earlier ones decided.

```
pdf.js text items
      │
      ▼
1. artifacts.ts    /Artifact marked content → furniture, stated by the producer
      │
      ▼
2. text-map.ts     geometry → lines → blocks → canonical text
      │
      ▼
3. outline.ts      bookmarks / struct tree / type size → section entries
      │
      ▼
4. markdown.ts     escape the PDF's own characters, restore links
```

## 1. Page furniture, from the file itself

A Tagged PDF marks running headers, footers, page numbers and watermarks as `/Artifact` marked content. That is the producer saying "this is layout, not content", and it beats every geometric guess. `artifacts.ts` reads those flags per page and hands them to the text pass, which blanks the characters while keeping item indices aligned.

Most PDFs carry no tags at all. For those, furniture is found by geometry and repetition: a line in the top or bottom band that repeats across pages, a page number shape, rotated text (watermarks).

## 2. Lines, blocks, text

`buildPdfTextMap` is where the document is rebuilt. In order:

- **Items → lines**, by baseline. Items on the same baseline are one line; a rotation removes the notion of baseline and is treated separately.
- **Lines → reading order**, across columns. Two columns are detected from a vertical gutter that persists down the page, then read left column first. A full-width element (a title, a figure caption) breaks the column pair and restarts it.
- **Lines → blocks**, by indentation, spacing and sentence ends: a soft-wrapped line joins its predecessor, a short line that ends a sentence closes the paragraph, a hanging indent continues a list item.
- **Blocks → structure**: heading levels from type size tiers and numbering (`3.1`, `第三章`, `Chapter 2`), lists from markers and indents, tables from x-position gutters, footnotes from size and position.
- **Blocks → text**, with `\n\n` between blocks and a page range recorded for every item.

The output is `{ text, pages[], items[] }`: the canonical text, where each page lives in it, and where each item's characters went. Everything downstream — offset anchors, page markers, Markdown rendering, the corpus comparison — reads those ranges instead of re-deriving them.

**Determinism is a requirement here, not a style preference.** The text is what other systems store offsets into. Same items in, same string out, on every platform, in every engine.

## 3. Outlines

`resolvePdfOutlineAuto` tries three sources in order and stops at the first that yields something:

1. **Bookmarks** — the real outline, flattened to three levels, sorted by page.
2. **Tagged structure tree** — `H` / `H1..H6` roles, resolved through marked-content ids to the runs they cover. This is what a Word export usually has, since tagging is on by default and bookmarks are off.
3. **Type-size heuristic** — the heading ladder from pass 2, with the numbering rules applied.

Titles go through the same cleaner in all three paths, so a section name stored from one source matches an entry resolved from another.

## 4. Markdown

`renderPdfMarkdown` walks the canonical text with the item ranges in hand. That gives it the one thing it needs and nothing else does: which characters came from the PDF, and which the assembler wrote.

- Characters the PDF contributed are escaped where Markdown would misread them: `$5` is not maths, `*` is not emphasis, `1990. A year` is not a list, `[12]` is a citation and stays.
- Characters the assembler wrote — `#`, `- `, table pipes — are syntax, and escaping them would break the output.
- Link annotations become `[text](url)`, but only when the annotation covers a whole run: a box over half a word is a bad annotation, not a link.
- A destination with spaces or parentheses is wrapped in angle brackets.

This layer is the only one allowed to care about Markdown. The canonical text stays Markdown-shaped but unescaped, so improving the export never moves an offset.

## Where to make a change

| Symptom | File |
|---|---|
| Text in the wrong order, paragraphs merged or split wrongly | `text-map.ts` (reading order, block assembly) |
| Heading not promoted, or body text promoted | `text-map.ts` (heading ladder), `derived-outline.ts` (cascade) |
| Table shredded, or prose turned into a table | `table.ts` |
| Header, footer, page number, watermark survived | `artifacts.ts` (tagged), `text-map.ts` (geometric) |
| Wrong escape, lost link | `markdown.ts` |
| Wrong page or section for a citation | `outline.ts`, `insertPdfPageMarkers` |
