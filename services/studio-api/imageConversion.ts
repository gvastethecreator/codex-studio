import type {
  ImageConversionOptions,
  ImageConversionResult,
} from '../../packages/shared/src/imageConversion';
import { getStudioApiBase, readLocalStudioErrorMessage, request } from './http';

export function convertCatalogImage(imageId: string, options: ImageConversionOptions) {
  return request<ImageConversionResult>(`/api/catalog/${encodeURIComponent(imageId)}/convert`, {
    method: 'POST',
    body: JSON.stringify({ ...options, destination: 'library' }),
  });
}

export async function downloadConvertedCatalogImage(
  imageId: string,
  options: ImageConversionOptions,
) {
  const response = await fetch(
    `${getStudioApiBase()}/api/catalog/${encodeURIComponent(imageId)}/convert`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...options, destination: 'download' }),
    },
  );
  if (!response.ok)
    throw new Error(readLocalStudioErrorMessage(await response.text(), response.status));
  const disposition = response.headers.get('Content-Disposition') ?? '';
  const encodedName = /filename\*=UTF-8''([^;]+)/i.exec(disposition)?.[1];
  const plainName = /filename="([^"]+)"/i.exec(disposition)?.[1];
  let filename = plainName ?? `converted.${options.format === 'jpeg' ? 'jpg' : options.format}`;
  if (encodedName) {
    try {
      filename = decodeURIComponent(encodedName);
    } catch {
      /* Use the ASCII filename. */
    }
  }
  filename = filename.split(/[\\/]/).pop() || 'converted.png';
  const blob = await response.blob();
  const sourceBytes = Number(response.headers.get('X-Source-Bytes'));
  return {
    blob,
    filename,
    sourceBytes: Number.isFinite(sourceBytes) ? sourceBytes : 0,
    outputBytes: blob.size,
  };
}
