import type {
  ExternalOutputSourceFile,
  ImportExternalOutputSourceResult,
} from '../packages/shared/src/outputSources';
import type { Toast } from '../types';

export interface ImportOperationSummary {
  importedCount: number;
  skippedCount: number;
  importedSourceFiles: Set<string>;
  toast: {
    message: string;
    type: Toast['type'];
  };
}

export function summarizeImportOperationResult(
  result: ImportExternalOutputSourceResult,
): ImportOperationSummary {
  const importedCount = result.imported.length;
  const skippedCount = result.skipped.length;

  return {
    importedCount,
    skippedCount,
    importedSourceFiles: new Set(result.imported.map((item) => item.sourceFile)),
    toast: {
      message: `Imported ${importedCount} file${importedCount === 1 ? '' : 's'}`,
      type: skippedCount > 0 ? 'info' : 'success',
    },
  };
}

export function removeImportedOutputSourceFiles(
  files: ExternalOutputSourceFile[],
  summary: Pick<ImportOperationSummary, 'importedSourceFiles'>,
) {
  return files.filter((file) => !summary.importedSourceFiles.has(file.relativePath));
}
