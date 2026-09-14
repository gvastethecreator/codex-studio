import { ConfirmationModal } from './ConfirmationModal';
import {
  IconLoader as LoaderCircle,
  IconRefresh as RefreshCw,
  IconDeviceFloppy as Save,
  IconSettings as Settings,
  IconX as X,
} from '@tabler/icons-react';
import type React from 'react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BUILT_IN_GENERATION_PROVIDERS } from '../packages/shared/src/generationContracts';
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
  type StudioSettingsDomainId,
} from '../lib/studioSettingsDomains';
import { SettingsFormPanel } from './settings/SettingsFormPanel';
import { SettingsOutputSourcesPanel } from './settings/SettingsOutputSourcesPanel';
import {
  SettingsMaintenancePanel,
  type SettingsMaintenancePanelProps,
} from './settings/SettingsMaintenancePanel';

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
  onUpdate: (patch: EditableStudioSettingsPatch) => void | Promise<void>;
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
  const [activeDomain, setActiveDomain] = useState<StudioSettingsDomainId>('providers');
  const dialogRef = useRef<HTMLDivElement>(null);
  const dirtyRef = useRef(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const requestClose = () => {
    if (dirtyRef.current) setConfirmDiscard(true);
    else onClose();
  };
  const closeRef = useRef(requestClose);
  useEffect(() => {
    closeRef.current = requestClose;
  });
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement;
    dialogRef.current?.querySelector<HTMLButtonElement>('[aria-label="Close settings"]')?.focus();
    const handleKey = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (
        !dialog ||
        document
          .querySelectorAll('[aria-modal="true"]')
          .item(document.querySelectorAll('[aria-modal="true"]').length - 1) !== dialog
      )
        return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const controls = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, input, select, textarea, a[href], [tabindex]',
        ),
      ).filter(
        (element) =>
          element.tabIndex >= 0 &&
          !element.matches(':disabled') &&
          element.getClientRects().length > 0,
      );
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      if (
        event.shiftKey &&
        (document.activeElement === first || !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKey, true);
    return () => {
      document.removeEventListener('keydown', handleKey, true);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [isOpen]);

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
    JSON.stringify(buildStudioSettingsPatch(formState)) !==
    JSON.stringify(buildStudioSettingsPatch(savedForm));
  dirtyRef.current = hasChanges;
  const fileNameError = formState.outputFileNameTemplate.trim()
    ? null
    : 'Enter an output filename template.';

  const { defaultProviderId, providerDefaults } = formState;

  const providerOptions = useMemo(
    () =>
      [
        ...BUILT_IN_GENERATION_PROVIDERS,
        ...Object.keys(providerDefaults),
        defaultProviderId,
      ].filter((providerId, index, all) => all.indexOf(providerId) === index),
    [defaultProviderId, providerDefaults],
  );
  if (!isOpen) return null;

  const handleSave = () => {
    if (hasChanges && !fileNameError && settings && !isSaving && !isLoading)
      void onUpdate(buildStudioSettingsPatch(formState));
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="studio-settings-title"
        tabIndex={-1}
        className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-white/2 bg-zinc-950 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/2 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-accent-500/10 text-accent-300">
              <Settings size={18} />
            </div>
            <div>
              <h2
                id="studio-settings-title"
                className="text-sm font-black uppercase tracking-widest text-white"
              >
                Studio Settings
              </h2>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Accounts, library, and output
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Refresh settings"
              onClick={() => void onRefresh()}
              disabled={isLoading}
              className="flex size-9 items-center justify-center rounded-lg border border-white/2 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 disabled:opacity-60"
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
              className="flex size-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-white/2 px-3 sm:px-5">
          {STUDIO_SETTINGS_DOMAIN_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveDomain(tab.id)}
              aria-pressed={activeDomain === tab.id}
              className={`h-10 shrink-0 px-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
                activeDomain === tab.id
                  ? 'border-b-2 border-accent-400/2 text-white'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          aria-busy={isLoading || isSaving}
          className="custom-scrollbar flex-1 overflow-y-auto p-5"
        >
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-rose-500/2 bg-rose-500/10 px-4 py-3 text-xs font-bold text-rose-100"
            >
              {error}
            </div>
          )}

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
            <section className="mt-4 rounded-lg border border-white/10 p-4">
              <h3 className="text-sm font-semibold">Export workspace metadata</h3>
              <p className="my-2 text-xs text-zinc-400">
                Legacy snapshot of workspace settings. This does not include image files or replace
                a library backup.
              </p>
              <button
                type="button"
                className="rounded-lg bg-white/10 px-3 py-2 text-sm"
                onClick={onExportLegacyWorkspaceSnapshot}
              >
                Export legacy snapshot
              </button>
            </section>
          )}
          {activeDomain === 'maintenance' ? (
            <SettingsMaintenancePanel maintenance={maintenance} />
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/2 px-5 py-4">
          <span role="status" className="mr-auto text-xs text-zinc-400">
            {isSaving ? 'Saving settings…' : hasChanges ? 'Unsaved changes' : 'No unsaved changes'}
          </span>
          <button
            type="button"
            onClick={requestClose}
            className="h-10 rounded-lg px-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoading || !settings || !hasChanges || Boolean(fileNameError)}
            className="flex h-10 items-center gap-2 rounded-lg bg-accent-600 px-4 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-accent-500 disabled:opacity-60"
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
          onClose();
        }}
      />
    </div>
  );
};
