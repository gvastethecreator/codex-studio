import { readFile, readdir, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

import * as yaml from 'js-yaml';

import type { StylePresetManifest } from '../../components/recipes/styles/manifestTypes';

const execFileAsync = promisify(execFile);
const packId = 'pack_01';
const presetDir = path.join(
  process.cwd(),
  'components',
  'recipes',
  'styles',
  'manifests',
  'presets',
  packId,
);

interface PhotoCategoryLanguage {
  frame: string;
  subjectLogic: string;
  colorLogic: string;
  lightLogic: string;
  materialLogic: string;
  compositionLogic: string;
  moodLogic: string;
  finishLogic: string;
  defaultCue: string;
  avoidRules: string[];
}

const categoryLanguage: Record<string, PhotoCategoryLanguage> = {
  'portrait-and-studio': {
    frame:
      'portrait and studio photography system built from lens discipline, subject hierarchy, controlled retouching, and believable surface detail',
    subjectLogic:
      'preserve prompt identity while using focal priority, flattering or deliberately institutional distance, surface realism, and edge control without requiring a human face',
    colorLogic:
      'grade neutrals, skinlike or material tones, backdrop color, cosmetic warmth, and controlled contrast as photographic capture decisions',
    lightLogic:
      'make key, fill, rim, catchlight, background falloff, and shadow shape visibly drive the style',
    materialLogic:
      'retain pores, fabric, hair, props, paper, backdrop sweep, and small surface imperfections at a believable photographic scale',
    compositionLogic:
      'use portrait lens compression, central authority, intimate framing distance, frontal ID geometry, or editorial negative space without forcing one sitter',
    moodLogic:
      'derive mood from proximity, pose pressure, institutional polish, intimacy, ceremony, awkwardness, or studio control',
    finishLogic:
      'finish as real photography with clean optics, plausible retouching, readable focal hierarchy, and no painterly or CGI substitution',
    defaultCue:
      'studio subject hierarchy, controlled portrait optics, believable retouching, and intentional backdrop behavior',
    avoidRules: [
      'mannequin skin',
      'over-smoothed plastic retouching',
      'distorted anatomy',
      'generic beauty filter',
    ],
  },
  'lighting-techniques': {
    frame:
      'lighting-first photographic system where the preset is defined by source placement, exposure behavior, shadow design, and light color',
    subjectLogic:
      'preserve the prompt subject while letting light carve silhouette, volume, specular response, motion, and separation',
    colorLogic:
      'treat color as a consequence of source temperature, gel choice, exposure rolloff, neon spill, flame warmth, or low-light sensor response',
    lightLogic:
      'make source direction, softness, beam width, bounce, haze, catchlight, or motion trail legible enough to be the main style cue',
    materialLogic:
      'show how surfaces react to the light through rim edges, glossy kick, matte falloff, fog particles, grain, or illuminated dust',
    compositionLogic:
      'compose to reveal the light event through silhouettes, negative space, beam paths, frontal flash flattening, or long-exposure gesture',
    moodLogic:
      'derive mood from theatrical control, nocturnal pressure, warmth, mystery, kinetic exposure, or graphic shadow tension',
    finishLogic:
      'finish with photographic exposure discipline, controlled highlights, clean shadow structure, and no random glow pasted over the image',
    defaultCue:
      'source-visible light design, intentional shadow shape, controlled exposure, and readable illumination behavior',
    avoidRules: [
      'flat lighting',
      'random glow overlay',
      'muddy darkness',
      'blown highlight wash',
      'no light source logic',
    ],
  },
  'film-and-analog-process': {
    frame:
      'analog photographic process system built from film stock response, lens imperfection, chemical artifact, grain, and exposure latitude',
    subjectLogic:
      'preserve the prompt scene while routing detail through stock softness, halation, vignetting, motion softness, or large-format clarity',
    colorLogic:
      'let palette come from emulsion bias, slide-film saturation, monochrome silver values, aged dye shift, or instant-film chemistry',
    lightLogic:
      'shape highlights and shadows through film latitude, flash falloff, long exposure, tungsten balance, or chemical rolloff',
    materialLogic:
      'render grain, dust, dye clouds, soft lens corners, wet-plate artifacts, borderless instant texture, or scan softness as process evidence',
    compositionLogic:
      'use camera format, crop, lens character, depth of field, view-camera stillness, toy-camera distortion, or accidental snapshot framing',
    moodLogic:
      'derive mood from memory, imperfection, tactile chemistry, nostalgia, scientific strangeness, or disposable-camera immediacy',
    finishLogic:
      'finish as believable analog capture with coherent grain scale, restrained artifacts, and no fake noisy filter',
    defaultCue:
      'analog stock character, emulsion color bias, real grain, and process-specific camera behavior',
    avoidRules: [
      'digital HDR overprocessing',
      'plastic noise',
      'fake film border',
      'oversharpened clarity',
      'generic vintage filter',
    ],
  },
  'documentary-and-street': {
    frame:
      'observational photographic system built from available-light capture, imperfect timing, public-space pressure, and real-world incident',
    subjectLogic:
      'preserve prompt identity while favoring candid posture, active context, environmental evidence, and unsanitized physical detail',
    colorLogic:
      'grade as street, travel, concert, war, sport, paparazzi, or field documentary capture rather than commercial color polish',
    lightLogic:
      'use available light, flash intrusion, stage beams, harsh noon, rain reflection, smoke, or practical spill as factual scene evidence',
    materialLogic:
      'keep street surfaces, sweat, dust, fabric wear, weather, grain, high ISO, and motion smear honest rather than decorative',
    compositionLogic:
      'compose with decisive moment tension, wide action proximity, telephoto intrusion, crowd-layer rhythm, horizon pressure, or unstable framing',
    moodLogic:
      'derive mood from urgency, witness, travel discovery, danger, crowd energy, decay, speed, or unrepeatable timing',
    finishLogic:
      'finish as credible documentary photography with restrained processing, readable action, and no stock-advertising gloss',
    defaultCue:
      'candid timing, available-light realism, environmental evidence, and observational photographic pressure',
    avoidRules: [
      'staged advertisement',
      'fake smiles',
      'stock-photo gloss',
      'tourist postcard polish',
      'readable captions',
    ],
  },
  'commercial-and-product': {
    frame:
      'commercial photographic system built from sellable clarity, controlled studio craft, material desirability, and brand-neutral polish',
    subjectLogic:
      'preserve prompt identity while making silhouette, surface, freshness, scale, and product-like value immediately readable',
    colorLogic:
      'use palette as campaign control: clean whites, luxury neutrals, appetite warmth, cool tech accents, automotive reflections, or interior harmony',
    lightLogic:
      'shape light with softboxes, reflectors, rim lines, HDR fill, glossy kickers, window balance, or packshot sweep shadows',
    materialLogic:
      'render metal, glass, fabric, food surface, condensation, cosmetic gel, architecture finish, and clean contact shadows with precise detail',
    compositionLogic:
      'compose for catalog clarity, top-down order, hero compression, architectural verticals, lifestyle layout, or premium macro depth',
    moodLogic:
      'derive mood from appetite, trust, luxury, engineering, cleanliness, freshness, aspiration, or frictionless retail function',
    finishLogic:
      'finish with professional photo polish, accurate material response, clean retouching, and no fake logo, UI, or unreadable label clutter',
    defaultCue:
      'studio-commercial clarity, controlled material response, clean selling silhouette, and polished photographic retouching',
    avoidRules: [
      'fake brand logo',
      'messy clutter',
      'dirty product surface',
      'unreadable labels',
      'cheap stock layout',
    ],
  },
  'nature-and-wildlife': {
    frame:
      'field and nature photographic system built from natural light, patient timing, environmental scale, and credible ecology',
    subjectLogic:
      'preserve prompt identity while giving it field realism, habitat pressure, natural scale, or macro/wildlife observation cues',
    colorLogic:
      'grade through natural atmosphere, silver-black fine-art values, underwater blue shift, sky exposure, foliage color, or animal camouflage',
    lightLogic:
      'use weather, sun angle, water absorption, night-sky exposure, diffused field light, or telephoto background separation',
    materialLogic:
      'render fur, feathers, plant texture, rock, water, star noise, mist, mud, and environmental micro-detail without plastic artificiality',
    compositionLogic:
      'compose through long-lens compression, macro proximity, horizon scale, field patience, eye-level empathy, or monumental stillness',
    moodLogic:
      'derive mood from patience, wilderness pressure, wonder, cosmic quiet, companion warmth, or fine-art environmental grandeur',
    finishLogic:
      'finish as believable field photography with clean detail, natural restraint, and no oversaturated postcard or zoo snapshot look',
    defaultCue:
      'field-camera realism, environmental scale, natural light, and patient observational detail',
    avoidRules: [
      'zoo snapshot',
      'oversaturated postcard',
      'plastic foliage',
      'fake wildlife pose',
      'friendly nature cliche',
    ],
  },
  'technical-and-specialist-imaging': {
    frame:
      'technical capture system built from diagnostic optics, surveillance position, scientific sensor behavior, and evidence-grade readability',
    subjectLogic:
      'preserve prompt identity while translating it through device constraints, evidence logic, extreme scale, or diagnostic signal',
    colorLogic:
      'use palette as sensor output: thermal gradients, monochrome electron depth, CCTV compression, medical neutral color, or astrophotographic false color',
    lightLogic:
      'make light come from device behavior, flash documentation, emissive heat, telescope exposure, glass reflections, or clinical illumination',
    materialLogic:
      'render scan noise, compression, measurement surfaces, medical cleanliness, forensic detail, microtexture, or signal artifacts as capture evidence',
    compositionLogic:
      'compose through mounted POV, deadpan documentation, miniature focal bands, abstract cropping, evidence scale, or instrument framing',
    moodLogic:
      'derive mood from surveillance, diagnosis, evidence, scientific alienness, minimalism, procedural restraint, or technical unease',
    finishLogic:
      'finish with exact capture logic, readable signal, controlled artifacts, and no cinematic beauty-lighting overwrite',
    defaultCue:
      'diagnostic capture constraints, device-specific signal, evidence clarity, and technical photographic neutrality',
    avoidRules: [
      'cinematic beauty lighting',
      'artistic blur',
      'wrong diagnostic palette',
      'fake UI text',
      'random sci-fi overlay',
    ],
  },
};

const presetFallbacks: Record<
  string,
  Partial<Record<keyof StylePresetManifest['visualDna'], string>>
> = {
  'SP01-070': {
    aesthetic:
      'travelogue documentary photography with discovered-place atmosphere, layered journey detail, and compact destination storytelling',
    subject_treatment:
      'subjects should feel encountered in transit, shaped by weather, route pressure, distance, and lived-in surroundings',
    color_and_tone:
      'natural destination color with warm daylight, regional accent color, dusty neutrals, and travel-magazine contrast restraint',
    lighting_and_shadow:
      'available daylight, window spill, street shade, dawn departures, or late-afternoon raking light should carry place memory',
    texture_and_material:
      'regional surface patina, textile tactility, transit wear, road dust, water sheen, and architectural age should feel observed',
    camera_and_composition:
      'layer route clues, human or object scale, and landmark geometry through depth relationships without turning into a postcard',
    atmosphere_and_mood:
      'curious, worldly, sun-warmed, observant, and slightly restless, with discovery carried by visual evidence',
    rendering_and_quality:
      'editorial travel-magazine photography with clean realism, restrained grading, and no tourist brochure gloss',
    key_features:
      'encountered journey; layered travel context; available daylight; regional texture; editorial observation',
  },
};

const commonAvoidRules = [
  'illustration',
  'painting',
  'drawing',
  '3d render',
  'cartoon',
  'anime',
  'sketch',
  'synthetic CGI',
  'plastic render',
  'watermark',
  'readable text',
  'signature',
  'low resolution',
];

function argValue(name: string) {
  return process.argv
    .find((arg) => arg.startsWith(`--${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');
}

function visualValue(manifest: StylePresetManifest, key: string) {
  const value = manifest.visualDna[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : '';
}

function isGenericTemplate(value: string) {
  return [
    /\bvisual language with a clear stylistic thesis\b/i,
    /\breusable Photography & Realism visual language\b/i,
    /\bDefine .+ through line, mass, contour, spacing, and rhythm\b/i,
    /\bUse a .+-specific palette with clear dominant\b/i,
    /\bUse lighting that makes .+ recognizable\b/i,
    /\bUse materials and textures that reinforce\b/i,
    /\bUse spatial behavior that fits\b/i,
    /\bSet a mood that belongs to\b/i,
    /\bRender .+ with high production clarity\b/i,
    /\bPrioritize .+'s key features\b/i,
    /\bCreate a style-card that translates\b/i,
    /\bCamera setup native to\b/i,
  ].some((pattern) => pattern.test(value));
}

function sanitizeSceneLockWords(value: string) {
  return value
    .replace(/\bbackgrounds?\b/gi, 'depth field')
    .replace(/\bforegrounds?\b/gi, 'near field')
    .replace(/\bbehind\b/gi, 'beyond')
    .replace(/\bcentered\b/gi, 'central')
    .replace(/\bstreets?\b/gi, 'public-space')
    .replace(/\bcities\b/gi, 'urban fabrics')
    .replace(/\bcity\b/gi, 'urban fabric')
    .replace(/\bmarkets?\b/gi, 'trade texture')
    .replace(/\bforests?\b/gi, 'organic canopy')
    .replace(/\brooms?\b/gi, 'interior volume')
    .replace(/\bkitchens?\b/gi, 'culinary setting')
    .replace(/\blaborator(?:y|ies)\b/gi, 'clinical setting')
    .replace(/\bbeaches\b/gi, 'shoreline settings')
    .replace(/\bbeach\b/gi, 'shoreline setting')
    .replace(/\bskylines?\b/gi, 'horizon architecture')
    .replace(/\bcathedrals?\b/gi, 'sacred-scale architecture')
    .replace(/\btemples?\b/gi, 'ritual architecture')
    .replace(/\bstations?\b/gi, 'transit setting')
    .replace(/\bvillages?\b/gi, 'settlement texture')
    .replace(/\bships?\b/gi, 'vessels')
    .replace(/\barenas?\b/gi, 'contest geometry')
    .replace(/\bbattlefields?\b/gi, 'conflict terrain');
}

function cleanCue(value: string, fallback: string) {
  const compact = value.replace(/\s+/g, ' ').trim();
  if (!compact || isGenericTemplate(compact)) return fallback;
  return sanitizeSceneLockWords(compact).replace(/\.$/, '').trim();
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

  return normalized in categoryLanguage ? normalized : 'portrait-and-studio';
}

function fallbackFor(
  manifest: StylePresetManifest,
  key: keyof StylePresetManifest['visualDna'] & string,
  language: PhotoCategoryLanguage,
) {
  const override = presetFallbacks[manifest.id]?.[key];
  if (override) return override;
  if (key === 'key_features') return language.defaultCue;
  return `${manifest.name} ${language.defaultCue}`;
}

function cueValues(manifest: StylePresetManifest, language: PhotoCategoryLanguage) {
  const fallback = (key: keyof StylePresetManifest['visualDna'] & string) =>
    fallbackFor(manifest, key, language);
  const features = cleanCue(visualValue(manifest, 'key_features'), fallback('key_features'));

  return {
    aesthetic: cleanCue(visualValue(manifest, 'aesthetic'), fallback('aesthetic')),
    subject: cleanCue(visualValue(manifest, 'subject_treatment'), fallback('subject_treatment')),
    color: cleanCue(visualValue(manifest, 'color_and_tone'), fallback('color_and_tone')),
    light: cleanCue(visualValue(manifest, 'lighting_and_shadow'), fallback('lighting_and_shadow')),
    texture: cleanCue(
      visualValue(manifest, 'texture_and_material'),
      fallback('texture_and_material'),
    ),
    composition: cleanCue(
      visualValue(manifest, 'camera_and_composition'),
      fallback('camera_and_composition'),
    ),
    mood: cleanCue(visualValue(manifest, 'atmosphere_and_mood'), fallback('atmosphere_and_mood')),
    finish: cleanCue(
      visualValue(manifest, 'rendering_and_quality'),
      fallback('rendering_and_quality'),
    ),
    features,
    brief: cleanCue(visualValue(manifest, 'creative_brief'), ''),
  };
}

function isAlreadyEnriched(manifest: StylePresetManifest) {
  const aesthetic = visualValue(manifest, 'aesthetic');
  return (
    aesthetic.includes('transferable photographic style router') ||
    aesthetic.includes('photographic routing system')
  );
}

async function cueSourceManifest(filePath: string, manifest: StylePresetManifest) {
  if (!isAlreadyEnriched(manifest)) return manifest;

  const gitPath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');

  try {
    const { stdout } = await execFileAsync('git', ['show', `HEAD:${gitPath}`], {
      cwd: process.cwd(),
      maxBuffer: 1024 * 1024,
    });
    return yaml.load(stdout) as StylePresetManifest;
  } catch {
    return manifest;
  }
}

function sentence(value: string) {
  return value.endsWith('.') ? value : `${value}.`;
}

function buildPhotoDna(manifest: StylePresetManifest) {
  const language = categoryLanguage[categoryId(manifest)];
  const cue = cueValues(manifest, language);

  return {
    aesthetic: sentence(
      `${manifest.name} acts as a transferable photographic style router: begin from ${cue.aesthetic}, ${cue.features}, and ${language.frame}, then apply the photographic behavior to prompt X instead of recreating a fixed card scene`,
    ),
    subject_treatment: sentence(
      `Treat any prompt subject through ${cue.subject}; ${language.subjectLogic}, keeping the original subject, pose, species, object, or environment legible`,
    ),
    color_and_tone: sentence(
      `Grade with ${cue.color}; ${language.colorLogic}, with value separation and white balance choices that feel captured in-camera rather than painted over`,
    ),
    lighting_and_shadow: sentence(
      `Use ${cue.light}; ${language.lightLogic}, preserving believable exposure, shadow density, highlight rolloff, and source motivation`,
    ),
    texture_and_material: sentence(
      `Render ${cue.texture}; ${language.materialLogic}, avoiding both waxy smoothing and noisy texture overlays that hide the prompt content`,
    ),
    camera_and_composition: sentence(
      `Compose through ${cue.composition}; ${language.compositionLogic}, with lens distance, depth, timing, and focal hierarchy doing the style work`,
    ),
    atmosphere_and_mood: sentence(
      `Keep the mood ${cue.mood}; ${language.moodLogic}, so the preset changes interpretation without demanding a specific story, location, or character`,
    ),
    rendering_and_quality: sentence(
      `Finish with ${cue.finish}; ${language.finishLogic}, high-resolution photographic detail, and disciplined denoise without losing natural grain where the preset needs it`,
    ),
    key_features: `${cue.aesthetic}; ${cue.features}; ${cue.color}; ${cue.light}; ${cue.composition}`,
    creative_brief: sentence(
      `Apply ${manifest.name} as a photographic preset over prompt X: preserve the user's requested subject, then route ${cue.aesthetic}, ${cue.color}, ${cue.light}, ${cue.texture}, and ${cue.composition} through optics, exposure, palette, surface response, timing, and finish without requiring the card image's original subject`,
    ),
  };
}

function uniqueRules(rules: string[]) {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const rule of rules) {
    const clean = rule.trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
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

    const sourceManifest = await cueSourceManifest(filePath, manifest);
    const language = categoryLanguage[categoryId(sourceManifest)];

    manifest.visualDna = {
      ...manifest.visualDna,
      ...buildPhotoDna(sourceManifest),
    };
    manifest.avoidRules = uniqueRules([
      ...(manifest.avoidRules ?? []),
      ...commonAvoidRules,
      ...language.avoidRules,
    ]);
    manifest.attributes = {
      ...manifest.attributes,
      negativePrompt: manifest.avoidRules.join(', '),
    };

    changed += 1;

    if (dryRun) {
      console.log(`[pack01:dna] would update ${manifest.id} ${manifest.name}`);
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

  console.log(`[pack01:dna] ${dryRun ? 'dry-run' : 'updated'} presets=${changed}`);
}

await main();
