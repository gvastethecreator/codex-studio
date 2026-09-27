import * as Intentional from '../../packages/shared/src/styles/intentional-v1';
import type { Attachment } from '../../types';
import { loadStyleRuntimePack } from './stylesData';
import {
  createDefaultStyleLayerFieldControls,
  STYLE_LAYER_FIELD_DEFINITIONS,
  type SelectedStyleSlot,
} from './styleLayerComposer';

// Style packs ship each preset's policy in runtime.json. A slot saved before that carries no
// policy, so it is read from the installed pack.
async function resolveIntentionalPolicy(slot: SelectedStyleSlot) {
  if (slot.preset.intentional) return slot.preset.intentional;
  const pack = await loadStyleRuntimePack(slot.packId);
  return pack?.presets.find((preset) => preset.id === slot.preset.id)?.intentional ?? null;
}

function hasExplicitFieldControls(slot: SelectedStyleSlot) {
  if (!slot.fieldControls) return false;
  const defaults = createDefaultStyleLayerFieldControls();
  return STYLE_LAYER_FIELD_DEFINITIONS.some((field) => {
    const current = slot.fieldControls?.[field.id];
    if (!current) return false;
    return (
      current.enabled !== defaults[field.id].enabled || current.weight !== defaults[field.id].weight
    );
  });
}

async function hashedReferences(
  attachments: Attachment[],
  mode: Intentional.Mode,
): Promise<Intentional.Reference[]> {
  if (mode === 'generate' || attachments.length === 0) return [];
  const refs: Intentional.Reference[] = [];
  for (const [index, attachment] of attachments.entries()) {
    const material = attachment.dataUrl || attachment.id || `ref-${index + 1}`;
    const id = attachment.id || `ref-${index + 1}`;
    const contentHash = await Intentional.sha256(material);
    refs.push({ id, role: 'subject', contentHash });
    if (mode === 'preserve' && index === 0 && refs.length < 12) {
      refs.push({ id: `${id}:composition`, role: 'composition', contentHash });
    }
  }
  return refs;
}

export async function compileIntentionalStylePlan({
  slots,
  prompt,
  attachments,
  mode,
  locks,
  variation,
  permissions,
  baseAvoidRules,
}: {
  slots: SelectedStyleSlot[];
  prompt: string;
  attachments: Attachment[];
  mode: Intentional.Mode;
  locks: Intentional.Locks;
  variation: Intentional.Variation;
  permissions: Intentional.Permissions;
  baseAvoidRules: string[];
}): Promise<{
  recipeParams: Record<string, unknown>;
  effectivePrompt: string;
  styleRequestHash: string;
  issues: Intentional.Issue[];
  fallbackPrompt: string;
}> {
  const enabled = slots.filter((slot) => slot.enabled ?? true);
  if (enabled.length === 0) {
    throw new Intentional.CompilationBlocked([
      {
        severity: 'error',
        code: 'NO_ACTIVE_FIELDS',
        message: 'Choose a style before generating.',
        layerIds: [],
      },
    ]);
  }

  const policies = await Promise.all(enabled.map(resolveIntentionalPolicy));
  const missing = enabled.filter((_slot, index) => !policies[index]);
  if (missing.length > 0) {
    throw new Intentional.CompilationBlocked([
      {
        severity: 'error',
        code: 'UNMIGRATED_PRESET',
        message: `Turn off Intentional styles or remove styles that are not on that path: ${missing.map((slot) => slot.preset.displayName || slot.preset.name).join(', ')}.`,
        layerIds: missing.map((slot) => slot.preset.id),
      },
    ]);
  }

  const layers: Intentional.Layer[] = [];
  for (const [index, slot] of enabled.entries()) {
    const registered = policies[index];
    if (!registered) continue;
    const layer = await Intentional.layerFromLegacySlot(
      {
        preset: {
          id: slot.preset.id,
          name: slot.preset.name,
          displayName: slot.preset.displayName,
          style: slot.preset.style,
        },
        packId: slot.packId,
        packName: slot.packName,
        strength: slot.strength,
        enabled: slot.enabled,
        fieldControls: slot.fieldControls,
        avoidRulesMode: slot.avoidRulesMode,
      },
      registered.policy,
      registered.presetVersion,
      `layer-${index + 1}`,
      hasExplicitFieldControls(slot),
    );
    layers.push(layer);
  }

  const userPrompt = prompt.trim() || 'Create a balanced composition using the selected styles.';
  const compiled = await Intentional.compileStyleRequest({
    prompt: userPrompt,
    layers,
    mode,
    locks,
    variation,
    permissions,
    references: await hashedReferences(attachments, mode),
    baseAvoidRules,
  });

  const errors = compiled.issues.filter((issue) => issue.severity === 'error');
  if (errors.length > 0) {
    throw new Intentional.CompilationBlocked(compiled.issues);
  }

  const first = enabled[0];
  return {
    effectivePrompt: compiled.effectivePrompt,
    styleRequestHash: compiled.styleRequestHash,
    issues: compiled.issues,
    fallbackPrompt: userPrompt,
    recipeParams: {
      presetId: first?.preset.id ?? '',
      presetName: enabled.map((slot) => slot.preset.displayName || slot.preset.name).join(' + '),
      selectedStyles: enabled.map((slot, index) => ({
        presetId: slot.preset.id,
        presetName: slot.preset.displayName || slot.preset.name,
        packId: slot.packId,
        packName: slot.packName,
        strength: slot.strength,
        enabled: slot.enabled ?? true,
        slot: index + 1,
      })),
      compilerVersion: Intentional.CORE_VERSION,
      styleRequestHash: compiled.styleRequestHash,
      effectivePrompt: compiled.effectivePrompt,
      intentionalMode: mode,
      ...(mode === 'generate' ? {} : { styleReferenceMode: mode }),
      appliedFields: compiled.appliedFields,
      issues: compiled.issues,
    },
  };
}
