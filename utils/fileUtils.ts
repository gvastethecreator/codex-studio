
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { GenerationBatch, GeneratedImageWithConfig } from '../types';

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
  index?: number
) => {
  // 1. Index: ### (e.g. 001, 002) or short ID
  const idxStr = index !== undefined 
    ? String(index).padStart(3, '0') 
    : (id.split('-').pop() || '000').padStart(3, '0');

  // 2. Prompt Slug: first 6 words, sanitized
  const cleanPrompt = (prompt || 'synthesized-asset')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-')  // Replace spaces/underscores with single hyphen
    .replace(/^-+|-+$/g, '')    // Trim hyphens
    .split('-')
    .slice(0, 6)                // Limit to 6 words
    .join('-');

  const slug = cleanPrompt || 'untitled';

  // 3. Model and Resolution
  const safeModel = model.replace(/[^a-zA-Z0-9-]/g, '-');
  const safeResolution = resolution.replace(/[^a-zA-Z0-9-:]/g, '-');

  return `${idxStr}-${slug}-${safeModel}-${safeResolution}.jpeg`;
};

export const downloadMultipleImagesAsZip = async (images: GeneratedImageWithConfig[], zipFilename: string = 'assets.zip') => {
  const zip = new JSZip();
  
  const promises = images.map(async (img, index) => {
    try {
      const response = await fetch(img.src);
      const blob = await response.blob();
      const filename = generateSmartFilename(img.config.prompt, img.id, img.config.model, img.config.aspectRatio, index + 1);
      zip.file(filename, blob);
    } catch (err) {
      console.error(`Failed to fetch image ${img.id} for zip:`, err);
    }
  });

  await Promise.all(promises);
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, zipFilename);
};

export const exportToJson = (data: any, filename: string) => {
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

export const validateVault = (data: any): data is GenerationBatch[] => {
  if (!Array.isArray(data)) return false;
  
  return data.every(batch => {
    if (typeof batch !== 'object' || batch === null) return false;
    if (typeof batch.id !== 'string') return false;
    if (typeof batch.createdAt !== 'number') return false;
    if (typeof batch.config !== 'object' || batch.config === null) return false;
    if (!Array.isArray(batch.images)) return false;
    
    return batch.images.every((img: any) => {
      if (typeof img !== 'object' || img === null) return false;
      if (typeof img.id !== 'string') return false;
      if (typeof img.src !== 'string') return false;
      if (typeof img.batchId !== 'string') return false;
      if (typeof img.createdAt !== 'number') return false;
      return true;
    });
  });
};

export const readJsonFile = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        resolve(json);
      } catch (err) {
        reject(new Error('Invalid JSON file format'));
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
