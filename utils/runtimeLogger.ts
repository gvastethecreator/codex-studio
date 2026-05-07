type RuntimeLogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Convert unknown thrown values into a readable string without assuming they
 * are always real `Error` instances.
 */
export function formatErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error == null) {
    return 'Unknown error';
  }

  if (typeof error === 'number' || typeof error === 'boolean' || typeof error === 'bigint') {
    return `${error}`;
  }

  if (typeof error === 'symbol') {
    return error.description ?? 'Unknown symbol error';
  }

  try {
    return JSON.stringify(error);
  } catch {
    return 'Non-serializable error payload';
  }
}

function writeRuntimeLog(level: RuntimeLogLevel, message: string, details?: unknown) {
  const method = console[level];
  const prefix = `[studio:${level}] ${message}`;

  if (details === undefined) {
    method(prefix);
    return;
  }

  method(prefix, details);
}

/**
 * Centralized browser/runtime logger used by UI hooks and utilities so the app
 * can avoid scattering raw `console.*` calls across the codebase.
 */
export const runtimeLogger = {
  debug(message: string, details?: unknown) {
    writeRuntimeLog('debug', message, details);
  },
  info(message: string, details?: unknown) {
    writeRuntimeLog('info', message, details);
  },
  warn(message: string, details?: unknown) {
    writeRuntimeLog('warn', message, details);
  },
  error(message: string, details?: unknown) {
    writeRuntimeLog('error', message, details);
  },
};
