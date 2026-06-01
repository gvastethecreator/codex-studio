import React from 'react';
import { usePretextFitText } from '../../hooks/usePretextFitText';

interface QuickStartTextProps {
  title: string;
  subtitle?: string;
  toneClassName?: string;
  subtitleClassName?: string;
  maxTitleFontSize?: number;
}

export const QuickStartText: React.FC<QuickStartTextProps> = ({
  title,
  subtitle,
  toneClassName = 'text-zinc-500 group-hover:text-white',
  subtitleClassName = 'text-zinc-700',
  maxTitleFontSize = 24,
}) => {
  const titleFit = usePretextFitText({
    text: title,
    minFontSize: 12,
    maxFontSize: maxTitleFontSize,
    maxLines: 2,
    fontWeight: 900,
  });

  return (
    <div className="w-full max-w-96 px-4 text-center">
      <h3
        ref={titleFit.ref as React.RefObject<HTMLHeadingElement>}
        style={titleFit.style}
        className={`font-black uppercase transition-colors ${toneClassName}`}
      >
        {title}
      </h3>
      {subtitle && (
        <p
          className={`mt-2 text-[10px] font-bold uppercase leading-snug tracking-[0.18em] transition-colors ${subtitleClassName}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
