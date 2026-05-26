import type { CodexServiceTier } from './types';
import type { GenerationProviderId } from './generationContracts';

export const EDITABLE_STUDIO_SETTINGS_VERSION = 'editable-studio-settings/v1' as const;

export type StudioOutputMode = 'studio_library' | 'external_source';
export type StudioOutputSubfolderToken = 'date' | 'provider' | 'model' | 'recipe';

export interface ProviderDefaultSettings {
  providerId: GenerationProviderId;
  model: string | null;
  reasoningEffort: string | null;
  serviceTier: Exclude<CodexServiceTier, 'standard'> | null;
}

export interface StudioOutputOrganizationSettings {
  subfolderTokens: StudioOutputSubfolderToken[];
  fileNameTemplate: string;
}

export interface EditableStudioSettings {
  schemaVersion: typeof EDITABLE_STUDIO_SETTINGS_VERSION;
  defaultProviderId: GenerationProviderId;
  defaultOutputMode: StudioOutputMode;
  autoDetectOutputSources: boolean;
  commandCenterCompactMode: boolean;
  preferredLibraryId: string | null;
  preferredOutputPath: string | null;
  outputOrganization: StudioOutputOrganizationSettings;
  providerDefaults: Record<string, ProviderDefaultSettings>;
  updatedAt: string | null;
}

export type EditableProviderDefaultsPatch = Record<
  string,
  Partial<ProviderDefaultSettings> | null | undefined
>;

export interface EditableStudioSettingsPatch {
  defaultProviderId?: GenerationProviderId;
  defaultOutputMode?: StudioOutputMode;
  autoDetectOutputSources?: boolean;
  commandCenterCompactMode?: boolean;
  preferredLibraryId?: string | null;
  preferredOutputPath?: string | null;
  outputOrganization?: Partial<StudioOutputOrganizationSettings> | null;
  providerDefaults?: EditableProviderDefaultsPatch;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function cleanProviderId(value: unknown): GenerationProviderId | null {
  return cleanString(value) as GenerationProviderId | null;
}

function cleanOutputMode(value: unknown): StudioOutputMode | null {
  return value === 'studio_library' || value === 'external_source' ? value : null;
}

function cleanServiceTier(value: unknown): Exclude<CodexServiceTier, 'standard'> | null {
  return value === 'fast' || value === 'flex' ? value : null;
}

function cleanSubfolderTokens(value: unknown): StudioOutputSubfolderToken[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const allowed = new Set<StudioOutputSubfolderToken>(['date', 'provider', 'model', 'recipe']);
  const tokens = value.filter((item): item is StudioOutputSubfolderToken => allowed.has(item));
  return tokens.filter((token, index) => tokens.indexOf(token) === index).slice(0, 4);
}

function cleanFileNameTemplate(value: unknown) {
  const template = cleanString(value);
  if (!template) return undefined;
  return template.replace(/[<>:"/\\|?*\x00-\x1f]+/g, '-').slice(0, 120);
}

function sanitizeOutputOrganizationPatch(
  value: unknown,
): Partial<StudioOutputOrganizationSettings> | undefined {
  if (!isRecord(value)) return undefined;

  const patch: Partial<StudioOutputOrganizationSettings> = {};
  const subfolderTokens = cleanSubfolderTokens(value.subfolderTokens);
  const fileNameTemplate = cleanFileNameTemplate(value.fileNameTemplate);

  if (subfolderTokens) patch.subfolderTokens = subfolderTokens;
  if (fileNameTemplate) patch.fileNameTemplate = fileNameTemplate;

  return Object.keys(patch).length > 0 ? patch : undefined;
}

function sanitizeProviderDefaultsPatch(value: unknown): EditableProviderDefaultsPatch | undefined {
  if (!isRecord(value)) return undefined;

  const providerDefaults: EditableProviderDefaultsPatch = {};

  for (const [key, rawDefault] of Object.entries(value)) {
    const providerKey = cleanString(key);
    if (!providerKey) continue;

    if (rawDefault === null) {
      providerDefaults[providerKey] = null;
      continue;
    }

    if (!isRecord(rawDefault)) continue;

    const providerPatch: Partial<ProviderDefaultSettings> = {};
    const providerId =
      cleanProviderId(rawDefault.providerId) ?? (providerKey as GenerationProviderId);
    providerPatch.providerId = providerId;

    const model = cleanString(rawDefault.model);
    if (model !== null) providerPatch.model = model;

    const reasoningEffort = cleanString(rawDefault.reasoningEffort);
    if (reasoningEffort !== null) providerPatch.reasoningEffort = reasoningEffort;

    if ('serviceTier' in rawDefault) {
      providerPatch.serviceTier = cleanServiceTier(rawDefault.serviceTier);
    }

    providerDefaults[providerKey] = providerPatch;
  }

  return Object.keys(providerDefaults).length > 0 ? providerDefaults : undefined;
}

export function createDefaultEditableStudioSettings(): EditableStudioSettings {
  return {
    schemaVersion: EDITABLE_STUDIO_SETTINGS_VERSION,
    defaultProviderId: 'codex',
    defaultOutputMode: 'studio_library',
    autoDetectOutputSources: true,
    commandCenterCompactMode: false,
    preferredLibraryId: null,
    preferredOutputPath: null,
    outputOrganization: {
      subfolderTokens: ['date', 'provider', 'recipe'],
      fileNameTemplate: '{timestamp}-{provider}-{jobId}',
    },
    providerDefaults: {
      codex: {
        providerId: 'codex',
        model: null,
        reasoningEffort: null,
        serviceTier: null,
      },
    },
    updatedAt: null,
  };
}

export function sanitizeEditableStudioSettingsPatch(value: unknown): EditableStudioSettingsPatch {
  if (!isRecord(value)) return {};

  const patch: EditableStudioSettingsPatch = {};
  const defaultProviderId = cleanProviderId(value.defaultProviderId);
  const defaultOutputMode = cleanOutputMode(value.defaultOutputMode);
  const preferredLibraryId =
    'preferredLibraryId' in value
      ? value.preferredLibraryId === null
        ? null
        : cleanString(value.preferredLibraryId)
      : undefined;
  const preferredOutputPath =
    'preferredOutputPath' in value
      ? value.preferredOutputPath === null
        ? null
        : cleanString(value.preferredOutputPath)
      : undefined;
  const providerDefaults = sanitizeProviderDefaultsPatch(value.providerDefaults);
  const outputOrganization = sanitizeOutputOrganizationPatch(value.outputOrganization);

  if (defaultProviderId) patch.defaultProviderId = defaultProviderId;
  if (defaultOutputMode) patch.defaultOutputMode = defaultOutputMode;
  if (typeof value.autoDetectOutputSources === 'boolean') {
    patch.autoDetectOutputSources = value.autoDetectOutputSources;
  }
  if (typeof value.commandCenterCompactMode === 'boolean') {
    patch.commandCenterCompactMode = value.commandCenterCompactMode;
  }
  if (preferredLibraryId !== undefined) patch.preferredLibraryId = preferredLibraryId;
  if (preferredOutputPath !== undefined) patch.preferredOutputPath = preferredOutputPath;
  if (outputOrganization) patch.outputOrganization = outputOrganization;
  if (providerDefaults) patch.providerDefaults = providerDefaults;

  return patch;
}

export function normalizeEditableStudioSettings(value: unknown): EditableStudioSettings {
  const defaults = createDefaultEditableStudioSettings();
  if (!isRecord(value)) return defaults;

  return mergeEditableStudioSettingsPatch(
    {
      ...defaults,
      updatedAt: cleanString(value.updatedAt),
    },
    value,
    cleanString(value.updatedAt),
  );
}

export function mergeEditableStudioSettingsPatch(
  current: EditableStudioSettings,
  value: unknown,
  updatedAt: string | null = new Date().toISOString(),
): EditableStudioSettings {
  const patch = sanitizeEditableStudioSettingsPatch(value);
  const providerDefaults = { ...current.providerDefaults };

  for (const [key, providerPatch] of Object.entries(patch.providerDefaults ?? {})) {
    if (providerPatch === null) {
      delete providerDefaults[key];
      continue;
    }
    if (!providerPatch) continue;

    const currentDefault = providerDefaults[key] ?? {
      providerId: key as GenerationProviderId,
      model: null,
      reasoningEffort: null,
      serviceTier: null,
    };

    providerDefaults[key] = {
      providerId: providerPatch.providerId ?? currentDefault.providerId,
      model: providerPatch.model ?? currentDefault.model,
      reasoningEffort: providerPatch.reasoningEffort ?? currentDefault.reasoningEffort,
      serviceTier: providerPatch.serviceTier ?? currentDefault.serviceTier,
    };
  }

  return {
    schemaVersion: EDITABLE_STUDIO_SETTINGS_VERSION,
    defaultProviderId: patch.defaultProviderId ?? current.defaultProviderId,
    defaultOutputMode: patch.defaultOutputMode ?? current.defaultOutputMode,
    autoDetectOutputSources: patch.autoDetectOutputSources ?? current.autoDetectOutputSources,
    commandCenterCompactMode: patch.commandCenterCompactMode ?? current.commandCenterCompactMode,
    preferredLibraryId:
      patch.preferredLibraryId !== undefined
        ? patch.preferredLibraryId
        : current.preferredLibraryId,
    preferredOutputPath:
      patch.preferredOutputPath !== undefined
        ? patch.preferredOutputPath
        : current.preferredOutputPath,
    outputOrganization: {
      subfolderTokens:
        patch.outputOrganization?.subfolderTokens ?? current.outputOrganization.subfolderTokens,
      fileNameTemplate:
        patch.outputOrganization?.fileNameTemplate ?? current.outputOrganization.fileNameTemplate,
    },
    providerDefaults,
    updatedAt,
  };
}
