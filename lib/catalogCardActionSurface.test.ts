import { describe, expect, it } from 'vite-plus/test';
import {
  shouldAlwaysShowCatalogCardActions,
  shouldMountCatalogCardActions,
  shouldShowCatalogCardQuickActions,
} from './catalogCardActionSurface';

describe('catalogCardActionSurface', () => {
  it('keeps secondary card actions demand-mounted on desktop', () => {
    expect(shouldAlwaysShowCatalogCardActions(1440)).toBe(false);
    expect(
      shouldMountCatalogCardActions({
        alwaysShowActions: false,
        isActionSurfaceActive: false,
        isSelected: false,
      }),
    ).toBe(false);

    expect(
      shouldMountCatalogCardActions({
        alwaysShowActions: false,
        isActionSurfaceActive: true,
        isSelected: false,
      }),
    ).toBe(true);
  });

  it('keeps card actions available for touch and selected cards', () => {
    expect(shouldAlwaysShowCatalogCardActions(390)).toBe(true);
    expect(
      shouldMountCatalogCardActions({
        alwaysShowActions: true,
        isActionSurfaceActive: false,
        isSelected: false,
      }),
    ).toBe(true);
    expect(
      shouldMountCatalogCardActions({
        alwaysShowActions: false,
        isActionSurfaceActive: false,
        isSelected: true,
      }),
    ).toBe(true);
  });

  it('keeps favorite and select buttons hover/focus-only on desktop', () => {
    expect(
      shouldShowCatalogCardQuickActions({
        alwaysShowActions: false,
        isActionSurfaceActive: false,
      }),
    ).toBe(false);
    expect(
      shouldShowCatalogCardQuickActions({
        alwaysShowActions: false,
        isActionSurfaceActive: true,
      }),
    ).toBe(true);
    expect(
      shouldShowCatalogCardQuickActions({
        alwaysShowActions: true,
        isActionSurfaceActive: false,
      }),
    ).toBe(true);
  });
});
