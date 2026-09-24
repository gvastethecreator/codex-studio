/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadStylePresetCatalogSearchIndex } from './stylePresetCatalogSearchData';
import { createStylePresetCatalogSearchIndexFromRuntimePacks } from './stylePresetManifests';
import type { StyleRuntimePack } from './styles/runtimeTypes';
import { StylePresetCatalogSearchSurface } from './StylePresetCatalogSearchSurface';

vi.mock('./stylePresetCatalogSearchData', () => ({
  STYLE_PRESET_CATALOG_SEARCH_PACK_SUMMARIES: [
    { id: 'pack_01', name: 'First pack', presetCount: 100 },
    { id: 'pack_02', name: 'Second pack', presetCount: 1 },
  ],
  loadStylePresetCatalogSearchIndex: vi.fn(),
}));
vi.mock('../../lib/styleThumbnailCatalog', () => ({
  getStyleThumbnail: () => null,
  getStyleCategoryImage: () => null,
  resolveStyleDefaultImageThumbnail: () => null,
  STYLE_CATEGORY_PREVIEWS: {},
}));

const pack = (id: string): StyleRuntimePack => ({
  id,
  name: id,
  description: '',
  presets: [
    {
      id: `${id}-preset`,
      name: 'Boudoir',
      category: 'Portrait',
      negativePrompt: '',
      style: {
        aesthetic: '',
        subject_treatment: '',
        color_and_tone: '',
        lighting_and_shadow: '',
        texture_and_material: '',
        camera_and_composition: '',
        atmosphere_and_mood: '',
        rendering_and_quality: '',
      },
    },
  ],
});
const mount = () =>
  render(
    <StylePresetCatalogSearchSurface
      onClose={vi.fn()}
      onSelectPreset={vi.fn()}
      onApplyPreset={vi.fn()}
    />,
  );
const ready = () => waitFor(() => expect(screen.queryByText('Loading catalog…')).toBeNull());

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener() {},
    removeEventListener() {},
  }));
  vi.mocked(loadStylePresetCatalogSearchIndex)
    .mockReset()
    .mockImplementation(async (ids) =>
      createStylePresetCatalogSearchIndexFromRuntimePacks(ids.map(pack)),
    );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Style catalog loading', () => {
  it('keeps the loaded index while typing within the same pack scope', async () => {
    mount();
    await ready();
    const input = screen.getByRole('textbox', { name: 'Search presets' });
    expect(loadStylePresetCatalogSearchIndex).toHaveBeenCalledTimes(1);
    fireEvent.change(input, { target: { value: 'b' } });
    await ready();
    expect(loadStylePresetCatalogSearchIndex).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText('Boudoir')).toHaveLength(2);
    for (const query of ['bo', 'bou', 'boud', 'boudo', 'boudoi', 'boudoir']) {
      fireEvent.change(input, { target: { value: query } });
      expect(screen.queryByText('Loading catalog…')).toBeNull();
      expect(screen.getAllByText('Boudoir')).toHaveLength(2);
    }
    expect(loadStylePresetCatalogSearchIndex).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Clear catalog search' }));
    await ready();
    expect(loadStylePresetCatalogSearchIndex).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText('Boudoir')).toHaveLength(2);
  });

  it('retries a failed load through the search index loader', async () => {
    vi.mocked(loadStylePresetCatalogSearchIndex).mockRejectedValueOnce(
      new Error('Temporary failure'),
    );
    mount();
    await screen.findByRole('alert');
    expect(screen.getByRole('alert').textContent).toBe('Could not load the style catalog.');
    expect(screen.queryByText('Loading catalog…')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await ready();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getAllByText('Boudoir')).toHaveLength(2);
    expect(loadStylePresetCatalogSearchIndex).toHaveBeenCalledTimes(2);
  });

  it('ignores a late rejection from the previous pack scope', async () => {
    // The pack picker mounts this panel with React.lazy; resolve it before the race assertion.
    await import('../ui/GsapDropdown');
    let rejectInitial!: (error: Error) => void;
    vi.mocked(loadStylePresetCatalogSearchIndex).mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectInitial = reject;
        }),
    );
    mount();
    fireEvent.click(
      screen.getByRole('button', { name: 'Filter style catalog by pack: All Packs' }),
    );
    fireEvent.click(await screen.findByRole('option', { name: /Second pack/ }));
    await ready();
    await act(async () => rejectInitial(new Error('Old request failed')));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getAllByText('Boudoir')).toHaveLength(1);
  });
});
