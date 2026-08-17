import {
  GROK_IMAGINE_ASPECT_RATIO_VALUES,
  isGrokImagineAspectRatio,
  isGrokImagineRecipeId,
  MAX_GROK_IMAGINE_SOURCE_IMAGES,
  type GrokImagineAspectRatio,
} from '../packages/shared/src/grokImagineContract';
import type { GenerationProviderId } from '../packages/shared/src/generationContracts';
import { IMAGE_GEN_RATIO_OPTIONS } from '../utils/imageGenSizing';
import type { Attachment, RecipeId } from '../types';

export interface GrokImagineGenerateBlock {
  code: string;
  message: string;
}

export function listGrokImagineRatioOptions() {
  return IMAGE_GEN_RATIO_OPTIONS.filter((option) => isGrokImagineAspectRatio(option.ratio));
}

export function resolveGrokImagineToolbarAspectRatio(
  aspectRatio?: string | null,
): Exclude<GrokImagineAspectRatio, 'auto'> {
  if (aspectRatio && aspectRatio !== 'auto' && isGrokImagineAspectRatio(aspectRatio)) {
    return aspectRatio as Exclude<GrokImagineAspectRatio, 'auto'>;
  }
  return '1:1';
}

export function describeGrokImagineEditNotice(providerId: GenerationProviderId) {
  if (providerId !== 'grok') return null;
  return 'Grok Imagine edits the library image from your prompt. It does not use the painted mask.';
}

export function resolveGrokCanExecute({
  canExecute,
  canAttemptExecution,
}: {
  canExecute?: boolean;
  canAttemptExecution?: boolean;
}) {
  return canExecute === true && canAttemptExecution === true;
}

export function summarizeGrokProviderStatusLine({
  canExecute,
  status,
  diagnostics,
}: {
  canExecute: boolean;
  status: string;
  diagnostics: string[];
}) {
  if (canExecute) return 'Ready';
  if (status === 'unknown') return 'Checking runtime';
  const text = diagnostics.join(' ');
  if (/login/i.test(text)) return 'Run grok login';
  if (/Install Grok Build|grok_cli_unavailable/i.test(text)) return 'Install Grok Build';
  if (/Update Grok Build|Imagine|outdated|headless/i.test(text)) return 'Update Grok Build';
  if (/available model|current Grok model|grok_model_unavailable/i.test(text)) {
    return 'Choose a current Grok model';
  }
  return 'Needs setup';
}

export function resolveGrokImagineGenerateBlock({
  providerId,
  recipeId,
  aspectRatio,
  attachments,
  canExecute = true,
}: {
  providerId: GenerationProviderId;
  recipeId?: RecipeId | null;
  aspectRatio?: string | null;
  attachments?: Attachment[];
  canExecute?: boolean;
}): GrokImagineGenerateBlock | null {
  if (providerId !== 'grok') return null;

  if (!canExecute) {
    return {
      code: 'grok_not_ready',
      message: 'Grok Imagine is blocked. Run `grok login`, then retry.',
    };
  }

  if (recipeId && !isGrokImagineRecipeId(recipeId)) {
    return {
      code: 'unsupported_grok_recipe',
      message: 'This recipe uses Codex. Switch provider or open a Grok recipe.',
    };
  }

  if (aspectRatio && !isGrokImagineAspectRatio(aspectRatio)) {
    return {
      code: 'invalid_grok_aspect_ratio',
      message: `Grok Imagine accepts ${GROK_IMAGINE_ASPECT_RATIO_VALUES.filter((value) => value !== 'auto').join(', ')}, or Auto.`,
    };
  }

  const refs = attachments ?? [];
  if (refs.length > MAX_GROK_IMAGINE_SOURCE_IMAGES) {
    return {
      code: 'invalid_grok_source_count',
      message: `Grok Imagine accepts up to ${MAX_GROK_IMAGINE_SOURCE_IMAGES} library images.`,
    };
  }

  if (refs.some((attachment) => attachment.sourceUrl && !attachment.localPath)) {
    return {
      code: 'unresolved_grok_source',
      message: 'Import the image into the Studio Library first.',
    };
  }

  return null;
}
