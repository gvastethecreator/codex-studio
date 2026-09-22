import type { GenerationProviderId } from '../packages/shared/src/generationContracts';
import type {
  EditableStudioSettings,
  EditableStudioSettingsPatch,
  StudioOutputMode,
  StudioOutputSubfolderToken,
} from '../packages/shared/src/studioSettings';

export const OUTPUT_SUBFOLDER_PRESETS: {
  label: string;
  value: StudioOutputSubfolderToken[];
}[] = [
  { label: 'Workspace', value: ['workspace'] },
  { label: 'Workspace / Date', value: ['workspace', 'date'] },
  { label: 'Date / Provider / Recipe', value: ['date', 'provider', 'recipe'] },
  { label: 'Date / Model / Recipe', value: ['date', 'model', 'recipe'] },
  { label: 'Provider / Recipe', value: ['provider', 'recipe'] },
  { label: 'Recipe / Date', value: ['recipe', 'date'] },
  { label: 'No Subfolders', value: [] },
];

export const EXTERNAL_SCAN_PATH_LABEL = 'External folder to scan';
export const EXTERNAL_SCAN_PATH_HELP =
  'Used to discover External Output Sources. Generate still writes inside the Studio Library.';

export interface StudioSettingsFormState {
  defaultProviderId: GenerationProviderId;
  defaultOutputMode: StudioOutputMode;
  preferredOutputPath: string;
  outputSubfolderPreset: string;
  outputFileNameTemplate: string;
  autoDetectOutputSources: boolean;
  commandCenterCompactMode: boolean;
  intentionalStylesV1: boolean;
  showWorkspaceHistoryInCarousel: boolean;
  providerDefaults: EditableStudioSettings['providerDefaults'];
}

export function encodeSubfolderTokens(value: StudioOutputSubfolderToken[]) {
  return value.join('/');
}

export function createInitialStudioSettingsFormState(): StudioSettingsFormState {
  return {
    defaultProviderId: 'codex',
    defaultOutputMode: 'studio_library',
    preferredOutputPath: '',
    outputSubfolderPreset: encodeSubfolderTokens(['workspace']),
    outputFileNameTemplate: '{timestamp}-{provider}-{jobId}',
    autoDetectOutputSources: true,
    commandCenterCompactMode: false,
    intentionalStylesV1: false,
    showWorkspaceHistoryInCarousel: true,
    providerDefaults: {},
  };
}

export function getStudioSettingsFormState(
  settings: EditableStudioSettings,
): StudioSettingsFormState {
  return {
    defaultProviderId: settings.defaultProviderId,
    defaultOutputMode: settings.defaultOutputMode,
    preferredOutputPath: settings.preferredOutputPath ?? '',
    outputSubfolderPreset: encodeSubfolderTokens(settings.outputOrganization.subfolderTokens),
    outputFileNameTemplate: settings.outputOrganization.fileNameTemplate,
    autoDetectOutputSources: settings.autoDetectOutputSources,
    commandCenterCompactMode: settings.commandCenterCompactMode,
    intentionalStylesV1: settings.intentionalStylesV1,
    showWorkspaceHistoryInCarousel: settings.showWorkspaceHistoryInCarousel ?? true,
    providerDefaults: settings.providerDefaults,
  };
}

export function buildStudioSettingsPatch(
  formState: StudioSettingsFormState,
): EditableStudioSettingsPatch {
  const preferredOutputPath = formState.preferredOutputPath.trim();
  return {
    defaultProviderId: formState.defaultProviderId,
    defaultOutputMode: formState.defaultOutputMode,
    preferredOutputPath: preferredOutputPath || null,
    outputOrganization: {
      subfolderTokens:
        OUTPUT_SUBFOLDER_PRESETS.find(
          (preset) => encodeSubfolderTokens(preset.value) === formState.outputSubfolderPreset,
        )?.value ?? [],
      fileNameTemplate: formState.outputFileNameTemplate,
    },
    autoDetectOutputSources: formState.autoDetectOutputSources,
    commandCenterCompactMode: formState.commandCenterCompactMode,
    intentionalStylesV1: formState.intentionalStylesV1,
    showWorkspaceHistoryInCarousel: formState.showWorkspaceHistoryInCarousel,
    providerDefaults: formState.providerDefaults,
  };
}
