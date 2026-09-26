import { describe, expect, it } from 'vitest';

import {
  createSpriteAtlasContract,
  createSpriteAtlasPresetSummaries,
} from './spriteAtlasContracts';

describe('spriteAtlasContracts', () => {
  it('builds a normalized contract from preset params', () => {
    const contract = createSpriteAtlasContract({
      presetId: 'tileset-topdown',
      stylePreset: 'illustration',
      backgroundRemoval: 'auto',
      columns: 12,
    });

    expect(contract).toMatchObject({
      presetId: 'tileset-topdown',
      assetKind: 'tileset',
      extractionMode: 'slots',
      workflowLane: 'tileset',
      frameSemantics: 'tiles',
      stylePreset: 'illustration',
      backgroundRemoval: 'alpha',
      columns: 12,
      transparent: true,
    });
    expect(contract.rows.map((row) => row.id)).toEqual([
      'terrain',
      'paths',
      'water',
      'walls',
      'decor',
    ]);
    expect(contract.rows.every((row) => row.repeatMode === null)).toBe(true);
  });

  it('assigns lanes from the preset instead of one shared sheet type', () => {
    expect(createSpriteAtlasContract({ presetId: 'ui-avatar' })).toMatchObject({
      workflowLane: 'animation',
      frameSemantics: 'temporal',
    });
    expect(createSpriteAtlasContract({ presetId: 'asset-pack' })).toMatchObject({
      workflowLane: 'true-grid',
      frameSemantics: 'variants',
    });
    expect(createSpriteAtlasContract({ presetId: 'custom-atlas' })).toMatchObject({
      workflowLane: 'static-items',
      frameSemantics: 'items',
    });
    expect(createSpriteAtlasContract({ presetId: 'texture-pack' }).rows[0]).toMatchObject({
      repeatMode: 'self',
    });
  });

  it('falls back to safe defaults for unsupported enum params', () => {
    const contract = createSpriteAtlasContract({
      presetId: 'nope',
      frameBudget: 'tiny',
      backgroundRemoval: 'erase',
      qaMode: 'extreme',
    });

    expect(contract.presetId).toBe('platformer-character');
    expect(contract.frameBudget).toBe('preset');
    expect(contract.backgroundRemoval).toBe('alpha');
    expect(contract.qaMode).toBe('standard');
    expect(contract.workflowLane).toBe('animation');
    expect(contract.frameSemantics).toBe('temporal');
    expect(createSpriteAtlasContract({}).backgroundRemoval).toBe('alpha');
    expect(createSpriteAtlasContract({ backgroundRemoval: 'chroma' }).backgroundRemoval).toBe(
      'chroma',
    );
    expect(createSpriteAtlasContract({ backgroundRemoval: 'rembg' }).backgroundRemoval).toBe(
      'alpha',
    );
  });

  it('exposes preset summaries for recipe and backend discovery', () => {
    const summaries = createSpriteAtlasPresetSummaries();

    expect(summaries.map((summary) => summary.id)).toContain('platformer-character');
    expect(summaries.find((summary) => summary.id === 'asset-pack')).toMatchObject({
      assetKind: 'asset',
      rows: 5,
    });
  });
});
