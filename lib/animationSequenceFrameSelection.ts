export function resolveAnimationSequenceFrameSelection(
  selectedFrameId: string | null,
  availableFrameIds: readonly string[],
) {
  if (availableFrameIds.length === 0) return null;
  if (selectedFrameId && availableFrameIds.includes(selectedFrameId)) return selectedFrameId;
  return availableFrameIds[0] ?? null;
}

export interface LoadedAnimationSequenceFramePrompt {
  runId: string;
  frameId: string;
  prompt: string;
}

export function isAnimationSequenceFramePromptCurrent({
  loadedPrompt,
  runId,
  frameId,
}: {
  loadedPrompt: LoadedAnimationSequenceFramePrompt | null;
  runId: string | null;
  frameId: string | null;
}) {
  return Boolean(
    loadedPrompt &&
    runId &&
    frameId &&
    loadedPrompt.runId === runId &&
    loadedPrompt.frameId === frameId,
  );
}
