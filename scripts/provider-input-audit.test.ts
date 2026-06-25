import { describe, expect, it } from 'vite-plus/test';

import { listRecipeModules } from '../lib/recipeModules';
import { createProviderInputAuditReport } from './provider-input-audit';

describe('provider input audit', () => {
  it('audits compact compiled inputs for all current Recipe Modules', () => {
    const report = createProviderInputAuditReport({ includeExternalFixtures: false });
    const expectedRecipeRows = listRecipeModules().reduce(
      (total, module) => total + module.supportedProviders.length,
      0,
    );

    expect(report.summary.failures).toEqual([]);
    expect(report.summary.recipeRows).toBe(expectedRecipeRows);
    expect(report.rows.every((row) => row.kind === 'recipe')).toBe(true);
    expect(report.rows.every((row) => row.hasRecipeProviderDirectives)).toBe(true);
    expect(report.rows.every((row) => row.omittedStableInstructions)).toBe(true);
    expect(report.rows.every((row) => row.providerSessionContractId)).toBe(true);
    expect(report.rows.every((row) => row.assetRefCount >= 0)).toBe(true);
    expect(report.rows.every((row) => !row.inlineAssetBytesPresent)).toBe(true);
    expect(report.rows.every((row) => !row.inlineDataLeak)).toBe(true);
    expect(report.rows.every((row) => !row.secretLikeLeak)).toBe(true);
  });

  it('keeps external conformance fixtures free of inline image data and secrets', () => {
    const report = createProviderInputAuditReport({
      includeExternalFixtures: true,
      providerId: 'google',
    });

    expect(report.summary.failures).toEqual([]);
    expect(report.rows.some((row) => row.kind === 'external_fixture')).toBe(true);
    expect(report.rows.every((row) => row.providerId === 'google')).toBe(true);
    expect(report.rows.every((row) => row.compact)).toBe(true);
    expect(report.rows.every((row) => !row.inlineDataLeak)).toBe(true);
    expect(report.rows.every((row) => !row.secretLikeLeak)).toBe(true);
  });
});
