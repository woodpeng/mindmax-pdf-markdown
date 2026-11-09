# Roadmap

What is being worked on, what is deliberately not. Priorities come from the corpus: a failure that a real document demonstrates outranks an idea.

## Now (0.1.x)

- **Grow the corpus.** Every accepted case is a bug that can never silently return. Target: 40 documents, weighted towards layouts the current 22 do not cover — forms, slides exported as PDF, right-to-left text, multi-column with sidebars.
- **Tables.** Merged cells, tables without clean gutters, and a table broken across a page boundary are the three most common complaints. None of them are solved.
- **Heading series.** Distinguishing a numbered series of headings from a numbered list at body size is a heuristic that works most of the time; the failures are predictable and fixable.
- **Footnote linking.** Footnotes are already kept as their own paragraphs; connecting the reference to the note is not done.

## Next (0.2)

- **Page-spanning tables.** Repeating the header row and merging the two halves.
- **Running-header detection across chapters.** Headers that change per chapter currently survive more often than they should.
- **Per-page diagnostics.** `assessPdfTextLayer` reports document-level counts; callers want the page numbers.
- **A documented benchmark.** Pages per second and assertion pass rate, published with the release, so regressions in speed are as visible as regressions in output.

## Later (1.0)

- Freeze the public API once it has survived real use in more than one product.
- A streaming interface for very large documents (page in, Markdown fragment out) so a 900-page report does not have to be held in memory twice.

## Not planned

These come up repeatedly. The answer is no, and here is why:

- **OCR.** Producing a text layer is a different problem with different tools (Tesseract, PaddleOCR, cloud OCR). This library reads a text layer; it will not grow one. `assessPdfTextLayer` and the `scanned` result exist so you can route those files elsewhere.
- **Equation reconstruction.** A PDF stores glyph positions, not `\\frac{a}{b}`. Anything claiming otherwise is running a model. Out of scope for a zero-dependency library.
- **HTML or DOCX layout reconstruction.** Markdown deliberately throws away layout. Rebuilding visual fidelity is the opposite goal.
- **Image extraction.** Different job, different library.

## How to move something up

File a corpus case that demonstrates the problem on a real document. Items backed by a document move; items backed by an opinion wait.
