import type {
  AnimationSequenceFramePromptResponse,
  AnimationSequenceRunView,
  AttachAnimationSequenceFrameRequest,
  CreateAnimationSequenceRunRequest,
  ExportAnimationSequenceGifRequest,
  ExportAnimationSequenceGifResponse,
} from '../../packages/shared/src';
import { resolveStudioApiBase } from '../studioRuntime';
import { request } from './http';

export async function listAnimationSequenceRuns() {
  return request<{ runs: AnimationSequenceRunView[] }>('/api/animation-sequence/runs');
}

export async function getAnimationSequenceRun(runId: string) {
  return request<AnimationSequenceRunView>(
    `/api/animation-sequence/runs/${encodeURIComponent(runId)}`,
  );
}

export async function createAnimationSequenceRun(input: CreateAnimationSequenceRunRequest) {
  return request<AnimationSequenceRunView>('/api/animation-sequence/runs', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getAnimationSequenceFramePrompt(runId: string, frameId: string) {
  return request<AnimationSequenceFramePromptResponse>(
    `/api/animation-sequence/runs/${encodeURIComponent(runId)}/frames/${encodeURIComponent(frameId)}/prompt`,
  );
}

export async function attachAnimationSequenceFrame(
  runId: string,
  input: AttachAnimationSequenceFrameRequest,
) {
  return request<AnimationSequenceRunView>(
    `/api/animation-sequence/runs/${encodeURIComponent(runId)}/attach-frame`,
    { method: 'POST', body: JSON.stringify(input) },
  );
}

export async function exportAnimationSequenceGif(
  runId: string,
  input: ExportAnimationSequenceGifRequest = {},
) {
  return request<ExportAnimationSequenceGifResponse>(
    `/api/animation-sequence/runs/${encodeURIComponent(runId)}/export-gif`,
    { method: 'POST', body: JSON.stringify(input) },
  );
}

export async function runAnimationSequenceQa(runId: string) {
  return request<AnimationSequenceRunView>(
    `/api/animation-sequence/runs/${encodeURIComponent(runId)}/qa`,
    { method: 'POST' },
  );
}

export function getAnimationSequenceGifUrl(runId: string) {
  return `${resolveStudioApiBase()}/api/animation-sequence/runs/${encodeURIComponent(runId)}/files/gif`;
}
