import { execFile } from 'node:child_process';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import * as yaml from 'js-yaml';

import type { StylePresetManifest } from '../../components/recipes/styles/manifestTypes';

const execFileAsync = promisify(execFile);
const packId = 'pack_03';
const presetDir = path.join(
  process.cwd(),
  'components',
  'recipes',
  'styles',
  'manifests',
  'presets',
  packId,
);

interface CgiCategoryLanguage {
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

const categoryLanguage: Record<string, CgiCategoryLanguage> = {
  'render-engines': {
    frame:
      'renderer-pipeline system built from sampling behavior, shader evaluation, light transport, denoise strategy, and engine-specific production polish',
    subjectLogic:
      'preserve the prompt subject while translating it through the renderer strengths: path tracing, biased sampling, real-time GI, product-studio preview, or feature-film shading',
    colorLogic:
      'make color come from color management, HDR response, spectral bloom, engine tonemapping, material albedo, and physically plausible exposure',
    lightLogic:
      'let engine-specific GI, ray tracing, Lumen, caustics, volume scattering, HDRI, or studio reflection control drive value hierarchy',
    materialLogic:
      'surface detail should reveal BSDF behavior, sampling clarity, shader networks, displacement, adaptive refinement, and material truth rather than a pasted texture',
    compositionLogic:
      'compose for renderer readability through focal hierarchy, product or VFX staging, material swatches, path-traced depth, and clean engine output',
    moodLogic:
      'derive mood from render fidelity, production confidence, cinematic polish, engine interactivity, or industrial design clarity',
    finishLogic:
      'finish with credible CGI output, controlled noise, accurate reflections, stable geometry, and no raw viewport or cheap preview look',
    defaultCue:
      'engine-specific light transport, shader evaluation, sampling polish, and production render clarity',
    avoidRules: ['raw viewport', 'unlit preview', 'wrong render engine', 'cheap preview noise'],
  },
  materials: {
    frame:
      'shader-material system built from reflectance, refraction, scattering, phase behavior, procedural structure, and physically coherent surface response',
    subjectLogic:
      'preserve the prompt subject while wrapping or transforming forms through the material behavior named by the preset',
    colorLogic:
      'let palette follow absorption, dispersion, subsurface tint, metallic reflectance, patina, mineral veining, transparency, or fluid coloration',
    lightLogic:
      'make highlights, caustics, shadow softness, transmission, internal glow, rim fuzz, photon paths, or specular lobe shape explain the material',
    materialLogic:
      'surface detail should keep scale-consistent shaders, bumps, strands, droplets, veining, casting marks, melt edges, weave, or simulated fluid motion',
    compositionLogic:
      'compose to demonstrate material behavior across silhouette, thickness, contact edges, reflection zones, and readable material transitions',
    moodLogic:
      'derive mood from luxury, fragility, tactile attraction, gross elasticity, scientific precision, craft, permanence, or uncanny material transformation',
    finishLogic:
      'finish with coherent shader response, clean denoise, readable forms, and no stock texture overlay pretending to be material simulation',
    defaultCue:
      'physically coherent shader response, material scale, edge behavior, and surface-specific light interaction',
    avoidRules: ['wrong material', 'pasted stock texture', 'flat color fill', 'shaderless surface'],
  },
  'lighting-and-atmosphere': {
    frame:
      'lighting and atmosphere system built from transport passes, volumetric density, bounce logic, occlusion, rim separation, and miniature scale cues',
    subjectLogic:
      'preserve the prompt subject while letting light, fog, occlusion, HDRI, or atmosphere define silhouette and spatial depth',
    colorLogic:
      'treat color as light temperature, atmospheric scattering, indirect bounce, fog color, HDRI influence, and exposure-managed contrast',
    lightLogic:
      'make the named light behavior visible through beams, bounced fill, contact shadows, edge halos, volume density, or three-point separation',
    materialLogic:
      'surface response should reveal air particles, shadow contact, glossy reflections, haze thickness, scale cues, and render-pass clarity',
    compositionLogic:
      'compose around the light event through depth layers, contact points, miniature isolation, rim edges, or atmospheric shafts without forcing a fixed locale',
    moodLogic:
      'derive mood from realism, wonder, product polish, sacred glow, softness, technical pass clarity, or spatial immersion',
    finishLogic:
      'finish with controlled exposure, clean shadow gradients, believable atmosphere, and no random glow or crushed darkness',
    defaultCue:
      'controlled light transport, atmospheric depth, shadow structure, and exposure-led spatial hierarchy',
    avoidRules: ['flat lighting', 'random glow overlay', 'crushed black', 'no shadow logic'],
  },
  '3d-styles': {
    frame:
      '3D style system built from modeling language, mesh abstraction, projection rules, topology display, toy material, paper logic, or stylized shader constraints',
    subjectLogic:
      'preserve the prompt subject while rebuilding it through the preset-specific 3D language; use facets, voxels, topology lines, clay, paper folds, toon bands, or procedural motion forms only when the preset calls for them',
    colorLogic:
      'use color through material simplification, cel ramps, toy plastic, paper fiber, retro CGI gradients, voxel palettes, or procedural motion accents',
    lightLogic:
      'shape light through the style constraint: simplified GI, toon bands, clay softness, wire visibility, toy shadows, paper fold light, or retro speculars',
    materialLogic:
      'surface detail should show the named construction system; cube faces, mesh edges, fold creases, clay fingerprints, topology overlays, procedural blobs, or low-poly facets should appear only when they belong to the preset',
    compositionLogic:
      'compose through projection, topology readability, object grouping, axis discipline, exploded or arranged parts, or stylized scale rhythm',
    moodLogic:
      'derive mood from toy-like clarity, technical breakdown, handmade stop-motion, abstract motion, retro CGI novelty, or procedural mathematical wonder',
    finishLogic:
      'finish with intentional stylization, clean geometry, stable silhouettes, and no accidental photoreal overwrite unless the preset asks for it',
    defaultCue:
      'preset-specific 3D construction logic, stylized geometry, shader constraint, and readable form hierarchy',
    avoidRules: [
      'accidental photorealism',
      'generic smooth mesh',
      'wrong geometry language',
      'messy topology',
    ],
  },
  'hard-surface-and-product-cgi': {
    frame:
      'hard-surface and product-CGI system built from bevel logic, manufactured surfaces, PBR maps, studio reflections, mechanical detailing, and premium reveal',
    subjectLogic:
      'preserve the prompt subject while giving it engineered silhouette logic, panel hierarchy, assembly clarity, product-grade surface control, or UI-material precision',
    colorLogic:
      'use color as manufactured finish: anodized metal, gunmetal, glass tint, enamel, ceramic, product neutrals, neon gas, or controlled brand-neutral accents',
    lightLogic:
      'shape light through studio strips, rim edges, reflection cards, display glow, automotive flow lines, gemstone fire, or product reveal gradients',
    materialLogic:
      'surface detail should show bevels, panel seams, normal maps, brushed metal, glass layers, stone facets, neon tubing, mechanical wear, or clean UI translucency',
    compositionLogic:
      'compose for engineered readability through exploded spacing, hero compression, orthographic clarity, packshot discipline, part hierarchy, or premium macro scale',
    moodLogic:
      'derive mood from precision, luxury, tactical engineering, clean retail desire, transhuman unease, or high-end interface tactility',
    finishLogic:
      'finish with exact edges, believable PBR response, controlled reflections, and no fake labels, muddy grime, or random greeble clutter',
    defaultCue:
      'engineered silhouette, precise bevels, PBR material truth, and studio-controlled CGI presentation',
    avoidRules: ['random greeble clutter', 'fake labels', 'muddy grime', 'organic blob shape'],
  },
  'organic-character-and-bio-cgi': {
    frame:
      'organic and character CGI system built from anatomy, grooming, cloth, soft-body simulation, food material, medical cutaway, and believable sculpt topology',
    subjectLogic:
      'preserve the prompt subject while routing it through organic form flow, garment dynamics, avatar readability, diagnostic cutaway, or appetizing surface simulation',
    colorLogic:
      'let color follow skin, cloth, food, biological tissue, mylar, medical material, fashion fabric, or stylized collectible accents without flattening the shader',
    lightLogic:
      'shape light through subsurface lift, cloth sheen, food steam, rim grooming, diagnostic clarity, reflective foil, or studio character presentation',
    materialLogic:
      'surface detail should show sculpt topology, pores, muscles, wrinkles, cloth weave, droplets, mylar seams, cutaway planes, or organic growth flow',
    compositionLogic:
      'compose for model readability through turnarounds, pose-neutral clarity, garment silhouette, cutaway hierarchy, appetizing macro, or avatar trait legibility',
    moodLogic:
      'derive mood from body realism, digital fashion spectacle, clinical explanation, collectible identity, craving, celebration, or uncanny organic transformation',
    finishLogic:
      'finish with stable anatomy or object structure, clean simulation, readable material detail, and no melted limbs or fake plastic skin',
    defaultCue:
      'organic simulation, sculpt topology, material softness, and character or biological model readability',
    avoidRules: ['melted anatomy', 'fake plastic skin', 'bad topology', 'rigging-breaking pose'],
  },
  'environment-and-worldbuilding': {
    frame:
      'environment and worldbuilding CGI system built from spatial design, modular assets, atmospheric scale, simulation logic, scan fidelity, and explorable depth',
    subjectLogic:
      "preserve the prompt subject while embedding it in the preset's world-scale CGI logic; environmental systems, scan detail, map elevation, VFX volume, or scientific structure should appear only when named by the preset",
    colorLogic:
      'use color through atmospheric grading, neon bloom, scientific false color, scan albedo, bioluminescent glow, map coding, or pyro temperature',
    lightLogic:
      'shape light with atmospheric depth, emissive ecology, VR bake, modular level lighting, smoke self-light, or scan-matched illumination',
    materialLogic:
      'surface detail should show modular kits, photogrammetry scan grain, terrain relief, vegetation glow, pyro volume, map elevation, or simulation particles',
    compositionLogic:
      'compose through spatial readability, player-scale cues, isometric elevation, explorable layers, environment silhouettes, or simulation flow',
    moodLogic:
      'derive mood from immersion, navigability, alien wonder, technical explanation, decay, abstract spatial rhythm, or procedural spectacle',
    finishLogic:
      'finish with coherent world scale, readable depth, optimized detail hierarchy, and no empty wallpaper or generic vista-only render',
    defaultCue:
      'spatial CGI readability, modular world logic, atmospheric scale, and simulation-aware environment detail',
    avoidRules: [
      'empty wallpaper',
      'generic vista-only render',
      'scale-less space',
      'unoptimized clutter',
    ],
  },
  'sensor-and-technical-shaders': {
    frame:
      'technical shader system built from sensor mapping, diagnostic palette, transparency rules, internal structure, and device-like signal clarity',
    subjectLogic:
      'preserve the prompt subject while remapping it through x-ray visibility, thermal signal, internal layering, or technical diagnostic abstraction',
    colorLogic:
      'use color as sensor output: monochrome x-ray values, heat gradients, cold-to-hot ramps, density contrast, and instrument-coded intensity',
    lightLogic:
      'make illumination behave like measurement: emissive heat, transparency, density falloff, internal glow, or diagnostic exposure instead of beauty lighting',
    materialLogic:
      'surface detail should show internal structure, transparent layers, signal noise, heat zones, bone-like density, or scanner-like edge clarity',
    compositionLogic:
      'compose through diagnostic readability, silhouette transparency, cross-section clarity, and instrument-like framing without fake UI dependence',
    moodLogic:
      'derive mood from scientific distance, surveillance unease, medical precision, or hidden-structure revelation',
    finishLogic:
      'finish with exact sensor logic, controlled artifacts, readable signal, and no cinematic beauty render overwrite',
    defaultCue:
      'diagnostic shader mapping, sensor palette, internal structure, and technical signal clarity',
    avoidRules: ['beauty lighting', 'wrong sensor palette', 'fake UI text', 'cinematic overpaint'],
  },
};

const presetFallbacks: Record<
  string,
  Partial<Record<keyof StylePresetManifest['visualDna'], string>>
> = {
  'SP03-003': {
    key_features:
      'biased GPU sampling; fast production GI; crisp speculars; controlled render noise',
  },
  'SP03-015': {
    key_features:
      'fingerprinted clay; stop-motion pose increments; miniature set lighting; handmade material charm',
  },
  'SP03-020': {
    key_features:
      'glazed ceramic translucency; milky porcelain surface; tiny crackle; polished rim highlights',
  },
  'SP03-027': {
    key_features:
      'implicit blob surfaces; merged rounded forms; smooth liquid topology; soft procedural joints',
  },
  'SP03-030': {
    key_features: 'broken meshes; vertex offsets; RGB shader errors; corrupted geometry fragments',
  },
  'SP03-040': {
    key_features: 'flat cel bands; inked contours; hard shadow steps; simplified 3D shader ramps',
  },
  'SP03-050': {
    key_features:
      'procedural 3D shapes; kinetic hierarchy; abstract product rhythm; keyframed graphic motion',
  },
  'SP03-056': {
    key_features:
      'simulation clarity; false-color data; clean educational render; measured scientific hierarchy',
  },
  'SP03-066': {
    key_features:
      'procedural non-figurative forms; depth fields; glossy abstract geometry; spatial color rhythm',
  },
  'SP03-070': {
    key_features:
      '1990s CGI primitives; chrome spheres; simple raytraced gradients; nostalgic render novelty',
  },
  'SP03-071': {
    key_features:
      'frosted translucent panels; soft UI depth; glass blur; layered interface reflections',
  },
  'SP03-072': {
    key_features:
      'soft extruded clay panels; rounded UI forms; matte pastel material; friendly depth shadows',
  },
};

const commonAvoidRules = [
  'wrong medium',
  'flat 2d paintover',
  'muddy AI noise',
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
    /\breusable 3D & CGI Rendering visual language\b/i,
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
    .replace(/\ba vertical style[- ]card crop\b/gi, 'an optional vertical composition discipline')
    .replace(/\bvertical style[- ]card crop\b/gi, 'vertical composition discipline')
    .replace(/\bstyle[- ]card crop\b/gi, 'composition discipline')
    .replace(/\bstyle[- ]card\b/gi, 'style sample')
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

  return normalized in categoryLanguage ? normalized : '3d-styles';
}

function fallbackFor(
  manifest: StylePresetManifest,
  key: keyof StylePresetManifest['visualDna'] & string,
  language: CgiCategoryLanguage,
) {
  const override = presetFallbacks[manifest.id]?.[key];
  if (override) return override;
  const featureOverride = presetFallbacks[manifest.id]?.key_features;

  const subject = manifest.name;
  if (featureOverride) {
    const featurePhrase = featureOverride.replace(/;\s*/g, ', ');
    const featureFallbacks: Partial<
      Record<keyof StylePresetManifest['visualDna'] & string, string>
    > = {
      aesthetic: `${subject} ${featurePhrase}`,
      subject_treatment: `adapt the requested subject through ${featurePhrase} while preserving its identity`,
      color_and_tone: `palette and exposure choices that support ${featurePhrase}`,
      lighting_and_shadow: `light behavior that reveals ${featurePhrase}`,
      texture_and_material: featurePhrase,
      camera_and_composition: `scale rhythm, spacing, and composition rules shaped by ${featurePhrase}`,
      atmosphere_and_mood: `mood carried by ${featurePhrase}`,
      rendering_and_quality: `finished ${subject} CGI with ${featurePhrase} and controlled detail`,
      creative_brief: `${subject} ${featurePhrase}`,
    };

    return featureFallbacks[key] ?? `${subject} ${featurePhrase}`;
  }

  const fallbacks: Partial<Record<keyof StylePresetManifest['visualDna'] & string, string>> = {
    aesthetic: `${subject} ${language.defaultCue}`,
    subject_treatment: `adapt the requested subject through ${language.defaultCue} while preserving its identity`,
    color_and_tone: `CGI color relationships, exposure control, and accent restraint specific to ${subject}`,
    lighting_and_shadow: `render-led value structure, specular control, and technical shadow behavior`,
    texture_and_material: language.defaultCue,
    camera_and_composition: `scale rhythm, focal hierarchy, geometry spacing, and composition rules specific to ${subject}`,
    atmosphere_and_mood: `mood carried by ${subject} rendering craft, material pressure, and visual restraint`,
    rendering_and_quality: `finished ${subject} CGI with clear shader evidence and controlled detail`,
    key_features: language.defaultCue,
    creative_brief: `${subject} ${language.defaultCue}`,
  };

  return fallbacks[key] ?? `${subject} ${language.defaultCue}`;
}

function cueValues(manifest: StylePresetManifest, language: CgiCategoryLanguage) {
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
  return aesthetic.includes('transferable CGI-style router');
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

  for (const cue of cues.flatMap((value) => value.split(';'))) {
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

function buildCgiDna(manifest: StylePresetManifest) {
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
      `${manifest.name} acts as a transferable CGI-style router: start from ${leadCues.join(', ')} and ${language.frame}, then apply the 3D/render behavior to prompt X instead of recreating a fixed demo image`,
    ),
    subject_treatment: sentence(
      `Transform any prompt subject through ${cue.subject}; ${language.subjectLogic}, keeping the requested identity, silhouette, pose, object function, or environment legible`,
    ),
    color_and_tone: sentence(
      `Build color with ${cue.color}; ${language.colorLogic}, with deliberate value grouping, exposure control, and medium-specific limits rather than generic color wash`,
    ),
    lighting_and_shadow: sentence(
      `Handle light through ${cue.light}; ${language.lightLogic}, so value structure supports the renderer and does not overwrite the requested content`,
    ),
    texture_and_material: sentence(
      `Render ${cue.texture}; ${language.materialLogic}, keeping material scale coherent and avoiding noisy filler texture`,
    ),
    camera_and_composition: sentence(
      `Structure the image through ${cue.composition}; ${language.compositionLogic}, with scale, spacing, edge rhythm, and visual hierarchy doing the style work`,
    ),
    atmosphere_and_mood: sentence(
      `Keep the mood ${cue.mood}; ${language.moodLogic}, letting the renderer alter interpretation without demanding a specific story, location, or character`,
    ),
    rendering_and_quality: sentence(
      `Finish with ${cue.finish}; ${language.finishLogic}, clean denoised surfaces where appropriate, and enough shader evidence to make the CGI mode recognizable`,
    ),
    key_features: featureCues.join('; '),
    creative_brief: sentence(
      `Apply ${manifest.name} as a CGI/render preset over prompt X: preserve the user's requested subject, then route modeling, shader response, lighting, material scale, composition, mood, and final render craft through ${briefCues} without requiring the card image's original subject`,
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
      ...buildCgiDna(sourceManifest),
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
      console.log(`[pack03:dna] would update ${manifest.id} ${manifest.name}`);
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

  console.log(`[pack03:dna] ${dryRun ? 'dry-run' : 'updated'} presets=${changed}`);
}

await main();
