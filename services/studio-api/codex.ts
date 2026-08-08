import type {
  CodexModelCatalogResponse,
  LocalCodexSessionResponse,
} from '../../packages/shared/src';
import { request } from './http';

export async function getCodexModelCatalog() {
  return request<CodexModelCatalogResponse>('/api/codex/models');
}

export async function getLocalCodexSession() {
  return request<LocalCodexSessionResponse>('/api/codex/session');
}
