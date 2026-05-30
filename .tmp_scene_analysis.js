const fs = require('fs');
const path = require('path');
let yaml = null;
try { yaml = require('js-yaml'); } catch (e) {
  try { yaml = require('yaml'); } catch (e2) {}
}
if (!yaml) {
  console.error('No YAML parser found (js-yaml or yaml).');
  process.exit(1);
}
const root = path.resolve('components/recipes/styles/manifests/presets');
function walk(dir, out=[]) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.isFile() && /\.ya?ml$/i.test(ent.name)) out.push(p);
  }
  return out;
}
const files = walk(root);
const presets = [];
function traverse(node, ctx, file) {
  if (Array.isArray(node)) {
    node.forEach((v,i)=>traverse(v,{...ctx,index:i},file));
    return;
  }
  if (!node || typeof node !== 'object') return;
  const next = { ...ctx };
  if (typeof node.pack === 'string') next.pack = node.pack;
  if (typeof node.category === 'string') next.category = node.category;
  if (typeof node.id === 'string') next.id = node.id;
  if (typeof node.presetId === 'string') next.id = node.presetId;
  if (typeof node.slug === 'string') next.id = node.slug;
  if (typeof node.name === 'string' && !next.id) next.id = node.name;

  if (typeof node.visualDna === 'string') {
    const rel = path.relative(root, file).replace(/\\/g,'/');
    const seg = rel.split('/');
    const packFromPath = seg.length > 1 ? seg[0] : 'unknown';
    const catFromPath = seg.length > 2 ? seg[1] : 'unknown';
    presets.push({
      id: next.id || path.basename(file, path.extname(file)),
      visualDna: node.visualDna,
      pack: next.pack || packFromPath,
      category: next.category || catFromPath,
      file: rel
    });
  }
  for (const [k,v] of Object.entries(node)) {
    if (k === 'visualDna') continue;
    traverse(v, next, file);
  }
}
for (const f of files) {
  try {
    const txt = fs.readFileSync(f, 'utf8');
    const doc = yaml.load ? yaml.load(txt) : yaml.parse(txt);
    traverse(doc, {}, f);
  } catch (e) {
    // ignore parse failures
  }
}

function norm(s){return s.toLowerCase().replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim();}
function tokens(s){return norm(s).split(' ').filter(Boolean);}
const stop = new Set(['the','a','an','and','or','with','of','to','for','from','by','as','is','are','on','in','at','into','over','under','through','within','without','this','that','these','those','it','its']);
const sceneKeywords = {
  'scene':3,'city':3,'street':3,'forest':3,'room':3,'battle':4,'warrior':3,'castle':3,'sunset':3,
  'night':2,'neon':2,'village':2,'temple':2,'mountain':2,'ocean':2,'river':2,'desert':2,'sky':2,
  'alley':2,'corridor':2,'landscape':3,'interior':3,'exterior':3,'town':2,'market':2,'bridge':2,
  'park':2,'station':2,'rooftop':2,'streetlight':2,'ruins':2,'battlefield':4,'throne':2,'palace':2,
  'harbor':2,'dock':2,'cave':2,'dungeon':2,'cathedral':2,'plaza':2,'district':2
};
const phraseWeights = {
  'in a':2,'in an':2,'in the':2,'at night':4,'on a':2,'on the':2,'inside a':3,'inside the':3,
  'outside a':3,'outside the':3,'set in':3,'located in':3,'during sunset':4,'neon city':5,
  'city street':4,'forest clearing':4,'battle scene':5,'wide shot':2,'establishing shot':4,
  'in front of':3,'background':2
};

const wordCounts = new Map();
const ngramCounts = new Map();
const presetScores = [];
for (const p of presets) {
  const tks = tokens(p.visualDna);
  tks.forEach(t=>{ if(!stop.has(t) && t.length>2){ wordCounts.set(t,(wordCounts.get(t)||0)+1);} });
  for (let n=2;n<=5;n++) {
    for (let i=0;i<=tks.length-n;i++) {
      const ng = tks.slice(i,i+n).join(' ');
      if (/^\d+$/.test(ng)) continue;
      if (ng.split(' ').every(w=>stop.has(w))) continue;
      ngramCounts.set(ng,(ngramCounts.get(ng)||0)+1);
    }
  }

  const text = norm(p.visualDna);
  let score = 0;
  const reasons = [];
  const preps = (text.match(/\b(in|at|on|inside|outside|within|amid|under|over|near|beside|between)\b/g)||[]).length;
  if (preps) { const s=Math.min(6,preps); score+=s; reasons.push(`prepositions:${preps}`); }
  for (const [k,w] of Object.entries(sceneKeywords)) {
    const m = text.match(new RegExp(`\\b${k}\\b`,'g'));
    if (m) { score += m.length*w; reasons.push(`${k}x${m.length}`); }
  }
  for (const [ph,w] of Object.entries(phraseWeights)) {
    const m = text.match(new RegExp(ph.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'));
    if (m) { score += m.length*w; reasons.push(`${ph}x${m.length}`); }
  }
  presetScores.push({ ...p, score, reasons: reasons.slice(0,8) });
}

const sceneTerms = [...wordCounts.entries()]
  .filter(([w,c])=> (sceneKeywords[w] || c>=5))
  .sort((a,b)=>b[1]-a[1]).slice(0,40)
  .map(([term,count])=>({term,count}));

const topNgrams = [...ngramCounts.entries()]
  .filter(([ng,c])=>c>=3 && ng.split(' ').length>=2 && ng.split(' ').length<=5)
  .sort((a,b)=> b[1]-a[1] || b[0].split(' ').length-a[0].split(' ').length)
  .slice(0,60)
  .map(([ngram,count])=>({ngram,count,n:ngram.split(' ').length}));

const problematic = [...presetScores].sort((a,b)=>b.score-a.score).slice(0,30).map(x=>({
  id:x.id, pack:x.pack, category:x.category, score:x.score, reasons:x.reasons,
  visualDna:x.visualDna.length>170?x.visualDna.slice(0,170)+'...':x.visualDna
}));

function groupAvg(arr, key) {
  const m = new Map();
  for (const p of arr) {
    const k = p[key] || 'unknown';
    const cur = m.get(k) || {sum:0,count:0};
    cur.sum += p.score; cur.count += 1; m.set(k, cur);
  }
  return [...m.entries()].map(([k,v])=>({[key]:k,count:v.count,avgScore:+(v.sum/v.count).toFixed(2)}))
    .sort((a,b)=>b.avgScore-a.avgScore || b.count-a.count);
}
const byPack = groupAvg(presetScores,'pack');
const byCategory = groupAvg(presetScores,'category');

const examples = [...presetScores].filter(p=>p.score>=8).sort((a,b)=>b.score-a.score).slice(0,20).map(p=>({
  id:p.id, score:p.score, visualDna:p.visualDna.length>130?p.visualDna.slice(0,130)+'...':p.visualDna
}));

const result = {
  scannedYamlFiles: files.length,
  totalPresets: presets.length,
  sceneTermsTop: sceneTerms,
  repeatedNgramsTop: topNgrams,
  problematicTop30: problematic,
  scoreDistribution: { byPack, byCategory },
  sceneExamples: examples
};
console.log(JSON.stringify(result, null, 2));
