import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import * as yaml from 'js-yaml';

import type { StylePresetManifest } from '../../components/recipes/styles/manifestTypes';

const packId = 'pack_05';
const presetDir = path.join(
  process.cwd(),
  'components',
  'recipes',
  'styles',
  'manifests',
  'presets',
  packId,
);

interface CategoryBattleLanguage {
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

const categoryLanguage: Record<string, CategoryBattleLanguage> = {
  'modern-shonen-and-action': {
    routerRole:
      'modern action anime grammar with power-system clarity, impact frames, elastic motion, expressive line economy, and high-readability spectacle',
    subjectSystem:
      'dynamic contour, force-transfer anatomy, readable power effects, sharp costume or surface simplification, and emotion-first pose energy',
    paletteLogic:
      'saturated action accents, clean dark-light value separation, aura color, bloodless impact contrast, school or street neutrals when useful, and crisp white energy cuts',
    lightLogic:
      'impact flashes, hard cel shadows, aura bloom, neon or lantern rim, speed-streak highlights, and dramatic close-read separation',
    materialLogic:
      'inked speed marks, cloth snap, dust, smoke, sparks, grit, sweat highlights, painted debris, and controlled effect overlays',
    compositionLogic:
      'diagonal attack lanes, close impact crops, reaction spacing, burst panels, compressed depth, and readable near-to-far force paths',
    moodLogic:
      'adrenaline, rivalry, courage, comic rupture, desperation, tactical focus, and heightened emotional release',
    finishLogic:
      'clean high-energy anime finish with denoised effects, stable anatomy, crisp silhouettes, no manga-panel text, and no cheap AI anime smear',
    defaultAvoid: ['photoreal cosplay', 'western superhero comic', 'generic shonen screenshot'],
  },
  'mecha-and-cyberpunk': {
    routerRole:
      'mecha and cyberpunk anime grammar with engineered silhouettes, hardware logic, neon atmosphere, cockpit-independent scale, and machine-emotion tension',
    subjectSystem:
      'armored contour, mechanical massing, modular joints, engineered surface rhythm, scale cues, and human-machine pressure translated onto any subject',
    paletteLogic:
      'cyan, magenta, warning red, signal green, alloy gray, oil black, sterile white, coral glow, and disciplined emissive accents',
    lightLogic:
      'neon spill, monitor glow, beam flares, hangar rim, warning lights, hard industrial shadow, and silhouette-defining reflection',
    materialLogic:
      'painted alloy, ceramic armor, scuffed plating, glass, hydraulic grime, cables, dust, circuitry, rain sheen, and digital bloom layers',
    compositionLogic:
      'scale compression, machinery diagonals, grid overlays without readable UI, service-bay density, orbital symmetry, and high-speed hardware lanes',
    moodLogic:
      'operatic sacrifice, noir pressure, engineered dread, rebellion, machine grief, sterile command, and electric velocity',
    finishLogic:
      'premium mecha/cyber anime finish with readable hardware, denoised glow, no plastic 3D render, and no cockpit/control-room dependency',
    defaultAvoid: ['plastic 3d robot render', 'cockpit screenshot', 'readable UI panel'],
  },
  'isekai-and-high-fantasy': {
    routerRole:
      'isekai and high-fantasy anime grammar with magic-system readability, quest-world texture, luminous adventure, and character-independent fantasy routing',
    subjectSystem:
      'clear fantasy silhouettes, spell-effect hierarchy, surface simplification, creature or object readability, and portal-like transformation logic',
    paletteLogic:
      'jewel fantasy accents, warm torch or lantern tones, sky blues, herb greens, parchment neutrals, magical violets, and controlled pastel or dark contrast',
    lightLogic:
      'spell glow, lantern bounce, sky rim, sacred bloom, dungeon occlusion, jewel refraction, and clean fantasy atmosphere separation',
    materialLogic:
      'cloth, leather, polished armor, parchment, herbarium texture, stone, food steam, jewel glow, smoke, mud, and hand-painted fantasy surfaces',
    compositionLogic:
      'quest-path diagonals, transition thresholds, group-scale spacing without fixed cast, adventure-depth cues, symbolic magic geometry without readable glyphs, and storybook scale',
    moodLogic:
      'wonder, afterquest melancholy, dark reset pressure, absurd comedy, devotional craft, merchant-road warmth, and heroic underdog resolve',
    finishLogic:
      'clean fantasy-anime finish with stable anatomy and creature/object structure, controlled glow, no RPG UI, no readable magic text, and no generic isekai gloss',
    defaultAvoid: ['RPG UI', 'readable magic text', 'generic isekai wallpaper'],
  },
  'dark-fantasy-and-seinen': {
    routerRole:
      'dark fantasy and seinen anime grammar with moral pressure, heavy shadow, body unease, noir materiality, ritual dread, and mature visual restraint',
    subjectSystem:
      'scarred contour, restrained deformation, severe silhouettes, vulnerable posture, occult or noir edge language, and readable psychological pressure',
    paletteLogic:
      'charcoal black, rust red, bone, sickly neon, winter blue, mineral pale, dirty gold, and disciplined blood-or-danger accents',
    lightLogic:
      'low ritual glow, security red, winter overcast, neon despair, smoky bounce, blade-like rim, and deep occlusion with no crushed detail',
    materialLogic:
      'crosshatch grain, soot, concrete, wet fabric, oxidized metal, paper, ash, mineral fracture, blood-ink accents, and denoised grime',
    compositionLogic:
      'oppressive negative space, surveillance framing, ritual symmetry, fugitive diagonals, compressed civic space, and slow fatal closeups',
    moodLogic:
      'doom weight, suspicion, guilt, nihilism, compassion under violence, loneliness, retribution, and adult dread without gore shortcuts',
    finishLogic:
      'mature seinen finish with controlled darkness, stable structure, restrained texture, no splatter-only horror, no photoreal grime, and no watermark/text',
    defaultAvoid: ['splatter-only horror', 'photoreal grime', 'cheap jump scare'],
  },
  action: {
    routerRole:
      'portable anime action-setpiece grammar with motion vectors, impact timing, forced perspective, energy readability, and battle-keyframe clarity',
    subjectSystem:
      'motion-ready silhouette, directional force bands, impact-safe anatomy or object deformation, and readable effect hierarchy',
    paletteLogic:
      'high-contrast action color, electric accents, dark support values, flash whites, danger reds, and clean separation for speed',
    lightLogic:
      'burst flashes, hard rim, energy cross-light, thunder glow, spark cuts, and motion-streak highlights',
    materialLogic:
      'dust plumes, grit overlays, sparks, shockwave haze, motion smears, smoke, and denoised effect texture',
    compositionLogic:
      'forced perspective, vertigo angles, vector discharge, monumental impact scale, upward momentum, and compressed depth lanes',
    moodLogic:
      'urgency, adrenaline, vertigo, release, danger, heroic pressure, and imminent collision',
    finishLogic:
      'sharp combat-keyframe finish with instant readability, stable action anatomy, controlled denoise, and no static-pose drift',
    defaultAvoid: ['static pose', 'low-detail blur', 'photoreal stunt photo'],
  },
};

const genericPatterns = [
  /\bvisual language with a clear stylistic thesis\b/i,
  /\bCreate a style-card that translates\b/i,
  /\bPreserve the preset identity through style mechanics\b/i,
  /\bDefine .+ through line, mass, contour\b/i,
  /\bUse a .+-specific palette\b/i,
  /\bclear dominant, secondary, and accent roles\b/i,
  /\bUse lighting that makes .+ recognizable\b/i,
  /\bUse materials and textures that reinforce\b/i,
  /\bUse spatial behavior that fits\b/i,
  /\bSet a mood that belongs to\b/i,
  /\bPrioritize .+ key features\b/i,
];

const unsafeReplacements: Array<[RegExp, string]> = [
  [/\bstyle-card\b/gi, 'style grammar'],
  [/\bthumbnail\b/gi, 'sample image'],
  [/\bscreenshot\b/gi, 'source-frame look'],
  [/\bforeground\b/gi, 'near-plane'],
  [/\bbackground\b/gi, 'distant-plane'],
  [/\bexact\b/gi, 'required'],
  [/\bliteral\b/gi, 'required'],
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

function isAlreadyEnriched(manifest: StylePresetManifest) {
  return visualValue(manifest, 'aesthetic').includes('transferable anime-battle/worlds router');
}

function routerSafe(value: string) {
  return unsafeReplacements
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

  return normalized in categoryLanguage ? normalized : 'modern-shonen-and-action';
}

function compactValue(value: string) {
  return routerSafe(value)
    .replace(/\bUse an original\b/gi, '')
    .replace(/\bone original\b/gi, 'original')
    .replace(/\bone readable\b/gi, 'readable')
    .replace(/\bwith one\b/gi, 'with')
    .replace(/\bcharacter\b/gi, 'subject design')
    .replace(/\bfigure\b/gi, 'subject form')
    .replace(/\bhero\b/gi, 'lead-form')
    .replace(/\bweapon\b/gi, 'combat prop')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\W+|\W+$/g, '');
}

function splitCueText(value: string) {
  return value
    .replace(/\.$/, '')
    .split(/,\s*|;\s*/)
    .map((part) => compactValue(part))
    .filter((part) => part.length > 3 && !/^no\b/i.test(part))
    .slice(0, 8);
}

function splitAvoid(value: string) {
  return value
    .replace(/\.$/, '')
    .split(/,\s*|\bor\b/i)
    .map((part) =>
      routerSafe(part)
        .replace(/^and\s+/i, '')
        .trim(),
    )
    .filter((part) => part.length > 2)
    .slice(0, 18);
}

async function loadDefaultPromptMap() {
  const sourcePath = path.join(process.cwd(), 'scripts', 'generate-style-defaults.ts');
  const source = await readFile(sourcePath, 'utf8');
  const prompts = new Map<string, string>();
  const regex = /if \(preset\.id === '(SP(?:05|13)-\d+)'\) \{\s*return '([^']+)';\s*\}/g;

  for (const match of source.matchAll(regex)) {
    prompts.set(match[1], match[2]);
  }

  return prompts;
}

function promptCues(prompt: string | undefined) {
  if (!prompt) return { cues: [], avoid: [] };
  const [beforeAvoid, avoidRaw = ''] = prompt.split(/\bAvoid\b|;\s*no\s+/i);
  const beforeLineage = beforeAvoid.split(/\bwithout copying\b/i)[0];
  const source = beforeLineage
    .replace(/\bReference lineage:\s*/gi, '')
    .replace(/\bMust read as\b/gi, '')
    .replace(/\bnot\b/gi, 'not as');

  return {
    cues: splitCueText(source),
    avoid: splitAvoid(avoidRaw),
  };
}

function existingCues(manifest: StylePresetManifest) {
  if (!manifest.id.startsWith('SP13-')) return [];

  const values = [
    visualValue(manifest, 'aesthetic'),
    visualValue(manifest, 'subject_treatment'),
    visualValue(manifest, 'color_and_tone'),
    visualValue(manifest, 'lighting_and_shadow'),
    visualValue(manifest, 'texture_and_material'),
    visualValue(manifest, 'camera_and_composition'),
    visualValue(manifest, 'atmosphere_and_mood'),
    visualValue(manifest, 'rendering_and_quality'),
  ];

  return values
    .filter((value) => value && !isGeneric(value))
    .flatMap(splitCueText)
    .slice(0, 8);
}

function uniquePhrases(values: string[]) {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values.map(routerSafe).filter(Boolean)) {
    const key = normalizeText(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(value);
  }

  return output;
}

function cueSummary(manifest: StylePresetManifest, prompt: string | undefined) {
  const parsed = promptCues(prompt);
  const cues = uniquePhrases([
    compactValue(manifest.name),
    ...parsed.cues,
    ...existingCues(manifest),
  ]).slice(0, 8);

  return {
    cue: cues.join(', '),
    compactCue: cues.slice(0, 5).join(', '),
    avoid: parsed.avoid,
  };
}

function buildBattleDna(
  manifest: StylePresetManifest,
  language: CategoryBattleLanguage,
  prompt: string | undefined,
) {
  const source = cueSummary(manifest, prompt);
  const cue = source.cue || compactValue(manifest.name);
  const compactCue = source.compactCue || compactValue(manifest.name);
  const featureParts = uniquePhrases([
    compactCue,
    language.subjectSystem,
    language.materialLogic,
    language.compositionLogic,
    language.finishLogic,
  ]).slice(0, 5);

  return {
    visualDna: {
      aesthetic: sentence(
        `${manifest.name} acts as a transferable anime-battle/worlds router: ${cue}; combine it with ${language.routerRole}; named titles, studios, or lineage words may guide style, but they must not require canon cast, title-scene replication, screenshots, logos, or one fixed card concept`,
      ),
      subject_treatment: sentence(
        `Preserve prompt subject, action, and context while restyling silhouette, material response, gesture rhythm, effect hierarchy, and detail priority through the preset lineage; apply ${compactCue} as portable contour, motion grammar, surface language, and emotional pressure without requiring canon elements or a default action setup`,
      ),
      color_and_tone: sentence(
        `Map color through ${language.paletteLogic}; let ${compactCue} choose accent intensity, value contrast, emotional temperature, and power-system separation while staying attached to prompt X`,
      ),
      lighting_and_shadow: sentence(
        `Use ${language.lightLogic}; make light clarify impact, silhouette, machinery or magic, material depth, and mood from ${compactCue} without replacing prompt X with a stock anime frame`,
      ),
      texture_and_material: sentence(
        `Render ${language.materialLogic}; keep the tactile or effect cues in ${compactCue} controlled, denoised, and coherent across bodies, objects, environments, abstractions, and action`,
      ),
      camera_and_composition: sentence(
        `Frame through ${language.compositionLogic}; convert ${compactCue} into reusable perspective, timing, rhythm, scale, cut-in, and negative-space rules instead of one fixed style sample layout`,
      ),
      atmosphere_and_mood: sentence(
        `Carry mood through ${language.moodLogic}; the preset can become brutal, erotic, comic, tragic, quiet, grotesque, heroic, romantic, or strange when prompt X asks for it while keeping the anime-battle lineage readable`,
      ),
      rendering_and_quality: sentence(
        `Finish with ${language.finishLogic}; prioritize stable anatomy or object structure, readable effects, controlled grain, heavy denoise for noisy darks, no watermark, no fake readable text, no signature, no photoreal or 3D-render drift`,
      ),
      key_features: featureParts.join('; '),
      creative_brief: sentence(
        `Apply ${manifest.name} after prompt X as a transferable anime-battle/worlds layer: prompt X supplies subject, action, setting, tone, and intensity, while this preset supplies ${cue}, ${language.routerRole}, finish discipline, and negative controls without forcing canon cast, title scene, screenshot, card pose, default monster, default combat prop, or prompt-literal card`,
      ),
    },
    avoid: source.avoid,
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

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const force = process.argv.includes('--force');
  const presetFilter = argValue('preset');
  const defaultPrompts = await loadDefaultPromptMap();
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
    const built = buildBattleDna(manifest, language, defaultPrompts.get(manifest.id));
    manifest.visualDna = {
      ...manifest.visualDna,
      ...built.visualDna,
    };
    manifest.avoidRules = uniqueRules([
      ...(manifest.avoidRules ?? []),
      ...built.avoid,
      ...language.defaultAvoid,
      'fixed canon character',
      'title scene replication',
      'required screenshot',
      'cosplay',
      'generic anime filter',
      'prompt-literal card',
      'watermark',
      'readable text',
      'logo',
      'signature',
      'muddy noisy darks',
    ]);
    manifest.attributes = {
      ...manifest.attributes,
      negativePrompt: manifest.avoidRules.join(', '),
    };

    changed += 1;

    if (dryRun) {
      console.log(`[pack05:dna] would update ${manifest.id} ${manifest.name}`);
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

  console.log(`[pack05:dna] ${dryRun ? 'dry-run' : 'updated'} presets=${changed}`);
}

await main();
