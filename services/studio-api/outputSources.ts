import type {
  ExternalOutputSourceFile,
  ExternalOutputSourcesResponse,
  ImportExternalOutputSourceInput,
  ImportExternalOutputSourceResult,
  RegisteredExternalOutputSource,
  RegisterExternalOutputSourceInput,
} from '../../packages/shared/src';
import { request } from './http';

export async function getExternalOutputSources() {
  return request<ExternalOutputSourcesResponse>('/api/output-sources');
}

export async function registerExternalOutputSource(input: RegisterExternalOutputSourceInput) {
  return request<RegisteredExternalOutputSource>('/api/output-sources', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function listExternalOutputSourceFiles(sourceId: string, limit = 100) {
  const search = new URLSearchParams({ limit: String(limit) });
  return request<{ files: ExternalOutputSourceFile[] }>(
    `/api/output-sources/${sourceId}/files?${search.toString()}`,
  );
}

export async function importExternalOutputSourceFiles(
  sourceId: string,
  input: ImportExternalOutputSourceInput,
) {
  return request<ImportExternalOutputSourceResult>(`/api/output-sources/${sourceId}/import`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
