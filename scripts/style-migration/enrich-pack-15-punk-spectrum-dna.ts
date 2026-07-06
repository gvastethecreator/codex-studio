import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import * as yaml from 'js-yaml';

import type { StylePresetManifest } from '../../components/recipes/styles/manifestTypes';

const packId = 'pack_15';
const presetDir = path.join(
  process.cwd(),
  'components',
  'recipes',
  'styles',
  'manifests',
  'presets',
  packId,
);

interface CategoryPunkLanguage {
  routerRole: string;
  subjectSystem: string;
  paletteLogic: string;
  lightLogic: string;
  materialLogic: string;
  compositionLogic: string;
  moodLogic: string;
  finishLogic: string;
  defaultAvoid: string[];
}

const categoryLanguage: Record<string, CategoryPunkLanguage> = {
  'classic-industrial-punks': {
    routerRole:
      'industrial-retrofuture punk grammar with visible labor systems, mechanical silhouettes, public engineering, soot-softened graphic planes, and utility-first rebellion',
    subjectSystem:
      'gear-scale massing, valve rhythm, rivet restraint, belt or rail geometry, worker-poster contour, and machine-adjacent costume or surface logic',
    paletteLogic:
      'smoky brass, tarnished copper, oil umber, rail black, aged ivory, pressure red, and warm cream value blocks',
    lightLogic:
      'amber machine glow, steam-diffused shadow, furnace rim, gauge-color pinpoints, and posterized industrial bounce',
    materialLogic:
      'brass plates, cast iron, leather belts, enamel gauges, soot washes, heavy paper grain, glass dots, and controlled worn edges',
    compositionLogic:
      'large readable machinery rhythm, labor-poster spacing, civic scale cues, diagonal belt paths, and open negative space around the requested subject',
    moodLogic:
      'defiant craft, collective utility, late-shift pressure, practical optimism, machine reverence, and civic invention',
    finishLogic:
      'screenprint-to-gouache industrial illustration with denoised soot, clean dark-gray shadows, broad shapes, and no rivet-noise overload',
    defaultAvoid: ['Victorian room lock', 'dense machinery wallpaper', 'tiny rivets everywhere'],
  },
  'neon-net-and-signal-punks': {
    routerRole:
      'network punk grammar with mesh communication, neon signal pressure, hacker-adjacent DIY systems, rain glass, drones, and cooperative circuitry',
    subjectSystem:
      'signal bands, cable paths, antenna arcs, mesh-node grouping, rain-slick contour, improvised electronics, and data-lit body or object edges',
    paletteLogic:
      'cyan rain, magenta signal, black ice, acid green, electric blue, violet shadow, wet concrete gray, and small safety-color accents',
    lightLogic:
      'neon spill, monitor glow, rain reflection, signal pulse, drone LEDs, firewall bloom, and cold rim separation',
    materialLogic:
      'glass, wet plastic, taped circuit boards, cable bundles, matte rubber, spray paint, antenna metal, and soft digital bloom',
    compositionLogic:
      'mesh-like spacing, compressed signal lanes, overhead cable arcs, node clusters, and readable subject dominance without forced alley or server-room staging',
    moodLogic:
      'paranoid speed, illicit coordination, humid intimacy, cooperative defense, cold precision, and electric street-level pressure',
    finishLogic:
      'clean neon-punk illustration with controlled glow, readable circuitry, denoised rain texture, and no fake readable UI',
    defaultAvoid: ['fake readable UI', 'server-room dependency', 'generic cyberpunk alley'],
  },
  'eco-repair-and-climate-punks': {
    routerRole:
      'repair-climate punk grammar with civic stewardship, solar shade, recycled infrastructure, drought adaptation, seed archives, rain systems, and optimistic constraint',
    subjectSystem:
      'repair seams, modular shade panels, civic tool marks, reused materials, plant-tech edges, condensation systems, and cooperative maintenance silhouettes',
    paletteLogic:
      'sun yellow, sage, white ceramic, recycled aluminum, dry ochre, leaf green, rain blue, and calm public-service neutrals',
    lightLogic:
      'hard solar panels of light, greenhouse diffusion, rain reflections, condenser glow, shade-cloth cuts, and bright civic air',
    materialLogic:
      'ceramic tile, repaired metal, woven shade cloth, seedlings, rain pipes, recycled plastic, aluminum frames, and chalky dust',
    compositionLogic:
      'civic repair hierarchy, canopy rhythm, modular infrastructure, readable maintenance paths, and generous space around the prompt subject',
    moodLogic:
      'organized optimism, public care, dry resilience, communal invention, practical tenderness, and climate-aware patience',
    finishLogic:
      'bright solarpunk/repair illustration with clean surfaces, restrained texture, no beige sameness, and no generic glass-utopia gloss',
    defaultAvoid: ['generic glass utopia', 'greenwashing postcard', 'beige eco mood board'],
  },
  'bio-myco-and-body-punks': {
    routerRole:
      'bio/myco/body punk grammar with symbiosis, living infrastructure, care-tech unease, spore weather, organic circuitry, and soft mutation discipline',
    subjectSystem:
      'root-vein routing, mycelial branching, rib-like supports, nerve loom lines, chloroplast panels, surgical care cues, and living-surface transformation',
    paletteLogic:
      'mycelium cream, chlorophyll green, nerve pink, surgical teal, graphite, damp umber, spore gold, and soft white contrasts',
    lightLogic:
      'bioluminescent underglow, clinic-soft fill, fungal halo, canopy-filtered light, wet specular points, and careful tissue-safe rim',
    materialLogic:
      'mycelium mats, translucent membranes, living ribs, nerve fibers, wet bark, petri-glass accents, spores, and organic circuit lattices',
    compositionLogic:
      'branching growth paths, care-procedure spacing, symbiotic halos, living scaffold rhythm, and body/object integration without gore dependency',
    moodLogic:
      'uncanny compassion, humid care, biological intimacy, ecological intelligence, soft dread, and experimental tenderness',
    finishLogic:
      'denoised biopunk illustration with controlled organic texture, readable anatomy or object structure, and no gore-shock shortcut',
    defaultAvoid: ['gore shock', 'body horror only', 'random tentacle clutter'],
  },
  'ocean-ice-and-terrain-punks': {
    routerRole:
      'oceanic, glacial, and terrain punk grammar with pressure systems, tidal infrastructure, cold data shelters, moss signal craft, and weather-built engineering',
    subjectSystem:
      'coral circuitry, pressure-line contour, shell canopy rhythm, kelp signage, ice-glass facets, salt-kite rigging, moss radio texture, and brackish edges',
    paletteLogic:
      'coral pink, tideglass blue, shell white, kelp green, glacier cobalt, salt white, rust, slate, and deep water shadow',
    lightLogic:
      'underwater caustics, lantern warmth, shell-filtered daylight, glacier bounce, tide reflection, salt glare, and cold data glow',
    materialLogic:
      'coral ceramic, wet rope, shell laminate, kelp plastic, ice crust, salt film, moss felt, brass pipe, and worn marine metal',
    compositionLogic:
      'pressure-line diagonals, tide-level bands, canopy arcs, shelter-depth layering, wind-rig rhythm, and stable subject clarity',
    moodLogic:
      'brackish civic motion, remote discipline, storm resilience, wind-driven invention, cold refuge, and tidal resourcefulness',
    finishLogic:
      'clean terrain-punk illustration with readable weather materials, controlled wet highlights, and no noisy dark texture mesh',
    defaultAvoid: [
      'generic underwater fantasy',
      'dark noisy texture mesh',
      'empty seascape postcard',
    ],
  },
  'street-riot-and-diy-punks': {
    routerRole:
      'DIY public-punk grammar with pasted graphics, generator motion, barricade voltage, scrapbike cargo, rave care, patch pressure, and mutual-aid pragmatism',
    subjectSystem:
      'paste-layer edges, cable-tied equipment, plywood planes, sticker stacks, patch geometry, generator vibration, cargo straps, and care-station clarity',
    paletteLogic:
      'photocopy black, paper cream, magenta voltage, plywood brown, laser green, concrete gray, sticker reds, and electric blue accents',
    lightLogic:
      'portable floodlight, screen glow, welding spark, sodium haze, laser slices, generator glare, and sticker-gloss highlights',
    materialLogic:
      'torn paper, tape, plywood, cable ties, vinyl stickers, patched fabric, bike metal, plastic crates, and concrete scuffs',
    compositionLogic:
      'layered poster rhythm, improvised equipment paths, tight public pressure, cargo diagonals, and bold subject hierarchy without crowd dependency',
    moodLogic:
      'scrappy defiance, communal protection, loud improvisation, nocturnal urgency, practical care, and hand-built resistance',
    finishLogic:
      'graphic DIY-punk illustration with readable paste layers, controlled grit, large value blocks, and no generic riot-photo realism',
    defaultAvoid: ['riot-photo realism', 'random crowd chaos', 'brand-logo sticker collage'],
  },
  'media-vapor-and-glitch-punks': {
    routerRole:
      'media/vapor/glitch punk grammar with CRT devotion, cassette weather, pirate broadcast stacks, mallsoft nostalgia, checker playfields, and analog signal ghosts',
    subjectSystem:
      'scanline contour, cassette-shell geometry, checker-grid planes, phosphor bloom, tape flutter, chrome trim, and broadcast-stack surface logic',
    paletteLogic:
      'cathode aqua, magenta, peach, violet, phosphor green, cream tile, black grid, and washed sunset gradients',
    lightLogic:
      'CRT glow, cabinet bloom, phosphor edge light, sunset-gradient spill, humid reflection, and analog monitor falloff',
    materialLogic:
      'screen glass, cabinet plastic, laminate, cassette tape, chrome trim, static grain, tile sheen, and controlled glitch bands',
    compositionLogic:
      'bold signal framing, checker or scanline depth, one clear subject anchor, offset broadcast stacks, and synthetic negative space',
    moodLogic:
      'dreamy analog unreality, playful nostalgia, eerie devotion, humid retro intimacy, synthetic haze, and media-haunted tenderness',
    finishLogic:
      'clean vapor/glitch illustration with denoised static, readable analog artifacts, no fake readable text, and no empty gradient card',
    defaultAvoid: ['empty gradient card', 'fake readable text', 'generic synthwave wallpaper'],
  },
  'occult-myth-and-gothic-punks': {
    routerRole:
      'occult/gothic punk grammar with ritual electronics, tarot circuitry, relay arches, necrophone craft, vampire data elegance, and folk-horror signal hum',
    subjectSystem:
      'ritual-circuit framing, horn or arch silhouettes, bone-lime accents, black cable lace, divination geometry, antique device edges, and symbolic current',
    paletteLogic:
      'velvet black, oxblood, tarnished silver, sickly green, saffron, ivory, turquoise, chrome, and cold white ritual accents',
    lightLogic:
      'candle-to-neon contrast, moon rim, phosphor glow, relay indicator beads, ritual warning light, and low antique-device illumination',
    materialLogic:
      'bakelite, tarnished wire, bone-lime ceramic, velvet blocks, straw, galvanized metal, carved wood, ribbon, and occult signal marks',
    compositionLogic:
      'ritual symmetry, gothic arch rhythm, signal-device spacing, card-like emblem balance, and severe subject clarity without altar dependency',
    moodLogic:
      'romantic severity, analog haunt, tender repair, ceremonial machinery, decadent danger, and grounded superstition',
    finishLogic:
      'denoised gothic-punk illustration with disciplined darkness, readable symbolic current, and no candle-room or altar lock',
    defaultAvoid: ['altar lock', 'candle-room dependency', 'generic vampire portrait'],
  },
  'space-atomic-and-ray-punks': {
    routerRole:
      'space/atomic/ray punk grammar with rocket-age curves, isotope glow, reactor leisure, orbit chrome, plasma transit, lunar cultivation, and optimistic danger',
    subjectSystem:
      'atomic signage, chrome arcs, rocket-fin wedges, pressure suit seams, lunar greenhouse edges, plasma rails, tether curves, and vacuum-clean silhouette',
    paletteLogic:
      'uranium green, coral red, chrome silver, cream, star blue, cherry red, moon white, brushed steel, and vacuum black',
    lightLogic:
      'reactor glow, blue-hour neon, observation-window light, plasma bloom, lunar bounce, panel glow, and chrome-reflection cuts',
    materialLogic:
      'chrome blocks, enamel panels, vinyl bands, glass blocks, brushed steel, coolant glass, vacuum fabric, and clean atomic decals without readable text',
    compositionLogic:
      'orbit curves, ray-age wedges, sleek public transit rhythm, spherical depth cues, and confident subject spacing without diner or vehicle dependency',
    moodLogic:
      'bright civic weirdness, touristic optimism, nocturnal fun, clinical danger, lunar fragility, and retrofuturist social energy',
    finishLogic:
      'flat-to-painterly raypunk illustration with clean chrome shapes, denoised glow, matte blacks, and no glossy car-ad realism',
    defaultAvoid: ['glossy car ad', 'diner dependency', 'readable signage'],
  },
  'primitive-stone-and-salvage-punks': {
    routerRole:
      'primitive/stone/salvage punk grammar with low-tech engines, carved mechanics, rope kinetics, mud-brick power, bone signal rigs, and windcraft reuse',
    subjectSystem:
      'flint planes, basalt massing, rope geometry, carved wheels, rawhide lashings, mud-brick modules, sailcloth patches, and hand-built power logic',
    paletteLogic:
      'flint gray, clay red, rawhide tan, ochre, tar gray, storm blue, copper green, bone white, smoke black, and sea blue',
    lightLogic:
      'firelight blocks, smoky daylight, polished stone glints, water reflections, storm rim, and warm clay bounce',
    materialLogic:
      'flint facets, basalt blocks, hide, rope, carved wood, mud brick, driftwood, patched canvas, copper stains, and smoke-softened edges',
    compositionLogic:
      'compact engine rhythm, lash-and-wheel diagonals, windcraft arcs, ritual timing channels, and clear subject scale without market or stall lock',
    moodLogic:
      'primal invention, tactile tradecraft, stark mobility, ancient precision, communal warmth, and rough salvage optimism',
    finishLogic:
      'drawn salvage-punk illustration with clean matte surfaces, denoised smoke, low-to-moderate detail, and no dusty photoreal survivalism',
    defaultAvoid: ['dusty photoreal survivalism', 'market stall lock', 'skull-and-bone cliche'],
  },
};

const genericPatterns = [
  /\bvisual language with a clear stylistic thesis\b/i,
  /\bCreate a style-card that translates\b/i,
  /\bPreserve the preset identity through style mechanics\b/i,
  /\bUse a controlled palette that supports\b/i,
  /\bcategory-appropriate color accents\b/i,
  /\bShape light and shadow for\b/i,
  /\bRender surfaces with\b.*\bmaterial logic\b/i,
  /\bCompose with\b.*\bstaging logic\b/i,
  /\bstable readable framing\b/i,
  /\bBuild\b.*\bmood through environment, color, light, and texture\b/i,
  /\bFinish as a polished\b.*\bstyle-card\b/i,
];

const routerSafeReplacements: Array<[RegExp, string]> = [
  [/\bstyle-card\b/gi, 'style sample'],
  [/\bthumbnail\b/gi, 'sample image'],
  [/\bforeground\b/gi, 'near-plane'],
  [/\bbackground\b/gi, 'distant-plane'],
  [/\bstreet\b/gi, 'public-style'],
  [/\bmarket\b/gi, 'commerce-system'],
  [/\bstall\b/gi, 'trade setup'],
  [/\broom\b/gi, 'interior-system'],
  [/\balley\b/gi, 'urban passage'],
];

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

function isGeneric(value: string) {
  return genericPatterns.some((pattern) => pattern.test(value));
}

function routerSafe(value: string) {
  return routerSafeReplacements
    .reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value)
    .replace(/\s+/g, ' ')
    .trim();
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

  return normalized in categoryLanguage ? normalized : 'classic-industrial-punks';
}

function isAlreadyEnriched(manifest: StylePresetManifest) {
  return visualValue(manifest, 'aesthetic').includes('portable punk-spectrum router');
}

function cleanCue(value: string) {
  const compact = routerSafe(value)
    .replace(/\.$/, '')
    .replace(/\bonto arbitrary prompt subjects\b/gi, 'across prompt subjects')
    .replace(/\bas the anchor\b/gi, 'as the anchor-form')
    .replace(/^Treat any subject as\s+/i, '')
    .replace(/^Treat the requested subject as\s+/i, '')
    .replace(/^requested subject as the anchor-form,\s*then\s*/i, '')
    .replace(/^Compose with\s+/i, '')
    .replace(/\bTransferable\b/gi, 'transferable')
    .trim();

  if (!compact || isGeneric(compact)) return '';
  return compact;
}

function sourceCue(manifest: StylePresetManifest, key: string, fallback: string) {
  const value = cleanCue(visualValue(manifest, key));
  if (wordCount(value) >= 4) return value;
  return fallback;
}

function compareText(value: string) {
  return normalizeText(value);
}

function meaningfulTokens(value: string) {
  return new Set(
    normalizeText(value)
      .split(/\s+/)
      .filter(
        (token) =>
          token.length > 3 &&
          !['with', 'through', 'that', 'this', 'then', 'onto', 'plus', 'and', 'from'].includes(
            token,
          ),
      ),
  );
}

function combineCueAndLogic(cue: string, logic: string, connector: 'plus' | 'with') {
  const cleanCueText = routerSafe(cue);
  const cleanLogic = routerSafe(logic);
  const cueText = compareText(cleanCueText);
  const logicText = compareText(cleanLogic);

  if (!cleanCueText) return cleanLogic;
  if (!cleanLogic) return cleanCueText;
  if (cueText === logicText) return cleanCueText;
  if (cueText.includes(logicText)) return cleanCueText;
  if (logicText.includes(cueText)) return cleanLogic;

  const cueTokens = meaningfulTokens(cleanCueText);
  const logicTokens = meaningfulTokens(cleanLogic);
  if (
    cueTokens.size >= 3 &&
    [...cueTokens].filter((token) => logicTokens.has(token)).length / cueTokens.size >= 0.75
  ) {
    return cleanLogic;
  }

  return `${cleanCueText} ${connector} ${cleanLogic}`;
}

function splitParts(value: string) {
  return value
    .replace(/\.$/, '')
    .split(/,\s*|;\s*/)
    .map((part) => routerSafe(part.trim()))
    .filter((part) => part.length > 2)
    .slice(0, 10);
}

function compactFeatureParts(parts: string[]) {
  const output: string[] = [];

  for (const part of parts.flatMap(splitParts)) {
    const normalized = compareText(part);
    if (
      output.some((existing) => {
        const existingNormalized = compareText(existing);
        return (
          existingNormalized === normalized ||
          existingNormalized.includes(normalized) ||
          normalized.includes(existingNormalized)
        );
      })
    ) {
      continue;
    }

    output.push(part);
  }

  return output.slice(0, 6);
}

function buildPunkDna(manifest: StylePresetManifest) {
  const language = categoryLanguage[categoryId(manifest)];
  const keyFeatureSeed =
    cleanCue(visualValue(manifest, 'key_features')) || `${manifest.name} motifs`;
  const alreadyEnriched = isAlreadyEnriched(manifest);
  const cue = alreadyEnriched
    ? {
        aesthetic: `${manifest.name} identity cues through ${keyFeatureSeed}`,
        subject: language.subjectSystem,
        color: language.paletteLogic,
        light: language.lightLogic,
        texture: language.materialLogic,
        composition: language.compositionLogic,
        mood: language.moodLogic,
        finish: language.finishLogic,
      }
    : {
        aesthetic: sourceCue(manifest, 'aesthetic', `${manifest.name} and ${language.routerRole}`),
        subject: sourceCue(manifest, 'subject_treatment', language.subjectSystem),
        color: sourceCue(manifest, 'color_and_tone', language.paletteLogic),
        light: sourceCue(manifest, 'lighting_and_shadow', language.lightLogic),
        texture: sourceCue(manifest, 'texture_and_material', language.materialLogic),
        composition: sourceCue(manifest, 'camera_and_composition', language.compositionLogic),
        mood: sourceCue(manifest, 'atmosphere_and_mood', language.moodLogic),
        finish: sourceCue(manifest, 'rendering_and_quality', language.finishLogic),
      };

  const aestheticBehavior = combineCueAndLogic(cue.aesthetic, language.routerRole, 'with');
  const subjectBehavior = combineCueAndLogic(cue.subject, language.subjectSystem, 'plus');
  const colorBehavior = combineCueAndLogic(cue.color, language.paletteLogic, 'plus');
  const lightBehavior = combineCueAndLogic(cue.light, language.lightLogic, 'plus');
  const textureBehavior = combineCueAndLogic(cue.texture, language.materialLogic, 'plus');
  const compositionBehavior = combineCueAndLogic(
    cue.composition,
    language.compositionLogic,
    'plus',
  );
  const moodBehavior = combineCueAndLogic(cue.mood, language.moodLogic, 'plus');
  const finishBehavior = combineCueAndLogic(cue.finish, language.finishLogic, 'plus');
  const featureParts = alreadyEnriched
    ? compactFeatureParts([
        keyFeatureSeed,
        language.subjectSystem,
        language.materialLogic,
        language.lightLogic,
        language.compositionLogic,
      ])
    : compactFeatureParts([
        visualValue(manifest, 'key_features'),
        cue.aesthetic,
        cue.subject,
        cue.texture,
        cue.light,
        cue.composition,
      ]);
  const featureBehavior = featureParts.join(', ');

  return {
    aesthetic: sentence(
      `${manifest.name} operates as a portable punk-spectrum router: combine ${aestheticBehavior}, so the preset supplies retrofit style behavior rather than a required venue, mascot, prop bundle, or card composition`,
    ),
    subject_treatment: sentence(
      `Preserve prompt X's subject, action, scale, and setting while translating forms through ${subjectBehavior}; motifs can become contour, surface, costume, equipment, atmosphere, or infrastructure without replacing the prompt`,
    ),
    color_and_tone: sentence(
      `Map color through ${colorBehavior}; keep dominant, support, and accent values readable, avoid muddy black, and let palette code materials, signals, climate, ritual, salvage, or repair pressure`,
    ),
    lighting_and_shadow: sentence(
      `Use ${lightBehavior}; lighting should reveal the punk system, preserve the user's subject, separate near and distant value planes, and avoid crushed blacks or noisy dark texture`,
    ),
    texture_and_material: sentence(
      `Render ${textureBehavior}; keep material scale coherent, surface marks motivated, and tactile details strong enough to route style without becoming pasted grunge`,
    ),
    camera_and_composition: sentence(
      `Compose through ${compositionBehavior} as reusable framing grammar for characters, creatures, objects, vehicles, environments, symbols, or full scenes without one required card layout`,
    ),
    atmosphere_and_mood: sentence(
      `Carry mood through ${moodBehavior}; the tone may become adult, romantic, violent, comic, sensual, eerie, civic, or strange when prompt X asks, while the punk family remains legible`,
    ),
    rendering_and_quality: sentence(
      `Finish with ${finishBehavior}; prioritize clean denoise, bold readable shapes, controlled grit, prompt preservation, no watermark, no readable text, and no generic concept-art polish`,
    ),
    key_features: featureParts.join('; '),
    creative_brief: sentence(
      `Use ${manifest.name} after prompt X as a transferable punk-spectrum layer: prompt X supplies subject, action, setting, tone, and intensity, while the preset supplies ${featureBehavior}, color logic, light response, material behavior, composition rhythm, mood pressure, and finish discipline without requiring a fixed venue, fixed cast, fixed machine, repeated prop bundle, or sample-card composition`,
    ),
  };
}

function uniqueRules(rules: string[]) {
  const normalized = new Set<string>();
  const output: string[] = [];

  for (const rule of rules) {
    const clean = routerSafe(rule.trim());
    if (!clean) continue;
    const key = normalizeText(clean);
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
    if (!force && isAlreadyEnriched(manifest)) continue;

    const language = categoryLanguage[categoryId(manifest)];
    const dna = buildPunkDna(manifest);
    manifest.visualDna = {
      ...manifest.visualDna,
      ...dna,
    };
    manifest.avoidRules = uniqueRules([
      ...(manifest.avoidRules ?? []),
      ...language.defaultAvoid,
      'fixed punk venue',
      'required mascot',
      'literal sample-card setup',
      'repeated prop bundle',
      'muddy black fields',
      'excessive noise',
      'watermark',
      'readable text',
    ]);
    manifest.attributes = {
      ...manifest.attributes,
      negativePrompt: uniqueRules([
        ...splitNegativePrompt(manifest.attributes?.negativePrompt),
        ...manifest.avoidRules,
        'prompt-literal card reuse',
        'generic cyberpunk wallpaper',
        'generic Western RPG card art',
      ]).join(', '),
    };

    changed += 1;

    if (dryRun) {
      console.log(`[pack15:dna] would update ${manifest.id} ${manifest.name}`);
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

  console.log(`[pack15:dna] ${dryRun ? 'dry-run' : 'updated'} presets=${changed}`);
}

await main();
