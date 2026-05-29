const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const yaml = require('js-yaml');

const root = process.cwd();
const oldIds = ['core_anime', 'slice_of_life_school_music', 'samurai_medieval'];
const newIds = ['core-anime', 'slice-of-life-school-music', 'samurai-and-medieval'];

function loadYaml(p) { return yaml.load(fs.readFileSync(p, 'utf8')); }
function yamlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml')).map(f => path.join(dir, f));
}

const modifiedFiles = execSync('git diff --name-only', { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);

const pack12 = loadYaml(path.join(root, 'packs', 'pack_12.yaml')) || {};
let pack12TaxonomyPackNameMatches = 0;
for (const f of yamlFiles(path.join(root, 'presets', 'pack_12'))) {
  const d = loadYaml(f);
  if (d && d.taxonomy && d.taxonomy.packName === 'Video Game Originals Vault') pack12TaxonomyPackNameMatches++;
}

const pack13 = loadYaml(path.join(root, 'packs', 'pack_13.yaml')) || {};
const pack13CategoryIds = Array.isArray(pack13.categories) ? pack13.categories.map(c => c && c.id).filter(Boolean) : [];
const pack13OldInCategories = pack13CategoryIds.filter(id => oldIds.includes(id)).length;
const pack13NewInCategories = pack13CategoryIds.filter(id => newIds.includes(id)).length;

let pack13TaxonomyCategoryUpdated = 0;
let pack13TaxonomyCategoryOldRemaining = 0;
let pack13OldTagsRemaining = 0;
let pack13NewTagsOccurrences = 0;

for (const f of yamlFiles(path.join(root, 'presets', 'pack_13'))) {
  const d = loadYaml(f) || {};
  if (d.taxonomy && typeof d.taxonomy.categoryId === 'string') {
    if (newIds.includes(d.taxonomy.categoryId)) pack13TaxonomyCategoryUpdated++;
    if (oldIds.includes(d.taxonomy.categoryId)) pack13TaxonomyCategoryOldRemaining++;
  }
  const tagArrays = [];
  if (Array.isArray(d.tags)) tagArrays.push(d.tags);
  if (d.taxonomy && Array.isArray(d.taxonomy.tags)) tagArrays.push(d.taxonomy.tags);
  for (const arr of tagArrays) {
    for (const t of arr) {
      if (oldIds.includes(t)) pack13OldTagsRemaining++;
      if (newIds.includes(t)) pack13NewTagsOccurrences++;
    }
  }
}

console.log('===MODIFIED_FILES_COUNT=== ' + modifiedFiles.length);
console.log('===MODIFIED_FILES===');
for (const f of modifiedFiles) console.log(f);
console.log('===CHANGE_SUMMARY===');
console.log(JSON.stringify({
  pack12NameIsTarget: pack12.name === 'Video Game Originals Vault',
  pack12PresetTaxonomyPackNameMatches: pack12TaxonomyPackNameMatches,
  pack13PackCategoryIdsNewInCategories: pack13NewInCategories,
  pack13PackCategoryIdsOldRemainingInCategories: pack13OldInCategories,
  pack13PresetTaxonomyCategoryIdUpdated: pack13TaxonomyCategoryUpdated,
  pack13PresetTaxonomyCategoryIdOldRemaining: pack13TaxonomyCategoryOldRemaining,
  pack13OldIdsRemainingInTags: pack13OldTagsRemaining,
  pack13NewIdsOccurrencesInTags: pack13NewTagsOccurrences
}));
