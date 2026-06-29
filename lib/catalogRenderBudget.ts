export const CATALOG_RENDER_BUDGET = {
  activePageSize: 48,
  workspaceSummaryPageSize: 200,
  trashPageSize: 80,
  queuePreviewLimit: 24,
} as const;

export function describeCatalogRenderBudget() {
  return {
    activePageSize: CATALOG_RENDER_BUDGET.activePageSize,
    workspaceSummaryPageSize: CATALOG_RENDER_BUDGET.workspaceSummaryPageSize,
    trashPageSize: CATALOG_RENDER_BUDGET.trashPageSize,
    queuePreviewLimit: CATALOG_RENDER_BUDGET.queuePreviewLimit,
  };
}
