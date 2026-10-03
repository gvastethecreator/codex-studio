import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { getOutputGeneration } from './db/outputGenerations';
import type { JobLibraryContext } from '../../../packages/shared/src/types';
import { createDefaultEditableStudioSettings } from '../../../packages/shared/src/studioSettings';
import {
  formatOutputRelativePath,
  type OutputLayoutContext,
} from '../../../packages/shared/src/outputLayout';

export function assertOutputInsideRoot(root: string, target: string) {
  const relative = path.relative(root, target);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Output path must stay inside its registered directory.');
  }
  // Check existing ancestors before creating folders, including junctions on Windows.
  let ancestor = path.dirname(target);
  while (!existsSync(ancestor)) ancestor = path.dirname(ancestor);
  const realRoot = realpathSync(root);
  const realRelative = path.relative(realRoot, realpathSync(ancestor));
  if (realRelative.startsWith('..') || path.isAbsolute(realRelative)) {
    throw new Error('Output folder points outside its registered directory.');
  }
}

export function reserveOutputPath(root: string, target: string, stateRoot: string, owner: string) {
  assertOutputInsideRoot(root, target);
  mkdirSync(stateRoot, { recursive: true });
  const parsed = path.parse(target);
  for (let index = 1; index < 10000; index += 1) {
    const candidate =
      index === 1 ? target : path.join(parsed.dir, `${parsed.name}-${index}${parsed.ext}`);
    const reservation = path.join(
      stateRoot,
      `${createHash('sha256').update(candidate.toLowerCase()).digest('hex')}.json`,
    );
    if (existsSync(reservation)) {
      if (JSON.parse(readFileSync(reservation, 'utf8')).jobId === owner) return candidate;
      continue;
    }
    if (existsSync(candidate)) continue;
    try {
      writeFileSync(reservation, JSON.stringify({ jobId: owner, path: candidate }), { flag: 'wx' });
      return candidate;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    }
  }
  throw new Error('Too many files share this output name. Choose another filename template.');
}

export function captureWorkflowOutput(
  context: JobLibraryContext,
  input: OutputLayoutContext,
  allocateOutputGeneration: (ownerKey: string) => number = getOutputGeneration,
) {
  const root = context.output?.rootPath ?? path.join(context.rootPath, 'outputs');
  mkdirSync(root, { recursive: true });
  const organization =
    context.outputOrganization ?? createDefaultEditableStudioSettings().outputOrganization;
  const relative = formatOutputRelativePath(organization, {
    ...input,
    generationNumber: organization.fileNameTemplate.includes('{generation}')
      ? allocateOutputGeneration(`workflow:${input.jobId}`)
      : undefined,
    workspaceSlug: context.workspaceSlug,
  });
  return reserveOutputPath(
    root,
    path.resolve(root, relative),
    path.join(context.rootPath, '.studio', 'state', 'output-reservations'),
    input.jobId,
  );
}
