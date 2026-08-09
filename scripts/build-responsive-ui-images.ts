#!/usr/bin/env bun
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const checkOnly = process.argv.includes('--check');

const onboardingPresetIds = [
  'SP01-005',
  'SP02-001',
  'SP02-003',
  'SP02-004',
  'SP06-082',
  'SP06-095',
  'SP11-047',
  'SP11-050',
] as const;

interface ResponsiveImageJob {
  source: string;
  output: string;
  width: number;
  height: number;
  quality: number;
}

function onboardingJobs(): ResponsiveImageJob[] {
  return onboardingPresetIds.flatMap((presetId) =>
    [384, 768].map((width) => ({
      source: path.join(root, 'assets', 'recipes', 'styles', 'defaults', `${presetId}.webp`),
      output: path.join(root, 'assets', 'recipes', 'onboarding', String(width), `${presetId}.webp`),
      width,
      height: Math.round(width * 1.5),
      quality: 92,
    })),
  );
}

function recipeCardJobs(): ResponsiveImageJob[] {
  const cardsDir = path.join(root, 'assets', 'recipes', 'cards');
  const cardNames = readdirSync(cardsDir)
    .filter((name) => /^recipe-.+\.webp$/i.test(name))
    .sort();

  return cardNames.flatMap((name) =>
    [256, 512, 768].map((width) => ({
      source: path.join(cardsDir, name),
      output: path.join(cardsDir, 'responsive', String(width), name),
      width,
      height: width,
      quality: 92,
    })),
  );
}

async function renderJob(job: ResponsiveImageJob) {
  if (!existsSync(job.source)) throw new Error(`Missing responsive image source: ${job.source}`);

  const output = await sharp(job.source)
    .resize({ width: job.width, height: job.height, fit: 'fill', withoutEnlargement: true })
    .webp({ quality: job.quality, effort: 6, smartSubsample: true })
    .toBuffer();

  const metadata = await sharp(output).metadata();
  if (
    metadata.format !== 'webp' ||
    metadata.width !== job.width ||
    metadata.height !== job.height
  ) {
    throw new Error(
      `Invalid responsive output for ${job.output}: ${metadata.format} ${metadata.width}x${metadata.height}`,
    );
  }

  if (checkOnly) {
    if (!existsSync(job.output) || !readFileSync(job.output).equals(output)) {
      throw new Error(`Stale responsive image: ${path.relative(root, job.output)}`);
    }
    return output.length;
  }

  mkdirSync(path.dirname(job.output), { recursive: true });
  writeFileSync(job.output, output);
  return output.length;
}

const jobs = [...onboardingJobs(), ...recipeCardJobs()];
let outputBytes = 0;
for (const job of jobs) outputBytes += await renderJob(job);

console.log(
  `[assets:responsive] ${checkOnly ? 'verified' : 'wrote'} ${jobs.length} images, ${outputBytes} bytes`,
);
