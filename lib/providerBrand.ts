export function providerBrandWellClass(providerId: string) {
  if (providerId === 'codex') return 'border-emerald-400/2 bg-emerald-500/15 text-emerald-100';
  if (providerId === 'grok') return 'border-white/2 bg-zinc-950 text-white';
  if (providerId === 'google') return 'border-sky-400/2 bg-sky-500/15 text-sky-100';
  if (providerId === 'antigravity') return 'border-violet-400/2 bg-violet-500/15 text-violet-100';
  if (providerId === 'fal') return 'border-fuchsia-400/2 bg-fuchsia-500/15 text-fuchsia-100';
  if (providerId === 'comfy') return 'border-orange-400/2 bg-orange-500/15 text-orange-100';
  if (providerId === 'dry_run') return 'border-white/2 bg-white/[0.06] text-zinc-300';
  return 'border-white/2 bg-white/[0.06] text-zinc-300';
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
  if (canExecute) return 'border-emerald-500/2 bg-emerald-500/12 text-emerald-200';
  if (status === 'planned') return 'border-amber-500/2 bg-amber-500/12 text-amber-200';
  if (status === 'unknown') return 'border-white/2 bg-white/5 text-zinc-400';
  return 'border-white/2 bg-white/5 text-zinc-400';
}

export function subscriptionAuthPillClass(status: string | null | undefined) {
  if (status === 'logged_in') return 'border-emerald-500/2 bg-emerald-500/12 text-emerald-200';
  if (status === 'pending') return 'border-accent-400/2 bg-accent-500/14 text-accent-100';
  if (status === 'refresh_failed') return 'border-rose-500/2 bg-rose-500/12 text-rose-200';
  return 'border-white/2 bg-white/5 text-zinc-400';
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
