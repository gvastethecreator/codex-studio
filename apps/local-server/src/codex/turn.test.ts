import { describe, expect, it } from 'vite-plus/test';

import { resolveCodexImagegenSessionIdentity } from './sessionIdentity';

describe('resolveCodexImagegenSessionIdentity', () => {
  it('falls back to an isolated per-job session when the derived session would be unknown_pack', () => {
    expect(
      resolveCodexImagegenSessionIdentity({
        jobId: 'job-123',
        prompt: 'Generate something',
        getSessionKey: () => 'unknown_pack',
      }),
    ).toEqual({
      sessionKey: 'job_job-123',
      reusable: false,
    });
  });

  it('keeps reusable pack sessions when the prompt resolves to a stable pack key', () => {
    expect(
      resolveCodexImagegenSessionIdentity({
        jobId: 'job-123',
        prompt: 'PACK: pack_01',
        getSessionKey: () => 'pack_01',
      }),
    ).toEqual({
      sessionKey: 'pack_01',
      reusable: true,
    });
  });

  it('uses an isolated per-job session when the turn includes image inputs', () => {
    expect(
      resolveCodexImagegenSessionIdentity({
        jobId: 'job-456',
        prompt: 'PACK: pack_01',
        hasImageInputs: true,
        getSessionKey: () => 'pack_01',
      }),
    ).toEqual({
      sessionKey: 'job_job-456',
      reusable: false,
    });
  });

  it('honors explicit session keys from callers that intentionally want reuse', () => {
    expect(
      resolveCodexImagegenSessionIdentity({
        jobId: 'job-123',
        prompt: 'Generate something',
        requestedSessionKey: 'Manual Session',
        getSessionKey: () => 'unknown_pack',
      }),
    ).toEqual({
      sessionKey: 'manual_session',
      reusable: true,
    });
  });
});
