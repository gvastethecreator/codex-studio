import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
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
  mimeType: 'image/webp';
  fileSizeBytes: number;
  width: number | null;
  height: number | null;
}

export interface ReferenceResult {
  persistedRefs: ProcessedReference[];
  augmentedPrompt: string;
}

export interface ReferencePayloadLimits {
  maxCount: number;
  maxBytes: number;
  maxTotalBytes: number;
  maxOutputBytes: number;
}

export const REFERENCE_CONTEXT_MAX_COUNT = 5;
export const REFERENCE_CONTEXT_MAX_EDGE = 2048;
export const REFERENCE_CONTEXT_WEBP_QUALITY = 82;
export const REFERENCE_CONTEXT_MAX_WEBP_BYTES = 4 * 1024 * 1024;

export const DEFAULT_REFERENCE_PAYLOAD_LIMITS: ReferencePayloadLimits = {
  maxCount: REFERENCE_CONTEXT_MAX_COUNT,
  maxBytes: 25 * 1024 * 1024,
  maxTotalBytes: 64 * 1024 * 1024,
  maxOutputBytes: REFERENCE_CONTEXT_MAX_WEBP_BYTES,
};

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
  let candidate = `${base}.webp`;
  let suffix = 2;
  while (existing.has(candidate.toLowerCase())) {
    candidate = `${base}_${suffix}.webp`;
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
    const mimeType = match[1].toLowerCase().replace('image/jpg', 'image/jpeg');
    return { bytes, mimeType };
  } catch {
    throw new ReferenceProcessingError(reference.name, 'base64 payload could not be decoded');
  }
}

interface DecodedReference {
  reference: RawReference;
  bytes: Buffer;
  mimeType: string;
}

interface NormalizedReference {
  bytes: Buffer;
  width: number | null;
  height: number | null;
}

export function prepareReferencesForPersistence(
  references: RawReference[],
  limits: ReferencePayloadLimits = DEFAULT_REFERENCE_PAYLOAD_LIMITS,
): DecodedReference[] {
  if (references.length > limits.maxCount) {
    throw new ReferenceProcessingError(
      'references',
      `too many references; maximum is ${limits.maxCount}`,
    );
  }

  let totalBytes = 0;
  return references.map((reference) => {
    const decoded = decodeDataUrl(reference);
    const { bytes } = decoded;
    if (bytes.length > limits.maxBytes) {
      throw new ReferenceProcessingError(
        reference.name,
        `reference exceeds ${limits.maxBytes} bytes`,
      );
    }
    totalBytes += bytes.length;
    if (totalBytes > limits.maxTotalBytes) {
      throw new ReferenceProcessingError(
        reference.name,
        `references exceed ${limits.maxTotalBytes} total bytes`,
      );
    }
    return { reference, bytes, mimeType: decoded.mimeType };
  });
}

async function normalizeReferenceForContext(
  decoded: DecodedReference,
  limits: ReferencePayloadLimits,
): Promise<NormalizedReference> {
  const attempts = [
    { maxEdge: REFERENCE_CONTEXT_MAX_EDGE, quality: REFERENCE_CONTEXT_WEBP_QUALITY },
    { maxEdge: 1792, quality: 78 },
    { maxEdge: 1536, quality: 74 },
    { maxEdge: 1280, quality: 70 },
  ];

  let smallest: NormalizedReference | null = null;

  for (const attempt of attempts) {
    try {
      const result = await sharp(decoded.bytes, {
        failOn: 'none',
        animated: false,
      })
        .rotate()
        .resize({
          width: attempt.maxEdge,
          height: attempt.maxEdge,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: attempt.quality, effort: 5 })
        .toBuffer({ resolveWithObject: true });
      const normalized = {
        bytes: result.data,
        width: result.info.width ?? null,
        height: result.info.height ?? null,
      };

      if (!smallest || normalized.bytes.length < smallest.bytes.length) {
        smallest = normalized;
      }

      if (normalized.bytes.length <= limits.maxOutputBytes) {
        return normalized;
      }
    } catch {
      throw new ReferenceProcessingError(
        decoded.reference.name,
        'image could not be converted to WebP context format',
      );
    }
  }

  if (smallest && smallest.bytes.length <= limits.maxOutputBytes) {
    return smallest;
  }

  throw new ReferenceProcessingError(
    decoded.reference.name,
    `converted WebP reference exceeds ${limits.maxOutputBytes} bytes`,
  );
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

  const decodedReferences = prepareReferencesForPersistence(references);
  const referencesDir = resolveLibraryPathFromRoot(libraryDir, 'references', jobId);
  mkdirSync(referencesDir, { recursive: true });
  const existing = new Set<string>();
  const persistedRefs: ProcessedReference[] = [];

  for (const [index, decoded] of decodedReferences.entries()) {
    const { reference } = decoded;
    const normalized = await normalizeReferenceForContext(
      decoded,
      DEFAULT_REFERENCE_PAYLOAD_LIMITS,
    );
    const fileName = safeReferenceName(reference.name, existing, index);
    const filePath = path.join(referencesDir, fileName);
    writeFileSync(filePath, normalized.bytes);
    persistedRefs.push({
      name: reference.name || fileName,
      path: filePath,
      strength: Math.max(0, Math.min(1, Number(reference.strength) || 0)),
      mimeType: 'image/webp',
      fileSizeBytes: normalized.bytes.length,
      width: normalized.width,
      height: normalized.height,
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
  libraryDir?: string,
) {
  if (!sourceSpec || sourceSpec.assets.length === 0) {
    return sourceSpec ?? null;
  }

  const usedReferenceIndexes = new Set<number>();

  const hydratedAssets = sourceSpec.assets.map((asset) => {
    const hydrateLibrarySource = () => hydrateLibrarySourceAsset(asset, libraryDir);

    if (!asset.dataUrl) {
      return hydrateLibrarySource();
    }

    for (const [index, rawReference] of references.entries()) {
      if (usedReferenceIndexes.has(index)) continue;
      const persistedRef = persistedRefs[index] ?? null;

      const nameMatches = !asset.name || !rawReference?.name || asset.name === rawReference.name;
      const strengthMatches =
        asset.strength == null ||
        rawReference?.strength == null ||
        Math.abs(asset.strength - rawReference.strength) < 0.000_001;
      const dataUrlMatches =
        !asset.dataUrl || !rawReference?.dataUrl || asset.dataUrl === rawReference.dataUrl;

      if (!nameMatches || !strengthMatches || !dataUrlMatches) {
        continue;
      }

      if (!persistedRef) {
        return asset;
      }

      usedReferenceIndexes.add(index);
      return {
        ...asset,
        dataUrl: undefined,
        localPath: persistedRef.path,
        strength: asset.strength ?? rawReference.strength ?? persistedRef.strength,
      };
    }

    return hydrateLibrarySource();
  });

  return {
    ...sourceSpec,
    assets: hydratedAssets,
  };
}

function resolveLibrarySourceUrlToLocalPath(
  sourceUrl: string | null | undefined,
  libraryDir: string | null | undefined,
) {
  const trimmed = sourceUrl?.trim();
  if (!trimmed || !libraryDir) return null;

  let pathname = trimmed;
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const hostname = url.hostname.toLowerCase();
      if (hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname !== '::1') {
        return null;
      }
      pathname = url.pathname;
    } catch {
      return null;
    }
  }

  if (pathname.startsWith('library/')) {
    pathname = `/${pathname}`;
  }

  if (!pathname.startsWith('/library/')) return null;

  let relativePath: string;
  try {
    relativePath = decodeURIComponent(pathname.slice('/library/'.length));
  } catch {
    return null;
  }

  const normalized = relativePath.replaceAll('\\', '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('\0')) return null;

  const root = path.resolve(libraryDir);
  const candidate = path.resolve(root, ...normalized.split('/'));
  const relativeToRoot = path.relative(root, candidate);
  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    return null;
  }

  return candidate;
}

function hydrateLibrarySourceAsset(
  asset: GenerationTaskSpec['assets'][number],
  libraryDir: string | null | undefined,
) {
  if (asset.localPath?.trim()) return asset;

  const localPath = resolveLibrarySourceUrlToLocalPath(asset.sourceUrl, libraryDir);
  if (!localPath) return asset;

  return {
    ...asset,
    sourceUrl: undefined,
    localPath,
  };
}
