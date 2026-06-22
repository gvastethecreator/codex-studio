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

/**
 * Generates a professional filename: ###-prompt-short-max-6-words-model-resolution.jpeg
 */
export const generateSmartFilename = (
  prompt: string | undefined,
  id: string,
  model: string = 'unknown-model',
  resolution: string = 'unknown-res',
  index?: number,
) => {
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
  const safeResolution = resolution.replace(/[^a-zA-Z0-9-:]/g, '-');

  return `${idxStr}-${slug}-${safeModel}-${safeResolution}.jpeg`;
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

  await Promise.all(
    images.map(async (img, index) => {
      try {
        const response = await fetch(img.src);
        const blob = await response.blob();
        const filename = generateSmartFilename(
          img.config.prompt,
          img.id,
          img.config.model,
          img.config.aspectRatio,
          index + 1,
        );
        zip.file(filename, blob);
      } catch (err) {
        runtimeLogger.error(`Failed to fetch image ${img.id} for zip`, err);
      }
    }),
  );
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, zipFilename);
};

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
