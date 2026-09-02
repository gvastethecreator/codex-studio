import { describe, expect, it } from 'vite-plus/test';

import {
  providerBrandChipLabel,
  providerBrandWellClass,
  providerReadyPillClass,
  subscriptionAuthPillClass,
} from './providerBrand';

describe('provider brand chrome', () => {
  it('gives each built-in provider a distinct well and chip label', () => {
    const wells = ['codex', 'grok', 'google', 'fal', 'comfy', 'dry_run'].map(
      providerBrandWellClass,
    );
    expect(new Set(wells).size).toBe(6);
    expect(providerBrandChipLabel('codex')).toBe('Codex');
    expect(providerBrandChipLabel('fal')).toBe('fal.ai');
    expect(providerBrandChipLabel('dry_run')).toBe('Dry run');
  });

  it('tints ready and sign-in pills by state, not by wrapping the whole card', () => {
    expect(providerReadyPillClass({ canExecute: true, status: 'not_configured' })).toContain(
      'emerald',
    );
    expect(providerReadyPillClass({ canExecute: false, status: 'planned' })).toContain('amber');
    expect(subscriptionAuthPillClass('logged_in')).toContain('emerald');
    expect(subscriptionAuthPillClass('pending')).toContain('accent');
    expect(subscriptionAuthPillClass('refresh_failed')).toContain('rose');
  });
});
