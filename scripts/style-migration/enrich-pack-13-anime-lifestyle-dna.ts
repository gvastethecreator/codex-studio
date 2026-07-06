import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import * as yaml from 'js-yaml';

import type { StylePresetManifest } from '../../components/recipes/styles/manifestTypes';

const packId = 'pack_13';
const presetDir = path.join(
  process.cwd(),
  'components',
  'recipes',
  'styles',
  'manifests',
  'presets',
  packId,
);

interface CategoryAnimeLanguage {
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

const categoryLanguage: Record<string, CategoryAnimeLanguage> = {
  'core-anime': {
    routerRole:
      'core anime character and adventure grammar with cel contour hierarchy, expressive acting, readable silhouette, genre clarity, and clean TV-to-key-visual polish',
    subjectSystem:
      'line-weight hierarchy, pose-first shape design, simplified interior detail, readable costume or surface cues, and emotion-led facial or object emphasis',
    paletteLogic:
      'clear cel values, saturated accents, stable skin or material midtones, sky or neon support color, and disciplined complementary contrast',
    lightLogic:
      'binary cel shadow, gentle rim, effect glow when requested, broadcast-friendly key light, and clean value separation',
    materialLogic:
      'flat cel fills, painted background softness, limited grain, clean ink edges, controlled effect overlays, and low-noise finish',
    compositionLogic:
      'silhouette-priority framing, moderate dynamic lensing, readable action or emotion lanes, and subject-first depth without required genre staging',
    moodLogic:
      'heroic resolve, genre wonder, kinetic focus, gothic pressure, magical uplift, or final-episode tenderness guided by prompt X',
    finishLogic:
      'premium cel-anime clarity with stable anatomy or object structure, crisp lines, denoised color blocks, no fake text, and no 3D render drift',
    defaultAvoid: ['generic anime filter', 'canon cast copy', 'screenshot composition'],
  },
  'slice-of-life-school-music': {
    routerRole:
      'slice-of-life school and music grammar with soft social acting, weathered everyday light, gentle performance rhythm, and intimate mundane storytelling',
    subjectSystem:
      'microgesture acting, soft contour, posture pauses, everyday prop restraint, textile simplicity, and emotion carried by spacing rather than spectacle',
    paletteLogic:
      'rain blue, spring pink, warm cream, muted uniform or casual neutrals, stage amber, soft daylight, and restrained accent color',
    lightLogic:
      'window diffusion, rain reflection, lantern or stage glow, soft bounce, pastel rim, and low-contrast emotional separation',
    materialLogic:
      'matte paper-like backgrounds, crisp textile softness, umbrella sheen, instrument gloss when requested, dessert warmth, and low-noise painted surfaces',
    compositionLogic:
      'near-but-not-touching spacing, quiet inserts, performance beats, seasonal framing, and open everyday depth without classroom or venue dependency',
    moodLogic:
      'gentle longing, shy warmth, quiet comedy, festival nostalgia, backstage nerves, soft friendship, and sincere ordinary wonder',
    finishLogic:
      'clean slice-of-life anime finish with subtle bloom, controlled softness, readable expressions, no fake signage, and no photographic realism',
    defaultAvoid: ['classroom dependency', 'idol-stage dependency', 'generic cute wallpaper'],
  },
  'shojo-magical-girl-and-visionary-classics': {
    routerRole:
      'shojo, magical-girl, and visionary classic anime grammar with symbolic romance, transformation sparkle, ornate contour, emotional close reading, and theatrical abstraction',
    subjectSystem:
      'delicate linework, elongated gesture, ribbon or petal rhythm, jewel or occult accents, fashion silhouette, expressive eyes, and symbolic distance cues',
    paletteLogic:
      'rose pink, moon white, jewel tones, velvet black, crimson accents, pale sky, luminous gold, and softened emotional gradients',
    lightLogic:
      'sparkle bloom, moon rim, stained-glass glow, soft window key, ritual warning light, and symbolic highlight placement',
    materialLogic:
      'lace, ribbon, petals, glass, polished armor, velvet, paper, soft hair shine, magical particles, and clean cel ornament',
    compositionLogic:
      'romance-distance framing, transformation arcs, emblem balance, theatrical diagonals, graceful vertical lift, and symbolic negative space without fixed cast',
    moodLogic:
      'romantic ache, heroic grace, comic sparkle, visionary dread, fated adventure, tender healing, and adult melodrama when prompt X requests it',
    finishLogic:
      'elegant shojo/classic anime polish with clean ornament, stable faces, denoised sparkle, no readable magic text, and no title-scene reproduction',
    defaultAvoid: ['canon couple copy', 'readable magic text', 'title-scene reproduction'],
  },
  'slice-of-life-and-moe': {
    routerRole:
      'slice-of-life and moe grammar with soft acting, comedy timing, healing pace, cozy object care, pastel emotional rhythm, and small-world specificity',
    subjectSystem:
      'rounded shape language, micro-expression timing, soft body or object posture, simple costume/surface detail, and charm through small repeated gestures',
    paletteLogic:
      'warm cream, tea amber, pastel pink, mint, sky blue, soft gray, seasonal greens, and gentle accent saturation',
    lightLogic:
      'soft daylight, warm interior bounce, festival glow when requested, rain haze, gentle rim, and flat comedy brightness',
    materialLogic:
      'matte painted surfaces, soft textiles, food warmth, paper goods, water reflections, craft marks, and clean low-noise background simplicity',
    compositionLogic:
      'low-stakes spacing, reaction beats, routine loops, cozy pockets, observational crops, and comfort-scale depth without required school setting',
    moodLogic:
      'comfort, absurd timing, vulnerable humor, restorative quiet, small triumph, awkward sincerity, and cozy chaos in prompt-controlled doses',
    finishLogic:
      'soft high-readability anime finish with stable proportions, gentle denoise, clean pastel values, and no infantilized generic cuteness',
    defaultAvoid: ['generic moe wallpaper', 'infantilized styling', 'school-only lock'],
  },
  'anime-style-spectrum': {
    routerRole:
      'broad anime style-spectrum grammar with experimental line, material-specific finish, auteur-adjacent motion, graphic abstraction, sensor vision, and genre-flexible art direction',
    subjectSystem:
      'style-specific contour, material transformation, motion grammar, abstraction pressure, symbolic surface logic, and prompt-preserving silhouette discipline',
    paletteLogic:
      'style-native color systems, from sumi-e ink and textile dye to neon hyperpop, thermal bands, chrome accents, mineral glass, and restrained naturalism',
    lightLogic:
      'finish-specific light behavior: backlit contour, jewel refraction, sensor glow, chalk haze, speed slash, naturalist daylight, or dramatic cel rim',
    materialLogic:
      'brush grain, stained glass, thread, chalk, spray paint, mineral facets, chrome, heat-map pixels, concrete grit, paper tooth, and denoised texture scale',
    compositionLogic:
      'auteur-aware framing, material seams, impact vectors, postcard freezes, distorted sprint depth, icon balance, or quiet human blocking without fixed source scenes',
    moodLogic:
      'experimental wonder, adult suspense, kinetic absurdity, melancholic distance, tactile craft, ritual unease, and surreal continuity guided by prompt X',
    finishLogic:
      'clean experimental-anime finish with strong style recognition, stable subject structure, controlled texture, no watermark, no fake UI, and no generic AI anime gloss',
    defaultAvoid: ['generic AI anime gloss', 'auteur copycat', 'fixed source scene'],
  },
};

const genericPatterns = [
  /\bvisual language with a clear stylistic thesis\b/i,
  /\bCreate a style-card that translates\b/i,
  /\bPreserve the preset identity through style mechanics\b/i,
  /\bUse a .+specific palette\b/i,
  /\bspecific palette with clear dominant\b/i,
  /\bDefine .+ through line, mass, contour\b/i,
  /\bUse lighting that makes\b/i,
  /\blighting that makes\b/i,
  /\bUse materials and textures that reinforce\b/i,
  /\bmaterials and textures that reinforce\b/i,
  /\bUse spatial behavior that fits\b/i,
  /\bspatial behavior that fits\b/i,
  /\bSet a mood that belongs\b/i,
  /\bRender .+ with high production clarity\b/i,
  /\bPrioritize .+ key features\b/i,
  /\bkey features:\s*recognizable shape language\b/i,
  /\brecognizable shape language\b/i,
];

const routerSafeReplacements: Array<[RegExp, string]> = [
  [/\bstyle-card\b/gi, 'style sample'],
  [/\bthumbnail\b/gi, 'sample image'],
  [/\bscreenshot\b/gi, 'source-frame look'],
  [/\bforeground\b/gi, 'near-plane'],
  [/\bbackground\b/gi, 'distant-plane'],
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

function isGeneric(value: string) {
  return genericPatterns.some((pattern) => pattern.test(value));
}

function routerSafe(value: string) {
  return routerSafeReplacements
    .reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value)
    .replace(/([a-z])-([a-z])/gi, '$1 $2')
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

  return normalized in categoryLanguage ? normalized : 'anime-style-spectrum';
}

function isAlreadyEnriched(manifest: StylePresetManifest) {
  return visualValue(manifest, 'aesthetic').includes('portable anime-lifestyle router');
}

function lineageAndStyleName(name: string) {
  const parts = name.split(/\s+-\s+/);
  if (parts.length < 2) {
    return { lineage: '', styleName: name };
  }

  return {
    lineage: parts.slice(0, -1).join(' - '),
    styleName: parts.at(-1) ?? name,
  };
}

function proseStyleName(name: string) {
  return name
    .replace(/\bMarket-Festival\b/gi, 'Community-Festival')
    .replace(/\bShy Hallway Bloom\b/gi, 'Shy Distance Bloom')
    .replace(/\bMecha Hangar Ignition\b/gi, 'Mecha Ignition')
    .replace(/\bShrine Romance\b/gi, 'Ritual Romance')
    .replace(/\bStreet\b/gi, 'Public-Style')
    .replace(/\bRoom\b/gi, 'Interior')
    .replace(/\bClassroom\b/gi, 'Everyday')
    .trim();
}

function titleCue(manifest: StylePresetManifest) {
  const { lineage, styleName } = lineageAndStyleName(manifest.name);
  const styleCue = routerSafe(proseStyleName(styleName))
    .replace(/\bAnime\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!lineage) return `${styleCue} anime style cues`;
  return `${styleCue} with ${lineage} lineage used only as style reference`;
}

function cleanCue(value: string) {
  const compact = routerSafe(value)
    .replace(/\.$/, '')
    .replace(/^Use\s+/i, '')
    .replace(/^Route any subject through\s+/i, '')
    .replace(/^Preserve the requested subject through\s+/i, '')
    .replace(/^Create a .*? that translates\s+/i, '')
    .replace(/\bwithin \d+\.\s+[^:]+:\s*/i, '')
    .trim();

  if (
    /^(a\s+)?[^.]+specific palette\b/i.test(compact) ||
    /^lighting that makes\b/i.test(compact) ||
    /^materials and textures that reinforce\b/i.test(compact) ||
    /^spatial behavior that fits\b/i.test(compact) ||
    /^Prioritize\b/i.test(compact)
  ) {
    return '';
  }

  if (!compact || isGeneric(compact)) return '';
  return compact;
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
          ![
            'with',
            'through',
            'that',
            'this',
            'then',
            'onto',
            'plus',
            'and',
            'from',
            'anime',
            'style',
          ].includes(token),
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
    .filter((part) => part.length > 2 && !/^no\b/i.test(part))
    .slice(0, 12);
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

function sourceCue(manifest: StylePresetManifest, key: string, fallback: string) {
  const value = cleanCue(visualValue(manifest, key));
  if (wordCount(value) >= 4) return value;
  return fallback;
}

function buildAnimeDna(manifest: StylePresetManifest) {
  const language = categoryLanguage[categoryId(manifest)];
  const titleBehavior = titleCue(manifest);
  const keyFeatureSeed =
    cleanCue(visualValue(manifest, 'key_features')) ||
    `${titleBehavior}, ${language.subjectSystem}`;
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
        aesthetic: sourceCue(manifest, 'aesthetic', titleBehavior),
        subject: sourceCue(manifest, 'subject_treatment', language.subjectSystem),
        color: sourceCue(manifest, 'color_and_tone', language.paletteLogic),
        light: sourceCue(manifest, 'lighting_and_shadow', language.lightLogic),
        texture: sourceCue(manifest, 'texture_and_material', language.materialLogic),
        composition: sourceCue(manifest, 'camera_and_composition', language.compositionLogic),
        mood: sourceCue(manifest, 'atmosphere_and_mood', language.moodLogic),
        finish: sourceCue(manifest, 'rendering_and_quality', language.finishLogic),
      };

  const presetName = proseStyleName(manifest.name);
  const aestheticBehavior = combineCueAndLogic(cue.aesthetic, language.routerRole, 'with');
  const subjectBehavior = language.subjectSystem;
  const colorBehavior = combineCueAndLogic(cue.color, language.paletteLogic, 'plus');
  const lightBehavior = combineCueAndLogic(cue.light, language.lightLogic, 'plus');
  const textureBehavior = combineCueAndLogic(cue.texture, language.materialLogic, 'plus');
  const compositionBehavior = language.compositionLogic;
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
        titleBehavior,
        cue.aesthetic,
        cue.subject,
        cue.texture,
        cue.light,
        cue.composition,
      ]);
  const featureBehavior = featureParts.join(', ');
  const { lineage } = lineageAndStyleName(manifest.name);
  const lineageClause = lineage
    ? `; ${lineage} may guide line economy, acting, color, and period flavor but must not force canon cast, title scenes, logos, or copied costumes`
    : '';

  return {
    aesthetic: sentence(
      `${presetName} operates as a portable anime-lifestyle router: combine ${aestheticBehavior}${lineageClause}, so the preset supplies anime style behavior after prompt X rather than a required scene, character, franchise image, or card composition`,
    ),
    subject_treatment: sentence(
      `Preserve prompt X's subject, action, age, setting, and intensity while translating forms through ${subjectBehavior}; subjects may be characters, creatures, objects, interiors, vehicles, symbols, or full scenes without losing the user's prompt`,
    ),
    color_and_tone: sentence(
      `Map color through ${colorBehavior}; keep cel values readable, accent roles intentional, skin or material midtones stable, and palette behavior attached to the prompt instead of pasted anime decoration`,
    ),
    lighting_and_shadow: sentence(
      `Use ${lightBehavior}; lighting should clarify expression, silhouette, material, and emotional rhythm while avoiding muddy blacks, fake bloom, or screenshot-like flatness`,
    ),
    texture_and_material: sentence(
      `Render ${textureBehavior}; keep line, paint, textile, glass, paper, sensor, grain, or effect textures controlled enough to route style without noisy surface chatter`,
    ),
    camera_and_composition: sentence(
      `Compose through ${compositionBehavior} as reusable anime framing grammar, allowing close acting, objects, performances, action, environments, or abstract prompts without one required pose or location`,
    ),
    atmosphere_and_mood: sentence(
      `Carry mood through ${moodBehavior}; the preset can become cute, sensual, severe, comic, romantic, violent, strange, or quiet when prompt X asks while preserving its anime lineage`,
    ),
    rendering_and_quality: sentence(
      `Finish with ${finishBehavior}; prioritize stable anatomy or object structure, clean denoise, readable effects, no watermark, no fake readable text, no UI, and no generic AI anime gloss`,
    ),
    key_features: featureParts.join('; '),
    creative_brief: sentence(
      `Use ${presetName} after prompt X as a transferable anime character/lifestyle layer: prompt X supplies subject, action, setting, tone, and intensity, while the preset supplies ${featureBehavior}, color logic, lighting, material finish, composition rhythm, mood pressure, and quality controls without requiring a fixed cast, fixed venue, fixed prop bundle, title screenshot, or sample-card composition`,
    ),
  };
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
    if (!force && isAlreadyEnriched(manifest)) continue;

    const language = categoryLanguage[categoryId(manifest)];
    manifest.visualDna = {
      ...manifest.visualDna,
      ...buildAnimeDna(manifest),
    };
    manifest.avoidRules = uniqueRules([
      ...(manifest.avoidRules ?? []),
      ...language.defaultAvoid,
      'canon character copy',
      'title-scene copy',
      'literal sample-card setup',
      'fixed anime cast',
      'generic anime filter',
      'prompt-literal card reuse',
      'watermark',
      'readable text',
      'fake UI',
    ]);
    manifest.attributes = {
      ...manifest.attributes,
      negativePrompt: uniqueRules([
        ...splitNegativePrompt(manifest.attributes?.negativePrompt),
        ...manifest.avoidRules,
        'photoreal cosplay',
        '3D render look',
        'copied franchise costume',
        'logo',
        'signature',
      ]).join(', '),
    };

    changed += 1;

    if (dryRun) {
      console.log(`[pack13:dna] would update ${manifest.id} ${manifest.name}`);
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

  console.log(`[pack13:dna] ${dryRun ? 'dry-run' : 'updated'} presets=${changed}`);
}

await main();
