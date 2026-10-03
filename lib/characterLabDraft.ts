import type { ImageGenerationConfig } from '../types';
import {
  CHARACTER_LAB_ACTIONS,
  CHARACTER_LAB_MODES,
  CHARACTER_LAB_GLOBAL_OPTIONS,
  type CharacterLabModeId,
} from './characterLabCatalog.generated';
import { CHARACTER_LAB_WORKFLOWS, resolveCharacterLabControls } from './characterLabWorkflows';
import { normalizeImageGenRatio } from '../utils/imageGenSizing';

export interface CharacterLabViewDraft {
  outputBackground?: 'workflow' | 'transparent';
  actionId: string;
  prompt: string;
  style: string;
  clothing: string;
  bodyType: string;
  expression: string;
  backgroundColor: string;
  labAspectRatio: string;
  batchCount: number;
}

/** Browser draft only; generation requests contain the active projection. */
export interface CharacterLabDraft {
  subject: string;
  activeMode: CharacterLabModeId;
  views: Partial<Record<CharacterLabModeId, CharacterLabViewDraft>>;
}

export function createCharacterLabViewDraft(mode: CharacterLabModeId): CharacterLabViewDraft {
  const workflow = CHARACTER_LAB_WORKFLOWS[mode];
  return {
    actionId: workflow.actionId,
    outputBackground: 'workflow',
    prompt: '',
    style: CHARACTER_LAB_GLOBAL_OPTIONS.styles[0],
    clothing: CHARACTER_LAB_GLOBAL_OPTIONS.clothing[0],
    bodyType: CHARACTER_LAB_GLOBAL_OPTIONS.bodyTypes[0],
    expression: workflow.expression,
    backgroundColor: workflow.backgroundColor,
    labAspectRatio: workflow.aspectRatio,
    batchCount: 1,
  };
}

function savedMode(params: ImageGenerationConfig['recipeParams']): CharacterLabModeId | undefined {
  return (
    CHARACTER_LAB_ACTIONS.find((action) => action.id === params?.actionId)?.mode ??
    CHARACTER_LAB_MODES.find((mode) => mode.id === params?.mode)?.id
  );
}

function isModeAction(mode: CharacterLabModeId, actionId: unknown) {
  return CHARACTER_LAB_ACTIONS.some((action) => action.id === actionId && action.mode === mode);
}

/**
 * Saved params hold effective values, so controls the action excluded arrive empty.
 * Empty values keep the base view's choice instead of wiping it.
 */
function readSavedView(
  config: ImageGenerationConfig,
  mode: CharacterLabModeId,
  base: CharacterLabViewDraft = createCharacterLabViewDraft(mode),
) {
  const view = { ...base };
  const params = config.recipeParams ?? {};
  for (const key of [
    'style',
    'clothing',
    'bodyType',
    'expression',
    'backgroundColor',
    'labAspectRatio',
  ] as const) {
    const value = params[key];
    if (typeof value === 'string' && value) view[key] = value;
  }
  if (isModeAction(mode, params.actionId)) view.actionId = params.actionId as string;
  view.prompt =
    typeof params.additionalPrompt === 'string' ? params.additionalPrompt : (config.prompt ?? '');
  view.batchCount = config.batchCount;
  view.outputBackground = config.outputBackground ?? 'workflow';
  view.labAspectRatio = normalizeImageGenRatio(view.labAspectRatio);
  return view;
}

function readSavedDraft(
  config: ImageGenerationConfig,
  views: CharacterLabDraft['views'] = {},
): CharacterLabDraft {
  const mode = savedMode(config.recipeParams);
  return {
    subject: typeof config.recipeParams?.subject === 'string' ? config.recipeParams.subject : '',
    activeMode: mode ?? 'poses',
    views: mode ? { ...views, [mode]: readSavedView(config, mode, views[mode]) } : views,
  };
}

/** Persisted drafts can outlive catalog actions; those views fall back to the mode default. */
function withCatalogActions(draft: CharacterLabDraft): CharacterLabDraft {
  const views = { ...draft.views };
  let changed = false;
  for (const mode of Object.keys(views) as CharacterLabModeId[]) {
    const view = views[mode];
    if (!view || isModeAction(mode, view.actionId)) continue;
    views[mode] = { ...view, actionId: CHARACTER_LAB_WORKFLOWS[mode].actionId };
    changed = true;
  }
  return changed ? { ...draft, views } : draft;
}

export function readCharacterLabDraft(config: ImageGenerationConfig): CharacterLabDraft {
  return config.characterLabDraft
    ? withCatalogActions(config.characterLabDraft)
    : readSavedDraft(config);
}

export function getCharacterLabView(config: ImageGenerationConfig, mode?: CharacterLabModeId) {
  const draft = readCharacterLabDraft(config);
  const activeMode = mode ?? draft.activeMode;
  return {
    draft,
    mode: activeMode,
    view: draft.views[activeMode] ?? createCharacterLabViewDraft(activeMode),
  };
}

export function buildCharacterLabParams(
  mode: CharacterLabModeId,
  view: CharacterLabViewDraft,
  subject: string,
  attachmentCount: number,
) {
  const action = CHARACTER_LAB_ACTIONS.find(
    (item) => item.id === view.actionId && item.mode === mode,
  );
  if (!action) throw new Error(`Unknown Character Lab action: ${view.actionId}`);
  const hasSource = attachmentCount > 0;
  return {
    mode: action.mode,
    actionId: action.id,
    actionLabel: action.label,
    category: action.category,
    actionPrompt: action.prompt,
    // Without a source there is no image to edit; the action describes a new image.
    task: action.task === 'image_edit' && !hasSource ? 'image_generate' : action.task,
    mediaType: action.mediaType,
    frames: action.frames ?? 0,
    isCouplesPose: action.isCouplesPose,
    capability: action.capability,
    subject,
    additionalPrompt: view.prompt,
    ...resolveCharacterLabControls({
      ...view,
      mode: action.mode,
      category: action.category,
      hasSource,
    }),
    hasSource,
    referencesCount: Math.min(3, Math.max(0, attachmentCount - 1)),
  };
}

export function projectCharacterLabConfig(
  config: ImageGenerationConfig,
  draft: CharacterLabDraft,
): ImageGenerationConfig {
  const view = draft.views[draft.activeMode] ?? createCharacterLabViewDraft(draft.activeMode);
  return {
    ...config,
    characterLabDraft: { ...draft, views: { ...draft.views, [draft.activeMode]: view } },
    recipeId: 'character-lab',
    recipeContext: '',
    prompt: view.prompt,
    outputBackground: view.outputBackground ?? 'workflow',
    aspectRatio: normalizeImageGenRatio(view.labAspectRatio),
    batchCount: view.batchCount,
    recipeParams: buildCharacterLabParams(
      draft.activeMode,
      view,
      draft.subject,
      config.attachments.length,
    ),
  };
}

export function activateCharacterLabView(config: ImageGenerationConfig, mode?: CharacterLabModeId) {
  const { draft, mode: activeMode } = getCharacterLabView(config, mode);
  return projectCharacterLabConfig(config, { ...draft, activeMode });
}

export function updateCharacterLabView(
  config: ImageGenerationConfig,
  mode: CharacterLabModeId,
  patch: Partial<CharacterLabViewDraft>,
  subject?: string,
) {
  const { draft, view } = getCharacterLabView(config, mode);
  return projectCharacterLabConfig(config, {
    ...draft,
    subject: subject ?? draft.subject,
    activeMode: mode,
    views: { ...draft.views, [mode]: { ...view, ...patch } },
  });
}

export function restoreCharacterLabDraft(
  current: ImageGenerationConfig,
  restored: ImageGenerationConfig,
) {
  return projectCharacterLabConfig(
    restored,
    readSavedDraft(restored, readCharacterLabDraft(current).views),
  );
}
