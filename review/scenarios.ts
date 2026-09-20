import { resetDemoStore, type DemoSeed } from './demo-store';

export interface ReviewScenario {
  id: string;
  viewId: string;
  stateId: string;
  label: string;
  hash: string;
  seed: DemoSeed;
  overlay?: 'settings' | 'jobs' | 'onboarding' | 'workflow';
}

export const REVIEW_SCENARIOS: ReviewScenario[] = [
  {
    id: 'recipe-animation-sequence.partial',
    viewId: 'recipe-animation-sequence',
    stateId: 'partial',
    label: 'Animation · simulated partial frames',
    hash: 'recipe-animation-sequence',
    seed: { catalog: 'ready', provider: 'ready', runningJob: false, animationPartial: true },
  },
  {
    id: 'recipe-camera.error',
    viewId: 'recipe-camera',
    stateId: 'error',
    label: 'Camera · simulated WebGL failure',
    hash: 'recipe-camera',
    seed: { catalog: 'ready', provider: 'ready', runningJob: false, cameraUnavailable: true },
  },
  {
    id: 'library.error',
    viewId: 'library',
    stateId: 'error',
    label: 'Library · simulated error',
    hash: '',
    seed: { catalog: 'error', provider: 'ready', runningJob: false },
  },
  ...(['failed', 'needs_review', 'cancelled', 'retry', 'partial'] as const).map(
    (outcome): ReviewScenario => ({
      id: `jobs.${outcome}`,
      viewId: 'jobs',
      stateId: outcome,
      label: `Jobs · simulated ${outcome}`,
      hash: '',
      overlay: 'jobs',
      seed: { catalog: 'ready', provider: 'ready', runningJob: false, outcome },
    }),
  ),
  {
    id: 'library.ready',
    viewId: 'library',
    stateId: 'ready',
    label: 'Library · ready',
    hash: '',
    seed: { catalog: 'ready', provider: 'ready', runningJob: false },
  },
  {
    id: 'library.empty',
    viewId: 'library',
    stateId: 'empty',
    label: 'Library · empty',
    hash: '',
    seed: { catalog: 'empty', provider: 'ready', runningJob: false },
  },
  {
    id: 'create.ready',
    viewId: 'create',
    stateId: 'ready',
    label: 'Create · ready',
    hash: 'recipes',
    seed: { catalog: 'ready', provider: 'ready', runningJob: false },
  },
  {
    id: 'create.workflow-open',
    viewId: 'create',
    stateId: 'workflow-open',
    label: 'Create · workflow picker',
    hash: 'recipes',
    seed: { catalog: 'ready', provider: 'ready', runningJob: false },
    overlay: 'workflow',
  },
  {
    id: 'recipe-styles.ready',
    viewId: 'recipe-styles',
    stateId: 'ready',
    label: 'Styles',
    hash: 'recipe-styles',
    seed: { catalog: 'ready', provider: 'ready', runningJob: false },
  },
  {
    id: 'recipe-cinematic.ready',
    viewId: 'recipe-cinematic',
    stateId: 'ready',
    label: 'Cinematic',
    hash: 'recipe-cinematic',
    seed: { catalog: 'ready', provider: 'ready', runningJob: false },
  },
  {
    id: 'recipe-character.ready',
    viewId: 'recipe-character',
    stateId: 'ready',
    label: 'Character sheet',
    hash: 'recipe-character',
    seed: { catalog: 'ready', provider: 'ready', runningJob: false },
  },
  {
    id: 'recipe-character-lab.ready',
    viewId: 'recipe-character-lab',
    stateId: 'ready',
    label: 'Character Lab',
    hash: 'recipe-character-lab',
    seed: { catalog: 'ready', provider: 'ready', runningJob: false },
  },
  {
    id: 'recipe-character-lab.poses',
    viewId: 'recipe-character-lab',
    stateId: 'poses',
    label: 'Character Lab · poses',
    hash: 'recipe-character-poses',
    seed: { catalog: 'ready', provider: 'ready', runningJob: false },
  },
  {
    id: 'recipe-camera.ready',
    viewId: 'recipe-camera',
    stateId: 'ready',
    label: 'Camera angles',
    hash: 'recipe-camera',
    seed: { catalog: 'ready', provider: 'ready', runningJob: false },
  },
  {
    id: 'recipe-spritesheet.ready',
    viewId: 'recipe-spritesheet',
    stateId: 'ready',
    label: 'Spritesheet',
    hash: 'recipe-spritesheet',
    seed: { catalog: 'ready', provider: 'ready', runningJob: false },
  },
  {
    id: 'recipe-sprite-atlas.ready',
    viewId: 'recipe-sprite-atlas',
    stateId: 'ready',
    label: 'Sprite Atlas',
    hash: 'recipe-sprite-atlas',
    seed: { catalog: 'ready', provider: 'ready', runningJob: false },
  },
  {
    id: 'recipe-remaster.ready',
    viewId: 'recipe-remaster',
    stateId: 'ready',
    label: 'Remaster',
    hash: 'recipe-remaster',
    seed: { catalog: 'ready', provider: 'ready', runningJob: false },
  },
  {
    id: 'recipe-timeline.ready',
    viewId: 'recipe-timeline',
    stateId: 'ready',
    label: 'Timeline',
    hash: 'recipe-timeline',
    seed: { catalog: 'ready', provider: 'ready', runningJob: false },
  },
  {
    id: 'recipe-animation-sequence.ready',
    viewId: 'recipe-animation-sequence',
    stateId: 'ready',
    label: 'Animation sequence',
    hash: 'recipe-animation-sequence',
    seed: { catalog: 'ready', provider: 'ready', runningJob: false },
  },
  {
    id: 'settings.ready',
    viewId: 'settings',
    stateId: 'ready',
    label: 'Settings',
    hash: '',
    seed: { catalog: 'ready', provider: 'ready', runningJob: false },
    overlay: 'settings',
  },
  {
    id: 'jobs.open',
    viewId: 'jobs',
    stateId: 'open',
    label: 'Jobs rail',
    hash: '',
    seed: { catalog: 'ready', provider: 'ready', runningJob: true },
    overlay: 'jobs',
  },
  {
    id: 'onboarding.ready',
    viewId: 'onboarding',
    stateId: 'ready',
    label: 'Help and setup',
    hash: '',
    seed: { catalog: 'ready', provider: 'ready', runningJob: false },
    overlay: 'onboarding',
  },
];

export function scenarioFromLocation(search = window.location.search): ReviewScenario {
  const id = new URLSearchParams(search).get('scenario') ?? 'library.ready';
  return (
    REVIEW_SCENARIOS.find((scenario) => scenario.id === id) ??
    REVIEW_SCENARIOS.find((scenario) => scenario.id === 'library.ready')!
  );
}

export function applyScenarioSeed(scenario: ReviewScenario) {
  resetDemoStore(scenario.seed);
}

async function clickWhenReady(selector: string, timeoutMs = 4000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const node = document.querySelector<HTMLElement>(selector);
    if (node) {
      node.click();
      return true;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }
  return false;
}

export async function applyScenarioChrome(scenario: ReviewScenario) {
  const nextHash = scenario.hash ? `#${scenario.hash}` : '';
  if (window.location.hash !== nextHash) {
    if (!nextHash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } else {
      window.location.hash = scenario.hash;
    }
  }

  if (scenario.overlay === 'settings') {
    await clickWhenReady('[aria-label="Open Studio Settings"]');
  }
  if (scenario.overlay === 'jobs') {
    await clickWhenReady('button[aria-label^="Open jobs"]');
  }
  if (scenario.overlay === 'onboarding') {
    const tools = document.querySelector<HTMLDetailsElement>('details');
    if (tools) tools.open = true;
    await clickWhenReady('[aria-label="Open help and setup"]');
  }
  if (scenario.overlay === 'workflow') {
    await clickWhenReady('button[aria-haspopup="listbox"]');
  }
}

export function scenarioHref(scenario: ReviewScenario) {
  const search = `?scenario=${encodeURIComponent(scenario.id)}`;
  const hash = scenario.hash ? `#${scenario.hash}` : '';
  return `${search}${hash}`;
}
