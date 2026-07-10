import {
  createAnimationSequenceFramePlan,
  type AnimationSequenceContract,
  type AnimationSequenceFramePlanItem,
} from '../packages/shared/src/animationSequenceContracts';

export interface AvailableAnimationFrameAsset {
  frameId: string;
  catalogId: string;
  sourceUrl: string;
}

export interface AnimationFrameHandoffAsset extends AvailableAnimationFrameAsset {
  role: 'input' | 'reference';
  name: string;
}

export interface CreateAnimationFrameHandoffInput {
  runId?: string | null;
  contract: AnimationSequenceContract;
  frame: AnimationSequenceFramePlanItem;
  correctionMode?: boolean;
  availableFrames?: AvailableAnimationFrameAsset[];
}

export function createAnimationFrameHandoff({
  runId,
  contract,
  frame,
  correctionMode = false,
  availableFrames = [],
}: CreateAnimationFrameHandoffInput) {
  const plan = createAnimationSequenceFramePlan(contract);
  const generationOrderById = new Map(
    plan.frames.map((candidate) => [candidate.id, candidate.generationOrder]),
  );
  const availableByFrameId = new Map(availableFrames.map((asset) => [asset.frameId, asset]));
  const executableReferenceFrameIds = frame.referenceFrameIds.filter(
    (frameId) => (generationOrderById.get(frameId) ?? Infinity) < frame.generationOrder,
  );
  const unresolvedReferenceFrameIds = executableReferenceFrameIds.filter(
    (frameId) => !availableByFrameId.has(frameId),
  );
  const currentFrameAsset = availableByFrameId.get(frame.id) ?? null;
  const assets: AnimationFrameHandoffAsset[] = [
    ...(correctionMode && currentFrameAsset
      ? [
          {
            ...currentFrameAsset,
            role: 'input' as const,
            name: `${frame.id}-correction-input`,
          },
        ]
      : []),
    ...executableReferenceFrameIds.flatMap((frameId) => {
      const asset = availableByFrameId.get(frameId);
      return asset
        ? [{ ...asset, role: 'reference' as const, name: `${frameId}-continuity-reference` }]
        : [];
    }),
  ];
  const blockingReason =
    correctionMode && !currentFrameAsset
      ? 'Correction requires the selected generated frame as an input asset.'
      : unresolvedReferenceFrameIds.length > 0
        ? `Generate required reference frames first: ${unresolvedReferenceFrameIds.join(', ')}.`
        : null;
  const task = correctionMode ? 'image_edit' : 'image_generate';
  const recipeParams = {
    runId: runId ?? '',
    prompt: contract.prompt,
    frameCount: contract.frameCount,
    fps: contract.fps,
    aspectRatio: contract.aspectRatio,
    method: contract.method,
    cyclic: contract.cyclic,
    pinEdges: contract.pinEdges,
    continuity: contract.continuity,
    styleLock: contract.styleLock,
    background: contract.background,
    matteColor: contract.matteColor,
    variantsPerFrame: contract.variantsPerFrame,
    frameId: frame.id,
    frameIndex: frame.index,
    frameOrdinal: frame.ordinal,
    generationOrder: frame.generationOrder,
    referenceFrameIds: frame.referenceFrameIds,
    executableReferenceFrameIds,
    unresolvedReferenceFrameIds,
    correctionMode,
    task,
    outputCount: contract.variantsPerFrame,
  };

  return {
    ready: blockingReason === null,
    blockingReason,
    task,
    outputCount: contract.variantsPerFrame,
    assets,
    recipeParams,
  };
}
