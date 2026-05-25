import { createRecipeProviderDirectives } from '../packages/shared/src';
import {
  getCameraDirectorInstructions,
  getCameraGeometryConstraints,
  getTimelineTimeDeltaValue,
} from './recipeDerivedParams';
import {
  createCinematicFrameDirectives,
  createCinematicLayoutInstruction,
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

function directive(label: string, value: string | number | boolean | null | undefined) {
  return { label, value: value === undefined || value === null ? '' : `${value}` };
}

function paramDirective(params: Record<string, unknown>, key: string, label: string) {
  return directive(label, getString(params, key));
}

function buildCharacterProviderDirectives(module: RecipeModule, params: Record<string, unknown>) {
  const layout = getString(params, 'layout') || 'Classic Turnaround';
  const style = getString(params, 'style') || 'Preserve Source Style';
  const shot = getString(params, 'shot') || 'Full Body';
  const focus = getString(params, 'focus') || 'General Design';
  const hasReference = getBoolean(params, 'hasReference');

  return createRecipeProviderDirectives({
    recipeId: module.id,
    title: module.title,
    sections: [
      {
        title: 'Sheet Layout',
        directives: [
          directive('Layout', layout),
          directive('Layout Instruction', getCharacterLayoutInstruction(layout)),
          directive('Shot Framing', shot),
          directive('Design Focus', focus),
        ],
      },
      {
        title: 'Art Direction',
        directives: [
          directive('Style', style),
          directive('Style Instruction', getCharacterStyleInstruction(style)),
          directive('Has Reference', hasReference ? 'yes' : 'no'),
          directive(
            'Identity Guidance',
            hasReference
              ? 'Preserve costume, physique, colors, and facial features from the reference.'
              : 'Design a unique, cohesive character based on the prompt.',
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

  return createRecipeProviderDirectives({
    recipeId: module.id,
    title: module.title,
    sections: [
      {
        title: 'Camera Transform',
        directives: [
          directive('Azimuth', `${azimuth} degrees`),
          directive('Elevation', `${elevation} degrees`),
          directive('Distance', `${distance}%`),
          directive('Horizontal Position', hPos),
          directive('Vertical Position', vPos),
          directive('Framing', framing),
        ],
      },
      {
        title: 'Visual Guidance',
        directives: [
          directive('Has Reference', getBoolean(params, 'hasReference') ? 'yes' : 'no'),
          directive('Geometry Constraints', geometryConstraints),
        ],
      },
    ],
  });
}

function buildCinematicProviderDirectives(module: RecipeModule, params: Record<string, unknown>) {
  const frames = Math.max(1, getNumber(params, 'frames', 9));
  const rows = Math.max(1, getNumber(params, 'rows', 3));
  const cols = Math.max(1, getNumber(params, 'cols', 3));
  const frameDirectives = createCinematicFrameDirectives(getRecord(params, 'frameShots'));

  return createRecipeProviderDirectives({
    recipeId: module.id,
    title: module.title,
    sections: [
      {
        title: 'Storyboard Layout',
        directives: [
          directive('Frames', frames),
          directive('Rows', rows),
          directive('Columns', cols),
          directive('Aspect Ratio', getString(params, 'aspectRatio') || '1:1'),
          directive('Layout Instruction', createCinematicLayoutInstruction(frames, rows, cols)),
          directive(
            'Frame Shots',
            frameDirectives.length > 0 ? frameDirectives.join('; ') : 'Auto-detect shot variety.',
          ),
        ],
      },
      {
        title: 'Cinematic Direction',
        directives: [
          directive('Genre', getString(params, 'genre') || 'Auto-Detect'),
          directive('Tone', getString(params, 'tone') || 'Auto-Detect'),
          directive('Lighting', getString(params, 'lighting') || 'Auto-Detect'),
          directive('Time', getString(params, 'time') || 'Auto-Detect'),
          directive('Weather', getString(params, 'weather') || 'Auto-Detect'),
          directive('Camera Movement', getString(params, 'movement') || 'Auto-Detect'),
          directive('Lens', getString(params, 'lens') || 'Auto-Detect'),
        ],
      },
    ],
  });
}

function buildRemasterProviderDirectives(module: RecipeModule, params: Record<string, unknown>) {
  const fidelity = Math.max(0, Math.min(100, getNumber(params, 'fidelity', 35)));
  const adherence = fidelity / 100;
  const creativity = (100 - fidelity) / 100;

  return createRecipeProviderDirectives({
    recipeId: module.id,
    title: module.title,
    sections: [
      {
        title: 'Restoration Goals',
        directives: [
          directive(
            'Style Interpretation',
            getString(params, 'style') || 'Realistic Reconstruction',
          ),
          directive('Lighting Correction', getString(params, 'lighting') || 'Lighting Correction'),
          directive('Lens And Detail', getString(params, 'camera') || 'Sharp Focus'),
          directive('Anatomy Handling', getString(params, 'anatomy') || 'Fix Anatomy'),
          directive('Text Handling', getString(params, 'text') || 'Rewrite Logically'),
          directive('Color Grading', getString(params, 'color') || 'Expanded Dynamic Range'),
        ],
      },
      {
        title: 'Fidelity Control',
        directives: [
          directive('Fidelity', fidelity),
          directive('Adherence To Original Composition', adherence.toFixed(2)),
          directive('Creative Enhancement Freedom', creativity.toFixed(2)),
        ],
      },
    ],
  });
}

function buildSpritesheetProviderDirectives(module: RecipeModule, params: Record<string, unknown>) {
  const view = getString(params, 'view') || 'Match Source';
  const style = getString(params, 'style') || 'Preserve Style';
  const grid = getString(params, 'grid') || '2x2';
  const background = getString(params, 'background') || 'Dark Grey';
  const dividers = getString(params, 'dividers') || 'No Dividers';
  const customColor = getString(params, 'customColor') || '#3f3f46';
  const { gridCols, gridRows } = parseSpritesheetGrid(grid);
  const { hasDividers, dividerColor, cellSeparation } = getSpritesheetDividerState(dividers);
  const cellDirectives = createSpritesheetCellDirectives(getRecord(params, 'cellPrompts'));

  return createRecipeProviderDirectives({
    recipeId: module.id,
    title: module.title,
    sections: [
      {
        title: 'Grid Layout',
        directives: [
          directive('Columns', gridCols),
          directive('Rows', gridRows),
          directive('Total Cells', gridCols * gridRows),
          directive('Cell Separation', cellSeparation),
          directive('Divider Color', hasDividers ? dividerColor : 'none'),
        ],
      },
      {
        title: 'Visual Style',
        directives: [
          directive('Perspective', view === 'Match Source' ? 'infer from source image' : view),
          directive('Rendering', style === 'Preserve Style' ? 'source consistent' : style),
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
              : 'Suggest readable poses or animation states.',
          ),
        ],
      },
    ],
  });
}

function buildTimelineProviderDirectives(module: RecipeModule, params: Record<string, unknown>) {
  const direction = getString(params, 'direction') || 'forward';
  const timeDeltaLabel = getString(params, 'timeDeltaLabel') || 'Seconds';
  const timeDeltaValue =
    getString(params, 'timeDeltaValue') || getTimelineTimeDeltaValue(timeDeltaLabel);
  const directionPrompt =
    direction === 'forward'
      ? 'Generate a plausible future state.'
      : 'Generate a plausible past state.';

  return createRecipeProviderDirectives({
    recipeId: module.id,
    title: module.title,
    sections: [
      {
        title: 'Sequence',
        directives: [
          directive('Frame Index', getNumber(params, 'nextIndex', 1)),
          directive('Direction', direction),
          directive('Direction Prompt', directionPrompt),
          directive('Time Delta Label', timeDeltaLabel),
          directive('Time Delta Value', timeDeltaValue),
        ],
      },
      {
        title: 'Continuity',
        directives: [
          directive('Camera Mode', getString(params, 'cameraMode') || 'locked'),
          directive('Motion Amount', getString(params, 'motionAmount') || 'Subtle'),
          directive('Lighting Mode', getString(params, 'lightingMode') || 'Locked'),
          directive('Anchored Identity', getBoolean(params, 'isAnchored') ? 'yes' : 'no'),
        ],
      },
    ],
  });
}

function buildStylesProviderDirectives(module: RecipeModule, params: Record<string, unknown>) {
  return createRecipeProviderDirectives({
    recipeId: module.id,
    title: module.title,
    sections: [
      {
        title: 'Identity',
        directives: [
          paramDirective(params, 'presetId', 'Preset ID'),
          paramDirective(params, 'presetName', 'Preset Name'),
          paramDirective(params, 'mode', 'Mode'),
        ],
      },
      {
        title: 'Application',
        directives: [
          paramDirective(params, 'roleInstruction', 'Role Instruction'),
          paramDirective(params, 'compositionRule', 'Composition Rule'),
          paramDirective(params, 'styleEmphasis', 'Style Emphasis'),
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

export function buildRecipeProviderDirectives(
  module: RecipeModule,
  params: Record<string, unknown> | null | undefined,
) {
  const input = params ?? {};

  if (module.id === 'camera') return buildCameraProviderDirectives(module, input);
  if (module.id === 'character') return buildCharacterProviderDirectives(module, input);
  if (module.id === 'cinematic') return buildCinematicProviderDirectives(module, input);
  if (module.id === 'remaster') return buildRemasterProviderDirectives(module, input);
  if (module.id === 'spritesheet') return buildSpritesheetProviderDirectives(module, input);
  if (module.id === 'timeline') return buildTimelineProviderDirectives(module, input);
  if (module.id === 'styles') return buildStylesProviderDirectives(module, input);

  return null;
}
