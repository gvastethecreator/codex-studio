export type StorageMaintenanceMode = 'dry-run' | 'write';

export interface StorageMaintenanceBackup {
  backupDir: string;
  files: string[];
}

export interface StorageMaintenanceDirectoryStats {
  files: number;
  bytes: number;
  formattedBytes: string;
}

export interface StorageMaintenanceDatabaseStats {
  bytes: number;
  formattedBytes: string;
  walBytes: number;
  shmBytes: number;
}

export interface StorageMaintenancePayloadFieldStats {
  table: string;
  field: string;
  rows: number;
  bytes: number;
  formattedBytes: string;
  maxBytes: number;
  formattedMaxBytes: string;
  inlineRows: number;
  inlineBytes: number;
  formattedInlineBytes: string;
}

export interface StorageMaintenanceCatalogStats {
  rows: number;
  missingThumbnails: number;
}

export interface StorageMaintenanceReferenceDedupeStats {
  files: number;
  bytes: number;
  uniqueHashes: number;
  duplicateFiles: number;
  duplicateBytes: number;
  formattedDuplicateBytes: string;
}

export interface StorageMaintenanceAuditReport {
  libraryDir: string;
  dbPath: string;
  database: StorageMaintenanceDatabaseStats;
  counts: Record<string, number>;
  payloadFields: StorageMaintenancePayloadFieldStats[];
  catalog: StorageMaintenanceCatalogStats;
  references: StorageMaintenanceReferenceDedupeStats;
  directories: Record<string, StorageMaintenanceDirectoryStats>;
}

export interface StorageMaintenanceCompactFieldResult {
  table: string;
  field: string;
  scannedRows: number;
  changedRows: number;
  replacements: number;
  omittedBytes: number;
  formattedOmittedBytes: string;
  recoverablePayloads: number;
  nonRecoverablePayloads: number;
  wrote: boolean;
}

export interface StorageMaintenanceCompactResult {
  libraryDir: string;
  dbPath: string;
  mode: StorageMaintenanceMode;
  backup: StorageMaintenanceBackup | null;
  vacuumRan: boolean;
  results: StorageMaintenanceCompactFieldResult[];
}

export interface StorageMaintenanceThumbnailBackfillResult {
  libraryDir: string;
  dbPath: string;
  backup: StorageMaintenanceBackup | null;
  mode: StorageMaintenanceMode;
  limit: number;
  scannedRows: number;
  plannedRows: number;
  missingSourceFiles: number;
  wroteRows: number;
  errors: number;
}

export interface ToolingLogsPruneResult {
  logDir: string;
  retainPerTask: number;
  pruned: number;
}

export type StorageRepairPlanItemKind =
  | 'inline_payload_compaction'
  | 'thumbnail_backfill'
  | 'reference_dedupe'
  | 'tooling_log_prune';

export type StorageRepairPlanSeverity = 'info' | 'warning';

export interface StorageRepairPlanItem {
  id: string;
  kind: StorageRepairPlanItemKind;
  severity: StorageRepairPlanSeverity;
  title: string;
  detail: string;
  count: number;
  bytes: number;
  command: string;
  destructive: boolean;
}

export interface StorageRepairPlan {
  libraryDir: string;
  generatedAt: string;
  items: StorageRepairPlanItem[];
  summary: {
    itemCount: number;
    warningCount: number;
    totalBytes: number;
  };
}

export function createStorageRepairPlanFromAudit(
  audit: StorageMaintenanceAuditReport,
  now = new Date().toISOString(),
): StorageRepairPlan {
  const items: StorageRepairPlanItem[] = [];
  const inlineRows = audit.payloadFields.reduce((total, field) => total + field.inlineRows, 0);
  const inlineBytes = audit.payloadFields.reduce((total, field) => total + field.inlineBytes, 0);

  if (inlineRows > 0) {
    items.push({
      id: 'inline-payload-compaction',
      kind: 'inline_payload_compaction',
      severity: 'warning',
      title: 'Compact inline image payloads',
      detail: `${inlineRows} row${inlineRows === 1 ? '' : 's'} still contain inline image payloads.`,
      count: inlineRows,
      bytes: inlineBytes,
      command: 'bun run storage:compact -- --write --confirm=compact-inline-payloads',
      destructive: false,
    });
  }

  if (audit.catalog.missingThumbnails > 0) {
    items.push({
      id: 'thumbnail-backfill',
      kind: 'thumbnail_backfill',
      severity: 'warning',
      title: 'Backfill missing catalog thumbnails',
      detail: `${audit.catalog.missingThumbnails} catalog row${
        audit.catalog.missingThumbnails === 1 ? '' : 's'
      } need thumbnail variants.`,
      count: audit.catalog.missingThumbnails,
      bytes: 0,
      command: 'bun run storage:thumbnails:backfill -- --write --confirm=backfill-thumbnails',
      destructive: false,
    });
  }

  if (audit.references.duplicateFiles > 0) {
    items.push({
      id: 'reference-dedupe',
      kind: 'reference_dedupe',
      severity: 'info',
      title: 'Review duplicate reference files',
      detail: `${audit.references.duplicateFiles} duplicate reference file${
        audit.references.duplicateFiles === 1 ? '' : 's'
      } were detected.`,
      count: audit.references.duplicateFiles,
      bytes: audit.references.duplicateBytes,
      command: 'bun run storage:audit',
      destructive: false,
    });
  }

  const toolingLogs = audit.directories.toolingLogs;
  if (toolingLogs && toolingLogs.files > 0) {
    items.push({
      id: 'tooling-log-prune',
      kind: 'tooling_log_prune',
      severity: 'info',
      title: 'Prune retained tooling logs',
      detail: `${toolingLogs.files} tooling log file${toolingLogs.files === 1 ? '' : 's'} are retained.`,
      count: toolingLogs.files,
      bytes: toolingLogs.bytes,
      command: 'bun run tooling:logs:prune',
      destructive: false,
    });
  }

  return {
    libraryDir: audit.libraryDir,
    generatedAt: now,
    items,
    summary: {
      itemCount: items.length,
      warningCount: items.filter((item) => item.severity === 'warning').length,
      totalBytes: items.reduce((total, item) => total + item.bytes, 0),
    },
  };
}
