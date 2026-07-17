import { describe, expect, it } from 'vite-plus/test';
import { createCatalogRequestGate } from './catalogRequestGate';

describe('createCatalogRequestGate', () => {
  it('rejects an A response after a newer B replacement starts', () => {
    const gate = createCatalogRequestGate();
    const requestA = gate.beginReplace();
    const requestB = gate.beginReplace();

    expect(gate.isCurrent(requestA)).toBe(false);
    expect(gate.finish(requestA)).toBe(false);
    expect(gate.isCurrent(requestB)).toBe(true);
    expect(gate.finish(requestB)).toBe(true);
  });

  it('prevents duplicate append requests and invalidates append on filter changes', () => {
    const gate = createCatalogRequestGate();
    const initial = gate.beginReplace();
    gate.finish(initial);
    const append = gate.beginAppend();

    expect(append).not.toBeNull();
    expect(gate.beginAppend()).toBeNull();
    gate.invalidate();
    expect(gate.isCurrent(append!)).toBe(false);
  });
});
