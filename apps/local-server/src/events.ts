import type { StudioEvent, UnknownStudioEvent } from '../../../packages/shared/src';

type PublishedStudioEvent = StudioEvent | UnknownStudioEvent;
type Listener = (event: PublishedStudioEvent) => void;

const listeners = new Set<Listener>();
let currentRevision = 0;

export function publishEvent(type: string, payload: unknown) {
  const event: PublishedStudioEvent = {
    type,
    payload,
    createdAt: new Date().toISOString(),
    revision: ++currentRevision,
  };
  for (const listener of listeners) {
    listener(event);
  }
  return event;
}

export function getCurrentEventRevision() {
  return currentRevision;
}

export function subscribeEvents(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
