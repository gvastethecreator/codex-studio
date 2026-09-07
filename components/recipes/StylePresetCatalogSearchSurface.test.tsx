/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { loadGeneratedStyleRuntimePack } from './styleRuntimeData.generated';
import type { StyleRuntimePack } from './styles/runtimeTypes';
import { StylePresetCatalogSearchSurface } from './StylePresetCatalogSearchSurface';

vi.mock('./styleRuntimeData.generated', () => ({
  GENERATED_STYLE_RUNTIME_PACK_SUMMARIES: [
    { id: 'pack_01', name: 'First pack', presetCount: 100 },
    { id: 'pack_02', name: 'Second pack', presetCount: 1 },
  ],
  loadGeneratedStyleRuntimePack: vi.fn(),
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
const ready = () => waitFor(() => expect(screen.queryByRole('status')).toBeNull());

beforeEach(() => {
  vi.mocked(loadGeneratedStyleRuntimePack)
    .mockReset()
    .mockImplementation(async (id) => pack(id));
});
afterEach(cleanup);

describe('Style catalog loading', () => {
  it('keeps the loaded index while typing within the same pack scope', async () => {
    mount();
    await ready();
    const input = screen.getByRole('textbox', { name: 'Search presets' });
    expect(loadGeneratedStyleRuntimePack).toHaveBeenCalledTimes(1);
    fireEvent.change(input, { target: { value: 'b' } });
    await ready();
    expect(loadGeneratedStyleRuntimePack).toHaveBeenCalledTimes(3);
    expect(screen.getAllByText('Boudoir')).toHaveLength(2);
    for (const query of ['bo', 'bou', 'boud', 'boudo', 'boudoi', 'boudoir']) {
      fireEvent.change(input, { target: { value: query } });
      expect(screen.queryByRole('status')).toBeNull();
      expect(screen.getAllByText('Boudoir')).toHaveLength(2);
    }
    expect(loadGeneratedStyleRuntimePack).toHaveBeenCalledTimes(3);
    fireEvent.click(screen.getByRole('button', { name: 'Clear catalog search' }));
    await ready();
    expect(loadGeneratedStyleRuntimePack).toHaveBeenCalledTimes(4);
    expect(screen.getAllByText('Boudoir')).toHaveLength(1);
  });

  it('retries a failed load through the real search loader', async () => {
    vi.mocked(loadGeneratedStyleRuntimePack).mockRejectedValueOnce(new Error('Temporary failure'));
    mount();
    await screen.findByRole('alert');
    expect(screen.getByRole('alert').textContent).toBe('Could not load the style catalog.');
    expect(screen.queryByRole('status')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await ready();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText('Boudoir')).toBeTruthy();
    expect(loadGeneratedStyleRuntimePack).toHaveBeenCalledTimes(2);
  });

  it('ignores a late rejection from the previous pack scope', async () => {
    let rejectInitial!: (error: Error) => void;
    vi.mocked(loadGeneratedStyleRuntimePack).mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectInitial = reject;
        }),
    );
    mount();
    fireEvent.change(screen.getByRole('textbox', { name: 'Search presets' }), {
      target: { value: 'b' },
    });
    await ready();
    await act(async () => rejectInitial(new Error('Old request failed')));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getAllByText('Boudoir')).toHaveLength(2);
  });
});
