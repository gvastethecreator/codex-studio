import type {
  StyleRuntimePack,
  StyleRuntimePreset,
} from '../components/recipes/styles/runtimeTypes';
import type { CreateJobRequest } from '../packages/shared/src';

export interface StyleDefaultManifestEntry {
  presetId: string;
  presetName: string;
  packId: string;
  packName: string;
  category: string;
  file: string;
  jobId: string;
  sourceAsset: string;
  generationMode: 'text-to-image';
  model: string;
  reasoningEffort: string;
  generatedAt: string;
}

export interface StyleDefaultManifestInput {
  pack: StyleRuntimePack;
  preset: StyleRuntimePreset;
  category: string;
  file: string;
  jobId: string;
  sourceAsset: string;
  model: string;
  reasoningEffort: string;
  generatedAt: string;
}

export interface StyleDefaultPresetMatch {
  pack: StyleRuntimePack;
  preset: StyleRuntimePreset;
  category: string;
}

export interface StyleDefaultPresetIndex {
  byTarget: Map<string, StyleDefaultPresetMatch[]>;
  byPackCategoryTarget: Map<string, StyleDefaultPresetMatch>;
  byName: Map<string, StyleDefaultPresetMatch[]>;
}

export interface StyleDefaultEvidence {
  presetId: string;
  packId: string;
  jobId: string;
  exactLocalPath: string;
  sourceAsset: string;
  generatedAt: string;
}

export interface StyleDefaultTarget {
  pack: StyleRuntimePack;
  preset: StyleRuntimePreset;
  category: string;
  destination: string;
}

export interface CreateStyleDefaultTargetsOptions {
  packs: StyleRuntimePack[];
  existingFiles: ReadonlySet<string>;
  force: boolean;
  categoryFilters?: ReadonlySet<string>;
  presetFilters?: ReadonlySet<string>;
  limit?: number;
  defaultsDir: string;
  assetExtension: string;
}

export interface StyleDefaultFailureEntry {
  presetId: string;
  presetName: string;
  packId: string;
  packName: string;
  category: string;
  error: string;
  failedAt: string;
}

export interface StyleDefaultFailureInput {
  pack: StyleRuntimePack;
  preset: StyleRuntimePreset;
  category: string;
  error: string;
  failedAt: string;
}

export interface StyleDefaultJobRequestInput {
  projectId?: string;
  prompt: string;
}

function normalizeCategory(category?: string) {
  return category || 'General';
}

function normalizeIndexKey(value: string) {
  return value.trim().toLowerCase();
}

function targetStyleFromPrompt(prompt: string) {
  return prompt
    .match(/TARGET STYLE:\s*([^\n]+)/i)?.[1]
    ?.trim()
    .toUpperCase();
}

function packNameFromPrompt(prompt: string) {
  return prompt
    .match(/^PACK:\s*(.+)$/im)?.[1]
    ?.trim()
    .toLowerCase();
}

function categoryFromPrompt(prompt: string) {
  return prompt
    .match(/^CATEGORY:\s*(.+)$/im)?.[1]
    ?.trim()
    .toLowerCase();
}

function explicitStyleNameFromPrompt(prompt: string) {
  return prompt.match(/recognizable as "([^"]+)"/i)?.[1]?.trim();
}

export function buildStyleDefaultPresetIndex(packs: StyleRuntimePack[]): StyleDefaultPresetIndex {
  const byTarget = new Map<string, StyleDefaultPresetMatch[]>();
  const byPackCategoryTarget = new Map<string, StyleDefaultPresetMatch>();
  const byName = new Map<string, StyleDefaultPresetMatch[]>();

  for (const pack of packs) {
    for (const preset of pack.presets) {
      const category = normalizeCategory(preset.category);
      const match: StyleDefaultPresetMatch = { pack, preset, category };
      const target = preset.name.toUpperCase();
      const targetList = byTarget.get(target) ?? [];
      targetList.push(match);
      byTarget.set(target, targetList);
      byPackCategoryTarget.set(
        `${normalizeIndexKey(pack.name)}::${normalizeIndexKey(category)}::${target}`,
        match,
      );

      const nameList = byName.get(preset.name) ?? [];
      nameList.push(match);
      byName.set(preset.name, nameList);
    }
  }

  return { byTarget, byPackCategoryTarget, byName };
}

export function resolveStyleDefaultPresetFromPrompt(
  prompt: string,
  index: StyleDefaultPresetIndex,
): StyleDefaultPresetMatch | undefined {
  const target = targetStyleFromPrompt(prompt);
  const packName = packNameFromPrompt(prompt);
  const category = categoryFromPrompt(prompt);

  if (target && packName && category) {
    const exact = index.byPackCategoryTarget.get(`${packName}::${category}::${target}`);
    if (exact) return exact;
  }

  if (target) {
    const matches = index.byTarget.get(target);
    if (matches?.length === 1) return matches[0];
  }

  const explicit = explicitStyleNameFromPrompt(prompt);
  if (explicit) {
    const matches = index.byName.get(explicit);
    if (matches?.length === 1) return matches[0];
  }

  return undefined;
}

export function createStyleDefaultManifestEntry({
  pack,
  preset,
  category,
  file,
  jobId,
  sourceAsset,
  model,
  reasoningEffort,
  generatedAt,
}: StyleDefaultManifestInput): StyleDefaultManifestEntry {
  return {
    presetId: preset.id,
    presetName: preset.name,
    packId: pack.id,
    packName: pack.name,
    category,
    file,
    jobId,
    sourceAsset,
    generationMode: 'text-to-image',
    model,
    reasoningEffort,
    generatedAt,
  };
}

export function mergeStyleDefaultManifestEntries(
  existingEntries: StyleDefaultManifestEntry[],
  incomingEntries: StyleDefaultManifestEntry[],
) {
  const byPresetId = new Map<string, StyleDefaultManifestEntry>();

  for (const entry of existingEntries) {
    byPresetId.set(entry.presetId, entry);
  }
  for (const entry of incomingEntries) {
    byPresetId.set(entry.presetId, entry);
  }

  return Array.from(byPresetId.values()).toSorted((a, b) => a.presetId.localeCompare(b.presetId));
}

export function createStyleDefaultEvidence(entry: StyleDefaultManifestEntry): StyleDefaultEvidence {
  return {
    presetId: entry.presetId,
    packId: entry.packId,
    jobId: entry.jobId,
    exactLocalPath: entry.file,
    sourceAsset: entry.sourceAsset,
    generatedAt: entry.generatedAt,
  };
}

function joinDefaultAssetPath(defaultsDir: string, fileName: string) {
  const separator = defaultsDir.includes('\\') ? '\\' : '/';
  return `${defaultsDir.replace(/[\\/]+$/, '')}${separator}${fileName}`;
}

export function createStyleDefaultTargets({
  packs,
  existingFiles,
  force,
  categoryFilters = new Set(),
  presetFilters = new Set(),
  limit = Number.POSITIVE_INFINITY,
  defaultsDir,
  assetExtension,
}: CreateStyleDefaultTargetsOptions): StyleDefaultTarget[] {
  const targets: StyleDefaultTarget[] = [];

  for (const pack of packs) {
    for (const preset of pack.presets) {
      const category = normalizeCategory(preset.category);
      const destination = joinDefaultAssetPath(defaultsDir, `${preset.id}${assetExtension}`);

      if (categoryFilters.size > 0 && !categoryFilters.has(category)) {
        continue;
      }
      if (presetFilters.size > 0 && !presetFilters.has(preset.id)) {
        continue;
      }
      if (!force && existingFiles.has(destination)) {
        continue;
      }

      targets.push({ pack, preset, category, destination });
      if (targets.length >= limit) return targets;
    }
  }

  return targets;
}

export function createStyleDefaultFailureEntry({
  pack,
  preset,
  category,
  error,
  failedAt,
}: StyleDefaultFailureInput): StyleDefaultFailureEntry {
  return {
    presetId: preset.id,
    presetName: preset.name,
    packId: pack.id,
    packName: pack.name,
    category,
    error,
    failedAt,
  };
}

export function createStyleDefaultJobRequest({
  projectId,
  prompt,
}: StyleDefaultJobRequestInput): CreateJobRequest {
  return {
    projectId,
    kind: 'codex_imagegen',
    prompt,
  };
}
