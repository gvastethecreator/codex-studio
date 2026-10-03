import { describe, expect, it } from 'vitest';

import { serializeRecipeProviderDirectives } from '../../packages/shared/src';
import {
  createCinematicFrameDirectives,
  createCinematicFrameInstructions,
  createCinematicLayoutInstruction,
} from './cinematic';
import { buildRecipeProviderDirectives, getRecipeModule } from './index';

describe('cinematic recipe', () => {
  it('creates Cinematic layout and frame-shot fragments', () => {
    expect(createCinematicLayoutInstruction(6, 2, 3)).toBe(
      'Create a 6-frame storyboard grid (2 rows by 3 columns).',
    );
    expect(
      createCinematicFrameDirectives({ 6: 'Wide', 0: 'Wide', 1: 'Auto', 2: 'Close-Up' }, 3),
    ).toEqual(['Frame 1: Wide Shot', 'Frame 3: Close-Up Shot']);
    expect(createCinematicFrameInstructions({ 0: 'Wide' }, 3)).toContain('SPECIFIC FRAME SHOTS');
  });

  it('builds compact provider directives for cinematic params', () => {
    const cinematic = getRecipeModule('cinematic');
    expect(cinematic).toBeTruthy();

    const directives =
      cinematic &&
      buildRecipeProviderDirectives(cinematic, {
        frames: 6,
        rows: 2,
        cols: 3,
        aspectRatio: '16:9',
        frameShots: {
          0: 'Wide',
          1: 'Close-Up',
          7: 'Over the Shoulder',
        },
        genre: 'Noir',
        tone: 'High Contrast',
        lighting: 'Practical',
        movement: 'Static Tripod',
        lens: '50mm Portrait',
      });

    const serialized = directives ? serializeRecipeProviderDirectives(directives) : '';

    expect(directives).toMatchObject({
      protocol: 'recipe-provider-directives/v1',
      recipeId: 'cinematic',
      title: 'Cinematic Storyboard',
    });
    expect(serialized).toContain('Create a 6-frame storyboard grid');
    expect(serialized).toContain('Frame 1: Wide Shot; Frame 2: Close-Up Shot');
    expect(serialized).not.toContain('Frame 8');
    expect(serialized).toContain('- Panel Shape: Each panel is about 1.19:1 (landscape).');
    expect(serialized).toContain('- Genre: Noir');
    expect(serialized).not.toContain('Auto-Detect');
  });
});
