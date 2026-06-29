import { describe, expect, it } from 'vitest';
import { CATALOG_RENDER_BUDGET, describeCatalogRenderBudget } from './catalogRenderBudget';

describe('catalogRenderBudget', () => {
  it('keeps the active catalog initial render below a full 200-card page', () => {
    expect(CATALOG_RENDER_BUDGET.activePageSize).toBeLessThan(60);
    expect(CATALOG_RENDER_BUDGET.workspaceSummaryPageSize).toBeGreaterThan(
      CATALOG_RENDER_BUDGET.activePageSize,
    );
  });

  it('exposes the budget as a stable data shape for diagnostics and docs', () => {
    expect(describeCatalogRenderBudget()).toEqual({
      activePageSize: 48,
      workspaceSummaryPageSize: 200,
      trashPageSize: 80,
      queuePreviewLimit: 24,
    });
  });
});
