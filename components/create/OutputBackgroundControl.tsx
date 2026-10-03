import { resolveProviderSupportsTransparentBackground } from '../../lib/composerProviderProjection';
import { resolveGenerationBackground } from '../../lib/generationBackground';
import type { ImageGenerationConfig } from '../../types';

export function OutputBackgroundControl({
  config,
  providerId,
  onChange,
}: {
  config: ImageGenerationConfig;
  providerId?: string;
  transport?: string;
  onChange: (value: 'workflow' | 'transparent') => void;
}) {
  const supported = resolveProviderSupportsTransparentBackground(providerId);
  const removing = supported && resolveGenerationBackground(config) === 'transparent';
  const hasSource = config.attachments.length > 0;
  return (
    <label className="create-field output-background-control">
      <span className="create-field-label">Background</span>
      <select
        aria-label="Output background"
        className="studio-input"
        value={removing ? 'transparent' : 'workflow'}
        onChange={(event) => onChange(event.target.value as 'workflow' | 'transparent')}
      >
        <option value="workflow">Maintain background</option>
        <option value="transparent" disabled={!supported}>
          Remove background
        </option>
      </select>
      <small>
        {removing
          ? 'Native transparent PNG. Automatic workflow backdrops are ignored.'
          : hasSource
            ? 'Keep the source background unless your prompt or selected action changes it.'
            : 'Use the background described in your prompt or selected action.'}
      </small>
      {(config.recipeId === 'animation-sequence' || config.recipeId === 'sprite-atlas') && (
        <small>Prepared runs keep their selected background. Prepare a new run to change it.</small>
      )}
      {!supported ? (
        <small>Native transparency requires a GPT Image HTTP model.</small>
      ) : config.codexImageModel === 'gpt-image-2' && removing ? (
        <small>GPT Image 2 transparency is in preview.</small>
      ) : null}
    </label>
  );
}
