import {
  sanitizeCodexStyleDraft,
  type CodexStyleReferenceImage,
  type CodexStyleDraftRequest,
  type CodexStyleDraftResponse,
  type UserStylePresetDraft,
  type UserStyleVisualDna,
} from '../../../packages/shared/src/userStyles';

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

function cleanReferenceName(name: string) {
  return name
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function referenceDescription(referenceImages: CodexStyleReferenceImage[] | undefined) {
  const references = (referenceImages ?? []).filter((image) => cleanText(image.name));
  if (references.length === 0) return '';

  return references
    .slice(0, 12)
    .map((image, index) => {
      const name = cleanReferenceName(image.name) || `reference ${index + 1}`;
      const notes = cleanText(image.notes);
      const role = image.role === 'avoid_reference' ? 'avoid reference' : 'style reference';
      return notes ? `${name} (${role}: ${notes})` : `${name} (${role})`;
    })
    .join('; ');
}

function referenceTags(referenceImages: CodexStyleReferenceImage[] | undefined) {
  const normalizedTags = new Set(['reference-derived']);
  for (const image of referenceImages ?? []) {
    for (const tag of cleanReferenceName(image.name).split(/\s+/g).slice(0, 3)) {
      const normalized = tag.trim().toLowerCase();
      if (normalized) normalizedTags.add(normalized);
    }
  }
  return Array.from(normalizedTags).slice(0, 12);
}

function baseVisualDna(
  description: string,
  draft?: Partial<UserStylePresetDraft>,
  references = '',
): UserStyleVisualDna {
  const visualDna = (draft?.visualDna ?? {}) as Partial<UserStyleVisualDna>;
  const concept = description || draft?.name || 'custom visual language';
  const referenceClause = references
    ? ` Use the reference set as style evidence only: ${references}.`
    : '';
  return {
    aesthetic:
      cleanText(visualDna.aesthetic) ||
      `${concept} with a clear reusable art direction and coherent visual thesis.${referenceClause}`,
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
      `Build a reusable ${concept} style system. Preserve visual mechanics across many subjects instead of recreating one scene.${referenceClause}`,
  };
}

export async function createLocalUserStyleDraft(
  request: CodexStyleDraftRequest,
): Promise<CodexStyleDraftResponse> {
  const references = referenceDescription(request.referenceImages);
  const description =
    cleanText(request.description) ||
    cleanText(request.currentPrompt) ||
    references ||
    cleanText(request.draft?.name) ||
    'custom studio style';
  const shouldDraftFromDescription =
    request.action === 'draft_from_description' && cleanText(request.description).length > 0;
  const sourceDraft = shouldDraftFromDescription ? undefined : request.draft;
  const visualDna = baseVisualDna(description, sourceDraft, references);
  const hasReferences = (request.referenceImages ?? []).length > 0;
  const draft = {
    name: shouldDraftFromDescription
      ? titleFromDescription(description)
      : cleanText(request.draft?.name, titleFromDescription(description)),
    category: cleanText(
      sourceDraft?.category,
      hasReferences ? 'Reference-Derived Styles' : 'Custom Styles',
    ),
    tags: sourceDraft?.tags?.length
      ? sourceDraft.tags
      : hasReferences
        ? referenceTags(request.referenceImages)
        : ['custom-style'],
    supportedTasks: sourceDraft?.supportedTasks?.length
      ? sourceDraft.supportedTasks
      : ['image_generate', 'image_edit', 'style_preset_card'],
    visualDna,
    avoidRules: sourceDraft?.avoidRules?.length
      ? sourceDraft.avoidRules
      : ['watermark', 'readable text', 'logo', 'signature'],
    warnings: [
      'Local fallback draft. Review specificity before saving.',
      ...(hasReferences
        ? [
            'Reference images are attached as authoring context; local fallback cannot inspect pixels, so add notes or use Codex assist for deeper visual distillation.',
            'Keep reference handling semantic: do not lock pose, framing, source character likeness, logos, or readable text.',
          ]
        : []),
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
