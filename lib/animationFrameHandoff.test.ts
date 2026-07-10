import { describe, expect, it } from 'vite-plus/test';
import {
  createAnimationSequenceContract,
  createAnimationSequenceFramePlan,
} from '../packages/shared/src/animationSequenceContracts';
import { createAnimationFrameHandoff } from './animationFrameHandoff';

describe('Animation Frame Handoff', () => {
  it('removes future recursive references and preserves variants', () => {
    const contract = createAnimationSequenceContract({
      frameCount: 5,
      method: 'recursive',
      variantsPerFrame: 3,
    });
    const plan = createAnimationSequenceFramePlan(contract);
    const frame = plan.frames.find((candidate) => candidate.id === 'frame-0003')!;
    const handoff = createAnimationFrameHandoff({
      runId: 'run-1',
      contract,
      frame,
      availableFrames: frame.referenceFrameIds.map((frameId) => ({
        frameId,
        catalogId: `catalog-${frameId}`,
        sourceUrl: `/library/${frameId}.webp`,
      })),
    });

    expect(handoff.outputCount).toBe(3);
    expect(handoff.recipeParams.executableReferenceFrameIds).toEqual(
      frame.referenceFrameIds.filter(
        (frameId) =>
          plan.frames.find((candidate) => candidate.id === frameId)!.generationOrder <
          frame.generationOrder,
      ),
    );
  });

  it('blocks correction without an input and emits the selected frame as input when present', () => {
    const contract = createAnimationSequenceContract({ frameCount: 4 });
    const frame = createAnimationSequenceFramePlan(contract).frames[0]!;
    expect(createAnimationFrameHandoff({ contract, frame, correctionMode: true })).toMatchObject({
      ready: false,
      task: 'image_edit',
    });

    const ready = createAnimationFrameHandoff({
      contract,
      frame,
      correctionMode: true,
      availableFrames: [
        { frameId: frame.id, catalogId: 'catalog-1', sourceUrl: '/library/frame.webp' },
      ],
    });
    expect(ready).toMatchObject({ ready: true, assets: [{ role: 'input' }] });
  });
});
