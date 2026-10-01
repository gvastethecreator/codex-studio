import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import type { Job, JobDetailResponse } from '../packages/shared/src';

const baseUrl = process.argv
  .find((argument) => argument.startsWith('--url='))
  ?.slice('--url='.length);

if (!baseUrl) throw new Error('Missing --url for core asset browser smoke');
const libraryDir = process.argv
  .find((argument) => argument.startsWith('--library-dir='))
  ?.slice('--library-dir='.length);
const screenshot = process.argv
  .find((argument) => argument.startsWith('--screenshot='))
  ?.slice('--screenshot='.length);
if (!libraryDir) throw new Error('Missing isolated --library-dir for Library URL smoke');

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addInitScript(() => {
  window.localStorage.setItem('studio-onboarding-complete', 'true');
});
const page = await context.newPage();
page.setDefaultNavigationTimeout(20_000);
page.setDefaultTimeout(20_000);
const badAssetResponses = new Set<string>();
const pageErrors: string[] = [];
const origin = new URL(baseUrl).origin;

page.on('response', (response) => {
  const request = response.request();
  const url = new URL(response.url());
  if (
    url.origin === origin &&
    response.status() >= 400 &&
    ['document', 'font', 'image', 'script', 'stylesheet'].includes(request.resourceType())
  ) {
    badAssetResponses.add(`${response.status()} ${url.pathname}`);
  }
});
page.on('pageerror', (error) => pageErrors.push(error.message));

const routes = [
  {
    name: 'Default',
    hash: '#recipes',
    selector: '[data-route-key="recipes-list"] [data-compact-style-selector]',
  },
  {
    name: 'Character Lab',
    hash: '#recipe-character-lab',
    selector: '[data-route-key="recipe-character-lab"] [data-character-lab-generate-button]',
  },
];
const observations: Array<{ name: string; brokenImages: string[] }> = [];

async function api<T>(route: string, method = 'GET', data?: unknown): Promise<T> {
  const response = await context.request.fetch(`${baseUrl}${route}`, { method, data });
  assert.ok(response.ok(), `${method} ${route}: ${response.status()}`);
  return response.json() as Promise<T>;
}

async function seedDryRun(workspaceId: string, prompt: string, favorite = false) {
  const job = await api<Job>('/api/jobs', 'POST', { kind: 'dry_run', workspaceId, prompt });
  const deadline = Date.now() + 20_000;
  let detail: JobDetailResponse;
  do {
    detail = await api<JobDetailResponse>(`/api/jobs/${job.id}`);
    if (!['queued', 'running'].includes(detail.job.status)) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  } while (Date.now() < deadline);
  assert.equal(detail.job.status, 'completed');
  assert.equal(detail.job.providerId, 'dry_run');
  assert.equal(detail.catalogImages.length, 1);
  if (favorite)
    await api(`/api/catalog/${detail.catalogImages[0].id}`, 'PATCH', { isFavorite: true });
}

async function waitForLibraryCount(count: number) {
  await page.waitForFunction(
    (expected) =>
      document.querySelectorAll('button[aria-label^="Open image preview:"]').length === expected,
    count,
  );
}

async function verifyLibraryUrl() {
  const health = await api<{ libraryDir: string }>('/api/health');
  assert.equal(path.resolve(health.libraryDir), path.resolve(libraryDir!));
  await api('/api/workspaces', 'POST', { id: 'url-alpha', name: 'URL Alpha' });
  await api('/api/workspaces', 'POST', { id: 'url-beta', name: 'URL Beta' });
  await seedDryRun('url-alpha', 'Library amber', true);
  await seedDryRun('url-alpha', 'Library blue');
  await seedDryRun('url-beta', 'Library beta');
  await api('/api/settings', 'PATCH', { preferredWorkflow: 'character-lab' });

  // A plain start still opens the saved workflow after workspace URL normalization.
  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
  await page.locator(routes[1].selector).waitFor({ state: 'attached' });
  await page.waitForURL((url) => url.hash === '#recipe-character-lab');

  // An explicit Library link takes priority and keeps foreign parameters.
  await page.goto(`${baseUrl}/?workspace=url-alpha&foreign=kept`, {
    waitUntil: 'domcontentloaded',
  });
  const search = page.getByRole('searchbox', { name: 'Search library', exact: true });
  await search.waitFor();
  await waitForLibraryCount(2);
  assert.equal(new URL(page.url()).hash, '');
  const historyLength = await page.evaluate(() => history.length);
  await search.fill('Library');
  await page.getByRole('button', { name: 'Sort images: Created newest', exact: true }).click();
  await page.getByRole('menuitemradio', { name: /Created oldest/ }).click();
  await page.waitForURL(
    (url) => url.searchParams.get('q') === 'Library' && url.searchParams.get('sort') === 'asc',
  );
  assert.match(
    (await page
      .getByRole('button', { name: /^Open image preview:/ })
      .first()
      .getAttribute('aria-label')) ?? '',
    /amber/,
  );
  await page.getByRole('button', { name: 'Favorites (1)', exact: true }).click();
  await waitForLibraryCount(1);
  await page.waitForURL((url) => url.searchParams.get('favorites') === 'true');
  assert.equal(await page.evaluate(() => history.length), historyLength);
  const libraryUrl = page.url();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForLibraryCount(1);
  assert.equal(await search.inputValue(), 'Library');
  await page.getByRole('button', { name: 'Sort images: Created oldest', exact: true }).waitFor();

  // Hash overlays retain query state; Escape returns to the same Library view.
  await page.getByRole('button', { name: /^Open image preview:/ }).click();
  await page.waitForURL((url) => url.hash === '#modal');
  await page.getByRole('dialog', { name: 'Image viewer', exact: true }).waitFor();
  assert.equal(new URL(page.url()).search, new URL(libraryUrl).search);
  await page.keyboard.press('Escape');
  await page.waitForURL((url) => !url.hash);

  await search.fill('no matching images');
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await page.waitForURL((url) => !url.searchParams.has('q') && !url.searchParams.has('favorites'));
  await waitForLibraryCount(2);
  await page.getByRole('button', { name: 'Sort images: Created oldest', exact: true }).click();
  await page.getByRole('menuitemradio', { name: /Created oldest/ }).waitFor();
  await page.keyboard.press('Escape');
  assert.equal(
    await page
      .getByRole('button', { name: 'Sort images: Created oldest', exact: true })
      .evaluate((element) => element === document.activeElement),
    true,
  );

  const beforeSwitch = await page.evaluate(() => history.length);
  await page.getByRole('button', { name: /^Open workspace switcher:/ }).click();
  await page.getByRole('button', { name: 'Switch to workspace URL Beta', exact: true }).click();
  await page.waitForURL((url) => url.searchParams.get('workspace') === 'url-beta');
  await waitForLibraryCount(1);
  assert.equal(await page.evaluate(() => history.length), beforeSwitch + 1);
  await page.goBack();
  await page.waitForURL((url) => url.searchParams.get('workspace') === 'url-alpha');
  await waitForLibraryCount(2);
  await page.goForward();
  await page.waitForURL((url) => url.searchParams.get('workspace') === 'url-beta');
  await waitForLibraryCount(1);
  assert.equal(new URL(page.url()).searchParams.get('foreign'), 'kept');
  await page.getByRole('button', { name: 'Open create workspace', exact: true }).click();
  await page.waitForURL((url) => url.hash.length > 0);
  assert.equal(new URL(page.url()).searchParams.get('workspace'), 'url-beta');
  await page.getByRole('button', { name: 'Open Library', exact: true }).click();
  await page.waitForFunction(
    () =>
      document.querySelector('button[aria-label="Open Library"]')?.getAttribute('aria-current') ===
      'page',
  );
  await search.waitFor();
  await waitForLibraryCount(1);
  if (screenshot) {
    mkdirSync(path.dirname(screenshot), { recursive: true });
    await page.evaluate(async () => {
      await new Promise(requestAnimationFrame);
      await Promise.all(
        document
          .getAnimations()
          .filter((animation) => Number.isFinite(animation.effect?.getComputedTiming().endTime))
          .map((animation) => animation.finished.catch(() => {})),
      );
    });
    await page.screenshot({ path: screenshot, animations: 'disabled' });
  }

  const workspacesBeforeNormalization = await api('/api/workspaces');
  await page.goto(
    `${baseUrl}/?workspace=missing&q=&favorites=invalid&sort=invalid&foreign=kept#recipes`,
  );
  await page.waitForURL(
    (url) => url.search === '?workspace=default&foreign=kept' && url.hash === '#recipes',
  );
  await page.locator(routes[0].selector).waitFor({ state: 'attached' });
  const workspaces =
    await api<Array<{ id: string; filter: unknown; sortOrder: string }>>('/api/workspaces');
  assert.deepEqual(workspaces, workspacesBeforeNormalization);
  assert.ok(workspaces.some((workspace) => workspace.id === 'url-alpha'));
  assert.ok(workspaces.some((workspace) => workspace.id === 'url-beta'));
  observations.push({
    name: 'Library URL: dry_run, filters, reload, history, overlays, startup',
    brokenImages: [],
  });
}

try {
  await page.goto(`${baseUrl}/#recipes`, { waitUntil: 'domcontentloaded' });
  for (const route of routes) {
    await page.evaluate((hash) => {
      window.location.hash = hash;
    }, route.hash);
    await page.locator(route.selector).waitFor({ state: 'attached' });
    await page.waitForTimeout(500);

    const brokenImages = await page.evaluate(() =>
      Array.from(document.images)
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.getAttribute('src') || '<missing-src>'),
    );
    observations.push({ name: route.name, brokenImages });
  }

  await verifyLibraryUrl();

  const brokenImages = observations.flatMap((route) =>
    route.brokenImages.map((source) => `${route.name}: ${source}`),
  );
  if (badAssetResponses.size > 0 || brokenImages.length > 0 || pageErrors.length > 0) {
    throw new Error(
      JSON.stringify(
        {
          badAssetResponses: [...badAssetResponses],
          brokenImages,
          pageErrors,
        },
        null,
        2,
      ),
    );
  }

  console.log(JSON.stringify({ ok: true, routes: observations.map(({ name }) => name) }));
} catch (error) {
  if (screenshot) {
    mkdirSync(path.dirname(screenshot), { recursive: true });
    await page.screenshot({ path: screenshot.replace(/\.png$/, '.failure.png') });
    writeFileSync(
      screenshot.replace(/\.png$/, '.failure.json'),
      JSON.stringify(
        {
          url: page.url(),
          pageErrors,
          snapshot: (await page.locator('body').ariaSnapshot()).slice(0, 12_000),
        },
        null,
        2,
      ),
    );
  }
  throw error;
} finally {
  await browser.close();
}
