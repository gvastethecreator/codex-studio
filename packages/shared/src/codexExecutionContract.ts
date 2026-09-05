import type { GenerationTaskSpec } from './generationContracts';
import type { CodexModel, JobExecutionOptions } from './types';

export type CodexExecutionTransport = 'codex_app_server' | 'subscription_http';
export interface CodexExecutionPolicy {
  transport: CodexExecutionTransport;
  image?: { model: string; size: string; quality: 'medium' };
}

// Studio's subscription adapter has one chat model contract. Public API model
// support does not establish entitlement on the ChatGPT subscription endpoint.
export const CODEX_HTTP_CHAT_MODEL = 'gpt-5.5';
export const CODEX_HTTP_IMAGE_MODEL = 'gpt-image-2';
export const CODEX_HTTP_REASONING = 'provider_default';
export const CODEX_HTTP_MAX_INPUT_IMAGES = 16;
export const CODEX_HTTP_RATIO_SIZES: Record<string, string> = {
  '21:9': '1792x768',
  '16:9': '1536x864',
  '4:3': '1536x1152',
  '3:2': '1536x1024',
  '5:4': '1280x1024',
  '1:1': '1024x1024',
  '4:5': '1024x1280',
  '2:3': '1024x1536',
  '3:4': '1152x1536',
  '9:16': '864x1536',
};
export const CODEX_HTTP_MODEL: CodexModel = {
  id: CODEX_HTTP_CHAT_MODEL,
  model: CODEX_HTTP_CHAT_MODEL,
  displayName: 'GPT-5.5 (HTTP)',
  description: 'ChatGPT HTTP image generation. Reasoning and speed are managed by the provider.',
  hidden: false,
  defaultReasoningEffort: CODEX_HTTP_REASONING,
  supportedReasoningEfforts: [
    { reasoningEffort: CODEX_HTTP_REASONING, description: 'Managed by provider' },
  ],
  additionalSpeedTiers: [],
  inputModalities: ['text', 'image'],
  supportsPersonality: false,
  isDefault: true,
};
export const CODEX_HTTP_EXECUTION_DEFAULTS: JobExecutionOptions = {
  model: CODEX_HTTP_CHAT_MODEL,
  reasoningEffort: CODEX_HTTP_REASONING,
  serviceTier: null,
};

type CodexImageOutput = Partial<Pick<GenerationTaskSpec['output'], 'imageSize' | 'aspectRatio'>>;
export function resolveCodexHttpImageSize(output?: CodexImageOutput | null): string {
  const aspect = output?.aspectRatio?.trim() || '1:1';
  const requested = output?.imageSize?.trim();
  const size = !requested || requested === '1K' ? CODEX_HTTP_RATIO_SIZES[aspect] : requested;
  const dimensions = size?.match(/^(\d+)x(\d+)$/);
  const width = Number(dimensions?.[1]);
  const height = Number(dimensions?.[2]);
  const [ratioWidth, ratioHeight] = aspect.split(':').map(Number);
  if (
    !dimensions ||
    width % 16 ||
    height % 16 ||
    Math.max(width, height) > 3840 ||
    Math.max(width, height) > Math.min(width, height) * 3 ||
    width * height < 655_360 ||
    width * height > 8_294_400
  ) {
    throw new Error(
      'Codex HTTP needs an exact supported pixel size. Choose a listed aspect ratio or valid dimensions.',
    );
  }
  if (
    output?.aspectRatio &&
    (!ratioWidth || !ratioHeight || width * ratioHeight !== height * ratioWidth)
  ) {
    throw new Error('Codex HTTP image size must match the requested aspect ratio.');
  }
  return `${width}x${height}`;
}

export function resolveCodexExecutionPolicy(
  execution: JobExecutionOptions,
  sourceSpec: { output: CodexImageOutput; assets: readonly unknown[] } | null | undefined,
  transport: CodexExecutionTransport,
): CodexExecutionPolicy {
  if (transport === 'codex_app_server') {
    if (execution.reasoningEffort === CODEX_HTTP_REASONING)
      throw new Error('Select a reasoning effort supported by the Codex app-server model.');
    return { transport };
  }
  if (
    execution.model !== CODEX_HTTP_CHAT_MODEL ||
    execution.reasoningEffort !== CODEX_HTTP_REASONING ||
    execution.serviceTier
  ) {
    throw new Error(
      'Codex HTTP uses GPT-5.5 with provider-managed reasoning and speed. Apply the HTTP settings before generating.',
    );
  }
  if ((sourceSpec?.assets.length ?? 0) > CODEX_HTTP_MAX_INPUT_IMAGES) {
    throw new Error(
      `Codex HTTP accepts at most ${CODEX_HTTP_MAX_INPUT_IMAGES} input images. Remove extra images before generating.`,
    );
  }
  return {
    transport,
    image: {
      model: CODEX_HTTP_IMAGE_MODEL,
      size: resolveCodexHttpImageSize(sourceSpec?.output),
      quality: 'medium',
    },
  };
}

export function describeCodexExecution(policy?: CodexExecutionPolicy | null) {
  if (!policy) return 'Execution policy was not captured';
  if (policy.transport === 'codex_app_server') return 'Codex app-server';
  return `ChatGPT HTTP · ${policy.image?.model} · ${policy.image?.size} · medium image quality`;
}
