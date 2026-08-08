import type { ToastMessage } from '../hooks/useToasts';

type ToastType = ToastMessage['type'];

let toasts: ToastMessage[] = [];
const listeners = new Set<() => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function emit() {
  for (const listener of listeners) listener();
}

export function getToastsSnapshot(): ToastMessage[] {
  return toasts;
}

export function subscribeToasts(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function addToastToStore(msg: string, type: ToastType = 'info', duration = 4000): string {
  const id = Math.random().toString(36).slice(2, 11);
  toasts = [...toasts, { id, message: msg, type }];
  emit();
  if (duration > 0 && typeof window !== 'undefined') {
    const timer = setTimeout(() => {
      removeToastFromStore(id);
    }, duration);
    timers.set(id, timer);
  }
  return id;
}

export function removeToastFromStore(id: string) {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  const next = toasts.filter((toast) => toast.id !== id);
  if (next.length === toasts.length) return;
  toasts = next;
  emit();
}

export function clearToastsForTests() {
  for (const timer of timers.values()) clearTimeout(timer);
  timers.clear();
  toasts = [];
  listeners.clear();
  emit();
}
