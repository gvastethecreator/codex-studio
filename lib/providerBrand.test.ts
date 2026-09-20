import { describe, expect, it } from 'vitest';

import {
  providerBrandChipLabel,
  providerBrandWellClass,
  providerReadyPillClass,
  subscriptionAuthPillClass,
} from './providerBrand';

describe('provider brand chrome', () => {
  it('gives each built-in provider a distinct well and chip label', () => {
    const wells = ['codex', 'grok', 'google', 'antigravity', 'fal', 'comfy', 'dry_run'].map(
      providerBrandWellClass,
    );
    expect(new Set(wells).size).toBe(7);
    expect(providerBrandChipLabel('codex')).toBe('Codex');
    expect(providerBrandChipLabel('antigravity')).toBe('Antigravity');
    expect(providerBrandChipLabel('fal')).toBe('fal.ai');
    expect(providerBrandChipLabel('dry_run')).toBe('Dry run');
  });

  it('tints ready and sign-in pills by state, not by wrapping the whole card', () => {
    expect(providerReadyPillClass({ canExecute: true, status: 'not_configured' })).toContain(
      'var(--wb-success)',
    );
    expect(providerReadyPillClass({ canExecute: false, status: 'planned' })).toContain(
      'var(--wb-warning)',
    );
    expect(subscriptionAuthPillClass('logged_in')).toContain('var(--wb-success)');
    expect(subscriptionAuthPillClass('pending')).toContain('var(--wb-info)');
    expect(subscriptionAuthPillClass('refresh_failed')).toContain('var(--wb-danger)');
  });
});
