import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite-plus';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  base: './',
  optimizeDeps: { entries: ['index.html'] },
  server: {
    port: 17222,
    host: '0.0.0.0',
  },
  preview: {
    port: 17222,
    host: '0.0.0.0',
  },
  build: {
    emptyOutDir: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'styles-browser-support',
              test: (id: string) =>
                /[\\/]components[\\/]recipes[\\/](?:stylePresetManifests|styleLayerComposer|styleBrowserRenderPlan|useStyleComposition|styleCategoryIdentity|styleGridVirtualization|useStyleBrowserNavigation|useUserStyleLibrary)\.tsx?(?:\?.*)?$/.test(
                  id,
                ),
            },
            ...[14, 15].flatMap((pack) =>
              Array.from({ length: pack === 14 ? 8 : 5 }, (_, batch) => ({
                name: `archived-style-presets-${pack}-${batch + 1}`,
                test: (id: string) => {
                  const match = id.match(
                    /[\\/]styles[\\/]manifests[\\/]archive[\\/](?:conceptual-refactor-20260923|identity-repair-20260923)[\\/]presets[\\/]pack_(14|15)[\\/][^\\/]+-(\d{3})\.yaml(?:\?.*)?$/,
                  );
                  return (
                    match !== null &&
                    Number(match[1]) === pack &&
                    Math.floor((Number(match[2]) - 1) / 20) === batch
                  );
                },
              })),
            ),
          ],
        },
      },
    },
  },
  plugins: [...react(), ...tailwindcss()] as never,
  resolve: {
    alias: {
      '@': path.resolve(rootDir, '.'),
      'motion/react': path.resolve(rootDir, 'lib/gsapMotion.tsx'),
    },
  },
  fmt: {
    semi: true,
    singleQuote: true,
  },
  lint: {
    plugins: ['oxc', 'typescript', 'react'],
    categories: {
      correctness: 'error',
    },
    env: {
      builtin: true,
    },
    rules: {
      'no-console': 'error',
      'no-debugger': 'error',
      'no-control-regex': 'off',
      'no-unused-vars': 'off',
      'no-useless-escape': 'off',
    },
    ignorePatterns: [
      'dist/**',
      'generated/**',
      'logs/**',
      'output/**',
      'outputs/**',
      'tmp/**',
      '.tmp/**',
      '.tmp-*',
    ],
    overrides: [
      {
        files: ['**/*.{ts,tsx}'],
        rules: {
          'typescript/no-explicit-any': 'off',
          'typescript/no-unused-vars': 'off',
          'react/rules-of-hooks': 'error',
          'react/exhaustive-deps': 'off',
          'react/only-export-components': 'off',
          // The React Compiler diagnostics introduced by newer Oxlint are a separate
          // component migration; keep this upgrade on the existing lint contract.
          'react/set-state-in-effect': 'off',
          'react/refs': 'off',
          'react/immutability': 'off',
          'react/preserve-manual-memoization': 'off',
          'react/purity': 'off',
          'react/globals': 'off',
          'react/static-components': 'off',
        },
        env: {
          es2022: true,
          browser: true,
        },
      },
      {
        files: [
          'apps/local-server/src/**/*.ts',
          'scripts/**/*.ts',
          'electron/**/*.cjs',
          'utils/runtimeLogger.ts',
        ],
        rules: {
          'no-console': 'off',
        },
        env: {
          es2022: true,
          node: true,
        },
      },
    ],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  test: {
    globals: true,
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.bun.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './coverage',
    },
  },
  staged: {
    '*.{ts,tsx,js,jsx,css,md,json}': 'vp check --fix',
  },
});
