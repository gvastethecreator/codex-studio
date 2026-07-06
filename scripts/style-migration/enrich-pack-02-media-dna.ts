import { execFile } from 'node:child_process';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import * as yaml from 'js-yaml';

import type { StylePresetManifest } from '../../components/recipes/styles/manifestTypes';

const execFileAsync = promisify(execFile);
const packId = 'pack_02';
const presetDir = path.join(
  process.cwd(),
  'components',
  'recipes',
  'styles',
  'manifests',
  'presets',
  packId,
);

interface MediaCategoryLanguage {
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

const categoryLanguage: Record<string, MediaCategoryLanguage> = {
  'film-genres': {
    frame:
      'cinematic genre system built from lens grammar, film stock, blocking pressure, edit rhythm, production design, grain, and color grade',
    subjectLogic:
      'preserve the requested subject while staging it as filmed material through blocking, wardrobe pressure, lens distance, movement cues, or genre-era performance texture only when useful',
    colorLogic:
      'treat color as cinema process: film emulsion, lab timing, gel lighting, period stock response, genre grade, faded print, or projection decay',
    lightLogic:
      'make light feel motivated by cinematic setup through keyed contrast, practical spill, hard noir cuts, musical glow, exploitation underexposure, or analog animation glow',
    materialLogic:
      'surface detail should reveal film grain, gate weave, scratches, halation, acetate texture, projection damage, optical compositing, or photographed production surfaces',
    compositionLogic:
      'compose through lens choice, blocking, aspect-ratio pressure, frame-within-frame logic, handheld unease, symmetrical staging, or genre silhouette hierarchy',
    moodLogic:
      'derive mood from cinematic tradition, performance tone, genre stakes, projection damage, auteur restraint, camp excess, or analog spectacle',
    finishLogic:
      'finish as credible moving-image language with controlled film artifacts, readable subject identity, and no mandatory plot scene, franchise copy, or fake caption text',
    defaultCue:
      'lens grammar, film stock behavior, genre blocking, projection texture, and cinematic color grade',
    avoidRules: [
      'mandatory plot scene',
      'franchise copy',
      'fake caption text',
      'generic movie poster',
    ],
  },
  'tv-and-broadcast': {
    frame:
      'broadcast-media system built from signal texture, studio or field capture, graphic package hierarchy, interlacing, compression, and live-transmission rhythm',
    subjectLogic:
      'preserve the requested subject while treating it as a broadcast capture, package segment, demo frame, replay, surveillance feed, music-video signal, or live information object',
    colorLogic:
      'use color through signal-safe palettes, studio blue, warning red, chroma spill, VHS drift, SD primaries, radar overlays, or cheap late-night product gloss',
    lightLogic:
      'shape light through even studio key, practical video exposure, screen glow, floodlight, surveillance flatness, confessional softness, or signal-break flicker',
    materialLogic:
      'surface detail should show video sharpness, scanlines, crawl bands, interlace, tape noise, chroma-key edge, compression blocks, or broadcast graphics as visual texture',
    compositionLogic:
      'compose through safe-title zones, lower-third-like geometry, split screens, scorebug rhythm, crawl lanes, multicam framing, or video-package layout without readable text dependency',
    moodLogic:
      'derive mood from live urgency, cheap sincerity, public-access awkwardness, sales pressure, institutional watching, stadium tension, or music-video rebellion',
    finishLogic:
      'finish as coherent broadcast signal with clean graphic hierarchy, intentional compression, and no anchor, desk, logo, UI screenshot, or readable caption requirement',
    defaultCue:
      'broadcast signal texture, package graphics, safe-frame composition, video compression, and live-media hierarchy',
    avoidRules: ['anchor requirement', 'desk requirement', 'readable captions', 'logo package'],
  },
  'animation-styles': {
    frame:
      'animation-production system built from motion-era drawing, cel paint, CG polish, stop-motion material, vector layers, camera multiplane, and shape acting',
    subjectLogic:
      'preserve the requested subject while translating it through cel shapes, squash, puppet material, vector rigs, CG feature polish, rotoscoped trace, or painted-frame continuity',
    colorLogic:
      'use color as animation pipeline evidence: cel palettes, painted backgrounds, limited UPA flats, stop-motion set tones, digital compositing, or comic-offset halftone',
    lightLogic:
      'make light follow the animation method through cel shadows, painted depth, puppet set lighting, CG bounce, flat graphic value, or rotoscope edge shimmer',
    materialLogic:
      'surface detail should reveal acetate grain, paper line, clay/fabric puppet material, vector fills, oil smears, pixel cells, or CG shader smoothness when named',
    compositionLogic:
      'compose through animation readability, pose clarity, painted-plate rhythm, squash arcs, graphic staging, multiplane depth, or frame-by-frame motion logic',
    moodLogic:
      'derive mood from feature warmth, rubber-hose chaos, stop-motion tactility, graphic modernism, anime atmosphere, or experimental motion craft',
    finishLogic:
      'finish with production-faithful animation surfaces, readable shapes, controlled artifacts, and no exact studio-character copy or random cartoon face substitution',
    defaultCue:
      'animation pipeline grammar, cel or puppet surface, shape acting, motion readability, and production-era finish',
    avoidRules: [
      'exact studio character copy',
      'random cartoon face',
      'unreadable motion smear',
      'fake subtitles',
    ],
  },
  'photography-eras': {
    frame:
      'historical photographic process system built from camera constraints, emulsion chemistry, lens softness, exposure timing, print surface, and era-specific color response',
    subjectLogic:
      'preserve the requested subject while making it feel captured through the era process: sitter stillness, flash harshness, instant-film intimacy, chemical plate tactility, or early digital sensor behavior',
    colorLogic:
      'treat color as historical capture chemistry: silver plate, hand-tinted autochrome grain, Kodachrome warmth, Polaroid dyes, disposable flash color, or cyan chemistry',
    lightLogic:
      'make light follow camera limitations through long exposure, flash falloff, lens vignetting, plate reflectance, daylight softness, or early-sensor clipping',
    materialLogic:
      'surface detail should reveal plate metal, paper border, dye cloud, film grain, dust, chemical streak, plastic-lens softness, instant emulsion, or sensor noise',
    compositionLogic:
      'compose through period camera distance, portrait stillness, casual snapshot crop, square instant frame, pinhole drift, or documentary era framing without requiring period costumes',
    moodLogic:
      'derive mood from memory, archival strangeness, family snapshot intimacy, laboratory chemistry, nostalgic color, or historical camera patience',
    finishLogic:
      'finish as credible photographic process with controlled grain and exposure artifacts, avoiding fake vintage filter overlays and readable border text',
    defaultCue:
      'historical camera process, emulsion behavior, lens constraints, print surface, and era-specific exposure artifacts',
    avoidRules: [
      'fake vintage filter',
      'readable border text',
      'modern phone clarity',
      'wrong camera process',
    ],
  },
  'lighting-and-atmosphere': {
    frame:
      'portable lighting and atmosphere system built from light transport, exposure behavior, optical distortion, volumetric density, reflection, and camera response',
    subjectLogic:
      'preserve the requested subject while letting the named light, atmosphere, or optical effect transform silhouette, depth, value, and surface response',
    colorLogic:
      'use color as light temperature, spectral split, water attenuation, neon bounce, candle warmth, night conversion, prism dispersion, or atmospheric scattering',
    lightLogic:
      'make the named light behavior visible through caustics, rim separation, bokeh, flare, strobe pulses, volumetric rays, split contrast, or softbox falloff',
    materialLogic:
      'surface detail should reveal particles, lens bloom, refraction, mist, glow halos, exposure rolloff, liquid distortion, or optical streaks without hiding prompt detail',
    compositionLogic:
      'compose around light direction, reflection planes, depth layers, exposure zones, silhouette edges, lens distortion, or atmospheric perspective without forcing a location',
    moodLogic:
      'derive mood from illumination physics: intimacy, dread, wonder, glamour, sacred haze, underwater quiet, neon danger, or temporal flash energy',
    finishLogic:
      'finish with believable exposure, clean denoise, readable subjects, and controlled optical artifacts rather than random glow or crushed darkness',
    defaultCue:
      'light transport, optical artifacts, exposure discipline, atmosphere depth, and camera-response behavior',
    avoidRules: [
      'random glow overlay',
      'crushed darkness',
      'mandatory location',
      'unmotivated light',
    ],
  },
  'caricature-and-cartoon-styles': {
    frame:
      'caricature and cartoon system built from exaggeration rules, line instability, body-shape grammar, adult-comedy timing, texture economy, and expressive deformation',
    subjectLogic:
      'preserve the requested subject while exaggerating proportion, contour, posture, line boil, paper crudeness, photo-cutout menace, or gross-up detail according to the preset',
    colorLogic:
      'use color through loud primaries, beige suburban anxiety, marker flats, mucus greens, toxic classroom tints, comic newspaper color, or deliberately ugly palette pressure',
    lightLogic:
      'shape light minimally through flat cartoon value, poster contrast, marker fill, gross-up close value, or uncanny cutout shadow when the style requires it',
    materialLogic:
      'surface detail should reveal crayon, marker edge, newspaper ink, xerox cutout, squiggle line, doodle grain, crude fill, or close-up texture without becoming noisy realism',
    compositionLogic:
      'compose through readable gag timing, grotesque close-up, slouch geometry, shared-body elongation, suburban emptiness, or crash-zoom pressure without copying a named scene',
    moodLogic:
      'derive mood from adult absurdity, nervous comedy, ugly-cute tension, gross humor, office boredom, toxic suburbia, or anti-polish personality',
    finishLogic:
      'finish with clear cartoon grammar, bold silhouettes, controlled roughness, and no exact character likeness, school-scene lock, readable gag text, or generic cute mascot',
    defaultCue:
      'cartoon exaggeration, adult-comedy timing, unstable line, ugly palette pressure, and expressive deformation',
    avoidRules: [
      'exact character likeness',
      'readable gag text',
      'generic cute mascot',
      'smooth anime polish',
    ],
  },
  'sensor-and-technical-imaging': {
    frame:
      'sensor-imaging system built from non-visible spectrum capture, diagnostic mapping, device artifacts, false color, and technical exposure constraints',
    subjectLogic:
      'preserve the requested subject while translating visible surfaces into internal structure, heat zones, night-vision gain, phosphor glow, or diagnostic density maps',
    colorLogic:
      'use color as sensor output: radiographic blues, thermal gradients, phosphor green, blackbody heat, scan density, or device-limited monochrome',
    lightLogic:
      'make illumination feel device-derived through backlit density, infrared gain, emissive heat, phosphor bloom, noise amplification, or translucent structure',
    materialLogic:
      'surface detail should reveal film sheet grain, sensor noise, edge halos, interior silhouettes, heat speckle, phosphor streak, or diagnostic plate texture',
    compositionLogic:
      'compose through scan-plane clarity, central diagnostic readability, density hierarchy, technical crop, and device perspective without requiring medical subject matter',
    moodLogic:
      'derive mood from clinical exposure, hidden structure, surveillance unease, spectral unreality, or technical discovery',
    finishLogic:
      'finish as credible sensor output with readable mapped structures, controlled noise, and no normal-color photo fallback or fake UI labels',
    defaultCue:
      'sensor modality, false-color mapping, diagnostic density, device noise, and non-visible-spectrum exposure',
    avoidRules: ['normal color photo', 'fake UI labels', 'medical-only subject', 'decorative glow'],
  },
  'hand-drawn-and-diy-media': {
    frame:
      'DIY media system built from informal marks, found surfaces, zine assembly, crude diagramming, deck graphics, cave pigment, and hand-made reproduction texture',
    subjectLogic:
      'preserve the requested subject while rebuilding it through whiteboard strokes, crumpled-paper scribbles, primitive pigment, zine cuts, skateboard-deck composition, or napkin blueprint logic',
    colorLogic:
      'use color through dry-erase primaries, paper grey, cave ochres, xerox black, punk collage hits, deck enamel, or improvised marker accents',
    lightLogic:
      'keep light secondary to surface evidence through flat scan lighting, paper shadow, primitive wall texture, or graphic ink contrast',
    materialLogic:
      'surface detail should reveal marker squeak, paper wrinkles, cave-grain pigment, tape, photocopy dirt, deck varnish, napkin fiber, or zine cut edges',
    compositionLogic:
      'compose through casual diagram layout, pasted fragments, object-on-surface graphic balance, hand-drawn arrows without readable text, and rough spatial shorthand',
    moodLogic:
      'derive mood from improvised problem-solving, punk urgency, outsider charm, ancient ritual memory, office boredom, or homemade design energy',
    finishLogic:
      'finish with honest DIY texture, readable prompt identity, and no polished corporate vector, fake readable notes, or clean studio poster default',
    defaultCue:
      'informal mark-making, found surface, DIY reproduction texture, crude diagram logic, and handmade graphic pressure',
    avoidRules: [
      'polished corporate vector',
      'fake readable notes',
      'clean studio poster',
      'stock illustration polish',
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
  'generic stock footage',
  'uncontrolled noise',
];

const presetFallbacks: Partial<
  Record<string, Partial<Record<keyof StylePresetManifest['visualDna'] & string, string>>>
> = {
  'SP02-006': {
    aesthetic:
      '1970s grindhouse projection damage with lurid B-movie color, torn-splice rhythm, cue marks, and exploitation-print decay',
    subject_treatment:
      'filmed-subject grit, low-budget blocking, sweaty texture pressure, and damaged print artifacts without requiring violence or a specific plot',
  },
  'SP02-015': {
    aesthetic:
      'mumblecore indie-video naturalism with awkward handheld intimacy, ungraded daylight, soft consumer-camera texture, and conversational looseness',
    subject_treatment:
      'ordinary lived-in presence, understated motion, soft focus drift, and improvisational framing without forcing a dialogue scene',
  },
  'SP02-018': {
    aesthetic:
      'live news-broadcast package with cool blue authority, red alert accents, lower-third geometry, ticker rhythm, and crisp HD studio signal',
    subject_treatment:
      'information-first framing, subject-as-current-event hierarchy, graphic bands, and authoritative flatness without requiring anchors or desks',
  },
  'SP02-025': {
    aesthetic:
      'late-night infomercial product-demo energy with cheap primaries, overlit video, split-screen comparison logic, and urgent sales rhythm',
  },
  'SP02-026': {
    aesthetic:
      'live sports broadcast grammar with telephoto compression, scorebug-like composition, saturated field color, floodlights, and replay clarity',
  },
  'SP02-027': {
    aesthetic:
      'weather-channel forecast graphics with radar color bands, Doppler sweep rhythm, isobar-like linework, and composited information layers',
    subject_treatment:
      'map-like transformation, pressure-line overlays, readable hazard color zones, and forecast-package hierarchy without needing real map labels',
  },
  'SP02-028': {
    aesthetic:
      '1990s MTV grunge broadcast with distressed film, jump cuts, video feedback, scribble graphics, and anti-polish music-video aggression',
    subject_treatment:
      'fragmented music-video treatment, jittered contours, scribble overlays, and rebellious cut rhythm without forcing a band performance',
  },
  'SP02-039': {
    aesthetic:
      'UPA mid-century animation design with flat geometric reduction, jazz-era negative space, angular silhouettes, and limited modernist color',
    subject_treatment:
      'graphic shape simplification, crisp abstract contour, and minimal animation-ready construction that keeps the prompt readable',
  },
  'SP02-058': {
    aesthetic:
      'radiographic x-ray imaging with translucent density mapping, phosphor-sheet glow, skeletal/interior structure logic, and clinical negative contrast',
    subject_treatment:
      'internal-structure translation, translucent silhouette density, and diagnostic layer hierarchy without requiring bones or a medical subject',
  },
  'SP02-077': {
    aesthetic:
      'underwater optical lighting with liquid refraction, cyan attenuation, caustic net projection, suspended particles, and softened depth edges',
    subject_treatment:
      'caustic projection, refractive wobble, fluid lens distortion, and depth-filtered silhouettes without requiring ocean subject matter',
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
    .replace(/\bthumbnail\b/gi, 'small-read style study')
    .replace(/\bmonster-card\b/gi, 'cartoon-design card')
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

  return normalized in categoryLanguage ? normalized : 'film-genres';
}

function safeName(manifest: StylePresetManifest) {
  return sanitizeSceneLockWords(manifest.name);
}

function fallbackFor(
  manifest: StylePresetManifest,
  key: keyof StylePresetManifest['visualDna'] & string,
  language: MediaCategoryLanguage,
) {
  const override = presetFallbacks[manifest.id]?.[key];
  if (override) return override;

  const subject = safeName(manifest);
  const fallbacks: Partial<Record<keyof StylePresetManifest['visualDna'] & string, string>> = {
    aesthetic: `${subject} ${language.defaultCue}`,
    subject_treatment: `adapt the requested subject through ${language.defaultCue} while preserving prompt identity`,
    color_and_tone: `process-native palette relationships, deliberate contrast, and signal or film color logic for ${subject}`,
    lighting_and_shadow:
      'process-led exposure structure, readable highlights, and style-specific shadow behavior',
    texture_and_material: language.defaultCue,
    camera_and_composition: `scale rhythm, frame hierarchy, lens distance, and composition rules specific to ${subject}`,
    atmosphere_and_mood: `mood carried by ${subject} media process, signal pressure, and visual restraint`,
    rendering_and_quality: `finished ${subject} media craft with clear process evidence and controlled detail`,
    key_features: language.defaultCue,
    creative_brief: `${subject} ${language.defaultCue}`,
  };

  return fallbacks[key] ?? `${subject} ${language.defaultCue}`;
}

function cueValues(manifest: StylePresetManifest, language: MediaCategoryLanguage) {
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
    aesthetic.includes('transferable cinematic-media router') ||
    aesthetic.includes('cinematic and media router')
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

function buildMediaDna(manifest: StylePresetManifest) {
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
      `${name} acts as a transferable cinematic-media router: start from ${leadCues.join(', ')} and ${language.frame}, then apply the media behavior to prompt X instead of recreating a fixed demo image`,
    ),
    subject_treatment: sentence(
      `Transform any prompt subject through ${cue.subject}; ${language.subjectLogic}, keeping the requested identity, silhouette, action, object function, or setting legible`,
    ),
    color_and_tone: sentence(
      `Build color with ${cue.color}; ${language.colorLogic}, with deliberate value grouping, accent control, and process-specific limits rather than generic color wash`,
    ),
    lighting_and_shadow: sentence(
      `Handle light through ${cue.light}; ${language.lightLogic}, so exposure and shadow structure support the media process without overwriting the requested content`,
    ),
    texture_and_material: sentence(
      `Render ${cue.texture}; ${language.materialLogic}, keeping artifact scale coherent and avoiding noisy filler texture`,
    ),
    camera_and_composition: sentence(
      `Structure the image through ${cue.composition}; ${language.compositionLogic}, with frame rhythm, spacing, edge hierarchy, and visual hierarchy doing the style work`,
    ),
    atmosphere_and_mood: sentence(
      `Keep the mood ${cue.mood}; ${language.moodLogic}, letting the media style alter interpretation without demanding a specific story, location, or actor`,
    ),
    rendering_and_quality: sentence(
      `Finish with ${cue.finish}; ${language.finishLogic}, clean denoised surfaces where appropriate, and enough process evidence to make the style recognizable`,
    ),
    key_features: featureCues.join('; '),
    creative_brief: sentence(
      `Apply ${name} as a cinematic-media preset over prompt X: preserve the user's requested subject, then route lens behavior, palette, light, signal or film texture, composition, mood, and final media craft through ${briefCues} without requiring the card image's original subject`,
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
      ...buildMediaDna(sourceManifest),
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
      console.log(`[pack02:dna] would update ${manifest.id} ${manifest.name}`);
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

  console.log(`[pack02:dna] ${dryRun ? 'dry-run' : 'updated'} presets=${changed}`);
}

await main();
