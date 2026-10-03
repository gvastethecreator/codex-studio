import { timelinePolicy } from '../../packages/shared/src/recipePolicies/timeline';
import {
  createModuleDirectives,
  directive,
  getBoolean,
  getNumber,
  getString,
} from './directiveHelpers';
import { createRecipeModule, options } from './params';
import { sequenceReferenceRules } from './composerRules';
import type { RecipeDefinition, RecipeDirectiveContext, RecipeParams } from './types';

export type TimelineDirection = 'forward' | 'backward';
export type TimelineCameraMode = 'locked' | 'dynamic';

export interface TimelineRecipeParamsInput {
  /** Null while the active frame's sequence index is not known yet. */
  currentRefIndex: number | null;
  /** Indices already used in this sequence, including the origin (0). */
  sequenceIndices: readonly number[];
  /** Origin attachment id; frames with the same id form one sequence. */
  sequenceId: string | null;
  /** Catalog image id of the active frame, or the origin id when the origin is active. */
  sourceFrameId: string | null;
  direction: TimelineDirection;
  timeDeltaLabel: string;
  cameraMode: TimelineCameraMode;
  motionAmount: string;
  lightingMode: string;
  isAnchored: boolean;
}

const TIMELINE_OPTIONS = {
  direction: ['forward', 'backward'],
  timeDeltaLabel: ['Split Second', 'Seconds', 'Minutes', 'Hours', 'Years'],
  cameraMode: ['locked', 'dynamic'],
  motionAmount: ['Static', 'Subtle', 'Cinematic', 'High Action'],
  lightingMode: ['Locked', 'Evolving', 'Flickering'],
} as const;

const module = createRecipeModule({
  id: 'timeline',
  title: 'Timeline Frame',
  description: 'Generate neighboring storyboard frames with motion and continuity controls.',
  defaultTask: 'image_generate',
  variation: 'none',
  supportedTasks: ['image_generate', 'image_edit'],
  parameters: [
    {
      id: 'nextIndex',
      label: 'Sequence Index',
      kind: 'number',
      control: 'text',
      group: 'sequence',
      defaultValue: 1,
    },
    {
      id: 'direction',
      label: 'Direction',
      kind: 'enum',
      control: 'select',
      group: 'sequence',
      defaultValue: 'forward',
      options: options(TIMELINE_OPTIONS.direction),
    },
    {
      id: 'timeDeltaValue',
      label: 'Time Delta Value',
      kind: 'string',
      control: 'text',
      group: 'time',
    },
    {
      id: 'timeDeltaLabel',
      label: 'Time Delta Label',
      kind: 'enum',
      control: 'select',
      group: 'time',
      defaultValue: 'Seconds',
      options: options(TIMELINE_OPTIONS.timeDeltaLabel),
    },
    {
      id: 'cameraMode',
      label: 'Camera Mode',
      kind: 'enum',
      control: 'select',
      group: 'camera',
      defaultValue: 'locked',
      options: options(TIMELINE_OPTIONS.cameraMode),
    },
    {
      id: 'motionAmount',
      label: 'Motion Amount',
      kind: 'enum',
      control: 'select',
      group: 'physics',
      defaultValue: 'Subtle',
      options: options(TIMELINE_OPTIONS.motionAmount),
    },
    {
      id: 'lightingMode',
      label: 'Lighting Mode',
      kind: 'enum',
      control: 'select',
      group: 'physics',
      defaultValue: 'Locked',
      options: options(TIMELINE_OPTIONS.lightingMode),
    },
    {
      id: 'isAnchored',
      label: 'Is Anchored',
      kind: 'boolean',
      control: 'toggle',
      group: 'source',
      defaultValue: false,
    },
  ],
});

const TIME_DELTA_VALUE_BY_LABEL: Record<string, string> = {
  'Split Second': 'IMMEDIATE_REACTION',
  Seconds: 'SHORT_TERM_CONSEQUENCE',
  Minutes: 'MEDIUM_TERM_PROGRESSION',
  Hours: 'DAY_NIGHT_CYCLE',
  Years: 'LONG_TERM_AGING',
};

export function getTimelineTimeDeltaValue(label: string) {
  return TIME_DELTA_VALUE_BY_LABEL[label] ?? label;
}

function getTimelineNextIndex(
  currentRefIndex: number,
  direction: TimelineDirection,
  sequenceIndices: readonly number[],
) {
  const neighbor = currentRefIndex + (direction === 'forward' ? 1 : -1);
  if (!sequenceIndices.includes(neighbor)) return neighbor;
  // The neighbor slot is taken, so the new frame goes after the last (or before the first) one.
  return direction === 'forward'
    ? Math.max(currentRefIndex, ...sequenceIndices) + 1
    : Math.min(currentRefIndex, ...sequenceIndices) - 1;
}

export function createTimelineRecipeParams(input: TimelineRecipeParamsInput) {
  return {
    nextIndex:
      input.currentRefIndex === null
        ? null
        : getTimelineNextIndex(input.currentRefIndex, input.direction, input.sequenceIndices),
    sequenceId: input.sequenceId,
    sourceFrameId: input.sourceFrameId,
    direction: input.direction,
    timeDeltaValue: getTimelineTimeDeltaValue(input.timeDeltaLabel),
    timeDeltaLabel: input.timeDeltaLabel,
    cameraMode: input.cameraMode,
    motionAmount: input.motionAmount,
    lightingMode: input.lightingMode,
    isAnchored: input.isAnchored,
  };
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

function buildTimelineDirectives(params: RecipeParams, context: RecipeDirectiveContext) {
  const forward = (getString(params, 'direction') || 'forward') === 'forward';
  const timeDeltaLabel = getString(params, 'timeDeltaLabel') || 'Seconds';
  const elapsed = TIMELINE_ELAPSED_TIME[timeDeltaLabel] ?? timeDeltaLabel.toLowerCase();
  const lightingMode = getString(params, 'lightingMode') || 'Locked';
  const isAnchored = getBoolean(params, 'isAnchored');

  return createModuleDirectives(module, [
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
  ]);
}

export const timelineRecipe: RecipeDefinition = {
  module,
  policy: timelinePolicy,
  /** The current frame plus the anchor and neighbours, independent of the provider cap. */
  ...sequenceReferenceRules,
  referenceInstruction: (_params, attachment) =>
    attachment.name.includes('(Anchor)')
      ? 'Anchor: identity and style only. Do not copy its pose or moment.'
      : 'Ref: the current state of the scene to continue from.',
  directives: buildTimelineDirectives,
};
