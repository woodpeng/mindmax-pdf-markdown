# Contributing

Thanks for being here. This project gets better in one specific way: **a document that converts badly becomes a permanent test case.** Code is welcome, but a well-filed corpus case is worth more than a patch, because it keeps paying after it is fixed.

## The highest-value contribution

If you only have five minutes, [file a corpus case](../../issues/new?template=corpus_case.yml). It needs three things:

1. A stable URL to the PDF.
2. A licence that lets us redistribute the **converted text**: CC BY, CC0, public domain, or an official document excluded from copyright (US federal works, Chinese government documents).
3. Two or three facts a maintainer can check against the PDF — a heading that must exist, a running header that must not appear, a table header row.

We will add it to `eval/corpus/manifest.json` as a `todo` assertion: red first, then fixed, then promoted to `expect`. From that day on, no change can silently break it again.

## Before a pull request

```bash
pnpm install
pnpm typecheck
pnpm test            # unit tests, no network
pnpm eval --fetch    # once: downloads the corpus (82 MB, sha256 checked)
pnpm eval            # snapshots + assertions
pnpm build && node scripts/check-size.mjs
```

Everything must be green. If `pnpm eval` reports that output changed, **read the diff** — `git diff --no-index -- eval/corpus/golden eval/corpus/out` — before deciding it is fine.

### When output changes

| What changed | What the PR must do |
|---|---|
| `buildPdfTextMap().text` (canonical text) | Bump `CANONICAL_TEXT_VERSION` in `src/index.ts`, add a CHANGELOG line, and update snapshots with `pnpm eval --update` |
| Markdown only (escaping, links, table formatting) | Update snapshots with `pnpm eval --update`; no version bump |
| Nothing visible | No snapshot change — if there is one, the change did more than it claims |

Snapshots record "what it looks like now", not "what it should look like". They only have meaning if a human read the diff. A PR that runs `--update` without saying why will be sent back.

### Rules that are not negotiable

- **No runtime dependencies.** The package ships with none, and that is a feature. A dependency needs an issue and a very good reason first.
- **Determinism.** No `Date.now()`, no locale-dependent comparison, no unordered iteration in anything that shapes the text. Offsets into that text must survive a restart.
- **No new public API without a test.** Everything exported from `src/index.ts` is a compatibility promise.
- **Type and lint cleanliness.** `tsc --noEmit` in strict mode; no `any` without a `// why:` comment.

## Commits and licensing

Sign off every commit — it is how you certify you wrote the code or have the right to submit it:

```bash
git commit -s -m "fix: keep a table header out of the running-header pass"
```

The sign-off adds a `Signed-off-by:` line ([Developer Certificate of Origin 1.1](https://developercertificate.org/)). By contributing you agree to license your work under Apache-2.0.

Commit messages: `fix:`, `feat:`, `docs:`, `test:`, `perf:`, `refactor:`, `chore:` — the subject says what the user sees, not which file you touched.

## Where help is most useful

The heuristics in `src/text-map.ts` are the heart of the project and the hardest part to get right. Useful entry points:

- **Reading order** — multi-column layouts with sidebars, figures and full-width headings.
- **Tables** — merged cells, tables without clear gutters, tables that span pages.
- **Headings** — same-size headings, headings that wrap, numbered series that are actually lists.
- **Page furniture** — headers that vary per chapter, watermarks, page numbers in unusual places.

Issues labelled [`good first issue`](../../labels/good%20first%20issue) are scoped to be finishable in an evening.

## Review

- First response within 72 hours, usually sooner.
- A maintainer reviews the diff, not the person. Expect questions about the corpus case and the snapshot diff.
- Small, focused PRs merge fast. A PR that refactors and changes behaviour in the same commit gets split.

## Code of conduct

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
