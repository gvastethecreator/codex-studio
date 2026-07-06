import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import * as yaml from 'js-yaml';

import type { StylePresetManifest } from '../../components/recipes/styles/manifestTypes';

const packId = 'pack_07';
const presetDir = path.join(
  process.cwd(),
  'components',
  'recipes',
  'styles',
  'manifests',
  'presets',
  packId,
);

interface CategoryArchitectureLanguage {
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

interface PromptParts {
  sourceCue: string;
  descriptors: string[];
  avoid: string[];
}

const categoryLanguage: Record<string, CategoryArchitectureLanguage> = {
  'interior-design-systems': {
    routerRole:
      'interior-system design grammar with furniture-independent proportion, material hierarchy, junction detail, tactile finish, and lived spatial rhythm',
    subjectSystem:
      'clean massing, threshold logic, joinery rhythm, furniture-scale proportion, surface hierarchy, and object-ready interior detailing',
    paletteLogic:
      'controlled interior color hierarchy, wall or shell base tones, tactile secondary materials, small accent signals, and readable value spacing',
    lightLogic:
      'soft daylight, practical bounce, concealed glow, edge-defining shadow, and material-aware reflection control',
    materialLogic:
      'wood, plaster, metal, textile, glass, tile, concrete, patina, polish, grain, seams, and tactile construction details',
    compositionLogic:
      'cropped architectural-detail framing, modular spacing, planar overlap, threshold cuts, section-like reads, and deliberate negative space',
    moodLogic:
      'inhabitable atmosphere, design intent, tactile comfort or tension, and spatial personality without staged showroom dependency',
    finishLogic:
      'polished architectural visualization clarity with denoised surfaces, believable material response, no fake text, and no decor-catalog drift',
    defaultAvoid: ['showroom formula', 'chair or sofa focus', 'lamp hero', 'curtain wall default'],
  },
  'architectural-movements-and-vernaculars': {
    routerRole:
      'architectural movement grammar with tectonic mass, historical or speculative lineage, facade logic, ornament discipline, and structural silhouette',
    subjectSystem:
      'load-bearing mass, edge profile, facade rhythm, historic proportion, structural jointing, and movement-specific silhouette translation',
    paletteLogic:
      'period or movement-authentic base color, stone or envelope values, restrained accent hierarchy, metal or glass notes, and clear mass separation',
    lightLogic:
      'raking architectural light, deep reveal shadow, facade-edge rim, material bounce, and scale-defining contrast',
    materialLogic:
      'stone, concrete, plaster, timber, glass, metal, masonry, tile, craft detail, weathering, and envelope surface response',
    compositionLogic:
      'elevation fragments, sectional cuts, cropped facade anchors, axial or broken symmetry, scale cues, and movement-readable massing',
    moodLogic:
      'historical authority, civic ambition, domestic craft, experimental instability, or optimistic futurity carried by architecture itself',
    finishLogic:
      'clean built-form finish with readable structure, no postcard landmark dependency, no tourist facade copy, and no text or logo artifacts',
    defaultAvoid: ['named landmark copy', 'tourist postcard', 'generic facade', 'readable signage'],
  },
  'civic-infrastructure-and-specialty-spaces': {
    routerRole:
      'civic infrastructure grammar with public-use wear, technical service logic, institutional material memory, and specialty-space performance',
    subjectSystem:
      'infrastructure anchors, service junctions, public-scale material wear, modular containment, utility grids, and readable built function',
    paletteLogic:
      'civic neutrals, safety accents, oxidized metal, ceramic or concrete value blocks, damp fluorescents, and specialty glow cues',
    lightLogic:
      'fluorescent pressure, institutional bounce, service LEDs, humid or aquatic diffusion, buried low light, and public-space shadow compression',
    materialLogic:
      'tile, steel, concrete, glass, acrylic, brass, paper, bone-mineral substitutes, cables, patina, water stains, and public-use abrasion',
    compositionLogic:
      'tight infrastructure detail crops, service-grid repetition, compressed public thresholds, wayfinding rhythm, and specialty-space section logic',
    moodLogic:
      'public memory, controlled utility, preservation, overload, reverence, damp atmosphere, or quiet abandonment without turning into narrative scene',
    finishLogic:
      'high-readability infrastructure finish with denoised grime, non-readable wayfinding shapes, no UI/screens, and no corridor lock',
    defaultAvoid: [
      'long corridor',
      'people crowd',
      'readable map or sign',
      'office furniture focus',
    ],
  },
  'landscape-and-garden-systems': {
    routerRole:
      'landscape system grammar with terrain edge, planting structure, water or gravel control, climatic adaptation, and outdoor spatial choreography',
    subjectSystem:
      'ground-plane design, planting rhythm, edge containment, path pressure, clipped or wild massing, and climate-responsive material cues',
    paletteLogic:
      'botanical greens, mineral neutrals, climate-specific ochres or water blues, controlled bloom accents, and readable ground-plane contrast',
    lightLogic:
      'outdoor sun or shade logic, leaf-filtered light, water reflection, gravel-shadow texture, dew glints, and scale-setting atmospheric depth',
    materialLogic:
      'hedge, gravel, stone, corten, timber, waterline, grass, planted soil, glasshouse iron, condensation, and weathered landscape edging',
    compositionLogic:
      'cropped ground-plane anchors, axis or path geometry, planting layers, clipped sightlines, terrace bands, and detail-first landscape framing',
    moodLogic:
      'ceremonial control, domestic abundance, ecological reuse, dry-climate resilience, hospitality calm, or playful spatial misdirection',
    finishLogic:
      'crisp landscape-design finish with readable planting structure, no generic park lawn, no postcard vista, and no empty texture field',
    defaultAvoid: ['generic park lawn', 'postcard garden', 'people scene', 'blank texture field'],
  },
  'fantasy-and-mythic-architecture': {
    routerRole:
      'mythic architecture grammar with impossible structure, ritual scale, fantasy material logic, and believable load-bearing ornament',
    subjectSystem:
      'monumental mass, symbolic thresholds, carved or grown structure, impossible support, mineral or organic envelope logic, and sacred scale',
    paletteLogic:
      'mineral neutrals, moss and water glow, brass or gold heat, abyssal blues, spectral edge color, and restrained fantasy accents',
    lightLogic:
      'sacred glow, forge heat, underwater diffusion, cloud rim, mineral refraction, spectral low light, and monumental shadow hierarchy',
    materialLogic:
      'living wood, chiseled stone, hammered metal, steamwork brass, ice, crystal, candy-mass surrealism, bone marble, and rune-like non-text marks',
    compositionLogic:
      'detail-first mythic anchors, section cuts, undercut gravity, vertical compression, ritual thresholds, and scale without literal throne-room lock',
    moodLogic:
      'sublime, sacred, engineered, haunted, playful, abyssal, pastoral, or monumental pressure carried through structure and material',
    finishLogic:
      'high-control fantasy-architecture finish with coherent material logic, no licensed location read, no weapon or character dependency',
    defaultAvoid: [
      'licensed fantasy location',
      'throne room default',
      'weapon prop',
      'character hero',
    ],
  },
  'toy-craft-and-miniature-architecture': {
    routerRole:
      'toy, craft, and miniature construction grammar with visible fabrication, scale cues, modular seams, handmade material logic, and playful sectional clarity',
    subjectSystem:
      'model-scale mass, folded or molded construction, exposed seams, modular parts, softened toy geometry, and craft-readable joinery',
    paletteLogic:
      'material-authentic craft color, toy primary blocks, sugar or sand warmth, translucent glass tint, fungal cream, and small playful accents',
    lightLogic:
      'soft model shadows, glossy toy highlights, sugar sparkle, bottle refraction, damp sand sheen, and miniature display clarity',
    materialLogic:
      'paper fiber, ABS plastic, damp sand, corrugated cardboard, vinyl seams, icing, fungal skin, bottle glass, toy wood, and cutaway surfaces',
    compositionLogic:
      'close model-detail crops, section cuts, modular repetition, visible tabs or seams, scale compression, and object-like built logic',
    moodLogic:
      'playful craft, fragile impermanence, edible celebration, ecological miniature, curio precision, or sectional wonder without product-photo lock',
    finishLogic:
      'clean miniature finish with legible material scale, no brand logo, no product catalog staging, no empty abstract tile',
    defaultAvoid: ['brand logo', 'product photo', 'child or person scene', 'full-scale realism'],
  },
  'megastructure-and-impossible-space': {
    routerRole:
      'megastructure and impossible-space grammar with macro scale, recursive surfaces, habitat logic, optical paradox, and spatial contradiction',
    subjectSystem:
      'civilization-scale shell logic, recursive modules, curved habitat bands, monolithic severity, non-euclidean transitions, and compact utility systems',
    paletteLogic:
      'near-black structure, solar gold, technical beige, copper-brass, cyan or blue glow, graphite ribs, and controlled atmospheric haze',
    lightLogic:
      'rim light at scale, utility panel glow, star or solar emission, soft beacon light, paradox shadow, and depth-defining atmospheric falloff',
    materialLogic:
      'technical panels, copper-brass surfaces, graphite fins, matte black planes, circular hatches, retention straps, tactile glass, and braided cabling',
    compositionLogic:
      'macro-detail framing, looped circulation, horizon wrap, radial collector geometry, repeated modules, impossible thresholds, and severe scale cues',
    moodLogic:
      'awe, utility, paradox, spatial uncanniness, engineered civilization, or symbolic restraint without forcing a cockpit/control-room scene',
    finishLogic:
      'clean impossible-space finish with coherent recursion, scale readability, no named franchise interior, no central-console dependency',
    defaultAvoid: [
      'cockpit or control room',
      'central console',
      'named franchise interior',
      'spaceship corridor',
    ],
  },
};

const genericPatterns = [
  /\bvisual language with a clear stylistic thesis\b/i,
  /\bCreate a style-card that translates\b/i,
  /\bPreserve the preset identity through style mechanics\b/i,
  /\bDefine .+ through line, mass, contour\b/i,
  /\bUse lighting that makes .+ recognizable\b/i,
  /\bUse materials and textures that reinforce\b/i,
  /\bUse spatial behavior that fits\b/i,
  /\bSet a mood that belongs to\b/i,
  /\bPrioritize .+ key features\b/i,
];

const unsafeReplacements: Array<[RegExp, string]> = [
  [/\bstyle-card\b/gi, 'style sample'],
  [/\bthumbnail\b/gi, 'sample image'],
  [/\bforeground\b/gi, 'near-plane'],
  [/\bbackground\b/gi, 'distant-plane'],
  [/\bempty abstract tile\b/gi, 'empty abstraction'],
  [/\brooms?\b/gi, 'interior zones'],
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
  return visualValue(manifest, 'aesthetic').includes('transferable architecture/interior router');
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

  return normalized in categoryLanguage ? normalized : 'interior-design-systems';
}

function compactDescriptor(value: string) {
  return routerSafe(value)
    .replace(/\bUse an original\b/gi, '')
    .replace(/\bone readable\b/gi, 'readable')
    .replace(/\bwith readable\b/gi, 'with')
    .replace(/\bas a\b/gi, 'as')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\W+|\W+$/g, '');
}

function splitDescriptors(value: string) {
  return value
    .replace(/\.$/, '')
    .split(/,\s*/)
    .map((part) => compactDescriptor(part))
    .filter((part) => part.length > 2 && !/^and\b/i.test(part))
    .slice(0, 10);
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

function parsePrompt(prompt: string | undefined, manifest: StylePresetManifest): PromptParts {
  const fallback = `${manifest.name} spatial grammar`;
  if (!prompt) return { sourceCue: fallback, descriptors: [fallback], avoid: [] };

  const [positiveRaw, avoidRaw = ''] = prompt.split(/;\s*no\s+/i);
  const positive = compactDescriptor(positiveRaw);
  const anchorMatch = positive.match(/\banchor,?\s+(.+)$/i);
  const colonMatch = positive.match(/:\s*(.+)$/);
  const afterAnchor = anchorMatch?.[1] ?? colonMatch?.[1] ?? positive;
  const descriptors = splitDescriptors(afterAnchor);
  const sourceCue = descriptors.length > 0 ? descriptors.join(', ') : positive;

  return {
    sourceCue,
    descriptors: descriptors.length > 0 ? descriptors : [positive],
    avoid: splitAvoid(avoidRaw),
  };
}

async function loadDefaultPromptMap() {
  const sourcePath = path.join(process.cwd(), 'scripts', 'generate-style-defaults.ts');
  const source = await readFile(sourcePath, 'utf8');
  const prompts = new Map<string, string>();
  const regex = /if \(preset\.id === '(SP07-\d+)'\) \{\s*return '([^']+)';\s*\}/g;

  for (const match of source.matchAll(regex)) {
    prompts.set(match[1], match[2]);
  }

  return prompts;
}

function descriptorList(parts: PromptParts, limit = 6) {
  return parts.descriptors.slice(0, limit).join(', ');
}

function buildArchitectureDna(
  manifest: StylePresetManifest,
  language: CategoryArchitectureLanguage,
  parts: PromptParts,
) {
  const cue = descriptorList(parts, 8);
  const compactCue = descriptorList(parts, 5);
  const featureParts = [
    compactCue,
    language.subjectSystem,
    language.materialLogic,
    language.compositionLogic,
  ].map(routerSafe);

  return {
    aesthetic: sentence(
      `${manifest.name} acts as a transferable architecture/interior router: ${cue}; fuse it with ${language.routerRole}; route spatial grammar, material behavior, scale, ornament, and light over prompt X without requiring the default sample anchor, fixed spatial set, landscape setup, or object sample`,
    ),
    subject_treatment: sentence(
      `Preserve prompt subject, action, and context while translating any requested subject through ${language.subjectSystem}; treat ${compactCue} as massing, edge, surface, joinery, threshold, or ornament behavior rather than a mandatory building scene`,
    ),
    color_and_tone: sentence(
      `Map color through ${language.paletteLogic}; let source cues such as ${compactCue} decide accent hierarchy, material temperature, and value separation while staying attached to the requested content`,
    ),
    lighting_and_shadow: sentence(
      `Use ${language.lightLogic}; make light reveal joints, relief, material depth, scale, and atmosphere from ${compactCue} without replacing prompt X with a stock architectural render`,
    ),
    texture_and_material: sentence(
      `Render ${language.materialLogic}; prioritize the tactile signals in ${compactCue}, with believable surface response, denoised grain, coherent wear, and no generic wallpaper texture`,
    ),
    camera_and_composition: sentence(
      `Frame through ${language.compositionLogic}; convert ${compactCue} into reusable perspective, crop, depth, section, modular rhythm, and negative-space rules instead of one fixed style sample layout`,
    ),
    atmosphere_and_mood: sentence(
      `Carry mood through ${language.moodLogic}; the preset can support adult, strange, sensual, severe, playful, ominous, quiet, or monumental prompts when prompt X asks for them while keeping the architectural identity readable`,
    ),
    rendering_and_quality: sentence(
      `Finish with ${language.finishLogic}; keep clean denoise, legible construction, stable object or anatomy structure when applicable, no watermark, no fake readable text, no logo, no camera prop, and no prompt-literal card copy`,
    ),
    key_features: featureParts.join('; '),
    creative_brief: sentence(
      `Apply ${manifest.name} after prompt X as a transferable architecture/interior style layer: prompt X supplies subject, action, setting, tone, and intensity, while this preset supplies ${cue}, ${language.routerRole}, material discipline, spatial grammar, and negative controls without requiring a single spatial sample, product-photo setup, aisle-like default, or empty abstraction`,
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
    const parts = parsePrompt(defaultPrompts.get(manifest.id), manifest);
    manifest.visualDna = {
      ...manifest.visualDna,
      ...buildArchitectureDna(manifest, language, parts),
    };
    manifest.avoidRules = uniqueRules([
      ...(manifest.avoidRules ?? []),
      ...parts.avoid,
      ...language.defaultAvoid,
      'fixed building-only scene',
      'mandatory interior set',
      'corridor perspective',
      'furniture showroom',
      'market aisle',
      'library aisle',
      'empty abstract tile',
      'prompt-literal card',
      'readable text',
      'logo',
      'watermark',
      'camera prop',
    ]);
    manifest.attributes = {
      ...manifest.attributes,
      negativePrompt: manifest.avoidRules.join(', '),
    };

    changed += 1;

    if (dryRun) {
      console.log(`[pack07:dna] would update ${manifest.id} ${manifest.name}`);
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

  console.log(`[pack07:dna] ${dryRun ? 'dry-run' : 'updated'} presets=${changed}`);
}

await main();
