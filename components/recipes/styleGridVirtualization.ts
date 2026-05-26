export interface StyleGroupPlaceholderHeightInput {
  renderedPresetCount: number;
  gridColumns: number;
  containerWidth: number;
  hasShowMore: boolean;
}

export const STYLE_CATEGORY_INITIAL_RENDER_LIMIT = 4;
export const STYLE_GROUP_INITIAL_RENDER_LIMIT = 16;

const GRID_HORIZONTAL_PADDING_PX = 64;
const CARD_GAP_PX = 16;
const CARD_ASPECT_HEIGHT_RATIO = 4 / 3;
const FALLBACK_CARD_WIDTH_PX = 220;
const GROUP_HEADER_HEIGHT_PX = 40;
const SHOW_MORE_BUTTON_HEIGHT_PX = 52;

export function getVisibleStylePresets<T>(presets: T[], expanded: boolean, limit: number): T[] {
  return expanded ? presets : presets.slice(0, limit);
}

export function estimateStyleGroupPlaceholderHeight({
  renderedPresetCount,
  gridColumns,
  containerWidth,
  hasShowMore,
}: StyleGroupPlaceholderHeightInput): number {
  if (renderedPresetCount <= 0) {
    return GROUP_HEADER_HEIGHT_PX;
  }

  const safeColumns = Math.max(1, Math.floor(gridColumns));
  const rows = Math.ceil(renderedPresetCount / safeColumns);
  const availableWidth = Math.max(0, containerWidth - GRID_HORIZONTAL_PADDING_PX);
  const cardWidth =
    availableWidth > 0
      ? Math.max(120, (availableWidth - CARD_GAP_PX * Math.max(0, safeColumns - 1)) / safeColumns)
      : FALLBACK_CARD_WIDTH_PX;
  const gridHeight =
    rows * cardWidth * CARD_ASPECT_HEIGHT_RATIO + CARD_GAP_PX * Math.max(0, rows - 1);
  const buttonHeight = hasShowMore ? SHOW_MORE_BUTTON_HEIGHT_PX : 0;

  return Math.ceil(GROUP_HEADER_HEIGHT_PX + gridHeight + buttonHeight);
}
