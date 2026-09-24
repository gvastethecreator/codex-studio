import { useEffect, useRef, useState } from 'react';
import type { TcgArtworkSource, TcgRenderInput } from './tcgCardRenderer';
import { renderTcgComposition } from './tcgCardRenderer';

export interface TcgRenderHealth {
  input: TcgRenderInput;
  missingMaskKeys: string[];
  failedArtworkSlots: number[];
  failedMaskKeys: string[];
}

export function getTcgCompositionReadiness({
  artwork,
  requiredArtworkCount,
  requiredMaskKeys,
  maskSources,
  renderInput,
  renderHealth,
  rendering,
  renderError,
}: {
  artwork: readonly TcgArtworkSource[];
  requiredArtworkCount: number;
  requiredMaskKeys: readonly string[];
  maskSources: Record<string, string>;
  renderInput: TcgRenderInput;
  renderHealth: TcgRenderHealth | null;
  rendering: boolean;
  renderError: string;
}) {
  const selectedArtCount = artwork
    .slice(0, requiredArtworkCount)
    .filter((entry) => !!entry.src).length;
  const missingArtSlots = requiredArtworkCount - selectedArtCount;
  const outstandingMasks = requiredMaskKeys.filter(
    (key) => !maskSources[key] || renderHealth?.missingMaskKeys.includes(key),
  );
  const invalidMasks = renderHealth?.failedMaskKeys ?? [];
  const invalidArt = renderHealth?.failedArtworkSlots ?? [];
  const canExport =
    renderHealth?.input === renderInput &&
    !rendering &&
    !renderError &&
    missingArtSlots === 0 &&
    outstandingMasks.length === 0 &&
    invalidMasks.length === 0 &&
    invalidArt.length === 0;
  const selectedReasons = [
    ...outstandingMasks.map((key) => `Falta la máscara PNG ${key}.`),
    ...invalidMasks.map((key) => `No se pudo leer la máscara ${key}.`),
    ...invalidArt.map((index) => `No se pudo cargar el arte ${index + 1}.`),
    ...(missingArtSlots > 0
      ? [`Falta(n) ${missingArtSlots} archivo(s) de arte para este layout.`]
      : []),
  ];
  return { selectedArtCount, canExport, selectedReasons };
}

export function useTcgCompositionPreview(renderInput: TcgRenderInput) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderError, setRenderError] = useState('');
  const [rendering, setRendering] = useState(false);
  const [renderHealth, setRenderHealth] = useState<TcgRenderHealth | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let cancelled = false;
    setRendering(true);
    setRenderError('');
    const timer = window.setTimeout(() => {
      void renderTcgComposition(renderInput)
        .then((result) => {
          if (cancelled) return;
          canvas.width = result.width;
          canvas.height = result.height;
          const context = canvas.getContext('2d');
          if (!context) throw new Error('No se pudo dibujar la vista previa.');
          context.clearRect(0, 0, result.width, result.height);
          context.drawImage(result.canvas, 0, 0);
          setRenderHealth({
            input: renderInput,
            missingMaskKeys: result.missingMaskKeys,
            failedArtworkSlots: result.failedArtworkSlots,
            failedMaskKeys: result.failedMaskKeys,
          });
          setRendering(false);
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          setRenderError(
            error instanceof Error ? error.message : 'No se pudo renderizar la composición.',
          );
          setRenderHealth(null);
          setRendering(false);
        });
    }, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [renderInput]);

  return { canvasRef, renderError, setRenderError, rendering, renderHealth };
}
