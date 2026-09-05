import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium, type Route } from 'playwright';
import type { UserStylePreset } from '../packages/shared/src/userStyles';
import { createEmptyUserStyleDraft } from '../components/recipes/userStyleDraftBuilders';
import { installStyleBrowserFixture } from './measure-style-workflow';

/** Public UI drill for user styles, with in-memory API state and controlled response races. */
export async function verifyStyleEditing(url: string, output: string) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const unmatched = new Set<string>();
  await installStyleBrowserFixture(context, unmatched);
  const page = await context.newPage();
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const requests: Array<{ method: string; id: string; outcome: string }> = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  const captureDir = path.resolve('.scratch/screenshots/workflow-style-editing');
  await mkdir(captureDir, { recursive: true });
  let revision = 0;
  const timestamp = () => new Date(Date.UTC(2026, 8, 5, 0, 0, ++revision)).toISOString();
  const draft = createEmptyUserStyleDraft();
  const seed: UserStylePreset = {
    ...draft,
    schemaVersion: 'user-style-preset/v1',
    id: 'user-style-existing',
    name: 'Existing saved style',
    category: 'Custom Styles',
    domain: 'custom',
    attributes: {},
    assets: {},
    source: null,
    isArchived: false,
    createdAt: timestamp(),
    updatedAt: timestamp(),
  };
  const styles = new Map<string, UserStylePreset>([[seed.id, seed]]);
  const id = 'user-style-workflow';
  let failRead = true;
  let failCreate = true;
  let holdPatch = false;
  let holdArchive = false;
  const deferred: { patch?: () => Promise<void>; archive?: () => Promise<void> } = {};
  let patchReady!: () => void;
  let archiveReady!: () => void;
  const pendingPatch = new Promise<void>((resolve) => {
    patchReady = resolve;
  });
  const pendingArchive = new Promise<void>((resolve) => {
    archiveReady = resolve;
  });
  const fulfill = (route: Route, body: unknown, status = 200) =>
    route.fulfill({
      status,
      contentType: 'application/json',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      },
      body: JSON.stringify(body),
    });
  await context.route('**/api/styles/user**', async (route) => {
    const request = route.request();
    const method = request.method();
    const endpoint = new URL(request.url()).pathname;
    if (method === 'OPTIONS') return fulfill(route, {}, 200);
    if (method === 'GET') {
      if (failRead) {
        requests.push({ method, id: '', outcome: 'expected-failure' });
        return fulfill(route, { error: 'Fixture list failure' }, 503);
      }
      requests.push({ method, id: '', outcome: 'read' });
      return fulfill(route, { styles: [...styles.values()].filter((style) => !style.isArchived) });
    }
    if (method === 'POST' && endpoint === '/api/styles/user') {
      if (failCreate) {
        failCreate = false;
        requests.push({ method, id, outcome: 'expected-failure' });
        return fulfill(route, { error: 'Fixture save failure; draft retained.' }, 503);
      }
      const input = request.postDataJSON();
      failRead = false;
      const saved: UserStylePreset = {
        ...seed,
        ...input,
        id,
        createdAt: timestamp(),
        updatedAt: timestamp(),
      };
      styles.set(id, saved);
      requests.push({ method, id, outcome: 'saved' });
      return fulfill(route, saved);
    }
    if (endpoint === `/api/styles/user/${id}` && (method === 'PATCH' || method === 'DELETE')) {
      const saved = {
        ...styles.get(id)!,
        ...(method === 'PATCH' ? request.postDataJSON() : { isArchived: true }),
        updatedAt: timestamp(),
      };
      styles.set(id, saved);
      requests.push({ method, id, outcome: 'saved' });
      if (method === 'PATCH' && holdPatch) {
        deferred.patch = () => fulfill(route, saved);
        patchReady();
        return;
      }
      if (method === 'DELETE' && holdArchive) {
        deferred.archive = () => fulfill(route, saved);
        archiveReady();
        return;
      }
      return fulfill(route, saved);
    }
    unmatched.add(`${method} ${endpoint}`);
    return fulfill(route, { error: 'Unexpected style operation' }, 400);
  });
  const editor = page.locator('[data-user-style-editor]');
  const openCreate = async () => {
    await page.locator('[data-style-create-user-style]').click();
    await editor.waitFor();
  };
  const close = () =>
    editor.getByRole('button', { name: 'Close style editor', exact: true }).click();
  const save = () => editor.getByRole('button', { name: 'Save Style', exact: true }).click();
  const card = page.locator(`[data-style-preset-card="${id}"]`);
  const slot = page.locator(`[data-selected-style-slot="${id}"]`);
  const checks: string[] = [];
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.getByText('Could not load styles', { exact: true }).waitFor();
    await openCreate();
    assert.equal(
      await editor.evaluate((element) => element.contains(document.activeElement)),
      true,
      'Opening the editor must move focus inside it.',
    );
    const editorClose = editor.getByRole('button', { name: 'Close style editor', exact: true });
    await editorClose.focus();
    await page.keyboard.press('Shift+Tab');
    assert.equal(
      await editor
        .getByRole('button', { name: 'Save Style', exact: true })
        .evaluate((element) => element === document.activeElement),
      true,
    );
    await page.keyboard.press('Tab');
    assert.equal(await editorClose.evaluate((element) => element === document.activeElement), true);
    await editor.getByRole('textbox', { name: 'Name', exact: true }).fill('Stacked modal draft');
    await page.getByRole('button', { name: 'Open Studio Settings', exact: true }).click();
    const settings = page.getByRole('dialog', { name: 'Studio Settings', exact: true });
    await settings.getByRole('button', { name: 'Close settings', exact: true }).focus();
    await page.keyboard.press('Tab');
    assert.equal(
      await settings.evaluate((element) => element.contains(document.activeElement)),
      true,
    );
    assert.equal(
      await settings
        .getByRole('button', { name: 'Close settings', exact: true })
        .evaluate((element) => element === document.activeElement),
      false,
    );
    await page.keyboard.press('Escape');
    await settings.waitFor({ state: 'hidden' });
    await editor.waitFor();
    assert.equal(
      await editor.getByRole('textbox', { name: 'Name', exact: true }).inputValue(),
      'Stacked modal draft',
    );
    checks.push(
      'Settings owns the keyboard above the style editor; closing Settings preserves the underlying draft.',
    );
    await page.keyboard.press('Escape');
    await editor.waitFor({ state: 'detached' });
    assert.equal(
      await page
        .locator('[data-style-create-user-style]')
        .evaluate((element) => element === document.activeElement),
      true,
    );
    await page.getByText('Could not load styles', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Retry', exact: true }).waitFor();
    checks.push(
      'Create opens with focus inside; Tab and Shift+Tab wrap; Escape closes and returns focus. The failed catalog read and Retry remain visible.',
    );
    await openCreate();
    await editor.getByRole('textbox', { name: 'Name', exact: true }).fill('Workflow style');
    await editor
      .getByRole('textbox', { name: 'Aesthetic', exact: true })
      .fill('Original charcoal contours.');
    await save();
    await editor.getByText('Fixture save failure; draft retained.', { exact: true }).waitFor();
    assert.equal(
      await editor.getByRole('textbox', { name: 'Name', exact: true }).inputValue(),
      'Workflow style',
    );
    assert.equal(
      await editor.getByRole('textbox', { name: 'Aesthetic', exact: true }).inputValue(),
      'Original charcoal contours.',
    );
    await editor
      .getByText('Fixture save failure; draft retained.', { exact: true })
      .scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(captureDir, 'save-failure.png') });
    await save();
    await editor.waitFor({ state: 'detached' });
    await card.waitFor();
    await page.locator(`[data-style-preset-card="${seed.id}"]`).waitFor();
    checks.push(
      'Failed save retains the draft; retry saves once and refreshes the complete catalog.',
    );
    await card.getByRole('button', { name: 'Select Workflow style', exact: true }).press('Enter');
    await slot.waitFor();
    await page.getByRole('button', { name: 'Edit Style', exact: true }).click();
    await editor.getByRole('textbox', { name: 'Name', exact: true }).fill('Workflow style edited');
    await save();
    await editor.waitFor({ state: 'detached' });
    await slot.getByText('Workflow style edited', { exact: true }).waitFor();
    checks.push('Editing a selected style replaces its selected-layer data.');
    await page.screenshot({ path: path.join(captureDir, 'edited-selection.png') });
    holdPatch = true;
    await page.getByRole('button', { name: 'Edit Style', exact: true }).click();
    await editor.getByRole('textbox', { name: 'Name', exact: true }).fill('Delayed older save');
    await save();
    await page.waitForFunction(() =>
      document.querySelector('[data-user-style-editor]')?.textContent?.includes('Saving'),
    );
    await close();
    await pendingPatch;
    assert.ok(deferred.patch, 'The old PATCH must be pending.');
    await page.getByRole('button', { name: 'Edit Style', exact: true }).click();
    holdArchive = true;
    await editor.getByRole('button', { name: 'Archive', exact: true }).click();
    await page.waitForFunction(() =>
      document.querySelector('[data-user-style-editor]')?.textContent?.includes('Saving'),
    );
    await close();
    await pendingArchive;
    assert.ok(deferred.archive, 'DELETE must be pending.');
    await deferred.archive();
    await slot.waitFor({ state: 'detached' });
    await card.waitFor({ state: 'detached' });
    const patchResponse = page.waitForResponse(
      (response) =>
        response.request().method() === 'PATCH' &&
        response.url().endsWith(`/api/styles/user/${id}`),
    );
    await deferred.patch();
    await (await patchResponse).finished();
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    assert.equal(await slot.count(), 0);
    assert.equal(await card.count(), 0);
    checks.push(
      'Closing a pending archive still removes the selected layer; an older PATCH cannot restore the archived style.',
    );
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator(`[data-style-preset-card="${seed.id}"]`).waitFor();
    assert.equal(await card.count(), 0);
    await page.screenshot({ path: path.join(captureDir, 'archived-reload.png') });
    checks.push('Reload preserves the archive and the other saved style.');
    assert.equal(
      requests.filter((entry) => entry.method === 'POST' && entry.outcome === 'saved').length,
      1,
    );
    assert.equal(requests.filter((entry) => entry.method === 'DELETE').length, 1);
    assert.deepEqual(pageErrors, []);
    assert.deepEqual([...unmatched], []);
    assert.ok(
      consoleErrors.every((message) => message.includes('503 (Service Unavailable)')),
      'Only injected HTTP failures are expected in the console.',
    );
    const report = {
      recordedAt: new Date().toISOString(),
      url,
      browser: browser.version(),
      viewport: { width: 1440, height: 1000 },
      checks,
      requests,
      pageErrors,
      consoleErrors,
      screenshots: captureDir,
      scope: 'In-memory user-style API only; no provider generation or user Library writes.',
    };
    await mkdir(path.dirname(path.resolve(output)), { recursive: true });
    await writeFile(output, JSON.stringify(report, null, 2));
    return report;
  } catch (error) {
    await page.screenshot({ path: path.join(captureDir, 'failure.png') }).catch(() => {});
    await writeFile(
      path.join(captureDir, 'failure.txt'),
      (await page.locator('body').innerText()).slice(0, 12000),
    );
    await mkdir(path.dirname(path.resolve(output)), { recursive: true });
    await writeFile(
      `${output}.incomplete.json`,
      JSON.stringify(
        {
          error: String(error),
          checks,
          requests,
          pageErrors,
          consoleErrors,
          unmatched: [...unmatched],
        },
        null,
        2,
      ),
    );
    throw error;
  } finally {
    await browser.close();
  }
}
