import type {
  GenerationProviderCapabilitiesResponse,
  GenerationProviderRuntimePreflightResponse,
} from '../../packages/shared/src';
import { request } from './http';

export async function getGenerationProviderCapabilities() {
  return request<GenerationProviderCapabilitiesResponse>('/api/providers');
}

export async function getGenerationProviderRuntimePreflight() {
  return request<GenerationProviderRuntimePreflightResponse>('/api/providers/preflight');
}
