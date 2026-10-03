import { describe, expect, it } from 'vitest';

import {
  createAnimationSequenceContract,
  createAnimationSequenceFrameId,
  createAnimationSequenceFramePlan,
} from './animationSequenceContracts';

describe('animationSequenceContracts', () => {
  it('normalizes animation sequence params into a safe frame contract', () => {
    const contract = createAnimationSequenceContract({
      prompt: 'small lantern rotates in place',
      identityAnchor: 'the same brass lantern',
      motionDriver: 'rotation around the vertical axis',
      frameCount: 99,
      fps: 0,
      aspectRatio: '16:9',
      method: 'recursive',
      continuity: 'strict',
      outputFormats: ['gif', 'mp4'],
    });

    expect(contract).toMatchObject({
      prompt: 'small lantern rotates in place',
      identityAnchor: 'the same brass lantern',
      motionDriver: 'rotation around the vertical axis',
      frameCount: 48,
      fps: 1,
      aspectRatio: '16:9',
      imageSize: '1K',
      dimensions: { width: 1536, height: 864 },
      method: 'recursive',
      continuity: 'strict',
      outputFormats: ['gif'],
    });
    // Frame size follows the provider's size for the same ratio and tier.
    expect(createAnimationSequenceContract({ aspectRatio: '1:1', imageSize: '2K' })).toMatchObject({
      imageSize: '2K',
      dimensions: { width: 2048, height: 2048 },
    });
  });

  it('creates stable frame ids and recursive generation order', () => {
    const contract = createAnimationSequenceContract({
      prompt: 'a door slowly opens',
      frameCount: 6,
      method: 'recursive',
      cyclic: true,
    });
    const plan = createAnimationSequenceFramePlan(contract);

    expect(createAnimationSequenceFrameId(3)).toBe('frame-0004');
    expect(plan.generationOrder).toEqual([
      'frame-0001',
      'frame-0006',
      'frame-0003',
      'frame-0002',
      'frame-0004',
      'frame-0005',
    ]);
    expect(plan.frames[0]).toMatchObject({ id: 'frame-0001', isKeyframe: true });
    expect(plan.frames[5]).toMatchObject({
      id: 'frame-0006',
      isKeyframe: true,
      referenceFrameIds: ['frame-0001'],
      semanticPhase: 'loop-return',
    });
    // The loop seam must not repeat frame 1.
    expect(plan.frames[5]?.prompt).toContain('Sequence progress: 0.83.');
  });

  it('references the identity anchor and the bisection bracket of each in-between', () => {
    const plan = createAnimationSequenceFramePlan(
      createAnimationSequenceContract({ frameCount: 8, method: 'recursive', cyclic: false }),
    );

    expect(plan.frames.map((frame) => frame.referenceFrameIds)).toEqual([
      [],
      ['frame-0001', 'frame-0004'],
      ['frame-0001', 'frame-0002', 'frame-0004'],
      ['frame-0001', 'frame-0008'],
      ['frame-0001', 'frame-0004', 'frame-0006'],
      ['frame-0001', 'frame-0004', 'frame-0008'],
      ['frame-0001', 'frame-0006', 'frame-0008'],
      ['frame-0001'],
    ]);
    expect(plan.frames[7]?.prompt).toContain('Sequence progress: 1.00.');
  });

  it('creates sequential plans with previous-frame references', () => {
    const plan = createAnimationSequenceFramePlan(
      createAnimationSequenceContract({
        prompt: 'a match flame grows',
        frameCount: 4,
        method: 'sequential',
        cyclic: false,
      }),
    );

    expect(plan.generationOrder).toEqual(['frame-0001', 'frame-0002', 'frame-0003', 'frame-0004']);
    expect(plan.frames[2]).toMatchObject({
      id: 'frame-0003',
      strategy: 'sequential_followup',
      referenceFrameIds: ['frame-0001', 'frame-0002'],
    });
    expect(plan.frames[2]?.prompt).toContain('Animation frame 3 of 4.');
  });
});
