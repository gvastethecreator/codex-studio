import type { OnboardingStagePayload, SystemLog } from '../packages/shared/src';

export interface OnboardingLogLine {
  id: string;
  kind: 'stage' | 'log';
  text: string;
}

export const ONBOARDING_LOG_PANEL_EMPTY = 'Setup logs appear here.';

export function formatOnboardingStageLine(payload: OnboardingStagePayload) {
  return `${payload.stage}: ${payload.message}`;
}

export function formatOnboardingSystemLog(entry: Pick<SystemLog, 'message'>) {
  return entry.message;
}

export function appendOnboardingLogLine(
  lines: OnboardingLogLine[],
  line: OnboardingLogLine,
  max = 200,
) {
  return [...lines, line].slice(-Math.max(1, max));
}

export function onboardingLogLineFromStage(
  payload: OnboardingStagePayload,
  revision?: number,
): OnboardingLogLine {
  return {
    id: `stage:${revision ?? payload.stage}:${payload.message}`,
    kind: 'stage',
    text: formatOnboardingStageLine(payload),
  };
}

export function onboardingLogLineFromSystemLog(
  entry: SystemLog,
  revision?: number,
): OnboardingLogLine | null {
  if (entry.scope !== 'onboarding') return null;
  return {
    id: `log:${revision ?? entry.id}:${entry.createdAt}:${entry.message}`,
    kind: 'log',
    text: formatOnboardingSystemLog(entry),
  };
}

export function shouldAutoOpenOnboarding(input: {
  hasSeenOnboarding: boolean;
  shouldAutoOpen: boolean;
  isReady: boolean;
  hasHealthSnapshot: boolean;
}) {
  if (!input.hasHealthSnapshot) return false;
  return !input.hasSeenOnboarding && input.shouldAutoOpen && !input.isReady;
}

export function shouldCloseOnboardingBecauseReady(isReady: boolean, isOpen: boolean) {
  return isReady && isOpen;
}
