import { copyFile, mkdir, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { Effect } from 'effect';
import type { StyleRuntimePreset } from '../components/recipes/styles/runtimeTypes';
import { loadStyleManifestGraph, styleManifestsDir } from './style-manifest-files';
import { composeStyleRuntimePacksFromManifests } from '../components/recipes/stylePresetManifests';
import { compareStylePackIdsForDisplay } from '../components/recipes/styles/packOrdering';
import { styleCategoryImageKey } from '../lib/recipeAssetKeys';
import { runWithScriptRetry } from './runtimePolicy';

export const rootDir = process.cwd();
const homeDir = process.env.USERPROFILE?.trim() || process.env.HOME?.trim() || os.homedir();
export const recipeAssetsDir = path.join(rootDir, 'assets', 'recipes');
export const recipeCardsDir = path.join(recipeAssetsDir, 'cards');
export const recipeStylesDir = path.join(recipeAssetsDir, 'styles');
export const stylePackManifestsDir = path.join(styleManifestsDir, 'packs');
export const stylePresetManifestsDir = path.join(styleManifestsDir, 'presets');
export const categoryBasesDir = path.join(recipeStylesDir, 'category-bases');
export const defaultsDir = path.join(recipeStylesDir, 'defaults');
export const previewsDir = path.join(recipeStylesDir, 'previews');
export const RECIPE_ASSET_EXTENSION = '.webp';
export const IMAGEGEN_DENOISE_SUFFIX =
  'Apply a strong denoise pass. Use controlled grain only when it helps the preset. Avoid noisy grain, oversharpening, crunchy micro-contrast, excessive ultra-fine noise, ultra-fine detail clutter, repeated camera-in-hand, library or market corridor, fantasy hallway, studio chair, curtain, and lamp filler. Favor cleaner large shapes, smoother tonal transitions, controlled texture, readable forms, and one clear representative subject, object, material, or scene fragment.';
export const defaultStudioLibraryDir = path.join(homeDir, 'AI-Studio-Library');
export const defaultCodexHome = path.join(homeDir, '.codex');

export { styleCategoryImageKey };

export function withRecipeAssetExtension(filePath: string) {
  const parsed = path.parse(filePath);
  return path.join(parsed.dir, `${parsed.name}${RECIPE_ASSET_EXTENSION}`);
}

export function repoRelative(filePath: string) {
  return path.relative(rootDir, filePath).replaceAll(path.sep, '/');
}

export async function writeRepoWebpAsset(sourcePath: string, destinationPath: string) {
  const finalDestination = withRecipeAssetExtension(destinationPath);
  const archiveRoot =
    process.env.STYLE_DEFAULT_CARD_ARCHIVE_DIR ||
    path.join(rootDir, '.tmp', 'style-default-card-archive');
  const presetName = path.parse(finalDestination).name;
  const previousStats = await stat(finalDestination).catch(() => null);
  if (previousStats?.size) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const previousDir = path.join(archiveRoot, 'previous');
    await mkdir(previousDir, { recursive: true });
    await copyFile(finalDestination, path.join(previousDir, `${presetName}.${timestamp}.webp`));
  }

  await sharp(sourcePath).webp({ quality: 92, effort: 6 }).toFile(finalDestination);

  const destinationStats = await stat(finalDestination).catch(() => null);
  if (!destinationStats || destinationStats.size <= 0) {
    throw new Error(
      `WebP asset copy failed for ${path.basename(finalDestination)} from ${sourcePath}`,
    );
  }

  const currentDir = path.join(archiveRoot, 'current');
  await mkdir(currentDir, { recursive: true });
  await copyFile(finalDestination, path.join(currentDir, `${presetName}.webp`));

  return finalDestination;
}

export function sanitizeCategory(category?: string) {
  return category || 'General';
}

export function valueOf(style: StyleRuntimePreset['style'], ...keys: string[]) {
  for (const key of keys) {
    const value = style[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return 'Standard';
}

export function subjectForCategory(category: string) {
  const lower = category.toLowerCase();
  if (lower.includes('portrait') || lower.includes('fashion') || lower.includes('costume'))
    return 'a single adult model in a clean vertical editorial pose';
  if (lower.includes('film') || lower.includes('photography') || lower.includes('genre'))
    return 'a vertical urban documentary scene with one clear subject, architecture, foliage, fabric, glass, and atmospheric depth';
  if (lower.includes('camera'))
    return 'a vertical tabletop scene with objects at multiple scales, near detail, distant background, reflective surfaces, and geometric forms';
  if (lower.includes('lighting'))
    return 'a vertical interior scene with one figure, textured wall, glass, wood, fabric, haze, and reflective floor';
  if (lower.includes('architecture') || lower.includes('interior'))
    return 'a vertical architectural space with furniture, structural lines, natural light, materials, and human scale';
  if (lower.includes('material') || lower.includes('texture'))
    return 'a vertical close-up still life with varied surfaces, fabric, metal, stone, glass, and organic detail';
  if (
    lower.includes('anime') ||
    lower.includes('manga') ||
    lower.includes('comic') ||
    lower.includes('illustration')
  )
    return 'a vertical character-and-environment composition with one clear protagonist and readable background';
  if (lower.includes('abstract') || lower.includes('experimental'))
    return 'a vertical gallery-like composition with a central object, motion, light, color fields, texture, and negative space';
  if (lower.includes('food'))
    return 'a vertical tabletop food scene with plate, drink, utensils, fabric, and controlled highlights';
  return 'a vertical scene with one clear subject, foreground detail, midground context, background depth, varied materials, and no text';
}

async function loadPacksFromGranularManifests() {
  const { packManifests, presetManifests, graph } = await loadStyleManifestGraph();

  if (packManifests.length === 0 || presetManifests.length === 0) {
    throw new Error('Style Preset Manifests are required; legacy pack YAML is retired.');
  }

  if (!graph.valid) {
    throw new Error(`Invalid Style Preset Manifest graph:\n${graph.errors.join('\n')}`);
  }

  return composeStyleRuntimePacksFromManifests(
    packManifests.sort((a, b) => compareStylePackIdsForDisplay(a.id, b.id)),
    presetManifests.sort((a, b) => a.id.localeCompare(b.id)),
  );
}

export async function loadPacks() {
  return loadPacksFromGranularManifests();
}

export async function request<T>(pathName: string, init?: RequestInit): Promise<T> {
  const apiBase = process.env.STUDIO_API_BASE || 'http://127.0.0.1:17223';
  const attempts = Number(process.env.STUDIO_API_RETRY_ATTEMPTS || 24);

  return runWithScriptRetry(
    () =>
      Effect.tryPromise(async () => {
        const headers = new Headers(init?.headers);
        headers.set('Content-Type', 'application/json');

        const response = await fetch(`${apiBase}${pathName}`, {
          ...init,
          headers,
        });
        if (!response.ok) {
          throw new Error(
            `${init?.method || 'GET'} ${pathName} failed: ${response.status} ${await response.text()}`,
          );
        }
        return response.json() as Promise<T>;
      }),
    {
      attempts,
      delayMs: 5_000,
    },
  );
}

export function dataUrlFromBytes(bytes: Uint8Array, mimeType = 'image/png') {
  return `data:${mimeType};base64,${Buffer.from(bytes).toString('base64')}`;
}

export function appendImagegenDenoiseDirective(prompt: string) {
  return `${prompt.trim()}\n\nPOST-PROCESSING:\n${IMAGEGEN_DENOISE_SUFFIX}`;
}

const STYLE_PROMPT_NAME_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bknife\b/gi, 'seal'],
  [/\bknives\b/gi, 'seals'],
  [/\bdagger\b/gi, 'sigil'],
  [/\bdaggers\b/gi, 'sigils'],
  [/\bblade\b/gi, 'edge'],
  [/\bblades\b/gi, 'edges'],
  [/\bsacrifice\b/gi, 'rite'],
  [/\bsacrificial\b/gi, 'ceremonial'],
  [/\bblood\b/gi, 'ember'],
];

function matchReplacementCase(source: string, replacement: string) {
  if (source.toUpperCase() === source) {
    return replacement.toUpperCase();
  }
  if (source[0] && source[0] === source[0].toUpperCase()) {
    return `${replacement[0]?.toUpperCase() || ''}${replacement.slice(1)}`;
  }
  return replacement;
}

export function sanitizeStylePromptName(name: string) {
  return STYLE_PROMPT_NAME_REPLACEMENTS.reduce((value, [pattern, replacement]) => {
    return value.replace(pattern, (match) => matchReplacementCase(match, replacement));
  }, name)
    .replace(/\s+/g, ' ')
    .trim();
}
