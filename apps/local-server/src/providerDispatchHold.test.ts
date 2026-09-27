import { describe, expect, it, vi } from 'vitest';

import { providerDispatchHeld, scheduleRecoverableJobs } from './providerDispatchHold';

describe('provider dispatch hold', () => {
  it('holds only when the env flag is exactly 1', () => {
    expect(providerDispatchHeld({})).toBe(false);
    expect(providerDispatchHeld({ STUDIO_HOLD_PROVIDER_DISPATCH: 'true' })).toBe(false);
    expect(providerDispatchHeld({ STUDIO_HOLD_PROVIDER_DISPATCH: '1' })).toBe(true);
  });

  it('leaves recoverable jobs unscheduled while held and enqueues them otherwise', () => {
    const enqueue = vi.fn();
    expect(scheduleRecoverableJobs([{ id: 'queued' }, { id: 'running' }], enqueue, true)).toEqual({
      scheduled: 0,
      held: 2,
    });
    expect(enqueue).not.toHaveBeenCalled();
    expect(scheduleRecoverableJobs([{ id: 'queued' }], enqueue, false)).toEqual({
      scheduled: 1,
      held: 0,
    });
    expect(enqueue).toHaveBeenCalledWith({ id: 'queued' });
  });
});
