import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import * as yaml from 'js-yaml';

import type { StylePresetManifest } from '../../components/recipes/styles/manifestTypes';

const packId = 'pack_08';
const presetDir = path.join(
  process.cwd(),
  'components',
  'recipes',
  'styles',
  'manifests',
  'presets',
  packId,
);

interface CategoryFashionLanguage {
  routerRole: string;
  constructionSystem: string;
  subjectVerb: string;
  paletteLogic: string;
  lightLogic: string;
  materialLogic: string;
  compositionLogic: string;
  moodLogic: string;
  finishLogic: string;
  defaultAvoid: string[];
}

const categoryLanguage: Record<string, CategoryFashionLanguage> = {
  'contemporary-fashion': {
    routerRole:
      'contemporary fashion styling with fit control, editorial polish, wearable silhouette, and modern wardrobe hierarchy',
    constructionSystem:
      'tailoring lines, garment fit, hem placement, accessory restraint, layered proportion, and intentional styling choices',
    subjectVerb: 'tailor, drape, cinch, layer, streamline, accessorize, polish, or simplify',
    paletteLogic:
      'modern neutrals, controlled accent color, textile value separation, skin-adjacent warmth, and editorial contrast',
    lightLogic:
      'fashion editorial light with fabric sheen, controlled shadow, polished skin or surface response, and clean silhouette reads',
    materialLogic:
      'woven cloth, suiting, jersey, performance fabric, satin, leather, knit, seams, folds, closures, and garment hardware',
    compositionLogic:
      'lookbook clarity, runway silhouette rhythm, full-form readability, crop discipline, and styling hierarchy',
    moodLogic:
      'confidence, restraint, luxury, ease, polish, modern taste, and professional or event-specific presence',
    finishLogic:
      'high-end styling clarity, crisp garment edges, believable fit, controlled retouching, and no catalog blandness',
    defaultAvoid: ['generic catalog outfit', 'brand logo styling', 'bad garment fit'],
  },
  subcultures: {
    routerRole:
      'subcultural dress-code logic with identity signals, music or scene memory, attitude, and symbolic styling pressure',
    constructionSystem:
      'signature layers, footwear cues, hair volume, accessory codes, patches, hardware, textile wear, and stance-driven silhouette',
    subjectVerb:
      're-code, roughen, glamorize, cuff, patch, distress, polish, exaggerate, or accessorize',
    paletteLogic:
      'identity colors, denim or leather anchors, subculture accents, worn neutrals, high-contrast trims, and era-coded saturation',
    lightLogic:
      'club, daylight, editorial, neon, chrome, or DIY light cues that reveal texture and attitude without forcing a venue',
    materialLogic:
      'denim, leather, cotton, lace, vinyl, boots, badges, knit, metal hardware, embroidery, print, and worn textile history',
    compositionLogic:
      'attitude-led silhouette, accessory grouping, dress-code readability, body-line rhythm, and reusable styling emphasis',
    moodLogic:
      'rebellion, nostalgia, romance, nightlife, softness, defiance, handmade culture, or academic/intellectual taste',
    finishLogic:
      'authentic subculture styling, material age, clear identity cues, and no costume-party caricature unless requested',
    defaultAvoid: ['costume-party parody', 'random trend mix', 'brand-logo collage'],
  },
  'historical-and-fantasy': {
    routerRole:
      'period and mythic costume logic with era silhouette, regalia structure, textile craft, and ceremonial proportion',
    constructionSystem:
      'corsetry, armor plates, robes, sashes, pleats, trim, brocade, regalia layers, fastenings, and historically legible cut',
    subjectVerb: 'robe, armor, pleat, lace, cinch, plate, embroider, crown, wrap, or ceremonialize',
    paletteLogic:
      'period pigments, jewel tones, mourning blacks, metallic trim, linen or wool neutrals, royal accents, and age-aware dye',
    lightLogic:
      'museum, candle, daylight, ceremonial, or portrait light that reveals textile depth and silhouette hierarchy',
    materialLogic:
      'brocade, linen, wool, silk, leather, metal, beadwork, lace, fur, embroidery, trim, and handworked surface detail',
    compositionLogic:
      'regal posture logic, era silhouette, layered garment structure, ornament placement, and readable period identity',
    moodLogic:
      'ceremony, history, myth, rank, mourning, travel, revolution, courtly pressure, or folk memory',
    finishLogic:
      'period-aware costume clarity, tactile textile truth, ornament discipline, and no cheap renaissance-fair shortcut',
    defaultAvoid: ['cheap costume rental', 'wrong era mashup', 'plastic armor'],
  },
  'fantasy-sci-fi-costume': {
    routerRole:
      'speculative costume logic with armor, suit engineering, magical garment behavior, alien proportion, and character-readability design',
    constructionSystem:
      'paneling, harnesses, armor modules, robe systems, implant seams, luminous channels, survival layers, and invented fastenings',
    subjectVerb:
      'arm, shield, augment, cloak, illuminate, conceal, mutate, modularize, ritualize, or engineer',
    paletteLogic:
      'speculative material color, neon accents, abyssal values, royal metals, survival grime, arcane glow, and suit-coded contrast',
    lightLogic:
      'rim light, emissive channels, occult glow, reflective armor, survival dust, void shadow, or sci-fi display light',
    materialLogic:
      'armor plates, spandex, robes, leather, rubber, chrome, biotic surface, hologram, smoke, shadow, gel, and luminous seams',
    compositionLogic:
      'character-design readability, suit silhouette, power-shape hierarchy, modular gear rhythm, and transformation focus',
    moodLogic:
      'power, menace, wonder, survival, occult ceremony, alien elegance, stealth, spectacle, or mythic futurism',
    finishLogic:
      'believable costume engineering, clean edge logic, strong silhouette, readable material physics, and no generic cosplay blur',
    defaultAvoid: ['generic cosplay', 'plastic toy armor', 'muddy fantasy outfit'],
  },
  'fabric-and-texture-focus': {
    routerRole:
      'material-forward fashion transformation with drape, surface, tactility, body-volume logic, and fabric-as-style behavior',
    constructionSystem:
      'weave, pile, grain, shine, translucency, opacity, stretch, wrap, seam tension, edge behavior, and surface continuity',
    subjectVerb:
      'wrap, coat, glaze, harden, dissolve, ripple, fold, bind, sparkle, veil, plate, or mineralize',
    paletteLogic:
      'material-native hue, surface highlights, depth values, transparency shifts, metallic accents, and tactile color variation',
    lightLogic:
      'material-revealing light with gloss, rim, translucency, sparkle, subsurface, matte falloff, or volumetric separation',
    materialLogic:
      'fabric grain, fur, chain, knit, satin, lace, leather, polymer, smoke, water, fire, gel, gold leaf, stone, or skin surface',
    compositionLogic:
      'drape rhythm, material coverage, silhouette clarity, tactile close detail, fold direction, and transformation edge control',
    moodLogic:
      'sensory tactility, spectacle, intimacy, fragility, armor, seduction, decay, luxury, uncanniness, or elemental drama',
    finishLogic:
      'material truth, clean surface scale, controlled texture, believable drape or transformation, and no noisy texture paste',
    defaultAvoid: ['generic fabric texture', 'muddy surface noise', 'wrong material physics'],
  },
};

const GENERIC_PATTERNS = [
  /\bvisual language with a clear stylistic thesis\b/i,
  /\bspecific palette with clear dominant\b/i,
  /\bDefine .+ through line, mass, contour\b/i,
  /\bUse lighting that makes .+ recognizable\b/i,
  /\bUse materials and textures that reinforce\b/i,
  /\bUse spatial behavior that fits\b/i,
  /\bSet a mood that belongs to\b/i,
  /\bRender .+ with high production clarity\b/i,
  /\bPrioritize .+ key features\b/i,
  /\brecognizable shape language\b/i,
  /\bPreserve the preset identity through style mechanics\b/i,
];

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

function compareText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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

  return normalized in categoryLanguage ? normalized : 'fabric-and-texture-focus';
}

function sentence(value: string) {
  return value.endsWith('.') ? value : `${value}.`;
}

function isGeneric(value: string) {
  return GENERIC_PATTERNS.some((pattern) => pattern.test(value));
}

function routerSafe(value: string) {
  return value
    .replace(/\bforeground\b/gi, 'near-plane')
    .replace(/\bbackground\b/gi, 'distant-plane')
    .replace(/\bcentered\b/gi, 'balanced')
    .replace(/\bbehind\b/gi, 'layered around')
    .replace(/\bstreet\b/gi, 'public-style')
    .replace(/\bcity\b/gi, 'urban-system')
    .replace(/\broom\b/gi, 'interior-system')
    .replace(/\bmarket\b/gi, 'commerce-system')
    .replace(/\bcastle\b/gi, 'courtly-system')
    .replace(/\btemple\b/gi, 'ritual-system')
    .replace(/\bstanding\b/gi, 'upright')
    .replace(/\bsitting\b/gi, 'resting')
    .replace(/\bwearing\b/gi, 'styled with')
    .replace(/\bhero\b/gi, 'lead-form')
    .replace(/\bfigure\b/gi, 'form')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanCue(value: string) {
  const compact = value.replace(/\s+/g, ' ').trim();
  if (!compact || isGeneric(compact)) return '';

  const keyFeatureMatch = compact.match(/^Prioritize .+?'?s key features:\s*(.+?)\.?$/i);
  const cue = keyFeatureMatch ? keyFeatureMatch[1] : compact;
  return routerSafe(cue.replace(/\.$/, '').trim());
}

function extractSpecificBriefCue(brief: string) {
  const compact = brief.replace(/\s+/g, ' ').trim();
  const applyMatch = compact.match(/Apply .+? to the input:\s*(.+?)\.\s*Keep/i);
  if (applyMatch?.[1]) return routerSafe(applyMatch[1].trim());

  const turnMatch = compact.match(/Turn the input into\s+(.+?)\.\s*Keep/i);
  if (turnMatch?.[1]) return routerSafe(turnMatch[1].trim());

  const transformMatch = compact.match(/Transform the input into\s+(.+?)\.\s*Keep/i);
  if (transformMatch?.[1]) return routerSafe(transformMatch[1].trim());

  const suppliesMatch = compact.match(/preset supplies\s+(.+?),\s+palette behavior/i);
  if (suppliesMatch?.[1]) return routerSafe(suppliesMatch[1].trim());

  return '';
}

function sourceCue(manifest: StylePresetManifest, key: string, fallback: string, briefCue: string) {
  const value = cleanCue(visualValue(manifest, key));
  if (wordCount(value) >= 4) return value;
  if (briefCue && wordCount(briefCue) >= 4) return briefCue;
  return fallback;
}

function isAlreadyEnriched(manifest: StylePresetManifest) {
  return visualValue(manifest, 'aesthetic').includes('portable fashion-costume router');
}

function uniqueCount(values: string[]) {
  return new Set(values.map((value) => value.toLowerCase())).size;
}

function keyFeatureParts(manifest: StylePresetManifest) {
  return visualValue(manifest, 'key_features').split(';').map(cleanCue).filter(Boolean);
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

  return `${cleanCueText} ${connector} ${cleanLogic}`;
}

function compactFeatureParts(parts: string[]) {
  const output: string[] = [];

  for (const part of parts.map(routerSafe).filter(Boolean)) {
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

  return output;
}

function cueValues(manifest: StylePresetManifest, language: CategoryFashionLanguage) {
  const briefCue = extractSpecificBriefCue(visualValue(manifest, 'creative_brief'));
  const fallback = `${manifest.name} styling cues`;
  const parts = keyFeatureParts(manifest);

  if (isAlreadyEnriched(manifest) && parts.length >= 4 && uniqueCount(parts) >= 3) {
    return {
      aesthetic: parts[0],
      subject: parts[1] ?? language.constructionSystem,
      color: language.paletteLogic,
      light: parts[3] ?? language.lightLogic,
      texture: parts[2] ?? language.materialLogic,
      composition: parts[4] ?? language.compositionLogic,
      mood: language.moodLogic,
      finish: language.finishLogic,
      features: parts.slice(0, 5).join(', '),
    };
  }

  if (isAlreadyEnriched(manifest)) {
    return {
      aesthetic: briefCue || `${fallback} and ${language.routerRole}`,
      subject: language.constructionSystem,
      color: language.paletteLogic,
      light: language.lightLogic,
      texture: language.materialLogic,
      composition: language.compositionLogic,
      mood: language.moodLogic,
      finish: language.finishLogic,
      features: briefCue || language.constructionSystem,
    };
  }

  return {
    aesthetic: sourceCue(manifest, 'aesthetic', `${fallback} and ${language.routerRole}`, briefCue),
    subject: sourceCue(manifest, 'subject_treatment', language.constructionSystem, briefCue),
    color: sourceCue(manifest, 'color_and_tone', language.paletteLogic, briefCue),
    light: sourceCue(manifest, 'lighting_and_shadow', language.lightLogic, briefCue),
    texture: sourceCue(manifest, 'texture_and_material', language.materialLogic, briefCue),
    composition: sourceCue(manifest, 'camera_and_composition', language.compositionLogic, briefCue),
    mood: sourceCue(manifest, 'atmosphere_and_mood', language.moodLogic, briefCue),
    finish: sourceCue(manifest, 'rendering_and_quality', language.finishLogic, briefCue),
    features: sourceCue(
      manifest,
      'key_features',
      briefCue || language.constructionSystem,
      briefCue,
    ),
  };
}

function buildFashionDna(manifest: StylePresetManifest) {
  const language = categoryLanguage[categoryId(manifest)];
  const cue = cueValues(manifest, language);
  const aestheticBehavior = combineCueAndLogic(cue.aesthetic, language.routerRole, 'with');
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
  const featureParts = compactFeatureParts([
    cue.aesthetic,
    cue.subject,
    cue.texture,
    cue.light,
    cue.composition,
  ]);
  const featureBehavior = featureParts.join(', ');
  const briefBehavior = combineCueAndLogic(featureBehavior, language.constructionSystem, 'plus');

  return {
    aesthetic: sentence(
      `${manifest.name} operates as a portable fashion-costume router: combine ${aestheticBehavior}, so the preset supplies styling behavior rather than a fixed outfit card, required wearer, or literal garment sample`,
    ),
    subject_treatment: sentence(
      `Preserve the prompt's subject, motion, and context while forms ${language.subjectVerb} through ${cue.subject}; identity stays readable as silhouette, fit, layering, body-volume logic, edge behavior, and styling hierarchy shift into this preset`,
    ),
    color_and_tone: sentence(
      `Map color through ${colorBehavior}; keep textile values separated, accents intentional, material color believable, and palette behavior attached to the subject instead of pasted wardrobe decoration`,
    ),
    lighting_and_shadow: sentence(
      `Use ${lightBehavior} as the styling light contract, revealing cut, drape, surface response, trim, transparency, or armor structure without erasing prompt readability`,
    ),
    texture_and_material: sentence(
      `Render ${textureBehavior}; keep fabric scale, seams, fibers, shine, opacity, folds, hardware, elemental edges, or body-surface treatment coherent across the whole prompt`,
    ),
    camera_and_composition: sentence(
      `Compose with ${compositionBehavior} as reusable fashion framing grammar, allowing portraits, objects, creatures, environments, action, and abstract prompts to inherit styling without one required pose`,
    ),
    atmosphere_and_mood: sentence(
      `Carry mood through ${moodBehavior}; the tone should feel specific to ${manifest.name} while still obeying the prompt's adult, cute, severe, sensual, strange, or practical intent when supplied`,
    ),
    rendering_and_quality: sentence(
      `Finish with ${finishBehavior}; prioritize clean style recognition, believable material physics, prompt preservation, controlled detail, and no watermark, fake text, or accidental UI`,
    ),
    key_features: featureParts.join('; '),
    creative_brief: sentence(
      `Use ${manifest.name} after prompt X as a transferable fashion/costume layer: prompt X supplies subject, motion, setting, tone, and intensity, while the preset supplies ${briefBehavior}, palette behavior, light response, material treatment, silhouette grammar, and finish discipline without requiring one body type, fixed outfit, venue, prop bundle, or card composition`,
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
      ...buildFashionDna(manifest),
    };
    manifest.avoidRules = uniqueRules([
      ...(manifest.avoidRules ?? []),
      ...language.defaultAvoid,
      'fixed outfit',
      'required body type',
      'literal card scene',
      'generic fashion catalog',
      'muddy fabric noise',
      'watermark',
      'readable text',
    ]);
    manifest.attributes = {
      ...manifest.attributes,
      negativePrompt: manifest.avoidRules.join(', '),
    };

    changed += 1;

    if (dryRun) {
      console.log(`[pack08:dna] would update ${manifest.id} ${manifest.name}`);
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

  console.log(`[pack08:dna] ${dryRun ? 'dry-run' : 'updated'} presets=${changed}`);
}

await main();
