import {
  getBoolean,
  getString,
  recipeDocument,
  RECIPE_CONTEXT_PROTOCOL,
  type RecipeContextBuilder,
  type RecipeContextParams,
} from './shared';
import {
  getCharacterLayoutInstruction,
  getCharacterStyleInstruction,
} from '../recipePromptFragments';

export function buildCharacterContext(params: RecipeContextParams) {
  const layout = getString(params, 'layout', 'Classic Turnaround');
  const style = getString(params, 'style', 'Preserve Source Style');
  const shot = getString(params, 'shot', 'Full Body');
  const focus = getString(params, 'focus', 'General Design');
  const hasReference = getBoolean(params, 'hasReference');
  const layoutInstruction = getCharacterLayoutInstruction(layout);
  const styleInstruction = getCharacterStyleInstruction(style);

  const recipeSchema = {
    task_id: 'CHARACTER_DESIGN_SHEET',
    mode: hasReference ? 'REFERENCE_GUIDED_CHARACTER_SHEET' : 'ORIGINAL_CONCEPT_GENERATION',
    layout_specs: {
      type: layout.toUpperCase(),
      shot_framing: shot.toUpperCase(),
      detailed_instruction: layoutInstruction,
      view_consistency: 'CHARACTER_GUIDED_MATCH',
      background: 'NEUTRAL_STUDIO_WHITE_OR_GREY',
    },
    art_direction: {
      style_mode: style.toUpperCase(),
      design_focus: focus.toUpperCase(),
      instruction: styleInstruction,
    },
    directives: [
      `Generate a professional ${layout}.`,
      layoutInstruction,
      `Use ${shot} framing as the target crop.`,
      `Emphasize and detail elements related to: ${focus}.`,
      hasReference
        ? 'Use the input reference image as the identity guide. Preserve costume, physique, colors, and facial features as closely as possible in the requested layout.'
        : "Design a unique, cohesive character based on the user's prompt.",
      styleInstruction,
      'Aim for consistent design details, proportions, and colors across all views/panels.',
      'Use high contrast and clean lines so the output works as a local concept reference.',
      'Do not include any text, labels, or watermarks.',
    ],
  };

  return recipeDocument(
    'character',
    'CHARACTER SHEET PROMPT',
    [
      'Target: Concept Art Asset',
      `Context: ${JSON.stringify(recipeSchema, null, 2)}`,
      'Output: one clean character sheet image.',
    ].join('\n'),
  );
}

export const characterRecipeContextBuilder = {
  protocol: RECIPE_CONTEXT_PROTOCOL,
  title: 'CHARACTER SHEET PROMPT',
  buildContext: buildCharacterContext,
} satisfies RecipeContextBuilder;
