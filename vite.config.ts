import { defineConfig } from 'vitest/config';
import { site } from './src/content/site';

export default defineConfig({
  base: site.base,
  server: { host: true },
  build: { target: 'es2022', assetsInlineLimit: 0 },
  test: { include: ['tests/**/*.spec.ts'], exclude: ['tests/e2e/**'], environment: 'node' },
});
