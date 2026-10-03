import { describe, expect, it } from 'vitest';

import { serializeRecipeProviderDirectives } from '../../packages/shared/src';
import {
  createAnimationSequenceContract,
  createAnimationSequenceFramePlan,
} from '../../packages/shared/src/animationSequenceContracts';
import { createAnimationFrameHandoff } from '../animationFrameHandoff';
import {
  createAnimationSequenceOutputDirective,
  createAnimationSequenceReferenceDirective,
} from './animationSequence';
import { buildRecipeProviderDirectives, getRecipeModule } from './index';

describe('animation sequence recipe', () => {
  it('projects animation frame params without React-only state', () => {
    const contract = createAnimationSequenceContract({
      prompt: 'a ceramic fox waves',
      frameCount: 5,
      fps: 10,
    });
    const frame = createAnimationSequenceFramePlan(contract).frames[2]!;

    expect(
      createAnimationFrameHandoff({
        runId: 'anim-1',
        contract,
        frame,
        correctionMode: true,
      }).recipeParams,
    ).toMatchObject({
      runId: 'anim-1',
      prompt: 'a ceramic fox waves',
      frameCount: 5,
      fps: 10,
      frameId: 'frame-0003',
      frameIndex: 2,
      frameOrdinal: 3,
      task: 'image_edit',
      correctionMode: true,
    });
  });

  it('creates animation sequence frame fragments without video language', () => {
    expect(createAnimationSequenceReferenceDirective([])).toContain('first-frame visual anchor');
    expect(createAnimationSequenceReferenceDirective(['frame-0001', 'frame-0003'])).toContain(
      'frame-0001, frame-0003',
    );
    expect(createAnimationSequenceOutputDirective('frame-0002', 2, 8)).toBe(
      'Generate only frame-0002 (2/8) as one finished animation frame. Do not create a video, grid, captioned storyboard, or contact sheet.',
    );
  });

  it('builds compact provider directives for animation sequence frames', () => {
    const animation = getRecipeModule('animation-sequence');
    expect(animation).toBeTruthy();

    const directives =
      animation &&
      buildRecipeProviderDirectives(animation, {
        runId: 'anim-1',
        prompt: 'a ceramic fox waves',
        frameCount: 5,
        fps: 10,
        frameIndex: 2,
        method: 'recursive',
        continuity: 'strict',
      });

    const serialized = directives ? serializeRecipeProviderDirectives(directives) : '';

    expect(directives).toMatchObject({
      protocol: 'recipe-provider-directives/v1',
      recipeId: 'animation-sequence',
      title: 'Animation Sequence',
    });
    expect(serialized).toContain('- Goal: Draw frame 3 of 5');
    expect(serialized).toContain('Generate only frame-0003 (3/5) as one finished animation frame.');
    expect(serialized).not.toContain('anim-1');
  });
});
