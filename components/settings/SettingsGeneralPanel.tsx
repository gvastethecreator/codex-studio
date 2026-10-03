import type { Dispatch, SetStateAction } from 'react';
import {
  WORKFLOW_CATEGORIES,
  type PreferredWorkflow,
} from '../../packages/shared/src/workflowCatalog';
import { isWorkflowEnabled } from '../../lib/workflowModuleState';
import { RECIPE_DISCOVERY_CATALOG } from '../../lib/recipeCatalog';
import type { StudioSettingsFormState } from '../../lib/studioSettingsForm';

export function SettingsGeneralPanel({
  value,
  onChange,
}: {
  value: StudioSettingsFormState;
  onChange: Dispatch<SetStateAction<StudioSettingsFormState>>;
}) {
  return (
    <section className="settings-form-stack">
      <h3 className="studio-dialog-title">Make Studio yours</h3>
      <label className="settings-row">
        <span>
          <strong>Notify me about updates</strong>
          <small>
            Check for new commits on main at startup and every hour while Studio is open.
          </small>
        </span>
        <input
          type="checkbox"
          aria-label="Notify me about updates"
          checked={value.notifyOnUpdates}
          onChange={(event) =>
            onChange((current) => ({ ...current, notifyOnUpdates: event.target.checked }))
          }
        />
      </label>
      <label className="settings-row">
        <span>
          <strong>Preferred workflow</strong>
          <small>
            Open this workflow when Studio starts without a direct link, and in new workspaces.
          </small>
        </span>
        <select
          className="studio-field"
          aria-label="Preferred workflow"
          value={value.preferredWorkflow}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              preferredWorkflow: event.target.value as PreferredWorkflow,
            }))
          }
        >
          {WORKFLOW_CATEGORIES.map((category) => {
            // Workflows of turned-off modules are hidden, except the current choice.
            const workflows = category.workflows.filter(
              (id) => isWorkflowEnabled(id) || id === value.preferredWorkflow,
            );
            if (workflows.length === 0) return null;
            return (
              <optgroup key={category.id} label={category.label}>
                {workflows.map((id) => (
                  <option key={id} value={id}>
                    {id === 'default'
                      ? 'Default'
                      : (RECIPE_DISCOVERY_CATALOG.find((entry) => entry.id === id)?.title ?? id)}
                    {isWorkflowEnabled(id) ? '' : ' (turned off)'}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </label>
      <p className="studio-muted text-sm">
        Each workflow keeps its own settings. Your character source and references remain shared
        within the workspace.
      </p>
    </section>
  );
}
