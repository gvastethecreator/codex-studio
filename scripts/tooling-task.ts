import { spawn } from 'node:child_process';
import { copyFileSync, createWriteStream, mkdirSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import path from 'node:path';

type TaskStep = {
  label: string;
  command: string;
  args: string[];
};

type TaskDefinition = {
  description: string;
  steps: TaskStep[];
};

const ROOT_DIR = process.cwd();
const LOG_DIR = path.resolve(ROOT_DIR, 'logs', 'tooling');
const DEFAULT_MAX_LINT_THREADS = 8;

const SERVER_TYPECHECK_ARGS = [
  'tsc',
  '--noEmit',
  '--pretty',
  'false',
  '--incremental',
  '--tsBuildInfoFile',
  'tmp/tsconfig.server.check.tsbuildinfo',
  '-p',
  'apps/local-server/tsconfig.json',
];

const UNIT_TEST_FILES = [
  'contexts/globalReducer.test.ts',
  'hooks/useHashRouter.test.ts',
  'lib/recipeContext.test.ts',
  'services/localStudioService.test.ts',
];

const LINT_THREADS = resolveLintThreads();

const TASKS: Record<string, TaskDefinition> = {
  fmt: {
    description: 'Format all supported files with Oxfmt.',
    steps: [{ label: 'Format', command: 'vp', args: ['fmt'] }],
  },
  'fmt:check': {
    description: 'Check formatting without writing files.',
    steps: [{ label: 'Format Check', command: 'vp', args: ['fmt', '--check'] }],
  },
  lint: {
    description: 'Run Oxlint through Vite+.',
    steps: [{ label: 'Lint', command: 'vp', args: ['lint', '--threads', String(LINT_THREADS)] }],
  },
  'lint:fix': {
    description: 'Run Oxlint autofixes through Vite+.',
    steps: [
      {
        label: 'Lint Fix',
        command: 'vp',
        args: ['lint', '--threads', String(LINT_THREADS), '--fix'],
      },
    ],
  },
  check: {
    description: 'Run unified format, lint, and type checks.',
    steps: [{ label: 'Check', command: 'vp', args: ['check'] }],
  },
  'check:fix': {
    description: 'Apply unified formatting and lint fixes.',
    steps: [{ label: 'Check Fix', command: 'vp', args: ['check', '--fix'] }],
  },
  test: {
    description: 'Run the full unit test suite with Vitest via Vite+.',
    steps: [{ label: 'Test', command: 'vp', args: ['test', 'run'] }],
  },
  'test:unit': {
    description: 'Run the focused fast unit suite used in iterative refactors.',
    steps: [{ label: 'Unit Test', command: 'vp', args: ['test', 'run', ...UNIT_TEST_FILES] }],
  },
  'test:coverage': {
    description: 'Run tests with coverage output.',
    steps: [{ label: 'Coverage', command: 'vp', args: ['test', 'run', '--coverage'] }],
  },
  'build:ui': {
    description: 'Build the Vite application through Vite+.',
    steps: [{ label: 'UI Build', command: 'vp', args: ['build'] }],
  },
  'build:server': {
    description: 'Type-check the Bun/Hono local server build target.',
    steps: [{ label: 'Server Build', command: 'bunx', args: SERVER_TYPECHECK_ARGS }],
  },
  build: {
    description: 'Build both the UI and the local server target.',
    steps: [
      { label: 'UI Build', command: 'vp', args: ['build'] },
      { label: 'Server Build', command: 'bunx', args: SERVER_TYPECHECK_ARGS },
    ],
  },
  'validate:fast': {
    description: 'Fast validation loop used during refactors.',
    steps: [
      { label: 'Focused Unit Test', command: 'vp', args: ['test', 'run', ...UNIT_TEST_FILES] },
      { label: 'Server Build', command: 'bunx', args: SERVER_TYPECHECK_ARGS },
    ],
  },
  'validate:full': {
    description: 'Full local quality gate.',
    steps: [
      { label: 'Check', command: 'vp', args: ['check'] },
      { label: 'Test', command: 'vp', args: ['test', 'run'] },
      { label: 'Build', command: 'vp', args: ['build'] },
      { label: 'Server Build', command: 'bunx', args: SERVER_TYPECHECK_ARGS },
    ],
  },
};

function safeFileName(value: string) {
  return value
    .replace(/[^a-z0-9-]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function resolveLintThreads() {
  const rawValue = process.env.OXLINT_THREADS?.trim();
  const configured = rawValue ? Number.parseInt(rawValue, 10) : Number.NaN;

  if (Number.isInteger(configured) && configured > 0) {
    return configured;
  }

  return Math.max(1, Math.min(availableParallelism() - 1, DEFAULT_MAX_LINT_THREADS));
}

function formatDuration(durationMs: number) {
  if (durationMs < 1000) {
    return `${durationMs.toFixed(0)}ms`;
  }

  return `${(durationMs / 1000).toFixed(2)}s`;
}

/**
 * Resolve the timestamped and rolling log targets for a tooling task.
 */
function getLogPaths(taskName: string) {
  mkdirSync(LOG_DIR, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeTaskName = safeFileName(taskName);

  return {
    runLogPath: path.join(LOG_DIR, `${safeTaskName}-${stamp}.log`),
    latestLogPath: path.join(LOG_DIR, `${safeTaskName}.latest.log`),
  };
}

function writeBanner(log: NodeJS.WritableStream, title: string) {
  log.write(`\n=== ${title} @ ${new Date().toISOString()} ===\n`);
}

function writeConsoleBanner(title: string) {
  console.log(`\n[tooling] ${title}`);
}

/**
 * Run one tooling step, mirroring stdout/stderr to both the terminal and the
 * persistent log file used for debugging CI-like local runs.
 */
async function runStep(step: TaskStep, log: NodeJS.WritableStream) {
  const startedAt = performance.now();
  const printableCommand = `${step.command} ${step.args.join(' ')}`;

  writeBanner(log, `${step.label}: ${step.command} ${step.args.join(' ')}`);
  writeConsoleBanner(`${step.label}: ${printableCommand}`);

  const child = spawn(step.command, step.args, {
    cwd: ROOT_DIR,
    env: process.env,
    shell: false,
  });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(chunk);
    log.write(chunk);
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(chunk);
    log.write(chunk);
  });

  return new Promise<void>((resolve, reject) => {
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        writeConsoleBanner(
          `${step.label} completado en ${formatDuration(performance.now() - startedAt)}`,
        );
        resolve();
        return;
      }

      writeConsoleBanner(
        `${step.label} falló tras ${formatDuration(performance.now() - startedAt)}`,
      );
      reject(
        new Error(`${step.command} ${step.args.join(' ')} exited with code ${code ?? 'unknown'}`),
      );
    });
  });
}

async function main() {
  const taskName = process.argv[2];
  if (!taskName || !(taskName in TASKS)) {
    const available = Object.keys(TASKS).sort().join(', ');
    throw new Error(`Unknown tooling task "${taskName ?? ''}". Available tasks: ${available}`);
  }

  const task = TASKS[taskName];
  const { runLogPath, latestLogPath } = getLogPaths(taskName);
  const log = createWriteStream(runLogPath, { flags: 'a' });

  try {
    writeConsoleBanner(`Ejecutando tarea "${taskName}"`);
    writeConsoleBanner(`Log: ${runLogPath}`);

    writeBanner(log, `Task ${taskName}`);
    log.write(`${task.description}\n`);

    for (const step of task.steps) {
      await runStep(step, log);
    }

    writeBanner(log, `Task ${taskName} completed successfully`);
    writeConsoleBanner(`Tarea "${taskName}" completada`);
  } catch (error) {
    writeBanner(log, `Task ${taskName} failed`);
    log.write(`${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`);
    writeConsoleBanner(`Tarea "${taskName}" falló`);
    throw error;
  } finally {
    await new Promise<void>((resolve) => {
      log.end(() => resolve());
    });
    copyFileSync(runLogPath, latestLogPath);
    console.log(`\n[tooling] Log escrito en ${runLogPath}`);
  }
}

await main();
