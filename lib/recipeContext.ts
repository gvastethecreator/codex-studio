import type { ImageGenerationConfig, RecipeId } from '../types';
import { extractRecipeIdFromRecipeContext } from '../packages/shared/src';

type RegisteredRecipeId = Exclude<RecipeId, null>;
type RecipeContextParams = Record<string, unknown>;

interface RecipeContextBuilder {
  readonly protocol: string;
  readonly title: string;
  buildContext: (params: RecipeContextParams) => string;
}

const PROTOCOL = 'codex-recipe-v1';

const CHARACTER_LAYOUT_PROMPTS: Record<string, string> = {
  'Classic Turnaround':
    'a character turnaround reference sheet. Aim for 3 full-body views of the character in a neutral A-pose, arranged horizontally: 1. Front View 2. Side View (Left Profile) 3. Back View. Keep the head and feet visually aligned where possible.',
  'Isometric Sheet':
    'a full character sheet with multiple isometric views of the same character in a neutral A-pose. Aim for 4 views: 1. Front-Right Isometric 2. Front-Left Isometric 3. Back-Right Isometric 4. Back-Left Isometric. Prefer a clean 2x2 grid.',
  'Dynamic Sheet':
    'a dynamic character pose sheet. Aim for 3 views of the character: 1. A main, full-body dynamic action pose. 2. A close-up portrait with a neutral expression. 3. A three-quarter back view.',
  'Expression Sheet':
    'a facial expression sheet. Focus on the head and shoulders. Aim for 6 distinct emotional states (e.g., Neutral, Angry, Happy, Sad, Surprised, Combat-Ready) arranged in a readable 2x3 grid.',
  'Wireframe Sheet':
    'the character visualized as a 3D wireframe-style model, with the form suggested through polygon mesh lines and a visible grid pattern.',
  'Anatomy Sheet':
    "an anatomical reference sheet in the style of a medical or artist's illustration. Show a detailed view of the character's musculature and skeletal structure.",
  'Clothing Layers': "a character sheet showing an 'exploded view' of the character's clothing.",
};

function getString(params: RecipeContextParams, key: string, fallback = '') {
  const value = params[key];
  return typeof value === 'string' ? value : fallback;
}

function getNumber(params: RecipeContextParams, key: string, fallback = 0) {
  const value = params[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function getBoolean(params: RecipeContextParams, key: string, fallback = false) {
  const value = params[key];
  return typeof value === 'boolean' ? value : fallback;
}

function getRecord(params: RecipeContextParams, key: string) {
  const value = params[key];
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function recipeDocument(recipeId: RegisteredRecipeId, title: string, body: string) {
  return [
    '--- CODEX RECIPE CONTEXT ---',
    `protocol: ${PROTOCOL}`,
    `recipe: ${recipeId}`,
    `title: ${title}`,
    '',
    body.trim(),
    '--- END CODEX RECIPE CONTEXT ---',
  ].join('\n');
}

function buildCharacterContext(params: RecipeContextParams) {
  const layout = getString(params, 'layout', 'Classic Turnaround');
  const style = getString(params, 'style', 'Preserve Source Style');
  const shot = getString(params, 'shot', 'Full Body');
  const focus = getString(params, 'focus', 'General Design');
  const hasReference = getBoolean(params, 'hasReference');
  const layoutInstruction =
    CHARACTER_LAYOUT_PROMPTS[layout] || CHARACTER_LAYOUT_PROMPTS['Classic Turnaround'];
  const styleInstruction =
    style === 'Preserve Source Style'
      ? "Use the reference image's art style (line weight, shading, color palette) as the main style guide."
      : `RENDER STYLE: ${style.toUpperCase()}. Ignore reference image style if it conflicts.`;

  const recipeSchema = {
    task_id: 'CHARACTER_DESIGN_SHEET',
    mode: hasReference ? 'REFERENCE_GUIDED_CHARACTER_SHEET' : 'ORIGINAL_CONCEPT_GENERATION',
    layout_specs: {
      type: layout.toUpperCase(),
      shot_framing: shot.toUpperCase(),
      detailed_instruction: layoutInstruction,
      view_consistency: 'CHARACTER_GUIDED_MATCH',
      background: 'NEUTRAL_STUDIO_WHITE_OR_GREY',
    },
    art_direction: {
      style_mode: style.toUpperCase(),
      design_focus: focus.toUpperCase(),
      instruction: styleInstruction,
    },
    directives: [
      `Generate a professional ${layout}.`,
      layoutInstruction,
      `Use ${shot} framing as the target crop.`,
      `Emphasize and detail elements related to: ${focus}.`,
      hasReference
        ? 'Use the input reference image as the identity guide. Preserve costume, physique, colors, and facial features as closely as possible in the requested layout.'
        : "Design a unique, cohesive character based on the user's prompt.",
      styleInstruction,
      'Aim for consistent design details, proportions, and colors across all views/panels.',
      'Use high contrast and clean lines so the output works as a local concept reference.',
      'Do not include any text, labels, or watermarks.',
    ],
  };

  return recipeDocument(
    'character',
    'CHARACTER SHEET PROMPT',
    [
      'Target: Concept Art Asset',
      `Context: ${JSON.stringify(recipeSchema, null, 2)}`,
      'Output: one clean character sheet image.',
    ].join('\n'),
  );
}

function buildCinematicContext(params: RecipeContextParams) {
  const frames = Math.max(1, getNumber(params, 'frames', 9));
  const rows = Math.max(1, getNumber(params, 'rows', 3));
  const cols = Math.max(1, getNumber(params, 'cols', 3));
  const aspectRatio = getString(params, 'aspectRatio', '1:1');
  const frameShots = getRecord(params, 'frameShots');
  const genre = getString(params, 'genre', 'Auto-Detect');
  const tone = getString(params, 'tone', 'Auto-Detect');
  const lighting = getString(params, 'lighting', 'Auto-Detect');
  const time = getString(params, 'time', 'Auto-Detect');
  const weather = getString(params, 'weather', 'Auto-Detect');
  const movement = getString(params, 'movement', 'Auto-Detect');
  const lens = getString(params, 'lens', 'Auto-Detect');

  const layoutDescription = `${rows} rows by ${cols} columns`;
  const layoutInstruction =
    frames === 3
      ? `Create a cinematic triptych (${layoutDescription}).`
      : frames === 6
        ? `Create a 6-frame storyboard grid (${layoutDescription}).`
        : 'Create a 9-frame storyboard contact sheet (3x3 grid).';

  const frameDirectives = Object.entries(frameShots)
    .map(([index, shot]) =>
      typeof shot === 'string' && shot !== 'Auto'
        ? `- Frame ${Number(index) + 1}: ${shot} Shot`
        : null,
    )
    .filter(Boolean);

  const frameInstructions =
    frameDirectives.length > 0 ? `\nSPECIFIC FRAME SHOTS:\n${frameDirectives.join('\n')}` : '';

  return recipeDocument(
    'cinematic',
    'STORYBOARD CONTACT SHEET',
    `
ROLE: Director of Photography, Colorist, and Storyboard Artist.
TASK: Create a storyboard-style image sequence based on the prompt/reference.
LAYOUT: ${layoutInstruction}
FRAMES: ${frames}
ASPECT RATIO: ${aspectRatio}

PARAMETERS:
- Genre: ${genre}
- Tone: ${tone}
- Lighting: ${lighting} (Keep light direction and quality coherent across frames where possible)
- Time: ${time}
- Weather: ${weather}
- Camera Movement: ${movement} (Use this as the visual camera language across frames)
- Lens/Focal Length: ${lens} (Apply appropriate depth of field and distortion)${frameInstructions}

DIRECTIVES:
1. CONTINUITY: Aim for visual continuity of character, setting, and lighting logic across all frames.
2. NARRATIVE: Suggest a micro-story: Setup -> Action -> Reaction.
3. AESTHETIC: High fidelity photorealism with professional color grading matching the chosen Tone and Genre.
4. COMPOSITION: Apply rule of thirds, leading lines, and cinematic framing techniques. Respect the specific frame shots if provided.
5. NO TEXT: Avoid text, UI elements, and watermarks in the generated frames.
  `,
  );
}

function buildRemasterContext(params: RecipeContextParams) {
  const style = getString(params, 'style', 'Realistic Reconstruction');
  const lighting = getString(params, 'lighting', 'Lighting Correction');
  const camera = getString(params, 'camera', 'Sharp Focus');
  const anatomy = getString(params, 'anatomy', 'Fix Anatomy');
  const text = getString(params, 'text', 'Rewrite Logically');
  const color = getString(params, 'color', 'Expanded Dynamic Range');
  const fidelity = Math.max(0, Math.min(100, getNumber(params, 'fidelity', 35)));
  const adherence = fidelity / 100;
  const creativity = (100 - fidelity) / 100;

  return recipeDocument(
    'remaster',
    'PRO RESTORATION',
    `
**Task:** Image Remastering and Restoration.
**Role:** Use the reference image as the main source for a polished local remaster.
**Goal:** Enhance the provided reference image while keeping its original composition and subject matter recognizable.

**Core Directives:**
- **Style Interpretation:** Apply a '${style}' aesthetic.
- **Lighting Correction:** Adjust lighting based on '${lighting}'. Favor realistic light falloff and shadow detail.
- **Anatomical Correction:** ${anatomy}. Reduce visible structural inconsistencies or artifacts where possible.
- **Text Handling:** ${text}.
- **Lens & Detail:** Focus on '${camera}'. Enhance micro-contrast and edge sharpness.
- **Color Grading:** Apply '${color}' grading. Balance white levels and enhance tonal range.

**Fidelity Control:**
- **Adherence to Original Composition:** ${adherence.toFixed(2)} (High value means stay very close to the source structure and layout).
- **Creative Enhancement Freedom:** ${creativity.toFixed(2)} (High value allows for more stylistic interpretation and hallucination of missing details).

**Final Instruction:** Generate one clean remastered image, not a description. Avoid watermarks or added text unless explicitly requested.
  `,
  );
}

function buildSpritesheetContext(params: RecipeContextParams) {
  const view = getString(params, 'view', 'Match Source');
  const style = getString(params, 'style', 'Preserve Style');
  const grid = getString(params, 'grid', '2x2');
  const background = getString(params, 'background', 'Dark Grey');
  const dividers = getString(params, 'dividers', 'No Dividers');
  const customColor = getString(params, 'customColor', '#3f3f46');
  const cellPrompts = getRecord(params, 'cellPrompts');
  const [gridCols, gridRows] = grid.includes('Strip')
    ? [6, 1]
    : grid.split('x').map((value) => Number(value));
  const hasDividers = dividers !== 'No Dividers';
  const dividerColor = dividers.split(' ')[0].toUpperCase();

  let bgDirective = background.toUpperCase();
  if (background.includes('Green')) bgDirective = 'SOLID_GREEN_#00FF00';
  else if (background === 'Custom') bgDirective = `SOLID_COLOR_${customColor.toUpperCase()}`;
  else if (background === 'Black') bgDirective = 'SOLID_BLACK';

  const cellDirectives = Object.entries(cellPrompts)
    .filter(([, prompt]) => typeof prompt === 'string' && prompt.trim() !== '')
    .map(([index, prompt]) => `Cell ${Number(index) + 1}: ${String(prompt)}`);

  const recipeSchema = {
    task_id: 'SPRITESHEET_GENERATION',
    layout_constraints: {
      type: 'GRID_SHEET',
      columns: gridCols,
      rows: gridRows,
      total_cells: gridCols * gridRows,
      cell_separation: hasDividers ? `VISIBLE_${dividerColor}_LINES` : 'NO_VISIBLE_SEPARATION',
      consistency: 'CHARACTER_GUIDED',
    },
    visual_style: {
      perspective: view === 'Match Source' ? 'INFER_FROM_SOURCE_IMAGE' : view.toUpperCase(),
      rendering: style === 'Preserve Style' ? 'SOURCE_CONSISTENT' : style.toUpperCase(),
      background_color: bgDirective,
    },
    cell_specifics:
      cellDirectives.length > 0
        ? cellDirectives
        : 'Suggest a readable pose or animation cycle (e.g., walk, run, idle, or attack).',
    directives: [
      'Generate a clean 2D game sprite sheet concept.',
      `Target layout is ${gridCols} columns by ${gridRows} rows; keep the grid easy to read and crop.`,
      'Aim to keep proportions, colors, and design details consistent across cells.',
      view === 'Match Source'
        ? 'Use the input image perspective as a guide across all frames.'
        : `Use ${view} as the target perspective.`,
      hasDividers
        ? `Draw clear ${dividerColor} divider lines between cells as a slicing guide.`
        : 'Avoid visible grid lines or dividers.',
      'Keep clear separation and alignment for local asset review.',
      'Keep the background uniform and clean.',
    ],
  };

  return recipeDocument(
    'spritesheet',
    'SPRITE SHEET PROMPT',
    [
      'Target: Game Asset Generation',
      `Context: ${JSON.stringify(recipeSchema, null, 2)}`,
      'Output: one clean sprite sheet image with readable cells.',
    ].join('\n'),
  );
}

function buildCameraContext(params: RecipeContextParams) {
  const azimuth = Math.round(getNumber(params, 'azimuth', 0));
  const elevation = Math.round(getNumber(params, 'elevation', 0));
  const distance = Math.round(getNumber(params, 'distance', 100));
  const hasReference = getBoolean(params, 'hasReference');
  const hPos = getString(params, 'hPos', 'FRONT CENTER (0°)');
  const vPos = getString(params, 'vPos', 'EYE-LEVEL');
  const framing = getString(params, 'framing', 'MEDIUM SHOT');
  const geometryConstraints = getString(params, 'geometryConstraints');

  return recipeDocument(
    'camera',
    'CAMERA VIEW PROMPT',
    `
ROLE: Image art director translating a reference and camera position into a plausible generated still.
${hasReference ? 'INPUT: A 2D reference image used as visual guidance for subject identity, style, and lighting.' : 'INPUT: A text description of the subject to be composed.'}
OBJECTIVE: Generate a ${hasReference ? 'plausible alternate view of the referenced subject' : 'subject image'} using the camera guidance below.

TARGET CAMERA TRANSFORM:
- ORBIT (Azimuth): ${azimuth}° (${hPos})
- PITCH (Elevation): ${elevation}° (${vPos})
- ZOOM (Field of View): ${distance}% (${framing})

VISUAL GUIDANCE:
${geometryConstraints}

GENERATION DIRECTIVES:
1. Keep subject identity, outfit, palette, and lighting as consistent as possible with the prompt/reference.
2. Use the requested orbit, pitch, and zoom as strong composition guidance.
3. Add plausible matching details for areas not visible in the reference.
4. Preserve the reference style where possible; prefer a neutral background when the source background is ambiguous.
  `,
  );
}

function buildTimelineContext(params: RecipeContextParams) {
  const nextIndex = getNumber(params, 'nextIndex', 1);
  const direction = getString(params, 'direction', 'forward');
  const timeDeltaValue = getString(params, 'timeDeltaValue', 'SHORT_TERM_CONSEQUENCE');
  const timeDeltaLabel = getString(params, 'timeDeltaLabel', 'Seconds');
  const cameraMode = getString(params, 'cameraMode', 'locked');
  const motionAmount = getString(params, 'motionAmount', 'Subtle');
  const lightingMode = getString(params, 'lightingMode', 'Locked');
  const isAnchored = getBoolean(params, 'isAnchored');
  const directionPrompt =
    direction === 'forward'
      ? 'NEXT FRAME: Generate a plausible future state.'
      : 'PREVIOUS FRAME: Generate a plausible past state.';

  const recipeSchema = {
    task_id: 'TIMELINE_FRAME_GUIDANCE',
    sequence_index: nextIndex,
    direction: direction.toUpperCase(),
    time_delta: timeDeltaValue,
    visual_guidance: {
      camera_behavior: cameraMode.toUpperCase(),
      subject_motion: motionAmount.toUpperCase(),
      lighting_continuity: lightingMode.toUpperCase(),
    },
    context_mode: isAnchored ? 'ANCHORED_STABILITY' : 'FREE_FLOW',
    instructions: [
      directionPrompt,
      `Time elapsed: ${timeDeltaLabel}. Use this to guide the amount of scene change.`,
      `Motion Level: ${motionAmount}. Use this as a cue for pose, position, or state change.`,
      `Lighting: ${lightingMode}. Keep shadows and highlights coherent if time has passed.`,
      isAnchored
        ? "Use the 'Anchor' image as the identity/style guide, and the 'Ref' image as the current state guide."
        : 'Keep visual identity and style close to the reference image.',
      'Output should read like a neighboring storyboard frame in the same sequence.',
      'Avoid text, UI, and watermarks.',
    ],
  };

  return recipeDocument('timeline', 'TIMELINE FRAME PROMPT', JSON.stringify(recipeSchema, null, 2));
}

function buildStylesContext(params: RecipeContextParams) {
  const presetName = getString(params, 'presetName', 'Unnamed Style');
  const mode = getString(params, 'mode', 'DIRECT_STYLE_SYNTHESIS');
  const roleInstruction = getString(params, 'roleInstruction');
  const compositionRule = getString(params, 'compositionRule');
  const styleEmphasis = getString(params, 'styleEmphasis');
  const aesthetic = getString(params, 'aesthetic', 'Standard');
  const subjectTreatment = getString(params, 'subjectTreatment', 'Standard');
  const colorTone = getString(params, 'colorTone', 'Standard');
  const lightingShadow = getString(params, 'lightingShadow', 'Standard');
  const textureMaterial = getString(params, 'textureMaterial', 'Standard');
  const cameraComposition = getString(params, 'cameraComposition', 'Standard');
  const atmosphereMood = getString(params, 'atmosphereMood', 'Standard');
  const renderingQuality = getString(params, 'renderingQuality', 'Standard');

  return recipeDocument(
    'styles',
    'STYLE TRANSFER PROTOCOL',
    `
TARGET STYLE: ${presetName.toUpperCase()}
MODE: ${mode}

[DIRECTIVES]
${roleInstruction}

[VISUAL DNA]
- Core Aesthetic: ${aesthetic}
- Subject Treatment: ${subjectTreatment}
- Color & Tone: ${colorTone}
- Lighting & Shadow: ${lightingShadow}
- Texture & Material: ${textureMaterial}
- Camera & Composition: ${cameraComposition}
- Atmosphere & Mood: ${atmosphereMood}
- Rendering & Quality: ${renderingQuality}

[EXECUTION RULES]
${compositionRule}
${styleEmphasis}
DO NOT output text or explanations. Just the image.
  `,
  );
}

const builders: Record<RegisteredRecipeId, RecipeContextBuilder> = {
  character: {
    protocol: PROTOCOL,
    title: 'CHARACTER SHEET PROMPT',
    buildContext: buildCharacterContext,
  },
  cinematic: {
    protocol: PROTOCOL,
    title: 'STORYBOARD CONTACT SHEET',
    buildContext: buildCinematicContext,
  },
  remaster: {
    protocol: PROTOCOL,
    title: 'PRO RESTORATION',
    buildContext: buildRemasterContext,
  },
  spritesheet: {
    protocol: PROTOCOL,
    title: 'SPRITE SHEET PROMPT',
    buildContext: buildSpritesheetContext,
  },
  camera: {
    protocol: PROTOCOL,
    title: 'CAMERA VIEW PROMPT',
    buildContext: buildCameraContext,
  },
  timeline: {
    protocol: PROTOCOL,
    title: 'TIMELINE FRAME PROMPT',
    buildContext: buildTimelineContext,
  },
  styles: {
    protocol: PROTOCOL,
    title: 'STYLE TRANSFER PROTOCOL',
    buildContext: buildStylesContext,
  },
};

export function buildRecipeContext(
  recipeId: RegisteredRecipeId | null | undefined,
  params: RecipeContextParams | null | undefined,
) {
  if (!recipeId || !params) {
    return '';
  }

  const builder = builders[recipeId];
  if (!builder) {
    return '';
  }

  return builder.buildContext(params);
}

export function resolveGenerationConfig(config: ImageGenerationConfig): ImageGenerationConfig {
  const recipeContext = config.recipeId
    ? buildRecipeContext(config.recipeId, config.recipeParams ?? null) || config.recipeContext || ''
    : config.recipeContext || '';

  return {
    ...config,
    recipeContext,
  };
}

export function parseRecipeIdFromContext(context: string = ''): RecipeId {
  const recipeId = extractRecipeIdFromRecipeContext(context);
  if (recipeId && recipeId in builders) return recipeId as RegisteredRecipeId;
  return null;
}

export function getRecipeContextBuilder(recipeId: RegisteredRecipeId) {
  return builders[recipeId];
}
