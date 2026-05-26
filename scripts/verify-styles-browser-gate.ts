import { chromium, type Page } from 'playwright';

import { searchStylePresetCatalog } from '../components/recipes/stylePresetManifests';
import {
  createStylesBrowserGateExpectation,
  evaluateStylesBrowserGate,
  findMatchingStyleCatalogResources,
  type StylesBrowserGateDomState,
  type StylesBrowserGateObservation,
} from '../lib/stylesBrowserGate';
import { createStyleRenderBudgetReport } from './report-style-render-budget';
import { loadStyleManifestGraph } from './style-manifest-files';

const DEFAULT_URL = 'http://localhost:3000/#recipe-styles';
const DEFAULT_PACK_ID = 'pack_05';
const DEFAULT_CATALOG_QUERY = 'boudoir';
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_VIEWPORT = {
  width: 1600,
  height: 1200,
};

interface BrowserLogEntry {
  observedAt: number;
  text: string;
}

export interface VerifyStylesBrowserGateOptions {
  url?: string;
  packId?: string;
  catalogQuery?: string;
  timeoutMs?: number;
  headed?: boolean;
}

export interface VerifyStylesBrowserGateReport {
  url: string;
  packId: string;
  expectation: ReturnType<typeof createStylesBrowserGateExpectation>;
  observation: StylesBrowserGateObservation;
  violations: string[];
}

function argValue(name: string) {
  return process.argv
    .find((arg) => arg.startsWith(`--${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');
}

function numberArgValue(name: string) {
  const value = argValue(name);
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function usage() {
  return [
    'Usage:',
    '  bun run styles:browser -- [--url=http://localhost:3000/#recipe-styles] [--pack=pack_05] [--query=boudoir] [--timeout=30000] [--headed] [--verify] [--json]',
    '',
    'Notes:',
    '  - Start the UI first (for example `bun run dev:ui`) and keep this gate optional until it is stable enough for wider release use.',
    '  - The script verifies pack_05 collapsed/expanded DOM budgets, confirms the Style Catalog surface is demand-mounted, checks the catalog query result count, and fails on fresh console warnings/errors.',
  ].join('\n');
}

async function collectStyleBrowserDomState(page: Page): Promise<StylesBrowserGateDomState> {
  return page.evaluate(() => {
    const groups = Array.from(document.querySelectorAll<HTMLElement>('[data-style-group]'));
    const eagerGroups = groups.filter((group) =>
      group.querySelector('[data-style-group-grid]'),
    ).length;
    const hiddenButton = document.querySelector<HTMLElement>('[data-style-show-all-categories]');

    return {
      groups: groups.length,
      eagerGroups,
      placeholderGroups: groups.length - eagerGroups,
      renderedCards: document.querySelectorAll('[data-style-preset-card]').length,
      plannedCards: groups.reduce(
        (total, group) =>
          total + Number(group.getAttribute('data-style-group-planned-cards') ?? '0'),
        0,
      ),
      hiddenGroups: Number(hiddenButton?.getAttribute('data-style-hidden-groups') ?? '0'),
      hiddenPresets: Number(hiddenButton?.getAttribute('data-style-hidden-presets') ?? '0'),
    } satisfies StylesBrowserGateDomState;
  });
}

async function getResourceNames(page: Page) {
  return page.evaluate(() => performance.getEntriesByType('resource').map((entry) => entry.name));
}

function filterLogs(entries: BrowserLogEntry[], captureStart: number) {
  return entries.reduce<string[]>((acc, entry) => {
    if (entry.observedAt >= captureStart) acc.push(entry.text);
    return acc;
  }, []);
}

function toFriendlyBrowserError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/Executable doesn't exist|Please run the following command/i.test(message)) {
    return `${message}\n[styles:browser] Chromium for Playwright is missing. Run bunx playwright install chromium and try again.`;
  }
  if (/ERR_CONNECTION_REFUSED|net::ERR_CONNECTION_REFUSED|ECONNREFUSED/i.test(message)) {
    return `${message}\n[styles:browser] The Styles page is not reachable. Start the UI first (for example bun run dev:ui) or pass --url=<reachable URL>.`;
  }
  return message;
}

async function clickViaDom(page: Page, selector: string, timeoutMs: number) {
  await page.waitForSelector(selector, { timeout: timeoutMs });
  await page.locator(selector).evaluate((node) => {
    if (!(node instanceof HTMLElement)) {
      throw new Error('Target is not an HTMLElement');
    }

    node.click();
  });
}

export async function verifyStylesBrowserGate({
  url = DEFAULT_URL,
  packId = DEFAULT_PACK_ID,
  catalogQuery = DEFAULT_CATALOG_QUERY,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  headed = false,
}: VerifyStylesBrowserGateOptions = {}): Promise<VerifyStylesBrowserGateReport> {
  const [renderReport, manifestGraph] = await Promise.all([
    createStyleRenderBudgetReport(),
    loadStyleManifestGraph(),
  ]);
  const packBudget = renderReport.packs.find((pack) => pack.packId === packId);

  if (!packBudget) {
    throw new Error(`Missing render budget for pack ${packId}`);
  }

  const catalogResultCount = searchStylePresetCatalog(manifestGraph.catalog, {
    query: catalogQuery,
    limit: 80,
  }).length;
  const expectation = createStylesBrowserGateExpectation({
    packBudget,
    catalogQuery,
    catalogResultCount,
  });

  const consoleErrors: BrowserLogEntry[] = [];
  const consoleWarnings: BrowserLogEntry[] = [];
  const pageErrors: BrowserLogEntry[] = [];

  const browser = await chromium.launch({
    headless: !headed,
  });

  try {
    const page = await browser.newPage({ viewport: DEFAULT_VIEWPORT });

    page.on('console', (message) => {
      const entry = {
        observedAt: Date.now(),
        text: message.text(),
      } satisfies BrowserLogEntry;
      if (message.type() === 'error') consoleErrors.push(entry);
      if (message.type() === 'warning') consoleWarnings.push(entry);
    });
    page.on('pageerror', (error) => {
      pageErrors.push({
        observedAt: Date.now(),
        text: error.message,
      });
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    await page.waitForSelector('[data-style-browser-root]', { timeout: timeoutMs });

    const captureStart = Date.now();
    await page.reload({ waitUntil: 'domcontentloaded', timeout: timeoutMs });
    await page.waitForSelector('[data-style-browser-root]', { timeout: timeoutMs });

    await clickViaDom(page, `[data-style-pack-id="${packId}"]`, timeoutMs);
    await page.waitForFunction(
      (activePackId) =>
        document
          .querySelector(`[data-style-pack-id="${activePackId}"]`)
          ?.getAttribute('data-style-pack-active') === 'true',
      packId,
      { timeout: timeoutMs },
    );
    await page.waitForFunction(
      () => document.querySelectorAll('[data-style-group]').length > 0,
      undefined,
      {
        timeout: timeoutMs,
      },
    );
    await page.waitForTimeout(200);

    const collapsed = await collectStyleBrowserDomState(page);
    const showMoreCategoriesButton = page.locator('[data-style-show-all-categories]');
    if (expectation.collapsed.hiddenGroups > 0 && (await showMoreCategoriesButton.count()) > 0) {
      await clickViaDom(page, '[data-style-show-all-categories]', timeoutMs);
      await page.waitForFunction(
        (expectedGroupCount) =>
          document.querySelectorAll('[data-style-group]').length === expectedGroupCount,
        expectation.expanded.groups,
        { timeout: timeoutMs },
      );
      await page.waitForTimeout(200);
    }
    const expanded = await collectStyleBrowserDomState(page);

    const mountedBefore = (await page.locator('[data-style-catalog-root]').count()) > 0;
    const matchedResourceNamesBefore = findMatchingStyleCatalogResources(
      await getResourceNames(page),
    );

    await clickViaDom(page, '[data-style-open-catalog]', timeoutMs);
    await page.waitForSelector('[data-style-catalog-root]', { timeout: timeoutMs });
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-style-catalog-root]')
          ?.getAttribute('data-style-catalog-state') === 'ready',
      undefined,
      { timeout: timeoutMs },
    );

    const matchedResourceNamesAfter = findMatchingStyleCatalogResources(
      await getResourceNames(page),
    );
    const catalogSearchInput = page.locator('[data-style-catalog-search-input]');
    await catalogSearchInput.fill(catalogQuery);
    await page.waitForFunction(
      (expectedResultCount) =>
        Number(
          document
            .querySelector('[data-style-catalog-root]')
            ?.getAttribute('data-style-catalog-results-count') ?? '-1',
        ) === expectedResultCount,
      catalogResultCount,
      { timeout: timeoutMs },
    );
    const catalogResultCountInDom = await page.locator('[data-style-catalog-result]').count();
    const mountedAfter = (await page.locator('[data-style-catalog-root]').count()) > 0;

    const observation: StylesBrowserGateObservation = {
      packId,
      collapsed,
      expanded,
      catalog: {
        mountedBefore,
        mountedAfter,
        matchedResourceNamesBefore,
        matchedResourceNamesAfter,
        resultCount: catalogResultCountInDom,
      },
      consoleErrors: filterLogs(consoleErrors, captureStart),
      consoleWarnings: filterLogs(consoleWarnings, captureStart),
      pageErrors: filterLogs(pageErrors, captureStart),
    };
    const violations = evaluateStylesBrowserGate(expectation, observation);

    return {
      url,
      packId,
      expectation,
      observation,
      violations,
    };
  } catch (error) {
    throw new Error(toFriendlyBrowserError(error));
  } finally {
    await browser.close();
  }
}

if (import.meta.main) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(usage());
  } else {
    const verify = process.argv.includes('--verify');
    const asJson = process.argv.includes('--json');

    try {
      const report = await verifyStylesBrowserGate({
        url: argValue('url') ?? DEFAULT_URL,
        packId: argValue('pack') ?? DEFAULT_PACK_ID,
        catalogQuery: argValue('query') ?? DEFAULT_CATALOG_QUERY,
        timeoutMs: numberArgValue('timeout') ?? DEFAULT_TIMEOUT_MS,
        headed: process.argv.includes('--headed'),
      });

      if (asJson) {
        console.log(JSON.stringify(report, null, 2));
      } else {
        console.log(
          `[styles:browser] url=${report.url} pack=${report.packId} query=${JSON.stringify(report.expectation.catalog.query)} violations=${report.violations.length}`,
        );
        console.log(
          `[styles:browser] collapsed groups=${report.observation.collapsed.groups} eager=${report.observation.collapsed.eagerGroups} placeholders=${report.observation.collapsed.placeholderGroups} renderedCards=${report.observation.collapsed.renderedCards} plannedCards=${report.observation.collapsed.plannedCards} hiddenGroups=${report.observation.collapsed.hiddenGroups} hiddenPresets=${report.observation.collapsed.hiddenPresets}`,
        );
        console.log(
          `[styles:browser] expanded groups=${report.observation.expanded.groups} eager=${report.observation.expanded.eagerGroups} placeholders=${report.observation.expanded.placeholderGroups} renderedCards=${report.observation.expanded.renderedCards} plannedCards=${report.observation.expanded.plannedCards}`,
        );
        console.log(
          `[styles:browser] catalog mountedBefore=${report.observation.catalog.mountedBefore} mountedAfter=${report.observation.catalog.mountedAfter} resourcesAfter=${report.observation.catalog.matchedResourceNamesAfter.length} results=${report.observation.catalog.resultCount}`,
        );
        if (report.observation.consoleWarnings.length > 0) {
          console.log(
            `[styles:browser] consoleWarnings=${report.observation.consoleWarnings.join(' | ')}`,
          );
        }
        if (report.observation.consoleErrors.length > 0) {
          console.log(
            `[styles:browser] consoleErrors=${report.observation.consoleErrors.join(' | ')}`,
          );
        }
        if (report.observation.pageErrors.length > 0) {
          console.log(`[styles:browser] pageErrors=${report.observation.pageErrors.join(' | ')}`);
        }
      }

      if (report.violations.length > 0) {
        for (const violation of report.violations) {
          console.error(`- ${violation}`);
        }
        if (verify) process.exitCode = 1;
      } else if (verify && !asJson) {
        console.log('[styles:browser] ok');
      }
    } catch (error) {
      console.error(`[styles:browser] ${error instanceof Error ? error.message : String(error)}`);
      console.error(usage());
      process.exitCode = 1;
    }
  }
}
