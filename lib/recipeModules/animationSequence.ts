import {
  ANIMATION_SEQUENCE_ASPECT_RATIOS,
  ANIMATION_SEQUENCE_BACKGROUNDS,
  ANIMATION_SEQUENCE_CONTINUITY,
  ANIMATION_SEQUENCE_METHODS,
  createAnimationSequenceContract,
  createAnimationSequenceFramePlan,
  type AnimationSequenceFramePlan,
  type AnimationSequenceFramePlanItem,
} from '../../packages/shared/src/animationSequenceContracts';
import { animationSequencePolicy } from '../../packages/shared/src/recipePolicies/animationSequence';
import {
  createModuleDirectives,
  directive,
  getBoolean,
  getNumber,
  getString,
  getStringArray,
} from './directiveHelpers';
import { createRecipeModule, options } from './params';
import { animationSequenceBackground, sequenceReferenceRules } from './composerRules';
import type { RecipeDefinition, RecipeParams } from './types';

const ANIMATION_SEQUENCE_OPTIONS = {
  aspectRatio: [...ANIMATION_SEQUENCE_ASPECT_RATIOS],
  method: [...ANIMATION_SEQUENCE_METHODS],
  continuity: [...ANIMATION_SEQUENCE_CONTINUITY],
  background: [...ANIMATION_SEQUENCE_BACKGROUNDS],
} as const;

const module = createRecipeModule({
  id: 'animation-sequence',
  title: 'Animation Sequence',
  description:
    'Plan and generate frame-by-frame image animations with correction flow and GIF export.',
  defaultTask: 'image_generate',
  variation: 'none',
  supportedTasks: ['image_generate', 'image_edit'],
  parameters: [
    {
      id: 'frameCount',
      label: 'Frames',
      kind: 'number',
      control: 'slider',
      group: 'sequence',
      defaultValue: 8,
      min: 2,
      max: 48,
      step: 1,
    },
    {
      id: 'fps',
      label: 'FPS',
      kind: 'number',
      control: 'slider',
      group: 'sequence',
      defaultValue: 12,
      min: 1,
      max: 30,
      step: 1,
    },
    {
      id: 'aspectRatio',
      label: 'Aspect Ratio',
      kind: 'enum',
      control: 'select',
      group: 'output',
      defaultValue: '1:1',
      options: options(ANIMATION_SEQUENCE_OPTIONS.aspectRatio),
    },
    {
      id: 'method',
      label: 'Method',
      kind: 'enum',
      control: 'select',
      group: 'continuity',
      defaultValue: 'recursive',
      options: options(ANIMATION_SEQUENCE_OPTIONS.method),
    },
    {
      id: 'cyclic',
      label: 'Loop',
      kind: 'boolean',
      control: 'toggle',
      group: 'continuity',
      defaultValue: true,
    },
    {
      id: 'pinEdges',
      label: 'Pin Edges',
      kind: 'boolean',
      control: 'toggle',
      group: 'continuity',
      defaultValue: true,
    },
    {
      id: 'continuity',
      label: 'Continuity',
      kind: 'enum',
      control: 'select',
      group: 'continuity',
      defaultValue: 'balanced',
      options: options(ANIMATION_SEQUENCE_OPTIONS.continuity),
    },
    {
      id: 'styleLock',
      label: 'Style Lock',
      kind: 'boolean',
      control: 'toggle',
      group: 'look',
      defaultValue: true,
    },
    {
      id: 'background',
      label: 'Background',
      kind: 'enum',
      control: 'select',
      group: 'output',
      defaultValue: 'preserve',
      options: options(ANIMATION_SEQUENCE_OPTIONS.background),
    },
    {
      id: 'matteColor',
      label: 'GIF Matte',
      kind: 'color',
      control: 'color',
      group: 'output',
      defaultValue: '#0b0f14',
    },
    {
      id: 'variantsPerFrame',
      label: 'Variants Per Frame',
      kind: 'number',
      control: 'slider',
      group: 'sequence',
      defaultValue: 1,
      min: 1,
      max: 4,
      step: 1,
    },
    {
      id: 'runId',
      label: 'Run ID',
      kind: 'string',
      control: 'text',
      group: 'execution',
    },
    {
      id: 'frameId',
      label: 'Frame ID',
      kind: 'string',
      control: 'text',
      group: 'execution',
    },
    {
      id: 'frameIndex',
      label: 'Frame Index',
      kind: 'number',
      control: 'text',
      group: 'execution',
      defaultValue: 0,
      min: 0,
      max: 47,
      step: 1,
    },
    {
      id: 'correctionMode',
      label: 'Correction Mode',
      kind: 'boolean',
      control: 'toggle',
      group: 'execution',
      defaultValue: false,
    },
    {
      id: 'task',
      label: 'Task',
      kind: 'enum',
      control: 'select',
      group: 'execution',
      defaultValue: 'image_generate',
      options: ['image_generate', 'image_edit'],
    },
  ],
});

export function createAnimationSequenceReferenceDirective(referenceFrameIds: string[]) {
  if (referenceFrameIds.length === 0) {
    return 'Use the base image or prompt as the first-frame visual anchor.';
  }
  return `Use sequence references: ${referenceFrameIds.join(', ')}. Preserve identity and motion continuity from those frames.`;
}

export function createAnimationSequenceOutputDirective(
  frameId: string,
  ordinal: number,
  total: number,
) {
  return `Generate only ${frameId} (${ordinal}/${total}) as one finished animation frame. Do not create a video, grid, captioned storyboard, or contact sheet.`;
}

function resolveAnimationSequenceFrame(
  framePlan: AnimationSequenceFramePlan,
  params: RecipeParams,
): AnimationSequenceFramePlanItem {
  const frameId = getString(params, 'frameId');
  const frameIndex = Math.round(getNumber(params, 'frameIndex', 0));
  return (
    framePlan.frames.find((frame) => frame.id === frameId) ??
    framePlan.frames.find((frame) => frame.index === frameIndex) ??
    framePlan.frames[0]!
  );
}

function buildAnimationSequenceDirectives(params: RecipeParams) {
  const contract = createAnimationSequenceContract(params);
  const frame = resolveAnimationSequenceFrame(createAnimationSequenceFramePlan(contract), params);
  const correctionMode = getBoolean(params, 'correctionMode');
  const hasExecutableReferences = Array.isArray(params.executableReferenceFrameIds);
  const executableReferences = getStringArray(params, 'executableReferenceFrameIds');

  return createModuleDirectives(module, [
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
  ]);
}

function isCorrection(params: RecipeParams) {
  return params.correctionMode === true;
}

export const animationSequenceRecipe: RecipeDefinition = {
  module,
  policy: animationSequencePolicy,
  /** The frame plus its neighbours, independent of the provider cap. */
  ...sequenceReferenceRules,
  /** A correction puts the frame it corrects first. */
  attachmentRole: (params, index) => (index === 0 && isCorrection(params) ? 'input' : 'reference'),
  referenceInstruction: (params, _attachment, index) =>
    index === 0 && isCorrection(params)
      ? 'The frame to correct. Keep what already works and fix it to fit its neighbours.'
      : 'Frame or reference of this animation. Keep identity, palette, and camera continuous.',
  background: animationSequenceBackground,
  directives: (params) => buildAnimationSequenceDirectives(params),
  plan({ config, params }) {
    const sequenceParams = { prompt: config.prompt ?? '', ...params };
    const contract = createAnimationSequenceContract(sequenceParams);
    const framePlan = createAnimationSequenceFramePlan(contract);
    const frame = resolveAnimationSequenceFrame(framePlan, sequenceParams);
    return {
      directives: buildAnimationSequenceDirectives(sequenceParams),
      quality: {
        style: contract.styleLock
          ? 'Style-locked animation frame sequence'
          : 'Animation frame sequence',
        constraints: [
          `Generate one single frame for ${frame?.id ?? 'the selected frame'}.`,
          `Keep ${contract.continuity} continuity across the frame sequence.`,
          'Do not generate a video, storyboard grid, contact sheet, UI, captions, or text.',
        ],
        negative: ['video controls', 'captions', 'watermarks', 'contact sheet', 'multi-panel grid'],
      },
      metadata: {
        animationSequence: {
          contract,
          frame,
          generationOrder: framePlan.generationOrder ?? [],
        },
      },
    };
  },
};
