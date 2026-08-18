import { describe, expect, it } from 'vite-plus/test';

import {
  collectStyleLandingFolderPreferredKeys,
  groupThumbnailPackIds,
  isGeneratedThumbnailModuleStale,
  isLandingFolderIndexStale,
  packIdFromThumbnailAssetKey,
  presetIdFromThumbnailAssetKey,
  resolveThumbnailAssetPackId,
  selectStyleLandingFolderImageKeys,
} from './styleThumbnailProjection';

describe('style thumbnail projection helpers', () => {
  it('assigns split anime preset files to the manifest pack, not the id prefix', () => {
    const packIdByPresetId = new Map([
      ['SP05-001', 'pack_16'],
      ['SP05-034', 'pack_05'],
      ['SP13-026', 'pack_16'],
    ]);

    expect(presetIdFromThumbnailAssetKey('SP05-001-01')).toBe('SP05-001');
    expect(presetIdFromThumbnailAssetKey('SP05-001-grok')).toBe('SP05-001');
    expect(resolveThumbnailAssetPackId('SP05-001', packIdByPresetId)).toBe('pack_16');
    expect(resolveThumbnailAssetPackId('SP05-001-01', packIdByPresetId)).toBe('pack_16');
    expect(resolveThumbnailAssetPackId('SP05-001-grok', packIdByPresetId)).toBe('pack_16');
    expect(resolveThumbnailAssetPackId('SP05-034', packIdByPresetId)).toBe('pack_05');
    expect(resolveThumbnailAssetPackId('SP13-026', packIdByPresetId)).toBe('pack_16');
    expect(resolveThumbnailAssetPackId('pack_16__70s_and_80s_retro_anime', packIdByPresetId)).toBe(
      'pack_16',
    );
    expect(packIdFromThumbnailAssetKey('SP05-001')).toBe('pack_05');
    expect(groupThumbnailPackIds(['pack_05', 'pack_13', 'pack_16'])).toEqual([
      ['pack_05'],
      ['pack_13'],
      ['pack_16'],
    ]);
    expect(
      isGeneratedThumbnailModuleStale({
        actual: "pack_16: () => import('./thumbnail_group_09')",
        referencedFiles: ['./thumbnail_group_09'],
        isIndex: true,
      }),
    ).toBe(false);
    expect(
      isLandingFolderIndexStale({
        actual: 'export const STYLE_LANDING_FOLDER_SUMMARIES_BY_ID = { pack_16: true }\npresetCount: 12',
        expectedIds: ['pack_16'],
        expectedCounts: ['presetCount: 12'],
      }),
    ).toBe(false);
  });

  it('keeps landing folder keys unique and limited to available assets', () => {
    expect(
      selectStyleLandingFolderImageKeys(
        collectStyleLandingFolderPreferredKeys({
          featuredPresetIds: ['SP01-028', 'SP01-028', 'SP99-001'],
          categoryKeys: ['pack_01__portrait_and_studio'],
          presetIds: ['SP01-029', 'SP01-030'],
        }),
        new Set(['SP01-028', 'pack_01__portrait_and_studio', 'SP01-029']),
        3,
      ),
    ).toEqual(['SP01-028', 'pack_01__portrait_and_studio', 'SP01-029']);
  });
});
