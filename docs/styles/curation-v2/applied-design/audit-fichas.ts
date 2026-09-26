// Audit of the external applied-design package (Codex_Studio_Fichas_Completas_2026-09-25).
// Usage: bun docs/styles/curation-v2/applied-design/audit-fichas.ts [--json out.json]
// Needs the untracked package folder at the repo root; it is not committed (33 MB, Spanish source).
import { readdirSync, readFileSync, existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import * as yaml from 'js-yaml';

const repo = process.cwd();
const pkg = path.join(repo, 'Codex_Studio_Fichas_Completas_2026-09-25');
const cat = JSON.parse(readFileSync(path.join(pkg, 'catalog.json'), 'utf8'));
const cards: any[] = cat.cards.map((c: any) => ({
  ...c,
  visualDna: c.visualDna ?? {
    ...c.construction,
    creative_brief: c.creativeBrief,
    key_features: (c.keyFeatures ?? []).join('; '),
  },
}));
const FIELDS = [
  'aesthetic',
  'subject_treatment',
  'color_and_tone',
  'lighting_and_shadow',
  'texture_and_material',
  'camera_and_composition',
  'atmosphere_and_mood',
  'rendering_and_quality',
];
const MIN: Record<string, number> = { aesthetic: 10, subject_treatment: 12 };
const issues: Record<string, string[]> = {};
const add = (k: string, m: string) => (issues[k] ??= []).push(m);
const words = (t: string) =>
  String(t ?? '')
    .split(/\s+/)
    .filter(Boolean).length;
const norm = (t: string) =>
  String(t)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3);
const jac = (a: string, b: string) => {
  const A = new Set(norm(a));
  const B = new Set(norm(b));
  const i = [...A].filter((x) => B.has(x)).length;
  return i / Math.max(1, A.size + B.size - i);
};

// 1. Structure
const ids = new Set(cards.map((c) => c.id));
if (ids.size !== cards.length) add('structure', `duplicate ids: ${cards.length - ids.size}`);
const byCol: Record<string, any[]> = {};
for (const c of cards) (byCol[c.collectionCode] ??= []).push(c);
for (const [k, v] of Object.entries(byCol))
  if (v.length !== 20) add('structure', `${k} has ${v.length}`);
const kinds: Record<string, number> = {};
for (const c of cards) kinds[c.kind] = (kinds[c.kind] ?? 0) + 1;
for (const c of cards) {
  for (const f of FIELDS) if (!c.visualDna?.[f]) add('structure', `${c.id} missing ${f}`);
  if ((c.cardBriefs ?? []).length !== 3) add('structure', `${c.id} briefs=${c.cardBriefs?.length}`);
  for (const b of c.cardBriefs ?? []) {
    const f = path.join(pkg, 'prompts', c.collectionCode, `${c.id}__${b.slot}.txt`);
    if (!existsSync(f)) add('structure', `${c.id} missing prompt file ${b.slot}`);
    else if (readFileSync(f, 'utf8').trim() !== String(b.prompt).trim())
      add('structure', `${c.id} ${b.slot} prompt file differs from catalog`);
  }
  for (const ext of ['md', 'yaml'])
    if (!existsSync(path.join(pkg, 'cards', c.collectionCode, `${c.id}.${ext}`)))
      add('structure', `${c.id} missing card .${ext}`);
}

// 2. Language: Spanish source text needs English authoring for the catalog
const ES = /\b(que|para|sin|una|con|del|los|las|debe|cada|entre|sobre)\b/i;
const esCount = cards.filter((c) =>
  ES.test(c.visualDna.aesthetic + ' ' + c.cardBriefs[0].brief),
).length;
if (esCount)
  add(
    'language',
    `${esCount}/${cards.length} cards have Spanish DNA/briefs; catalog manifests are English`,
  );

// 3. Name collisions with the live catalog
const presetsRoot = path.join(repo, 'components/recipes/styles/manifests/presets');
// Presets imported from this package carry their research id as a tag (e.g. r-log-01).
const live: { id: string; name: string; file: string; source?: string }[] = [];
for (const pack of readdirSync(presetsRoot))
  for (const f of readdirSync(path.join(presetsRoot, pack))) {
    const d: any = yaml.load(readFileSync(path.join(presetsRoot, pack, f), 'utf8'));
    const source = (d.tags ?? []).find((t: string) => /^r-[a-z]+-\d+$/.test(t));
    live.push({ id: d.id, name: String(d.name), file: `${pack}/${f}`, source });
  }
const imported = new Map(live.filter((l) => l.source).map((l) => [l.source!.toUpperCase(), l.id]));
const foreign = live.filter((l) => !l.source);
const liveNames = new Map(foreign.map((l) => [l.name.toLowerCase(), l]));
const seen = new Map<string, string>();
for (const c of cards) {
  const n = c.name.toLowerCase();
  if (liveNames.has(n)) add('name-collision', `${c.id} "${c.name}" = ${liveNames.get(n)!.id}`);
  if (seen.has(n))
    add('name-collision', `${c.id} "${c.name}" duplicates ${seen.get(n)} inside package`);
  seen.set(n, c.id);
  for (const l of foreign) {
    const s = jac(c.name, l.name);
    if (s >= 0.6 && l.name.toLowerCase() !== n)
      add('name-near', `${c.id} "${c.name}" ~ ${l.id} "${l.name}" (${s.toFixed(2)})`);
  }
}

// 4. DNA quality
const fieldValues: Record<string, Map<string, string[]>> = {};
for (const c of cards) {
  for (const f of FIELDS) {
    const v = String(c.visualDna[f]);
    const min = MIN[f] ?? 8;
    if (words(v) < min) add('dna-short', `${c.id} ${f} ${words(v)} words (min ${min})`);
    const m = (fieldValues[f] ??= new Map());
    m.set(v, [...(m.get(v) ?? []), c.id]);
    if (/\b(sin|no|ningun[ao]?|nunca|evitar)\b/i.test(v) && f !== 'subject_treatment')
      add('dna-negation', `${c.id} ${f}: negation inside a positive field -> "${v.slice(0, 90)}"`);
  }
  const cb = String(c.visualDna.creative_brief);
  if (cb.includes(c.visualDna.aesthetic) && cb.includes(c.visualDna.subject_treatment))
    add('creative-brief-template', c.id);
  const kf = String(c.visualDna.key_features)
    .split(';')
    .map((s) => s.trim());
  const dnaAll = FIELDS.map((f) => c.visualDna[f]).join(' ');
  if (kf.every((k) => dnaAll.includes(k))) add('key-features-copied', c.id);
  if (c.visualDna.aesthetic === c.mechanism) add('aesthetic-equals-mechanism', c.id);
}
for (const f of FIELDS)
  for (const [v, list] of fieldValues[f])
    if (list.length > 1)
      add(
        'dna-shared-field',
        `${f} x${list.length} (${list.slice(0, 6).join(',')}): "${v.slice(0, 80)}"`,
      );

// 5. Briefs
const PROMPT_DUP =
  /Construcción:|Color y lectura:|Composición:|Acabado:|Comprobar antes de aceptar:|Evitar:/;
for (const c of cards) {
  const bs = c.cardBriefs.map((b: any) => String(b.brief));
  bs.forEach((b: string, i: number) => {
    if (words(b) < 20) add('brief-short', `${c.id} ${i} ${words(b)} words`);
  });
  for (let i = 0; i < 3; i++)
    for (let j = i + 1; j < 3; j++) {
      const s = jac(bs[i], bs[j]);
      if (s > 0.5) add('brief-echo', `${c.id} ${i}/${j} jaccard ${s.toFixed(2)}`);
    }
  if (c.cardBriefs.some((b: any) => PROMPT_DUP.test(b.prompt))) add('prompt-embeds-dna', c.id);
}
for (const [code, list] of Object.entries(byCol)) {
  const open: Record<string, number> = {};
  const all = list.flatMap((c) => c.cardBriefs.map((b: any) => String(b.brief)));
  for (const b of all) {
    const k = b
      .split(/\s+/)
      .slice(0, 2)
      .join(' ')
      .toLowerCase()
      .replace(/[:,.]$/, '');
    open[k] = (open[k] ?? 0) + 1;
  }
  const top = Object.entries(open)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  for (const [k, n] of top)
    if (n / all.length > 0.15)
      add('brief-formula-opening', `${code}: ${n}/${all.length} open with "${k}"`);
}

// 6. Negative-policy conflicts: requested text/logo/UI vs inherited catalog negatives
const TEXTY = new Set([
  'LOG',
  'TYP',
  'UI',
  'HUD',
  'PKG',
  'ADV',
  'EDT',
  'DAT',
  'ENV',
  'MER',
  'MCK',
  'APP',
  'ICO',
  'MOT',
]);
let exact = 0;
for (const c of cards) {
  exact += c.cardBriefs.filter((b: any) => (b.exactTextCandidates ?? []).length).length;
  if (TEXTY.has(c.collectionCode))
    for (const r of c.avoidRules ?? [])
      if (/^(text|texto|logo|ui)$/i.test(r))
        add('avoid-conflict', `${c.id} avoids "${r}" in a text/brand collection`);
}

// 7. Third-party names
// Letter-aware boundaries: a plain \b treats accented letters as breaks ("añadidas" -> "adidas").
const BRANDS =
  /(?<!\p{L})(apple|google|android|material you|ios|microsoft|nike|adidas|coca|pepsi|disney|marvel|pixar|nintendo|playstation|xbox|netflix|spotify|ikea|braun|olivetti|helvetica|futura|gotham|pantone)(?!\p{L})/iu;
for (const c of cards) {
  const t = [
    c.name,
    ...c.cardBriefs.map((b: any) => b.brief),
    ...FIELDS.map((f) => c.visualDna[f]),
  ].join(' ');
  const m = t.match(BRANDS);
  if (m) add('third-party-term', `${c.id}: "${m[0]}"`);
}

const summary = {
  cards: cards.length,
  importedToCatalog: imported.size,
  collections: Object.fromEntries(Object.entries(byCol).map(([k, v]) => [k, v.length])),
  kinds,
  briefsWithExactText: exact,
  counts: Object.fromEntries(Object.entries(issues).map(([k, v]) => [k, v.length])),
};
process.stdout.write(`${JSON.stringify(summary, null, 1)}\n`);
for (const [k, v] of Object.entries(issues)) {
  process.stdout.write(`\n## ${k} (${v.length})\n`);
  for (const m of v.slice(0, 12)) process.stdout.write(`  ${m}\n`);
}
const outIdx = process.argv.indexOf('--json');
if (outIdx > 0)
  writeFileSync(process.argv[outIdx + 1], JSON.stringify({ summary, issues }, null, 1));
