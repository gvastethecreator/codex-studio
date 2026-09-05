import { resolveStudioApiBase } from '../studioRuntime';

export class StudioApiError extends Error {
  readonly status: number;
  readonly code: string | null;
  readonly reason: string | null;

  constructor(
    message: string,
    options: { status: number; code?: string | null; reason?: string | null },
  ) {
    super(message);
    this.name = 'StudioApiError';
    this.status = options.status;
    this.code = options.code ?? null;
    this.reason = options.reason ?? null;
  }
}

function decodeLocalStudioError(text: string, status: number) {
  const trimmed = text.trim();
  let message = trimmed || `Local studio request failed: ${status}`;
  let code: string | null = null;
  let reason: string | null = null;
  try {
    const value: unknown = JSON.parse(trimmed);
    if (value && typeof value === 'object') {
      const payload = value as Record<string, unknown>;
      if (typeof payload.error === 'string' && payload.error.trim()) message = payload.error.trim();
      else if (typeof payload.message === 'string' && payload.message.trim())
        message = payload.message.trim();
      code = typeof payload.code === 'string' ? payload.code : null;
      reason = typeof payload.reason === 'string' ? payload.reason : null;
    } else if (value === null) {
      message = `Local studio request failed: ${status}`;
    }
  } catch {
    /* Plain-text errors retain the backend message. */
  }
  return { message, code, reason };
}

export function readLocalStudioErrorMessage(text: string, status: number) {
  return decodeLocalStudioError(text, status).message;
}

/**
 * Execute a JSON request against the local studio backend.
 */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const apiBase = resolveStudioApiBase();
  const headers = new Headers(init?.headers);
  if (init?.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const { message, code, reason } = decodeLocalStudioError(
      await response.text(),
      response.status,
    );
    throw new StudioApiError(message, { status: response.status, code, reason });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getStudioApiBase() {
  return resolveStudioApiBase();
}
