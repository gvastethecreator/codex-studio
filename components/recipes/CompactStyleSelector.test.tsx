/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CompactStyleSelector } from './CompactStyleSelector';
import type { SelectedStyleSlot } from './styleLayerComposer';
import type { StylePresetCatalogSearchIndex } from './stylePresetManifests';
import type { StyleRuntimePreset } from './styles/runtimeTypes';

const preset = (id: string, name: string): StyleRuntimePreset => ({
  id,
  name,
  category: 'Film Stocks',
  negativePrompt: '',
  style: {
    aesthetic: 'grain',
    subject_treatment: 'subject',
    color_and_tone: 'tone',
    lighting_and_shadow: 'light',
    texture_and_material: 'texture',
    camera_and_composition: 'camera',
    atmosphere_and_mood: 'mood',
    rendering_and_quality: 'quality',
  },
});

const slot = (id: string, name: string, strength = 0.75): SelectedStyleSlot => ({
  preset: preset(id, name),
  packId: 'pack_01',
  packName: 'Photography',
  strength,
  enabled: true,
});

const catalogIndex: StylePresetCatalogSearchIndex = {
  packs: [{ id: 'pack_01', name: 'Photography', presetCount: 2 }],
  totalPresetCount: 2,
  presets: [
    {
      id: 'SP01-001',
      name: 'Silver Grain',
      ref: 'pack_01/SP01-001.yaml',
      packId: 'pack_01',
      packName: 'Photography',
      categoryId: 'film',
      categoryName: 'Film Stocks',
      tags: [],
      supportedTasks: ['image_generate'],
      searchableText: 'sp01-001 silver grain photography film stocks',
    },
    {
      id: 'SP01-002',
      name: 'Noir Lighting',
      ref: 'pack_01/SP01-002.yaml',
      packId: 'pack_01',
      packName: 'Photography',
      categoryId: 'light',
      categoryName: 'Lighting',
      tags: [],
      supportedTasks: ['image_generate'],
      searchableText: 'sp01-002 noir lighting photography lighting',
    },
  ],
};

const loadIndex = vi.fn(async () => catalogIndex);
const loadPreview = vi.fn(async () => null);

afterEach(() => {
  cleanup();
  loadIndex.mockClear();
  loadPreview.mockClear();
});

function renderSelector(selected: SelectedStyleSlot[] = []) {
  const onChooseStyle = vi.fn();
  const onRemove = vi.fn();
  const onBrowseCatalog = vi.fn();
  const onSetStrength = vi.fn();
  const onToggleEnabled = vi.fn();
  const onMove = vi.fn();
  const onToggleFavorite = vi.fn();
  render(
    <CompactStyleSelector
      selectedStyles={selected}
      maxSlots={5}
      favorites={['SP01-002']}
      packSummaries={catalogIndex.packs}
      loadIndex={loadIndex}
      loadPreview={loadPreview}
      onToggleFavorite={onToggleFavorite}
      onChooseStyle={onChooseStyle}
      onRemove={onRemove}
      onSetStrength={onSetStrength}
      onToggleEnabled={onToggleEnabled}
      onMove={onMove}
      onBrowseCatalog={onBrowseCatalog}
    />,
  );
  return {
    onChooseStyle,
    onRemove,
    onBrowseCatalog,
    onSetStrength,
    onToggleEnabled,
    onMove,
    onToggleFavorite,
  };
}

describe('CompactStyleSelector', () => {
  it('keeps the tray empty until a style is added from the menu', async () => {
    const { onChooseStyle, onBrowseCatalog } = renderSelector();

    expect(screen.getByRole('heading', { name: 'Styles' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Add a style' }));
    await waitFor(() => expect(screen.getByRole('dialog', { name: 'Add styles' })).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Photography, 2 styles' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Add Silver Grain' })).toBeTruthy(),
    );
    expect(screen.getByText('Film Stocks')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add Noir Lighting' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Add Silver Grain' }));
    expect(onChooseStyle).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'SP01-001', name: 'Silver Grain' }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open style catalog' }));
    expect(onBrowseCatalog).toHaveBeenCalledTimes(1);
  });

  it('shows selected rows with intensity, pause, and remove', () => {
    const { onRemove, onToggleEnabled, onSetStrength } = renderSelector([
      slot('SP01-001', 'Silver Grain', 0.4),
    ]);

    expect(screen.getByLabelText('1 of 5 style slots').textContent).toContain('1 / 5');
    fireEvent.click(screen.getByRole('button', { name: 'Pause Silver Grain' }));
    expect(onToggleEnabled).toHaveBeenCalledWith('SP01-001');
    fireEvent.click(screen.getByRole('button', { name: 'Intensity for Silver Grain: 40 percent' }));
    expect(screen.getByRole('dialog', { name: 'Style intensity' })).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Intensity for Silver Grain'), {
      target: { value: '80' },
    });
    expect(onSetStrength).toHaveBeenCalledWith('SP01-001', 0.8);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Silver Grain' }));
    expect(onRemove).toHaveBeenCalledWith('SP01-001');
  });

  it('closes the add menu on Escape while a hover preview is open', async () => {
    renderSelector();
    fireEvent.click(screen.getByRole('button', { name: 'Add a style' }));
    await waitFor(() => expect(screen.getByRole('dialog', { name: 'Add styles' })).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Photography, 2 styles' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Add Silver Grain' })).toBeTruthy(),
    );
    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Add Silver Grain' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'Add styles' })).toBeNull();
  });

  it('keeps one floating preview host while hovering presets', async () => {
    renderSelector();
    fireEvent.click(screen.getByRole('button', { name: 'Add a style' }));
    await waitFor(() => expect(screen.getByRole('dialog', { name: 'Add styles' })).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Photography, 2 styles' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Add Silver Grain' })).toBeTruthy(),
    );

    const node = document.querySelector('.cs-preview') as HTMLElement | null;
    expect(node).toBeTruthy();
    const grain = screen.getByRole('button', { name: 'Add Silver Grain' });
    const noir = screen.getByRole('button', { name: 'Add Noir Lighting' });
    grain.getBoundingClientRect = () =>
      ({
        top: 40,
        left: 12,
        right: 220,
        bottom: 72,
        width: 208,
        height: 32,
        x: 12,
        y: 40,
        toJSON() {},
      }) as DOMRect;
    noir.getBoundingClientRect = () =>
      ({
        top: 200,
        left: 12,
        right: 220,
        bottom: 232,
        width: 208,
        height: 32,
        x: 12,
        y: 200,
        toJSON() {},
      }) as DOMRect;
    fireEvent.click(screen.getByRole('button', { name: 'Preview Silver Grain' }));
    await waitFor(() => expect(Number.parseFloat(node?.style.top || '0')).toBeGreaterThan(0));
    const topGrain = Number.parseFloat(node?.style.top || '0');
    fireEvent.click(screen.getByRole('button', { name: 'Preview Noir Lighting' }));
    await waitFor(() =>
      expect(Number.parseFloat(node?.style.top || '0')).toBeGreaterThan(topGrain),
    );
    expect(document.querySelectorAll('.cs-preview')).toHaveLength(1);
    expect(document.querySelector('.cs-preview')).toBe(node);
  });
});
