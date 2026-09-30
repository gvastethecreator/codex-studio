// Workflow modules (ADR 0011): every workflow except Create (`default`, including styles) is an
// optional built-in module. A module is Studio code shipped with the app. Turning one off hides its
// workflows, loads none of its code, rejects its new jobs and closes its API routes. Its existing
// jobs and images stay in the Studio Library.

export interface WorkflowModule {
  id: string;
  title: string;
  description: string;
  /** Recipe ids whose jobs and screens belong to the module. */
  recipeIds: readonly string[];
  /** Navigation workflow ids, including recipe aliases, that open the module. */
  workflows: readonly string[];
  /** Backend route prefixes that only the module uses. */
  apiPrefixes: readonly string[];
}

export const WORKFLOW_MODULES = [
  {
    id: 'remaster',
    title: 'Remaster',
    description: 'Restore or reinterpret a reference image with controlled fidelity.',
    recipeIds: ['remaster'],
    workflows: ['remaster'],
    apiPrefixes: [],
  },
  {
    id: 'character-lab',
    title: 'Character Lab',
    description: 'Character poses, sprites, scenes, variants and transforms.',
    recipeIds: ['character-lab'],
    workflows: [
      'character-lab',
      'character-poses',
      'character-sprites',
      'character-scenes',
      'character-variants',
      'character-transforms',
    ],
    apiPrefixes: [],
  },
  {
    id: 'character-sheet',
    title: 'Character Sheet',
    description: 'Character reference sheets with layout, shot and style controls.',
    recipeIds: ['character'],
    workflows: ['character'],
    apiPrefixes: [],
  },
  {
    id: 'camera',
    title: 'Camera View',
    description: 'Alternate camera views from orbit, pitch, zoom and framing.',
    recipeIds: ['camera'],
    workflows: ['camera'],
    apiPrefixes: [],
  },
  {
    id: 'cinematic',
    title: 'Cinematic Storyboard',
    description: 'Storyboard grids with shot, lens, tone and continuity controls.',
    recipeIds: ['cinematic'],
    workflows: ['cinematic'],
    apiPrefixes: [],
  },
  {
    id: 'timeline',
    title: 'Timeline Frame',
    description: 'Neighboring storyboard frames with motion and continuity controls.',
    recipeIds: ['timeline'],
    workflows: ['timeline'],
    apiPrefixes: [],
  },
  {
    id: 'animation-sequence',
    title: 'Animation Sequence',
    description: 'Frame-by-frame image animations with correction flow and GIF export.',
    recipeIds: ['animation-sequence'],
    workflows: ['animation-sequence'],
    apiPrefixes: ['/api/animation-sequence'],
  },
  {
    id: 'spritesheet',
    title: 'Sprite Sheet',
    description: 'One sprite-sheet image from text and references.',
    recipeIds: ['spritesheet'],
    workflows: ['spritesheet'],
    apiPrefixes: [],
  },
  {
    id: 'sprite-atlas',
    title: 'Sprite Atlas',
    description: 'Runtime-ready sprite atlases with row prompts, layout guides, extraction and QA.',
    recipeIds: ['sprite-atlas'],
    workflows: ['sprite-atlas'],
    apiPrefixes: ['/api/sprite-atlas'],
  },
] as const satisfies readonly WorkflowModule[];

export type WorkflowModuleId = (typeof WORKFLOW_MODULES)[number]['id'];

const MODULE_BY_ID = new Map<string, WorkflowModule>(
  WORKFLOW_MODULES.map((module) => [module.id, module]),
);

export function isWorkflowModuleId(value: unknown): value is WorkflowModuleId {
  return typeof value === 'string' && MODULE_BY_ID.has(value);
}

export function getWorkflowModule(id: string): WorkflowModule | null {
  return MODULE_BY_ID.get(id) ?? null;
}

/** The module that owns a recipe, or null for core recipes such as `styles`. */
export function findWorkflowModuleForRecipe(recipeId: string | null | undefined) {
  if (!recipeId) return null;
  return (
    WORKFLOW_MODULES.find((module) => (module.recipeIds as readonly string[]).includes(recipeId)) ??
    null
  );
}

/** The module behind a navigation workflow id, or null for `default` and `styles`. */
export function findWorkflowModuleForWorkflow(workflowId: string | null | undefined) {
  if (!workflowId) return null;
  return (
    WORKFLOW_MODULES.find((module) =>
      (module.workflows as readonly string[]).includes(workflowId),
    ) ?? null
  );
}

export function findWorkflowModuleForApiPath(pathname: string) {
  return (
    WORKFLOW_MODULES.find((module) =>
      module.apiPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)),
    ) ?? null
  );
}

/** Keeps known module ids once each, in catalog order. */
export function normalizeDisabledWorkflowModules(value: unknown): WorkflowModuleId[] {
  if (!Array.isArray(value)) return [];
  const requested = new Set(value.filter(isWorkflowModuleId));
  return WORKFLOW_MODULES.map((module) => module.id).filter((id) => requested.has(id));
}
