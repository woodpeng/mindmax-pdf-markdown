// Fails when the published bundle grows past its budget.
//
// "Zero dependencies and small enough to ship to a browser" is a promise the
// README makes, so it is checked rather than hoped for.

import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const BUDGET_KB = 40;

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'dist/index.js');

if (!fs.existsSync(file)) {
  console.error('dist/index.js not found — run `pnpm build` first');
  process.exit(1);
}

const raw = fs.readFileSync(file);
const gzip = gzipSync(raw, { level: 9 });
const kb = (n) => (n / 1024).toFixed(1);

console.log(`dist/index.js  raw ${kb(raw.length)} KB · gzip ${kb(gzip.length)} KB (budget ${BUDGET_KB} KB)`);

if (gzip.length > BUDGET_KB * 1024) {
  console.error(`over budget: gzip ${kb(gzip.length)} KB > ${BUDGET_KB} KB`);
  process.exit(1);
}
