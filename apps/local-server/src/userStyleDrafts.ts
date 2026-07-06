import {
  sanitizeCodexStyleDraft,
  type CodexStyleDraftRequest,
  type CodexStyleDraftResponse,
  type UserStylePresetDraft,
  type UserStyleVisualDna,
} from '../../../packages/shared/src';

function cleanText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function titleFromDescription(description: string) {
  const words = description
    .replace(/[^a-zA-Z0-9\s-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5);
  if (words.length === 0) return 'Custom Assisted Style';
  return words.map((word) => `${word[0]?.toUpperCase() ?? ''}${word.slice(1)}`).join(' ');
}

function baseVisualDna(
  description: string,
  draft?: Partial<UserStylePresetDraft>,
): UserStyleVisualDna {
  const visualDna = (draft?.visualDna ?? {}) as Partial<UserStyleVisualDna>;
  const concept = description || draft?.name || 'custom visual language';
  return {
    aesthetic:
      cleanText(visualDna.aesthetic) ||
      `${concept} with a clear reusable art direction and coherent visual thesis`,
    subject_treatment:
      cleanText(visualDna.subject_treatment) ||
      'Apply the style to varied subjects without forcing one fixed scene, prop, or character.',
    color_and_tone:
      cleanText(visualDna.color_and_tone) ||
      'Deliberate palette logic with controlled contrast, readable value grouping, and consistent color accents.',
    lighting_and_shadow:
      cleanText(visualDna.lighting_and_shadow) ||
      'Purposeful light direction, legible shadow structure, and no random glow or overbaked highlights.',
    texture_and_material:
      cleanText(visualDna.texture_and_material) ||
      'Material response and surface texture are visible enough to define the style across subjects.',
    camera_and_composition:
      cleanText(visualDna.camera_and_composition) ||
      'Balanced composition with clear focal hierarchy, stable framing, and transferable staging rules.',
    atmosphere_and_mood:
      cleanText(visualDna.atmosphere_and_mood) ||
      'Consistent mood that supports the subject without locking the image to one story beat.',
    rendering_and_quality:
      cleanText(visualDna.rendering_and_quality) ||
      'Polished final render with clean edges, intentional detail density, and no watermark or readable text.',
    creative_brief:
      cleanText(visualDna.creative_brief) ||
      `Build a reusable ${concept} style system. Preserve visual mechanics across many subjects instead of recreating one scene.`,
  };
}

export async function createLocalUserStyleDraft(
  request: CodexStyleDraftRequest,
): Promise<CodexStyleDraftResponse> {
  const description =
    cleanText(request.description) ||
    cleanText(request.currentPrompt) ||
    cleanText(request.draft?.name) ||
    'custom studio style';
  const shouldDraftFromDescription =
    request.action === 'draft_from_description' && cleanText(request.description).length > 0;
  const sourceDraft = shouldDraftFromDescription ? undefined : request.draft;
  const visualDna = baseVisualDna(description, sourceDraft);
  const draft = {
    name: shouldDraftFromDescription
      ? titleFromDescription(description)
      : cleanText(request.draft?.name, titleFromDescription(description)),
    category: cleanText(sourceDraft?.category, 'Custom Styles'),
    tags: sourceDraft?.tags?.length ? sourceDraft.tags : ['custom-style'],
    supportedTasks: sourceDraft?.supportedTasks?.length
      ? sourceDraft.supportedTasks
      : ['image_generate', 'image_edit', 'style_preset_card'],
    visualDna,
    avoidRules: sourceDraft?.avoidRules?.length
      ? sourceDraft.avoidRules
      : ['watermark', 'readable text', 'logo', 'signature'],
    warnings: [
      'Local fallback draft. Review specificity before saving.',
      ...(request.action === 'make_transferable'
        ? ['Checked for transferable style mechanics; remove fixed scene nouns if present.']
        : []),
    ],
  };
  const sanitized = sanitizeCodexStyleDraft(draft);
  if (!sanitized.ok || !sanitized.value) {
    throw new Error(`Could not create style draft: ${sanitized.issues.join('; ')}`);
  }
  return {
    draft: sanitized.value,
    warnings: sanitized.value.warnings,
    source: 'local_fallback',
  };
}
