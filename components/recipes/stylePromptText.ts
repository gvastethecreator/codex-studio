import type { StyleRuntimePreset } from './styles/runtimeTypes';
import { createSelectedStyleLayer } from './styleLayerComposer';
import { buildLegacyStylePrompt } from '../../packages/shared/src/styles/legacyStylePrompt';

/** Copy/use-as-prompt follows the same metadata boundary as generation. */
export function buildStylePromptText(preset: StyleRuntimePreset): string {
  const layer = createSelectedStyleLayer({ preset, packId: '', packName: '', strength: 1 }, 0);
  return buildLegacyStylePrompt({ selectedStyles: [layer] });
}
