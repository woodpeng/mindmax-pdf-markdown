// The public surface. Everything below is what a consumer may rely on; renaming
// or removing any of it is a breaking change.

import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import * as api from '../src/index.js';

describe('public API', () => {
  it('exports the conversion entry points', () => {
    for (const name of ['convertPdfToMarkdown', 'pdfTextLayerToMarkdown', 'renderPdfMarkdown', 'buildPdfTextMap', 'readPdfTextLayer']) {
      expect(typeof (api as Record<string, unknown>)[name]).toBe('function');
    }
  });

  it('exports the inspection helpers', () => {
    for (const name of [
      'assessPdfTextLayer',
      'assessPdfPageText',
      'pdfLooksScanned',
      'plainTextLooksGarbled',
      'resolvePdfOutline',
      'resolvePdfOutlineAuto',
      'derivePdfHeuristicOutline',
      'detectTables',
      'insertPdfPageMarkers',
      'pageNumberAtOffset',
    ]) {
      expect(typeof (api as Record<string, unknown>)[name]).toBe('function');
    }
  });

  it('publishes a canonical text version', () => {
    expect(api.CANONICAL_TEXT_VERSION).toMatch(/^\d+$/);
  });

  it('has no runtime dependencies', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
    };
    expect(pkg.dependencies ?? {}).toEqual({});
    expect(pkg.peerDependencies ?? {}).toEqual({});
  });
});
