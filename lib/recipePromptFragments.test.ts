import { describe, expect, it } from 'vitest';

import {
  createCinematicFrameDirectives,
  createCinematicFrameInstructions,
  createCinematicLayoutInstruction,
  createAnimationSequenceOutputDirective,
  createAnimationSequenceReferenceDirective,
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
    expect(getCharacterStyleInstruction('Preserve Source Style', true)).toContain(
      "reference image's art style",
    );
    expect(getCharacterStyleInstruction('Preserve Source Style', false)).not.toContain('reference');
    expect(getCharacterStyleInstruction('Cyberpunk Neon', true)).toContain('CYBERPUNK NEON');
  });

  it('creates Cinematic layout and frame-shot fragments', () => {
    expect(createCinematicLayoutInstruction(6, 2, 3)).toBe(
      'Create a 6-frame storyboard grid (2 rows by 3 columns).',
    );
    expect(
      createCinematicFrameDirectives({ 6: 'Wide', 0: 'Wide', 1: 'Auto', 2: 'Close-Up' }, 3),
    ).toEqual(['Frame 1: Wide Shot', 'Frame 3: Close-Up Shot']);
    expect(createCinematicFrameInstructions({ 0: 'Wide' }, 3)).toContain('SPECIFIC FRAME SHOTS');
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
    expect(
      createSpritesheetCellDirectives({ 9: 'stale kick', 0: 'idle', 2: 'run', 3: '' }, 4),
    ).toEqual(['Cell 1: idle', 'Cell 3: run']);
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
});
