import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite-plus';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  base: './',
  server: {
    port: 17222,
    host: 'localhost',
  },
  preview: {
    port: 17222,
    host: 'localhost',
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
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['**/node_modules/**', '**/dist/**'],
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
