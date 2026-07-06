import { describe, expect, it } from 'vite-plus/test';

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
      stylePreset: 'illustration',
      backgroundRemoval: 'auto',
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
    expect(contract.backgroundRemoval).toBe('chroma');
    expect(contract.qaMode).toBe('standard');
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
