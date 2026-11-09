# Changelog

## 0.1.0 — 2026-11-09

First public release. The extraction engine has run in MindMax's desktop and web
PDF reading for months; this is that engine, extracted, with the regression corpus
that guards it.

### What it does

- Rebuilds a PDF's structure from text-layer geometry: reading order across
  columns, paragraph joins, hyphenation repair, paragraphs that cross page breaks.
- Heading levels from type size and numbering (`3.1`, `第三章`, `Chapter 2`).
- Lists from markers and hanging indents; tables from x-position gutters.
- Page furniture removed: `/Artifact` marked content on tagged PDFs, geometric
  and repetition-based detection for the rest.
- Markdown output that escapes the PDF's own characters and restores link
  annotations.
- Text-layer health check: maths pages where equation structure is lost, pages
  with unmapped glyphs.
- Outline resolution: bookmarks → tagged structure tree → type-size heuristic.

### Notes

- Zero runtime dependencies. pdf.js is the caller's dependency; the types are
  structural, so any build satisfies them.
- `buildPdfTextMap().text` is deterministic and stable within a
  `CANONICAL_TEXT_VERSION`. Consumers anchoring to character offsets should pin a
  minor version.
- Corpus: 22 documents, licence-checked, 82 assertions, snapshots compared on
  every change.
