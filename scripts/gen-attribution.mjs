// Regenerates eval/corpus/ATTRIBUTION.md from manifest.json.
//
// The corpus ships converted text for documents that permit redistribution.
// Several of those licences require attribution, so the attribution file is
// generated from the same manifest the tests read — it cannot drift.
//
//   node scripts/gen-attribution.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, 'eval/corpus/manifest.json');
const outPath = path.join(root, 'eval/corpus/ATTRIBUTION.md');

const { documents } = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const rows = documents
  .map((d) => `| \`${d.id}\` | ${d.source.replace(/\|/g, '\\|')} | <${d.url}> | ${d.license} |`)
  .join('\n');

const body = `# Corpus attribution

The files under \`eval/corpus/golden/\` are Markdown **converted from** the documents
listed below, by the code in this repository. They are not copies of the
originals: only text extraction and structural formatting were applied — no
translation, no editing of wording.

Each document remains under its own licence, as recorded in
[\`manifest.json\`](./manifest.json). The Apache-2.0 licence of this repository
covers the code, not these converted texts.

Documents were selected only from sources that permit redistribution of derived
text (CC BY, CC0, public domain, or official documents excluded from copyright).
The PDFs themselves are not redistributed: \`pnpm eval --fetch\` downloads them
from the URLs below and verifies their sha256.

| id | source | url | licence |
|---|---|---|---|
${rows}

If you hold rights to one of these documents and want it removed, open an issue
and it will be dropped from the corpus.
`;

fs.writeFileSync(outPath, body);
console.log(`wrote ${path.relative(root, outPath)} (${documents.length} documents)`);
