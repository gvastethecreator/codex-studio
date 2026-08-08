import { chromium, type Browser, type Locator, type Page } from 'playwright';
import { mkdirSync } from 'node:fs';

const DEFAULT_URL = 'http://localhost:3000';
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_OUTPUT_DIR = 'output/playwright/responsive-mobile';

type ViewportName = 'mobile' | 'compact' | 'tablet' | 'desktop';

interface ResponsiveScenario {
  name: string;
  hash: string;
  maxWidth?: number;
  expectedRoute?: string;
  closeQueue?: boolean;
  openQueue?: boolean;
  openByLabel?: string;
  requiresComposer?: boolean;
  requiredSelectors: string[];
  requiredText?: string[];
}

interface ResponsiveViewport {
  name: ViewportName;
  width: number;
  height: number;
  isMobile?: boolean;
}

interface ResponsiveObservation {
  scenario: string;
  viewport: ViewportName;
  hash: string;
  screenshot: string;
  activeRoute: string | null;
  scrollWidth: number;
  innerWidth: number;
  hasHorizontalOverflow: boolean;
  promptVisible: boolean;
  generateVisible: boolean;
  settingsExecutionDefaultsVerified?: boolean;
  violations: string[];
}

const VIEWPORTS: ResponsiveViewport[] = [
  { name: 'compact', width: 360, height: 740, isMobile: true },
  { name: 'mobile', width: 390, height: 844, isMobile: true },
  { name: 'tablet', width: 768, height: 1024, isMobile: true },
  { name: 'desktop', width: 1440, height: 900 },
];

const SCENARIOS: ResponsiveScenario[] = [
  {
    name: 'studio',
    hash: '#studio',
    expectedRoute: 'studio',
    closeQueue: true,
    requiresComposer: true,
    requiredSelectors: [],
  },
  {
    name: 'composer-controls',
    hash: '#studio',
    maxWidth: 639,
    expectedRoute: 'studio',
    closeQueue: true,
    openByLabel: 'Open generation controls',
    requiresComposer: true,
    requiredSelectors: ['[aria-label="Close generation controls"]'],
    requiredText: ['Generation'],
  },
  {
    name: 'recipes',
    hash: '#recipes',
    expectedRoute: 'recipes-list',
    closeQueue: true,
    requiredSelectors: [],
  },
  {
    name: 'styles',
    hash: '#recipe-styles',
    expectedRoute: 'recipe-styles',
    closeQueue: true,
    requiresComposer: true,
    requiredSelectors: ['[data-style-browser-root]'],
  },
  {
    name: 'spritesheet',
    hash: '#recipe-spritesheet',
    expectedRoute: 'recipe-spritesheet',
    closeQueue: true,
    requiresComposer: true,
    requiredSelectors: [],
  },
  {
    name: 'character-lab',
    hash: '#recipe-character-lab',
    expectedRoute: 'recipe-character-lab',
    closeQueue: true,
    requiresComposer: true,
    requiredSelectors: [],
  },
  {
    name: 'timeline',
    hash: '#recipe-timeline',
    expectedRoute: 'recipe-timeline',
    closeQueue: true,
    requiresComposer: true,
    requiredSelectors: [],
  },
  {
    name: 'queue-open',
    hash: '#studio',
    expectedRoute: 'studio',
    openQueue: true,
    requiresComposer: true,
    requiredSelectors: ['[title="Close jobs"]'],
    requiredText: ['Persistent Jobs'],
  },
  {
    name: 'settings',
    hash: '#studio',
    closeQueue: true,
    openByLabel: 'Open Studio Settings',
    requiredSelectors: [],
    requiredText: ['Studio Settings'],
  },
  {
    name: 'chat',
    hash: '#studio',
    closeQueue: true,
    openByLabel: 'Open Codex chat',
    requiredSelectors: ['[aria-labelledby="studio-chat-panel-title"]'],
    requiredText: ['Codex Chat'],
  },
];

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
    '  bun run ui:responsive -- [--url=http://localhost:3000] [--output=output/playwright/responsive-mobile] [--timeout=30000] [--headed] [--verify] [--json]',
    '',
    'Checks mobile/tablet/desktop shell, recipe routes, queue, settings, and chat for horizontal overflow and blocked primary controls.',
  ].join('\n');
}

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, '');
}

function toFriendlyBrowserError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/Executable doesn't exist|Please run the following command/i.test(message)) {
    return `${message}\n[ui:responsive] Chromium for Playwright is missing. Run bunx playwright install chromium and try again.`;
  }
  if (/ERR_CONNECTION_REFUSED|net::ERR_CONNECTION_REFUSED|ECONNREFUSED/i.test(message)) {
    return `${message}\n[ui:responsive] UI is not reachable. Start it first, for example bun run dev:ui, or pass --url=<reachable URL>.`;
  }
  return message;
}

async function clickIfPresent(page: Page, selector: string) {
  return clickFirstVisible(page.locator(selector), 2_000);
}

async function isVisible(locator: Locator, timeout = 1_000) {
  await locator.waitFor({ state: 'visible', timeout });
  return true;
}

async function clickFirstVisible(locator: Locator, timeoutMs: number) {
  const count = await locator.count();
  for (let index = 0; index < count; index += 1) {
    const candidate = locator.nth(index);
    if (await isVisible(candidate).catch(() => false)) {
      await candidate.click({ timeout: timeoutMs });
      return true;
    }
  }
  return false;
}

async function clickByLabelOrMobileCommand(page: Page, label: string, timeoutMs: number) {
  const direct = page.locator(`[aria-label=${JSON.stringify(label)}]:visible`);
  if (await clickFirstVisible(direct, timeoutMs)) {
    return;
  }

  const mobileCommands = page.locator('[aria-label="Open mobile commands"]:visible');
  if (await clickFirstVisible(mobileCommands, timeoutMs)) {
    const openedTarget = page.locator(`[aria-label=${JSON.stringify(label)}]:visible`);
    await openedTarget.first().waitFor({ state: 'visible', timeout: timeoutMs });
    await openedTarget.first().click({ timeout: timeoutMs });
    return;
  }

  throw new Error(`Could not find a visible command labeled ${JSON.stringify(label)}.`);
}

async function exerciseSettingsExecutionDefaults(page: Page, timeoutMs: number) {
  const provider = page.getByLabel('Default provider', { exact: true });
  const model = page.getByLabel('Provider default model', { exact: true });
  const reasoning = page.getByLabel('Provider default reasoning effort', { exact: true });
  const serviceTier = page.getByLabel('Provider default service tier', { exact: true });
  await model.waitFor({ state: 'visible', timeout: timeoutMs });

  const initialProvider = await provider.inputValue();
  const initialModel = await model.inputValue();
  const initialReasoning = await reasoning.inputValue();
  const initialServiceTier = await serviceTier.inputValue();

  await model.fill('browser-verification-model');
  await reasoning.fill('medium');
  await serviceTier.selectOption('fast');

  const alternateValue = (
    await provider
      .locator('option')
      .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value))
  ).find((value) => value !== initialProvider);
  if (alternateValue) {
    await provider.selectOption(alternateValue);
    await provider.selectOption(initialProvider);
  }

  const retained =
    (await model.inputValue()) === 'browser-verification-model' &&
    (await reasoning.inputValue()) === 'medium' &&
    (await serviceTier.inputValue()) === 'fast';
  if (!retained) {
    throw new Error('Provider execution defaults were not retained across provider selection.');
  }

  await model.fill(initialModel);
  await reasoning.fill(initialReasoning);
  await serviceTier.selectOption(initialServiceTier);
  return true;
}

async function prepareScenario(page: Page, scenario: ResponsiveScenario, timeoutMs: number) {
  await page.waitForLoadState('domcontentloaded', { timeout: timeoutMs });
  await page.waitForTimeout(1_500);

  if (scenario.closeQueue) {
    await clickIfPresent(page, '[title="Close jobs"]');
    await page.waitForTimeout(150);
  }

  if (scenario.openQueue) {
    if (!(await isVisible(page.locator('[title="Close jobs"]:visible')).catch(() => false))) {
      const opened = await clickIfPresent(page, '[aria-label^="Open persistent jobs"]');
      if (!opened) throw new Error('Could not find a visible persistent jobs command.');
    }
    await page.waitForTimeout(700);
  }

  if (scenario.openByLabel) {
    await clickByLabelOrMobileCommand(page, scenario.openByLabel, timeoutMs);
    await page.waitForTimeout(1_500);
  }

  for (const selector of scenario.requiredSelectors) {
    await page
      .locator(`${selector}:visible`)
      .first()
      .waitFor({ timeout: timeoutMs })
      .catch(() => {});
  }

  for (const text of scenario.requiredText ?? []) {
    await page
      .getByText(text, { exact: false })
      .filter({ visible: true })
      .first()
      .waitFor({ timeout: timeoutMs })
      .catch(() => {});
  }

  return scenario.name === 'settings' ? exerciseSettingsExecutionDefaults(page, timeoutMs) : false;
}

async function observeScenario(
  page: Page,
  scenario: ResponsiveScenario,
  viewport: ResponsiveViewport,
  screenshot: string,
  settingsExecutionDefaultsVerified: boolean,
) {
  const state = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const activeRoute =
      document.querySelector('[data-active-route]')?.getAttribute('data-active-route') ??
      document.querySelector('[data-route-key]')?.getAttribute('data-route-key') ??
      null;
    const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);

    return {
      activeRoute,
      scrollWidth,
      innerWidth: window.innerWidth,
      hasHorizontalOverflow: scrollWidth > window.innerWidth + 2,
    };
  });
  const promptVisible = await page
    .locator('[aria-label="Prompt input"]')
    .first()
    .isVisible()
    .catch(() => false);
  const generateVisible = await page
    .getByRole('button', { name: /generate/i })
    .first()
    .isVisible()
    .catch(() => false);

  const violations: string[] = [];
  if (scenario.expectedRoute && state.activeRoute !== scenario.expectedRoute) {
    violations.push(`expected route ${scenario.expectedRoute}, got ${state.activeRoute ?? 'none'}`);
  }
  if (state.hasHorizontalOverflow) {
    violations.push(
      `horizontal overflow: scrollWidth=${state.scrollWidth} viewport=${state.innerWidth}`,
    );
  }

  for (const selector of scenario.requiredSelectors) {
    if ((await page.locator(`${selector}:visible`).count()) === 0) {
      violations.push(`missing selector: ${selector}`);
    }
  }

  for (const text of scenario.requiredText ?? []) {
    if ((await page.getByText(text, { exact: false }).filter({ visible: true }).count()) === 0) {
      violations.push(`missing text: ${text}`);
    }
  }

  if (scenario.requiresComposer && !promptVisible) {
    violations.push('prompt input not visible');
  }
  if (scenario.requiresComposer && !generateVisible) {
    violations.push('generate button not visible');
  }

  return {
    scenario: scenario.name,
    viewport: viewport.name,
    hash: scenario.hash,
    screenshot,
    ...state,
    promptVisible,
    generateVisible,
    ...(scenario.name === 'settings' ? { settingsExecutionDefaultsVerified } : {}),
    violations,
  } satisfies ResponsiveObservation;
}

async function runResponsiveGate({
  url,
  outputDir,
  timeoutMs,
  headed,
}: {
  url: string;
  outputDir: string;
  timeoutMs: number;
  headed: boolean;
}) {
  const browser: Browser = await chromium.launch({ headless: !headed });
  const baseUrl = normalizeBaseUrl(url);
  const observations: ResponsiveObservation[] = [];

  try {
    for (const viewport of VIEWPORTS) {
      for (const scenario of SCENARIOS) {
        if (scenario.maxWidth && viewport.width > scenario.maxWidth) continue;

        const page = await browser.newPage({
          viewport: { width: viewport.width, height: viewport.height },
          deviceScaleFactor: 1,
          isMobile: viewport.isMobile,
        });
        await page.addInitScript(() => {
          localStorage.setItem('studio-onboarding-complete', 'true');
        });
        await page.goto(`${baseUrl}/${scenario.hash}`, {
          waitUntil: 'domcontentloaded',
          timeout: timeoutMs,
        });
        const settingsExecutionDefaultsVerified = await prepareScenario(page, scenario, timeoutMs);
        const screenshot = `${outputDir}/${viewport.name}-${scenario.name}.png`;
        await page.screenshot({ path: screenshot, fullPage: false });
        observations.push(
          await observeScenario(
            page,
            scenario,
            viewport,
            screenshot,
            settingsExecutionDefaultsVerified,
          ),
        );
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  return observations;
}

if (import.meta.main) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(usage());
  } else {
    const verify = process.argv.includes('--verify');
    const asJson = process.argv.includes('--json');
    const outputDir = argValue('output') ?? DEFAULT_OUTPUT_DIR;
    mkdirSync(outputDir, { recursive: true });

    try {
      const observations = await runResponsiveGate({
        url: argValue('url') ?? DEFAULT_URL,
        outputDir,
        timeoutMs: numberArgValue('timeout') ?? DEFAULT_TIMEOUT_MS,
        headed: process.argv.includes('--headed'),
      });
      const violations = observations.flatMap((observation) =>
        observation.violations.map(
          (violation) => `${observation.viewport}/${observation.scenario}: ${violation}`,
        ),
      );

      if (asJson) {
        console.log(JSON.stringify({ observations, violations }, null, 2));
      } else {
        console.log(
          `[ui:responsive] screenshots=${outputDir} scenarios=${observations.length} violations=${violations.length}`,
        );
        for (const observation of observations) {
          console.log(
            `[ui:responsive] ${observation.viewport}/${observation.scenario} route=${observation.activeRoute} overflow=${observation.hasHorizontalOverflow ? 'yes' : 'no'} prompt=${observation.promptVisible ? 'yes' : 'no'} generate=${observation.generateVisible ? 'yes' : 'no'} violations=${observation.violations.length}`,
          );
        }
      }

      if (violations.length > 0) {
        for (const violation of violations) console.error(`- ${violation}`);
        if (verify) process.exitCode = 1;
      } else if (verify && !asJson) {
        console.log('[ui:responsive] ok');
      }
    } catch (error) {
      console.error(`[ui:responsive] ${toFriendlyBrowserError(error)}`);
      console.error(usage());
      process.exitCode = 1;
    }
  }
}
