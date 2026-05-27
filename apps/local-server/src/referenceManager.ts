import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { GenerationTaskSpec } from '../../../packages/shared/src';
import { resolveLibraryPathFromRoot } from './library';

export interface RawReference {
  name: string;
  dataUrl: string;
  strength: number;
}

export interface ProcessedReference {
  name: string;
  path: string;
  strength: number;
}

export interface ReferenceResult {
  persistedRefs: ProcessedReference[];
  augmentedPrompt: string;
}

export class ReferenceProcessingError extends Error {
  constructor(
    public readonly referenceName: string,
    public readonly reason: string,
  ) {
    super(`Invalid reference "${referenceName}": ${reason}`);
    this.name = 'ReferenceError';
  }
}

function safeReferenceName(name: string, existing: Set<string>, index: number) {
  const parsed = path.parse(name || `reference-${index + 1}.png`);
  const base =
    (parsed.name || `reference-${index + 1}`)
      .replace(/[^a-z0-9._-]+/gi, '-')
      .replace(/^\.+|\.+$/g, '')
      .slice(0, 80) || `reference-${index + 1}`;
  const ext = parsed.ext && /^\.[a-z0-9]+$/i.test(parsed.ext) ? parsed.ext.toLowerCase() : '.png';
  let candidate = `${base}${ext}`;
  let suffix = 2;
  while (existing.has(candidate.toLowerCase())) {
    candidate = `${base}_${suffix}${ext}`;
    suffix += 1;
  }
  existing.add(candidate.toLowerCase());
  return candidate;
}

function decodeDataUrl(reference: RawReference) {
  const match = /^data:(image\/(?:png|jpe?g|webp|gif|svg\+xml));base64,([A-Za-z0-9+/=\s]+)$/i.exec(
    reference.dataUrl,
  );
  if (!match) {
    throw new ReferenceProcessingError(
      reference.name,
      'expected image data URL with base64 payload',
    );
  }
  try {
    const normalized = match[2].replace(/\s+/g, '');
    const bytes = Buffer.from(normalized, 'base64');
    if (bytes.length === 0) {
      throw new Error('empty decoded payload');
    }
    return bytes;
  } catch {
    throw new ReferenceProcessingError(reference.name, 'base64 payload could not be decoded');
  }
}

function buildPromptWithReferences(prompt: string, references: ProcessedReference[]) {
  if (references.length === 0) return prompt;
  const referenceBlock = references
    .map(
      (reference, index) =>
        `${index + 1}. Reference image: ${reference.path} (${reference.name}, strength ${reference.strength.toFixed(2)})`,
    )
    .join('\n');
  return `${prompt}

Use these local reference image files as visual context for the requested image. Respect the strength value as the visual influence for each reference:
${referenceBlock}`;
}

export async function processReferences(
  jobId: string,
  prompt: string,
  references: RawReference[],
  libraryDir: string,
): Promise<ReferenceResult> {
  if (references.length === 0) {
    return { persistedRefs: [], augmentedPrompt: prompt };
  }

  const referencesDir = resolveLibraryPathFromRoot(libraryDir, 'references', jobId);
  mkdirSync(referencesDir, { recursive: true });
  const existing = new Set<string>();
  const persistedRefs: ProcessedReference[] = [];

  for (const [index, reference] of references.entries()) {
    const fileName = safeReferenceName(reference.name, existing, index);
    const filePath = path.join(referencesDir, fileName);
    writeFileSync(filePath, decodeDataUrl(reference));
    persistedRefs.push({
      name: reference.name || fileName,
      path: filePath,
      strength: Math.max(0, Math.min(1, Number(reference.strength) || 0)),
    });
  }

  return {
    persistedRefs,
    augmentedPrompt: buildPromptWithReferences(prompt, persistedRefs),
  };
}

export function hydrateSourceSpecAssetPaths(
  sourceSpec: GenerationTaskSpec | null | undefined,
  references: RawReference[],
  persistedRefs: ProcessedReference[],
) {
  if (!sourceSpec || sourceSpec.assets.length === 0 || references.length === 0) {
    return sourceSpec ?? null;
  }

  let referenceIndex = 0;

  const hydratedAssets = sourceSpec.assets.map((asset) => {
    if (asset.role !== 'reference' || !asset.dataUrl) {
      return asset;
    }

    while (referenceIndex < references.length) {
      const rawReference = references[referenceIndex];
      const persistedRef = persistedRefs[referenceIndex] ?? null;
      referenceIndex += 1;

      const nameMatches = !asset.name || !rawReference?.name || asset.name === rawReference.name;
      const strengthMatches =
        asset.strength == null ||
        rawReference?.strength == null ||
        Math.abs(asset.strength - rawReference.strength) < 0.000_001;

      if (!nameMatches || !strengthMatches) {
        continue;
      }

      if (!persistedRef) {
        return asset;
      }

      return {
        ...asset,
        localPath: persistedRef.path,
        strength: asset.strength ?? rawReference.strength ?? persistedRef.strength,
      };
    }

    return asset;
  });

  return {
    ...sourceSpec,
    assets: hydratedAssets,
  };
}
