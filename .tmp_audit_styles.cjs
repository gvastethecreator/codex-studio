const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const packs = ['pack_01','pack_02','pack_03','pack_04','pack_05','pack_07','pack_09','pack_11','pack_12','pack_13','pack_14','pack_15','pack_16'];
const packDir = path.join('components','recipes','styles','manifests','packs');
const presetDir = path.join('components','recipes','styles','manifests','presets');

function readYaml(p){ return YAML.parse(fs.readFileSync(p,'utf8')); }
function walk(dir){
  let out=[];
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const full = path.join(dir,e.name);
    if(e.isDirectory()) out=out.concat(walk(full));
    else if(/\.ya?ml$/i.test(e.name)) out.push(full);
  }
  return out;
}

const packAudit=[];
let reorganizedPresetRefs = new Set();
for(const p of packs){
  const f = path.join(packDir,`${p}.yaml`);
  if(!fs.existsSync(f)) { packAudit.push({pack:p,error:'missing'}); continue; }
  const y = readYaml(f) || {};
  const categories = Array.isArray(y.categories)?y.categories:[];
  const catRows = categories.map(c=>({id:c?.id||'(no-id)',count:Array.isArray(c?.presetRefs)?c.presetRefs.length:0,zero:!Array.isArray(c?.presetRefs)||c.presetRefs.length===0}));
  const totalPresetRefs = Array.isArray(y.presetRefs)?y.presetRefs.length:0;
  packAudit.push({pack:p,totalPresetRefs,categories:catRows,zeroCategories:catRows.filter(r=>r.zero).map(r=>r.id)});
  for(const ref of (Array.isArray(y.presetRefs)?y.presetRefs:[])) reorganizedPresetRefs.add(ref);
}

const legacySlugs = ['videojuegos','videojuegos-originals-vault','mythic_noir','solarpunk_dreamscapes','core_anime','slice_of_life_school_music','samurai_medieval'];
const presetFiles = walk(presetDir);
const legacyCounts = Object.fromEntries(legacySlugs.map(s=>[s,{count:0,files:[]}]))
for(const f of presetFiles){
  const txt = fs.readFileSync(f,'utf8').toLowerCase();
  for(const s of legacySlugs){
    if(txt.includes(s)){
      legacyCounts[s].count++;
      if(legacyCounts[s].files.length<5) legacyCounts[s].files.push(f.replace(/\\/g,'/'));
    }
  }
}

function collectStrings(v, arr){
  if(v==null) return;
  if(typeof v==='string') arr.push(v);
  else if(Array.isArray(v)) v.forEach(x=>collectStrings(x,arr));
  else if(typeof v==='object') Object.values(v).forEach(x=>collectStrings(x,arr));
}
const esTokenRegex = /\b(de|la|el|los|las|y|con|para|en|del|una|un|estilo|fotografia|fotografía|cine|retrato|paisaje)\b/i;
const tildeRegex = /[áéíóúñü¿¡]/i;
let esHits = 0;
const esFiles = [];
for(const ref of reorganizedPresetRefs){
  const p = path.join(presetDir,ref);
  if(!fs.existsSync(p)) continue;
  let y;
  try{ y = readYaml(p) || {}; }catch{ continue; }
  const values = [];
  collectStrings(y.name, values);
  collectStrings(y.category, values);
  collectStrings(y.tags, values);
  collectStrings(y.taxonomy, values);
  const joined = values.join(' | ');
  if(tildeRegex.test(joined) || esTokenRegex.test(joined)){
    esHits++;
    if(esFiles.length<20) esFiles.push(ref);
  }
}

console.log('===PACK_AUDIT===');
for(const p of packAudit){
  if(p.error){ console.log(`${p.pack}: MISSING`); continue; }
  console.log(`${p.pack}: totalPresetRefs=${p.totalPresetRefs}`);
  for(const c of p.categories){
    console.log(`  - ${c.id}: ${c.count}${c.zero?' [ZERO]':''}`);
  }
}
console.log('===LEGACY_SLUGS===');
for(const s of legacySlugs){
  const v=legacyCounts[s];
  console.log(`${s}: ${v.count}`);
  if(v.files.length) console.log(`  samples: ${v.files.join(', ')}`);
}
console.log('===SPANISH_DETECTION===');
console.log(`reorganizedPresetFilesChecked=${reorganizedPresetRefs.size}`);
console.log(`filesWithSpanishSignal=${esHits}`);
if(esFiles.length) console.log(`samples: ${esFiles.join(', ')}`);
