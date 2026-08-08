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

export function readLocalStudioErrorMessage(text: string, status: number) {
  const trimmed = text.trim();
  if (trimmed) {
    try {
      const payload = JSON.parse(trimmed) as {
        error?: unknown;
        message?: unknown;
        code?: unknown;
        reason?: unknown;
      };
      if (typeof payload.error === 'string' && payload.error.trim()) return payload.error.trim();
      if (typeof payload.message === 'string' && payload.message.trim()) {
        return payload.message.trim();
      }
    } catch {
      return trimmed;
    }
    return trimmed;
  }

  return `Local studio request failed: ${status}`;
}

/**
 * Execute a JSON request against the local studio backend.
 */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const apiBase = resolveStudioApiBase();
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    let code: string | null = null;
    let reason: string | null = null;
    try {
      const payload = JSON.parse(text) as { code?: unknown; reason?: unknown };
      code = typeof payload.code === 'string' ? payload.code : null;
      reason = typeof payload.reason === 'string' ? payload.reason : null;
    } catch {
      // non-JSON error body
    }
    throw new StudioApiError(readLocalStudioErrorMessage(text, response.status), {
      status: response.status,
      code,
      reason,
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getStudioApiBase() {
  return resolveStudioApiBase();
}
