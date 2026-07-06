import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import * as yaml from 'js-yaml';

import type { StylePresetManifest } from '../../components/recipes/styles/manifestTypes';

const packId = 'pack_10';
const presetDir = path.join(
  process.cwd(),
  'components',
  'recipes',
  'styles',
  'manifests',
  'presets',
  packId,
);

interface CategoryAbstractLanguage {
  domain: string;
  transformation: string;
  subjectLogic: string;
  colorLogic: string;
  lightLogic: string;
  materialLogic: string;
  compositionLogic: string;
  moodLogic: string;
  finishLogic: string;
  avoidRules: string[];
}

const categoryLanguage: Record<string, CategoryAbstractLanguage> = {
  'geometric-abstraction': {
    domain: 'geometric abstraction system',
    transformation: 'planes, grids, vectors, optical order, and deliberate formal reduction',
    subjectLogic:
      'break, flatten, triangulate, align, tessellate, or rotate forms while keeping the prompt subject legible',
    colorLogic:
      'treat color as structural contrast, field separation, and rhythm rather than decorative wash',
    lightLogic:
      'keep light graphic and structural, with shadows simplified into value blocks or optical pressure',
    materialLogic:
      'surfaces should read as designed planes, ink, paint, paper, tile, or digital geometry, not pasted texture',
    compositionLogic:
      'favor axial tension, repeated modules, negative space, cropped planes, and deliberate balance or imbalance',
    moodLogic:
      'derive mood from rigor, optical tension, intellectual order, and abstraction pressure',
    finishLogic:
      'finish with crisp geometry, controlled edges, clean separations, and no accidental realism',
    avoidRules: ['realistic perspective', 'generic polygon filter'],
  },
  'fluid-and-organic': {
    domain: 'fluid and organic behavior system',
    transformation:
      'flow, branching, cellular membranes, diffusion, turbulence, and living surface logic',
    subjectLogic:
      'bend, pool, branch, bloom, spike, foam, or dissolve forms while preserving the prompt intent',
    colorLogic:
      'let hues follow fluid thickness, chemical bloom, interference, biological growth, or vapor density',
    lightLogic:
      'use reflection, translucency, subsurface scattering, glow, or backlit edges to reveal fluid structure',
    materialLogic:
      'surfaces need coherent viscosity, membranes, droplets, filaments, bubbles, grains, or particulate fields',
    compositionLogic:
      'favor flow direction, cellular repetition, eddies, radial forces, tendrils, and macro-to-wide scalability',
    moodLogic:
      'derive mood from instability, growth, toxicity, delicacy, pressure, and organic motion',
    finishLogic: 'finish with clean fluid physics, readable boundaries, and restrained micro-noise',
    avoidRules: ['stiff solids', 'muddy fluid mixing'],
  },
  'digital-glitch-and-noise': {
    domain: 'digital signal artifact system',
    transformation:
      'compression errors, scan hardware, pixel logic, channel shifts, and broken media encoding',
    subjectLogic:
      'corrupt, quantize, sort, smear, scan, posterize, or channel-split forms without losing silhouette intent',
    colorLogic:
      'bind color to device behavior: phosphor masks, CMYK dots, RGB offsets, tape bleed, or indexed palettes',
    lightLogic:
      'make light feel emitted, scanned, clipped, banded, or sampled rather than normally photographed',
    materialLogic:
      'texture should come from pixels, scanlines, blocks, dither matrices, data drag, or print dots',
    compositionLogic:
      'use raster alignment, artifact seams, frame tears, grid pressure, and controlled signal breakdown',
    moodLogic:
      'derive mood from damaged playback, obsolete interfaces, surveillance, latency, and media failure',
    finishLogic:
      'finish with intentional artifacts, sharp enough structure, and no random muddy AI noise',
    avoidRules: ['clean photo realism', 'random AI smear'],
  },
  'surrealism-and-dream': {
    domain: 'surreal symbolic transformation system',
    transformation:
      'impossible logic, dream scale, symbolic displacement, liminal staging, and psychic texture',
    subjectLogic:
      'bend, displace, fuse, haunt, miniaturize, exaggerate, or estrange prompt subjects without forcing a fixed scene',
    colorLogic:
      'use color as emotional unreliability, nostalgic drift, uncanny contrast, or symbolic temperature',
    lightLogic:
      'shape light through impossible shadows, memory haze, stage stillness, glow, fog, or dreamlike exposure',
    materialLogic:
      'surfaces should support the illusion with believable texture, collage edges, flesh-metal seams, or unreal smoothness',
    compositionLogic:
      'favor symbolic focal points, scale mismatch, empty thresholds, doubled images, and psychologically charged negative space',
    moodLogic:
      'derive mood from wonder, dread, absurdity, nostalgia, erotic tension, menace, or utopian unease when the prompt allows',
    finishLogic:
      'finish with deliberate weirdness, controlled realism, and no generic fantasy scene lock',
    avoidRules: ['literal fantasy scene lock', 'generic dream blur'],
  },
  'textile-and-ornamental-patterns': {
    domain: 'textile and ornamental pattern system',
    transformation:
      'motifs, repeats, weave logic, decorative grids, stitched marks, and surface ornament',
    subjectLogic:
      'wrap, embroider, tile, dye, weave, print, or camouflage forms while preserving the prompt subject underneath',
    colorLogic:
      'treat palette as dye, thread, ceramic pigment, woven banding, motif hierarchy, or cultural ornament logic',
    lightLogic:
      'use soft fabric light, glazed highlights, stitch shadows, woven occlusion, or flat printed illumination',
    materialLogic:
      'surface detail must follow yarn, fiber, glaze, dye bleed, thread crossings, repeat seams, or tile breaks',
    compositionLogic:
      'favor repeat rhythm, motif scale, borders, allover fields, woven diagonals, and pattern-to-subject adaptation',
    moodLogic:
      'derive mood from craft, ritual, fashion, domestic texture, camouflage, ornament, or folk memory',
    finishLogic:
      'finish with readable pattern scale, tactile detail, and no wallpaper pasted over the subject',
    avoidRules: ['generic wallpaper overlay', 'pattern pasted flat'],
  },
  'material-surface-textures': {
    domain: 'material surface transformation system',
    transformation:
      'physical surface grain, reflectance, damage, joinery, pores, seams, and tactile structure',
    subjectLogic:
      'coat, wrap, weather, polish, crack, scale, link, or embed forms while preserving the prompt composition',
    colorLogic:
      'let color follow material depth, veins, patina, oxidation, fiber direction, shimmer, or manufactured finish',
    lightLogic:
      'show reflectance honestly through gloss, matte falloff, iridescence, metallic shear, or micro-shadow',
    materialLogic:
      'surface behavior needs coherent grain, chips, cracks, pores, links, flakes, scales, strands, or inclusions',
    compositionLogic:
      'support macro texture studies and full-scene use through directional grain, repeat, drape, fracture, or patch rhythm',
    moodLogic:
      'derive mood from durability, luxury, decay, tactility, craft, armor, novelty, or contamination',
    finishLogic:
      'finish with material clarity, controlled micro-detail, and no stock texture pasted over forms',
    avoidRules: ['wrong material', 'generic stock texture'],
  },
  'diagram-and-data-systems': {
    domain: 'diagram and information-graphic system',
    transformation:
      'schematic paths, encoded blocks, contour logic, technical marks, and data-like organization',
    subjectLogic:
      'map, route, blueprint, annotate, contour, grid, or encode prompt subjects as information structure',
    colorLogic:
      'use palette as functional coding: substrate, traces, line hierarchy, contrast fields, or chalk/paper logic',
    lightLogic:
      'keep light diagrammatic, flat, backlit, chalky, or technical so structure remains readable',
    materialLogic:
      'marks should feel like ink, chalk, copper, pixels, contour lines, drafting strokes, or printed substrate',
    compositionLogic:
      'favor legible routes, modules, legends without readable text, edge registration, grids, and information density',
    moodLogic:
      'derive mood from analysis, navigation, computation, instruction, secrecy, or handmade classroom energy',
    finishLogic:
      'finish with clean information hierarchy, exact line weight, and no random label soup',
    avoidRules: ['random text labels', 'unreadable diagram clutter'],
  },
  'point-mosaic-and-glass-systems': {
    domain: 'discrete mark, mosaic, and glass segmentation system',
    transformation:
      'dots, tiles, grout, lead came, optical mixing, and segmented luminous surfaces',
    subjectLogic:
      'rebuild forms from dots, glass cells, tile units, grout lines, or lead outlines while preserving silhouette',
    colorLogic:
      'use color as optical mixing, glass translucency, tile pigment, grout contrast, and luminous segmentation',
    lightLogic:
      'shape light through dot vibration, tile highlights, stained-glass glow, or shallow relief shadow',
    materialLogic:
      'surfaces require individual marks, tile gaps, lead seams, pigment density, and unit-to-unit variation',
    compositionLogic:
      'favor readable silhouettes, local unit scale changes, tessellated flow, and segmented rhythm',
    moodLogic:
      'derive mood from craft, sacred light, optical vibration, public art, and patient mark-making',
    finishLogic:
      'finish with coherent units, controlled outlines, and no blurred pseudo-mosaic mush',
    avoidRules: ['blurred mush', 'continuous brush rendering'],
  },
  'print-and-light-finishes': {
    domain: 'print finish and luminous line system',
    transformation:
      'embossing, debossing, foil reflectance, neon tubing, ink pressure, and premium substrate logic',
    subjectLogic:
      'outline, stamp, emboss, deboss, gild, illuminate, or impress prompt subjects without replacing them with signage',
    colorLogic:
      'treat color as ink, paper, metallic foil, dark-field glow, warm tube light, or substrate contrast',
    lightLogic:
      'make highlights come from reflective foil, depressed paper shadows, glow falloff, or luminous glass tubes',
    materialLogic:
      'surface detail should show paper tooth, pressed edges, metallic shear, tube thickness, or ink bite',
    compositionLogic:
      'favor iconic line hierarchy, negative space, premium print registration, and tactile depth cues',
    moodLogic:
      'derive mood from craft, nightlife, luxury, signage, invitation design, and tactile production',
    finishLogic:
      'finish with precise physical process, controlled glow or impression depth, and no fake text layout',
    avoidRules: ['fake readable text', 'flat sticker look'],
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

function cleanCue(value: string) {
  const compact = value.replace(/\s+/g, ' ').trim();
  const composeMatch = compact.match(/^Compose for .+? using its key spatial cues:\s*(.+?)\.?$/i);
  const subjectMatch = compact.match(/^Treat subjects through .+?'s signature cues:\s*(.+?)\.?$/i);
  const cue = composeMatch?.[1] ?? subjectMatch?.[1] ?? compact;
  return cue.replace(/\.$/, '').trim();
}

function extractBetween(value: string, start: RegExp, end: RegExp) {
  const startMatch = value.match(start);
  if (startMatch?.index === undefined) return '';
  const afterStart = value.slice(startMatch.index + startMatch[0].length);
  const endMatch = afterStart.match(end);
  return (endMatch ? afterStart.slice(0, endMatch.index) : afterStart).trim();
}

function isAlreadyEnriched(manifest: StylePresetManifest) {
  const aesthetic = visualValue(manifest, 'aesthetic');
  return (
    aesthetic.includes('transferable') &&
    (aesthetic.includes('system') || aesthetic.includes('style router'))
  );
}

function cueValues(manifest: StylePresetManifest) {
  const featureParts = visualValue(manifest, 'key_features')
    .split(';')
    .map(cleanCue)
    .filter((part) => part.length > 0 && wordCount(part) <= 8);
  const enriched = isAlreadyEnriched(manifest) && featureParts.length >= 7;
  const hasMoodAndFinish = featureParts.length >= 9;

  return {
    aesthetic: enriched
      ? featureParts[0]
      : cleanCue(visualValue(manifest, 'aesthetic')) || manifest.name,
    subject: enriched
      ? featureParts[1]
      : cleanCue(visualValue(manifest, 'subject_treatment')) || manifest.name,
    color: enriched
      ? featureParts[2]
      : cleanCue(visualValue(manifest, 'color_and_tone')) || manifest.name,
    light: enriched
      ? featureParts[3]
      : cleanCue(visualValue(manifest, 'lighting_and_shadow')) || manifest.name,
    texture: enriched
      ? featureParts[4]
      : cleanCue(visualValue(manifest, 'texture_and_material')) || manifest.name,
    composition: enriched
      ? featureParts[5]
      : cleanCue(visualValue(manifest, 'camera_and_composition')) || manifest.name,
    mood: hasMoodAndFinish
      ? featureParts[6]
      : cleanCue(
          extractBetween(
            visualValue(manifest, 'atmosphere_and_mood'),
            /^Use\s+/i,
            /\sas the emotional register/i,
          ),
        ) ||
        cleanCue(visualValue(manifest, 'atmosphere_and_mood')) ||
        manifest.name,
    finish: hasMoodAndFinish
      ? featureParts[7]
      : cleanCue(
          extractBetween(visualValue(manifest, 'rendering_and_quality'), /^Resolve as\s+/i, /:/),
        ) ||
        cleanCue(visualValue(manifest, 'rendering_and_quality')) ||
        manifest.name,
    features: enriched
      ? hasMoodAndFinish
        ? featureParts[8]
        : featureParts[6]
      : cleanCue(visualValue(manifest, 'key_features')) || manifest.name,
    brief: visualValue(manifest, 'creative_brief'),
  };
}

function normalizedCategoryId(manifest: StylePresetManifest) {
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

  return normalized in categoryLanguage ? normalized : 'geometric-abstraction';
}

function sentence(value: string) {
  return value.endsWith('.') ? value : `${value}.`;
}

function normalizedCue(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function cueList(values: string[]) {
  const output: string[] = [];

  for (const value of values) {
    const clean = cleanCue(value);
    if (!clean) continue;
    const normalized = normalizedCue(clean);
    const duplicate = output.some((existing) => {
      const existingNormalized = normalizedCue(existing);
      return (
        existingNormalized === normalized ||
        existingNormalized.includes(normalized) ||
        normalized.includes(existingNormalized)
      );
    });
    if (!duplicate) output.push(clean);
  }

  if (output.length <= 1) return output[0] ?? '';
  if (output.length === 2) return `${output[0]} and ${output[1]}`;
  return `${output.slice(0, -1).join(', ')}, and ${output[output.length - 1]}`;
}

function buildAbstractDna(manifest: StylePresetManifest) {
  const language = categoryLanguage[normalizedCategoryId(manifest)];
  const cue = cueValues(manifest);
  const aestheticCues = cueList([cue.aesthetic, cue.features, cue.composition]);

  return {
    aesthetic: sentence(
      `${manifest.name} becomes a transferable ${language.domain}: start from ${aestheticCues}, then route prompt content through ${language.transformation} without forcing one card scene`,
    ),
    subject_treatment: sentence(
      `Keep the user's subject recognizable while using ${cue.subject} to ${language.subjectLogic}; preserve anatomy, object identity, or scene intent beneath the abstraction`,
    ),
    color_and_tone: sentence(
      `Build the palette from ${cue.color}; ${language.colorLogic}, with enough value control that the subject remains readable after the style layer is applied`,
    ),
    lighting_and_shadow: sentence(
      `Let ${cue.light} drive the light response: ${language.lightLogic}, avoiding generic glamour lighting unless the prompt explicitly asks for it`,
    ),
    texture_and_material: sentence(
      `Render ${cue.texture} as the tactile or mark-making basis; ${language.materialLogic}, scaled to figures, props, spaces, or close material studies`,
    ),
    camera_and_composition: sentence(
      `Compose around ${cue.composition} as reusable spatial grammar: ${language.compositionLogic}, adapting cleanly to portraits, objects, environments, and action scenes`,
    ),
    atmosphere_and_mood: sentence(
      `Use ${cue.mood} as the emotional register; ${language.moodLogic}, without flattening strong, strange, darker, or adult prompt intent when it is relevant`,
    ),
    rendering_and_quality: sentence(
      `Resolve as ${cue.finish}: ${language.finishLogic}, preserving prompt X as the base content and the preset as the style router`,
    ),
    key_features: `${cue.aesthetic}; ${cue.subject}; ${cue.color}; ${cue.light}; ${cue.texture}; ${cue.composition}; ${cue.mood}; ${cue.finish}; ${cue.features}`,
    creative_brief:
      wordCount(cue.brief) >= 18
        ? cue.brief
        : sentence(
            `Apply ${manifest.name} as a transferable abstract or experimental style layer over prompt X: preserve the user's subject, then route structure, palette, light, marks, and finish through this preset`,
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

    const language = categoryLanguage[normalizedCategoryId(manifest)];
    manifest.visualDna = {
      ...manifest.visualDna,
      ...buildAbstractDna(manifest),
    };
    manifest.avoidRules = uniqueRules([
      ...(manifest.avoidRules ?? []),
      ...language.avoidRules,
      'literal card scene',
      'style-card boilerplate',
      'muddy noise',
      'watermark',
    ]);
    manifest.attributes = {
      ...manifest.attributes,
      negativePrompt: manifest.avoidRules.join(', '),
    };

    changed += 1;

    if (dryRun) {
      console.log(`[pack10:dna] would update ${manifest.id} ${manifest.name}`);
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

  console.log(`[pack10:dna] ${dryRun ? 'dry-run' : 'updated'} presets=${changed}`);
}

await main();
