import { describe, expect, it } from 'vitest';
import { CATALOG_RENDER_BUDGET, describeCatalogRenderBudget } from './catalogRenderBudget';

describe('catalogRenderBudget', () => {
  it('lets the active catalog fetch a large page while staying under the backend cap', () => {
    expect(CATALOG_RENDER_BUDGET.activePageSize).toBeGreaterThanOrEqual(120);
    expect(CATALOG_RENDER_BUDGET.activePageSize).toBeLessThanOrEqual(200);
  });

  it('exposes the budget as a stable data shape for diagnostics and docs', () => {
    expect(describeCatalogRenderBudget()).toEqual({
      activePageSize: 160,
      trashPageSize: 80,
      queuePreviewLimit: 24,
    });
  });
});
