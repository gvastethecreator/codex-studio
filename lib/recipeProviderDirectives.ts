import {
  createAnimationSequenceContract,
  createAnimationSequenceFramePlan,
} from '../packages/shared/src/animationSequenceContracts';
import { createRecipeProviderDirectives } from '../packages/shared/src/recipeProviderDirectives';
import { createSpriteAtlasContract } from '../packages/shared/src/spriteAtlasContracts';
import { getCameraDirectorInstructions, getCameraGeometryConstraints } from './recipeDerivedParams';
import {
  createCinematicFrameDirectives,
  createCinematicLayoutInstruction,
  createAnimationSequenceOutputDirective,
  createAnimationSequenceReferenceDirective,
  createSpritesheetCellDirectives,
  getSpritesheetBackgroundDirective,
  getSpritesheetDividerState,
  getCharacterLayoutInstruction,
  getCharacterStyleInstruction,
  parseSpritesheetGrid,
} from './recipePromptFragments';
import type { RecipeModule } from './recipeModules';

function getString(params: Record<string, unknown>, key: string) {
  const value = params[key];
  return typeof value === 'string' ? value : '';
}

function getNumber(params: Record<string, unknown>, key: string, fallback = 0) {
  const value = params[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function getBoolean(params: Record<string, unknown>, key: string, fallback = false) {
  const value = params[key];
  return typeof value === 'boolean' ? value : fallback;
}

function getRecord(params: Record<string, unknown>, key: string) {
  const value = params[key];
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function getStringArray(params: Record<string, unknown>, key: string) {
  const value = params[key];
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function directive(label: string, value: string | number | boolean | null | undefined) {
  return { label, value: value === undefined || value === null ? '' : `${value}` };
}

function paramDirective(params: Record<string, unknown>, key: string, label: string) {
  return directive(label, getString(params, key));
}

/** Empty for "let the model decide" choices, so they don't reach the provider as noise. */
function chosenOption(params: Record<string, unknown>, key: string) {
  const value = getString(params, key);
  return value === 'Auto-Detect' || value === 'Auto' ? '' : value;
}

function describePanelAspect(sheetAspect: string, rows: number, cols: number) {
  const [width, height] = sheetAspect.split(':').map(Number);
  if (!width || !height) return '';
  const ratio = ((width / height) * rows) / cols;
  if (Math.abs(ratio - 1) < 0.05) return 'Each panel is about square.';
  return ratio > 1
    ? `Each panel is about ${ratio.toFixed(2)}:1 (landscape).`
    : `Each panel is about 1:${(1 / ratio).toFixed(2)} (portrait).`;
}

function getSelectedStyleLayerDirectives(params: Record<string, unknown>) {
  const value = params.selectedStyles;
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return [];
    const layer = entry as Record<string, unknown>;
    const presetName = getString(layer, 'presetName');
    if (!presetName) return [];
    const strength = getNumber(layer, 'strength', 0.75);
    const packName = getString(layer, 'packName');
    const aesthetic = getString(layer, 'aesthetic');
    const creativeBrief = getString(layer, 'creativeBrief');
    const enabled = getBoolean(layer, 'enabled', true);
    const avoidRulesMode = getString(layer, 'avoidRulesMode') || 'merge';
    const fields = getRecord(layer, 'fields');
    const activeFields = Object.values(fields).flatMap((field) => {
      if (!field || typeof field !== 'object' || Array.isArray(field)) return [];
      const fieldRecord = field as Record<string, unknown>;
      if (fieldRecord.enabled === false) return [];
      const label = getString(fieldRecord, 'label');
      if (!label) return [];
      const weight = getNumber(fieldRecord, 'weight', 1);
      return weight >= 0.995
        ? [label]
        : [`${label} ${Math.max(0.1, Math.min(1, weight)).toFixed(2)}`];
    });

    return [
      directive(
        `Style Slot ${index + 1}`,
        [
          presetName,
          packName ? `pack ${packName}` : '',
          enabled ? '' : 'disabled',
          `strength ${Math.max(0.1, Math.min(1, strength)).toFixed(2)}`,
          activeFields.length > 0 ? `active fields ${activeFields.join(', ')}` : '',
          `avoid rules ${avoidRulesMode}`,
          aesthetic ? `aesthetic ${aesthetic}` : '',
          creativeBrief ? `brief ${creativeBrief}` : '',
        ]
          .filter(Boolean)
          .join('; '),
      ),
    ];
  });
}

function buildCharacterProviderDirectives(module: RecipeModule, params: Record<string, unknown>) {
  const layout = getString(params, 'layout') || 'Classic Turnaround';
  const style = getString(params, 'style') || 'Preserve Source Style';
  const shot = getString(params, 'shot') || 'Full Body';
  const focus = getString(params, 'focus') || 'General Design';
  const hasReference = getBoolean(params, 'hasReference');
  const keepsRequestedBackground =
    getBoolean(params, 'transparentBackground') || getBoolean(params, 'preserveBackground');

  return createRecipeProviderDirectives({
    recipeId: module.id,
    title: module.title,
    sections: [
      {
        title: 'Objective',
        directives: [
          directive(
            'Goal',
            `One clean character reference sheet: ${getCharacterLayoutInstruction(layout)}`,
          ),
          directive(
            'Identity',
            hasReference
              ? 'The reference image shows the character. Keep costume, physique, colors, and facial features in every view.'
              : 'Design one original, cohesive character from the prompt.',
          ),
          directive(
            'Consistency',
            'Same design, proportions, colors, and scale in every view or panel.',
          ),
          directive('Rules', 'No text, labels, captions, arrows, or watermarks.'),
        ],
      },
      {
        title: 'Sheet Layout',
        directives: [
          directive('Layout', layout),
          directive('Shot Framing', `${shot}. Use this crop for every view.`),
          directive(
            'Design Focus',
            focus === 'General Design'
              ? 'Balanced detail across the whole design.'
              : `Give extra detail to ${focus}.`,
          ),
          directive(
            'Background',
            keepsRequestedBackground
              ? ''
              : 'Neutral studio white or light grey, unless the prompt asks for another background.',
          ),
        ],
      },
      {
        title: 'Art Direction',
        directives: [
          directive('Style', style === 'Preserve Source Style' && !hasReference ? '' : style),
          directive('Style Instruction', getCharacterStyleInstruction(style, hasReference)),
        ],
      },
    ],
  });
}

/** The Lab prompt already carries the action, controls, and identity contract. */
function buildCharacterLabProviderDirectives(
  module: RecipeModule,
  params: Record<string, unknown>,
) {
  const frames = getNumber(params, 'frames', 0);

  return createRecipeProviderDirectives({
    recipeId: module.id,
    title: module.title,
    sections: [
      {
        title: 'Character Lab Action',
        directives: [
          directive('Mode', getString(params, 'mode') || 'poses'),
          directive('Action', getString(params, 'actionLabel')),
          directive('Action ID', getString(params, 'actionId')),
          directive('Frames', frames > 0 ? frames : ''),
          directive(
            'Couples Or Group Pose',
            getBoolean(params, 'isCouplesPose')
              ? 'yes: every attached character image is a separate person in the same image.'
              : '',
          ),
        ],
      },
    ],
  });
}

function buildCameraProviderDirectives(module: RecipeModule, params: Record<string, unknown>) {
  const azimuth = Math.round(getNumber(params, 'azimuth', 0));
  const elevation = Math.round(getNumber(params, 'elevation', 0));
  const distance = Math.round(getNumber(params, 'distance', 100));
  const director = getCameraDirectorInstructions(azimuth, elevation, distance);
  const hPos = getString(params, 'hPos') || director.hPos;
  const vPos = getString(params, 'vPos') || director.vPos;
  const framing = getString(params, 'framing') || director.framing;
  const geometryConstraints =
    getString(params, 'geometryConstraints') || getCameraGeometryConstraints(azimuth, elevation);

  const hasReference = getBoolean(params, 'hasReference');

  return createRecipeProviderDirectives({
    recipeId: module.id,
    title: module.title,
    sections: [
      {
        title: 'Objective',
        directives: [
          directive(
            'Goal',
            hasReference
              ? 'Re-render the same subject from the reference image as seen from the camera position below. Keep identity, outfit, materials, palette, and lighting. Invent only what the new angle reveals.'
              : 'Render the subject from the prompt as seen from the camera position below.',
          ),
          directive('Rules', 'One image from one camera. No split views, grids, labels, or text.'),
        ],
      },
      {
        title: 'Camera Transform',
        directives: [
          directive('Orbit', `${azimuth} degrees (${hPos})`),
          directive('Pitch', `${elevation} degrees (${vPos})`),
          directive('Zoom', `${distance}% (${framing}). 100% is a medium shot; higher is closer.`),
        ],
      },
      {
        title: 'Visual Guidance',
        directives: [directive('Geometry Constraints', geometryConstraints)],
      },
    ],
  });
}

function buildCinematicProviderDirectives(module: RecipeModule, params: Record<string, unknown>) {
  const frames = Math.max(1, getNumber(params, 'frames', 9));
  const rows = Math.max(1, getNumber(params, 'rows', 3));
  const cols = Math.max(1, getNumber(params, 'cols', 3));
  const frameDirectives = createCinematicFrameDirectives(getRecord(params, 'frameShots'), frames);
  const sheetAspect = getString(params, 'aspectRatio') || '1:1';

  return createRecipeProviderDirectives({
    recipeId: module.id,
    title: module.title,
    sections: [
      {
        title: 'Objective',
        directives: [
          directive(
            'Goal',
            `One single image laid out as a storyboard of ${frames} panels in ${rows} rows by ${cols} columns, read left to right, top to bottom.`,
          ),
          directive(
            'Story',
            'The panels show one short beat in order: setup, action, reaction. Keep the same cast, wardrobe, setting, and light direction in every panel.',
          ),
          directive(
            'Rules',
            'Thin, even gutters between panels. No captions, panel numbers, speech bubbles, UI, or watermarks.',
          ),
        ],
      },
      {
        title: 'Storyboard Layout',
        directives: [
          directive('Layout Instruction', createCinematicLayoutInstruction(frames, rows, cols)),
          directive('Sheet Aspect Ratio', `${sheetAspect} for the whole image`),
          directive('Panel Shape', describePanelAspect(sheetAspect, rows, cols)),
          directive(
            'Frame Shots',
            frameDirectives.length > 0
              ? frameDirectives.join('; ')
              : 'Vary the shot sizes so the beat reads clearly.',
          ),
        ],
      },
      {
        title: 'Cinematic Direction',
        directives: [
          directive('Genre', chosenOption(params, 'genre')),
          directive('Tone', chosenOption(params, 'tone')),
          directive('Lighting', chosenOption(params, 'lighting')),
          directive('Time', chosenOption(params, 'time')),
          directive('Weather', chosenOption(params, 'weather')),
          directive('Camera Movement', chosenOption(params, 'movement')),
          directive('Lens', chosenOption(params, 'lens')),
        ],
      },
    ],
  });
}

const REMASTER_KEEP_INSTRUCTIONS: Record<string, string> = {
  'Preserve Lighting': 'Keep the original lighting. Do not relight.',
  'Preserve Detail': 'Keep the framing and the existing detail.',
  'Preserve Geometry and Identity':
    'Keep geometry, faces, and identity exactly. Do not reconstruct anatomy.',
  'Keep Original': 'Keep existing text and lettering as they are.',
  'Remove Text': 'Remove text and lettering, and fill the area naturally.',
  'Rewrite Logically': 'Rewrite damaged text so it reads correctly in the same lettering style.',
  'Preserve Colors': 'Keep the original colors. Do not apply a new grade.',
};

function remasterInstruction(params: Record<string, unknown>, key: string, fallback: string) {
  const value = getString(params, key) || fallback;
  return REMASTER_KEEP_INSTRUCTIONS[value] ?? `${value}.`;
}

function describeRemasterFidelity(fidelity: number) {
  if (fidelity >= 80)
    return 'Stay very close to the source: same composition, framing, subject, pose, and proportions. Only repair and refine.';
  if (fidelity >= 50)
    return 'Keep the composition and subject. Moderate enhancement of rendering and detail is allowed.';
  return 'Keep the subject recognizable. Free reinterpretation of rendering and missing detail is allowed.';
}

function buildRemasterProviderDirectives(module: RecipeModule, params: Record<string, unknown>) {
  const fidelity = Math.max(0, Math.min(100, getNumber(params, 'fidelity', 100)));

  return createRecipeProviderDirectives({
    recipeId: module.id,
    title: module.title,
    sections: [
      {
        title: 'Objective',
        directives: [
          directive(
            'Goal',
            'Restore and remaster the input image into one clean, polished version of the same picture.',
          ),
          directive(
            'Rules',
            fidelity >= 50
              ? 'Keep the full frame. Do not crop, extend, or reframe. No watermarks or added text.'
              : 'No watermarks or added text.',
          ),
        ],
      },
      {
        title: 'Restoration Goals',
        directives: [
          directive('Finish', getString(params, 'style') || 'Archive Restoration'),
          directive('Lighting', remasterInstruction(params, 'lighting', 'Preserve Lighting')),
          directive('Lens And Detail', remasterInstruction(params, 'camera', 'Preserve Detail')),
          directive(
            'Anatomy',
            remasterInstruction(params, 'anatomy', 'Preserve Geometry and Identity'),
          ),
          directive('Text', remasterInstruction(params, 'text', 'Keep Original')),
          directive('Color', remasterInstruction(params, 'color', 'Preserve Colors')),
        ],
      },
      {
        title: 'Fidelity Control',
        directives: [
          directive('Fidelity', `${fidelity}/100. ${describeRemasterFidelity(fidelity)}`),
        ],
      },
    ],
  });
}

function buildSpritesheetProviderDirectives(
  module: RecipeModule,
  params: Record<string, unknown>,
  context: RecipeDirectiveContext,
) {
  const hasReference = context.referenceCount > 0;
  const view = getString(params, 'view') || 'Match Source';
  const style = getString(params, 'style') || 'Preserve Style';
  const grid = getString(params, 'grid') || '2x2';
  const background = getString(params, 'background') || 'Dark Grey';
  const dividers = getString(params, 'dividers') || 'No Dividers';
  const customColor = getString(params, 'customColor') || '#3f3f46';
  const { gridCols, gridRows } = parseSpritesheetGrid(grid);
  const { hasDividers, dividerColor } = getSpritesheetDividerState(dividers);
  const totalCells = gridCols * gridRows;
  const cellDirectives = createSpritesheetCellDirectives(
    getRecord(params, 'cellPrompts'),
    totalCells,
  );

  return createRecipeProviderDirectives({
    recipeId: module.id,
    title: module.title,
    sections: [
      {
        title: 'Objective',
        directives: [
          directive(
            'Goal',
            `One sprite sheet image: a grid of ${gridCols} columns by ${gridRows} rows, ${totalCells} equal cells, read left to right, top to bottom.`,
          ),
          directive(
            'Consistency',
            'The same character or asset in every cell, at the same scale, facing, and baseline, centered in its cell.',
          ),
          directive(
            'Rules',
            'No text, labels, cell numbers, or watermarks. Nothing crosses a cell edge.',
          ),
        ],
      },
      {
        title: 'Grid Layout',
        directives: [
          directive(
            'Cell Separation',
            hasDividers
              ? `Thin ${dividerColor.toLowerCase()} divider lines between cells.`
              : 'No grid lines. Leave clear empty space between cells.',
          ),
        ],
      },
      {
        title: 'Visual Style',
        directives: [
          directive(
            'Perspective',
            view !== 'Match Source'
              ? view
              : hasReference
                ? 'Match the reference image.'
                : 'Pick one camera angle that suits the subject and keep it in every cell.',
          ),
          directive(
            'Rendering',
            style !== 'Preserve Style'
              ? style
              : hasReference
                ? 'Match the reference image style.'
                : 'Pick one style that suits the prompt and keep it in every cell.',
          ),
          directive('Background', getSpritesheetBackgroundDirective(background, customColor)),
        ],
      },
      {
        title: 'Cells',
        directives: [
          directive(
            'Cell Prompts',
            cellDirectives.length > 0
              ? cellDirectives.join('; ')
              : 'Fill the cells in order with readable poses or animation states.',
          ),
        ],
      },
    ],
  });
}

const SPRITE_ATLAS_FRAME_MEANING = {
  temporal: 'Frames are consecutive moments of one motion, in time order.',
  tiles: 'Frames are separate tiles that share projection, scale, and matching edges.',
  variants: 'Frames are separate variants. Do not imply motion between them.',
  items: 'Frames are separate items. Do not imply motion between them.',
} as const;

function describeSpriteAtlasRow(row: {
  id: string;
  frames: number;
  loop: boolean;
  action: string;
}) {
  const action = row.action ? `: ${row.action}` : '';
  return `${row.id}${action} (${row.frames} frames, ${row.loop ? 'loops back to frame 1' : 'plays once'})`;
}

function buildSpriteAtlasProviderDirectives(module: RecipeModule, params: Record<string, unknown>) {
  const contract = createSpriteAtlasContract(params);
  const rowId = getString(params, 'rowId');
  const row = rowId ? contract.rows.find((item) => item.id === rowId) : undefined;
  const cellAspect = `${contract.cell.width}:${contract.cell.height}`;

  return createRecipeProviderDirectives({
    recipeId: module.id,
    title: module.title,
    sections: [
      {
        title: 'Objective',
        directives: [
          directive(
            'Goal',
            row
              ? `One horizontal strip of exactly ${row.frames} equal frames for the "${row.id}" row, side by side from left to right. Each frame has a ${cellAspect} shape. No gaps, extra rows, or labels.`
              : `Sprite atlas rows for ${contract.presetId}. Each row is one horizontal strip of equal ${cellAspect} frames.`,
          ),
          directive('Frame Meaning', SPRITE_ATLAS_FRAME_MEANING[contract.frameSemantics]),
          directive(
            'Consistency',
            'Keep the same identity, scale, baseline, outline weight, and palette in every frame. Keep each frame upright and inside its slot with a small margin.',
          ),
          directive('Rules', 'No text, labels, guide marks, watermarks, or merged atlas pages.'),
        ],
      },
      {
        title: 'Atlas Contract',
        directives: [
          directive('Asset Kind', contract.assetKind),
          directive('Camera', contract.camera),
          directive('Style', contract.customStyle || contract.stylePreset),
          directive('Row', row ? describeSpriteAtlasRow(row) : ''),
          directive(
            'Rows',
            row
              ? ''
              : contract.rows.length > 0
                ? contract.rows.map(describeSpriteAtlasRow).join('; ')
                : 'Custom rows required before generation.',
          ),
        ],
      },
      {
        title: 'Background',
        directives: [
          directive(
            'Background',
            !contract.transparent
              ? 'Keep the background the prompt or preset asks for.'
              : contract.backgroundRemoval === 'chroma'
                ? `Flat ${contract.chromaKey} key color. This is a key color for a later import, not transparent pixels.`
                : 'Native transparency. Do not paint a green, blue, cyan, or magenta backdrop.',
          ),
        ],
      },
    ],
  });
}

const TIMELINE_ELAPSED_TIME: Record<string, string> = {
  'Split Second': 'a split second',
  Seconds: 'a few seconds',
  Minutes: 'a few minutes',
  Hours: 'a few hours',
  Years: 'several years',
};

const TIMELINE_LIGHTING: Record<string, string> = {
  Locked: 'Keep the light direction, color, and intensity unchanged.',
  Evolving: 'Let the light change naturally with the elapsed time.',
  Flickering: 'Add a brief light flicker while keeping the light sources in place.',
};

function buildTimelineProviderDirectives(
  module: RecipeModule,
  params: Record<string, unknown>,
  context: RecipeDirectiveContext,
) {
  const forward = (getString(params, 'direction') || 'forward') === 'forward';
  const timeDeltaLabel = getString(params, 'timeDeltaLabel') || 'Seconds';
  const elapsed = TIMELINE_ELAPSED_TIME[timeDeltaLabel] ?? timeDeltaLabel.toLowerCase();
  const lightingMode = getString(params, 'lightingMode') || 'Locked';
  const isAnchored = getBoolean(params, 'isAnchored');

  return createRecipeProviderDirectives({
    recipeId: module.id,
    title: module.title,
    sections: [
      {
        title: 'Objective',
        directives: [
          directive(
            'Goal',
            context.referenceCount > 0
              ? `Create the ${forward ? 'next' : 'previous'} frame of the same scene: the same moment seen ${elapsed} ${forward ? 'later' : 'earlier'}.`
              : `Create one storyboard frame of the scene in the prompt, as it looks ${elapsed} ${forward ? 'later' : 'earlier'} than its opening moment.`,
          ),
          directive(
            'Images',
            context.referenceCount === 0
              ? ''
              : isAnchored
                ? 'The Ref image is the current state: pose, position, props, and light. The Anchor image sets identity and style only. Do not copy its pose or moment.'
                : 'The reference image is the current state. Keep identity and style from it.',
          ),
          directive('Rules', 'One frame, not a grid or sequence. No text, UI, or watermarks.'),
        ],
      },
      {
        title: 'Continuity',
        directives: [
          directive('Sequence Position', getNumber(params, 'nextIndex', 1)),
          directive(
            'Camera',
            getString(params, 'cameraMode') === 'dynamic'
              ? 'The camera may move a little to follow the action.'
              : 'Keep the same camera position, lens, and framing.',
          ),
          directive(
            'Motion',
            `${getString(params, 'motionAmount') || 'Subtle'} change in pose, position, or state.`,
          ),
          directive('Lighting', TIMELINE_LIGHTING[lightingMode] ?? lightingMode),
        ],
      },
    ],
  });
}

function buildAnimationSequenceProviderDirectives(
  module: RecipeModule,
  params: Record<string, unknown>,
) {
  const contract = createAnimationSequenceContract(params);
  const plan = createAnimationSequenceFramePlan(contract);
  const frameId = getString(params, 'frameId');
  const frameIndex = Math.round(getNumber(params, 'frameIndex', 0));
  const frame =
    plan.frames.find((item) => item.id === frameId) ??
    plan.frames.find((item) => item.index === frameIndex) ??
    plan.frames[0]!;
  const correctionMode = getBoolean(params, 'correctionMode');
  const hasExecutableReferences = Array.isArray(params.executableReferenceFrameIds);
  const executableReferences = getStringArray(params, 'executableReferenceFrameIds');

  return createRecipeProviderDirectives({
    recipeId: module.id,
    title: module.title,
    sections: [
      {
        title: 'Objective',
        directives: [
          directive(
            'Goal',
            correctionMode
              ? `Correct frame ${frame.ordinal} of ${contract.frameCount} of ${contract.cyclic ? 'a looping' : 'an'} animation. Fix it so it fits between its neighbours; keep everything else.`
              : `Draw frame ${frame.ordinal} of ${contract.frameCount} of ${contract.cyclic ? 'a looping' : 'an'} animation as one finished still image.`,
          ),
          directive(
            'Consistency',
            contract.styleLock
              ? 'Same character, camera, framing, palette, and lighting as the other frames. Only the motion changes.'
              : 'Same character and camera as the other frames. Only the motion changes.',
          ),
          directive(
            'Output',
            createAnimationSequenceOutputDirective(frame.id, frame.ordinal, contract.frameCount),
          ),
        ],
      },
      {
        title: 'Animation Sequence',
        directives: [
          directive('FPS', contract.fps),
          directive('Method', contract.method),
          directive('Continuity', contract.continuity),
          directive('Identity Anchor', contract.identityAnchor),
          directive('Motion Driver', contract.motionDriver),
        ],
      },
      {
        title: 'Frame Target',
        directives: [
          directive('Strategy', frame.strategy),
          directive('Semantic Phase', frame.semanticPhase),
          directive(
            'References',
            createAnimationSequenceReferenceDirective(
              hasExecutableReferences ? executableReferences : frame.referenceFrameIds,
            ),
          ),
        ],
      },
    ],
  });
}

function buildStylesProviderDirectives(module: RecipeModule, params: Record<string, unknown>) {
  const intentionalPrompt =
    getString(params, 'compilerVersion').startsWith('intentional-styles/') &&
    getString(params, 'styleRequestHash')
      ? getString(params, 'effectivePrompt')
      : '';
  if (intentionalPrompt) {
    const outputMedium =
      intentionalPrompt
        .match(/^Output medium: ([^\n]+)$/m)?.[1]
        ?.split('. Render the whole image')[0]
        ?.trim() ?? '';
    const mediumDirective = outputMedium
      ? outputMedium === 'illustration'
        ? 'Illustration across the entire subject and setting: draw or paint all forms with visible mark and shape decisions. Avoid a photographic, live-action or glossy CGI finish. Preserve the requested subject, counts, action, framing and light.'
        : `Render the entire subject and setting in ${outputMedium}. Preserve the requested subject, counts, action, framing and light.`
      : '';
    return createRecipeProviderDirectives({
      recipeId: module.id,
      title: module.title,
      sections: [
        {
          title: 'Intentional Style Plan',
          directives: [
            directive('Required Output Medium', mediumDirective),
            directive('Compiled Instructions', intentionalPrompt),
          ],
        },
      ],
    });
  }
  const selectedStyleDirectives = getSelectedStyleLayerDirectives(params);

  return createRecipeProviderDirectives({
    recipeId: module.id,
    title: module.title,
    sections: [
      {
        title: 'Application',
        directives: [
          paramDirective(params, 'presetName', 'Target Style'),
          paramDirective(params, 'mode', 'Mode'),
          paramDirective(params, 'roleInstruction', 'Role Instruction'),
          paramDirective(params, 'compositionRule', 'Composition Rule'),
          paramDirective(params, 'styleEmphasis', 'Style Emphasis'),
          paramDirective(params, 'creativeBrief', 'Creative Brief'),
          ...selectedStyleDirectives,
        ],
      },
      {
        title: 'Visual DNA',
        directives: [
          paramDirective(params, 'aesthetic', 'Core Aesthetic'),
          paramDirective(params, 'subjectTreatment', 'Subject Treatment'),
          paramDirective(params, 'colorTone', 'Color And Tone'),
          paramDirective(params, 'lightingShadow', 'Lighting And Shadow'),
          paramDirective(params, 'textureMaterial', 'Texture And Material'),
          paramDirective(params, 'cameraComposition', 'Camera And Composition'),
          paramDirective(params, 'atmosphereMood', 'Atmosphere And Mood'),
          paramDirective(params, 'renderingQuality', 'Rendering And Quality'),
        ],
      },
    ],
  });
}

export interface RecipeDirectiveContext {
  /** Attached images, including the source image. */
  referenceCount: number;
}

export function buildRecipeProviderDirectives(
  module: RecipeModule,
  params: Record<string, unknown> | null | undefined,
  context: RecipeDirectiveContext = { referenceCount: 0 },
) {
  const input = params ?? {};

  if (module.id === 'animation-sequence')
    return buildAnimationSequenceProviderDirectives(module, input);
  if (module.id === 'camera') return buildCameraProviderDirectives(module, input);
  if (module.id === 'character-lab') return buildCharacterLabProviderDirectives(module, input);
  if (module.id === 'character') return buildCharacterProviderDirectives(module, input);
  if (module.id === 'cinematic') return buildCinematicProviderDirectives(module, input);
  if (module.id === 'remaster') return buildRemasterProviderDirectives(module, input);
  if (module.id === 'sprite-atlas') return buildSpriteAtlasProviderDirectives(module, input);
  if (module.id === 'spritesheet')
    return buildSpritesheetProviderDirectives(module, input, context);
  if (module.id === 'timeline') return buildTimelineProviderDirectives(module, input, context);
  if (module.id === 'styles') return buildStylesProviderDirectives(module, input);

  return null;
}
