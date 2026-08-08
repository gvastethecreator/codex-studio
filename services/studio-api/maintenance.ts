import type {
  StorageMaintenanceAuditReport,
  StorageMaintenanceCompactResult,
  StorageMaintenanceThumbnailBackfillResult,
  ToolingLogsPruneResult,
} from '../../packages/shared/src';
import { request } from './http';

export async function getStorageMaintenanceAudit() {
  return request<StorageMaintenanceAuditReport>('/api/maintenance/storage/audit');
}

export async function runStorageCompactMaintenance(
  input: { write?: boolean; vacuum?: boolean; confirm?: string | null } = {},
) {
  return request<StorageMaintenanceCompactResult>('/api/maintenance/storage/compact', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function runThumbnailBackfillMaintenance(
  input: { write?: boolean; confirm?: string | null; limit?: number } = {},
) {
  return request<StorageMaintenanceThumbnailBackfillResult>(
    '/api/maintenance/storage/thumbnails/backfill',
    { method: 'POST', body: JSON.stringify(input) },
  );
}

export async function pruneToolingLogsMaintenance(input: { retainPerTask?: number } = {}) {
  return request<ToolingLogsPruneResult>('/api/maintenance/tooling/logs/prune', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
