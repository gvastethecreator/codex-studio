import { useMemo, type Dispatch, type SetStateAction } from 'react';
import {
  OUTPUT_FOLDER_TOKENS,
  OUTPUT_NAME_TOKENS,
  formatOutputRelativePath,
  validateOutputTemplate,
} from '../../packages/shared/src/outputLayout';
import {
  OUTPUT_SUBFOLDER_PRESETS,
  buildStudioSettingsPatch,
  type StudioSettingsFormState,
} from '../../lib/studioSettingsForm';
import type { StudioOutputOrganizationSettings } from '../../packages/shared/src/studioSettings';

const NAME_PRESETS = [
  { label: 'Date · style · prompt', value: '{date}_{style}_{prompt}' },
  { label: 'Date · time · prompt', value: '{date}_{time}_{prompt}' },
  { label: 'Timestamp · provider · job', value: '{timestamp}-{provider}-{jobId}' },
  { label: 'Workspace · workflow · time', value: '{workspace}-{workflow}-{timestamp}' },
  { label: 'Workflow · date', value: '{workflow}-{date}' },
  { label: 'Job ID', value: '{jobId}' },
];

export function SettingsOutputPanel({
  value,
  onChange,
  libraryDir,
}: {
  value: StudioSettingsFormState;
  onChange: Dispatch<SetStateAction<StudioSettingsFormState>>;
  libraryDir: string | null;
}) {
  const exampleDate = useMemo(() => new Date(), []);
  const levels = value.outputSubfolderPreset.split('/').filter(Boolean);
  const setLevels = (next: string[]) =>
    onChange((current) => ({ ...current, outputSubfolderPreset: next.join('/') }));
  const error = validateOutputTemplate(value.outputFileNameTemplate);
  const organization = buildStudioSettingsPatch(value)
    .outputOrganization as StudioOutputOrganizationSettings;
  const relative = error
    ? null
    : formatOutputRelativePath(organization, {
        jobId: 'job-42',
        workspaceSlug: 'my-workspace',
        providerId: value.defaultProviderId,
        model: 'gpt-image',
        recipeId: value.preferredWorkflow === 'default' ? null : value.preferredWorkflow,
        promptText: 'A small wise owl perched on a brass lantern',
        styleName: 'Kodak Portra 400 - Alec Soth River Portraits',
        createdAt: exampleDate,
        extension: '.png',
      });
  const preset = OUTPUT_SUBFOLDER_PRESETS.some(
    (item) => item.value.join('/') === value.outputSubfolderPreset,
  )
    ? value.outputSubfolderPreset
    : 'custom';
  const root = value.outputDirectory.trim() || `${libraryDir ?? 'Studio Library'}/outputs`;
  return (
    <section className="settings-form-stack">
      <label className="settings-row">
        <span>
          <strong>Output directory</strong>
          <small>
            Save registers this destination for new images and exports. Existing files stay where
            they are.
          </small>
        </span>
        <input
          className="studio-field"
          aria-label="Output directory"
          value={value.outputDirectory}
          placeholder={`${libraryDir ?? 'Studio Library'}/outputs`}
          onChange={(event) =>
            onChange((current) => ({ ...current, outputDirectory: event.target.value }))
          }
        />
      </label>
      <label className="settings-row">
        <span>
          <strong>Folder structure</strong>
          <small>Choose a preset or arrange folder levels below.</small>
        </span>
        <select
          className="studio-field"
          aria-label="Output folder preset"
          value={preset}
          onChange={(event) => {
            if (event.target.value !== 'custom')
              setLevels(event.target.value.split('/').filter(Boolean));
          }}
        >
          {OUTPUT_SUBFOLDER_PRESETS.map((item) => (
            <option key={item.value.join('/')} value={item.value.join('/')}>
              {item.label}
            </option>
          ))}
          <option value="custom">Custom order</option>
        </select>
      </label>
      <div className="settings-folder-levels" aria-label="Folder levels">
        {levels.map((level, index) => (
          <div key={index}>
            <select
              className="studio-field"
              aria-label={`Folder level ${index + 1}`}
              value={level}
              onChange={(event) =>
                setLevels(
                  levels.map((item, position) => (position === index ? event.target.value : item)),
                )
              }
            >
              {OUTPUT_FOLDER_TOKENS.filter(
                (token) => token === level || !levels.includes(token),
              ).map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="studio-ghost-control"
              aria-label={`Remove folder level ${index + 1}`}
              onClick={() => setLevels(levels.filter((_, position) => position !== index))}
            >
              Remove
            </button>
          </div>
        ))}
        {levels.length < OUTPUT_FOLDER_TOKENS.length && (
          <button
            type="button"
            className="studio-ghost-control"
            onClick={() =>
              setLevels([...levels, OUTPUT_FOLDER_TOKENS.find((token) => !levels.includes(token))!])
            }
          >
            Add folder level
          </button>
        )}
      </div>
      <label className="settings-row">
        <span>
          <strong>Filename preset</strong>
          <small>A numeric suffix resolves duplicate names without replacing files.</small>
        </span>
        <select
          className="studio-field"
          aria-label="Filename preset"
          value={
            NAME_PRESETS.some((item) => item.value === value.outputFileNameTemplate)
              ? value.outputFileNameTemplate
              : 'custom'
          }
          onChange={(event) => {
            if (event.target.value !== 'custom')
              onChange((current) => ({ ...current, outputFileNameTemplate: event.target.value }));
          }}
        >
          {NAME_PRESETS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
          <option value="custom">Custom template</option>
        </select>
      </label>
      <label className="settings-row">
        <span>
          <strong>File name template</strong>
          <small>The actual image extension is added automatically.</small>
        </span>
        <input
          className="studio-field"
          aria-label="File name template"
          aria-invalid={Boolean(error)}
          aria-describedby="output-filename-help"
          value={value.outputFileNameTemplate}
          onChange={(event) =>
            onChange((current) => ({ ...current, outputFileNameTemplate: event.target.value }))
          }
        />
      </label>
      <p id="output-filename-help" className="studio-muted text-xs">
        Tokens: {OUTPUT_NAME_TOKENS.map((token) => `{${token}}`).join(', ')}
      </p>
      {error ? (
        <p role="alert" className="text-sm text-[color:var(--wb-danger)]">
          {error}
        </p>
      ) : (
        <div className="settings-output-preview">
          <strong>Example path</strong>
          <output>
            {root.replaceAll('\\', '/')}/{relative}
          </output>
          <small>
            Based on an example job. Running jobs keep the destination captured when they started.
          </small>
        </div>
      )}
    </section>
  );
}
