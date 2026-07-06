import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import * as yaml from 'js-yaml';

import type { StylePresetManifest } from '../../components/recipes/styles/manifestTypes';

const packId = 'pack_11';
const presetDir = path.join(
  process.cwd(),
  'components',
  'recipes',
  'styles',
  'manifests',
  'presets',
  packId,
);

interface CategorySourceLanguage {
  sourceRole: string;
  buildSystem: string;
  subjectVerb: string;
  paletteLogic: string;
  lightLogic: string;
  materialLogic: string;
  compositionLogic: string;
  moodSource: string;
  finishLogic: string;
  defaultAvoid: string[];
}

const categoryLanguage: Record<string, CategorySourceLanguage> = {
  'toys-and-crafts': {
    sourceRole:
      'hand-built object logic with toy scale, assembly marks, tactile charm, and playful construction',
    buildSystem:
      'visible joins, simplified proportions, craft tolerances, modular parts, and maker-process evidence',
    subjectVerb: 'simplify, assemble, soften, hinge, stitch, fold, carve, or snap together',
    paletteLogic:
      'material-native color blocks, toy-safe saturation, handmade variance, and clean separation between parts',
    lightLogic:
      'small-scale object lighting, crisp edge readability, soft contact shadows, and material-specific highlights',
    materialLogic:
      'plastic, clay, yarn, paper, wood, metal, felt, ice, tile, thread, sand, or carved surface behavior',
    compositionLogic:
      'object-scale staging, modular silhouette rhythm, clear construction reads, and tactile detail hierarchy',
    moodSource:
      'play, collectability, handmade care, nostalgia, miniature engineering, and physical charm',
    finishLogic:
      'clean craft detail, readable construction, deliberate imperfections, and no accidental realism collapse',
    defaultAvoid: ['melted craft', 'generic toy render', 'featureless plastic'],
  },
  'artistic-mediums': {
    sourceRole:
      'manual medium logic with mark discipline, process texture, graphic reduction, and authored surface treatment',
    buildSystem:
      'stroke direction, pigment edge, stencil separation, lead structure, fabric or print registration, and visible hand process',
    subjectVerb: 'draw, print, stitch, spray, glaze, outline, cut, layer, or illuminate',
    paletteLogic:
      'medium-bound pigments, ink limits, glass color breaks, chalk dust, thread color, or luminous tube hue',
    lightLogic:
      'surface-aware illumination that reveals pigment body, glass translucency, chalk haze, spray mist, or print layers',
    materialLogic:
      'mark residue, substrate grain, lead came, screen ink, sprayed overspray, needlework, and hand-built edges',
    compositionLogic:
      'graphic spacing, panel division, emblem balance, handmade alignment, and medium-specific rhythm',
    moodSource:
      'studio process, craft authorship, ritual mark-making, iconic reduction, and object presence',
    finishLogic:
      'legible medium identity, crisp material boundary, intentional artifacts, and no generic illustration filler',
    defaultAvoid: ['generic digital painting', 'flat vector shortcut', 'lost medium texture'],
  },
  aesthetics: {
    sourceRole:
      'cultural style-system logic with recognizable design codes, mood grammar, and transferable taste rules',
    buildSystem:
      'proportion codes, recurring surface motifs, era cues, pattern pressure, cultural references, and designed contrast',
    subjectVerb:
      're-code, stylize, ritualize, polish, decay, brighten, mechanize, soften, or mythologize',
    paletteLogic:
      'identity-bearing color families, accent rules, tonal pressure, era-specific contrast, and material color behavior',
    lightLogic:
      'mood-led lighting that reinforces the aesthetic code without replacing the requested subject',
    materialLogic:
      'signature finishes, symbolic surfaces, pattern systems, ornamental density, polish, grime, gloss, or softness',
    compositionLogic:
      'taste-coded spacing, silhouette discipline, motif placement, designed clutter, and reusable visual hierarchy',
    moodSource:
      'subculture memory, internet-era design codes, nostalgia, optimism, dread, cuteness, or spectacle',
    finishLogic:
      'coherent art direction, strong subject preservation, clean code recognition, and no mood-board vagueness',
    defaultAvoid: ['generic aesthetic collage', 'random trend mix', 'style-board text'],
  },
  'food-and-drink': {
    sourceRole:
      'culinary presentation logic with edible surface behavior, plating structure, gloss, freshness, and commercial appetite cues',
    buildSystem:
      'portion geometry, garnish rhythm, sauce motion, melt behavior, crumb, steam, condensation, and service polish',
    subjectVerb:
      'plate, glaze, slice, stack, melt, drizzle, arrange, chill, steam, or stylize through edible material logic',
    paletteLogic:
      'appetite-driven hues, ingredient contrast, caramelization, freshness accents, creamy highlights, and controlled richness',
    lightLogic:
      'editorial food lighting with glossy highlights, soft appetite shadows, condensation sparkle, and texture reveal',
    materialLogic:
      'sauce viscosity, crumb structure, gelatin shine, raw sheen, baked crust, ice, foam, steam, and surface freshness',
    compositionLogic:
      'plating geometry, negative space, ingredient rhythm, commercial clarity, and edible detail scale',
    moodSource:
      'freshness, indulgence, premium service, comfort, celebration, appetite, and sensory immediacy',
    finishLogic:
      'appetizing material truth, precise gloss control, clean detail priority, and no messy cafeteria drift',
    defaultAvoid: ['messy cafeteria', 'fake food plastic', 'brand logo packaging'],
  },
  'micro-macro': {
    sourceRole:
      'magnified source-study logic with scale shift, optical detail, structural pattern, and specimen-independent texture grammar',
    buildSystem:
      'microstructure, magnification artifacts, focus stacking, surface topology, optical refraction, and scale-legible detail',
    subjectVerb:
      'magnify, reveal, refract, fracture, sprout, crystallize, oxidize, bead, fray, or expose hidden structure',
    paletteLogic:
      'source-derived color variation, iridescence, false-scale contrast, translucent edges, and small-surface hue shifts',
    lightLogic:
      'macro flash, raking light, dark-field glow, backlit transmission, ring reflections, and shallow optical falloff',
    materialLogic:
      'pores, fibers, facets, droplets, spores, grain, grooves, cells, filaments, corrosion, or crystalline edges',
    compositionLogic:
      'scale abstraction, repeated micro-patterns, sectional rhythm, optical compression, and detail-first framing',
    moodSource:
      'scientific curiosity, alien familiarity, tactile intimacy, natural engineering, entropy, and fragile wonder',
    finishLogic:
      'clean magnification, controlled focus, coherent micro-texture, and no noisy stock-surface overlay',
    defaultAvoid: ['generic macro blur', 'muddy micro noise', 'classroom sample scene'],
  },
  'sensor-and-technical-imaging': {
    sourceRole:
      'sensor modality logic with diagnostic mapping, hidden-structure reveal, false color, and technical readout discipline',
    buildSystem:
      'density maps, thermal bands, attenuation layers, signal falloff, scan artifacts, and structure-first visibility',
    subjectVerb:
      'scan, reveal, map, attenuate, isolate, invert, color-code, or expose internal construction',
    paletteLogic:
      'sensor-coded values, monochrome density, heat gradients, cold transmission, and readable technical contrast',
    lightLogic:
      'display-like luminance, transmission glow, diagnostic contrast, signal bloom, and controlled technical haze',
    materialLogic:
      'film grain, scan bands, hidden structure, emissive heat regions, density edges, and signal texture',
    compositionLogic:
      'diagnostic hierarchy, projection logic, section-like readability, and technical symmetry without forcing a device',
    moodSource:
      'clinical curiosity, hidden truth, analytical tension, forensic clarity, and machine-mediated vision',
    finishLogic:
      'precise sensor behavior, believable modality limits, clean subject preservation, and no decorative sci-fi noise',
    defaultAvoid: ['normal camera color', 'medical-only scene', 'fake UI text'],
  },
  'diagram-and-technical-drawing': {
    sourceRole:
      'technical notation logic with measured linework, construction marks, schematic hierarchy, and annotation-ready clarity',
    buildSystem:
      'orthographic line weights, construction guides, measurement marks, diagram layers, and systematic part labeling space',
    subjectVerb:
      'measure, section, blueprint, annotate, simplify, align, explode, or draft into construction logic',
    paletteLogic:
      'blueprint cyan, white linework, restrained value coding, technical accents, and drafting-paper contrast',
    lightLogic:
      'flat documentation visibility, clean line contrast, blueprint glow, and no dramatic shadow dependency',
    materialLogic:
      'line ink, tracing surface, grid substrate, blueprint grain, guide marks, and crisp drafting artifacts',
    compositionLogic:
      'schematic spacing, plan/elevation logic, sectional clarity, part separation, and precise reading order',
    moodSource:
      'engineering calm, planning intent, exactitude, workshop intelligence, and construction anticipation',
    finishLogic:
      'crisp line hierarchy, clean symbol discipline, readable structure, and no fake unreadable labels',
    defaultAvoid: ['messy sketch', 'random labels', 'decorative blueprint only'],
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

  return normalized in categoryLanguage ? normalized : 'aesthetics';
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
    .replace(/\baction-figure\b/gi, 'poseable toy')
    .replace(/\bhero\b/gi, 'lead-form')
    .replace(/\bvisible\b/gi, 'clearly expressed')
    .replace(/\bkitchen\b/gi, 'service-space')
    .replace(/\blaboratory\b/gi, 'analysis-space')
    .replace(/\bcity\b/gi, 'urban-system')
    .replace(/\bstreet\b/gi, 'public-space')
    .replace(/\broom\b/gi, 'interior-system')
    .replace(/\bschool\b/gi, 'institutional-system')
    .replace(/\bmarket\b/gi, 'commerce-system')
    .replace(/\bvillage\b/gi, 'settlement-system')
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
  const preserveMatch = compact.match(/Preserve .*? through\s+(.+?)\s+rather than/i);
  if (preserveMatch?.[1]) return routerSafe(preserveMatch[1].trim());

  const definedMatch = compact.match(/defined by\s+(.+?)(?:, so|\.|$)/i);
  if (definedMatch?.[1]) return routerSafe(definedMatch[1].trim());

  const focusMatch = compact.match(/Focus on\s+(.+?)(?:\.|$)/i);
  if (focusMatch?.[1]) return routerSafe(focusMatch[1].trim());

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
  return visualValue(manifest, 'aesthetic').includes('portable source-router layer');
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

function cueValues(manifest: StylePresetManifest, language: CategorySourceLanguage) {
  const briefCue = extractSpecificBriefCue(visualValue(manifest, 'creative_brief'));
  const fallback = `${manifest.name} source cues`;
  const parts = keyFeatureParts(manifest);

  if (isAlreadyEnriched(manifest) && parts.length >= 5 && uniqueCount(parts) >= 3) {
    return {
      aesthetic: parts[0],
      subject: parts[1],
      color: language.paletteLogic,
      light: parts[3],
      texture: parts[2],
      composition: parts[4],
      mood: language.moodSource,
      finish: language.finishLogic,
      features: parts.slice(0, 5).join(', '),
    };
  }

  if (isAlreadyEnriched(manifest)) {
    return {
      aesthetic: briefCue || `${fallback} and ${language.sourceRole}`,
      subject: language.buildSystem,
      color: language.paletteLogic,
      light: language.lightLogic,
      texture: language.materialLogic,
      composition: language.compositionLogic,
      mood: language.moodSource,
      finish: language.finishLogic,
      features: briefCue || language.buildSystem,
    };
  }

  return {
    aesthetic: sourceCue(manifest, 'aesthetic', `${fallback} and ${language.sourceRole}`, briefCue),
    subject: sourceCue(manifest, 'subject_treatment', language.buildSystem, briefCue),
    color: sourceCue(manifest, 'color_and_tone', language.paletteLogic, briefCue),
    light: sourceCue(manifest, 'lighting_and_shadow', language.lightLogic, briefCue),
    texture: sourceCue(manifest, 'texture_and_material', language.materialLogic, briefCue),
    composition: sourceCue(manifest, 'camera_and_composition', language.compositionLogic, briefCue),
    mood: sourceCue(manifest, 'atmosphere_and_mood', language.moodSource, briefCue),
    finish: sourceCue(manifest, 'rendering_and_quality', language.finishLogic, briefCue),
    features: sourceCue(manifest, 'key_features', briefCue || language.buildSystem, briefCue),
  };
}

function buildSourceDna(manifest: StylePresetManifest) {
  const language = categoryLanguage[categoryId(manifest)];
  const cue = cueValues(manifest, language);
  const aestheticBehavior = combineCueAndLogic(cue.aesthetic, language.sourceRole, 'with');
  const colorBehavior = combineCueAndLogic(cue.color, language.paletteLogic, 'plus');
  const lightBehavior = combineCueAndLogic(cue.light, language.lightLogic, 'plus');
  const textureBehavior = combineCueAndLogic(cue.texture, language.materialLogic, 'plus');
  const compositionBehavior = combineCueAndLogic(
    cue.composition,
    language.compositionLogic,
    'plus',
  );
  const moodBehavior = combineCueAndLogic(cue.mood, language.moodSource, 'plus');
  const finishBehavior = combineCueAndLogic(cue.finish, language.finishLogic, 'plus');
  const featureParts = compactFeatureParts([
    cue.aesthetic,
    cue.subject,
    cue.texture,
    cue.light,
    cue.composition,
  ]);
  const featureBehavior = featureParts.join(', ');
  const briefBehavior = combineCueAndLogic(featureBehavior, language.buildSystem, 'plus');

  return {
    aesthetic: sentence(
      `${manifest.name} operates as a portable source-router layer: combine ${aestheticBehavior}, so the preset supplies visual behavior rather than a fixed card scene or literal sample`,
    ),
    subject_treatment: sentence(
      `Preserve the prompt's subject plus requested motion and context while letting forms ${language.subjectVerb} through ${cue.subject}; identity stays readable through construction grammar, proportion, edge logic, and detail scale as this preset is applied`,
    ),
    color_and_tone: sentence(
      `Map color through ${colorBehavior}; keep hue roles intentional, value separation clear, and palette behavior attached to the subject's forms instead of pasted decoration`,
    ),
    lighting_and_shadow: sentence(
      `Use ${lightBehavior} as the light-response contract, with readable hierarchy, controlled contact detail, and no lighting choice that erases the user's requested content`,
    ),
    texture_and_material: sentence(
      `Render ${textureBehavior}; surface scale, residue, gloss, grain, fiber, pores, edges, or signal artifacts must remain coherent across figures, objects, and environments`,
    ),
    camera_and_composition: sentence(
      `Compose with ${compositionBehavior} as reusable framing grammar, allowing cards, portraits, objects, scenes, and abstract prompts to inherit the style without one required layout`,
    ),
    atmosphere_and_mood: sentence(
      `Carry mood through ${moodBehavior}; the emotional tone should feel specific to ${manifest.name} while still obeying the prompt's subject and context`,
    ),
    rendering_and_quality: sentence(
      `Finish with ${finishBehavior}; prioritize clean style recognition, prompt preservation, controlled detail, and a finished image with no watermark, fake text, or accidental UI`,
    ),
    key_features: featureParts.join('; '),
    creative_brief: sentence(
      `Use ${manifest.name} after prompt X as a transferable style layer: prompt X supplies subject, action, and setting, while the preset supplies ${briefBehavior}, palette behavior, light response, material treatment, and finish discipline without requiring one specimen, prop bundle, product still, or card composition`,
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
      ...buildSourceDna(manifest),
    };
    manifest.avoidRules = uniqueRules([
      ...(manifest.avoidRules ?? []),
      ...language.defaultAvoid,
      'fixed specimen',
      'literal card scene',
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
      console.log(`[pack11:dna] would update ${manifest.id} ${manifest.name}`);
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

  console.log(`[pack11:dna] ${dryRun ? 'dry-run' : 'updated'} presets=${changed}`);
}

await main();
