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
  toneClassName = 'text-[color:var(--wb-muted)] group-hover:text-[color:var(--wb-ink)]',
  subtitleClassName = 'text-[color:var(--wb-dim)]',
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
        className={`font-semibold transition-colors ${toneClassName}`}
      >
        {title}
      </h3>
      {subtitle && (
        <p
          className={`mt-2 text-[length:var(--wbp-label)] font-bold leading-snug tracking-normal transition-colors ${subtitleClassName}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
