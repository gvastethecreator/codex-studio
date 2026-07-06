export interface StyleGroupPlaceholderHeightInput {
  renderedPresetCount: number;
  gridColumns: number;
  containerWidth: number;
  hasShowMore: boolean;
}

export interface StyleGridMetricsInput {
  presetCount: number;
  gridColumns: number;
  containerWidth: number;
}

export interface StyleGridMetrics {
  columns: number;
  cardWidth: number;
  cardHeight: number;
  rowGap: number;
  rowHeight: number;
  totalRows: number;
  totalHeight: number;
}

export interface StyleGridVirtualWindowInput extends StyleGridMetricsInput {
  viewportTop: number;
  viewportBottom: number;
  overscanRows?: number;
  targetPresetCount?: number;
}

export interface StyleGridVirtualWindow extends StyleGridMetrics {
  startRow: number;
  endRow: number;
  startIndex: number;
  endIndex: number;
  renderedPresetCount: number;
  topSpacerHeight: number;
  bottomSpacerHeight: number;
}

export interface EstimateStyleGridMountedPresetCountInput extends StyleGridMetricsInput {
  viewportHeight?: number;
  overscanRows?: number;
  targetPresetCount?: number;
}

export const STYLE_GRID_CARD_GAP_PX = 10;
export const STYLE_GRID_CARD_ASPECT_HEIGHT_RATIO = 4 / 3;
export const STYLE_GRID_FALLBACK_CARD_WIDTH_PX = 220;
export const STYLE_GRID_MIN_CARD_WIDTH_PX = 120;
export const STYLE_GRID_GROUP_HEADER_HEIGHT_PX = 40;
export const STYLE_GRID_SHOW_MORE_BUTTON_HEIGHT_PX = 52;
export const STYLE_GRID_DEFAULT_VIEWPORT_HEIGHT_PX = 760;
export const STYLE_GRID_OVERSCAN_ROWS = 4;
export const STYLE_GRID_WINDOW_TARGET_PRESET_COUNT = 150;

export function createStyleGridMetrics({
  presetCount,
  gridColumns,
  containerWidth,
}: StyleGridMetricsInput): StyleGridMetrics {
  const columns = Math.max(1, Math.floor(gridColumns));
  const totalRows = Math.ceil(Math.max(0, presetCount) / columns);
  const cardWidth =
    containerWidth > 0
      ? Math.max(
          STYLE_GRID_MIN_CARD_WIDTH_PX,
          (containerWidth - STYLE_GRID_CARD_GAP_PX * Math.max(0, columns - 1)) / columns,
        )
      : STYLE_GRID_FALLBACK_CARD_WIDTH_PX;
  const cardHeight = cardWidth * STYLE_GRID_CARD_ASPECT_HEIGHT_RATIO;
  const rowHeight = cardHeight + STYLE_GRID_CARD_GAP_PX;
  const totalHeight =
    totalRows > 0
      ? totalRows * cardHeight + STYLE_GRID_CARD_GAP_PX * Math.max(0, totalRows - 1)
      : 0;

  return {
    columns,
    cardWidth,
    cardHeight,
    rowGap: STYLE_GRID_CARD_GAP_PX,
    rowHeight,
    totalRows,
    totalHeight,
  };
}

export function createStyleGridVirtualWindow({
  presetCount,
  gridColumns,
  containerWidth,
  viewportTop,
  viewportBottom,
  overscanRows = STYLE_GRID_OVERSCAN_ROWS,
  targetPresetCount = STYLE_GRID_WINDOW_TARGET_PRESET_COUNT,
}: StyleGridVirtualWindowInput): StyleGridVirtualWindow {
  const metrics = createStyleGridMetrics({
    presetCount,
    gridColumns,
    containerWidth,
  });

  if (presetCount <= 0 || metrics.totalRows <= 0) {
    return {
      ...metrics,
      startRow: 0,
      endRow: 0,
      startIndex: 0,
      endIndex: 0,
      renderedPresetCount: 0,
      topSpacerHeight: 0,
      bottomSpacerHeight: 0,
    };
  }

  const safeTop = Math.max(0, Math.min(metrics.totalHeight, viewportTop));
  const safeBottom = Math.max(safeTop, Math.min(metrics.totalHeight, viewportBottom));
  const visibleStartRow = Math.floor(safeTop / metrics.rowHeight);
  const visibleEndRow = Math.max(visibleStartRow + 1, Math.ceil(safeBottom / metrics.rowHeight));
  let startRow = Math.max(0, visibleStartRow - Math.max(0, overscanRows));
  let endRow = Math.min(metrics.totalRows, visibleEndRow + Math.max(0, overscanRows));
  const targetRows = Math.ceil(
    Math.min(presetCount, Math.max(0, targetPresetCount)) / metrics.columns,
  );

  if (targetRows > endRow - startRow) {
    const missingRows = targetRows - (endRow - startRow);
    const rowsBefore = Math.floor(missingRows / 2);
    const rowsAfter = missingRows - rowsBefore;
    startRow = Math.max(0, startRow - rowsBefore);
    endRow = Math.min(metrics.totalRows, endRow + rowsAfter);

    if (endRow - startRow < targetRows) {
      const remainingRows = targetRows - (endRow - startRow);
      startRow = Math.max(0, startRow - remainingRows);
      endRow = Math.min(metrics.totalRows, startRow + targetRows);
    }
  }
  const startIndex = startRow * metrics.columns;
  const endIndex = Math.min(presetCount, endRow * metrics.columns);
  const renderedRows = Math.max(0, endRow - startRow);
  const topSpacerHeight = startRow * metrics.rowHeight;
  const renderedHeight =
    renderedRows > 0
      ? renderedRows * metrics.cardHeight + STYLE_GRID_CARD_GAP_PX * Math.max(0, renderedRows - 1)
      : 0;
  const bottomSpacerHeight = Math.max(0, metrics.totalHeight - topSpacerHeight - renderedHeight);

  return {
    ...metrics,
    startRow,
    endRow,
    startIndex,
    endIndex,
    renderedPresetCount: Math.max(0, endIndex - startIndex),
    topSpacerHeight,
    bottomSpacerHeight,
  };
}

export function estimateStyleGridMountedPresetCount({
  viewportHeight = STYLE_GRID_DEFAULT_VIEWPORT_HEIGHT_PX,
  ...input
}: EstimateStyleGridMountedPresetCountInput): number {
  return createStyleGridVirtualWindow({
    ...input,
    viewportTop: 0,
    viewportBottom: viewportHeight,
  }).renderedPresetCount;
}

export function estimateStyleGroupPlaceholderHeight({
  renderedPresetCount,
  gridColumns,
  containerWidth,
  hasShowMore,
}: StyleGroupPlaceholderHeightInput): number {
  if (renderedPresetCount <= 0) {
    return STYLE_GRID_GROUP_HEADER_HEIGHT_PX;
  }

  const metrics = createStyleGridMetrics({
    presetCount: renderedPresetCount,
    gridColumns,
    containerWidth,
  });
  const buttonHeight = hasShowMore ? STYLE_GRID_SHOW_MORE_BUTTON_HEIGHT_PX : 0;

  return Math.ceil(STYLE_GRID_GROUP_HEADER_HEIGHT_PX + metrics.totalHeight + buttonHeight);
}
