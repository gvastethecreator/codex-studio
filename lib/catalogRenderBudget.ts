export const CATALOG_RENDER_BUDGET = {
  activePageSize: 160,
  trashPageSize: 80,
  queuePreviewLimit: 24,
} as const;

export function describeCatalogRenderBudget() {
  return {
    activePageSize: CATALOG_RENDER_BUDGET.activePageSize,
    trashPageSize: CATALOG_RENDER_BUDGET.trashPageSize,
    queuePreviewLimit: CATALOG_RENDER_BUDGET.queuePreviewLimit,
  };
}
