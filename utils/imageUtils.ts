import { runtimeLogger } from './runtimeLogger';

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
