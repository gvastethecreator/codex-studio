import { describe, expect, it } from 'vitest';

import { serializeRecipeProviderDirectives } from '../../packages/shared/src';
import { buildRecipeProviderDirectives, getRecipeModule } from './index';
import { createTimelineRecipeParams, getTimelineTimeDeltaValue } from './timeline';

describe('timeline recipe', () => {
  it('maps timeline labels into durable recipe params', () => {
    expect(getTimelineTimeDeltaValue('Hours')).toBe('DAY_NIGHT_CYCLE');
    const input = {
      currentRefIndex: 4,
      sequenceIndices: [0, 4],
      sequenceId: 'origin',
      sourceFrameId: 'frame-4',
      direction: 'backward',
      timeDeltaLabel: 'Minutes',
      cameraMode: 'dynamic',
      motionAmount: 'Cinematic',
      lightingMode: 'Evolving',
      isAnchored: true,
    } as const;
    expect(createTimelineRecipeParams(input)).toEqual({
      nextIndex: 3,
      sequenceId: 'origin',
      sourceFrameId: 'frame-4',
      direction: 'backward',
      timeDeltaValue: 'MEDIUM_TERM_PROGRESSION',
      timeDeltaLabel: 'Minutes',
      cameraMode: 'dynamic',
      motionAmount: 'Cinematic',
      lightingMode: 'Evolving',
      isAnchored: true,
    });
    // An existing neighbor means the new frame goes past the end of the sequence.
    expect(createTimelineRecipeParams({ ...input, sequenceIndices: [0, 1, 3, 4] }).nextIndex).toBe(
      -1,
    );
    expect(
      createTimelineRecipeParams({
        ...input,
        direction: 'forward',
        sequenceIndices: [0, 4, 5, 6],
      }).nextIndex,
    ).toBe(7);
    expect(createTimelineRecipeParams({ ...input, currentRefIndex: null }).nextIndex).toBeNull();
  });

  it('builds compact provider directives for timeline params', () => {
    const timeline = getRecipeModule('timeline');
    expect(timeline).toBeTruthy();

    const directives =
      timeline &&
      buildRecipeProviderDirectives(
        timeline,
        {
          nextIndex: 4,
          direction: 'backward',
          timeDeltaLabel: 'Minutes',
          cameraMode: 'dynamic',
          motionAmount: 'High Action',
          lightingMode: 'Evolving',
          isAnchored: true,
        },
        { referenceCount: 2 },
      );

    const serialized = directives ? serializeRecipeProviderDirectives(directives) : '';

    expect(directives).toMatchObject({
      protocol: 'recipe-provider-directives/v1',
      recipeId: 'timeline',
      title: 'Timeline Frame',
    });
    expect(serialized).toContain(
      '- Goal: Create the previous frame of the same scene: the same moment seen a few minutes earlier.',
    );
    expect(serialized).toContain('The Anchor image sets identity and style only.');
    expect(serialized).toContain('- Camera: The camera may move a little to follow the action.');
  });
});
