// Apply one category spec: rewrite preset DNA, set card briefs, create new presets, register refs.
// Usage: bun .local/style-curation/overhaul/tools/apply.ts <spec.ts> [--dry]
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { creativeBriefFromDna } from './creative-brief';

const repo = path.resolve(import.meta.dir, '../../../../..');
const require = createRequire(path.join(repo, 'package.json'));
const yaml = require('js-yaml');

export interface Dna {
  aesthetic: string;
  subject_treatment: string;
  color_and_tone: string;
  lighting_and_shadow: string;
  texture_and_material: string;
  camera_and_composition: string;
  atmosphere_and_mood: string;
  rendering_and_quality: string;
  key_features: string;
}
export interface Update {
  name?: string;
  dna?: Partial<Dna>;
  avoid?: string[]; // replaces the preset-specific head of avoidRules (common tail is kept/added)
  dropAvoid?: string[]; // inherited rules that contradict the technique (e.g. "noisy" on a grain stock)
  textPolicy?: 'requested'; // see Create.textPolicy
  briefs: [string, string, string];
}
export interface Create {
  name: string;
  domain: string;
  tags: string[];
  dna: Dna;
  avoid: string[];
  // 'requested' keeps the requested words, marks and interface visible: the common text, logo and
  // UI negatives are left out. Only for design presets whose output is lettering, a mark or a UI.
  textPolicy?: 'requested';
  briefs: [string, string, string];
}
export interface Spec {
  pack: string;
  category: string;
  // Registers the category when the pack does not have it yet (no anchor preset needed).
  newCategory?: { id: string };
  updates: Record<string, Update>;
  creates?: Create[];
}

const COMMON_AVOID = [
  'watermark',
  'text',
  'readable labels',
  'logo',
  'UI overlay',
  'franchise likeness',
  'real person likeness',
  'prompt literal card reuse',
];
const dumpOpts = { lineWidth: -1, noRefs: true, sortKeys: false };
const presetsRoot = path.join(repo, 'components/recipes/styles/manifests/presets');

const REQUESTED_TEXT_RULES = new Set(['text', 'readable labels', 'logo', 'ui overlay']);

function mergeAvoid(specific: string[], existing: string[] = [], textPolicy?: 'requested') {
  const common =
    textPolicy === 'requested'
      ? COMMON_AVOID.filter((rule) => !REQUESTED_TEXT_RULES.has(rule.toLowerCase()))
      : COMMON_AVOID;
  const out: string[] = [];
  for (const rule of [...specific, ...existing, ...common]) {
    if (!out.some((r) => r.toLowerCase() === rule.toLowerCase())) out.push(rule);
  }
  return out;
}

function allPresetIds() {
  const ids = new Set<string>();
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.yaml')) ids.add(path.basename(entry.name, '.yaml'));
    }
  };
  walk(path.join(repo, 'components/recipes/styles/manifests'));
  return ids;
}

const specPath = path.resolve(process.argv[2]);
const dry = process.argv.includes('--dry');
const spec: Spec = (await import(specPath)).default;
const packFile = path.join(repo, `components/recipes/styles/manifests/packs/${spec.pack}.yaml`);
const packText = readFileSync(packFile, 'utf8');
const packDoc = yaml.load(packText);
const cat = (packDoc.categories ?? []).find((c: { name: string }) => c.name === spec.category);
if (!cat && !spec.newCategory) throw new Error(`No category ${spec.pack}::${spec.category}`);
if (cat && spec.newCategory)
  throw new Error(`${spec.pack}::${spec.category} exists; drop newCategory`);
const refs: string[] = cat?.presetRefs ?? [];
const briefsFile = path.join(repo, 'scripts/style-curation/card-briefs.json');
const variantsFile = path.join(repo, 'scripts/style-curation/card-brief-variants.json');
const briefs = JSON.parse(readFileSync(briefsFile, 'utf8'));
const variantBriefs = JSON.parse(readFileSync(variantsFile, 'utf8'));
const report: string[] = [];

for (const [id, update] of Object.entries(spec.updates)) {
  const ref = refs.find((r) => path.basename(r, '.yaml') === id);
  if (!ref) throw new Error(`${id} is not in ${spec.category}`);
  const file = path.join(presetsRoot, ref);
  const doc = yaml.load(readFileSync(file, 'utf8'));
  if (update.name) {
    doc.name = update.name;
    doc.displayName = update.name;
    doc.styleAnchors = [update.name, ...(doc.styleAnchors ?? []).slice(1)];
  }
  if (update.dna) {
    doc.visualDna = { ...doc.visualDna, ...update.dna };
    doc.visualDna.creative_brief = creativeBriefFromDna(doc.visualDna);
    doc.version = Number(doc.version ?? 1) + 1;
  }
  if (update.avoid || update.dropAvoid) {
    const drop = new Set((update.dropAvoid ?? []).map((rule) => rule.toLowerCase()));
    const kept = (doc.avoidRules ?? []).filter((rule: string) => !drop.has(rule.toLowerCase()));
    doc.avoidRules = mergeAvoid(update.avoid ?? [], kept, update.textPolicy).filter(
      (rule) => !drop.has(rule.toLowerCase()),
    );
    doc.attributes = {
      ...doc.attributes,
      negativePrompt: `${doc.avoidRules.join(', ')}, noisy compression artifacts`,
    };
  }
  briefs[id] = update.briefs[0];
  variantBriefs[id] = [update.briefs[1], update.briefs[2]];
  // Briefs-only updates leave the manifest untouched, so its formatting does not churn.
  const manifestChanged = Boolean(update.name || update.dna || update.avoid || update.dropAvoid);
  if (!dry && manifestChanged) writeFileSync(file, yaml.dump(doc, dumpOpts));
  report.push(`updated ${id}${update.dna ? ` v${doc.version}` : ''}`);
}

if (spec.creates?.length) {
  const taken = allPresetIds();
  const prefix = refs[0] ? path.basename(refs[0], '.yaml').slice(0, 5) : `SP${spec.pack.slice(5)}-`;
  let n = Math.max(
    0,
    ...[...taken].filter((id) => id.startsWith(prefix)).map((id) => Number(id.slice(5))),
  );
  // A new category has no anchor preset: its taxonomy comes from the pack and the spec.
  const first = refs[0]
    ? yaml.load(readFileSync(path.join(presetsRoot, refs[0]), 'utf8'))
    : {
        tags: ['curation-v2'],
        supportedTasks: ['image_generate', 'image_edit', 'style_preset_card'],
        taxonomy: {
          packId: spec.pack,
          packName: packDoc.name,
          categoryId: spec.newCategory!.id,
          categoryName: spec.category,
        },
      };
  const newRefs: string[] = [];
  const existingNames = new Set(
    refs.map((ref) => yaml.load(readFileSync(path.join(presetsRoot, ref), 'utf8')).name),
  );
  for (const create of spec.creates) {
    if (existingNames.has(create.name))
      throw new Error(`${create.name} already exists in ${spec.category}; spec already applied?`);
    n += 1;
    const id = `${prefix}${String(n).padStart(3, '0')}`;
    if (taken.has(id)) throw new Error(`ID taken ${id}`);
    const tags = [
      first.tags[0],
      first.taxonomy.categoryId,
      ...create.tags,
      ...(create.textPolicy === 'requested' ? ['requested-text'] : []),
    ];
    const avoidRules = mergeAvoid(create.avoid, [], create.textPolicy);
    const doc = {
      schemaVersion: 1,
      id,
      packId: spec.pack,
      name: create.name,
      styleAnchors: [create.name, create.domain, create.dna.key_features.split(';')[0].trim()],
      displayName: create.name,
      category: spec.category,
      domain: create.domain,
      version: 1,
      supportedTasks: first.supportedTasks,
      tags,
      visualDna: {
        ...create.dna,
        creative_brief: creativeBriefFromDna(create.dna),
      },
      avoidRules,
      assets: {},
      attributes: {
        negativePrompt: `${avoidRules.join(', ')}, noisy compression artifacts`,
        previewStatus: 'pending',
        ui: { previewStatus: 'pending' },
      },
      taxonomy: {
        ...first.taxonomy,
        domain: create.domain,
        tags,
        supportedTasks: first.supportedTasks,
        hasDefaultImage: false,
      },
    };
    // Keep visualDna key order identical to existing manifests.
    const { key_features, ...rest } = doc.visualDna;
    doc.visualDna = { ...rest, key_features } as typeof doc.visualDna;
    const ref = `${spec.pack}/${id}.yaml`;
    const file = path.join(presetsRoot, ref);
    if (existsSync(file)) throw new Error(`exists ${file}`);
    briefs[id] = create.briefs[0];
    variantBriefs[id] = [create.briefs[1], create.briefs[2]];
    if (!dry) {
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, yaml.dump(doc, dumpOpts));
    }
    newRefs.push(ref);
    report.push(`created ${id} ${create.name}`);
  }
  let text = packText;
  if (!refs.length) {
    // New category: append its block to `categories:` and its refs to the end of the flat
    // `presetRefs:` list, which must be the last key of the pack file.
    text = text
      .replace(/^categories: \[\]$/m, 'categories:')
      .replace(/^presetRefs: \[\]$/m, 'presetRefs:');
    const flatAt = text.search(/^presetRefs:$/m);
    if (flatAt < 0 || /^\S/m.test(text.slice(flatAt + 'presetRefs:'.length)))
      throw new Error(`${spec.pack}: presetRefs must be the last key`);
    const block =
      `  - id: ${spec.newCategory!.id}\n    name: ${spec.category}\n    presetRefs:\n` +
      newRefs.map((r) => `      - ${r}\n`).join('');
    text = text.slice(0, flatAt) + block + text.slice(flatAt);
    text = `${text.replace(/\n*$/, '\n')}${newRefs.map((r) => `  - ${r}\n`).join('')}`;
  } else {
    // Insert after the category's last ref in both the category list and the flat list.
    const anchor = refs[refs.length - 1];
    const catLine = `      - ${anchor}\n`;
    const flatLine = `\n  - ${anchor}\n`;
    if (text.split(catLine).length !== 2) throw new Error(`category anchor ${anchor}`);
    text = text.replace(catLine, catLine + newRefs.map((r) => `      - ${r}\n`).join(''));
    const at = text.indexOf(flatLine);
    if (at < 0 || text.lastIndexOf(flatLine) !== at) throw new Error(`flat anchor ${anchor}`);
    const end = at + flatLine.length;
    text = text.slice(0, end) + newRefs.map((r) => `  - ${r}\n`).join('') + text.slice(end);
  }
  if (!dry) writeFileSync(packFile, text);
}

if (!dry) {
  writeFileSync(briefsFile, `${JSON.stringify(briefs, null, 2)}\n`);
  writeFileSync(variantsFile, `${JSON.stringify(variantBriefs, null, 2)}\n`);
}
process.stdout.write(
  `${report.join('\n')}\n${dry ? '[dry] ' : ''}${spec.pack}::${spec.category} total=${refs.length + (spec.creates?.length ?? 0)}\n`,
);
