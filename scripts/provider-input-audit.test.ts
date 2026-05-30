import { describe, expect, it } from 'vite-plus/test';

import { createProviderInputAuditReport } from './provider-input-audit';

describe('provider input audit', () => {
  it('audits compact compiled inputs for all current Recipe Modules', () => {
    const report = createProviderInputAuditReport({ includeExternalFixtures: false });

    expect(report.summary.failures).toEqual([]);
    expect(report.summary.recipeRows).toBe(14);
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
