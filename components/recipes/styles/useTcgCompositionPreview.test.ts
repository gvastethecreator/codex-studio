import { describe, expect, it } from 'vitest';
import type { TcgRenderInput } from './tcgCardRenderer';
import { getTcgCompositionReadiness } from './useTcgCompositionPreview';

describe('TCG composition readiness', () => {
  it('requires a fresh render with every required art and mask before PNG export', () => {
    const input: TcgRenderInput = {
      layoutId: 'TCG-L001',
      finishId: 'TCG-F001',
      artwork: [{ name: 'Card', type: '', rules: '', src: 'data:image/png;base64,art' }],
      masks: { foilMask: 'data:image/png;base64,mask' },
    };
    const base = {
      artwork: input.artwork,
      requiredArtworkCount: 1,
      requiredMaskKeys: ['foilMask'],
      maskSources: { foilMask: input.masks.foilMask! },
      renderInput: input,
      renderHealth: { input, missingMaskKeys: [], failedArtworkSlots: [], failedMaskKeys: [] },
      rendering: false,
      renderError: '',
    };
    expect(getTcgCompositionReadiness(base).canExport).toBe(true);
    expect(getTcgCompositionReadiness({ ...base, renderInput: { ...input } }).canExport).toBe(
      false,
    );
    expect(getTcgCompositionReadiness({ ...base, renderHealth: null }).canExport).toBe(false);
    expect(getTcgCompositionReadiness({ ...base, maskSources: {} }).canExport).toBe(false);
    expect(
      getTcgCompositionReadiness({ ...base, renderHealth: null, maskSources: {} }).selectedReasons,
    ).toContain('Falta la máscara PNG foilMask.');
  });
});
