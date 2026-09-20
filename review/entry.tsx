import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';
import { ReviewChrome } from './ReviewChrome';
import { applyScenarioSeed, scenarioFromLocation } from './scenarios';
import '../index.css';

window.localStorage.setItem('studio-onboarding-complete', 'true');
const scenario = scenarioFromLocation();
applyScenarioSeed(scenario);
if (scenario.seed.cameraUnavailable) {
  const getContext = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'getContext')!
    .value as (this: HTMLCanvasElement, kind: string, ...args: unknown[]) => unknown;
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value(this: HTMLCanvasElement, kind: string, ...args: unknown[]) {
      return kind.includes('webgl') ? null : Reflect.apply(getContext, this, [kind, ...args]);
    },
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

ReactDOM.createRoot(rootElement).render(
  <>
    <App />
    <ReviewChrome />
  </>,
);
