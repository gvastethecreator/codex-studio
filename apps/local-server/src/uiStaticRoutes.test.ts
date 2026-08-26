import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Hono } from 'hono';
import { describe, expect, it } from 'vite-plus/test';
import {
  createUiStaticHandler,
  isReservedStudioAppPath,
  resolveUiDistDir,
  uiDistIsReady,
} from './uiStaticRoutes';

describe('uiStaticRoutes', () => {
  it('resolves the Vite dist folder, with STUDIO_UI_DIST as an override', () => {
    expect(resolveUiDistDir({}, 'D:/repo')).toBe(path.resolve('D:/repo', 'dist'));
    expect(resolveUiDistDir({ STUDIO_UI_DIST: 'E:/portable/ui' }, 'D:/repo')).toBe(
      path.resolve('E:/portable/ui'),
    );
  });

  it('reserves API and library paths so the UI cannot swallow them', () => {
    expect(isReservedStudioAppPath('/api/health')).toBe(true);
    expect(isReservedStudioAppPath('/library/outputs/a.png')).toBe(true);
    expect(isReservedStudioAppPath('/')).toBe(false);
    expect(isReservedStudioAppPath('/recipes/spritesheet')).toBe(false);
  });

  it('serves index.html, hashed assets, and SPA routes from one origin', async () => {
    const rootDir = mkdtempSync(path.join(os.tmpdir(), 'studio-ui-dist-'));

    try {
      mkdirSync(path.join(rootDir, 'assets'), { recursive: true });
      writeFileSync(path.join(rootDir, 'index.html'), '<html>studio-ui</html>', 'utf8');
      writeFileSync(path.join(rootDir, 'assets', 'app.js'), 'window.studio = true', 'utf8');

      expect(uiDistIsReady(rootDir)).toBe(true);

      const app = new Hono();
      app.get('/api/health', (c) => c.json({ ok: true }));
      app.on(['GET', 'HEAD'], '*', createUiStaticHandler({ rootDir }));

      const indexResponse = await app.request('/');
      expect(indexResponse.status).toBe(200);
      expect(await indexResponse.text()).toContain('studio-ui');

      const assetResponse = await app.request('/assets/app.js');
      expect(assetResponse.status).toBe(200);
      expect(await assetResponse.text()).toBe('window.studio = true');

      const spaResponse = await app.request('/recipes/spritesheet');
      expect(spaResponse.status).toBe(200);
      expect(await spaResponse.text()).toContain('studio-ui');

      const healthResponse = await app.request('/api/health');
      expect(healthResponse.status).toBe(200);
      await expect(healthResponse.json()).resolves.toEqual({ ok: true });

      const missingAsset = await app.request('/assets/missing.js');
      expect(missingAsset.status).toBe(404);

      const escaped = await app.request('/../package.json');
      expect(escaped.status).toBe(404);
    } finally {
      rmSync(rootDir, { recursive: true, force: true });
    }
  });

  it('does not serve a UI when index.html is missing', async () => {
    const rootDir = mkdtempSync(path.join(os.tmpdir(), 'studio-ui-empty-'));

    try {
      const app = new Hono();
      app.on(['GET', 'HEAD'], '*', createUiStaticHandler({ rootDir }));
      const response = await app.request('/');
      expect(response.status).toBe(404);
    } finally {
      rmSync(rootDir, { recursive: true, force: true });
    }
  });
});
