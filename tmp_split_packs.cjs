const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const root = process.cwd();
const packsDir = path.join(root, 'components', 'recipes', 'styles', 'manifests', 'packs');
const presetsDir = path.join(root, 'components', 'recipes', 'styles', 'manifests', 'presets');

const packPaths = {
  pack_05: path.join(packsDir, 'pack_05.yaml'),
  pack_13: path.join(packsDir, 'pack_13.yaml'),
  pack_16: path.join(packsDir, 'pack_16.yaml')
};

const packMeta = {
  pack_05: {
    id: 'pack_05',
    name: 'Anime Battle & Worlds',
    description: 'High-energy anime styles focused on battles, power systems, mecha worlds, isekai adventures, and dark seinen action.',
    slug: 'anime-battle-and-worlds'
  },
  pack_16: {
    id: 'pack_16',
    name: 'Anime Classics & Prestige',
    description: 'Timeless anime craft across classics, sports drama, auteur studio works, retro eras, samurai epics, and horror prestige.',
    slug: 'anime-classics-and-prestige'
  },
  pack_13: {
    id: 'pack_13',
    name: 'Anime Character & Lifestyle',
    description: 'Character-first anime styles spanning shojo, magical themes, slice-of-life moods, and expressive everyday storytelling.',
    slug: 'anime-character-and-lifestyle'
  }
};

const groupDefs = {
  pack_05: [
    { source: 'pack_05', categoryId: 'modern-shonen-and-action' },
    { source: 'pack_05', categoryId: 'mecha-and-cyberpunk' },
    { source: 'pack_05', categoryId: 'isekai-and-high-fantasy' },
    { source: 'pack_05', categoryId: 'dark-fantasy-and-seinen' },
    { source: 'pack_13', categoryId: 'action' }
  ],
  pack_16: [
    { source: 'pack_05', categoryId: '2000s-classics' },
    { source: 'pack_05', categoryId: '90s-golden-era' },
    { source: 'pack_05', categoryId: 'sports-competition-and-performance' },
    { source: 'pack_05', categoryId: 'studio-masterpieces' },
    { source: 'pack_05', categoryId: '70s-and-80s-retro-anime' },
    { source: 'pack_13', categoryId: 'samurai-and-medieval' },
    { source: 'pack_13', categoryId: 'horror' }
  ],
  pack_13: [
    { source: 'pack_05', categoryId: 'shojo-magical-girl-and-visionary-classics' },
    { source: 'pack_05', categoryId: 'slice-of-life-and-moe' },
    { source: 'pack_05', categoryId: 'anime-style-spectrum' },
    { source: 'pack_13', categoryId: 'core-anime' },
    { source: 'pack_13', categoryId: 'slice-of-life-school-music' }
  ]
};

const oldPackSlugs = new Set(['anime-and-manga-spectrum', 'anime-expansion-vault']);

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, 'utf8'));
}

function writeYaml(filePath, obj) {
  const text = yaml.dump(obj, { sortKeys: false, lineWidth: -1, noRefs: true });
  fs.writeFileSync(filePath, text, 'utf8');
}

function updateTagList(tags, newSlug) {
  const list = Array.isArray(tags) ? tags.filter((t) => !oldPackSlugs.has(t)) : [];
  const dedup = [];
  const seen = new Set();
  dedup.push(newSlug);
  seen.add(newSlug);
  for (const t of list) {
    if (!seen.has(t)) {
      dedup.push(t);
      seen.add(t);
    }
  }
  return dedup;
}

const manifests = {
  pack_05: readYaml(packPaths.pack_05),
  pack_13: readYaml(packPaths.pack_13)
};

const categoryMap = {
  pack_05: new Map((manifests.pack_05.categories || []).map((c) => [c.id, c])),
  pack_13: new Map((manifests.pack_13.categories || []).map((c) => [c.id, c]))
};

const presetAssignments = new Map();
const newCategoriesByPack = { pack_05: [], pack_16: [], pack_13: [] };
const destinationCounts = { pack_05: 0, pack_16: 0, pack_13: 0 };
const movedByDestination = { pack_05: 0, pack_16: 0, pack_13: 0 };

for (const [destPack, defs] of Object.entries(groupDefs)) {
  for (const def of defs) {
    const cat = categoryMap[def.source].get(def.categoryId);
    if (!cat) {
      throw new Error(`Category not found: ${def.source}/${def.categoryId}`);
    }
    const refs = Array.isArray(cat.presetRefs) ? cat.presetRefs : [];
    const migratedRefs = [];
    for (const srcRef of refs) {
      const base = path.posix.basename(srcRef);
      const srcPackFromRef = srcRef.split('/')[0];
      const newRef = `${destPack}/${base}`;
      migratedRefs.push(newRef);
      if (!presetAssignments.has(srcRef)) {
        presetAssignments.set(srcRef, { destPack, srcPackFromRef, newRef });
        destinationCounts[destPack] += 1;
        if (srcPackFromRef !== destPack) {
          movedByDestination[destPack] += 1;
        }
      }
    }
    newCategoriesByPack[destPack].push({ ...cat, presetRefs: migratedRefs });
  }
}

let updatedPresets = 0;
for (const [srcRef, info] of presetAssignments.entries()) {
  const presetPath = path.join(presetsDir, ...srcRef.split('/'));
  if (!fs.existsSync(presetPath)) {
    throw new Error(`Preset file not found: ${srcRef} -> ${presetPath}`);
  }
  const doc = readYaml(presetPath);
  const meta = packMeta[info.destPack];
  doc.packId = info.destPack;
  doc.tags = updateTagList(doc.tags, meta.slug);

  if (!doc.taxonomy || typeof doc.taxonomy !== 'object') {
    doc.taxonomy = {};
  }
  doc.taxonomy.packId = info.destPack;
  doc.taxonomy.packName = meta.name;
  doc.taxonomy.tags = updateTagList(doc.taxonomy.tags, meta.slug);

  writeYaml(presetPath, doc);
  updatedPresets += 1;
}

function buildManifest(baseManifest, packId, categories) {
  const meta = packMeta[packId];
  const presetRefs = categories.flatMap((c) => c.presetRefs || []);
  const result = { ...baseManifest };
  result.id = packId;
  result.name = meta.name;
  result.description = meta.description;
  result.categories = categories;
  result.presetRefs = presetRefs;
  return result;
}

const newPack05 = buildManifest(manifests.pack_05, 'pack_05', newCategoriesByPack.pack_05);
const newPack13 = buildManifest(manifests.pack_13, 'pack_13', newCategoriesByPack.pack_13);
const newPack16Base = { ...(manifests.pack_13 || {}), schemaVersion: 1 };
const newPack16 = buildManifest(newPack16Base, 'pack_16', newCategoriesByPack.pack_16);

writeYaml(packPaths.pack_05, newPack05);
writeYaml(packPaths.pack_13, newPack13);
writeYaml(packPaths.pack_16, newPack16);

const report = {
  movedByDestination,
  destinationPresetTotals: destinationCounts,
  updatedPresets,
  totalAssignments: presetAssignments.size
};

console.log('SPLIT_REPORT=' + JSON.stringify(report));
