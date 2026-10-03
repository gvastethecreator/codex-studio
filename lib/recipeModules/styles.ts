import { stylesPolicy } from '../../packages/shared/src/recipePolicies/styles';
import {
  createModuleDirectives,
  directive,
  getBoolean,
  getNumber,
  getRecord,
  getString,
  paramDirective,
} from './directiveHelpers';
import { createRecipeModule } from './params';
import { stylesReferenceRules } from './composerRules';
import type { RecipeDefinition, RecipeParams } from './types';

const module = createRecipeModule({
  id: 'styles',
  title: 'Styles',
  description: 'Browse and apply styles, or generate style-card assets.',
  defaultTask: 'image_generate',
  variation: 'open',
  supportedTasks: ['image_generate', 'image_edit', 'style_preset_card'],
  supportedProviders: ['codex', 'chatgpt', 'grok', 'google', 'antigravity', 'dry_run'],
  parameters: [
    {
      id: 'presetId',
      label: 'Preset ID',
      kind: 'string',
      control: 'text',
      group: 'identity',
      required: true,
    },
    {
      id: 'presetName',
      label: 'Preset Name',
      kind: 'string',
      control: 'text',
      group: 'identity',
      required: true,
    },
    {
      id: 'mode',
      label: 'Mode',
      kind: 'enum',
      control: 'select',
      group: 'application',
      options: [
        'PACK_CATEGORY_BASE_STYLE_APPLICATION',
        'CREATIVE_REIMAGINING',
        'STRUCTURAL_PRESERVATION',
        'PRESERVE_REFERENCE',
        'DIRECT_STYLE_SYNTHESIS',
      ],
    },
    {
      id: 'roleInstruction',
      label: 'Role Instruction',
      kind: 'string',
      control: 'text',
      group: 'application',
    },
    {
      id: 'compositionRule',
      label: 'Composition Rule',
      kind: 'string',
      control: 'text',
      group: 'application',
    },
    {
      id: 'styleEmphasis',
      label: 'Style Emphasis',
      kind: 'string',
      control: 'text',
      group: 'application',
    },
    {
      id: 'negativePrompt',
      label: 'Avoid',
      kind: 'string',
      control: 'text',
      group: 'application',
    },
    { id: 'aesthetic', label: 'Aesthetic', kind: 'string', control: 'text', group: 'visual-dna' },
    {
      id: 'subjectTreatment',
      label: 'Subject Treatment',
      kind: 'string',
      control: 'text',
      group: 'visual-dna',
    },
    {
      id: 'colorTone',
      label: 'Color And Tone',
      kind: 'string',
      control: 'text',
      group: 'visual-dna',
    },
    {
      id: 'lightingShadow',
      label: 'Lighting And Shadow',
      kind: 'string',
      control: 'text',
      group: 'visual-dna',
    },
    {
      id: 'textureMaterial',
      label: 'Texture And Material',
      kind: 'string',
      control: 'text',
      group: 'visual-dna',
    },
    {
      id: 'cameraComposition',
      label: 'Camera And Composition',
      kind: 'string',
      control: 'text',
      group: 'visual-dna',
    },
    {
      id: 'atmosphereMood',
      label: 'Atmosphere And Mood',
      kind: 'string',
      control: 'text',
      group: 'visual-dna',
    },
    {
      id: 'renderingQuality',
      label: 'Rendering And Quality',
      kind: 'string',
      control: 'text',
      group: 'visual-dna',
    },
  ],
});

function isPreserveMode(params: RecipeParams) {
  const mode = params.styleReferenceMode ?? params.mode;
  return mode === 'preserve' || mode === 'PRESERVE_REFERENCE';
}

function getSelectedStyleLayerDirectives(params: RecipeParams) {
  const value = params.selectedStyles;
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return [];
    const layer = entry as Record<string, unknown>;
    const presetName = getString(layer, 'presetName');
    if (!presetName) return [];
    const strength = getNumber(layer, 'strength', 0.75);
    const packName = getString(layer, 'packName');
    const aesthetic = getString(layer, 'aesthetic');
    const creativeBrief = getString(layer, 'creativeBrief');
    const enabled = getBoolean(layer, 'enabled', true);
    const avoidRulesMode = getString(layer, 'avoidRulesMode') || 'merge';
    const fields = getRecord(layer, 'fields');
    const activeFields = Object.values(fields).flatMap((field) => {
      if (!field || typeof field !== 'object' || Array.isArray(field)) return [];
      const fieldRecord = field as Record<string, unknown>;
      if (fieldRecord.enabled === false) return [];
      const label = getString(fieldRecord, 'label');
      if (!label) return [];
      const weight = getNumber(fieldRecord, 'weight', 1);
      return weight >= 0.995
        ? [label]
        : [`${label} ${Math.max(0.1, Math.min(1, weight)).toFixed(2)}`];
    });

    return [
      directive(
        `Style Slot ${index + 1}`,
        [
          presetName,
          packName ? `pack ${packName}` : '',
          enabled ? '' : 'disabled',
          `strength ${Math.max(0.1, Math.min(1, strength)).toFixed(2)}`,
          activeFields.length > 0 ? `active fields ${activeFields.join(', ')}` : '',
          `avoid rules ${avoidRulesMode}`,
          aesthetic ? `aesthetic ${aesthetic}` : '',
          creativeBrief ? `brief ${creativeBrief}` : '',
        ]
          .filter(Boolean)
          .join('; '),
      ),
    ];
  });
}

function buildStylesDirectives(params: RecipeParams) {
  const intentionalPrompt =
    getString(params, 'compilerVersion').startsWith('intentional-styles/') &&
    getString(params, 'styleRequestHash')
      ? getString(params, 'effectivePrompt')
      : '';
  if (intentionalPrompt) {
    const outputMedium =
      intentionalPrompt
        .match(/^Output medium: ([^\n]+)$/m)?.[1]
        ?.split('. Render the whole image')[0]
        ?.trim() ?? '';
    const mediumDirective = outputMedium
      ? outputMedium === 'illustration'
        ? 'Illustration across the entire subject and setting: draw or paint all forms with visible mark and shape decisions. Avoid a photographic, live-action or glossy CGI finish. Preserve the requested subject, counts, action, framing and light.'
        : `Render the entire subject and setting in ${outputMedium}. Preserve the requested subject, counts, action, framing and light.`
      : '';
    return createModuleDirectives(module, [
      {
        title: 'Intentional Style Plan',
        directives: [
          directive('Required Output Medium', mediumDirective),
          directive('Compiled Instructions', intentionalPrompt),
        ],
      },
    ]);
  }
  const selectedStyleDirectives = getSelectedStyleLayerDirectives(params);

  return createModuleDirectives(module, [
    {
      title: 'Application',
      directives: [
        paramDirective(params, 'presetName', 'Target Style'),
        paramDirective(params, 'mode', 'Mode'),
        paramDirective(params, 'roleInstruction', 'Role Instruction'),
        paramDirective(params, 'compositionRule', 'Composition Rule'),
        paramDirective(params, 'styleEmphasis', 'Style Emphasis'),
        paramDirective(params, 'creativeBrief', 'Creative Brief'),
        ...selectedStyleDirectives,
      ],
    },
    {
      title: 'Visual DNA',
      directives: [
        paramDirective(params, 'aesthetic', 'Core Aesthetic'),
        paramDirective(params, 'subjectTreatment', 'Subject Treatment'),
        paramDirective(params, 'colorTone', 'Color And Tone'),
        paramDirective(params, 'lightingShadow', 'Lighting And Shadow'),
        paramDirective(params, 'textureMaterial', 'Texture And Material'),
        paramDirective(params, 'cameraComposition', 'Camera And Composition'),
        paramDirective(params, 'atmosphereMood', 'Atmosphere And Mood'),
        paramDirective(params, 'renderingQuality', 'Rendering And Quality'),
      ],
    },
  ]);
}

function stylesReferenceInstruction(params: RecipeParams, index: number) {
  const mode = params.styleReferenceMode ?? params.mode;
  const preserve = isPreserveMode(params);
  if (preserve && index === 0) {
    return 'Keep the subject, pose, framing and camera in this image. Apply only the selected visual treatment.';
  }
  if (preserve) {
    return 'Use this as more of the same subject. Do not take a style sample or a new scene from it.';
  }
  if (mode === 'reinterpret' || mode === 'CREATIVE_REIMAGINING') {
    return 'Keep the subject identity in this image. Change pose, framing and camera only where the prompt asks.';
  }
  return 'Use as source/reference material while applying the selected style layers.';
}

export const stylesRecipe: RecipeDefinition = {
  module,
  policy: stylesPolicy,
  ...stylesReferenceRules,
  referencePromptFallback: 'Apply the selected style using the provided reference image.',
  /** Styles that keep the reference subject and framing vary like a fixed-layout workflow. */
  variationScope: (params) => (isPreserveMode(params) ? 'details' : undefined),
  referenceInstruction: (params, _attachment, index) => stylesReferenceInstruction(params, index),
  qualityPresetId: (_task, referenceCount) => (referenceCount > 0 ? 'style_reference' : undefined),
  directives: (params) => buildStylesDirectives(params),
  plan({ config, params }) {
    const recipeParams = config.recipeParams;
    return {
      directives: buildStylesDirectives(params),
      quality: {
        style: typeof recipeParams?.presetName === 'string' ? recipeParams.presetName : null,
      },
      negativePrompt:
        typeof recipeParams?.negativePrompt === 'string'
          ? recipeParams.negativePrompt.trim() || null
          : null,
      stylePresetId: typeof recipeParams?.presetId === 'string' ? recipeParams.presetId : null,
    };
  },
};
