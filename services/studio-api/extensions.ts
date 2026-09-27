import type { ExtensionManifest } from '../../packages/shared/src/extensions';
import { getStudioApiBase, request } from './http';

export interface InvalidExtensionFolder {
  folder: string;
  issues: string[];
}

export async function listInstalledExtensions(
  options: { refresh?: boolean; signal?: AbortSignal } = {},
) {
  return request<{ extensions: ExtensionManifest[]; invalid: InvalidExtensionFolder[] }>(
    `/api/extensions${options.refresh ? '?refresh=1' : ''}`,
    { signal: options.signal },
  );
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
