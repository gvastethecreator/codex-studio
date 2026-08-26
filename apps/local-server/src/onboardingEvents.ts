import type {
  OnboardingProbe,
  OnboardingProgressEvent,
  OnboardingStageId,
  OnboardingStreamAction,
  SystemLog,
} from '../../../packages/shared/src';
import { publishEvent } from './events';

let onboardingLogSeq = 0;

export function publishOnboardingStage(
  action: OnboardingStreamAction,
  stage: OnboardingStageId,
  message: string,
) {
  return publishEvent('onboarding.stage', { action, stage, message });
}

export function publishOnboardingProbe(probe: OnboardingProbe) {
  return publishEvent('onboarding.probe', probe);
}

export function publishOnboardingLog(message: string, level: SystemLog['level'] = 'info') {
  const payload: SystemLog = {
    id: ++onboardingLogSeq,
    level,
    scope: 'onboarding',
    message,
    jobId: null,
    createdAt: new Date().toISOString(),
  };
  return publishEvent('log.created', payload);
}

export function reportOnboardingProgress(
  action: OnboardingStreamAction,
  event: OnboardingProgressEvent,
) {
  if (event.kind === 'stage') {
    publishOnboardingStage(action, event.stage, event.message);
    return;
  }
  publishOnboardingLog(event.message, event.level ?? 'info');
}

export function publishOnboardingActionFinished(
  action: OnboardingStreamAction,
  probe: OnboardingProbe,
) {
  publishOnboardingStage(action, 'reprobe', 'Refreshing the checklist.');
  publishOnboardingProbe(probe);
  publishOnboardingStage(action, 'complete', 'Action finished.');
}
