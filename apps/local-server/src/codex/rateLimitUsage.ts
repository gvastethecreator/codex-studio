import type { CodexUsageLimitWindow, CodexUsageSnapshot } from '../../../../packages/shared/src';

export function pickRateLimitSnapshot(response: any) {
  const byLimitId = response?.rateLimitsByLimitId ?? response?.rate_limits_by_limit_id;
  if (byLimitId && typeof byLimitId === 'object') {
    if (byLimitId.codex && typeof byLimitId.codex === 'object') {
      return { snapshot: byLimitId.codex, path: 'rateLimitsByLimitId.codex' };
    }

    for (const [limitId, snapshot] of Object.entries(byLimitId)) {
      if (snapshot && typeof snapshot === 'object') {
        return { snapshot, path: `rateLimitsByLimitId.${limitId}` };
      }
    }
  }

  if (response?.rateLimits && typeof response.rateLimits === 'object') {
    return { snapshot: response.rateLimits, path: 'rateLimits' };
  }

  if (response?.rate_limits && typeof response.rate_limits === 'object') {
    return { snapshot: response.rate_limits, path: 'rate_limits' };
  }

  return { snapshot: null, path: null };
}

function readNumber(value: any, keys: string[]) {
  for (const key of keys) {
    const raw = value?.[key];
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  }

  return null;
}

function formatQuotaWindowLabel(windowMinutes: number | null, fallback: string) {
  if (windowMinutes === 300) return '5h';
  if (windowMinutes === 10080) return 'Weekly';
  if (typeof windowMinutes === 'number' && windowMinutes > 0) {
    if (windowMinutes % 1440 === 0) return `${windowMinutes / 1440}d`;
    if (windowMinutes % 60 === 0) return `${windowMinutes / 60}h`;
    return `${windowMinutes}m`;
  }
  return fallback;
}

function extractQuotaWindow(
  snapshot: any,
  key: 'primary' | 'secondary',
  pathPrefix: string | null,
): CodexUsageLimitWindow | null {
  const window = snapshot?.[key];
  if (!window || typeof window !== 'object') return null;

  const usedPercent = readNumber(window, ['usedPercent', 'used_percent']);
  if (usedPercent === null) return null;

  const windowMinutes = readNumber(window, [
    'windowMinutes',
    'window_minutes',
    'windowDurationMins',
    'window_duration_mins',
  ]);
  const resetsAt = readNumber(window, ['resetsAt', 'resets_at']);
  const normalizedUsed = Math.max(0, Math.min(100, usedPercent));
  const availablePercent = Math.max(0, Math.min(100, 100 - normalizedUsed));

  return {
    id: key,
    label: formatQuotaWindowLabel(windowMinutes, key === 'primary' ? '5h' : 'Weekly'),
    usedPercent: normalizedUsed,
    availablePercent,
    windowMinutes,
    resetsAt,
    path: pathPrefix ? `${pathPrefix}.${key}` : key,
  };
}

export function extractUsageSnapshot(
  snapshot: any,
  pathPrefix: string | null,
): CodexUsageSnapshot | null {
  if (!snapshot || typeof snapshot !== 'object') return null;

  const limits = (['primary', 'secondary'] as const)
    .map((key) => extractQuotaWindow(snapshot, key, pathPrefix))
    .filter((window): window is CodexUsageLimitWindow => window !== null);

  if (limits.length > 0) {
    const primary = limits[0];
    const roundedAvailable = Math.round(primary.availablePercent);
    return {
      available: primary.availablePercent,
      unit: 'quota_percent',
      display: `${roundedAvailable}%`,
      path: primary.path,
      limits,
      raw: snapshot,
    };
  }

  const credits = snapshot.credits;
  if (credits && typeof credits === 'object') {
    if (credits.unlimited === true) {
      return {
        available: 'unlimited',
        unit: 'credits',
        display: 'Unlimited',
        path: pathPrefix ? `${pathPrefix}.credits` : 'credits',
        raw: credits,
      };
    }

    if (typeof credits.balance === 'string' && credits.balance.trim().length > 0) {
      const numericBalance = Number(credits.balance);
      return {
        available: Number.isFinite(numericBalance) ? numericBalance : credits.balance.trim(),
        unit: 'credits',
        display: credits.balance.trim(),
        path: pathPrefix ? `${pathPrefix}.credits.balance` : 'credits.balance',
        raw: credits,
      };
    }

    if (credits.hasCredits === false) {
      return {
        available: 0,
        unit: 'credits',
        display: '0',
        path: pathPrefix ? `${pathPrefix}.credits` : 'credits',
        raw: credits,
      };
    }
  }

  return null;
}
