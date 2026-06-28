import type {
  EditableStudioSettings,
  GenerationProviderCapabilitiesResponse,
  GenerationProviderRuntimePreflightResponse,
} from '../packages/shared/src';
import type { GenerationProviderId } from '../packages/shared/src/generationContracts';
import type { StudioRuntimeStatusItem, StudioStatusTone } from './studioDiagnostics';

export interface CommandCenterQueuePreview {
  id: string;
  src: string;
}

export interface CommandCenterRuntimeProjection {
  label: string;
  tone: StudioStatusTone;
  tooltip: string;
}

export interface CommandCenterProviderProjection {
  id: GenerationProviderId;
  label: string;
  status: 'active' | 'planned' | 'not_configured' | 'unknown';
  tone: StudioStatusTone;
  tooltip: string;
  canExecute: boolean;
}

export interface CommandCenterQueueProjection {
  count: number;
  isOpen: boolean;
  resultPreviews: CommandCenterQueuePreview[];
  hasResultPreviews: boolean;
  showCollapsedProgress: boolean;
}

export interface StudioCommandCenterProjection {
  compactMode: boolean;
  runtimeStatus: CommandCenterRuntimeProjection;
  provider: CommandCenterProviderProjection;
  queue: CommandCenterQueueProjection;
}

export interface BuildStudioCommandCenterProjectionArgs {
  settings: Pick<EditableStudioSettings, 'defaultProviderId' | 'commandCenterCompactMode'> | null;
  providerCapabilities: GenerationProviderCapabilitiesResponse | null;
  providerRuntimePreflight: GenerationProviderRuntimePreflightResponse | null;
  statusItems: StudioRuntimeStatusItem[];
  queueResultPreviews: CommandCenterQueuePreview[];
  queueJobCount: number;
  activeServerJobCount: number;
  isQueueOpen: boolean;
  isGenerating: boolean;
}

export function summarizeCommandCenterRuntimeStatus(
  statusItems: StudioRuntimeStatusItem[],
): CommandCenterRuntimeProjection {
  if (statusItems.length === 0) {
    return {
      label: 'Checking',
      tone: 'warning',
      tooltip: 'Runtime status is still loading.',
    };
  }

  const danger = statusItems.find((item) => item.tone === 'danger');
  if (danger) {
    return {
      label: 'Attention',
      tone: 'danger',
      tooltip: `${danger.label}: ${danger.value}`,
    };
  }

  const warning = statusItems.find((item) => item.tone === 'warning');
  if (warning) {
    return {
      label: 'Standby',
      tone: 'warning',
      tooltip: `${warning.label}: ${warning.value}`,
    };
  }

  return {
    label: 'Ready',
    tone: 'success',
    tooltip: 'Runtime ready.',
  };
}

function buildProviderProjection({
  settings,
  providerCapabilities,
  providerRuntimePreflight,
}: Pick<
  BuildStudioCommandCenterProjectionArgs,
  'settings' | 'providerCapabilities' | 'providerRuntimePreflight'
>): CommandCenterProviderProjection {
  const providerId = settings?.defaultProviderId ?? 'codex';
  const capability =
    providerCapabilities?.providers.find((provider) => provider.providerId === providerId) ??
    providerCapabilities?.providers.find((provider) => provider.isDefault) ??
    null;
  const preflight =
    providerRuntimePreflight?.providers.find((provider) => provider.providerId === providerId) ??
    null;
  const status = capability?.status ?? 'unknown';
  const canExecute = Boolean(capability?.canExecute && (preflight?.canAttemptExecution ?? true));
  const tone: StudioStatusTone =
    status === 'active' && canExecute
      ? 'success'
      : status === 'not_configured' || preflight?.canAttemptExecution === false
        ? 'danger'
        : 'warning';
  const diagnostics = preflight?.diagnostics.length ? ` ${preflight.diagnostics.join(' ')}` : '';
  const detail = capability?.detail ?? 'Provider capability status is still loading.';

  return {
    id: providerId,
    label: capability?.label ?? providerId,
    status,
    tone,
    tooltip: `${detail}${diagnostics}`,
    canExecute,
  };
}

export function buildStudioCommandCenterProjection({
  settings,
  providerCapabilities,
  providerRuntimePreflight,
  statusItems,
  queueResultPreviews,
  queueJobCount,
  activeServerJobCount,
  isQueueOpen,
  isGenerating,
}: BuildStudioCommandCenterProjectionArgs): StudioCommandCenterProjection {
  const queueCount = queueJobCount + activeServerJobCount;

  return {
    compactMode: Boolean(settings?.commandCenterCompactMode),
    runtimeStatus: summarizeCommandCenterRuntimeStatus(statusItems),
    provider: buildProviderProjection({
      settings,
      providerCapabilities,
      providerRuntimePreflight,
    }),
    queue: {
      count: queueCount,
      isOpen: isQueueOpen,
      resultPreviews: queueResultPreviews,
      hasResultPreviews: queueResultPreviews.length > 0,
      showCollapsedProgress: isGenerating && !isQueueOpen,
    },
  };
}
