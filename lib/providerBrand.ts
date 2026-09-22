export function providerBrandWellClass(providerId: string) {
  return `provider-brand-well provider-brand-${['codex', 'grok', 'google', 'antigravity', 'fal', 'comfy', 'dry_run'].includes(providerId) ? providerId : 'unknown'}`;
}

export function providerBrandChipLabel(providerId: string) {
  if (providerId === 'codex') return 'Codex';
  if (providerId === 'grok') return 'Grok';
  if (providerId === 'google') return 'Google';
  if (providerId === 'antigravity') return 'Antigravity';
  if (providerId === 'fal') return 'fal.ai';
  if (providerId === 'comfy') return 'Comfy';
  if (providerId === 'dry_run') return 'Dry run';
  return providerId;
}

export function providerReadyPillClass({
  canExecute,
  status,
}: {
  canExecute: boolean;
  status: string;
}) {
  if (canExecute) return 'border-emerald-500/20 bg-emerald-500/12 text-[color:var(--wb-success)]';
  if (status === 'planned')
    return 'border-amber-500/20 bg-amber-500/12 text-[color:var(--wb-warning)]';
  return 'border-[color:var(--wb-border)] bg-[color-mix(in_srgb,var(--wb-ink)_5%,transparent)] text-[color:var(--wb-muted)]';
}

export function subscriptionAuthPillClass(status: string | null | undefined) {
  if (status === 'logged_in')
    return 'border-emerald-500/20 bg-emerald-500/12 text-[color:var(--wb-success)]';
  if (status === 'pending')
    return 'border-accent-400/20 bg-accent-500/14 text-[color:var(--wb-info)]';
  if (status === 'refresh_failed')
    return 'border-rose-500/20 bg-rose-500/12 text-[color:var(--wb-danger)]';
  return 'border-[color:var(--wb-border)] bg-[color-mix(in_srgb,var(--wb-ink)_5%,transparent)] text-[color:var(--wb-muted)]';
}

export function providerRuntimeStatusDotClass({
  canExecute,
  status,
}: {
  canExecute: boolean;
  status: string;
}) {
  if (canExecute) return 'bg-emerald-400';
  if (status === 'unknown') return 'bg-amber-400';
  return 'bg-rose-400';
}
