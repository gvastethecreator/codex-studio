import { describe, expect, it } from 'vite-plus/test';

import { serializeRecipeProviderDirectives } from '../packages/shared/src';
import { getRecipeModule } from './recipeModules';
import { buildRecipeProviderDirectives } from './recipeProviderDirectives';

describe('recipeProviderDirectives', () => {
  it('builds compact provider directives for style preset params', () => {
    const styles = getRecipeModule('styles');
    expect(styles).toBeTruthy();

    const directives =
      styles &&
      buildRecipeProviderDirectives(styles, {
        presetId: 'SP09-006',
        presetName: 'Glass Owl',
        mode: 'DIRECT_STYLE_SYNTHESIS',
        aesthetic: 'polished glass object study',
        colorTone: 'cool mineral blues',
      });

    expect(directives).toMatchObject({
      protocol: 'recipe-provider-directives/v1',
      recipeId: 'styles',
      title: 'Styles',
    });
    expect(directives && serializeRecipeProviderDirectives(directives)).toContain(
      '- Core Aesthetic: polished glass object study',
    );
  });

  it('builds compact provider directives for camera params', () => {
    const camera = getRecipeModule('camera');
    expect(camera).toBeTruthy();

    const directives =
      camera &&
      buildRecipeProviderDirectives(camera, {
        azimuth: 80,
        elevation: 30,
        distance: 140,
        hasReference: true,
      });

    const serialized = directives ? serializeRecipeProviderDirectives(directives) : '';

    expect(directives).toMatchObject({
      protocol: 'recipe-provider-directives/v1',
      recipeId: 'camera',
      title: 'Camera View',
    });
    expect(serialized).toContain('- Azimuth: 80 degrees');
    expect(serialized).toContain('- Horizontal Position: RIGHT PROFILE (Side View)');
    expect(serialized).toContain('- Has Reference: yes');
  });

  it('builds compact provider directives for character params', () => {
    const character = getRecipeModule('character');
    expect(character).toBeTruthy();

    const directives =
      character &&
      buildRecipeProviderDirectives(character, {
        layout: 'Dynamic Sheet',
        style: 'Concept Art (Digital)',
        shot: 'Full Body',
        focus: 'Weapons/Gear',
        hasReference: false,
      });

    const serialized = directives ? serializeRecipeProviderDirectives(directives) : '';

    expect(directives).toMatchObject({
      protocol: 'recipe-provider-directives/v1',
      recipeId: 'character',
      title: 'Character Sheet',
    });
    expect(serialized).toContain('- Layout: Dynamic Sheet');
    expect(serialized).toContain('main, full-body dynamic action pose');
    expect(serialized).toContain('- Style: Concept Art (Digital)');
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
    expect(serialized).toContain('- Frame 2: Close-Up Shot');
    expect(serialized).toContain('- Genre: Noir');
  });

  it('builds compact provider directives for remaster params', () => {
    const remaster = getRecipeModule('remaster');
    expect(remaster).toBeTruthy();

    const directives =
      remaster &&
      buildRecipeProviderDirectives(remaster, {
        style: 'Oil Detail',
        lighting: 'Studio Lighting',
        camera: 'Texture Enhancement',
        anatomy: 'Fix Hands',
        text: 'Remove Text',
        color: 'Natural Colors',
        fidelity: 80,
      });

    const serialized = directives ? serializeRecipeProviderDirectives(directives) : '';

    expect(directives).toMatchObject({
      protocol: 'recipe-provider-directives/v1',
      recipeId: 'remaster',
      title: 'Remaster',
    });
    expect(serialized).toContain('- Style Interpretation: Oil Detail');
    expect(serialized).toContain('- Adherence To Original Composition: 0.80');
    expect(serialized).toContain('- Creative Enhancement Freedom: 0.20');
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
    expect(serialized).toContain('- Columns: 4');
    expect(serialized).toContain('- Cell Separation: VISIBLE_BLUE_LINES');
    expect(serialized).toContain('- Background: SOLID_GREEN_#00FF00');
    expect(serialized).toContain('Cell 2: first run step');
  });

  it('builds compact provider directives for timeline params', () => {
    const timeline = getRecipeModule('timeline');
    expect(timeline).toBeTruthy();

    const directives =
      timeline &&
      buildRecipeProviderDirectives(timeline, {
        nextIndex: 4,
        direction: 'backward',
        timeDeltaLabel: 'Minutes',
        cameraMode: 'dynamic',
        motionAmount: 'High Action',
        lightingMode: 'Evolving',
        isAnchored: true,
      });

    const serialized = directives ? serializeRecipeProviderDirectives(directives) : '';

    expect(directives).toMatchObject({
      protocol: 'recipe-provider-directives/v1',
      recipeId: 'timeline',
      title: 'Timeline Frame',
    });
    expect(serialized).toContain('- Direction Prompt: Generate a plausible past state.');
    expect(serialized).toContain('- Time Delta Value: MEDIUM_TERM_PROGRESSION');
    expect(serialized).toContain('- Anchored Identity: yes');
  });

  it('returns empty but valid directives when a registered recipe has only defaults', () => {
    const character = getRecipeModule('character');
    const directives = character && buildRecipeProviderDirectives(character, {});

    expect(directives).toMatchObject({
      protocol: 'recipe-provider-directives/v1',
      recipeId: 'character',
    });
  });
});
