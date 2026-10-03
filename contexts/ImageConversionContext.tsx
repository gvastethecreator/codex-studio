import React, { createContext, Suspense, useCallback, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import type { GeneratedImage } from '../types';
import { ErrorBoundary } from '../components/ErrorBoundary';

const ImageConversionModal = React.lazy(() => import('../components/ImageConversionModal'));

const ImageConversionContext = createContext<((images: GeneratedImage[]) => void) | null>(null);

export function useImageConversion() {
  return useContext(ImageConversionContext);
}

export function ImageConversionProvider({ children }: { children: React.ReactNode }) {
  const [images, setImages] = useState<GeneratedImage[] | null>(null);
  const open = useCallback((selection: GeneratedImage[]) => {
    const unique = Array.from(new Map(selection.map((image) => [image.id, image])).values());
    if (!unique.length) return;
    void (async () => {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {
          // The modal can still be mounted inside the fullscreen element.
        }
      }
      setImages(unique);
    })();
  }, []);
  const close = useCallback(() => setImages(null), []);

  return (
    <ImageConversionContext value={open}>
      {children}
      {images &&
        createPortal(
          <ErrorBoundary fallbackMessage="Could not load image conversion." onDismiss={close}>
            <Suspense
              fallback={
                <div
                  className="fixed inset-0 z-110 grid place-items-center studio-scrim"
                  role="status"
                >
                  Loading image conversion…
                </div>
              }
            >
              <ImageConversionModal images={images} onClose={close} />
            </Suspense>
          </ErrorBoundary>,
          document.fullscreenElement ?? document.body,
        )}
    </ImageConversionContext>
  );
}
