import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import {
  buildRecipeContext,
  parseRecipeIdFromContext,
  resolveGenerationConfig,
} from './recipeContext';

describe('recipeContext', () => {
  it('builds camera recipe documents with the shared protocol envelope', () => {
    const context = buildRecipeContext('camera', {
      azimuth: 45,
      elevation: 15,
      distance: 120,
      hPos: 'FRONT RIGHT (45°)',
      vPos: 'HIGH ANGLE',
      framing: 'MEDIUM SHOT',
      geometryConstraints: 'Keep the shoulders readable and the silhouette clean.',
    });

    expect(context).toContain('protocol: codex-recipe-v1');
    expect(context).toContain('recipe: camera');
    expect(context).toContain('ORBIT (Azimuth): 45°');
    expect(context).toContain('HIGH ANGLE');
    expect(context).toContain('Keep the shoulders readable and the silhouette clean.');
  });

  it('parses recipe ids back from generated documents', () => {
    const context = buildRecipeContext('styles', {
      presetId: 'neo-noir',
      presetLabel: 'Neo Noir',
      categoryLabel: 'Cinematic',
      prompt: 'Rain-soaked neon alley',
    });

    expect(parseRecipeIdFromContext(context)).toBe('styles');
  });

  it('includes selected style layers in style recipe documents', () => {
    const context = buildRecipeContext('styles', {
      presetId: 'SP01-001',
      presetName: 'Studio Headshot + Film Noir',
      selectedStyles: [
        {
          slot: 1,
          presetName: 'Studio Headshot',
          packName: 'Photography & Realism',
          strength: 0.7,
          aesthetic: 'clean studio portrait',
        },
        {
          slot: 2,
          presetName: 'Film Noir',
          packName: 'Cinematic & Media',
          strength: 0.4,
          aesthetic: 'hard shadow crime drama',
        },
      ],
    });

    expect(context).toContain('[SELECTED STYLE LAYERS]');
    expect(context).toContain(
      'Slot 1: Studio Headshot | Pack: Photography & Realism | Strength: 0.70',
    );
    expect(context).toContain('Slot 2: Film Noir | Pack: Cinematic & Media | Strength: 0.40');
  });

  it('does not parse recipe ids from title substrings without the protocol envelope', () => {
    expect(parseRecipeIdFromContext('CAMERA VIEW PROMPT')).toBeNull();
  });

  it('includes timeline guidance in timeline documents', () => {
    const context = buildRecipeContext('timeline', {
      nextIndex: 3,
      direction: 'forward',
      timeDeltaLabel: 'Minutes',
      timeDeltaValue: '5',
      cameraMode: 'dynamic',
      motionAmount: '65',
      lightingMode: 'evolving',
      isAnchored: true,
    });

    expect(context).toContain('recipe: timeline');
    expect(context).toContain('TIMELINE_FRAME_GUIDANCE');
    expect(context).toContain('"sequence_index": 3');
    expect(context).toContain('NEXT FRAME: Generate a plausible future state.');
  });

  it('resolves recipe params into recipeContext before generation', () => {
    const resolved = resolveGenerationConfig({
      ...DEFAULT_GENERATION_CONFIG,
      prompt: 'A heroic turnaround sheet',
      recipeId: 'character',
      recipeParams: {
        layout: 'turnaround',
        expression: 'stoic',
        outfit: 'armored coat',
      },
      recipeContext: '',
    });

    expect(resolved.recipeId).toBe('character');
    expect(resolved.recipeParams).toEqual({
      layout: 'turnaround',
      expression: 'stoic',
      outfit: 'armored coat',
    });
    expect(resolved.recipeContext).toContain('recipe: character');
    expect(resolved.recipeContext).toContain('turnaround');
  });
});
