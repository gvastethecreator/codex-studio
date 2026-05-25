import { describe, expect, it } from 'vite-plus/test';
import { spawn } from 'node:child_process';

function runCommand(command: string) {
  return new Promise<{ stdout: string; stderr: string; exitCode: number | null }>((resolve) => {
    const child = spawn(command, {
      cwd: process.cwd(),
      shell: true,
    });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on('close', (exitCode) => {
      resolve({ stdout, stderr, exitCode });
    });
  });
}

describe('split style preset manifests script', () => {
  it('requires explicit legacy migration flag before destructive manifest rewrite', async () => {
    const { stdout, stderr, exitCode } = await runCommand(
      'bun scripts/split-style-preset-manifests.ts',
    );

    expect(stdout.trim()).toBe('');
    expect(exitCode).toBe(1);
    expect(stderr).toContain(
      '[styles:split] Refusing to overwrite granular Style Preset Manifests',
    );
    expect(stderr).toContain('bun run styles:split:legacy');
  });
});
