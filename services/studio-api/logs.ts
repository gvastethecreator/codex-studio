import type { SystemLog } from '../../packages/shared/src';
import { request } from './http';

export async function listStudioLogs() {
  return request<SystemLog[]>('/api/logs');
}
