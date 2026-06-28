import type { StylePresetCatalogSearchFilters } from '../components/recipes/stylePresetManifests';
import { projectStyleSearchResultsFromManifestCatalog } from '../components/recipes/styleSearchProjection';
import { loadStyleManifestGraph } from './style-manifest-files';

function argValue(name: string) {
  return process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1];
}

function numberArgValue(name: string) {
  const value = argValue(name);
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

const filters: StylePresetCatalogSearchFilters = {
  query: argValue('query') ?? argValue('q'),
  packId: argValue('pack'),
  categoryId: argValue('category-id'),
  categoryName: argValue('category'),
  domain: argValue('domain'),
  tag: argValue('tag'),
  task: argValue('task'),
  limit: numberArgValue('limit') ?? 20,
};
const asJson = process.argv.includes('--json');

const { catalog } = await loadStyleManifestGraph();
const results = projectStyleSearchResultsFromManifestCatalog({ catalog, filters });

if (asJson) {
  console.log(JSON.stringify({ count: results.length, results }, null, 2));
} else {
  console.log(`[styles:catalog] results=${results.length}`);
  for (const result of results) {
    const domain = result.domain ? ` domain=${result.domain}` : '';
    console.log(
      `- ${result.id} | ${result.name} | ${result.packId} / ${result.categoryId}${domain} | ${result.ref}`,
    );
  }
}
