const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const root = process.cwd();
const mapping = {
  core_anime: 'core-anime',
  slice_of_life_school_music: 'slice-of-life-school-music',
  samurai_medieval: 'samurai-and-medieval'
};

const summary = {
  filesModified: 0,
  changes: {
    pack12Name: 0,
    pack12PresetTaxonomyPackName: 0,
    pack13CategoryIds: 0,
    pack13PresetTaxonomyCategoryId: 0,
    pack13TagsReplaced: 0
  }
};

const modifiedFiles = [];

function loadYaml(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  return yaml.load(text);
}

function dumpYaml(obj) {
  return yaml.dump(obj, { sortKeys: false, lineWidth: -1, noRefs: true });
}

function saveYaml(filePath, obj) {
  fs.writeFileSync(filePath, dumpYaml(obj), 'utf8');
}

function markModified(filePath) {
  if (!modifiedFiles.includes(filePath)) {
    modifiedFiles.push(filePath);
    summary.filesModified += 1;
  }
}

function isYamlFile(name) {
  return name.endsWith('.yaml') || name.endsWith('.yml');
}

// 1) pack_12
const pack12Path = path.join(root, 'packs', 'pack_12.yaml');
{
  const doc = loadYaml(pack12Path) || {};
  let changed = false;
  if (doc.name !== 'Video Game Originals Vault') {
    doc.name = 'Video Game Originals Vault';
    summary.changes.pack12Name += 1;
    changed = true;
  }
  if (changed) {
    saveYaml(pack12Path, doc);
    markModified(pack12Path);
  }
}

const presets12Dir = path.join(root, 'presets', 'pack_12');
if (fs.existsSync(presets12Dir)) {
  for (const file of fs.readdirSync(presets12Dir)) {
    if (!isYamlFile(file)) continue;
    const fullPath = path.join(presets12Dir, file);
    const doc = loadYaml(fullPath);
    if (!doc || typeof doc !== 'object') continue;
    let changed = false;
    if (doc.taxonomy && typeof doc.taxonomy === 'object') {
      if (doc.taxonomy.packName !== 'Video Game Originals Vault') {
        doc.taxonomy.packName = 'Video Game Originals Vault';
        summary.changes.pack12PresetTaxonomyPackName += 1;
        changed = true;
      }
    }
    if (changed) {
      saveYaml(fullPath, doc);
      markModified(fullPath);
    }
  }
}

// 2) pack_13
const pack13Path = path.join(root, 'packs', 'pack_13.yaml');
{
  const doc = loadYaml(pack13Path);
  let changed = false;
  if (doc && Array.isArray(doc.categories)) {
    for (const cat of doc.categories) {
      if (cat && typeof cat === 'object' && typeof cat.id === 'string' && mapping[cat.id]) {
        cat.id = mapping[cat.id];
        summary.changes.pack13CategoryIds += 1;
        changed = true;
      }
    }
  }
  if (changed) {
    saveYaml(pack13Path, doc);
    markModified(pack13Path);
  }
}

function replaceMappedTags(arr) {
  if (!Array.isArray(arr)) return { changed: false, count: 0 };
  let changed = false;
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    const val = arr[i];
    if (typeof val === 'string' && mapping[val]) {
      arr[i] = mapping[val];
      changed = true;
      count += 1;
    }
  }
  return { changed, count };
}

const presets13Dir = path.join(root, 'presets', 'pack_13');
if (fs.existsSync(presets13Dir)) {
  for (const file of fs.readdirSync(presets13Dir)) {
    if (!isYamlFile(file)) continue;
    const fullPath = path.join(presets13Dir, file);
    const doc = loadYaml(fullPath);
    if (!doc || typeof doc !== 'object') continue;

    let changed = false;

    if (doc.taxonomy && typeof doc.taxonomy === 'object' && typeof doc.taxonomy.categoryId === 'string' && mapping[doc.taxonomy.categoryId]) {
      doc.taxonomy.categoryId = mapping[doc.taxonomy.categoryId];
      summary.changes.pack13PresetTaxonomyCategoryId += 1;
      changed = true;
    }

    const topTags = replaceMappedTags(doc.tags);
    if (topTags.changed) {
      summary.changes.pack13TagsReplaced += topTags.count;
      changed = true;
    }

    if (doc.taxonomy && typeof doc.taxonomy === 'object') {
      const taxTags = replaceMappedTags(doc.taxonomy.tags);
      if (taxTags.changed) {
        summary.changes.pack13TagsReplaced += taxTags.count;
        changed = true;
      }
    }

    if (changed) {
      saveYaml(fullPath, doc);
      markModified(fullPath);
    }
  }
}

console.log('===MODIFIED_FILES_COUNT===', summary.filesModified);
console.log('===MODIFIED_FILES===');
for (const f of modifiedFiles) console.log(path.relative(root, f));
console.log('===CHANGE_SUMMARY===');
console.log(JSON.stringify(summary.changes));
