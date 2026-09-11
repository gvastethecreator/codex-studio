import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import type { Job, JobDetailResponse, JobStatus } from '../packages/shared/src';
import { installStyleBrowserFixture } from './measure-style-workflow';
import { createDefaultEditableStudioSettings } from '../packages/shared/src/studioSettings';

/** Exercise Queue and Inspector through public UI with a fail-closed, in-memory API. */
export async function verifyJobWorkflow(url: string, output: string) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const unmatched = new Set<string>();
  await installStyleBrowserFixture(context, unmatched);
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const captureDir = path.resolve('.scratch/screenshots/workflow-jobs');
  await mkdir(captureDir, { recursive: true });
  const timestamp = '2026-09-05T00:00:00.000Z';
  const makeJob = (id: string, status: JobStatus, overrides: Partial<Job> = {}): Job => ({
    id,
    workspaceId: 'default',
    kind: 'image_generate',
    providerId: 'comfy',
    sourceSpec: null,
    status,
    execution: null,
    originalPrompt: id,
    expandedPrompt: null,
    finalPromptUsed: id,
    error: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    completedAt: null,
    attempt: 1,
    attemptQueuedAt: timestamp,
    ...overrides,
  });
  const jobs = [
    makeJob('old-running', 'running', { createdAt: '2026-09-01T00:00:00.000Z' }),
    makeJob('uncertain-result', 'needs_review', { error: 'Provider acceptance unknown' }),
    ...Array.from({ length: 101 }, (_, index) => makeJob(`queued-${index}`, 'queued')),
    makeJob('batch-success', 'completed', { batchId: 'workflow-batch' }),
    makeJob('batch-failed', 'failed', {
      batchId: 'workflow-batch',
      error: 'Fixture provider failure',
    }),
    ...Array.from({ length: 20 }, (_, index) =>
      makeJob(`history-${index}`, index % 2 ? 'cancelled' : 'completed'),
    ),
    makeJob('other-workspace', 'running', { workspaceId: 'other' }),
  ];
  const historyRequests: Array<{
    workspace: string | null;
    status: string | null;
    cursor: number;
  }> = [];
  const retries: unknown[] = [];
  const checks: string[] = [];
  const settingsState = createDefaultEditableStudioSettings();
  const uncertainSubmissions: string[] = [];
  let uncertainBatch: string | null = null;
  let simulateLostAcknowledgement = false;
  let failHistory = true;
  const isOpen = (job: Job) => ['queued', 'running', 'needs_review'].includes(job.status);
  const count = (items: Job[]) => ({
    ...Object.fromEntries(
      ['queued', 'running', 'needs_review', 'completed', 'failed', 'cancelled'].map((status) => [
        status,
        items.filter((job) => job.status === status).length,
      ]),
    ),
    open: items.filter(isOpen).length,
    history: items.filter((job) => !isOpen(job)).length,
    total: items.length,
  });
  const batchSummary = () => {
    const members = jobs.filter((job) => job.batchId === 'workflow-batch');
    return {
      id: 'workflow-batch',
      requestedCount: 2,
      counts: count(members),
      status: members.some((job) => job.status === 'queued') ? 'running' : 'partial',
      retryable: members
        .filter((job) => job.status === 'failed')
        .map((job) => ({ jobId: job.id, attempt: job.attempt })),
    };
  };
  await context.route('**/api/jobs**', async (route) => {
    const request = route.request();
    const parsed = new URL(request.url());
    const endpoint = parsed.pathname;
    const fulfill = (body: unknown, status = 200) =>
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204 });
    if (
      endpoint === '/api/jobs/batches' &&
      request.method() === 'POST' &&
      simulateLostAcknowledgement
    ) {
      const body = request.postDataJSON();
      uncertainSubmissions.push(body.requestId);
      if (!uncertainBatch) {
        uncertainBatch = body.requestId;
        jobs.unshift(
          makeJob('accepted-during-disconnect', 'running', {
            originalPrompt: 'Lost acknowledgement fixture',
            batchId: null,
          }),
        );
      }
      assert.equal(body.requestId, uncertainBatch);
      return fulfill({ error: 'Fixture lost acknowledgement after acceptance' }, 503);
    }
    if (uncertainBatch && endpoint === `/api/jobs/batches/${uncertainBatch}`)
      return fulfill({ error: 'Fixture acknowledgement unavailable' }, 503);
    if (endpoint === '/api/jobs' && request.method() === 'GET') {
      const workspace = parsed.searchParams.get('workspaceId');
      const status = parsed.searchParams.get('status');
      const cursor = Number(parsed.searchParams.get('cursor') || 0);
      historyRequests.push({ workspace, status, cursor });
      if (status === 'failed' && failHistory) {
        failHistory = false;
        return fulfill({ error: 'Fixture history unavailable' }, 503);
      }
      const scoped = jobs.filter((job) => !workspace || job.workspaceId === workspace);
      const history = scoped.filter((job) => !isOpen(job) && (!status || job.status === status));
      return fulfill({
        open: scoped.filter(isOpen),
        history: history.slice(cursor, cursor + 20),
        nextCursor: cursor + 20 < history.length ? String(cursor + 20) : null,
        globalOpenCount: jobs.filter(isOpen).length,
        counts: { ...count(scoped), history: history.length },
        workspaces: [
          { id: 'default', name: 'Performance fixture' },
          { id: 'other', name: 'Other fixture' },
        ],
      });
    }
    if (endpoint === '/api/jobs/batches/workflow-batch/summary') return fulfill(batchSummary());
    if (endpoint === '/api/jobs/batches/workflow-batch/retry' && request.method() === 'POST') {
      const body = request.postDataJSON();
      retries.push(body);
      assert.deepEqual(body.items, [{ jobId: 'batch-failed', attempt: 1 }]);
      const failed = jobs.find((job) => job.id === 'batch-failed')!;
      Object.assign(failed, {
        status: 'queued',
        attempt: 2,
        error: null,
        updatedAt: '2026-09-05T00:01:00.000Z',
      });
      return fulfill({
        id: 'workflow-batch',
        jobs: jobs.filter((job) => job.batchId === 'workflow-batch'),
      });
    }
    const job = jobs.find((job) => endpoint === `/api/jobs/${job.id}`);
    if (job && request.method() === 'GET') {
      const detail: JobDetailResponse = {
        job,
        events: [],
        turn: null,
        transcriptEntries: [],
        catalogImages: [],
        metrics: {
          attempt: job.attempt,
          transport: 'comfy',
          timings: [{ id: 'total', label: 'Total', durationMs: null }],
          tokenUsage: null,
          estimatedPromptTokens: 0,
        },
        traceSummary: {
          providerId: job.providerId,
          model: null,
          task: job.kind,
          status: job.status,
          durationMs: null,
          assetCount: 0,
          tokenUsage: null,
          transcriptPath: null,
          completedAt: null,
        },
      };
      return fulfill(detail);
    }
    unmatched.add(`${request.method()} ${endpoint}`);
    return fulfill({ error: 'Unmatched jobs fixture' }, 503);
  });
  await context.route('**/api/health', (route) =>
    route.fulfill({
      json: {
        ok: true,
        worker: {
          activeWorkerCount: 2,
          maxConcurrentJobs: 4,
          queueLength: 101,
          stopping: false,
          providerLimits: { comfy: 1, codex: 1 },
          activeByProvider: { comfy: 1, codex: 1 },
          waiting: [{ jobId: 'queued-0', providerId: 'comfy', reason: 'provider_capacity' }],
        },
      },
    }),
  );
  await context.route('**/api/providers/preflight', (route) =>
    route.fulfill({
      json: {
        providers: [
          {
            providerId: 'codex',
            runtimeKind: 'subscription_http',
            localRuntimeState: 'configured',
            secretState: 'not_required',
            canAttemptExecution: true,
            diagnostics: [],
            availableModels: ['gpt-5.5'],
            defaultModel: 'gpt-5.5',
          },
        ],
      },
    }),
  );
  await context.route('**/api/settings', (route) => route.fulfill({ json: settingsState }));
  await context.route('**/api/providers', (route) =>
    route.fulfill({
      json: {
        providers: ['codex', 'comfy'].map((providerId) => ({
          providerId,
          label: providerId,
          runtimeKind: providerId === 'codex' ? 'subscription_http' : 'local_runtime',
          status: 'active',
          hasAdapter: true,
          canExecute: true,
          isDefault: providerId === settingsState.defaultProviderId,
          detail: 'In-memory fixture only',
          secretState: 'not_required',
          subscriptionAuthState: 'logged_out',
        })),
      },
    }),
  );
  await context.route('**/api/output-sources', (route) =>
    route.fulfill({
      json: {
        registry: { schemaVersion: 'external-output-sources/v1', sources: [] },
        candidates: [],
      },
    }),
  );
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    const openQueue = () => page.getByRole('button', { name: /Open persistent jobs/ }).click();
    await openQueue();
    await page.getByRole('heading', { name: 'Persistent Jobs', exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: /^Cancel backend job / }).count(), 103);
    await page.getByText('old-running', { exact: true }).waitFor();
    await page.getByText('Waiting for comfy capacity', { exact: true }).waitFor();
    await page.getByText('2 / 4 worker slots active', { exact: true }).waitFor();
    checks.push(
      'All 104 open jobs remain visible, including an old running job and uncertainty; provider wait reason matches health.',
    );
    const batch = page.getByRole('region', { name: 'Batch workflow-batch' });
    await batch.getByText('partial', { exact: true }).waitFor();
    await page.screenshot({ path: path.join(captureDir, 'queue-partial.png') });
    await page.getByRole('button', { name: 'Load older jobs', exact: true }).click();
    await page.getByText('history-19', { exact: true }).waitFor();
    await page.getByText('All matching history loaded.', { exact: true }).waitFor();
    await page
      .getByRole('combobox', { name: 'Job history status', exact: true })
      .selectOption('failed');
    await page.getByText('Fixture history unavailable', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Retry history', exact: true }).click();
    await page.getByText('1 matching jobs', { exact: true }).waitFor();
    await page.getByRole('combobox', { name: 'Job history status', exact: true }).selectOption('');
    await page.getByRole('combobox', { name: 'Job workspace', exact: true }).selectOption('other');
    await page.getByText('other-workspace', { exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: /^Cancel backend job / }).count(), 1);
    await page.getByRole('combobox', { name: 'Job workspace', exact: true }).selectOption('');
    await batch.getByRole('button', { name: 'Retry failed (1)', exact: true }).click();
    await batch.getByText(/1 completed.*1 queued/).waitFor();
    assert.equal(retries.length, 1);
    checks.push(
      'History pagination, failed-read retry and workspace/status filters work; partial retry submits only the failed attempt.',
    );
    await page.reload({ waitUntil: 'domcontentloaded' });
    if (await page.getByRole('button', { name: /Open persistent jobs/ }).isVisible())
      await openQueue();
    await batch.getByText(/1 completed.*1 queued/).waitFor();
    assert.equal(await batch.getByRole('button', { name: /Retry failed/ }).count(), 0);
    assert.equal(retries.length, 1);
    await page.getByText('uncertain-result', { exact: true }).click();
    const inspector = page.getByRole('dialog', { name: 'Studio activity inspector', exact: true });
    await inspector
      .getByRole('heading', { name: 'Review the provider result', exact: true })
      .waitFor();
    assert.equal(await inspector.getByRole('button', { name: /^(Retry|Resume) job$/ }).count(), 0);
    await inspector.getByText('Unavailable', { exact: true }).first().waitFor();
    await page.screenshot({ path: path.join(captureDir, 'uncertain-inspector.png') });
    await page.keyboard.press('Escape');
    await inspector.waitFor({ state: 'hidden' });
    checks.push(
      'Reload keeps partial success and queued retry without resubmission; uncertain Inspector offers no duplicate retry and shows unavailable timing. Escape closes it.',
    );
    const settingsOpener = page.getByRole('button', { name: 'Open Studio Settings', exact: true });
    await page.evaluate(() => {
      const trail: string[] = [];
      Object.assign(window, { workflowFocusTrail: trail });
      document.addEventListener('focusin', (event) => {
        if (event.target instanceof HTMLElement)
          trail.push(
            JSON.stringify({
              target: event.target.outerHTML.slice(0, 180),
              previous:
                event.relatedTarget instanceof HTMLElement
                  ? event.relatedTarget.outerHTML.slice(0, 180)
                  : null,
            }),
          );
      });
    });
    await settingsOpener.focus();
    assert.equal(
      await settingsOpener.evaluate((element) => element === document.activeElement),
      true,
    );
    await settingsOpener.click();
    const settings = page.getByRole('dialog', { name: 'Studio Settings', exact: true });
    await settings.getByText('GPT Image 2.5 Flare · Medium · Managed', { exact: true }).waitFor();
    assert.equal(await settings.getByLabel('Provider default model', { exact: true }).count(), 0);
    assert.equal(
      await settings.getByLabel('Provider default reasoning effort', { exact: true }).count(),
      0,
    );
    await settings
      .getByRole('button', { name: 'Apply HTTP execution settings', exact: true })
      .press('Enter');
    await settings.getByText(/Reasoning and speed are managed by the provider/).waitFor();
    await page.screenshot({ path: path.join(captureDir, 'http-controls.png') });
    await page.keyboard.press('Escape');
    await settings.waitFor({ state: 'hidden' });
    await page.waitForFunction(
      () => document.activeElement?.getAttribute('aria-label') === 'Open Studio Settings',
    );
    assert.equal(
      await settingsOpener.evaluate((element) => element === document.activeElement),
      true,
    );
    checks.push(
      'HTTP settings show the captured model and image policy, omit unsupported model/reasoning selectors, and support keyboard action and focus return.',
    );
    settingsState.defaultProviderId = 'comfy';
    simulateLostAcknowledgement = true;
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page
      .getByRole('textbox', { name: 'Prompt input', exact: true })
      .fill('Lost acknowledgement fixture');
    await page.getByRole('button', { name: 'GENERATE', exact: true }).click();
    await page.getByText(/may have been accepted, but its acknowledgement was lost/).waitFor();
    assert.equal(uncertainSubmissions.length, 2);
    assert.equal(new Set(uncertainSubmissions).size, 1);
    await page.screenshot({ path: path.join(captureDir, 'disconnected-generation.png') });
    if (await page.getByRole('button', { name: /Open persistent jobs/ }).isVisible())
      await openQueue();
    await page
      .getByRole('button', { name: 'Cancel backend job accepted-during-disconnect', exact: true })
      .waitFor();
    await page.reload({ waitUntil: 'domcontentloaded' });
    if (await page.getByRole('button', { name: /Open persistent jobs/ }).isVisible())
      await openQueue();
    await page
      .getByRole('button', { name: 'Cancel backend job accepted-during-disconnect', exact: true })
      .waitFor();
    assert.equal(uncertainSubmissions.length, 2);
    checks.push(
      'Lost batch acknowledgement produces a reconciliation message, repeats only the same request identity, and exposes the accepted running job in Queue after reload without a new submission.',
    );
    assert.deepEqual(errors, []);
    assert.deepEqual([...unmatched], []);
    const report = {
      recordedAt: new Date().toISOString(),
      url,
      browser: browser.version(),
      checks,
      historyRequests,
      retries,
      uncertainSubmissions,
      pageErrors: errors,
      screenshots: captureDir,
      scope: 'In-memory generation APIs. No real provider, auth or user Library access.',
    };
    await mkdir(path.dirname(path.resolve(output)), { recursive: true });
    await writeFile(output, JSON.stringify(report, null, 2));
    return report;
  } catch (error) {
    await page.screenshot({ path: path.join(captureDir, 'failure.png') }).catch(() => {});
    await writeFile(
      path.join(captureDir, 'failure.txt'),
      (await page.locator('body').innerText()).slice(0, 16000),
    );
    await writeFile(
      `${output}.incomplete.json`,
      JSON.stringify(
        {
          error: String(error),
          checks,
          historyRequests,
          retries,
          errors,
          focus: await page.evaluate(() => ({
            active: document.activeElement?.outerHTML.slice(0, 240),
            trail: Reflect.get(window, 'workflowFocusTrail'),
          })),
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
