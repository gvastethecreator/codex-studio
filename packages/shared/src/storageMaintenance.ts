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
