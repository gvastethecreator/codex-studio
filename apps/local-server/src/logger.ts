import { appendFileSync } from 'node:fs';
import { addSystemLog } from './db';
import { publishEvent } from './events';
import { resolveLibraryPath } from './library';
import type { SystemLog } from '../../../packages/shared/src';

export function log(
  level: SystemLog['level'],
  scope: string,
  message: string,
  jobId?: string | null,
) {
  const createdAt = new Date().toISOString();
  const line = JSON.stringify({ createdAt, level, scope, message, jobId: jobId ?? null });
  const fileName =
    level === 'error' ? 'errors.log' : scope === 'worker' ? 'worker.log' : 'studio.log';
  appendFileSync(resolveLibraryPath('logs', fileName), `${line}\n`, 'utf8');
  const stored = addSystemLog({ level, scope, message, jobId });
  publishEvent('log.created', stored ?? { createdAt, level, scope, message, jobId: jobId ?? null });
}
