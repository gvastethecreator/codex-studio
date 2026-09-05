import type {
  GenerationProviderCapabilitiesResponse,
  GenerationProviderRuntimePreflightResponse,
} from '../../packages/shared/src';
import { request } from './http';

let capabilitiesInFlight: Promise<GenerationProviderCapabilitiesResponse> | null = null;
let preflightInFlight: Promise<GenerationProviderRuntimePreflightResponse> | null = null;

export function invalidateGenerationProviderReads() {
  capabilitiesInFlight = null;
  preflightInFlight = null;
}

export function getGenerationProviderCapabilities() {
  if (capabilitiesInFlight) return capabilitiesInFlight;
  const promise = request<GenerationProviderCapabilitiesResponse>('/api/providers').finally(() => {
    if (capabilitiesInFlight === promise) capabilitiesInFlight = null;
  });
  capabilitiesInFlight = promise;
  return promise;
}

export function getGenerationProviderRuntimePreflight() {
  if (preflightInFlight) return preflightInFlight;
  const promise = request<GenerationProviderRuntimePreflightResponse>(
    '/api/providers/preflight',
  ).finally(() => {
    if (preflightInFlight === promise) preflightInFlight = null;
  });
  preflightInFlight = promise;
  return promise;
}
