import { MotionDiv } from '../lib/gsapMotion';
import { CozyLoader as LoaderCircle } from './CozyMascot';
import { useTheme } from '../hooks/useTheme';
import { validateOutputTemplate } from '../packages/shared/src/outputLayout';
import { SettingsGeneralPanel } from './settings/SettingsGeneralPanel';
import { StudioHelpGuide } from './StudioHelpGuide';
import { ConfirmationModal } from './ConfirmationModal';
import {
  IconRefresh as RefreshCw,
  IconDeviceFloppy as Save,
  IconSettings as Settings,
  IconX as X,
} from '@tabler/icons-react';
import type React from 'react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  BUILT_IN_GENERATION_PROVIDERS,
  compareGenerationProviderPresentation,
} from '../packages/shared/src/generationContracts';
import type {
  ExternalOutputSourceFile,
  ExternalOutputSourcesResponse,
  RegisterExternalOutputSourceInput,
} from '../packages/shared/src/outputSources';
import type {
  GenerationProviderCapabilitiesResponse,
  GenerationProviderRuntimePreflightResponse,
} from '../packages/shared/src/providerCapabilities';
import type {
  EditableStudioSettings,
  EditableStudioSettingsPatch,
} from '../packages/shared/src/studioSettings';
import {
  buildStudioSettingsPatch,
  createInitialStudioSettingsFormState,
  getStudioSettingsFormState,
  type StudioSettingsFormState,
} from '../lib/studioSettingsForm';
import {
  STUDIO_SETTINGS_DOMAIN_TABS,
  takeRequestedStudioSettingsDomain,
  type StudioSettingsDomainId,
} from '../lib/studioSettingsDomains';
import { SettingsFormPanel } from './settings/SettingsFormPanel';
import { SettingsOutputSourcesPanel } from './settings/SettingsOutputSourcesPanel';
import { SettingsExtensionsPanel } from './settings/SettingsExtensionsPanel';
import {
  SettingsMaintenancePanel,
  type SettingsMaintenancePanelProps,
} from './settings/SettingsMaintenancePanel';
import { useDialogFocus } from '../hooks/useDialogFocus';

interface StudioSettingsModalProps {
  onExportLegacyWorkspaceSnapshot: () => void;
  isOpen: boolean;
  onClose: () => void;
  settings: EditableStudioSettings | null;
  libraryDir: string | null;
  isLoading: boolean;
  isSaving: boolean;
  providerCapabilities: GenerationProviderCapabilitiesResponse | null;
  providerRuntimePreflight: GenerationProviderRuntimePreflightResponse | null;
  outputSources: ExternalOutputSourcesResponse | null;
  outputSourceFiles: Record<string, ExternalOutputSourceFile[]>;
  isLoadingOutputSources: boolean;
  loadingOutputSourceFiles: Record<string, boolean>;
  isRegisteringOutputSource: boolean;
  importingOutputSources: Record<string, boolean>;
  error: string | null;
  onRefresh: () => void | Promise<void>;
  onUpdate: (patch: EditableStudioSettingsPatch) => void | Promise<void | boolean>;
  onRegisterOutputSource: (input: RegisterExternalOutputSourceInput) => void | Promise<void>;
  onLoadOutputSourceFiles: (sourceId: string) => void | Promise<void>;
  onImportOutputSourceFiles: (
    sourceId: string,
    files: string[],
    workspaceId?: string | null,
  ) => void | Promise<void>;
  maintenance: SettingsMaintenancePanelProps['maintenance'];
  onResetStudio: () => void | Promise<void>;
  isResettingStudio: boolean;
}

export const StudioSettingsModal: React.FC<StudioSettingsModalProps> = ({
  onExportLegacyWorkspaceSnapshot,
  isOpen,
  onClose,
  settings,
  libraryDir,
  isLoading,
  isSaving,
  providerCapabilities,
  providerRuntimePreflight,
  outputSources,
  outputSourceFiles,
  isLoadingOutputSources,
  loadingOutputSourceFiles,
  isRegisteringOutputSource,
  importingOutputSources,
  error,
  onRefresh,
  onUpdate,
  onRegisterOutputSource,
  onLoadOutputSourceFiles,
  onImportOutputSourceFiles,
  maintenance,
  onResetStudio,
  isResettingStudio,
}) => {
  const [formState, setFormState] = useState<StudioSettingsFormState>(
    createInitialStudioSettingsFormState,
  );
  const [activeDomain, setActiveDomain] = useState<StudioSettingsDomainId>('general');
  useEffect(() => {
    if (!isOpen) return;
    const requested = takeRequestedStudioSettingsDomain();
    if (requested) setActiveDomain(requested);
  }, [isOpen]);
  const { preferences, savedPreferences, previewPreferences, commitPreferences } = useTheme();
  const [search, setSearch] = useState('');
  const searchItems = [
    {
      domain: 'general',
      label: 'Preferred workflow',
      description: 'Startup and new workspaces',
      target: 'Preferred workflow',
    },
    {
      domain: 'appearance',
      label: 'Theme',
      description: 'Light or dark appearance',
      target: 'Theme',
    },
    {
      domain: 'appearance',
      label: 'Accent color',
      description: 'Palette and mascot color',
      target: 'Accent: Apricot',
    },
    {
      domain: 'appearance',
      label: 'Motion preference',
      description: 'System or reduced animation',
      target: 'Motion preference',
    },
    {
      domain: 'providers',
      label: 'Providers & accounts',
      description: 'Models, sign in and execution defaults',
      target: '',
    },
    {
      domain: 'library',
      label: 'Library & imports',
      description: 'Discover external images and import sources',
      target: 'External folder to scan',
    },
    {
      domain: 'output',
      label: 'Output directory',
      description: 'Registered folder for new images',
      target: 'Output directory',
    },
    {
      domain: 'output',
      label: 'Folder structure',
      description: 'Workspace, date, workflow and provider',
      target: 'Output folder preset',
    },
    {
      domain: 'output',
      label: 'File name template',
      description: 'Naming tokens and example path',
      target: 'File name template',
    },
    {
      domain: 'extensions',
      label: 'Style extensions',
      description: 'Install and update style packs',
      target: '',
    },
    {
      domain: 'maintenance',
      label: 'Maintenance',
      description: 'Storage and thumbnails',
      target: '',
    },
    {
      domain: 'help',
      label: 'Getting started',
      description: 'Workflows, references and results',
      target: '',
    },
  ];
  useEffect(() => {
    if (!isOpen) previewPreferences(null);
  }, [isOpen, previewPreferences]);
  useEffect(() => () => previewPreferences(null), [previewPreferences]);
  const dirtyRef = useRef(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const requestClose = () => {
    if (isSaving) return;
    if (dirtyRef.current) setConfirmDiscard(true);
    else onClose();
  };
  const dialogRef = useDialogFocus(
    isOpen,
    requestClose,
    undefined,
    '[aria-label="Close settings"]',
  );

  const [savedForm, setSavedForm] = useState(createInitialStudioSettingsFormState);
  const savedFormRef = useRef(savedForm);
  const wasOpen = useRef(false);
  useLayoutEffect(() => {
    if (isOpen && settings) {
      const next = getStudioSettingsFormState(settings);
      const reopening = !wasOpen.current;
      setFormState((current) =>
        reopening || JSON.stringify(current) === JSON.stringify(savedFormRef.current)
          ? next
          : current,
      );
      savedFormRef.current = next;
      setSavedForm(next);
    }
    wasOpen.current = isOpen;
  }, [isOpen, settings]);
  const hasChanges =
    JSON.stringify(preferences) !== JSON.stringify(savedPreferences) ||
    JSON.stringify(buildStudioSettingsPatch(formState)) !==
      JSON.stringify(buildStudioSettingsPatch(savedForm));
  useLayoutEffect(() => {
    dirtyRef.current = hasChanges;
  }, [hasChanges]);
  const fileNameError = validateOutputTemplate(formState.outputFileNameTemplate);

  const { defaultProviderId, providerDefaults } = formState;

  const providerOptions = useMemo(
    () =>
      [...BUILT_IN_GENERATION_PROVIDERS, ...Object.keys(providerDefaults), defaultProviderId]
        .filter((providerId, index, all) => all.indexOf(providerId) === index)
        .sort(compareGenerationProviderPresentation),
    [defaultProviderId, providerDefaults],
  );
  if (!isOpen) return null;

  const handleSave = async () => {
    if (!hasChanges || fileNameError || !settings || isSaving || isLoading) return;
    const nextAppearance = { ...preferences };
    const saved = await onUpdate(buildStudioSettingsPatch(formState));
    if (saved !== false) commitPreferences(nextAppearance);
  };

  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 flex items-center justify-center studio-scrim p-4"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="studio-settings-title"
        tabIndex={-1}
        className="studio-dialog studio-settings-dialog"
      >
        <div className="studio-dialog-header">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded studio-ghost-control text-[color:var(--wb-accent)]">
              <Settings size={18} />
            </div>
            <div>
              <h2 id="studio-settings-title" className="studio-dialog-title">
                Studio Settings
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Refresh settings"
              onClick={() => void onRefresh()}
              disabled={isLoading}
              className="studio-ghost-control disabled:opacity-60"
            >
              {isLoading ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
            </button>
            <button
              type="button"
              aria-label="Close settings"
              onClick={requestClose}
              className="studio-ghost-control"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="settings-search">
          <input
            className="studio-field"
            type="search"
            aria-label="Search settings"
            placeholder="Search settings…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search.trim() && (
            <div className="settings-search-results" aria-label="Settings search results">
              {searchItems
                .filter((item) =>
                  `${item.label} ${item.description}`.toLowerCase().includes(search.toLowerCase()),
                )
                .map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="studio-menu-item"
                    onClick={() => {
                      setActiveDomain(item.domain as StudioSettingsDomainId);
                      setSearch('');
                      requestAnimationFrame(() => {
                        const panel = dialogRef.current?.querySelector<HTMLElement>(
                          '.studio-settings-content',
                        );
                        const control = item.target
                          ? panel?.querySelector<HTMLElement>(`[aria-label="${item.target}"]`)
                          : panel?.querySelector<HTMLElement>('button, input, select');
                        (control ?? panel)?.focus();
                      });
                    }}
                  >
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </button>
                ))}
              {!searchItems.some((item) =>
                `${item.label} ${item.description}`.toLowerCase().includes(search.toLowerCase()),
              ) && <p role="status">No settings match this search.</p>}
            </div>
          )}
        </div>
        <div className="studio-settings-layout">
          <label className="studio-settings-section-select">
            <span>Section</span>
            <select
              className="studio-field"
              aria-label="Settings section"
              value={activeDomain}
              onChange={(event) => setActiveDomain(event.target.value as StudioSettingsDomainId)}
            >
              {STUDIO_SETTINGS_DOMAIN_TABS.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </label>
          <nav className="studio-settings-nav" aria-label="Settings sections">
            {STUDIO_SETTINGS_DOMAIN_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveDomain(tab.id)}
                aria-pressed={activeDomain === tab.id}
                className={`studio-tab ${activeDomain === tab.id ? 'is-active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div
            tabIndex={-1}
            aria-busy={isLoading || isSaving}
            data-motion-panel
            key={activeDomain}
            className="studio-dialog-body studio-settings-content custom-scrollbar"
          >
            {error && (
              <div
                role="alert"
                className="mb-4 rounded-[var(--wb-radius)] border border-rose-500/2 bg-rose-500/10 px-4 py-3 text-xs font-bold text-[color:var(--wb-danger)] "
              >
                {error}
              </div>
            )}

            {activeDomain === 'general' && (
              <fieldset disabled={isSaving || !settings}>
                <SettingsGeneralPanel value={formState} onChange={setFormState} />
              </fieldset>
            )}
            {activeDomain === 'help' && <StudioHelpGuide />}
            {activeDomain === 'appearance' ||
            activeDomain === 'library' ||
            activeDomain === 'providers' ||
            activeDomain === 'output' ? (
              <div className={activeDomain === 'output' ? 'grid gap-4' : undefined}>
                <fieldset disabled={isSaving || !settings} className="min-w-0">
                  <SettingsFormPanel
                    domain={activeDomain}
                    formState={formState}
                    fileNameError={fileNameError}
                    onFormChange={setFormState}
                    libraryDir={libraryDir}
                    providerOptions={providerOptions}
                    providerCapabilities={providerCapabilities}
                    providerRuntimePreflight={providerRuntimePreflight}
                    onResetStudio={onResetStudio}
                    isResettingStudio={isResettingStudio}
                  />
                </fieldset>
                {activeDomain === 'library' ? (
                  <SettingsOutputSourcesPanel
                    outputSources={outputSources}
                    outputSourceFiles={outputSourceFiles}
                    loadingOutputSourceFiles={loadingOutputSourceFiles}
                    importingOutputSources={importingOutputSources}
                    isLoadingOutputSources={isLoadingOutputSources}
                    isRegisteringOutputSource={isRegisteringOutputSource}
                    onLoadOutputSourceFiles={onLoadOutputSourceFiles}
                    onImportOutputSourceFiles={onImportOutputSourceFiles}
                    onRegisterOutputSource={onRegisterOutputSource}
                  />
                ) : null}
              </div>
            ) : null}
            {activeDomain === 'library' && (
              <section className="studio-list-row mt-4 p-4">
                <h3 className="text-sm font-semibold">Export workspace metadata</h3>
                <p className="my-2 text-xs studio-muted">
                  Legacy snapshot of workspace settings. This does not include image files or
                  replace a library backup.
                </p>
                <button
                  type="button"
                  className="studio-ghost-control px-3"
                  onClick={onExportLegacyWorkspaceSnapshot}
                >
                  Export legacy snapshot
                </button>
              </section>
            )}
            {activeDomain === 'extensions' ? <SettingsExtensionsPanel /> : null}
            {activeDomain === 'maintenance' ? (
              <SettingsMaintenancePanel maintenance={maintenance} />
            ) : null}
          </div>
        </div>
        <div className="studio-dialog-actions">
          <span role="status" className="mr-auto text-xs studio-muted">
            {isSaving ? 'Saving settings…' : hasChanges ? 'Unsaved changes' : 'No unsaved changes'}
          </span>
          <button
            type="button"
            disabled={!hasChanges || isSaving}
            className="studio-ghost-control px-4"
            onClick={() => {
              setFormState(savedForm);
              previewPreferences(null);
            }}
          >
            Discard
          </button>
          <button type="button" onClick={requestClose} className="studio-ghost-control px-4">
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoading || !settings || !hasChanges || Boolean(fileNameError)}
            className="studio-primary-control disabled:opacity-60"
          >
            {isSaving ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />}
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
      <ConfirmationModal
        isOpen={confirmDiscard}
        title="Discard unsaved settings?"
        description="Your saved settings will stay unchanged."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        tone="warning"
        onClose={() => setConfirmDiscard(false)}
        onConfirm={() => {
          setConfirmDiscard(false);
          previewPreferences(null);
          onClose();
        }}
      />
    </MotionDiv>
  );
};
