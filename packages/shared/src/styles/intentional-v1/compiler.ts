import {
  FIELDS,
  CORE_VERSION,
  type RequestInput,
  type CompiledRequest,
  type AppliedField,
  type Issue,
  type EffectiveAvoidRule,
  type Layer,
  type FieldId,
} from './types.js';
import { validateRequest } from './validation.js';
import { verifyLayerHashes } from './composition.js';
import { jsonClone, sha256 } from './canonical.js';
export class CompilationBlocked extends Error {
  constructor(public readonly issues: Issue[]) {
    super(
      issues
        .filter((i) => i.severity === 'error')
        .map((i) => i.message)
        .join('\n'),
    );
    this.name = 'CompilationBlocked';
  }
}
function effectiveField(layer: Layer, field: FieldId, input: RequestInput): boolean {
  return (
    layer.enabled &&
    layer.fields[field].enabled &&
    !(field === 'camera_and_composition' && (input.locks.camera || input.locks.composition))
  );
}
function permissionIsRelevant(layer: Layer, fields: AppliedField[]): boolean {
  const has = (field: FieldId) =>
    fields.some((f) => f.layerId === layer.layerId && f.field === field);
  switch (layer.snapshot.policy.requires) {
    case 'structure':
      return has('camera_and_composition') || has('subject_treatment');
    case 'wardrobe':
    case 'design':
    case 'environment':
      return has('subject_treatment') || has('texture_and_material');
    case 'materialTarget':
      return has('texture_and_material') || has('color_and_tone');
    case 'accent':
      return has('color_and_tone');
    default:
      return false;
  }
}
function strengthWords(value: number) {
  return value < 0.34 ? 'light' : value < 0.7 ? 'moderate' : 'strong';
}
const referenceInstructions = {
  subject:
    'Use this reference for subject identity and requested content; obey the explicit pose, camera and composition locks.',
  style:
    'Borrow visual treatment only; do not copy its subject, setting, text, pose or composition.',
  composition:
    'Use its spatial arrangement according to the composition lock; do not import unrelated subjects or visual style.',
  avoid: 'Treat this as a negative visual example, never as required subject content.',
} as const;
/** No random instructions, hidden restaging, style-name anchors or inactive-field DNA are emitted. */
export async function compileStyleRequest(raw: RequestInput): Promise<CompiledRequest> {
  validateRequest(raw);
  const input = jsonClone(raw);
  await verifyLayerHashes(input.layers);
  const issues: Issue[] = [];
  const appliedFields: AppliedField[] = [];
  const report = (
    severity: Issue['severity'],
    code: string,
    message: string,
    layerIds: string[] = [],
  ) => issues.push({ severity, code, message, layerIds });
  const contentRefs = input.references.filter(
    (r) => r.role === 'subject' || r.role === 'composition',
  );
  if (input.mode === 'preserve' && !contentRefs.length)
    report(
      'error',
      'PRESERVATION_NEEDS_CONTENT_REFERENCE',
      'Preservation requires a subject or composition reference, not only a style reference.',
    );
  if (
    input.mode === 'preserve' &&
    (!input.locks.identity || !input.locks.pose || !input.locks.camera || !input.locks.composition)
  )
    report(
      'error',
      'PRESERVATION_LOCKS_REQUIRED',
      'Preserve mode keeps identity, pose, camera and composition locked; use reinterpretation for selective restaging.',
    );
  if (input.mode === 'preserve' && input.variation.enabled)
    report(
      'error',
      'PRESERVATION_VARIATION_CONFLICT',
      'Disable variation in preservation mode or explicitly choose reinterpretation.',
    );
  for (const layer of input.layers) {
    if (!layer.enabled) continue;
    if (
      (input.locks.camera || input.locks.composition) &&
      layer.fields.camera_and_composition.enabled
    )
      report(
        'warning',
        'CAMERA_FIELD_SUPPRESSED',
        'The camera/composition field was omitted because a structural lock is active.',
        [layer.layerId],
      );
    for (const field of FIELDS)
      if (effectiveField(layer, field, input))
        appliedFields.push({
          layerId: layer.layerId,
          field,
          text: layer.snapshot.dna[field],
          strength: layer.strength,
          weight: layer.fields[field].weight,
        });
    const active = appliedFields.some((f) => f.layerId === layer.layerId);
    if (!active) {
      report(
        'warning',
        'EMPTY_LAYER',
        'An enabled layer has no effective fields; its avoid rules are also omitted.',
        [layer.layerId],
      );
      continue;
    }
    const requirement = layer.snapshot.policy.requires;
    if (requirement && permissionIsRelevant(layer, appliedFields)) {
      const permission = input.permissions[requirement];
      if (!permission || (typeof permission === 'string' && !permission.trim()))
        report(
          'error',
          'PERMISSION_REQUIRED',
          `This layer requires an explicit ${requirement} permission or target. Disable the content-changing fields to use it as a partial modifier.`,
          [layer.layerId],
        );
      if (
        requirement === 'structure' &&
        (input.mode === 'preserve' ||
          input.locks.camera ||
          input.locks.composition ||
          input.locks.pose)
      )
        report(
          'error',
          'STRUCTURE_LOCK_CONFLICT',
          'A structural representation profile conflicts with active preservation locks. Choose reinterpretation with the relevant locks released, or use only nonstructural fields.',
          [layer.layerId],
        );
    }
  }
  if (!appliedFields.length)
    report('error', 'NO_ACTIVE_FIELDS', 'Select at least one effective style field.');
  const constraints = new Map<string, Map<string, Set<string>>>();
  for (const layer of input.layers)
    if (layer.enabled)
      for (const c of layer.snapshot.policy.constraints) {
        if (!appliedFields.some((f) => f.layerId === layer.layerId && f.field === c.field))
          continue;
        const values = constraints.get(c.group) ?? new Map<string, Set<string>>();
        const ids = values.get(c.value) ?? new Set<string>();
        ids.add(layer.layerId);
        values.set(c.value, ids);
        constraints.set(c.group, values);
      }
  for (const [group, values] of constraints)
    if (values.size > 1) {
      const ids = [...new Set([...values.values()].flatMap((s) => [...s]))];
      report(
        group === 'medium' ? 'warning' : 'error',
        group === 'medium' ? 'MEDIUM_COMPETITION' : 'STRUCTURAL_CONFLICT',
        `Active ${group} choices differ: ${[...values.keys()].join(' versus ')}. ${group === 'medium' ? 'Assign different field roles when a full-style blend is not intended.' : 'Choose one structural interpretation.'}`,
        ids,
      );
    }
  const avoidMap = new Map<string, EffectiveAvoidRule>();
  const addAvoid = (text: string, strict: boolean, layerId: string) => {
    const clean = text.trim(),
      key = clean.toLowerCase().replace(/\s+/g, ' '),
      old = avoidMap.get(key);
    if (old) {
      old.strict = old.strict || strict;
      if (layerId && !old.layerIds.includes(layerId)) old.layerIds.push(layerId);
    } else avoidMap.set(key, { text: clean, strict, layerIds: layerId ? [layerId] : [] });
  };
  input.baseAvoidRules.forEach((t) => addAvoid(t, false, ''));
  for (const layer of input.layers) {
    if (
      !layer.enabled ||
      layer.avoidRulesMode === 'ignore' ||
      !appliedFields.some((f) => f.layerId === layer.layerId)
    )
      continue;
    for (const rule of layer.snapshot.policy.avoidRules)
      if (
        rule.field === 'global' ||
        appliedFields.some((f) => f.layerId === layer.layerId && f.field === rule.field)
      )
        addAvoid(rule.text, layer.avoidRulesMode === 'strict', layer.layerId);
  }
  // Deliberately small exact-term dictionary, not a claim of general semantic understanding.
  const mediumWords: Record<string, string[]> = {
    photography: ['photo', 'photography', 'photorealistic'],
    illustration: ['illustration'],
    painting: ['painting', 'oil painting'],
    drawing: ['drawing'],
    cgi: ['cgi', '3d render'],
    print: ['printmaking'],
    'pixel-art': ['pixel art'],
  };
  for (const [medium, ids] of constraints.get('medium') ?? []) {
    for (const word of mediumWords[medium] ?? []) {
      const rule = avoidMap.get(word);
      if (rule)
        report(
          'error',
          'NEGATIVE_MEDIUM_CONFLICT',
          `An active style requests ${medium}, but an effective avoid rule excludes “${rule.text}”. Review the responsible field or rule.`,
          [...new Set([...ids, ...rule.layerIds])],
        );
    }
  }
  if (issues.some((i) => i.severity === 'error')) throw new CompilationBlocked(issues);
  const lines = [
    'STYLE APPLICATION CONTRACT',
    `Mode: ${input.mode}.`,
    'The user prompt supplies the subject, setting, requested text and action. Style layers do not silently add subjects, props, HUD or framing.',
    'Layer influence and field weights are language-level priorities, not calibrated pixel percentages or native provider parameters.',
    ...Object.entries(input.locks)
      .filter(([, enabled]) => enabled)
      .map(
        ([key]) =>
          `Preserve ${key}: do not deliberately alter it while applying the selected visual treatment.`,
      ),
    input.mode === 'reinterpret'
      ? "Restage only the aspects whose locks are released; retain the user's requested identity and content."
      : 'Do not introduce extra restaging instructions.',
    'USER PROMPT',
    input.prompt.trim(),
  ];
  if (input.references.length)
    lines.push(
      'REFERENCE ROLES',
      ...input.references.map(
        (ref) => `${ref.id} — ${ref.role}: ${referenceInstructions[ref.role]}`,
      ),
    );
  if (
    input.permissions.materialTarget.trim() &&
    input.layers.some(
      (l) =>
        l.enabled &&
        l.snapshot.policy.requires === 'materialTarget' &&
        permissionIsRelevant(l, appliedFields),
    )
  )
    lines.push(
      `Material target: ${input.permissions.materialTarget.trim()}. Keep all other surfaces unchanged by the material modifier.`,
    );
  if (
    input.permissions.accent.trim() &&
    input.layers.some(
      (l) =>
        l.enabled &&
        l.snapshot.policy.requires === 'accent' &&
        permissionIsRelevant(l, appliedFields),
    )
  )
    lines.push(`Selected accent: ${input.permissions.accent.trim()}.`);
  for (const [index, layer] of input.layers.entries()) {
    const fields = appliedFields.filter((f) => f.layerId === layer.layerId);
    if (!fields.length) continue;
    // Names remain in catalog/audit metadata; they cannot reintroduce masked camera or IP anchors.
    lines.push(
      `STYLE LAYER ${index + 1} — requested influence ${layer.strength.toFixed(2)} (${strengthWords(layer.strength)})`,
    );
    for (const f of fields)
      lines.push(`${f.field} [field priority ${f.weight.toFixed(2)}]: ${f.text}`);
  }
  if (input.variation.enabled) lines.push('EXPLICIT VARIATION', input.variation.instruction.trim());
  const avoidRules = [...avoidMap.values()];
  if (avoidRules.length)
    lines.push(
      'AVOID INSTRUCTIONS',
      ...avoidRules.map((r) => `${r.strict ? 'Strictly avoid' : 'Avoid'}: ${r.text}`),
    );
  const effectivePrompt = lines.join('\n');
  const referencePlan = jsonClone(input.references);
  // This hashes only the effective style request. Provider model/output/seed belong to the backend's final request hash.
  const styleRequestHash = await sha256({
    compilerVersion: CORE_VERSION,
    effectivePrompt,
    referencePlan,
  });
  return {
    compilerVersion: CORE_VERSION,
    effectivePrompt,
    appliedFields,
    avoidRules,
    issues,
    styleRequestHash,
    referencePlan,
  };
}
