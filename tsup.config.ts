import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm', 'cjs'],
  target: 'es2022',
  platform: 'neutral',
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  minify: false,
});
