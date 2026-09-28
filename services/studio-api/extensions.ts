import type { ExtensionManifest } from '../../packages/shared/src/extensions';
import { getStudioApiBase, request } from './http';

export interface InvalidExtensionFolder {
  folder: string;
  issues: string[];
}

/** Where an installed extension comes from: downloaded from a source, or read from a local folder. */
export interface ExtensionOrigin {
  from: 'download' | 'local';
  folder: string;
}

export async function listInstalledExtensions(
  options: { refresh?: boolean; signal?: AbortSignal } = {},
) {
  return request<{
    extensions: ExtensionManifest[];
    /** Optional layers on disk per extension id, such as `cards`. */
    installedLayers: Record<string, string[]>;
    origins: Record<string, ExtensionOrigin>;
    invalid: InvalidExtensionFolder[];
  }>(`/api/extensions${options.refresh ? '?refresh=1' : ''}`, { signal: options.signal });
}

function extensionFilePath(extensionId: string, relativePath: string) {
  const encoded = relativePath.split('/').map(encodeURIComponent).join('/');
  return `/api/extensions/${encodeURIComponent(extensionId)}/files/${encoded}`;
}

/** Absolute URL of a file inside an installed extension, for images. */
export function extensionFileUrl(extensionId: string, relativePath: string) {
  return `${getStudioApiBase()}${extensionFilePath(extensionId, relativePath)}`;
}

export async function fetchExtensionJson<T>(extensionId: string, relativePath: string) {
  return request<T>(extensionFilePath(extensionId, relativePath));
}

export interface AvailableExtension {
  id: string;
  version: string;
  title: string;
  tag: string;
  archive: string;
  sha256: string;
  bytes: number;
  layers?: { name: 'cards'; archive: string; sha256: string; bytes: number }[];
  installedVersion: string | null;
  installedLayers: string[];
  installedFrom: 'download' | 'local' | null;
  updateAvailable: boolean;
}

export interface AvailableExtensionSource {
  id: string;
  repo: string;
  extensions: AvailableExtension[];
  error: string | null;
}

/** Extensions published by each remote source, with their installed state. */
export async function listAvailableExtensions() {
  return request<{ tokenConfigured: boolean; sources: AvailableExtensionSource[] }>(
    '/api/extensions/available',
  );
}

export async function installExtension(sourceId: string, id: string, layers: 'cards'[] = []) {
  return request<{ extension: ExtensionManifest; installedLayers: string[] }>(
    '/api/extensions/install',
    { method: 'POST', body: JSON.stringify({ sourceId, id, layers }) },
  );
}

export async function removeExtension(id: string) {
  return request<void>(`/api/extensions/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export type DefaultStylePackState =
  | { state: 'idle' | 'installing' | 'installed' | 'skipped' }
  | { state: 'unavailable' | 'failed'; error: string };

/** Asks the backend to install the default style pack once when Studio has none. */
export async function requestDefaultStylePack() {
  return request<DefaultStylePackState>('/api/extensions/default-pack', { method: 'POST' });
}

export async function getDefaultStylePackState() {
  return request<DefaultStylePackState>('/api/extensions/default-pack');
}
