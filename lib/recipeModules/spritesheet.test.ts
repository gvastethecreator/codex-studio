import { describe, expect, it } from 'vitest';

import { serializeRecipeProviderDirectives } from '../../packages/shared/src';
import { buildRecipeProviderDirectives, getRecipeModule } from './index';
import {
  createSpritesheetCellDirectives,
  getSpritesheetBackgroundDirective,
  getSpritesheetDividerState,
  parseSpritesheetGrid,
} from './spritesheet';

describe('spritesheet recipe', () => {
  it('creates Spritesheet layout and visual fragments', () => {
    expect(parseSpritesheetGrid('1x6 Strip')).toEqual({ gridCols: 6, gridRows: 1 });
    expect(parseSpritesheetGrid('bad')).toEqual({ gridCols: 2, gridRows: 2 });
    expect(getSpritesheetDividerState('Red Lines')).toMatchObject({
      hasDividers: true,
      dividerColor: 'RED',
      cellSeparation: 'VISIBLE_RED_LINES',
    });
    expect(getSpritesheetBackgroundDirective('Custom', '#abc123')).toBe('SOLID_COLOR_#ABC123');
    expect(
      createSpritesheetCellDirectives({ 9: 'stale kick', 0: 'idle', 2: 'run', 3: '' }, 4),
    ).toEqual(['Cell 1: idle', 'Cell 3: run']);
  });

  it('builds compact provider directives for spritesheet params', () => {
    const spritesheet = getRecipeModule('spritesheet');
    expect(spritesheet).toBeTruthy();

    const directives =
      spritesheet &&
      buildRecipeProviderDirectives(spritesheet, {
        view: 'Side Scroll',
        style: 'Pixel Art (32-bit)',
        grid: '4x2',
        background: 'Chroma Green',
        dividers: 'Blue Lines',
        cellPrompts: {
          0: 'idle stance',
          1: 'first run step',
        },
      });

    const serialized = directives ? serializeRecipeProviderDirectives(directives) : '';

    expect(directives).toMatchObject({
      protocol: 'recipe-provider-directives/v1',
      recipeId: 'spritesheet',
      title: 'Sprite Sheet',
    });
    expect(serialized).toContain('a grid of 4 columns by 2 rows, 8 equal cells');
    expect(serialized).toContain('- Cell Separation: Thin blue divider lines between cells.');
    expect(serialized).toContain('- Background: SOLID_GREEN_#00FF00');
    expect(serialized).toContain('Cell 2: first run step');
  });
});
