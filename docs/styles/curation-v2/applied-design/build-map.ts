// Rebuild integration-map.json: where each R-* research card went.
// Usage: bun docs/styles/curation-v2/applied-design/build-map.ts
// Imported presets carry their research id as a tag (r-log-01). Cards that are not presets are listed
// in NOT_PRESETS. Cards without either are reported as pending.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import * as yaml from 'js-yaml';

const repo = process.cwd();
const here = path.join(repo, 'docs/styles/curation-v2/applied-design');
const NOT_PRESETS: Record<string, { status: 'qa-protocol' | 'replaced'; note: string }> = {
  'R-ICO-19': { status: 'qa-protocol', note: 'Small-size optical repair is a verification pass.' },
  'R-HUD-20': {
    status: 'qa-protocol',
    note: 'Telemetry consistency trial is a verification pass.',
  },
  'R-PRD-19': {
    status: 'qa-protocol',
    note: 'Three-view consistency; pack_04 Three-View Recognition Chart covers the sheet.',
  },
  'R-MCK-19': { status: 'qa-protocol', note: 'Surface refraction check is a verification pass.' },
  'R-TYP-19': { status: 'qa-protocol', note: 'Exact-copy lettering proof is a verification pass.' },
  'R-DAT-19': { status: 'qa-protocol', note: 'Data-locked styling pass is a verification pass.' },
  'R-DAT-20': {
    status: 'qa-protocol',
    note: 'Explanation consistency audit is a verification pass.',
  },
  'R-ENV-19': { status: 'qa-protocol', note: 'Route walkthrough audit is a verification pass.' },
  'R-MOT-20': {
    status: 'qa-protocol',
    note: 'Reduced-motion companion is an accessibility check.',
  },
  'R-MCK-03': {
    status: 'replaced',
    note: 'Overlaps pack_01 Seamless Packshot / E-Commerce White Sweep.',
  },
  'R-MCK-09': { status: 'replaced', note: 'Overlaps pack_01 Lifestyle In-Hand Product.' },
  'R-MCK-14': { status: 'replaced', note: 'Overlaps pack_01 Ghost Mannequin Apparel.' },
  'R-DAT-13': { status: 'replaced', note: 'Overlaps pack_10 Transit Map Diagram.' },
};
const CODES = [
  'LOG',
  'ICO',
  'APP',
  'UI',
  'HUD',
  'PRD',
  'PKG',
  'MCK',
  'ADV',
  'TYP',
  'EDT',
  'DAT',
  'PAT',
  'MER',
  'ENV',
  'MOT',
];

const imported = new Map<string, { preset: string; name: string; category: string }>();
const presetsRoot = path.join(repo, 'components/recipes/styles/manifests/presets');
for (const pack of readdirSync(presetsRoot))
  for (const f of readdirSync(path.join(presetsRoot, pack))) {
    const d: any = yaml.load(readFileSync(path.join(presetsRoot, pack, f), 'utf8'));
    const src = (d.tags ?? []).find((t: string) => /^r-[a-z]+-\d+$/.test(t));
    if (src) imported.set(src.toUpperCase(), { preset: d.id, name: d.name, category: d.category });
  }
const cards: Record<string, unknown> = {};
let pending = 0;
for (const code of CODES)
  for (let n = 1; n <= 20; n++) {
    const id = `R-${code}-${String(n).padStart(2, '0')}`;
    const hit = imported.get(id);
    if (hit) cards[id] = { status: 'preset', ...hit };
    else if (NOT_PRESETS[id])
      cards[id] = {
        ...NOT_PRESETS[id],
        doc: NOT_PRESETS[id].status === 'qa-protocol' ? 'QA-PROTOCOLS.md' : 'AUDIT.md',
      };
    else {
      cards[id] = { status: 'pending' };
      pending++;
    }
  }
const out = {
  schema: 'applied-design-integration-map',
  source: 'Codex_Studio_Fichas_Completas_2026-09-25',
  pack: 'pack_25',
  cards,
};
writeFileSync(path.join(here, 'integration-map.json'), `${JSON.stringify(out, null, 2)}\n`);
console.log(
  `[map] presets=${imported.size} not-presets=${Object.keys(NOT_PRESETS).length} pending=${pending}`,
);
