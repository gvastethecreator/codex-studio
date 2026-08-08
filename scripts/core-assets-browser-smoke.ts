import { chromium } from 'playwright';

const baseUrl = process.argv
  .find((argument) => argument.startsWith('--url='))
  ?.slice('--url='.length);

if (!baseUrl) throw new Error('Missing --url for core asset browser smoke');

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
  { name: 'Studio', hash: '#studio', selector: '[data-route-view="studio"]' },
  { name: 'Recipes', hash: '#recipes', selector: '[data-route-view="recipes"]' },
  {
    name: 'Styles',
    hash: '#recipe-styles',
    selector: '[data-route-key="recipe-styles"] [data-style-browser-root]',
  },
  {
    name: 'Character Lab',
    hash: '#recipe-character-lab',
    selector: '[data-route-key="recipe-character-lab"] [data-character-lab-generate-button]',
  },
];
const observations: Array<{ name: string; brokenImages: string[] }> = [];

try {
  await page.goto(`${baseUrl}/#studio`, { waitUntil: 'domcontentloaded' });
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
} finally {
  await browser.close();
}
