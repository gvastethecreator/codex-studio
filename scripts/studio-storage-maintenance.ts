import {
  backfillStorageThumbnails,
  compactStorageInlinePayloadFields,
  readStorageMaintenanceAudit,
  type CompactStorageMaintenanceOptions,
  type ThumbnailBackfillStorageMaintenanceOptions,
} from '../apps/local-server/src/storageMaintenance';
import { getSettings } from '../apps/local-server/src/config';
import { resolveLibraryPathFromRoot } from '../apps/local-server/src/library';

export {
  backfillMissingThumbnails,
  compactInlineImagePayloads,
  readReferenceDedupeStats,
} from '../apps/local-server/src/storageMaintenance';

interface StorageArgs {
  command: 'audit' | 'compact' | 'thumbnails:backfill';
  libraryDir: string;
  dbPath: string;
  write: boolean;
  vacuum: boolean;
  confirm: string | null;
  limit: number;
}

function parseArgs(argv: string[]): StorageArgs {
  const command =
    argv[2] === 'compact'
      ? 'compact'
      : argv[2] === 'thumbnails:backfill'
        ? 'thumbnails:backfill'
        : 'audit';
  const libraryArg = argv.find((arg) => arg.startsWith('--library='));
  const dbArg = argv.find((arg) => arg.startsWith('--db='));
  const limitArg = argv.find((arg) => arg.startsWith('--limit='));
  const confirmArg = argv.find((arg) => arg.startsWith('--confirm='));
  const libraryDir = libraryArg?.slice('--library='.length) || getSettings().libraryDir;
  const dbPath =
    dbArg?.slice('--db='.length) || resolveLibraryPathFromRoot(libraryDir, 'library.sqlite');
  const parsedLimit = Number.parseInt(limitArg?.slice('--limit='.length) ?? '100', 10);

  return {
    command,
    libraryDir,
    dbPath,
    write: argv.includes('--write'),
    vacuum: argv.includes('--vacuum'),
    confirm: confirmArg?.slice('--confirm='.length) ?? null,
    limit: Number.isFinite(parsedLimit) ? Math.max(1, parsedLimit) : 100,
  };
}

export async function main(argv = Bun.argv) {
  const args = parseArgs(argv);

  if (args.command === 'compact') {
    const options: CompactStorageMaintenanceOptions = {
      libraryDir: args.libraryDir,
      dbPath: args.dbPath,
      write: args.write,
      vacuum: args.vacuum,
      confirm: args.confirm,
    };
    console.log(JSON.stringify(await compactStorageInlinePayloadFields(options), null, 2));
    return;
  }

  if (args.command === 'thumbnails:backfill') {
    const options: ThumbnailBackfillStorageMaintenanceOptions = {
      libraryDir: args.libraryDir,
      dbPath: args.dbPath,
      write: args.write,
      confirm: args.confirm,
      limit: args.limit,
    };
    console.log(JSON.stringify(await backfillStorageThumbnails(options), null, 2));
    return;
  }

  console.log(
    JSON.stringify(
      await readStorageMaintenanceAudit({ libraryDir: args.libraryDir, dbPath: args.dbPath }),
      null,
      2,
    ),
  );
}

if (import.meta.main) {
  void main();
}
