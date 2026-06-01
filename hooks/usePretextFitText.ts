import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { layout, prepare } from '@chenglou/pretext';

interface UsePretextFitTextOptions {
  text: string;
  minFontSize: number;
  maxFontSize: number;
  maxLines?: number;
  fontWeight?: number;
  fontFamily?: string;
  lineHeightRatio?: number;
}

export function usePretextFitText({
  text,
  minFontSize,
  maxFontSize,
  maxLines = 2,
  fontWeight = 900,
  fontFamily = 'Manrope',
  lineHeightRatio = 1.08,
}: UsePretextFitTextOptions) {
  const ref = useRef<HTMLElement | null>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || typeof ResizeObserver === 'undefined') return;

    const update = () => {
      const width = node.clientWidth;
      if (width <= 0 || !text.trim()) return;

      let low = minFontSize;
      let high = maxFontSize;
      let best = minFontSize;

      for (let i = 0; i < 8; i += 1) {
        const candidate = (low + high) / 2;
        const lineHeight = candidate * lineHeightRatio;
        const prepared = prepare(text, `${fontWeight} ${candidate}px ${fontFamily}`, {
          letterSpacing: 0,
        });
        const result = layout(prepared, width, lineHeight);

        if (result.lineCount <= maxLines) {
          best = candidate;
          low = candidate;
        } else {
          high = candidate;
        }
      }

      setFontSize(Math.round(best * 10) / 10);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [fontFamily, fontWeight, lineHeightRatio, maxFontSize, maxLines, minFontSize, text]);

  const style = useMemo<React.CSSProperties>(
    () => ({
      fontSize,
      lineHeight: `${Math.round(fontSize * lineHeightRatio * 10) / 10}px`,
      letterSpacing: 0,
    }),
    [fontSize, lineHeightRatio],
  );

  return { ref, style };
}
