import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { IconDots } from '@tabler/icons-react';

/** A compact caption and an upward disclosure, shared by image catalogs. */
export function CatalogCardBackdrop({
  title,
  label,
  children,
  interactive = true,
  onExpandedChange,
}: {
  title: ReactNode;
  label: string;
  children?: ReactNode;
  interactive?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (!expanded) return;
    const closeOutside = (event: PointerEvent) => {
      const card = ref.current?.closest('.catalog-art-card');
      if (event.target instanceof Node && !card?.contains(event.target)) {
        setExpanded(false);
        onExpandedChange?.(false);
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [expanded, onExpandedChange]);
  return (
    <div
      ref={ref}
      className="catalog-backdrop"
      data-expanded={expanded}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && expanded) {
          setExpanded(false);
          onExpandedChange?.(false);
          ref.current?.querySelector<HTMLButtonElement>('.catalog-backdrop-toggle')?.focus();
        }
      }}
    >
      <div className="catalog-backdrop-caption">
        <div className="catalog-backdrop-title" data-tooltip={label}>
          {title}
        </div>
        {interactive && children ? (
          <button
            type="button"
            className="catalog-backdrop-toggle"
            aria-label={`Actions for ${label}`}
            aria-expanded={expanded}
            aria-controls={id}
            onClick={(event) => {
              event.stopPropagation();
              setExpanded(!expanded);
              onExpandedChange?.(!expanded);
            }}
          >
            <IconDots size={16} />
          </button>
        ) : null}
      </div>
      {children ? (
        <div id={id} className="catalog-backdrop-content">
          {children}
        </div>
      ) : null}
    </div>
  );
}
