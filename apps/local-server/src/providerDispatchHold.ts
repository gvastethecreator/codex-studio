export const SUBSCRIPTION_HTTP_DIAGNOSTIC_REVISION = 'named_seconds_v1' as const;

export function providerDispatchHeld(env: Record<string, string | undefined> = process.env) {
  return env.STUDIO_HOLD_PROVIDER_DISPATCH === '1';
}

export function scheduleRecoverableJobs<T>(
  jobs: readonly T[],
  enqueue: (job: T) => void,
  hold: boolean,
) {
  if (hold) return { scheduled: 0, held: jobs.length };
  for (const job of jobs) enqueue(job);
  return { scheduled: jobs.length, held: 0 };
}
