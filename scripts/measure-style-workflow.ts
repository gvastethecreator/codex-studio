import { chromium, type BrowserContext, type Page } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { createDefaultEditableStudioSettings } from '../packages/shared/src/studioSettings';
import { loadStyleManifestGraph } from './style-manifest-files';
import { projectStyleSearchResultsFromManifestCatalog } from '../components/recipes/styleSearchProjection';

const viewport = { width: 1440, height: 1000 };
const query = 'boudoir';
const samples = 20;
const warmups = 3;
const coldSamples = 5;
type Sample = { index: number; routeMs?: number; searchMs?: number; selectionMs?: number };
const quantile = (values: number[], p: number) =>
  values.toSorted((a, b) => a - b)[Math.ceil(values.length * p) - 1];

export async function installStyleBrowserFixture(context: BrowserContext, unmatched: Set<string>) {
  const settings = createDefaultEditableStudioSettings();
  const timestamp = '2026-09-05T00:00:00.000Z';
  const readiness = {
    revision: 1,
    observedAt: timestamp,
    freshness: 'fresh',
    refreshState: 'idle',
    lastAttemptAt: timestamp,
    lastSuccessAt: timestamp,
    codexRuntime: null,
    localCodexSession: null,
  };
  const workspace = {
    id: 'default',
    name: 'Performance fixture',
    libraryId: null,
    filter: null,
    sortOrder: 'newest',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await context.addInitScript(() => {
    localStorage.setItem('studio-onboarding-complete', 'true');
  });
  await context.route('**/api/**', async (route) => {
    const endpoint = new URL(route.request().url()).pathname;
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
    };
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    if (endpoint === '/api/events')
      return route.fulfill({
        status: 200,
        headers,
        contentType: 'text/event-stream',
        body: ': fixed fixture\n\n',
      });
    let body: unknown;
    if (endpoint === '/api/settings') body = settings;
    else if (endpoint === '/api/readiness/refresh') body = readiness;
    else if (endpoint === '/api/runtime/snapshot')
      body = { health: null, onboarding: null, readiness };
    else if (endpoint === '/api/codex/models')
      body = {
        models: [],
        authMode: null,
        planType: null,
        recommendedDefaultModel: null,
        source: 'app-server',
        fetchedAt: timestamp,
        error: null,
      };
    else if (endpoint === '/api/workspaces') body = [workspace];
    else if (endpoint === '/api/styles/user') body = { styles: [] };
    else if (endpoint === '/api/output-sources')
      body = {
        registry: { schemaVersion: 'external-output-sources/v1', sources: [] },
        candidates: [],
      };
    else if (endpoint === '/api/jobs')
      body = {
        open: [],
        history: [],
        nextCursor: null,
        globalOpenCount: 0,
        workspaces: [workspace],
        counts: {
          queued: 0,
          running: 0,
          completed: 0,
          failed: 0,
          cancelled: 0,
          needs_review: 0,
          open: 0,
          history: 0,
          total: 0,
        },
      };
    else if (
      endpoint === '/api/logs' ||
      endpoint === '/api/assets' ||
      endpoint === '/api/catalog/workspaces'
    )
      body = [];
    else if (endpoint.startsWith('/api/catalog')) body = { images: [], total: 0, hasMore: false };
    else if (endpoint === '/api/providers' || endpoint === '/api/providers/preflight')
      body = { providers: [] };
    else if (endpoint.startsWith('/api/auth/'))
      body = {
        providerId: endpoint.split('/').at(-1),
        status: 'logged_out',
        accountLabel: null,
        expiresAt: null,
        lastError: null,
        verificationUrl: null,
        authorizationUrl: null,
        userCode: null,
      };
    else {
      unmatched.add(endpoint);
      return route.fulfill({
        status: 503,
        headers,
        contentType: 'application/json',
        body: JSON.stringify({ error: `Unmatched performance fixture: ${endpoint}` }),
      });
    }
    return route.fulfill({
      status: 200,
      headers,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
}

async function nextPaint(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}
async function waitForResults(page: Page, count: number) {
  await page.waitForFunction(
    (expected) =>
      Number(
        document
          .querySelector('[data-style-catalog-root]')
          ?.getAttribute('data-style-catalog-results-count'),
      ) === expected,
    count,
  );
}
async function warmSample(
  page: Page,
  target: { id: string; name: string },
  expected: number,
): Promise<Omit<Sample, 'index'>> {
  await page.getByRole('button', { name: 'Catalog', exact: true }).click();
  await page.locator('[data-style-catalog-root][data-style-catalog-state="ready"]').waitFor();
  const input = page.getByRole('textbox', { name: 'Search presets', exact: true });
  await input.fill('');
  await waitForResults(page, 80);
  const searchStart = await page.evaluate(() => performance.now());
  await input.fill(query);
  await waitForResults(page, expected);
  await nextPaint(page);
  const searchMs = (await page.evaluate(() => performance.now())) - searchStart;
  await page
    .locator(`[data-style-catalog-result-id="${target.id}"]`)
    .getByRole('button', { name: 'Select', exact: true })
    .click();
  const card = page.locator(`[data-style-preset-card="${target.id}"]`);
  await card.waitFor();
  const clear = page.getByRole('button', { name: 'Clear selected styles', exact: true });
  if (await clear.isVisible()) await clear.click();
  await page.getByRole('textbox', { name: 'Search styles', exact: true }).hover();
  const selectionStart = await page.evaluate(() => performance.now());
  await card.getByRole('button', { name: `Select ${target.name}`, exact: true }).click();
  await page
    .locator('[data-style-preview-card]')
    .getByRole('heading', { name: target.name, exact: true })
    .waitFor();
  await nextPaint(page);
  const selectionMs = (await page.evaluate(() => performance.now())) - selectionStart;
  return { searchMs, selectionMs };
}

/** Fixed, local browser path. Paired mode alternates the order within each pair. */
export async function measureStyleWorkflow({
  url,
  comparisonUrl,
  output,
}: {
  url: string;
  comparisonUrl?: string;
  output: string;
}) {
  const graph = await loadStyleManifestGraph();
  const results = projectStyleSearchResultsFromManifestCatalog({
    catalog: graph.catalog,
    filters: { query, limit: 80 },
  });
  const target = results[0];
  if (!target) throw new Error('The fixed Styles fixture query returned no target.');
  const fixtureHash = createHash('sha256').update(JSON.stringify(graph.catalog)).digest('hex');
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const unmatched = new Set<string>();
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const observations: Record<string, { cold: Sample[]; warm: Sample[] }> = {};
  const pages: Array<{ name: string; context: BrowserContext; page: Page }> = [];
  const variants = [
    { name: 'baseline', url },
    ...(comparisonUrl ? [{ name: 'treatment', url: comparisonUrl }] : []),
  ];
  const captureDir = path.resolve('.scratch/screenshots/workflow-styles-performance');
  await mkdir(captureDir, { recursive: true });
  const openPage = async () => {
    const context = await browser.newContext({ viewport });
    await installStyleBrowserFixture(context, unmatched);
    const page = await context.newPage();
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    return { context, page };
  };
  try {
    for (const variant of variants) {
      const data: { cold: Sample[]; warm: Sample[] } = { cold: [], warm: [] };
      observations[variant.name] = data;
      for (let index = 0; index < coldSamples; index += 1) {
        const { context, page } = await openPage();
        const started = performance.now();
        await page.goto(variant.url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
        await page.locator('[data-compact-style-selector]').waitFor({ timeout: 60_000 });
        await page.locator('[data-open-style-catalog]').click();
        await page.locator('[data-style-browser-root]').waitFor({ timeout: 60_000 });
        await page.locator('[data-close-style-catalog]').waitFor();
        await nextPaint(page);
        data.cold.push({ index, routeMs: performance.now() - started });
        await page.screenshot({ path: path.join(captureDir, `${variant.name}-entry.png`) });
        await context.close();
      }
      const { context, page } = await openPage();
      pages.push({ name: variant.name, context, page });
      await page.goto(variant.url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      // Let initial fixture reads settle before warmups. The retained baseline
      // remounts its lazy route on the first refresh and can swallow an early click.
      await page.waitForLoadState('networkidle');
      for (let index = 0; index < warmups; index += 1)
        await warmSample(page, target, results.length);
    }
    for (let index = 0; index < samples; index += 1) {
      for (const variant of index % 2 ? pages.toReversed() : pages) {
        observations[variant.name].warm.push({
          index,
          ...(await warmSample(variant.page, target, results.length)),
        });
      }
      console.log(`[styles:measure] completed sample ${index + 1}/${samples}`);
    }
    for (const { name, page } of pages)
      await page.screenshot({ path: path.join(captureDir, `${name}-selected.png`) });
    const summaries = Object.fromEntries(
      Object.entries(observations).map(([name, data]) => [
        name,
        Object.fromEntries(
          ['routeMs', 'searchMs', 'selectionMs'].map((key) => {
            const values = (key === 'routeMs' ? data.cold : data.warm)
              .map((sample) => sample[key as keyof Sample]!)
              .filter(Number.isFinite);
            return [
              key,
              {
                median: quantile(values, 0.5),
                p95: quantile(values, 0.95),
                noiseBandMs: quantile(values, 0.95) - quantile(values, 0.5),
              },
            ];
          }),
        ),
      ]),
    );
    const regressionChecks = comparisonUrl
      ? ['routeMs', 'searchMs', 'selectionMs'].flatMap((metric) =>
          (['median', 'p95'] as const).map((statistic) => {
            const baseline = summaries.baseline[metric];
            const treatment = summaries.treatment[metric];
            const allowedIncreaseMs = Math.max(baseline[statistic] * 0.1, baseline.noiseBandMs);
            const increaseMs = treatment[statistic] - baseline[statistic];
            return {
              metric,
              statistic,
              baselineMs: baseline[statistic],
              treatmentMs: treatment[statistic],
              allowedIncreaseMs,
              increaseMs,
              passed: increaseMs <= allowedIncreaseMs,
            };
          }),
        )
      : [];
    const report = {
      recordedAt: new Date().toISOString(),
      protocol: 'workflow-styles-v1',
      browser: browser.version(),
      runtime: process.version,
      bun: typeof Bun === 'undefined' ? null : Bun.version,
      device: {
        os: `${os.platform()} ${os.release()}`,
        arch: os.arch(),
        cpu: os.cpus()[0]?.model,
        logicalCpus: os.cpus().length,
      },
      viewport,
      fixture: {
        query,
        targetId: target.id,
        targetName: target.name,
        resultCount: results.length,
        fixtureHash,
        userStyles: 0,
        catalogImages: 0,
      },
      coldDefinition: 'Fresh browser context and route entry; OS/filesystem caches are not reset.',
      warmDefinition:
        'Three warmups, then twenty samples. Browser clock spans the accessibility-driven action through the visible result and two animation frames. Selection uses pointer selection and the existing pointer preview.',
      comparison: comparisonUrl
        ? 'Twenty pairs, alternating baseline/treatment order.'
        : 'Initial baseline only. Paired comparison runs both retained builds after edits.',
      regressionThreshold:
        'Larger of 10% or baseline (p95 - median) noise band, checked for median and p95.',
      variants,
      observations,
      summaries,
      regressionChecks,
      verdict: comparisonUrl
        ? regressionChecks.every((check) => check.passed)
          ? 'pass'
          : 'regression'
        : 'baseline-only',
      unmatchedEndpoints: [...unmatched],
      pageErrors,
      consoleErrors: [...new Set(consoleErrors)],
      screenshots: captureDir,
    };
    await mkdir(path.dirname(path.resolve(output)), { recursive: true });
    await writeFile(output, JSON.stringify(report, null, 2));
    if (pageErrors.length || unmatched.size)
      throw new Error(
        `Performance fixture needs correction: ${pageErrors.length} page errors; unmatched endpoints: ${[...unmatched].join(', ')}`,
      );
    if (regressionChecks.some((check) => !check.passed))
      throw new Error(`Styles performance regressed beyond the recorded threshold; see ${output}.`);
    return report;
  } catch (error) {
    for (const { name, page } of pages) {
      await page.screenshot({ path: path.join(captureDir, `${name}-failure.png`) }).catch(() => {});
      await writeFile(
        path.join(captureDir, `${name}-failure.txt`),
        (await page.locator('body').innerText()).slice(0, 8000),
      );
    }
    await mkdir(path.dirname(path.resolve(output)), { recursive: true });
    await writeFile(
      `${output}.incomplete.json`,
      JSON.stringify(
        {
          error: error instanceof Error ? error.message : String(error),
          observations,
          unmatched: [...unmatched],
          pageErrors,
          consoleErrors: [...new Set(consoleErrors)],
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
