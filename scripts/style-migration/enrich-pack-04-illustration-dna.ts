import { execFile } from 'node:child_process';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import * as yaml from 'js-yaml';

import type { StylePresetManifest } from '../../components/recipes/styles/manifestTypes';

const execFileAsync = promisify(execFile);
const packId = 'pack_04';
const presetDir = path.join(
  process.cwd(),
  'components',
  'recipes',
  'styles',
  'manifests',
  'presets',
  packId,
);

interface IllustrationCategoryLanguage {
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

const categoryLanguage: Record<string, IllustrationCategoryLanguage> = {
  'comic-book-styles': {
    frame:
      'comic-illustration system built from ink hierarchy, panel-era color, contour exaggeration, print artifacts, and sequential-art readability',
    subjectLogic:
      'preserve the requested subject while translating form into panel-ready silhouettes, expressive contour weight, stylized anatomy, speed emphasis, or graphic restraint only when the preset calls for it',
    colorLogic:
      'treat color as comic production language: four-color plates, limited spot color, manga monochrome, digital flats, noir contrast, webtoon gradients, or painted page atmosphere',
    lightLogic:
      'make light read through ink spotting, cel-like value blocks, dramatic rim separation, flat print fill, or painted page modeling rather than generic studio illumination',
    materialLogic:
      'surface detail should reveal paper tooth, newsprint dots, screen tones, digital brush layers, ink pools, gutter discipline, or pixel cells at a scale that supports the drawing',
    compositionLogic:
      'compose with panel logic, silhouette clarity, speech-shape space, page rhythm, close-up drama, or scroll pacing without requiring a fixed comic-page scene',
    moodLogic:
      'derive mood from era, genre pressure, satire, melodrama, horror obsession, pulp energy, or graphic-novel seriousness',
    finishLogic:
      'finish with clear ink decisions, readable stylization, controlled artifacting, and no generic superhero costume or random comic text replacing the prompt',
    defaultCue:
      'ink hierarchy, panel readability, stylized contour, print-era surface, and comic color discipline',
    avoidRules: [
      'generic superhero costume',
      'random speech text',
      'fake lettering',
      'photo-real costume render',
    ],
  },
  'childrens-illustration': {
    frame:
      'storybook and friendly-illustration system built from approachable shapes, handmade media, simplified edges, tactile materials, and high-readability charm',
    subjectLogic:
      'preserve the requested subject while softening, simplifying, miniaturizing, paper-building, mark-making, or diagramming it according to the named medium',
    colorLogic:
      'use color through storybook washes, crayon wax, gouache opacity, paper primaries, vector-friendly contrast, pastel dust, marker bleed, or specimen tints',
    lightLogic:
      'shape light through soft diffuse value, paper layering, flat educational contrast, handmade shadows, or medium-native tonal marks instead of cinematic realism',
    materialLogic:
      'surface detail should show paper tooth, cut edges, crayon wax, chalk dust, marker overlap, clay fingerprints, sticker laminate, or watercolor blooms when relevant',
    compositionLogic:
      'compose with clear silhouettes, readable spacing, playful scale, page-object logic, flat educational layout, or gentle negative space without forcing a nursery scene',
    moodLogic:
      'derive mood from wonder, gentle humor, craft intimacy, educational clarity, bedtime softness, collectibility, or handmade surprise',
    finishLogic:
      'finish with clean accessible illustration, medium-faithful texture, controlled simplicity, and no plasticky render or bland stock-child aesthetic',
    defaultCue:
      'friendly shape language, handmade surface evidence, simplified readable forms, and storybook composition discipline',
    avoidRules: [
      'plastic toy render',
      'generic stock children art',
      'overly complex anatomy',
      'fake readable labels',
    ],
  },
  'editorial-and-poster': {
    frame:
      'editorial graphic system built from poster hierarchy, symbolic compression, typography-as-shape, reproduction limits, and immediate visual argument',
    subjectLogic:
      'preserve the requested subject while converting it into emblem, poster form, editorial metaphor, collage fragment, fashion gesture, or information hierarchy',
    colorLogic:
      'use color as communication pressure: ink plates, propaganda contrast, deco metallic restraint, psychedelic vibration, Bauhaus primaries, vector flatness, or vintage print fade',
    lightLogic:
      'make light serve graphic hierarchy through flat poster contrast, airbrush gradients, screenprint layers, symbolic rays, collage mismatch, or painted cover drama',
    materialLogic:
      'surface detail should reveal screenprint ink, risograph grain, paper stock, cut-paper edges, vector fields, album-cover wear, or editorial print finish',
    compositionLogic:
      'compose through graphic hierarchy, diagonal force, asymmetrical grid, ornamental framing, cover impact, information grouping, or fashion elongation without readable slogan dependency',
    moodLogic:
      'derive mood from propaganda urgency, luxe modernity, counterculture heat, editorial wit, travel nostalgia, music-poster grit, or cover-story seduction',
    finishLogic:
      'finish as deliberate graphic communication with crisp shape logic, controlled print artifacts, and no random poster text or literal advertisement clutter',
    defaultCue:
      'poster hierarchy, symbolic compression, print surface, graphic color pressure, and editorial shape control',
    avoidRules: [
      'random poster text',
      'literal ad layout',
      'stock vector blandness',
      'weak graphic hierarchy',
    ],
  },
  'concept-art': {
    frame:
      'production concept-art system built from iteration discipline, silhouette testing, material exploration, design readability, and pitch-ready visual decisions',
    subjectLogic:
      'preserve the requested subject while routing it through design exploration, asset logic, value blocking, scale cues, iteration rows, paintover marks, or production-readability constraints',
    colorLogic:
      'use color as concept decision-making: mood scripts, material swatches, faction accents, environment atmosphere, asset tier contrast, or readable pass separation',
    lightLogic:
      'shape light for ideation clarity through value block-in, keyframe contrast, material test highlights, callout illumination, or pitch-frame atmosphere',
    materialLogic:
      'surface detail should reveal brush passes, photobash integration, low-poly facets, callout texture, massing blocks, costume fabrics, foliage clusters, or weapon material tiers when named',
    compositionLogic:
      'compose through production hierarchy, variants, orthographic logic, isometric staging, silhouette grids, iteration boards, or cinematic keyframe balance without locking one finished illustration',
    moodLogic:
      'derive mood from exploration, worldbuilding pressure, tactical design, creature unease, kitbash utility, cinematic intent, or production-room clarity',
    finishLogic:
      'finish with concept-art usefulness, readable decisions, controlled roughness, and no generic fantasy wallpaper or overpolished final render when iteration is intended',
    defaultCue:
      'production design clarity, iteration logic, silhouette readability, material exploration, and concept-art decision pressure',
    avoidRules: [
      'generic fantasy wallpaper',
      'overpolished final render',
      'unclear design callouts',
      'random kitbash clutter',
    ],
  },
  'ink-and-print': {
    frame:
      'ink and printmaking system built from mark economy, matrix process, ink transfer, pressure artifacts, paper absorption, and reproducible graphic structure',
    subjectLogic:
      'preserve the requested subject while rebuilding it through carved lines, etched density, stipple fields, calligraphic pressure, stamp incompleteness, graffiti stroke logic, or tattoo-flash simplification',
    colorLogic:
      'use color as ink behavior: monochrome value, limited plates, cyan chemistry, overprint, enamel-like flash colors, spray contrast, newspaper black, or sumi restraint',
    lightLogic:
      'translate light into hatch density, dot spacing, gouge direction, plate tone, paper reserve, ink pooling, or flat spray contrast rather than photographic shading',
    materialLogic:
      'surface detail should show paper fiber, plate burr, block grain, stipple dots, stamp gaps, marker bite, fountain-pen pooling, tattoo flash linework, or aerosol edge behavior',
    compositionLogic:
      'compose through print registration, border discipline, mark-direction rhythm, negative-space carving, tag flow, ornamental line weight, or edition-like balance',
    moodLogic:
      'derive mood from craft pressure, underground immediacy, archival print authority, occult darkness, decorative ceremony, street-poster urgency, or disciplined ink control',
    finishLogic:
      'finish as a credible ink or print artifact with exact mark logic, restrained artifacting, and no fake text, random distress overlay, or smooth vector replacement',
    defaultCue:
      'ink transfer, mark density, paper response, process artifacts, and printmaking composition discipline',
    avoidRules: [
      'fake text',
      'random distress overlay',
      'smooth vector replacement',
      'wrong print process',
    ],
  },
  'technical-and-reference-sheets': {
    frame:
      'technical reference and interface-spec system built from orthographic clarity, diagram hierarchy, callout logic, measured spacing, and production-sheet legibility',
    subjectLogic:
      'preserve the requested subject while expressing it through schematic breakdowns, reference views, anatomy structure, UI wireframes, comparison scales, or specification surfaces',
    colorLogic:
      'use color as information coding: blueprint cyan, neutral sheet stock, callout accents, HUD glow, anatomy value separation, or wireframe hierarchy',
    lightLogic:
      'keep light diagrammatic and legible through flat drafting values, callout emphasis, interface glow, anatomical separation, or measured shadow restraint',
    materialLogic:
      'surface detail should support readability with grid paper, line weights, translucent overlays, measurement ticks, UI panels, section cuts, or reference-sheet paper grain',
    compositionLogic:
      'compose through orthographic projection, exploded spacing, callout grouping, interface modules, size-scale relationships, and reference-sheet hierarchy',
    moodLogic:
      'derive mood from precision, planning, research, interface control, anatomical study, engineering authority, or catalogued comparison',
    finishLogic:
      'finish with readable technical communication, crisp line hierarchy, controlled notation-like detail, and no illegible labels or decorative clutter',
    defaultCue:
      'technical line hierarchy, orthographic clarity, callout structure, grid discipline, and reference-sheet readability',
    avoidRules: [
      'illegible labels',
      'decorative clutter',
      'shaded cinematic render',
      'random UI text',
    ],
  },
};

const commonAvoidRules = [
  'official card scene',
  'fixed thumbnail subject',
  'prompt replaced by sample image',
  'readable fake text',
  'watermark',
  'logo clutter',
  'muddy AI texture',
  'generic fantasy slop',
];

const presetFallbacks: Partial<
  Record<string, Partial<Record<keyof StylePresetManifest['visualDna'] & string, string>>>
> = {
  'SP04-001': {
    subject_treatment:
      'thick confident ink, emblematic square-jawed simplification, and four-color action-read silhouette logic',
    camera_and_composition:
      'cover-panel force, clean central read, diagonal energy, and space for balloon-like graphic shapes without real text',
  },
  'SP04-007': {
    aesthetic:
      'ligne claire Franco-Belgian album style with uniform clean ink contour, open readable shapes, precise backgrounds-as-design, and calm adventure-page clarity',
    subject_treatment:
      'even clear-line contour, simplified volume, minimal hatch dependency, and object-readable silhouette logic that keeps every prompt element crisp',
    color_and_tone:
      'flat bright European album color, controlled local hues, soft natural accents, and low-noise value separation without painterly gradients',
    lighting_and_shadow:
      'minimal cast shadow, clean daylight-like value control, restrained tonal steps, and no heavy noir spotting or airbrushed drama',
    texture_and_material:
      'smooth ink-on-paper finish, lightly printed album surface, crisp color fills, and almost invisible brush texture',
    camera_and_composition:
      'album-panel clarity, balanced negative space, readable object placement, calm perspective, and precise environmental line organization',
    atmosphere_and_mood:
      'curious, intelligent, lucid, adventurous, and gently ironic without melodrama or noisy spectacle',
    rendering_and_quality:
      'immaculate clear-line finish with consistent contour weight, clean fills, exact edges, and high readability at small card scale',
    key_features:
      'uniform contour, flat album color, clean open shapes, minimal shadow, precise environment linework',
  },
  'SP04-033': {
    aesthetic:
      'constructivist poster command language with hard geometry, reduced silhouettes, radial pressure, and mass-communication urgency',
    subject_treatment:
      'bold emblematic reduction, simplified body or object mass, and graphic hierarchy that turns the prompt into public-facing symbol',
  },
  'SP04-041': {
    subject_treatment:
      'elongated runway sketch gesture, fast contour, fabric sweep, and pose-aware line economy without requiring a model card',
    texture_and_material:
      'fashion paper tooth, watercolor accents, loose graphite underdrawing, and wet-dry pigment blooms around fabric edges',
  },
  'SP04-057': {
    texture_and_material:
      'blue drafting ground, grid sub-base, white technical linework, measurement ticks, and precise paper-plan texture',
    camera_and_composition:
      'orthographic projection, exploded spacing, dimension hierarchy, and specification-panel rhythm',
  },
  'SP04-078': {
    aesthetic:
      'protest-stencil print language with cut bridges, hard one-ink silhouettes, overspray halos, and public-message compression',
    subject_treatment:
      'bridged cutout reduction, hard silhouette islands, stencil registration breaks, and shape choices that keep the prompt recognizable',
    camera_and_composition:
      'negative-space compression, poster-impact scale, cutout bridge placement, and simplified value zones',
  },
};

function argValue(name: string) {
  return process.argv
    .find((arg) => arg.startsWith(`--${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');
}

function visualValue(manifest: StylePresetManifest, key: string) {
  const value = manifest.visualDna[key];
  return typeof value === 'string' ? value.trim() : '';
}

function isGenericTemplate(value: string) {
  return /\b(Finish as a polished|Create a style-card|Preserve the preset identity|Use a controlled palette|Shape light and shadow|Render surfaces with|visual language with a clear stylistic thesis|specific palette with clear dominant|Prioritize .* key features|Use spatial behavior that fits|Set a mood that belongs|high production clarity|Use materials and textures that reinforce|Use lighting that makes)\b/i.test(
    value,
  );
}

function wordCount(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!normalized) return 0;
  return normalized.split(/\s+/).filter(Boolean).length;
}

function sanitizeSceneLockWords(value: string) {
  return value
    .replace(/\bbackgrounds?\b/gi, 'depth field')
    .replace(/\bforegrounds?\b/gi, 'near field')
    .replace(/\bbehind\b/gi, 'beyond')
    .replace(/\bcentered\b/gi, 'central')
    .replace(/\bthumbnail\b/gi, 'small-read composition study')
    .replace(/\bmonster-card\b/gi, 'creature-design card')
    .replace(/\boracle-card\b/gi, 'symbolic card')
    .replace(/\bheroic\b/gi, 'emblematic')
    .replace(/\bheroes\b/gi, 'lead archetypes')
    .replace(/\bhero\b/gi, 'lead archetype')
    .replace(/\bvillains?\b/gi, 'opposing archetypes')
    .replace(/\bcharacters?\b/gi, 'designed subjects')
    .replace(/\bfigures?\b/gi, 'silhouette subjects')
    .replace(/\bcreatures?\b/gi, 'organism designs')
    .replace(/\bmonsters?\b/gi, 'scale-threat designs')
    .replace(/\bbeasts?\b/gi, 'animalistic designs')
    .replace(/\bwarriors?\b/gi, 'combat archetypes')
    .replace(/\bknights?\b/gi, 'armored archetypes')
    .replace(/\brobots?\b/gi, 'mechanical subjects')
    .replace(/\bmecha\b/gi, 'mechanized form language')
    .replace(/\bmasks?\b/gi, 'face-covering design')
    .replace(/\barmor\b/gi, 'protective plating')
    .replace(/\bvehicles?\b/gi, 'transport designs')
    .replace(/\bships?\b/gi, 'vessels')
    .replace(/\bweapons?\b/gi, 'equipment silhouettes')
    .replace(/\bdragons?\b/gi, 'mythic organism designs')
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
    .replace(/\barenas?\b/gi, 'contest geometry')
    .replace(/\bbattlefields?\b/gi, 'conflict terrain')
    .replace(/\bcastles?\b/gi, 'fortified architecture')
    .replace(/\bruins?\b/gi, 'eroded architecture')
    .replace(/\bdungeons?\b/gi, 'subterranean architecture')
    .replace(/\bcourts?\b/gi, 'ceremonial hierarchy')
    .replace(/\bchapels?\b/gi, 'small sacred architecture')
    .replace(/\bshrines?\b/gi, 'ritual structures')
    .replace(/\balleys?\b/gi, 'narrow public passages');
}

function cleanCue(value: string, fallback: string, minWords = 4) {
  const compact = value.replace(/\s+/g, ' ').trim();
  if (!compact || isGenericTemplate(compact)) return fallback;
  const sanitized = sanitizeSceneLockWords(compact).replace(/\.$/, '').trim();
  if (wordCount(sanitized) < minWords) {
    return sanitizeSceneLockWords(`${sanitized}, ${fallback}`).replace(/\.$/, '').trim();
  }
  return sanitized;
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

  return normalized in categoryLanguage ? normalized : 'concept-art';
}

function safeName(manifest: StylePresetManifest) {
  return sanitizeSceneLockWords(manifest.name);
}

function fallbackFor(
  manifest: StylePresetManifest,
  key: keyof StylePresetManifest['visualDna'] & string,
  language: IllustrationCategoryLanguage,
) {
  const override = presetFallbacks[manifest.id]?.[key];
  if (override) return override;

  const subject = safeName(manifest);
  const fallbacks: Partial<Record<keyof StylePresetManifest['visualDna'] & string, string>> = {
    aesthetic: `${subject} ${language.defaultCue}`,
    subject_treatment: `adapt the requested subject through ${language.defaultCue} while preserving identity`,
    color_and_tone: `process-native palette relationships, deliberate contrast, and accent restraint for ${subject}`,
    lighting_and_shadow:
      'process-led value structure, readable highlights, and style-specific shadow behavior',
    texture_and_material: language.defaultCue,
    camera_and_composition: `scale rhythm, edge hierarchy, spacing, and composition rules specific to ${subject}`,
    atmosphere_and_mood: `mood carried by ${subject} craft, material pressure, and visual restraint`,
    rendering_and_quality: `finished ${subject} craft with clear process evidence and controlled detail`,
    key_features: language.defaultCue,
    creative_brief: `${subject} ${language.defaultCue}`,
  };

  return fallbacks[key] ?? `${subject} ${language.defaultCue}`;
}

function cueValues(manifest: StylePresetManifest, language: IllustrationCategoryLanguage) {
  const fallback = (key: keyof StylePresetManifest['visualDna'] & string) =>
    fallbackFor(manifest, key, language);

  return {
    aesthetic: cleanCue(visualValue(manifest, 'aesthetic'), fallback('aesthetic'), 5),
    subject: cleanCue(visualValue(manifest, 'subject_treatment'), fallback('subject_treatment'), 5),
    color: cleanCue(visualValue(manifest, 'color_and_tone'), fallback('color_and_tone'), 5),
    light: cleanCue(
      visualValue(manifest, 'lighting_and_shadow'),
      fallback('lighting_and_shadow'),
      5,
    ),
    texture: cleanCue(
      visualValue(manifest, 'texture_and_material'),
      fallback('texture_and_material'),
      4,
    ),
    composition: cleanCue(
      visualValue(manifest, 'camera_and_composition'),
      fallback('camera_and_composition'),
      5,
    ),
    mood: cleanCue(
      visualValue(manifest, 'atmosphere_and_mood'),
      fallback('atmosphere_and_mood'),
      5,
    ),
    finish: cleanCue(
      visualValue(manifest, 'rendering_and_quality'),
      fallback('rendering_and_quality'),
      5,
    ),
    features: cleanCue(visualValue(manifest, 'key_features'), fallback('key_features'), 4),
  };
}

function isAlreadyEnriched(manifest: StylePresetManifest) {
  const aesthetic = visualValue(manifest, 'aesthetic');
  return (
    aesthetic.includes('transferable illustration router') ||
    aesthetic.includes('illustration and graphic-novel router')
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

function normalizedCue(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function uniqueCueList(cues: string[]) {
  const normalized: string[] = [];
  const output: string[] = [];

  for (const cue of cues) {
    const clean = cue.replace(/\s+/g, ' ').trim();
    if (!clean) continue;
    const key = normalizedCue(clean);
    if (!key) continue;
    if (normalized.some((existing) => existing.includes(key) || key.includes(existing))) continue;
    normalized.push(key);
    output.push(clean);
  }

  return output;
}

function buildIllustrationDna(manifest: StylePresetManifest) {
  const language = categoryLanguage[categoryId(manifest)];
  const cue = cueValues(manifest, language);
  const leadCues = uniqueCueList([cue.aesthetic, cue.features]);
  const featureCues = uniqueCueList([
    cue.aesthetic,
    cue.features,
    cue.color,
    cue.texture,
    cue.composition,
  ]);
  const briefCues = uniqueCueList([cue.aesthetic, cue.features, cue.texture]).join(', ');
  const name = safeName(manifest);

  return {
    aesthetic: sentence(
      `${name} acts as a transferable illustration router: start from ${leadCues.join(', ')} and ${language.frame}, then apply the visual behavior to prompt X instead of recreating a fixed demo image`,
    ),
    subject_treatment: sentence(
      `Transform any prompt subject through ${cue.subject}; ${language.subjectLogic}, keeping the requested identity, silhouette, pose, object function, or setting legible`,
    ),
    color_and_tone: sentence(
      `Build color with ${cue.color}; ${language.colorLogic}, with deliberate value grouping, accent control, and process-specific limits rather than a generic palette wash`,
    ),
    lighting_and_shadow: sentence(
      `Handle light through ${cue.light}; ${language.lightLogic}, so value structure supports the illustration process and does not overwrite the requested content`,
    ),
    texture_and_material: sentence(
      `Render ${cue.texture}; ${language.materialLogic}, keeping material scale coherent and avoiding noisy filler texture`,
    ),
    camera_and_composition: sentence(
      `Structure the image through ${cue.composition}; ${language.compositionLogic}, with scale, spacing, edge rhythm, and visual hierarchy doing the style work`,
    ),
    atmosphere_and_mood: sentence(
      `Keep the mood ${cue.mood}; ${language.moodLogic}, letting the style alter interpretation without demanding a specific story, location, or actor`,
    ),
    rendering_and_quality: sentence(
      `Finish with ${cue.finish}; ${language.finishLogic}, clean denoised surfaces where appropriate, and enough process evidence to make the style recognizable`,
    ),
    key_features: featureCues.join('; '),
    creative_brief: sentence(
      `Apply ${name} as an illustration preset over prompt X: preserve the user's requested subject, then route mark-making, palette, surface, composition, mood, and final craft through ${briefCues} without requiring the card image's original subject`,
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
      ...buildIllustrationDna(sourceManifest),
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
      console.log(`[pack04:dna] would update ${manifest.id} ${manifest.name}`);
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

  console.log(`[pack04:dna] ${dryRun ? 'dry-run' : 'updated'} presets=${changed}`);
}

await main();
