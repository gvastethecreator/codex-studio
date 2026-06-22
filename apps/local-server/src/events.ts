import type { StudioEvent, UnknownStudioEvent } from '../../../packages/shared/src';

type PublishedStudioEvent = StudioEvent | UnknownStudioEvent;
type Listener = (event: PublishedStudioEvent) => void;

const listeners = new Set<Listener>();

export function publishEvent(type: string, payload: unknown) {
  const event: PublishedStudioEvent = {
    type,
    payload,
    createdAt: new Date().toISOString(),
  };
  for (const listener of listeners) {
    listener(event);
  }
  return event;
}

export function subscribeEvents(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
