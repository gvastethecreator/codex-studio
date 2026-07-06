import {
  getString,
  recipeDocument,
  RECIPE_CONTEXT_PROTOCOL,
  type RecipeContextBuilder,
  type RecipeContextParams,
} from './shared';

function getSelectedStyleLayers(params: RecipeContextParams) {
  const value = params.selectedStyles;
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return [];
    const layer = entry as Record<string, unknown>;
    const presetName = typeof layer.presetName === 'string' ? layer.presetName.trim() : '';
    if (!presetName) return [];
    const slot = typeof layer.slot === 'number' && Number.isFinite(layer.slot) ? layer.slot : 0;
    const strength =
      typeof layer.strength === 'number' && Number.isFinite(layer.strength)
        ? Math.max(0.1, Math.min(1, layer.strength)).toFixed(2)
        : '0.75';
    const packName = typeof layer.packName === 'string' ? layer.packName.trim() : '';
    const aesthetic = typeof layer.aesthetic === 'string' ? layer.aesthetic.trim() : '';
    const creativeBrief = typeof layer.creativeBrief === 'string' ? layer.creativeBrief.trim() : '';
    const avoidRulesMode =
      typeof layer.avoidRulesMode === 'string' ? layer.avoidRulesMode.trim() : '';
    const fields = layer.fields && typeof layer.fields === 'object' ? layer.fields : null;
    const activeFields = fields
      ? Object.values(fields as Record<string, unknown>).flatMap((field) => {
          if (!field || typeof field !== 'object' || Array.isArray(field)) return [];
          const fieldRecord = field as Record<string, unknown>;
          if (fieldRecord.enabled === false) return [];
          const label = typeof fieldRecord.label === 'string' ? fieldRecord.label.trim() : '';
          if (!label) return [];
          const weight =
            typeof fieldRecord.weight === 'number' && Number.isFinite(fieldRecord.weight)
              ? Math.max(0.1, Math.min(1, fieldRecord.weight)).toFixed(2)
              : '';
          return weight && weight !== '1.00' ? [`${label} ${weight}`] : [label];
        })
      : [];

    return [
      [
        `- Slot ${slot || '?'}: ${presetName}`,
        packName ? `Pack: ${packName}` : '',
        `Strength: ${strength}`,
        activeFields.length > 0 ? `Active fields: ${activeFields.join(', ')}` : '',
        avoidRulesMode ? `Avoid rules: ${avoidRulesMode}` : '',
        aesthetic ? `Aesthetic: ${aesthetic}` : '',
        creativeBrief ? `Creative brief: ${creativeBrief}` : '',
      ]
        .filter(Boolean)
        .join(' | '),
    ];
  });
}

function buildStylesContext(params: RecipeContextParams) {
  const presetName = getString(params, 'presetName', 'Unnamed Style');
  const mode = getString(params, 'mode', 'DIRECT_STYLE_SYNTHESIS');
  const roleInstruction = getString(params, 'roleInstruction');
  const compositionRule = getString(params, 'compositionRule');
  const styleEmphasis = getString(params, 'styleEmphasis');
  const aesthetic = getString(params, 'aesthetic', 'Standard');
  const subjectTreatment = getString(params, 'subjectTreatment', 'Standard');
  const colorTone = getString(params, 'colorTone', 'Standard');
  const lightingShadow = getString(params, 'lightingShadow', 'Standard');
  const textureMaterial = getString(params, 'textureMaterial', 'Standard');
  const cameraComposition = getString(params, 'cameraComposition', 'Standard');
  const atmosphereMood = getString(params, 'atmosphereMood', 'Standard');
  const renderingQuality = getString(params, 'renderingQuality', 'Standard');
  const creativeBrief = getString(params, 'creativeBrief');

  const creativeBriefSection = creativeBrief
    ? `
[CREATIVE BRIEF]
${creativeBrief}
`
    : '';
  const selectedStyleLayers = getSelectedStyleLayers(params);
  const selectedStyleLayersSection =
    selectedStyleLayers.length > 0
      ? `
[SELECTED STYLE LAYERS]
${selectedStyleLayers.join('\n')}
`
      : '';

  return recipeDocument(
    'styles',
    'STYLE TRANSFER PROTOCOL',
    `
TARGET STYLE: ${presetName.toUpperCase()}
MODE: ${mode}

[DIRECTIVES]
${roleInstruction}
${creativeBriefSection}
${selectedStyleLayersSection}
[VISUAL DNA]
- Core Aesthetic: ${aesthetic}
- Subject Treatment: ${subjectTreatment}
- Color & Tone: ${colorTone}
- Lighting & Shadow: ${lightingShadow}
- Texture & Material: ${textureMaterial}
- Camera & Composition: ${cameraComposition}
- Atmosphere & Mood: ${atmosphereMood}
- Rendering & Quality: ${renderingQuality}

[EXECUTION RULES]
${compositionRule}
${styleEmphasis}
DO NOT output text or explanations. Just the image.
  `,
  );
}

export const stylesRecipeContextBuilder = {
  protocol: RECIPE_CONTEXT_PROTOCOL,
  title: 'STYLE TRANSFER PROTOCOL',
  buildContext: buildStylesContext,
} satisfies RecipeContextBuilder;
