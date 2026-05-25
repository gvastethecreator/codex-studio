import { loadStyleManifestGraph } from './style-manifest-files';
import { createStylePresetCatalogCoverage } from '../components/recipes/stylePresetManifests';

function argValue(name: string) {
  return process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1];
}

const packFilter = argValue('pack');
const presetFilter = argValue('preset');
const strictTaxonomy = process.argv.includes('--strict-taxonomy');
const showCoverage = process.argv.includes('--coverage');

const { graph, catalog } = await loadStyleManifestGraph();

const selectedEntries = catalog.presets.filter((entry) => {
  if (packFilter && entry.taxonomy.packId !== packFilter) return false;
  if (presetFilter && entry.manifest.id !== presetFilter) return false;
  return true;
});

if (presetFilter && selectedEntries.length === 0) {
  console.error(`[styles:validate] Missing Style Preset Manifest: ${presetFilter}`);
  process.exitCode = 1;
} else if (packFilter && selectedEntries.length === 0) {
  console.error(`[styles:validate] Pack has no Style Preset Manifests: ${packFilter}`);
  process.exitCode = 1;
}

const missingTaxonomy = selectedEntries.filter((entry) => !entry.manifest.taxonomy);
const missingDefaultImage = selectedEntries.filter((entry) => !entry.taxonomy.hasDefaultImage);

console.log(
  `[styles:validate] packs=${catalog.packs.length} presets=${catalog.presets.length} selected=${selectedEntries.length}`,
);

if (showCoverage) {
  for (const pack of createStylePresetCatalogCoverage(catalog)) {
    console.log(
      `[styles:coverage] ${pack.packId} presets=${pack.totalPresets} categories=${pack.categories} taxonomy=${pack.persistedTaxonomy}/${pack.totalPresets} missingTaxonomy=${pack.missingTaxonomy} defaultImages=${pack.withDefaultImage}/${pack.totalPresets} missingDefaultImages=${pack.missingDefaultImage}`,
    );
  }
}

if (graph.errors.length > 0) {
  console.error(`[styles:validate] graph errors=${graph.errors.length}`);
  for (const error of graph.errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
}

if (missingTaxonomy.length > 0) {
  const sample = missingTaxonomy
    .slice(0, 8)
    .map((entry) => entry.manifest.id)
    .join(', ');
  const message = `[styles:validate] manifests missing persisted taxonomy=${missingTaxonomy.length}${sample ? ` sample=${sample}` : ''}`;
  if (strictTaxonomy) {
    console.error(message);
    process.exitCode = 1;
  } else {
    console.log(message);
  }
}

if (missingDefaultImage.length > 0) {
  const sample = missingDefaultImage
    .slice(0, 8)
    .map((entry) => entry.manifest.id)
    .join(', ');
  console.log(
    `[styles:validate] manifests without default image=${missingDefaultImage.length}${sample ? ` sample=${sample}` : ''}`,
  );
}

if (!process.exitCode) {
  console.log('[styles:validate] ok');
}
