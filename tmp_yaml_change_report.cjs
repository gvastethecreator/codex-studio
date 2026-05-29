const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const root = process.cwd();
const base = path.join(root, 'components', 'recipes', 'styles', 'manifests');
const packsDir = path.join(base, 'packs');
const presetsDir = path.join(base, 'presets');

const map = {
  core_anime: 'core-anime',
  slice_of_life_school_music: 'slice-of-life-school-music',
  samurai_medieval: 'samurai-and-medieval'
};

const modified = new Set();
let pack12PresetTaxonomyUpdated = 0;
let pack13PresetTaxonomyCategoryUpdated = 0;
let tagsUpdated = 0;

const loadYaml = (p) => yaml.load(fs.readFileSync(p, 'utf8'));
const dumpYaml = (obj) => yaml.dump(obj, { sortKeys: false, lineWidth: -1, noRefs: true });
const saveIfChanged = (file, beforeObj, afterObj) => {
  const before = dumpYaml(beforeObj);
  const after = dumpYaml(afterObj);
  if (before !== after) {
    fs.writeFileSync(file, after, 'utf8');
    modified.add(path.relative(root, file));
    return true;
  }
  return false;
};
const yamlFiles = (dir) => fs.existsSync(dir)
  ? fs.readdirSync(dir).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml')).map((f) => path.join(dir, f))
  : [];

// pack_12: name
const pack12Path = path.join(packsDir, 'pack_12.yaml');
{
  const before = loadYaml(pack12Path) || {};
  const after = JSON.parse(JSON.stringify(before));
  after.name = 'Video Game Originals Vault';
  saveIfChanged(pack12Path, before, after);
}

// pack_12 presets: taxonomy.packName
for (const file of yamlFiles(path.join(presetsDir, 'pack_12'))) {
  const before = loadYaml(file) || {};
  const after = JSON.parse(JSON.stringify(before));
  if (after.taxonomy && typeof after.taxonomy === 'object') {
    if (after.taxonomy.packName !== 'Video Game Originals Vault') {
      after.taxonomy.packName = 'Video Game Originals Vault';
      pack12PresetTaxonomyUpdated += 1;
    }
  }
  saveIfChanged(file, before, after);
}

// pack_13: categories ids
const pack13Path = path.join(packsDir, 'pack_13.yaml');
{
  const before = loadYaml(pack13Path) || {};
  const after = JSON.parse(JSON.stringify(before));
  if (Array.isArray(after.categories)) {
    for (const cat of after.categories) {
      if (cat && typeof cat.id === 'string' && map[cat.id]) {
        cat.id = map[cat.id];
      }
    }
  }
  saveIfChanged(pack13Path, before, after);
}

const replaceInArr = (arr) => {
  if (!Array.isArray(arr)) return 0;
  let c = 0;
  for (let i = 0; i < arr.length; i += 1) {
    const v = arr[i];
    if (typeof v === 'string' && map[v]) {
      arr[i] = map[v];
      c += 1;
    }
  }
  return c;
};

// pack_13 presets: taxonomy.categoryId + tags
for (const file of yamlFiles(path.join(presetsDir, 'pack_13'))) {
  const before = loadYaml(file) || {};
  const after = JSON.parse(JSON.stringify(before));

  if (after.taxonomy && typeof after.taxonomy === 'object' && typeof after.taxonomy.categoryId === 'string' && map[after.taxonomy.categoryId]) {
    after.taxonomy.categoryId = map[after.taxonomy.categoryId];
    pack13PresetTaxonomyCategoryUpdated += 1;
  }

  tagsUpdated += replaceInArr(after.tags);
  if (after.taxonomy && typeof after.taxonomy === 'object') {
    tagsUpdated += replaceInArr(after.taxonomy.tags);
  }

  saveIfChanged(file, before, after);
}

console.log(JSON.stringify({
  modifiedFiles: modified.size,
  pack12PresetTaxonomyUpdated,
  pack13PresetTaxonomyCategoryUpdated,
  tagsUpdated
}));
