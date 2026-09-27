import { IconCompass as Compass, IconLibrary as Library } from '@tabler/icons-react';

export function StyleBrowseSwitch({
  catalogOpen,
  expanded,
  onCatalog,
  onExplore,
  focusReturn = false,
}: {
  catalogOpen: boolean;
  expanded: boolean;
  onCatalog: () => void;
  onExplore: () => void;
  focusReturn?: boolean;
}) {
  return (
    <div className="cs-browse" role="group" aria-label="Style browsing">
      <button
        type="button"
        data-open-style-catalog={focusReturn ? '' : undefined}
        aria-label="Open style catalog"
        aria-pressed={catalogOpen && !expanded}
        onClick={onCatalog}
      >
        <Library size={14} />
        <span>Catalog</span>
      </button>
      <button
        type="button"
        aria-label="Explore styles"
        aria-pressed={catalogOpen && expanded}
        onClick={onExplore}
      >
        <Compass size={14} />
        <span>Explore</span>
      </button>
    </div>
  );
}
