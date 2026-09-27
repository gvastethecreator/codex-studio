import { CozyMascot } from './CozyMascot';
import { WORKFLOW_CATEGORIES } from '../packages/shared/src/workflowCatalog';

export function StudioHelpGuide() {
  return (
    <section className="studio-help-guide" aria-label="Getting started with Studio">
      <div className="studio-help-intro">
        <CozyMascot state="welcome" />
        <div>
          <h3 className="text-xl font-semibold">A little help from Cozy</h3>
          <p className="studio-muted">From an idea to a result you can find again.</p>
        </div>
      </div>
      <ol className="settings-form-stack">
        <li>
          <strong>1. Choose a workflow</strong>
          <p>
            Use Default for a prompt or an edit. Character keeps a shared source with separate
            settings for each task. Camera &amp; Story guides viewpoints and neighboring frames;
            Animation prepares a frame sequence.
          </p>
        </li>
        <li>
          <strong>2. Add your references</strong>
          <p>
            Attach a source image and describe what should change. Workspaces keep references
            together while each workflow remembers its controls.
          </p>
        </li>
        <li>
          <strong>3. Set the output</strong>
          <p>
            Maintain background follows your source image or text description, including requested
            scene changes. Remove background requests transparent PNG. Native alpha works with
            supported GPT Image models. GIF exports have binary transparency; PNG keeps soft edges.
          </p>
        </li>
        <li>
          <strong>4. Find and reuse results</strong>
          <p>
            Open workspace history or the library. Restore a result’s settings to continue. Settings
            → Output shows where new files go and how they are named.
          </p>
        </li>
      </ol>
      <p className="studio-muted text-xs">
        Workflow groups: {WORKFLOW_CATEGORIES.map((category) => category.label).join(' · ')}
      </p>
    </section>
  );
}
