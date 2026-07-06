import { execFile } from 'node:child_process';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import * as yaml from 'js-yaml';

import type { StylePresetManifest } from '../../components/recipes/styles/manifestTypes';

const execFileAsync = promisify(execFile);
const packId = 'pack_06';
const presetDir = path.join(
  process.cwd(),
  'components',
  'recipes',
  'styles',
  'manifests',
  'presets',
  packId,
);

interface ArtCategoryLanguage {
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

const categoryLanguage: Record<string, ArtCategoryLanguage> = {
  'traditional-painting': {
    frame:
      'paint-media system built from pigment body, binder behavior, substrate tooth, brush pressure, edge softness, and deliberate surface finish',
    subjectLogic:
      'preserve the prompt subject while translating form into brushstroke mass, pigment opacity, glaze, wash, impasto, stain, or sprayed edge behavior',
    colorLogic:
      'let hue, value, saturation, and mixing come from physical pigment, binder opacity, drying character, and historical medium constraints',
    lightLogic:
      'make light feel interpreted by paint through tonal blocking, glaze depth, broken color, matte falloff, or luminous pigment lift',
    materialLogic:
      'surface detail should show canvas, paper, plaster, wax, velvet, gesso, knife ridges, wash blooms, or aerosol overspray when the medium requires it',
    compositionLogic:
      'organize the image through painterly massing, brush direction, support format, negative space, edge hierarchy, and intentional simplification',
    moodLogic:
      'derive mood from medium history, touch, pigment weight, speed, restraint, kitsch, ritual craft, or studio discipline',
    finishLogic:
      'finish with medium-faithful paint handling, readable form, controlled texture, and no pasted photo or generic digital filter',
    defaultCue:
      'physical pigment behavior, visible hand pressure, support texture, and medium-specific surface finish',
    avoidRules: [
      'pasted photo texture',
      'wrong paint medium',
      'flat digital filter',
      'plastic CGI finish',
    ],
  },
  'drawing-and-sketching': {
    frame:
      'drawing-media system built from mark pressure, line economy, paper tooth, erasure, hatching, dust, and tool-specific edge behavior',
    subjectLogic:
      'preserve the prompt subject while rebuilding it through line weight, contour, hatch density, smudge, scratch, wax, stylus, or marker stroke logic',
    colorLogic:
      'treat color as tool-limited material: graphite value, charcoal black, ink density, sanguine earth, wax pencil, marker bleed, chalk dust, or metallic trace',
    lightLogic:
      'represent light through mark spacing, exposed paper, tonal rubbing, crosshatch density, erased highlights, or flat diagrammatic value control',
    materialLogic:
      'make paper grain, tooth, dust, ink bite, wax buildup, scratch coating, vellum smoothness, or marker streaks visible at the right scale',
    compositionLogic:
      'structure forms through line rhythm, gesture, technical geometry, blank space, contour continuity, and readable silhouette logic',
    moodLogic:
      'derive mood from study, immediacy, precision, roughness, temporary mark-making, craft intimacy, or disciplined draftsmanship',
    finishLogic:
      'finish with honest drawing marks, stable anatomy or object structure, clean negative space, and no painterly fill replacing the chosen tool',
    defaultCue:
      'tool-specific marks, paper tooth, controlled line pressure, and drawing-first value construction',
    avoidRules: [
      'painterly fill',
      'wrong drawing tool',
      'airbrushed smoothness',
      'photo-real material overlay',
    ],
  },
  printmaking: {
    frame:
      'print-process system built from matrix marks, ink transfer, pressure, registration, plate or block artifacts, and paper absorption',
    subjectLogic:
      'preserve the prompt subject while converting it into carved, etched, stamped, screened, dotted, grained, or impressed mark systems',
    colorLogic:
      'use palette as ink behavior: limited plates, overprint, misregistration, monochrome value, cyan chemistry, newspaper dots, or security green-grey restraint',
    lightLogic:
      'translate light into line density, dot frequency, relief shadow, plate tone, paper reserve, or ink coverage rather than photographic illumination',
    materialLogic:
      'surface detail should reveal paper fibers, plate marks, burr, gouge, rosin grain, rubber stamp incompleteness, halftone dots, or collagraph relief',
    compositionLogic:
      'compose through print registration, cut rhythm, border pressure, edition-like balance, negative space, and repeatable mark hierarchy',
    moodLogic:
      'derive mood from hand pressure, mechanical reproduction, archival value, propaganda energy, occult darkness, newspaper grit, or tactile experiment',
    finishLogic:
      'finish as a credible print artifact with exact mark logic, restrained texture, and no fake poster text or random distress overlay',
    defaultCue:
      'ink transfer behavior, paper absorption, matrix marks, and process-specific print artifacts',
    avoidRules: [
      'fake poster text',
      'smooth digital gradient',
      'random distress overlay',
      'wrong print process',
    ],
  },
  'digital-art': {
    frame:
      'digital art workflow system built from layer control, editable edges, raster or vector logic, screen-era artifacts, and production readability',
    subjectLogic:
      'preserve the prompt subject while routing it through the preset-specific workflow: brush economy, editable edges, grids, vectors, pixels, facets, glyphs, or compositing only when the preset calls for them',
    colorLogic:
      'use color as workflow evidence: palette ramps, neon gradients, RGB channel shifts, flat vector fields, concept-art accents, or controlled digital paint harmonies',
    lightLogic:
      'shape light through layer modes, rim glow, raster gradients, isometric value, screen emission, glitch clipping, or composited photographic consistency',
    materialLogic:
      'surface detail should come from the named workflow: brush texture, pixel cells, glyph density, vector fills, polygon facets, paper layers, or signal artifacts only when they belong to the preset',
    compositionLogic:
      'compose through digital hierarchy, projection rules, asset readability, editable shape grouping, focal thumbnails, grid logic, or controlled interface-like rhythm',
    moodLogic:
      'derive mood from speed, polish, concept utility, retro-futurism, broken media, toy-scale clarity, or modern production control',
    finishLogic:
      'finish with clean digital intent, readable shapes, purposeful artifacts, and no random over-rendered sludge',
    defaultCue:
      'layer-built digital control, purposeful artifact language, clean shape hierarchy, and production-readable polish',
    avoidRules: [
      'random AI smear',
      'muddy overpaint',
      'uncontrolled artifact noise',
      'generic concept slop',
    ],
  },
  'mixed-media': {
    frame:
      'mixed-media assembly system built from layering, adhesion, surface collision, found-material logic, tactile seams, and handmade construction',
    subjectLogic:
      'preserve the prompt subject while rebuilding it through collage cuts, photographic fragments, stitched thread, tape, smoke, coffee stain, gilding, marbling, or stencil bridges',
    colorLogic:
      'treat color as material combination: paper aging, varnish warmth, toner black, red graphic strikes, thread accents, metallic leaf, sepia stain, or marbled oil flow',
    lightLogic:
      'make light reveal relief, varnish gloss, paper lift, tape shine, thread shadow, smoke softness, metallic reflection, or flat stencil contrast',
    materialLogic:
      'surface detail should show torn fiber, glue, tape edge, cork tooth, thread thickness, soot, coffee bloom, varnish crackle, or assembled object depth',
    compositionLogic:
      'compose through layer order, overlap, pin logic, cut rhythm, swatch relationships, tactile seams, and graphic collision without requiring a literal craft table',
    moodLogic:
      'derive mood from DIY urgency, memory, repair, evidence, punk collision, tactile intimacy, decorative excess, or experimental material play',
    finishLogic:
      'finish with coherent material stacking, readable subject transformation, and no single flat texture pasted over the whole image',
    defaultCue:
      'layered material collision, visible joins, tactile surface depth, and handmade assembly rhythm',
    avoidRules: [
      'single flat texture overlay',
      'fake scrapbook text',
      'craft-table default',
      'clean vector render',
    ],
  },
  'retro-game-visual-systems': {
    frame:
      'hardware-constrained game-visual system built from display limits, palette budgets, sprite logic, pixel grids, CRT or handheld artifacts, and era-specific charm',
    subjectLogic:
      'preserve the prompt subject while translating it into tile, sprite, vector, glyph, voxel, pre-render, screen-grid, or low-bit display behavior',
    colorLogic:
      'use color through hardware rules: indexed palettes, phosphor glow, four-shade handheld values, dither tricks, copper gradients, limited scanline color, or terminal ANSI sets',
    lightLogic:
      'make light emerge from display technology, pixel value steps, CRT bloom, palette cycling, thermal print contrast, or vector beam brightness',
    materialLogic:
      'surface detail should show pixels, dithering, scanlines, quantization, vertex wobble, dot matrix, LCD grid, CRT persistence, or paper-print degradation',
    compositionLogic:
      'compose through tile maps, sprite scale, fixed-resolution framing, isometric grids, wireframe coordinate space, UI geometry, or screen-proportion constraints',
    moodLogic:
      'derive mood from hardware limitation, arcade spectacle, handheld intimacy, terminal austerity, console nostalgia, or broken early-3D instability',
    finishLogic:
      'finish with faithful era constraints, crisp readability at small scale, and no modern high-resolution smoothing unless the preset asks for baked pre-rendering',
    defaultCue:
      'era-specific hardware limits, constrained palette behavior, visible display artifacts, and sprite or screen logic',
    avoidRules: [
      'modern high-res smoothing',
      'fake readable UI text',
      'generic emulator screenshot',
      'unlimited color render',
    ],
  },
  'game-art-directions-and-ui': {
    frame:
      'game-art direction system built from playable readability, UI or asset grammar, role clarity, production polish, and genre-specific visual feedback',
    subjectLogic:
      'preserve the prompt subject while routing it through tile readability, icon clarity, splash rendering, interface material, sprite bounce, shadow zones, or encounter pressure',
    colorLogic:
      'use color as gameplay hierarchy: rarity glow, faction contrast, tactical coding, seasonal warmth, horror warmth, neon route color, or readable inventory material',
    lightLogic:
      'shape light through game readability: rim separation, UI glow, static-camera dread, foil flare, ability-color drama, safe-zone warmth, or velocity streaks',
    materialLogic:
      'surface detail should support genre grammar through parchment, HUD glass, pixel atlas texture, tarnished metal, foil frame, arsenal bevels, or cozy handmade material',
    compositionLogic:
      'compose through gameplay-facing hierarchy, atlas consistency, menu rhythm, parallax layers, tactical grid, encounter scale, or selection-screen energy',
    moodLogic:
      'derive mood from playable stakes, collection desire, tactical control, cozy routine, survival dread, arcade speed, or heroic confrontation',
    finishLogic:
      'finish with game-production clarity, strong silhouettes, controlled UI-like detail, and no unreadable screenshot clutter',
    defaultCue:
      'gameplay-readable hierarchy, genre-specific surface language, UI-aware composition, and production-art clarity',
    avoidRules: [
      'readable UI text',
      'logo clutter',
      'generic screenshot',
      'unplayable visual clutter',
    ],
  },
};

const commonAvoidRules = [
  'wrong medium',
  'generic AI gloss',
  'muddy noise',
  'uncontrolled texture chatter',
  'watermark',
  'readable text',
  'signature',
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
    /\breusable Essential Art Styles visual language\b/i,
    /\bDefine .+ through line, mass, contour, spacing, and rhythm\b/i,
    /\bUse a .+(?:-| )specific palette with clear dominant\b/i,
    /\bUse lighting that makes .+ recognizable\b/i,
    /\bUse materials and textures that reinforce\b/i,
    /\bUse spatial behavior that fits\b/i,
    /\bSet a mood that belongs to\b/i,
    /\bRender .+ with high production clarity\b/i,
    /\bPrioritize .+'s key features\b/i,
    /\bCreate a style-card that translates\b/i,
  ].some((pattern) => pattern.test(value));
}

function sanitizeSceneLockWords(value: string) {
  return value
    .replace(/\bbackgrounds?\b/gi, 'support field')
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
    .replace(/\bchapels?\b/gi, 'sacred-scale enclosure')
    .replace(/\bcastles?\b/gi, 'fortification scale')
    .replace(/\bramps?\b/gi, 'elevated edge structure')
    .replace(/\bramparts?\b/gi, 'elevated edge structure')
    .replace(/\bruins?\b/gi, 'eroded structure')
    .replace(/\bshrines?\b/gi, 'ritual focus')
    .replace(/\bdungeons?\b/gi, 'subterranean pressure')
    .replace(/\btemples?\b/gi, 'ritual architecture')
    .replace(/\bstations?\b/gi, 'transit setting')
    .replace(/\bvillages?\b/gi, 'settlement texture')
    .replace(/\bships?\b/gi, 'vessels')
    .replace(/\barenas?\b/gi, 'contest geometry')
    .replace(/\bbattlefields?\b/gi, 'conflict terrain');
}

function cleanCue(value: string, fallback: string) {
  const compact = value.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
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

  return normalized in categoryLanguage ? normalized : 'traditional-painting';
}

function fallbackFor(
  manifest: StylePresetManifest,
  key: keyof StylePresetManifest['visualDna'] & string,
  language: ArtCategoryLanguage,
) {
  const subject = manifest.name;
  const fallbacks: Partial<Record<keyof StylePresetManifest['visualDna'] & string, string>> = {
    aesthetic: `${subject} ${language.defaultCue}`,
    subject_treatment: `adapt the requested subject through ${language.defaultCue} while preserving identity`,
    color_and_tone: `medium-native palette relationships, deliberate contrast, and accent restraint for ${subject}`,
    lighting_and_shadow: `process-led value structure, readable highlights, and medium-specific shadow behavior`,
    texture_and_material: language.defaultCue,
    camera_and_composition: `scale rhythm, edge hierarchy, spacing, and composition rules specific to ${subject}`,
    atmosphere_and_mood: `mood carried by ${subject} craft, material pressure, and visual restraint`,
    rendering_and_quality: `finished ${subject} craft with clear medium evidence and controlled detail`,
    key_features: language.defaultCue,
    creative_brief: `${subject} ${language.defaultCue}`,
  };

  return fallbacks[key] ?? `${subject} ${language.defaultCue}`;
}

function cueValues(manifest: StylePresetManifest, language: ArtCategoryLanguage) {
  const fallback = (key: keyof StylePresetManifest['visualDna'] & string) =>
    fallbackFor(manifest, key, language);

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
    features: cleanCue(visualValue(manifest, 'key_features'), fallback('key_features')),
  };
}

function isAlreadyEnriched(manifest: StylePresetManifest) {
  const aesthetic = visualValue(manifest, 'aesthetic');
  return (
    aesthetic.includes('transferable art-medium router') ||
    aesthetic.includes('game-art direction system router')
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

function buildArtDna(manifest: StylePresetManifest) {
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

  return {
    aesthetic: sentence(
      `${manifest.name} acts as a transferable art-medium router: start from ${leadCues.join(', ')} and ${language.frame}, then apply the medium behavior to prompt X instead of recreating a fixed demo image`,
    ),
    subject_treatment: sentence(
      `Transform any prompt subject through ${cue.subject}; ${language.subjectLogic}, keeping the requested identity, silhouette, pose, object function, or environment legible`,
    ),
    color_and_tone: sentence(
      `Build color with ${cue.color}; ${language.colorLogic}, with deliberate value grouping, accent control, and medium-specific limits rather than generic color wash`,
    ),
    lighting_and_shadow: sentence(
      `Handle light through ${cue.light}; ${language.lightLogic}, so value structure supports the medium and does not overwrite the requested content`,
    ),
    texture_and_material: sentence(
      `Render ${cue.texture}; ${language.materialLogic}, keeping material scale coherent and avoiding noisy filler texture`,
    ),
    camera_and_composition: sentence(
      `Structure the image through ${cue.composition}; ${language.compositionLogic}, with scale, spacing, edge rhythm, and visual hierarchy doing the style work`,
    ),
    atmosphere_and_mood: sentence(
      `Keep the mood ${cue.mood}; ${language.moodLogic}, letting the medium alter interpretation without demanding a specific story, location, or character`,
    ),
    rendering_and_quality: sentence(
      `Finish with ${cue.finish}; ${language.finishLogic}, clean denoised surfaces where appropriate, and enough craft evidence to make the medium recognizable`,
    ),
    key_features: featureCues.join('; '),
    creative_brief: sentence(
      `Apply ${manifest.name} as an art-style preset over prompt X: preserve the user's requested subject, then route mark-making, palette, surface, composition, mood, and final craft through ${briefCues} without requiring the card image's original subject`,
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

function shouldAllowLowResolution(manifest: StylePresetManifest) {
  return (
    categoryId(manifest) === 'retro-game-visual-systems' ||
    /\b(pixel|ascii|voxel|game boy|low[- ]res|ds flipnote|camera thermal print)\b/i.test(
      manifest.name,
    )
  );
}

function inheritedAvoidRules(manifest: StylePresetManifest) {
  const allowLowResolution = shouldAllowLowResolution(manifest);

  return (manifest.avoidRules ?? []).filter((rule) => {
    const normalized = rule.trim().toLowerCase();
    if (allowLowResolution && normalized === 'low resolution') return false;
    return true;
  });
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
      ...buildArtDna(sourceManifest),
    };
    manifest.avoidRules = uniqueRules([
      ...inheritedAvoidRules(manifest),
      ...commonAvoidRules,
      ...language.avoidRules,
    ]);
    manifest.attributes = {
      ...manifest.attributes,
      negativePrompt: manifest.avoidRules.join(', '),
    };

    changed += 1;

    if (dryRun) {
      console.log(`[pack06:dna] would update ${manifest.id} ${manifest.name}`);
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

  console.log(`[pack06:dna] ${dryRun ? 'dry-run' : 'updated'} presets=${changed}`);
}

await main();
