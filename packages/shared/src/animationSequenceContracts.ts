import {
  describeCodexHttpImageSize,
  resolveCodexHttpImageSizeTier,
  type CodexHttpImageSizeTier,
} from './codexExecutionContract';

export const ANIMATION_SEQUENCE_METHODS = ['recursive', 'sequential'] as const;

export type AnimationSequenceMethod = (typeof ANIMATION_SEQUENCE_METHODS)[number];

export const ANIMATION_SEQUENCE_ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'] as const;

export type AnimationSequenceAspectRatio = (typeof ANIMATION_SEQUENCE_ASPECT_RATIOS)[number];

export const ANIMATION_SEQUENCE_CONTINUITY = ['loose', 'balanced', 'strict'] as const;

export type AnimationSequenceContinuity = (typeof ANIMATION_SEQUENCE_CONTINUITY)[number];

export const ANIMATION_SEQUENCE_BACKGROUNDS = ['preserve', 'transparent', 'solid'] as const;

export type AnimationSequenceBackground = (typeof ANIMATION_SEQUENCE_BACKGROUNDS)[number];

export const ANIMATION_SEQUENCE_EXPORT_FORMATS = ['gif', 'zip', 'contact_sheet'] as const;

export type AnimationSequenceExportFormat = (typeof ANIMATION_SEQUENCE_EXPORT_FORMATS)[number];

/** Frame requests carry at most this many images: correction input, frame references, shared references. */
export const ANIMATION_SEQUENCE_MAX_REQUEST_IMAGES = 4;

const ANIMATION_SEQUENCE_RUN_STATUSES = [
  'draft',
  'planned',
  'generating',
  'waiting_for_frame',
  'ready_for_review',
  'correcting',
  'exported',
  'qa_passed',
  'blocked',
] as const;

export type AnimationSequenceRunStatus = (typeof ANIMATION_SEQUENCE_RUN_STATUSES)[number];

const ANIMATION_SEQUENCE_FRAME_STATUSES = [
  'planned',
  'prompt_ready',
  'generating',
  'generated',
  'correcting',
  'blocked',
] as const;

export type AnimationSequenceFrameStatus = (typeof ANIMATION_SEQUENCE_FRAME_STATUSES)[number];

const ANIMATION_SEQUENCE_BLOCKED_REASON_KINDS = [
  'imagegen_unavailable',
  'runner_failed',
  'no_image_returned',
  'source_missing',
  'geometry_mismatch',
  'export_failed',
  'unknown',
] as const;

export type AnimationSequenceBlockedReasonKind =
  (typeof ANIMATION_SEQUENCE_BLOCKED_REASON_KINDS)[number];

export interface AnimationSequenceDimensions {
  width: number;
  height: number;
}

export interface AnimationSequenceContract {
  prompt: string;
  identityAnchor: string;
  motionDriver: string;
  frameCount: number;
  fps: number;
  aspectRatio: AnimationSequenceAspectRatio;
  imageSize: CodexHttpImageSizeTier;
  dimensions: AnimationSequenceDimensions;
  method: AnimationSequenceMethod;
  cyclic: boolean;
  pinEdges: boolean;
  continuity: AnimationSequenceContinuity;
  styleLock: boolean;
  background: AnimationSequenceBackground;
  matteColor: string;
  variantsPerFrame: number;
  outputFormats: AnimationSequenceExportFormat[];
}

export interface AnimationSequenceFramePlanItem {
  id: string;
  index: number;
  ordinal: number;
  prompt: string;
  isKeyframe: boolean;
  generationOrder: number;
  referenceFrameIds: string[];
  strategy: 'anchor' | 'recursive_inbetween' | 'sequential_followup';
  semanticPhase: 'start' | 'anticipation' | 'action' | 'settle' | 'loop-return';
}

export interface AnimationSequenceFramePlan {
  version: 1;
  method: AnimationSequenceMethod;
  frameCount: number;
  generationOrder: string[];
  frames: AnimationSequenceFramePlanItem[];
}

export interface AnimationSequenceBlockedReason {
  status: 'blocked';
  reasonKind: AnimationSequenceBlockedReasonKind;
  userMessage: string;
  suggestion: string;
}

export interface AnimationSequenceRunPaths {
  outputContext?: { libraryId: string; rootPath: string };
  runDir: string;
  requestPath: string;
  statusPath: string;
  framePlanPath: string;
  promptsDir: string;
  referencesDir: string;
  rawDir: string;
  framesDir: string;
  exportsDir: string;
  gifPath: string;
  qaReportPath: string;
}

export interface AnimationSequenceFrameState {
  warning?: string | null;
  id: string;
  index: number;
  ordinal: number;
  status: AnimationSequenceFrameStatus;
  promptPath: string;
  rawPath: string | null;
  framePath: string | null;
  catalogImageId: string | null;
  jobId: string | null;
  width: number | null;
  height: number | null;
  blocked: AnimationSequenceBlockedReason | null;
  updatedAt: string;
}

export interface AnimationSequenceExportRecord {
  format: AnimationSequenceExportFormat;
  path: string;
  publicUrl: string | null;
  frameCount: number;
  fps: number;
  loop: boolean;
  fileSizeBytes: number | null;
  createdAt: string;
}

export interface AnimationSequenceQaReport {
  ok: boolean;
  checkedAt: string;
  issues: string[];
  summary: string;
}

export interface AnimationSequenceRun {
  id: string;
  title: string;
  status: AnimationSequenceRunStatus;
  createdAt: string;
  updatedAt: string;
  contract: AnimationSequenceContract;
  framePlan: AnimationSequenceFramePlan;
  paths: AnimationSequenceRunPaths;
  frames: AnimationSequenceFrameState[];
  exports: AnimationSequenceExportRecord[];
  qa: AnimationSequenceQaReport | null;
}

export type AnimationSequenceFrameView = Omit<
  AnimationSequenceFrameState,
  'promptPath' | 'rawPath' | 'framePath'
>;

export type AnimationSequenceExportView = Omit<AnimationSequenceExportRecord, 'path'>;

export interface AnimationSequenceRunView extends Omit<
  AnimationSequenceRun,
  'paths' | 'frames' | 'exports'
> {
  frames: AnimationSequenceFrameView[];
  exports: AnimationSequenceExportView[];
}

export interface CreateAnimationSequenceRunRequest {
  workspaceId?: string;
  title?: string;
  prompt?: string;
  identityAnchor?: string;
  motionDriver?: string;
  frameCount?: number;
  fps?: number;
  aspectRatio?: AnimationSequenceAspectRatio;
  imageSize?: CodexHttpImageSizeTier;
  method?: AnimationSequenceMethod;
  cyclic?: boolean;
  pinEdges?: boolean;
  continuity?: AnimationSequenceContinuity;
  styleLock?: boolean;
  background?: AnimationSequenceBackground;
  matteColor?: string;
  variantsPerFrame?: number;
  outputFormats?: AnimationSequenceExportFormat[];
}

export interface AttachAnimationSequenceFrameRequest {
  frameId?: string;
  frameIndex?: number;
  catalogImageId?: string | null;
  sourcePath?: string | null;
  jobId?: string | null;
  blocked?: AnimationSequenceBlockedReason | null;
}

export interface AnimationSequenceFramePromptResponse {
  frameId: string;
  prompt: string;
}

export interface ExportAnimationSequenceGifRequest {
  fps?: number;
  loop?: boolean;
  force?: boolean;
}

export interface ExportAnimationSequenceGifResponse {
  run: AnimationSequenceRunView;
  export: AnimationSequenceExportView;
}

const DEFAULT_PROMPT = 'Animate the scene as a readable sequence of consistent image frames.';

function readString(params: Record<string, unknown>, key: string, fallback = '') {
  const value = params[key];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function readNumber(params: Record<string, unknown>, key: string, fallback: number) {
  const value = params[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function readBoolean(params: Record<string, unknown>, key: string, fallback: boolean) {
  const value = params[key];
  return typeof value === 'boolean' ? value : fallback;
}

function readStringList(params: Record<string, unknown>, key: string, fallback: string[]) {
  const value = params[key];
  if (!Array.isArray(value)) return fallback;
  const cleaned = value.flatMap((item) =>
    typeof item === 'string' && item.trim() ? [item.trim()] : [],
  );
  return cleaned.length > 0 ? cleaned : fallback;
}

function isAnimationSequenceMethod(value: string): value is AnimationSequenceMethod {
  return ANIMATION_SEQUENCE_METHODS.includes(value as AnimationSequenceMethod);
}

function isAnimationSequenceAspectRatio(value: string): value is AnimationSequenceAspectRatio {
  return ANIMATION_SEQUENCE_ASPECT_RATIOS.includes(value as AnimationSequenceAspectRatio);
}

function isAnimationSequenceContinuity(value: string): value is AnimationSequenceContinuity {
  return ANIMATION_SEQUENCE_CONTINUITY.includes(value as AnimationSequenceContinuity);
}

function isAnimationSequenceBackground(value: string): value is AnimationSequenceBackground {
  return ANIMATION_SEQUENCE_BACKGROUNDS.includes(value as AnimationSequenceBackground);
}

function isAnimationSequenceExportFormat(value: string): value is AnimationSequenceExportFormat {
  return ANIMATION_SEQUENCE_EXPORT_FORMATS.includes(value as AnimationSequenceExportFormat);
}

export function isAnimationSequenceBlockedReasonKind(
  value: string,
): value is AnimationSequenceBlockedReasonKind {
  return ANIMATION_SEQUENCE_BLOCKED_REASON_KINDS.includes(
    value as AnimationSequenceBlockedReasonKind,
  );
}

function clampInt(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function createAnimationSequenceFrameId(index: number) {
  return `frame-${String(index + 1).padStart(4, '0')}`;
}

/** A frame waits on its linked job until reconciliation attaches a result or blocks it. */
export function isAnimationSequenceFrameAwaitingJob(
  frame: Pick<AnimationSequenceFrameState, 'jobId' | 'status'>,
) {
  return Boolean(frame.jobId) && (frame.status === 'generating' || frame.status === 'correcting');
}

/** Bisection order; each in-between records the interval endpoints generated before it. */
function createRecursiveGenerationPlan(count: number) {
  const order: number[] = [];
  const brackets = new Map<number, [number, number]>();
  const push = (index: number) => {
    if (!order.includes(index)) order.push(index);
  };
  const fill = (start: number, end: number) => {
    if (end - start <= 1) return;
    const mid = Math.floor((start + end) / 2);
    push(mid);
    brackets.set(mid, [start, end]);
    fill(start, mid);
    fill(mid, end);
  };

  push(0);
  push(count - 1);
  fill(0, count - 1);
  return { order, brackets };
}

// A cyclic sequence returns to frame 1 after the last frame, so the last frame stops short of 1.00.
function getFrameProgress(
  contract: Pick<AnimationSequenceContract, 'frameCount' | 'cyclic'>,
  index: number,
) {
  if (contract.frameCount <= 1) return 0;
  return index / (contract.cyclic ? contract.frameCount : contract.frameCount - 1);
}

function createFramePrompt(contract: AnimationSequenceContract, index: number) {
  const ordinal = index + 1;
  const progress = getFrameProgress(contract, index);
  const loopHint = contract.cyclic
    ? 'Keep the sequence loopable; the final frame should flow back into the first frame.'
    : 'The sequence does not need to loop.';
  const continuityHint =
    contract.continuity === 'strict'
      ? 'Maintain strict identity, camera, palette, lighting, and composition continuity.'
      : contract.continuity === 'loose'
        ? 'Allow visible motion and composition change while preserving recognizable identity.'
        : 'Balance visible motion with stable identity, camera language, and palette.';
  const semanticPhase = createSemanticPhase(contract, index);

  return [
    `Animation frame ${ordinal} of ${contract.frameCount}.`,
    `Base motion prompt: ${contract.prompt}`,
    `Identity anchor: ${contract.identityAnchor}`,
    `Motion driver: ${contract.motionDriver}`,
    `Semantic phase: ${semanticPhase}.`,
    `Sequence progress: ${progress.toFixed(2)}.`,
    `Method: ${contract.method}.`,
    loopHint,
    continuityHint,
    contract.styleLock
      ? 'Style lock is enabled: preserve medium, render style, line weight, color family, and texture.'
      : 'Style may evolve slightly if it improves the motion read.',
    'Generate a single finished frame, not a grid, contact sheet, storyboard page, UI, caption, or video still with text.',
  ].join('\n');
}

function createSemanticPhase(
  contract: Pick<AnimationSequenceContract, 'frameCount' | 'cyclic'>,
  index: number,
): AnimationSequenceFramePlanItem['semanticPhase'] {
  if (index === 0) return 'start';
  if (contract.cyclic && index === contract.frameCount - 1) return 'loop-return';
  const progress = getFrameProgress(contract, index);
  if (progress < 0.3) return 'anticipation';
  if (progress < 0.72) return 'action';
  return 'settle';
}

// Frame 1 is the identity anchor (and the loop target of a cyclic last frame). Neighbours follow,
// nearest first. One request slot stays free for a correction input.
function createReferenceFrameIds(
  contract: AnimationSequenceContract,
  index: number,
  brackets: ReadonlyMap<number, [number, number]>,
) {
  if (index === 0) return [];
  const neighbours = contract.method === 'sequential' ? [index - 1] : (brackets.get(index) ?? []);
  return [...new Set([0, ...neighbours])]
    .slice(0, ANIMATION_SEQUENCE_MAX_REQUEST_IMAGES - 1)
    .map(createAnimationSequenceFrameId);
}

export function createAnimationSequenceContract(
  params:
    | Partial<CreateAnimationSequenceRunRequest>
    | Record<string, unknown>
    | null
    | undefined = {},
): AnimationSequenceContract {
  const input = (params ?? {}) as Record<string, unknown>;
  const methodValue = readString(input, 'method', 'recursive');
  const aspectRatioValue = readString(input, 'aspectRatio', '1:1');
  const continuityValue = readString(input, 'continuity', 'balanced');
  const backgroundValue = readString(input, 'background', 'preserve');
  const outputFormats = readStringList(input, 'outputFormats', ['gif']).filter(
    isAnimationSequenceExportFormat,
  );
  const aspectRatio = isAnimationSequenceAspectRatio(aspectRatioValue) ? aspectRatioValue : '1:1';
  // Frames must match what the image provider returns; ADR 0010 forbids cropping or scaling them.
  const imageSize = resolveCodexHttpImageSizeTier(readString(input, 'imageSize', '1K'));
  const { width, height } = describeCodexHttpImageSize(aspectRatio, imageSize);

  return {
    prompt: readString(input, 'prompt', DEFAULT_PROMPT),
    identityAnchor: readString(
      input,
      'identityAnchor',
      'Preserve the primary subject, silhouette, proportions, palette, and defining details.',
    ),
    motionDriver: readString(input, 'motionDriver', readString(input, 'prompt', DEFAULT_PROMPT)),
    frameCount: clampInt(readNumber(input, 'frameCount', 8), 2, 48),
    fps: clampInt(readNumber(input, 'fps', 12), 1, 30),
    aspectRatio,
    imageSize,
    dimensions: { width, height },
    method: isAnimationSequenceMethod(methodValue) ? methodValue : 'recursive',
    cyclic: readBoolean(input, 'cyclic', true),
    pinEdges: readBoolean(input, 'pinEdges', true),
    continuity: isAnimationSequenceContinuity(continuityValue) ? continuityValue : 'balanced',
    styleLock: readBoolean(input, 'styleLock', true),
    background: isAnimationSequenceBackground(backgroundValue) ? backgroundValue : 'preserve',
    matteColor: readString(input, 'matteColor', '#0b0f14'),
    variantsPerFrame: clampInt(readNumber(input, 'variantsPerFrame', 1), 1, 4),
    outputFormats: outputFormats.length > 0 ? outputFormats : ['gif'],
  };
}

export function createAnimationSequenceFramePlan(
  contract: AnimationSequenceContract,
): AnimationSequenceFramePlan {
  const { order, brackets } =
    contract.method === 'recursive'
      ? createRecursiveGenerationPlan(contract.frameCount)
      : {
          order: Array.from({ length: contract.frameCount }, (_, index) => index),
          brackets: new Map<number, [number, number]>(),
        };
  const generationOrderByIndex = new Map(
    order.map((index, generationOrder) => [index, generationOrder]),
  );

  return {
    version: 1,
    method: contract.method,
    frameCount: contract.frameCount,
    generationOrder: order.map(createAnimationSequenceFrameId),
    frames: Array.from({ length: contract.frameCount }, (_, index) => {
      const isKeyframe =
        index === 0 || (contract.method === 'recursive' && index === contract.frameCount - 1);
      return {
        id: createAnimationSequenceFrameId(index),
        index,
        ordinal: index + 1,
        prompt: createFramePrompt(contract, index),
        isKeyframe,
        generationOrder: generationOrderByIndex.get(index) ?? index,
        referenceFrameIds: createReferenceFrameIds(contract, index, brackets),
        strategy: isKeyframe
          ? 'anchor'
          : contract.method === 'recursive'
            ? 'recursive_inbetween'
            : 'sequential_followup',
        semanticPhase: createSemanticPhase(contract, index),
      };
    }),
  };
}
