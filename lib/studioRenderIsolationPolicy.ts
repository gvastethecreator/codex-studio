/**
 * Isolation policy for high-frequency Studio UI updates.
 *
 * Enforced seams (not documentation-only):
 * - Workspace list lives in WorkspaceContext (useWorkspaceState).
 * - Toast/debug chrome lives in ToastUiContext (useToastUi).
 * - Runtime log *list* lives in RuntimeLogStateContext (useRuntimeLogs) and is
 *   only subscribed by log-display surfaces (StudioSystemOverlays).
 * - useStudioShell uses useRuntimeLogActions (stable log writer) + EMPTY log
 *   list so log appends do not re-render workspace chrome.
 */
export type StudioUpdateDomain =
  | 'generation-draft'
  | 'generation-run'
  | 'workspace'
  | 'catalog'
  | 'runtime-log'
  | 'toast'
  | 'navigation';

const invalidationMap: Record<StudioUpdateDomain, StudioUpdateDomain[]> = {
  'generation-draft': ['generation-draft'],
  'generation-run': ['generation-run', 'catalog'],
  workspace: ['workspace', 'catalog'],
  catalog: ['catalog'],
  'runtime-log': ['runtime-log'],
  toast: ['toast'],
  navigation: ['navigation'],
};

export function surfacesInvalidatedBy(domain: StudioUpdateDomain): StudioUpdateDomain[] {
  return invalidationMap[domain];
}

export function shouldInvalidateSurface(
  update: StudioUpdateDomain,
  surface: StudioUpdateDomain,
): boolean {
  return surfacesInvalidatedBy(update).includes(surface);
}

/** True when a shell-level consumer must not subscribe to the runtime log list. */
export function shellMustAvoidRuntimeLogListSubscription(): boolean {
  return !shouldInvalidateSurface('runtime-log', 'workspace');
}
