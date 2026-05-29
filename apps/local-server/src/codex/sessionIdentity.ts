export interface CodexImagegenSessionIdentity {
  sessionKey: string;
  reusable: boolean;
}

function normalizeSessionKeyToken(value: string | null | undefined) {
  return (value ?? 'unknown')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function resolveCodexImagegenSessionIdentity(params: {
  jobId: string;
  prompt: string;
  requestedSessionKey?: string | null;
  hasImageInputs?: boolean;
  getSessionKey: (prompt: string) => string;
}): CodexImagegenSessionIdentity {
  const explicitSessionKey = normalizeSessionKeyToken(params.requestedSessionKey);
  if (explicitSessionKey && explicitSessionKey !== 'unknown') {
    return {
      sessionKey: explicitSessionKey,
      reusable: true,
    };
  }

  if (params.hasImageInputs) {
    return {
      sessionKey: normalizeSessionKeyToken(`job_${params.jobId}`) || 'job_unknown',
      reusable: false,
    };
  }

  const derivedSessionKey = normalizeSessionKeyToken(params.getSessionKey(params.prompt));
  if (
    derivedSessionKey &&
    derivedSessionKey !== 'unknown' &&
    derivedSessionKey !== 'unknown_pack'
  ) {
    return {
      sessionKey: derivedSessionKey,
      reusable: true,
    };
  }

  return {
    sessionKey: normalizeSessionKeyToken(`job_${params.jobId}`) || 'job_unknown',
    reusable: false,
  };
}
