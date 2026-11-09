# The regression corpus

Twenty-two real documents, converted and checked. It answers two questions a unit test cannot:

1. **Did this change move the canonical text?** (`buildPdfTextMap().text`) — the string that downstream systems store offsets into. If it moved, either the change was intended and `CANONICAL_TEXT_VERSION` gets bumped, or it is a regression.
2. **Was the change an improvement?** Snapshots tell you what changed; the assertions tell you whether the new output is right.

```bash
pnpm eval --fetch            # first run: download the PDFs into cache/ (sha256 checked)
pnpm eval                    # compare; exit code 1 on a regression
pnpm eval --update           # accept current output as the new snapshot
pnpm eval --only nist        # only documents whose id contains "nist"
```

The whole set runs in about 15 seconds once cached. The runner needs **Node 22+** —
`pdfjs-dist` 6 uses `Promise.withResolvers`, which Node 20 lacks. The library itself
has no such requirement.

## What is in the repository

| Path | In git | Contents |
|---|---|---|
| `manifest.json` | yes | Per document: URL, sha256, licence, source, layout tags, `expect` / `todo` assertions |
| `golden/<id>.md` | yes | Markdown snapshot — "what it looks like now", not "what it should look like" |
| `golden/summary.json` | yes | Page count, canonical-text sha256 and length, heading/table/link counts |
| `results.json` | yes | Generated per-document report — see [Sharing the results](#sharing-the-results) |
| `ATTRIBUTION.md` | yes | Generated from the manifest: source, URL and licence per document |
| `cache/` | no | Downloaded PDFs |
| `out/` | no | This run's output; `out/text/` holds the full canonical text |

The PDFs are not redistributed: most licences cover the converted text with attribution, not shipping the file. `--fetch` downloads by URL and refuses a file whose sha256 does not match.

## Reading the output

- `✓` assertions pass and the output matches the snapshot.
- `△` output differs from the snapshot. Read the diff, then decide: `--update` or fix the code.
- `✗` an `expect` assertion failed — that is a regression.
- `⚠ canonical text changed` — offsets downstream are affected. Intended: bump `CANONICAL_TEXT_VERSION` in the same change. See this after a change that only touched the export layer? Then the change reached into the wrong layer.
- `○ todo` — a known defect, still failing. When every todo for a document passes, the run says so and the assertion moves into `expect`.

```bash
git diff --no-index -- eval/corpus/golden eval/corpus/out
```

## Assertions

`expect` must pass; `todo` is expected to fail. Same fields:

| Field | Meaning |
|---|---|
| `result` | `ok` / `scanned` / `empty` |
| `lines` | Must appear as a whole line (heading, list item, table header) |
| `headings` | Must be a heading, at any level |
| `contains` / `absent` | Substring must / must not appear — `absent` catches running headers, page numbers, watermarks |
| `minHeadings` / `maxHeadings` / `minTables` / `maxTables` / `minLinks` | Counts, with upper bounds where false positives are the risk |
| `mathFlagged` / `garbledFlagged` | Whether the health check should report the page |

Write assertions a human can verify against the PDF in under a minute. "This heading exists" and "this running header must not appear" are good. "The output contains 4,182 words" is not.

## Sharing the results

`pnpm eval --report eval/results.json` also writes a machine-readable table: one entry per
document with its counts, how many assertions it carries and pass, and the `todo` checks still
failing. It is committed because a claim about coverage is only worth something if the reader can
check it without running anything, and because a downstream page should not have to re-derive
numbers from snapshots.

```json
{
  "engine": { "package": "@mindmax/pdf-markdown", "version": "0.1.0", "canonicalTextVersion": "1" },
  "totals": { "documents": 22, "pages": 612, "assertions": 120, "assertionsPassed": 120, "knownDefects": 17, "...": 0 },
  "documents": [
    { "id": "nist-sp800-63b", "pages": 80, "headings": 44, "tables": 19, "links": 69,
      "assertions": { "total": 4, "passed": 4 },
      "todos": { "checks": 5, "failing": ["not a heading: \"5.1.1 Memorized Secrets\""] } }
  ]
}
```

It carries **no timings**, so re-running the same engine version produces an identical file and the
diff only moves when the output does. `--report` refuses a partial run (`--only`, or documents
missing from the cache): a table that claims to describe the corpus and does not is worse than no
table. Regenerate and commit it whenever a run changes the output.

## Adding a document

1. It must pass the licence gate: CC BY, CC0, public domain, or an official document excluded from copyright. Nothing else goes in.
2. Add an entry to `manifest.json` with `id`, `name` (a short English label), `url`, `sha256` (`shasum -a 256 file.pdf`), `bytes`, `license`, `source`, `lang`, `layout`. Add `nameLocal` when the document's own title is not in English.
3. Start with the assertions you know are true today as `todo`, with a `note`; anything already passing goes in `expect`.
4. `pnpm eval --fetch --update`, then `node scripts/gen-attribution.mjs`.
5. Commit the manifest, the snapshot and the attribution together.

Snapshots depend on the pdf.js version. After upgrading it, run `--update` and say so in the commit message — otherwise the diff looks like a regression to whoever reads it next.
