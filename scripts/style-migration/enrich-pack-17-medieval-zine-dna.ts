import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import * as yaml from 'js-yaml';

import type { StylePresetManifest } from '../../components/recipes/styles/manifestTypes';

const packId = 'pack_17';
const presetDir = path.join(
  process.cwd(),
  'components',
  'recipes',
  'styles',
  'manifests',
  'presets',
  packId,
);

interface CategoryMedievalZineLanguage {
  moodLogic: string;
  featureBias: string;
  defaultAvoid: string[];
}

const categoryLanguage: Record<string, CategoryMedievalZineLanguage> = {
  'dark-fantasy-realms': {
    moodLogic:
      'ruined majesty, moral dread, sacred pressure, weathered myth, and restrained grimdark wonder without gore shortcuts',
    featureBias:
      'silhouette ruin logic, devotional light, corroded heraldry, weathered stone, mythic scale, and disciplined darkness',
    defaultAvoid: ['generic fantasy splash art', 'quest-party lock', 'gore-only darkness'],
  },
  'hunter-gothic-and-plague-courts': {
    moodLogic:
      'nocturnal aristocracy, clinical dread, hunter ritual, plague-court elegance, and suspicious candlelit ceremony',
    featureBias:
      'moonlit gothic contour, plague-mask restraint, surgical relic glass, courtly shadow, fog density, and morbid ornament',
    defaultAvoid: ['vampire portrait default', 'plague doctor prop lock', 'candle-room dependency'],
  },
  'acid-dungeon-zine': {
    moodLogic:
      'abrasive underground humor, occult craft, lurid dungeon play, copier damage, and punk handmade danger',
    featureBias:
      'acid spot color, photocopy toner, risograph misregistration, blacklight ink, zine margins, and textless dungeon iconography',
    defaultAvoid: ['readable zine typography', 'generic dungeon corridor', 'muddy photocopy noise'],
  },
  'futuristic-medieval-and-rune-tech': {
    moodLogic:
      'sacred futurism, oath-bound technology, analog prophecy, relic machinery, and luminous feudal strangeness',
    featureBias:
      'rune glow, glassy armor planes, cathedral geometry, analog bloom, starforge color, and ancient-future material tension',
    defaultAvoid: ['generic cyberpunk city', 'chrome overload', 'readable rune text'],
  },
  'apocalyptic-wargame-and-inked-dungeon': {
    moodLogic:
      'martial doom, penitential strategy, miniature-table grandeur, inked pressure, and siege-haunted ritual discipline',
    featureBias:
      'warfront scale, reliquary metal, stress ink, sepulcher engraving, mud cathedral mass, and occult battle order',
    defaultAvoid: ['army lineup lock', 'tabletop product photo', 'generic battle splash'],
  },
  'monochrome-tarot-and-bestiary-plates': {
    moodLogic:
      'fatalistic omen calm, scholastic weirdness, bestiary curiosity, devotional monochrome, and archaic symbolic restraint',
    featureBias:
      'tarot symmetry, bestiary plate balance, ink line discipline, parchment gaps, heraldic beast logic, and label-free icon order',
    defaultAvoid: ['readable tarot labels', 'fake manuscript text', 'dirty photocopy overload'],
  },
  'weird-medieval-editorial': {
    moodLogic:
      'adult editorial tension, devotional sensuality, medicinal unease, feudal decadence, and symbolic medieval weirdness',
    featureBias:
      'vellum texture, rotten gold, moth or bone ornament, salt light, apothecary restraint, ledger geometry, and courtly menace',
    defaultAvoid: ['generic royal portrait', 'romance novel cover', 'prompt-literal medieval card'],
  },
};

function argValue(name: string) {
  return process.argv
    .find((arg) => arg.startsWith(`--${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/([a-z])-([a-z])/g, '$1 $2')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordCount(value: string) {
  const normalized = normalizeText(value);
  return normalized ? normalized.split(/\s+/).length : 0;
}

function sentence(value: string) {
  return value.endsWith('.') ? value : `${value}.`;
}

function visualValue(manifest: StylePresetManifest, key: string) {
  const value = manifest.visualDna[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : '';
}

function categoryId(manifest: StylePresetManifest) {
  const taxonomyCategoryId = manifest.taxonomy?.categoryId;
  if (typeof taxonomyCategoryId === 'string' && taxonomyCategoryId in categoryLanguage) {
    return taxonomyCategoryId;
  }

  const normalized = manifest.category
    .replace(/^\d+\.\s*/, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized in categoryLanguage ? normalized : 'weird-medieval-editorial';
}

function routerSafe(value: string) {
  return value
    .replace(/\bstyle-card\b/gi, 'style sample')
    .replace(/\bthumbnail\b/gi, 'sample image')
    .replace(/\bscreenshot\b/gi, 'source-frame look')
    .replace(/\bforeground\b/gi, 'near-plane')
    .replace(/\bbackground\b/gi, 'distant-plane')
    .replace(/([a-z])-([a-z])/gi, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitParts(value: string) {
  return value
    .replace(/\.$/, '')
    .split(/,\s*|;\s*/)
    .map((part) => shortFeature(part.trim()))
    .filter((part) => part.length > 3 && !/^no\b/i.test(part))
    .slice(0, 12);
}

function shortFeature(value: string) {
  const clean = routerSafe(value)
    .replace(/^translate any subject into\s+/i, '')
    .replace(/^transform any prompt subject through\s+/i, '')
    .replace(/^apply .+? through\s+/i, '')
    .replace(/\bwhile preserving\b.*$/i, '')
    .replace(/\bwithout\b.*$/i, '')
    .replace(/\bthat adapts\b.*$/i, '')
    .replace(/\bto any subject\b.*$/i, '')
    .replace(/^and\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  const words = clean.split(/\s+/).filter(Boolean);
  return words.length > 14 ? words.slice(0, 14).join(' ') : clean;
}

function compactFeatureParts(parts: string[]) {
  const output: string[] = [];
  const seen = new Set<string>();

  for (const part of parts.flatMap(splitParts)) {
    const key = normalizeText(part);
    if (!key || seen.has(key)) continue;
    if (
      [...seen].some(
        (existing) => existing.includes(key) || (key.length > 8 && key.includes(existing)),
      )
    ) {
      continue;
    }

    seen.add(key);
    output.push(part);
  }

  return output.slice(0, 6);
}

function buildKeyFeatures(manifest: StylePresetManifest, language: CategoryMedievalZineLanguage) {
  const featureParts = compactFeatureParts([
    manifest.name,
    visualValue(manifest, 'aesthetic'),
    visualValue(manifest, 'subject_treatment'),
    visualValue(manifest, 'color_and_tone'),
    visualValue(manifest, 'lighting_and_shadow'),
    visualValue(manifest, 'texture_and_material'),
    visualValue(manifest, 'camera_and_composition'),
    language.featureBias,
  ]);

  if (featureParts.length >= 4 && wordCount(featureParts.join(' ')) >= 8) {
    return featureParts.join('; ');
  }

  return compactFeatureParts([manifest.name, language.featureBias]).join('; ');
}

function baseMood(manifest: StylePresetManifest) {
  const existing = routerSafe(visualValue(manifest, 'atmosphere_and_mood').replace(/\.$/, ''));
  const withoutGeneratedTail = existing
    .replace(/^Carry the prompt through\s+/i, '')
    .replace(/^Carry\s+/i, '')
    .replace(/\s+through\s+.*$/i, '')
    .replace(/;?\s*the tone should follow prompt X.*$/i, '')
    .trim();
  const seed = withoutGeneratedTail.split(';')[0]?.trim() ?? '';

  return seed || manifest.name;
}

function buildMood(manifest: StylePresetManifest, language: CategoryMedievalZineLanguage) {
  return sentence(
    `Carry the prompt through ${baseMood(manifest)}; ${language.moodLogic}; the tone should follow prompt X while preserving the preset's medieval-zine identity`,
  );
}

function baseCreativeBrief(manifest: StylePresetManifest) {
  const existing = routerSafe(visualValue(manifest, 'creative_brief').replace(/\.$/, ''))
    .replace(/\s+Apply after prompt X:.*$/i, '')
    .replace(/\.+$/, '')
    .trim();

  return wordCount(existing) >= 8
    ? existing
    : `${manifest.name} supplies a transferable medieval fantasy and dungeon-zine style layer`;
}

function buildCreativeBrief(manifest: StylePresetManifest, keyFeatures: string) {
  const base = baseCreativeBrief(manifest);

  return sentence(
    `${base}. Apply after prompt X: prompt X supplies subject, action, setting, tone, and intensity, while this preset supplies a style grammar of ${keyFeatures}, mood, material behavior, framing logic, and denoised medieval-zine finish without requiring a fixed cast, fixed relic, fixed monster, readable text, or sample-card composition`,
  );
}

function uniqueRules(rules: string[]) {
  const normalized = new Set<string>();
  const output: string[] = [];

  for (const rule of rules) {
    const clean = routerSafe(rule.trim());
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (normalized.has(key)) continue;
    normalized.add(key);
    output.push(clean);
  }

  return output;
}

function splitNegativePrompt(value: unknown) {
  if (typeof value !== 'string') return [];

  return value
    .split(/,\s*/)
    .map((part) => routerSafe(part.trim()))
    .filter(Boolean);
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const force = process.argv.includes('--force');
  const presetFilter = argValue('preset');
  const fileNames = (await readdir(presetDir))
    .filter((fileName) => fileName.endsWith('.yaml'))
    .sort((first, second) => first.localeCompare(second));
  let changed = 0;

  for (const fileName of fileNames) {
    const filePath = path.join(presetDir, fileName);
    const manifest = yaml.load(await readFile(filePath, 'utf8')) as StylePresetManifest;
    if (presetFilter && manifest.id !== presetFilter) continue;

    const language = categoryLanguage[categoryId(manifest)];
    const keyFeatures = buildKeyFeatures(manifest, language);
    const nextMood = buildMood(manifest, language);
    const nextBrief = buildCreativeBrief(manifest, keyFeatures);
    if (
      !force &&
      visualValue(manifest, 'key_features') === keyFeatures &&
      visualValue(manifest, 'atmosphere_and_mood') === nextMood &&
      visualValue(manifest, 'creative_brief') === nextBrief
    ) {
      continue;
    }

    manifest.visualDna = {
      ...manifest.visualDna,
      key_features: keyFeatures,
      atmosphere_and_mood: nextMood,
      creative_brief: nextBrief,
    };
    manifest.avoidRules = uniqueRules([
      ...(manifest.avoidRules ?? []),
      ...language.defaultAvoid,
      'prompt-literal card reuse',
      'fixed medieval scene',
      'readable manuscript text',
      'watermark',
      'text',
    ]);
    manifest.attributes = {
      ...manifest.attributes,
      negativePrompt: uniqueRules([
        ...splitNegativePrompt(manifest.attributes?.negativePrompt),
        ...manifest.avoidRules,
        'generic fantasy card art',
        'muddy noisy dark texture',
      ]).join(', '),
    };

    changed += 1;

    if (dryRun) {
      console.log(`[pack17:dna] would update ${manifest.id} ${manifest.name}`);
      continue;
    }

    await writeFile(
      filePath,
      yaml.dump(manifest, {
        lineWidth: 100,
        noRefs: true,
        sortKeys: false,
      }),
      'utf8',
    );
  }

  console.log(`[pack17:dna] ${dryRun ? 'dry-run' : 'updated'} presets=${changed}`);
}

await main();
