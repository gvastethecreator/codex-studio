import { runtimeLogger } from './runtimeLogger';

export const CONTEXT_IMAGE_MAX_EDGE = 2048;
export const CONTEXT_IMAGE_WEBP_QUALITY = 0.82;
export const MAX_CONTEXT_IMAGE_DATA_URL_BYTES = 4 * 1024 * 1024;

export interface ContextImageDataUrlResult {
  dataUrl: string;
  width: number | null;
  height: number | null;
  fileSizeBytes: number;
}

function estimateDataUrlBytes(dataUrl: string) {
  const payload = dataUrl.split(',').slice(1).join('').replace(/\s+/g, '');
  return Math.max(0, Math.floor((payload.length * 3) / 4));
}

function createImageElement(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    if (!dataUrl.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    let timeoutId: number | null = null;
    const cleanup = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
    };

    img.onload = () => {
      cleanup();
      resolve(img);
    };
    img.onerror = () => {
      cleanup();
      reject(new Error('Image could not be loaded for WebP conversion.'));
    };
    timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error('Image conversion timed out.'));
    }, 5000);
    img.src = dataUrl;
  });
}

function resolveScaledDimensions(width: number, height: number, maxDim: number) {
  if (width <= 0 || height <= 0) return { width, height };
  const scale = Math.min(1, maxDim / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function renderImageDataUrl(
  dataUrl: string,
  options: { maxDim: number; mimeType: 'image/webp' | 'image/jpeg'; quality: number },
) {
  const img = await createImageElement(dataUrl);
  const { width, height } = resolveScaledDimensions(img.width, img.height, options.maxDim);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context unavailable for image conversion.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  const converted = canvas.toDataURL(options.mimeType, options.quality);
  if (!converted.startsWith(`data:${options.mimeType}`)) {
    throw new Error(`${options.mimeType} conversion is not supported in this browser.`);
  }

  return {
    dataUrl: converted,
    width,
    height,
    fileSizeBytes: estimateDataUrlBytes(converted),
  };
}

export async function createContextImageDataUrl(
  dataUrl: string,
): Promise<ContextImageDataUrlResult> {
  const attempts = [
    { maxDim: CONTEXT_IMAGE_MAX_EDGE, quality: CONTEXT_IMAGE_WEBP_QUALITY },
    { maxDim: 1792, quality: 0.78 },
    { maxDim: 1536, quality: 0.74 },
    { maxDim: 1280, quality: 0.7 },
  ];

  let smallest: ContextImageDataUrlResult | null = null;
  for (const attempt of attempts) {
    const converted = await renderImageDataUrl(dataUrl, {
      ...attempt,
      mimeType: 'image/webp',
    });

    if (!smallest || converted.fileSizeBytes < smallest.fileSizeBytes) {
      smallest = converted;
    }

    if (converted.fileSizeBytes <= MAX_CONTEXT_IMAGE_DATA_URL_BYTES) {
      return converted;
    }
  }

  return (
    smallest ?? {
      dataUrl,
      width: null,
      height: null,
      fileSizeBytes: estimateDataUrlBytes(dataUrl),
    }
  );
}

/**
 * Creates a scaled down version of a base64 image for UI performance.
 * Optimized for space in IndexedDB and rendering speed.
 */
export const createThumbnail = (dataUrl: string, maxDim: number = 320): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    if (!dataUrl.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    let timeoutId: ReturnType<typeof window.setTimeout> | null = null;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
    };

    img.onload = () => {
      cleanup();
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDim) {
          height *= maxDim / width;
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width *= maxDim / height;
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Use webp for superior compression in modern browsers
      // Fallback to jpeg if webp is not supported (though dataToURL usually handles it)
      try {
        const webpData = canvas.toDataURL('image/webp', 0.6);
        // If webp is not supported, it might return image/png or something else
        if (webpData.startsWith('data:image/webp')) {
          return resolve(webpData);
        }
      } catch (error) {
        runtimeLogger.warn('WebP thumbnail generation failed, falling back to JPEG', error);
      }

      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => {
      cleanup();
      resolve(dataUrl);
    };

    // 5 second timeout for image loading
    timeoutId = setTimeout(() => {
      cleanup();
      resolve(dataUrl);
    }, 5000);

    img.src = dataUrl;
  });
};
