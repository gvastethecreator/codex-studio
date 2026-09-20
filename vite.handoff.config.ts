import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite-plus';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const stylePlaceholder = path.resolve(rootDir, 'assets/recipes/cards/recipe-styles.webp');

const moduleAliases: Array<[RegExp, string]> = [
  [/services[/\\]studio-api[/\\]http(?:\.ts)?$/, 'review/demo-http.ts'],
  [/services[/\\]studioEventSource(?:\.ts)?$/, 'review/demo-events.ts'],
  [/services[/\\]studioRuntime(?:\.ts)?$/, 'review/demo-runtime.ts'],
  [/services[/\\]studio-api[/\\]assetUrls(?:\.ts)?$/, 'review/demo-asset-urls.ts'],
  [/lib[/\\]styleThumbnailCatalog(?:\.ts)?$/, 'review/style-thumbnail-catalog.ts'],
  [/lib[/\\]styleThumbnailPacks\.generated(?:\.ts)?$/, 'review/style-thumbnail-catalog.ts'],
  [/utils[/\\]idb(?:\.ts)?$/, 'review/memory-idb.ts'],
];

function posix(file: string) {
  return file.replaceAll('\\', '/');
}

function handoffResolve() {
  return {
    name: 'handoff-resolve',
    enforce: 'pre' as const,
    resolveId(id: string, importer?: string) {
      const raw = id.split('?')[0] ?? id;
      if (/assets[/\\]recipes[/\\]styles[/\\].+\.webp$/i.test(raw)) {
        return stylePlaceholder;
      }
      let candidate = raw;
      if (importer && (raw.startsWith('.') || raw.startsWith('/'))) {
        candidate = path.resolve(path.dirname(importer.split('?')[0] ?? importer), raw);
      } else if (!path.isAbsolute(raw)) {
        candidate = path.resolve(rootDir, raw);
      }
      const normalized = posix(candidate);
      for (const [pattern, target] of moduleAliases) {
        if (pattern.test(normalized) || pattern.test(posix(raw))) {
          return path.resolve(rootDir, target);
        }
      }
      return null;
    },
  };
}

export default defineConfig({
  base: './',
  cacheDir: path.resolve(rootDir, 'node_modules/.vite-handoff'),
  optimizeDeps: { entries: ['review/index.html'] },
  publicDir: false,
  plugins: [handoffResolve(), ...react(), ...tailwindcss()] as never,
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(rootDir, '.') },
      {
        find: 'motion/react',
        replacement: path.resolve(rootDir, 'lib/gsapMotion.tsx'),
      },
    ],
  },
  build: {
    emptyOutDir: true,
    outDir: path.resolve(rootDir, 'artifacts/interface-handoff/.demo-build'),
    rollupOptions: {
      input: path.resolve(rootDir, 'review/index.html'),
    },
  },
});
