import { spawn } from 'node:child_process';
import { copyFileSync, createWriteStream, mkdirSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import path from 'node:path';

type TaskStep = {
  label: string;
  command: string;
  args: string[];
  appendExtraArgs?: boolean;
  consoleMode?: 'full' | 'tail';
  tailLineCount?: number;
};

type TaskDefinition = {
  description: string;
  steps: TaskStep[];
};

const ROOT_DIR = process.cwd();
const LOG_DIR = path.resolve(ROOT_DIR, 'logs', 'tooling');
const DEFAULT_MAX_OXC_THREADS = 8;
const DEFAULT_MAX_LINT_THREADS = 8;
const DEFAULT_TAIL_LINE_COUNT = 12;

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

const FMT_THREADS = resolveToolThreads('OXFMT_THREADS', DEFAULT_MAX_OXC_THREADS);
const LINT_THREADS = resolveLintThreads();

const TASKS: Record<string, TaskDefinition> = {
  fmt: {
    description: 'Format all supported files with Oxfmt.',
    steps: [
      {
        label: 'Format',
        command: 'vp',
        args: ['fmt', '--threads', String(FMT_THREADS)],
        appendExtraArgs: true,
      },
    ],
  },
  'fmt:check': {
    description: 'Check formatting without writing files.',
    steps: [
      {
        label: 'Format Check',
        command: 'vp',
        args: ['fmt', '--threads', String(FMT_THREADS), '--check'],
        appendExtraArgs: true,
      },
    ],
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
    steps: [{ label: 'Check', command: 'vp', args: ['check'], appendExtraArgs: true }],
  },
  'check:fix': {
    description: 'Apply unified formatting and lint fixes.',
    steps: [{ label: 'Check Fix', command: 'vp', args: ['check', '--fix'], appendExtraArgs: true }],
  },
  test: {
    description: 'Run the full unit test suite with Vitest via Vite+.',
    steps: [{ label: 'Test', command: 'vp', args: ['test', 'run'], appendExtraArgs: true }],
  },
  'test:unit': {
    description: 'Run the focused fast unit suite used in iterative refactors.',
    steps: [{ label: 'Unit Test', command: 'vp', args: ['test', 'run', ...UNIT_TEST_FILES] }],
  },
  'test:coverage': {
    description: 'Run tests with coverage output.',
    steps: [
      {
        label: 'Coverage',
        command: 'vp',
        args: ['test', 'run', '--coverage'],
        appendExtraArgs: true,
      },
    ],
  },
  'build:ui': {
    description: 'Build the Vite application through Vite+.',
    steps: [
      { label: 'UI Build', command: 'vp', args: ['build'], consoleMode: 'tail' },
      {
        label: 'UI Chunk Verify',
        command: 'bun',
        args: ['run', 'scripts/report-ui-chunks.ts', '--verify'],
      },
    ],
  },
  'build:server': {
    description: 'Type-check the Bun/Hono local server build target.',
    steps: [{ label: 'Server Build', command: 'bunx', args: SERVER_TYPECHECK_ARGS }],
  },
  build: {
    description: 'Build both the UI and the local server target.',
    steps: [
      { label: 'UI Build', command: 'vp', args: ['build'], consoleMode: 'tail' },
      {
        label: 'UI Chunk Verify',
        command: 'bun',
        args: ['run', 'scripts/report-ui-chunks.ts', '--verify'],
      },
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
      {
        label: 'UI Source Verify',
        command: 'bun',
        args: ['run', 'scripts/ui-demand-surface-audit.ts'],
      },
      {
        label: 'Catalog Source Verify',
        command: 'bun',
        args: ['run', 'scripts/catalog-first-source-audit.ts'],
      },
      { label: 'Build', command: 'vp', args: ['build'], consoleMode: 'tail' },
      {
        label: 'UI Chunk Verify',
        command: 'bun',
        args: ['run', 'scripts/report-ui-chunks.ts', '--verify'],
      },
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

function appendTailLine(lines: string[], line: string, limit: number) {
  lines.push(line);

  if (lines.length > limit) {
    lines.splice(0, lines.length - limit);
  }
}

function createTailCapture(limit: number) {
  const lines: string[] = [];
  let remainder = '';

  return {
    push(chunk: string) {
      remainder += chunk;
      const parts = remainder.split(/\r?\n/);
      remainder = parts.pop() ?? '';

      for (const part of parts) {
        appendTailLine(lines, part, limit);
      }
    },
    flush() {
      if (remainder.length > 0) {
        appendTailLine(lines, remainder, limit);
        remainder = '';
      }

      return [...lines];
    },
  };
}

function printCapturedTail(step: TaskStep, lines: string[], reason: 'success' | 'failure') {
  if (lines.length === 0) {
    return;
  }

  const suffix = reason === 'success' ? 'summary' : 'last details';
  writeConsoleBanner(`${step.label} ${suffix} (full output in log)`);

  if (reason === 'success') {
    console.log(lines.join('\n'));
    return;
  }

  console.error(lines.join('\n'));
}

function resolveToolThreads(envName: string, defaultCap: number) {
  const rawValue = process.env[envName]?.trim();
  const configured = rawValue ? Number.parseInt(rawValue, 10) : Number.NaN;

  if (Number.isInteger(configured) && configured > 0) {
    return configured;
  }

  return Math.max(1, Math.min(availableParallelism() - 1, defaultCap));
}

function resolveLintThreads() {
  return resolveToolThreads('OXLINT_THREADS', DEFAULT_MAX_LINT_THREADS);
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
function getStepArgs(step: TaskStep, extraArgs: string[]) {
  return step.appendExtraArgs ? [...step.args, ...extraArgs] : step.args;
}

async function runStep(step: TaskStep, log: NodeJS.WritableStream, extraArgs: string[]) {
  const startedAt = performance.now();
  const stepArgs = getStepArgs(step, extraArgs);
  const printableCommand = `${step.command} ${stepArgs.join(' ')}`;
  const mirrorOutputToConsole = step.consoleMode !== 'tail';
  const tailCapture = createTailCapture(step.tailLineCount ?? DEFAULT_TAIL_LINE_COUNT);

  writeBanner(log, `${step.label}: ${step.command} ${stepArgs.join(' ')}`);
  writeConsoleBanner(`${step.label}: ${printableCommand}`);

  if (!mirrorOutputToConsole) {
    writeConsoleBanner(
      `${step.label}: detailed output suppressed in terminal to avoid saturation; check the log if you need the full detail.`,
    );
  }

  const child = spawn(step.command, stepArgs, {
    cwd: ROOT_DIR,
    env: process.env,
    shell: false,
  });

  child.stdout.on('data', (chunk) => {
    const text = String(chunk);

    tailCapture.push(text);

    if (mirrorOutputToConsole) {
      process.stdout.write(chunk);
    }

    log.write(chunk);
  });

  child.stderr.on('data', (chunk) => {
    const text = String(chunk);

    tailCapture.push(text);

    if (mirrorOutputToConsole) {
      process.stderr.write(chunk);
    }

    log.write(chunk);
  });

  return new Promise<void>((resolve, reject) => {
    child.on('error', reject);
    child.on('close', (code) => {
      const tailLines = tailCapture.flush();

      if (code === 0) {
        if (!mirrorOutputToConsole) {
          printCapturedTail(step, tailLines, 'success');
        }

        writeConsoleBanner(
          `${step.label} completed in ${formatDuration(performance.now() - startedAt)}`,
        );
        resolve();
        return;
      }

      if (!mirrorOutputToConsole) {
        printCapturedTail(step, tailLines, 'failure');
      }

      writeConsoleBanner(
        `${step.label} failed after ${formatDuration(performance.now() - startedAt)}`,
      );
      reject(
        new Error(`${step.command} ${stepArgs.join(' ')} exited with code ${code ?? 'unknown'}`),
      );
    });
  });
}

async function main() {
  const taskName = process.argv[2];
  const extraArgs = process.argv.slice(3);
  if (!taskName || !(taskName in TASKS)) {
    const available = Object.keys(TASKS).sort().join(', ');
    throw new Error(`Unknown tooling task "${taskName ?? ''}". Available tasks: ${available}`);
  }

  const task = TASKS[taskName];
  const acceptsExtraArgs = task.steps.some((step) => step.appendExtraArgs);
  if (extraArgs.length > 0 && !acceptsExtraArgs) {
    throw new Error(`Task "${taskName}" does not accept extra arguments: ${extraArgs.join(' ')}`);
  }

  const { runLogPath, latestLogPath } = getLogPaths(taskName);
  const log = createWriteStream(runLogPath, { flags: 'a' });

  try {
    writeConsoleBanner(`Ejecutando tarea "${taskName}"`);
    writeConsoleBanner(`Log: ${runLogPath}`);

    writeBanner(log, `Task ${taskName}`);
    log.write(`${task.description}\n`);
    if (extraArgs.length > 0) {
      log.write(`Extra args: ${extraArgs.join(' ')}\n`);
    }

    for (const step of task.steps) {
      await runStep(step, log, extraArgs);
    }

    writeBanner(log, `Task ${taskName} completed successfully`);
    writeConsoleBanner(`Tarea "${taskName}" completada`);
  } catch (error) {
    writeBanner(log, `Task ${taskName} failed`);
    log.write(`${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`);
    writeConsoleBanner(`Tarea "${taskName}" fall├│`);
    throw error;
  } finally {
    await new Promise<void>((resolve) => {
      log.end(() => resolve());
    });
    copyFileSync(runLogPath, latestLogPath);
    console.log(`\n[tooling] Log escrito en ${runLogPath}`);
  }
}

try {
  await main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\n[tooling] ${message}`);
  process.exitCode = 1;
}
