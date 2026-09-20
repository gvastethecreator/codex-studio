export function providerBrandWellClass(providerId: string) {
  if (providerId === 'codex')
    return 'border-[color:var(--wb-border)] bg-emerald-500/15 text-[color:var(--wb-ink)]';
  if (providerId === 'grok') return 'border-white/2 bg-zinc-950 text-white';
  if (providerId === 'google')
    return 'border-[color:var(--wb-border)] bg-sky-500/15 text-[color:var(--wb-ink)]';
  if (providerId === 'antigravity')
    return 'border-[color:var(--wb-border)] bg-violet-500/15 text-[color:var(--wb-ink)]';
  if (providerId === 'fal')
    return 'border-[color:var(--wb-border)] bg-fuchsia-500/15 text-[color:var(--wb-ink)]';
  if (providerId === 'comfy')
    return 'border-[color:var(--wb-border)] bg-orange-500/15 text-[color:var(--wb-ink)]';
  if (providerId === 'dry_run')
    return 'border-[color:var(--wb-border)] bg-white/[0.06] text-[color:var(--wb-ink)]';
  return 'border-[color:var(--wb-border)] bg-white/[0.06] text-[color:var(--wb-ink)]';
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
