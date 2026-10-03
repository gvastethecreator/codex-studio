import type { GenerationProviderId } from '../packages/shared/src/generationContracts';
import type { PreferredWorkflow } from '../packages/shared/src/workflowCatalog';
import { OUTPUT_FOLDER_TOKENS } from '../packages/shared/src/outputLayout';
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
  { label: 'None, all in one folder', value: [] },
  { label: 'Workspace', value: ['workspace'] },
  { label: 'Date', value: ['date'] },
  { label: 'Workspace / Date', value: ['workspace', 'date'] },
  { label: 'Date / Provider / Recipe', value: ['date', 'provider', 'recipe'] },
  { label: 'Date / Model / Recipe', value: ['date', 'model', 'recipe'] },
  { label: 'Provider / Recipe', value: ['provider', 'recipe'] },
  { label: 'Recipe / Date', value: ['recipe', 'date'] },
  { label: 'Workflow / Date', value: ['workflow', 'date'] },
  { label: 'Provider / Workflow', value: ['provider', 'workflow'] },
  { label: 'No Subfolders', value: [] },
];

export const EXTERNAL_SCAN_PATH_LABEL = 'External folder to scan';
export const EXTERNAL_SCAN_PATH_HELP =
  'Used to discover External Output Sources. Generated files use the output directory selected in Output. SQLite stays in the Studio Library.';

export interface StudioSettingsFormState {
  preferredWorkflow: PreferredWorkflow;
  outputDirectory: string;
  defaultProviderId: GenerationProviderId;
  defaultOutputMode: StudioOutputMode;
  preferredOutputPath: string;
  outputSubfolderPreset: string;
  outputFileNameTemplate: string;
  autoDetectOutputSources: boolean;
  notifyOnUpdates: boolean;
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
    defaultProviderId: 'chatgpt',
    preferredWorkflow: 'default',
    outputDirectory: '',
    defaultOutputMode: 'studio_library',
    preferredOutputPath: '',
    outputSubfolderPreset: encodeSubfolderTokens([]),
    outputFileNameTemplate: '{date}_{style}_{prompt}',
    autoDetectOutputSources: true,
    notifyOnUpdates: false,
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
    preferredWorkflow: settings.preferredWorkflow ?? 'default',
    outputDirectory: settings.outputDirectory ?? '',
    defaultOutputMode: settings.defaultOutputMode,
    preferredOutputPath: settings.preferredOutputPath ?? '',
    outputSubfolderPreset: encodeSubfolderTokens(settings.outputOrganization.subfolderTokens),
    outputFileNameTemplate: settings.outputOrganization.fileNameTemplate,
    autoDetectOutputSources: settings.autoDetectOutputSources,
    notifyOnUpdates: settings.notifyOnUpdates,
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
    preferredWorkflow: formState.preferredWorkflow,
    outputDirectory: formState.outputDirectory.trim() || null,
    defaultOutputMode: formState.defaultOutputMode,
    preferredOutputPath: preferredOutputPath || null,
    outputOrganization: {
      subfolderTokens: formState.outputSubfolderPreset
        .split('/')
        .filter((value): value is StudioOutputSubfolderToken =>
          (OUTPUT_FOLDER_TOKENS as readonly string[]).includes(value),
        ),
      fileNameTemplate: formState.outputFileNameTemplate,
    },
    autoDetectOutputSources: formState.autoDetectOutputSources,
    notifyOnUpdates: formState.notifyOnUpdates,
    commandCenterCompactMode: formState.commandCenterCompactMode,
    intentionalStylesV1: formState.intentionalStylesV1,
    showWorkspaceHistoryInCarousel: formState.showWorkspaceHistoryInCarousel,
    providerDefaults: formState.providerDefaults,
  };
}
