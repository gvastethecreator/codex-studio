import type { GeneratedImageWithConfig } from '../types';
import { runtimeLogger } from './runtimeLogger';

export const downloadImage = (src: string, filename: string) => {
  const link = document.createElement('a');
  link.href = src;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
};

function safeDownloadFilename(value: string) {
  const name = value.replace(/[<>:"/\\|?*\x00-\x1f]/g, '-').replace(/[. ]+$/, '') || 'image';
  return /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name) ? `_${name}` : name;
}

/** Keep the saved basename, or build a name for an image that has no local file. */
export const generateSmartFilename = (
  prompt: string | undefined,
  id: string,
  model: string = 'unknown-model',
  resolution: string = 'unknown-res',
  index?: number,
  mimeType?: string,
  localPath?: string,
) => {
  const extension = IMAGE_EXTENSIONS[mimeType?.split(';')[0].trim().toLowerCase() ?? ''];
  const basename = localPath?.split(/[\\/]/).pop();
  if (basename && basename !== '.' && basename !== '..') {
    const name = safeDownloadFilename(basename);
    const suffix = /\.([^.]+)$/.exec(name);
    const savedExtension = suffix?.[1].toLowerCase();
    if (
      savedExtension &&
      (!extension ||
        extension === savedExtension ||
        (extension === 'jpg' && savedExtension === 'jpeg'))
    ) {
      return name;
    }
    return `${suffix ? name.slice(0, -suffix[0].length) : name}.${extension ?? 'png'}`;
  }
  // 1. Index: ### (e.g. 001, 002) or short ID
  const idxStr =
    index !== undefined
      ? String(index).padStart(3, '0')
      : (id.split('-').pop() || '000').padStart(3, '0');

  // 2. Prompt Slug: first 6 words, sanitized
  const cleanPrompt = (prompt || 'synthesized-asset')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with single hyphen
    .replace(/^-+|-+$/g, '') // Trim hyphens
    .split('-')
    .slice(0, 6) // Limit to 6 words
    .join('-');

  const slug = cleanPrompt || 'untitled';

  // 3. Model and Resolution
  const safeModel = model.replace(/[^a-zA-Z0-9-]/g, '-');
  const safeResolution = resolution.replace(/[^a-zA-Z0-9-]/g, '-');
  return safeDownloadFilename(
    `${idxStr}-${slug}-${safeModel}-${safeResolution}.${extension ?? 'png'}`,
  );
};

export const downloadMultipleImagesAsZip = async (
  images: GeneratedImageWithConfig[],
  zipFilename: string = 'assets.zip',
) => {
  const [{ default: JSZip }, { saveAs }] = await Promise.all([
    import('jszip'),
    import('file-saver'),
  ]);
  const zip = new JSZip();

  const files = await Promise.all(
    images.map(async (img, index) => {
      try {
        const blob = await fetchImageBlob(img.src);
        const filename = generateSmartFilename(
          img.config.prompt,
          img.id,
          img.config.model,
          img.config.aspectRatio,
          index + 1,
          blob.type || img.mimeType,
          img.localPath,
        );
        return { filename, blob };
      } catch (err) {
        runtimeLogger.error(`Failed to fetch image ${img.id} for zip`, err);
        return null;
      }
    }),
  );
  const nameKey = (name: string) => name.normalize('NFC').toLowerCase();
  const originalNames = new Set(files.flatMap((file) => (file ? [nameKey(file.filename)] : [])));
  const usedNames = new Set<string>();
  // Allocate in selection order, independent of network completion order. Keep each original
  // basename available when a duplicate needs a suffix, including on case-insensitive systems.
  for (const file of files) {
    if (!file) continue;
    let filename = file.filename;
    const dot = filename.lastIndexOf('.');
    if (usedNames.has(nameKey(filename))) {
      let index = 2;
      do {
        filename = `${file.filename.slice(0, dot)}-${String(index++).padStart(6, '0')}${file.filename.slice(dot)}`;
      } while (originalNames.has(nameKey(filename)) || usedNames.has(nameKey(filename)));
    }
    usedNames.add(nameKey(filename));
    zip.file(filename, file.blob);
  }
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, zipFilename);
};

export async function fetchImageBlob(source: string) {
  const response = await fetch(source);
  if (!response.ok) {
    throw new Error(`Image request failed with HTTP ${response.status}.`);
  }
  return response.blob();
}

async function encodePngBlob(blob: Blob): Promise<Blob> {
  if (blob.type === 'image/png') return blob;
  if (typeof createImageBitmap !== 'function') return blob;
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext('2d');
  if (!context) return blob;
  context.drawImage(bitmap, 0, 0);
  const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  return png ?? blob;
}

export async function copyImageToClipboard(source: string) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    throw new Error('Clipboard is not available in this browser.');
  }
  const blob = await encodePngBlob(await fetchImageBlob(source));
  await navigator.clipboard.write([new ClipboardItem({ [blob.type || 'image/png']: blob })]);
}

/**
 * Export any serializable payload as a downloadable JSON file.
 */
export const exportToJson = <T>(data: T, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Read a user-provided JSON file and parse it into a typed payload.
 */
const readJsonFile = <T = unknown>(file: File): Promise<T> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string) as T;
        resolve(json);
      } catch {
        reject(new Error('Invalid JSON file format'));
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
