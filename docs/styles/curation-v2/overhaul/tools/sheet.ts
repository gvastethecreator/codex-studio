// Contact sheet for one category: primary card plus variants per preset, labeled by ID.
// Usage: bun .local/style-curation/overhaul/tools/sheet.ts "pack_01::1. Portrait And Studio" out.jpg [--cols=6]
import { createRequire } from 'node:module';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const repo = path.resolve(import.meta.dir, '../../../../..');
const require = createRequire(path.join(repo, 'package.json'));
const sharp = require('sharp');
const yaml = require('js-yaml');

const [key, out] = process.argv.slice(2);
const cols = Number(process.argv.find((a) => a.startsWith('--cols='))?.split('=')[1] ?? 6);
const [packId, category] = key.split('::');
const pack = yaml.load(
  readFileSync(path.join(repo, `components/recipes/styles/manifests/packs/${packId}.yaml`), 'utf8'),
);
const cat = pack.categories.find((c: { name: string }) => c.name === category);
if (!cat) throw new Error(`No category ${key}`);
const ids: string[] = cat.presetRefs.map((ref: string) => path.basename(ref, '.yaml'));

const defaults = path.join(repo, 'assets/recipes/styles/defaults');
const variants = readdirSync(path.join(defaults, 'variants'));
const W = 240;
const H = 320;
const LABEL = 22;
const tiles: { file: string | null; label: string }[] = [];
for (const id of ids) {
  const primary = path.join(defaults, `${id}.webp`);
  tiles.push({ file: existsSync(primary) ? primary : null, label: id });
  for (const v of variants.filter((f) => f.startsWith(`${id}-`)).sort()) {
    tiles.push({ file: path.join(defaults, 'variants', v), label: path.basename(v, '.webp') });
  }
}
const rows = Math.ceil(tiles.length / cols);
const composites = [];
for (const [i, tile] of tiles.entries()) {
  const left = (i % cols) * W;
  const top = Math.floor(i / cols) * (H + LABEL);
  if (tile.file) {
    composites.push({
      input: await sharp(tile.file).resize(W, H, { fit: 'cover' }).png().toBuffer(),
      left,
      top: top + LABEL,
    });
  }
  const svg = `<svg width="${W}" height="${LABEL}"><rect width="100%" height="100%" fill="#111"/><text x="6" y="16" font-family="Arial" font-size="14" fill="#fff">${tile.label}${tile.file ? '' : ' (missing)'}</text></svg>`;
  composites.push({ input: Buffer.from(svg), left, top });
}
await sharp({
  create: { width: cols * W, height: rows * (H + LABEL), channels: 3, background: '#333' },
})
  .composite(composites)
  .jpeg({ quality: 78 })
  .toFile(out);
process.stdout.write(`${key}: presets=${ids.length} tiles=${tiles.length} -> ${out}\n`);
