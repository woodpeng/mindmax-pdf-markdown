# Security policy

## Reporting

Please report privately through GitHub's [private vulnerability reporting](https://github.com/woodpeng/mindmax-pdf-markdown/security/advisories/new), not in a public issue. You will get a first response within 72 hours, and credit in the advisory unless you prefer otherwise.

## Threat model

This library parses untrusted files. It does not execute PDF content: there is no JavaScript engine, no embedded file handling and no network access — pdf.js is loaded and driven by the caller, and this package only consumes the text items it produces.

What a hostile document can still do:

| Risk | Where | Mitigation |
|---|---|---|
| CPU exhaustion — a page whose layout makes the block/heuristic passes quadratic | `text-map.ts`, `table.ts` | Corpus timings are watched; report a document that takes more than a few seconds per page |
| Memory exhaustion — one page with hundreds of thousands of text items, or items holding enormous strings | `readPdfTextLayer`, `buildPdfTextMap` | Callers should cap input size; the browser demo refuses files over 60 MB |
| Prototype pollution — item objects come from pdf.js, not from `JSON.parse` of attacker-controlled keys | everywhere | No object merging of untrusted keys; treated as a real bug class if found |
| Crash of the host process — an out-of-memory kill rather than an exception | anywhere | Run conversion in a worker or child process when the input is untrusted |

**Recommended posture for servers:** treat a PDF like any other untrusted upload — size limit, timeout, and an isolated process. A parser bug should cost you one worker, not the host.

## Supported versions

The latest 0.x release receives security fixes. Once 1.0 ships, the latest minor of the current major is supported.
