import { copyFile, mkdir, rename, rm, stat } from 'node:fs/promises';
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
  'Preserve the preset native rendering language: photographic, material, macro, painting, illustration, game-art, cartoon, fashion, architecture, graphic, or abstract media are all allowed when they match the preset visual DNA. Do not convert a non-anime preset into anime, manga, big-eye cel faces, visual-novel polish, gacha framing, or generic anime character grammar unless the preset, pack, or category explicitly calls for anime, manga, visual novel, gacha, shonen, shojo, seinen, josei, moe, or isekai. Use controlled grain only when it helps the preset. Avoid noisy grain, dirty dark-color artifact buildup, crushed black blotches, flat black fill, oversharpening, crunchy micro-contrast, excessive ultra-fine noise, ugly texture chatter, low-light compression artifacts, dense mesh artifacts, chainmail-like filler texture, dense cross-hatching carpets, dirty monochrome grain, muddy black ink fields, repeated camera-in-hand, library or market corridor, fantasy hallway, studio chair, curtain, and lamp filler. Favor cleaner large shapes, smoother tonal transitions, controlled material behavior, readable forms, and one clear representative subject, object, material, character, environment, or scene fragment. When a preset asks for people, the character plus environment requirement overrides object/material fallback: keep one clear character integrated with an environment/background, and vary age, body type, crop distance, pose, role, and render lineage across neighboring cards. For human figures, including anime only when explicitly requested, prioritize readable anatomy over spectacle: clean hand count, believable fingers, stable feet, clear joints, head-neck-shoulder alignment, no fused limbs, no melted hands, no tangled instruments, no extra limbs, and simplified secondary figures when action or ensemble staging becomes complex.';
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

  const parsedDestination = path.parse(finalDestination);
  const tempDestination = path.join(
    parsedDestination.dir,
    `${parsedDestination.name}.${Date.now()}.tmp${parsedDestination.ext}`,
  );

  try {
    await sharp(sourcePath).webp({ quality: 92, effort: 6 }).toFile(tempDestination);
    await rm(finalDestination, { force: true });
    await rename(tempDestination, finalDestination);
  } catch (error) {
    await rm(tempDestination, { force: true }).catch(() => {});
    throw error;
  }

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

function graphErrorsForPack(errors: string[], packFilter: string) {
  return errors.filter(
    (error) =>
      error.includes(` ${packFilter}:`) ||
      error.includes(`for ${packFilter}:`) ||
      error.includes(`for ${packFilter} `) ||
      error.includes(`${packFilter}/`) ||
      error.includes(`"${packFilter}"`) ||
      error.includes(`'${packFilter}'`),
  );
}

async function loadPacksFromGranularManifests(packFilter?: string) {
  const { packManifests, presetManifests, graph } = await loadStyleManifestGraph(packFilter);
  const selectedPackManifests = packFilter
    ? packManifests.filter((manifest) => manifest.id === packFilter)
    : packManifests;
  const selectedPresetManifests = packFilter
    ? presetManifests.filter((manifest) => manifest.packId === packFilter)
    : presetManifests;

  if (selectedPackManifests.length === 0 || selectedPresetManifests.length === 0) {
    throw new Error('Style Preset Manifests are required; legacy pack YAML is retired.');
  }

  if (!graph.valid) {
    const relevantErrors = packFilter ? graphErrorsForPack(graph.errors, packFilter) : graph.errors;
    if (relevantErrors.length > 0) {
      throw new Error(`Invalid Style Preset Manifest graph:\n${relevantErrors.join('\n')}`);
    }
  }

  return composeStyleRuntimePacksFromManifests(
    selectedPackManifests.sort((a, b) => compareStylePackIdsForDisplay(a.id, b.id)),
    selectedPresetManifests.sort((a, b) => a.id.localeCompare(b.id)),
  );
}

export async function loadPacks(packFilter?: string) {
  return loadPacksFromGranularManifests(packFilter);
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

export function appendImagegenDenoiseDirective(
  prompt: string,
  denoiseSuffix = IMAGEGEN_DENOISE_SUFFIX,
) {
  return `${prompt.trim()}\n\nPOST-PROCESSING:\n${denoiseSuffix}\n\napply heavy denoise to the image`;
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
