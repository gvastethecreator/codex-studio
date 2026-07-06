import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import * as yaml from 'js-yaml';

import type { StylePresetManifest } from '../../components/recipes/styles/manifestTypes';

const packId = 'pack_09';
const presetDir = path.join(
  process.cwd(),
  'components',
  'recipes',
  'styles',
  'manifests',
  'presets',
  packId,
);

interface CategoryTextureLanguage {
  origin: string;
  surfaceSystem: string;
  moodSource: string;
  aestheticVerb: string;
  subjectVerb: string;
}

const categoryLanguage: Record<string, CategoryTextureLanguage> = {
  'natural-materials': {
    origin: 'natural formation, growth, erosion, and geological or biological irregularity',
    surfaceSystem:
      'organic variation, non-repeating edge wear, local pores, growth marks, and natural scale shifts',
    moodSource: 'age, weather, habitat pressure, and sensory association',
    aestheticVerb: 'translates natural material behavior into form',
    subjectVerb: 'grow, erode, polish, fracture, or soften',
  },
  'man-made-materials': {
    origin:
      'manufacturing process, tooling marks, seams, tolerances, and industrial material behavior',
    surfaceSystem:
      'constructed regularity, stress points, joins, molded edges, and process-specific finish',
    moodSource: 'use, fabrication, utility, and cultural material association',
    aestheticVerb: 'treats fabrication as visible style language',
    subjectVerb: 'carry manufactured seams, tolerances, pressure marks, and finish logic',
  },
  'weathering-and-decay': {
    origin: 'damage history, contamination, corrosion, staining, abrasion, and material breakdown',
    surfaceSystem:
      'layer loss, residue buildup, chipped edges, stains, cracks, and uneven surface failure',
    moodSource: 'neglect, time, moisture, heat, friction, and environmental pressure',
    aestheticVerb: 'turns material failure into the main visual language',
    subjectVerb: 'age, stain, corrode, abrade, swell, chip, or collapse',
  },
  'tactile-surfaces': {
    origin: 'touch, softness, pile, fiber density, nap direction, compression, and hand-feel',
    surfaceSystem:
      'fiber structure, tactile depth, soft occlusion, fuzz, pile direction, and pressure marks',
    moodSource: 'physical touch, comfort, irritation, warmth, dryness, and surface softness',
    aestheticVerb: 'makes hand-feel and pressure visible across the image',
    subjectVerb: 'compress, fuzz, soften, catch fibers, and show tactile pressure',
  },
  'elemental-and-fx': {
    origin:
      'motion, temperature, particles, translucency, refraction, glow, and transient energy behavior',
    surfaceSystem:
      'flow direction, particle density, turbulence, glow falloff, splashes, trails, and vapor edges',
    moodSource: 'movement, danger, spectacle, instability, temperature, and sensory intensity',
    aestheticVerb: 'behaves like a controlled elemental effect layer',
    subjectVerb: 'emit, flow, spark, vaporize, splash, glow, or scatter',
  },
};

function argValue(name: string) {
  return process.argv
    .find((arg) => arg.startsWith(`--${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');
}

function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function visualValue(manifest: StylePresetManifest, key: string) {
  const value = manifest.visualDna[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : '';
}

function extractBetween(value: string, start: RegExp, end: RegExp) {
  const startMatch = value.match(start);
  if (startMatch?.index === undefined) return '';
  const afterStart = value.slice(startMatch.index + startMatch[0].length);
  const endMatch = afterStart.match(end);
  return (endMatch ? afterStart.slice(0, endMatch.index) : afterStart).trim();
}

function cleanCue(value: string) {
  const compact = value.replace(/\s+/g, ' ').trim();
  const spatialCueMatch = compact.match(
    /^Compose for .+? using its key spatial cues:\s*(.+?)\.?$/i,
  );
  const cue = spatialCueMatch ? spatialCueMatch[1] : compact;
  return cue.replace(/\.$/, '').trim();
}

function isAlreadyEnriched(manifest: StylePresetManifest) {
  const aesthetic = visualValue(manifest, 'aesthetic');
  return (
    aesthetic.includes('material-router language built from') ||
    aesthetic.includes('portable surface behavior rather than a literal material sample')
  );
}

function cueValues(manifest: StylePresetManifest) {
  const keyFeatures = visualValue(manifest, 'key_features');
  const featureParts = keyFeatures.split(';').map(cleanCue).filter(Boolean);
  const enriched = isAlreadyEnriched(manifest) && featureParts.length >= 5;

  return {
    aesthetic: enriched
      ? featureParts[0]
      : cleanCue(visualValue(manifest, 'aesthetic')) || manifest.name,
    subject: enriched
      ? featureParts[1]
      : cleanCue(visualValue(manifest, 'subject_treatment')) || manifest.name,
    color: enriched
      ? cleanCue(
          extractBetween(
            visualValue(manifest, 'color_and_tone'),
            /^Use\s+/i,
            /\sas the material palette/i,
          ),
        )
      : cleanCue(visualValue(manifest, 'color_and_tone')) || manifest.name,
    light: enriched
      ? featureParts[3]
      : cleanCue(visualValue(manifest, 'lighting_and_shadow')) || manifest.name,
    texture: enriched
      ? featureParts[2]
      : cleanCue(visualValue(manifest, 'texture_and_material')) || manifest.name,
    composition: enriched
      ? featureParts[4]
      : cleanCue(visualValue(manifest, 'camera_and_composition')) || manifest.name,
    mood: enriched
      ? cleanCue(
          extractBetween(
            visualValue(manifest, 'atmosphere_and_mood'),
            /^Keep the mood\s+/i,
            /\sby using/i,
          ),
        )
      : cleanCue(visualValue(manifest, 'atmosphere_and_mood')) || manifest.name,
    finish: enriched
      ? cleanCue(
          extractBetween(
            visualValue(manifest, 'rendering_and_quality'),
            /^Finish with\s+/i,
            /\smaterial clarity/i,
          ),
        )
      : cleanCue(visualValue(manifest, 'rendering_and_quality')) || manifest.name,
    features: enriched
      ? featureParts[4]
      : cleanCue(visualValue(manifest, 'key_features')) || manifest.name,
    brief: visualValue(manifest, 'creative_brief'),
  };
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

  return normalized in categoryLanguage ? normalized : 'natural-materials';
}

function sentence(value: string) {
  return value.endsWith('.') ? value : `${value}.`;
}

function buildMaterialDna(manifest: StylePresetManifest) {
  const language = categoryLanguage[categoryId(manifest)];
  const cue = cueValues(manifest);

  return {
    aesthetic: sentence(
      `${manifest.name} ${language.aestheticVerb}: start from ${cue.aesthetic}, ${cue.texture}, and ${cue.features}, then turn ${language.origin} into portable surface behavior rather than a literal material sample`,
    ),
    subject_treatment: sentence(
      `Transform any prompt subject through ${cue.subject}: preserve identity and pose while letting forms ${language.subjectVerb} through edge profile, surface breakup, thickness, contact marks, and detail scale`,
    ),
    color_and_tone: sentence(
      `Use ${cue.color} as the material palette, with controlled value separation, local color variation, and hue shifts that follow the subject's form rather than flattening it into a pasted texture`,
    ),
    lighting_and_shadow: sentence(
      `Let ${cue.light} define the light response: highlights, occlusion, translucency, specular scatter, matte falloff, or rim behavior should reveal ${manifest.name} without hiding the prompt subject`,
    ),
    texture_and_material: sentence(
      `Render ${cue.texture} through ${language.surfaceSystem}; keep grain scale, residue, buildup, fractures, fiber, pores, or surface tension coherent across the whole image`,
    ),
    camera_and_composition: sentence(
      `Compose around ${cue.composition} as reusable material rhythm: macro-friendly for texture tasks, but able to wrap objects, figures, environments, and props without forcing one sample view`,
    ),
    atmosphere_and_mood: sentence(
      `Keep the mood ${cue.mood} by using ${language.moodSource}; the material should color the scene's feeling while preserving the user's requested subject and setting`,
    ),
    rendering_and_quality: sentence(
      `Finish with ${cue.finish} material clarity: physically coherent reflectance, clean contact detail, controlled micro-texture, readable silhouette behavior, and no noisy stock-texture overlay`,
    ),
    key_features: `${cue.aesthetic}; ${cue.subject}; ${cue.texture}; ${cue.light}; ${cue.composition}`,
    creative_brief:
      wordCount(cue.brief) >= 18
        ? cue.brief
        : sentence(
            `Apply ${manifest.name} as a transferable material layer over prompt X: preserve the user's scene and subject, then route surface behavior, palette, light response, edge wear, and tactile rhythm through this preset`,
          ),
  };
}

function uniqueRules(rules: string[]) {
  const normalized = new Set<string>();
  const output: string[] = [];

  for (const rule of rules) {
    const clean = rule.trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (normalized.has(key)) continue;
    normalized.add(key);
    output.push(clean);
  }

  return output;
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
    if (!force && isAlreadyEnriched(manifest)) continue;

    manifest.visualDna = {
      ...manifest.visualDna,
      ...buildMaterialDna(manifest),
    };
    manifest.avoidRules = uniqueRules([
      ...(manifest.avoidRules ?? []),
      'wrong material',
      'generic stock texture',
      'muddy noise',
      'watermark',
      'readable text',
    ]);
    manifest.attributes = {
      ...manifest.attributes,
      negativePrompt: manifest.avoidRules.join(', '),
    };

    changed += 1;

    if (dryRun) {
      console.log(`[pack09:dna] would update ${manifest.id} ${manifest.name}`);
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

  console.log(`[pack09:dna] ${dryRun ? 'dry-run' : 'updated'} presets=${changed}`);
}

await main();
