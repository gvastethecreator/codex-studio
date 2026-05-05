import type { StudioEvent } from '../../../packages/shared/src';

type Listener = (event: StudioEvent) => void;

const listeners = new Set<Listener>();

export function publishEvent(type: string, payload: unknown) {
  const event: StudioEvent = {
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
