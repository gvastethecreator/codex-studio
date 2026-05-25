import type { GenerationProviderId } from './generationContracts';

export const EXTERNAL_OUTPUT_SOURCE_REGISTRY_VERSION = 'external-output-sources/v1' as const;

export type ExternalOutputSourceStatus = 'detected' | 'registered' | 'missing' | 'blocked';

export interface ExternalOutputSourceCandidate {
  id: string;
  label: string;
  path: string;
  providerId: GenerationProviderId | null;
  status: ExternalOutputSourceStatus;
  reason: string;
  exists: boolean;
  isInsideStudioLibrary: boolean;
}

export interface RegisteredExternalOutputSource {
  id: string;
  label: string;
  path: string;
  providerId: GenerationProviderId | null;
  status: 'registered';
  createdAt: string;
  updatedAt: string;
}

export interface ExternalOutputSourceRegistry {
  schemaVersion: typeof EXTERNAL_OUTPUT_SOURCE_REGISTRY_VERSION;
  sources: RegisteredExternalOutputSource[];
}

export interface ExternalOutputSourcesResponse {
  registry: ExternalOutputSourceRegistry;
  candidates: ExternalOutputSourceCandidate[];
}

export interface ExternalOutputSourceFile {
  relativePath: string;
  fileName: string;
  sizeBytes: number;
  modifiedAt: string | null;
  mimeType: string;
}

export interface RegisterExternalOutputSourceInput {
  label?: string | null;
  path?: string | null;
  providerId?: GenerationProviderId | null;
}

export interface ImportExternalOutputSourceInput {
  files?: string[];
  workspaceId?: string | null;
  limit?: number;
}

export interface ImportedExternalOutputAsset {
  sourceFile: string;
  catalogId: string;
  filePath: string;
  publicUrl: string;
}

export interface ImportExternalOutputSourceResult {
  sourceId: string;
  imported: ImportedExternalOutputAsset[];
  skipped: { sourceFile: string; reason: string }[];
}

export function createDefaultExternalOutputSourceRegistry(): ExternalOutputSourceRegistry {
  return {
    schemaVersion: EXTERNAL_OUTPUT_SOURCE_REGISTRY_VERSION,
    sources: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function normalizeExternalOutputSourceRegistry(
  value: unknown,
): ExternalOutputSourceRegistry {
  if (!isRecord(value) || value.schemaVersion !== EXTERNAL_OUTPUT_SOURCE_REGISTRY_VERSION) {
    return createDefaultExternalOutputSourceRegistry();
  }

  const sources = Array.isArray(value.sources) ? value.sources : [];
  return {
    schemaVersion: EXTERNAL_OUTPUT_SOURCE_REGISTRY_VERSION,
    sources: sources.flatMap((source): RegisteredExternalOutputSource[] => {
      if (!isRecord(source)) return [];
      const id = cleanString(source.id);
      const label = cleanString(source.label);
      const sourcePath = cleanString(source.path);
      const createdAt = cleanString(source.createdAt);
      const updatedAt = cleanString(source.updatedAt);
      if (!id || !label || !sourcePath || !createdAt || !updatedAt) return [];

      return [
        {
          id,
          label,
          path: sourcePath,
          providerId: cleanString(source.providerId) as GenerationProviderId | null,
          status: 'registered',
          createdAt,
          updatedAt,
        },
      ];
    }),
  };
}

export function sanitizeRegisterExternalOutputSourceInput(
  value: unknown,
): Required<RegisterExternalOutputSourceInput> {
  if (!isRecord(value)) {
    return { label: null, path: null, providerId: null };
  }

  return {
    label: cleanString(value.label),
    path: cleanString(value.path),
    providerId: cleanString(value.providerId) as GenerationProviderId | null,
  };
}
