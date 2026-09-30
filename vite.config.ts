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
    watch: {
      // Local runtime state and logs are not app source. Watching them pinned the dev server
      // during extension builds.
      ignored: ['**/.local/**', '**/.scratch/**', '**/logs/**'],
    },
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
      'landing/**',
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
