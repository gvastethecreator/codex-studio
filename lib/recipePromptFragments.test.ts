import { describe, expect, it } from 'vite-plus/test';

import {
  createCinematicFrameDirectives,
  createCinematicFrameInstructions,
  createCinematicLayoutInstruction,
  createSpritesheetCellDirectives,
  getCharacterLayoutInstruction,
  getCharacterStyleInstruction,
  getSpritesheetBackgroundDirective,
  getSpritesheetDividerState,
  parseSpritesheetGrid,
} from './recipePromptFragments';

describe('recipePromptFragments', () => {
  it('resolves Character prompt fragments from stable layout and style terms', () => {
    expect(getCharacterLayoutInstruction('Expression Sheet')).toContain('2x3 grid');
    expect(getCharacterLayoutInstruction('unknown')).toContain('turnaround reference sheet');
    expect(getCharacterStyleInstruction('Preserve Source Style')).toContain(
      "reference image's art style",
    );
    expect(getCharacterStyleInstruction('Cyberpunk Neon')).toContain('CYBERPUNK NEON');
  });

  it('creates Cinematic layout and frame-shot fragments', () => {
    expect(createCinematicLayoutInstruction(6, 2, 3)).toBe(
      'Create a 6-frame storyboard grid (2 rows by 3 columns).',
    );
    expect(createCinematicFrameDirectives({ 0: 'Wide', 1: 'Auto', 2: 'Close-Up' })).toEqual([
      '- Frame 1: Wide Shot',
      '- Frame 3: Close-Up Shot',
    ]);
    expect(createCinematicFrameInstructions({ 0: 'Wide' })).toContain('SPECIFIC FRAME SHOTS');
  });

  it('creates Spritesheet layout and visual fragments', () => {
    expect(parseSpritesheetGrid('1x6 Strip')).toEqual({ gridCols: 6, gridRows: 1 });
    expect(parseSpritesheetGrid('bad')).toEqual({ gridCols: 2, gridRows: 2 });
    expect(getSpritesheetDividerState('Red Lines')).toMatchObject({
      hasDividers: true,
      dividerColor: 'RED',
      cellSeparation: 'VISIBLE_RED_LINES',
    });
    expect(getSpritesheetBackgroundDirective('Custom', '#abc123')).toBe('SOLID_COLOR_#ABC123');
    expect(createSpritesheetCellDirectives({ 0: 'idle', 2: 'run', 3: '' })).toEqual([
      'Cell 1: idle',
      'Cell 3: run',
    ]);
  });
});
