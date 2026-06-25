import {
  getBoolean,
  getNumber,
  getString,
  recipeDocument,
  RECIPE_CONTEXT_PROTOCOL,
  type RecipeContextBuilder,
  type RecipeContextParams,
} from './shared';

function buildCharacterLabContext(params: RecipeContextParams) {
  const mode = getString(params, 'mode', 'poses');
  const actionId = getString(params, 'actionId', '');
  const actionLabel = getString(params, 'actionLabel', 'Front View');
  const category = getString(params, 'category', 'Standard Views');
  const actionPrompt = getString(params, 'actionPrompt', '');
  const task = getString(params, 'task', 'image_generate');
  const mediaType = getString(params, 'mediaType', 'image');
  const capability = getString(params, 'capability', 'ready');
  const subject = getString(params, 'subject', '');
  const frames = getNumber(params, 'frames', 0);
  const isCouplesPose = getBoolean(params, 'isCouplesPose');
  const hasSource = getBoolean(params, 'hasSource');
  const referencesCount = getNumber(params, 'referencesCount', 0);

  const recipeSchema = {
    task_id: 'CHARACTER_LAB_ASSET_WORKFLOW',
    mode,
    action_id: actionId,
    action_label: actionLabel,
    category,
    recommended_task: task,
    media_type: mediaType,
    capability,
    frames: frames > 0 ? frames : null,
    couples_or_group_pose: isCouplesPose,
    source_contract: {
      has_source_image: hasSource,
      reference_count: referencesCount,
      identity_source: hasSource ? 'first attachment is the source identity image' : 'prompt text',
      extra_references: 'subsequent attachments are style/detail references',
    },
    character_controls: {
      subject,
      style: getString(params, 'style', "Preserve Original: Keep the source image's style."),
      clothing: getString(params, 'clothing', 'Preserve Original'),
      body_type: getString(params, 'bodyType', 'Preserve Original'),
      expression: getString(params, 'expression', 'Neutral'),
      background_color: getString(params, 'backgroundColor', '#FFFFFF'),
      requested_aspect_ratio: getString(params, 'labAspectRatio', '1:1'),
    },
    selected_action_prompt: actionPrompt,
  };

  return recipeDocument(
    'character-lab',
    'CHARACTER LAB PROMPT',
    [
      'Target: Character production asset.',
      `Context: ${JSON.stringify(recipeSchema, null, 2)}`,
      'Output: one catalog-ready asset unless the selected action is a sprite sheet.',
      'Do not bypass the provider boundary. Treat video, live interview, and structured profile actions as gated capabilities until those tasks are implemented.',
    ].join('\n'),
  );
}

export const characterLabRecipeContextBuilder = {
  protocol: RECIPE_CONTEXT_PROTOCOL,
  title: 'CHARACTER LAB PROMPT',
  buildContext: buildCharacterLabContext,
} satisfies RecipeContextBuilder;
