// Shared helpers for scripts that generate Studio's own recipe card assets (assets/recipes/cards).
// Style cards are generated in the cozy-styles-dev repository.
import { copyFile, mkdir, rename, rm, stat } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { Effect } from 'effect';
import { resolveUserHome } from '../apps/local-server/src/platformHome';
import { DEFAULT_STUDIO_LIBRARY_FOLDER_NAME } from '../packages/shared/src/onboardingContracts';
import { runWithScriptRetry } from './runtimePolicy';

export const rootDir = process.cwd();
const homeDir = resolveUserHome();
export const recipeCardsDir = path.join(rootDir, 'assets', 'recipes', 'cards');
export const RECIPE_ASSET_EXTENSION = '.webp';
export const IMAGEGEN_DENOISE_SUFFIX =
  'Preserve the preset native rendering language: photographic, material, macro, painting, illustration, game-art, cartoon, fashion, architecture, graphic, or abstract media are all allowed when they match the preset visual DNA. Do not convert a non-anime preset into anime, manga, big-eye cel faces, visual-novel polish, gacha framing, or generic anime character grammar unless the preset, pack, or category explicitly calls for anime, manga, visual novel, gacha, shonen, shojo, seinen, josei, moe, or isekai. Use controlled grain only when it helps the preset. Avoid noisy grain, dirty dark-color artifact buildup, crushed black blotches, flat black fill, oversharpening, crunchy micro-contrast, excessive ultra-fine noise, ugly texture chatter, low-light compression artifacts, dense mesh artifacts, chainmail-like filler texture, dense cross-hatching carpets, dirty monochrome grain, muddy black ink fields, repeated camera-in-hand, library or market corridor, fantasy hallway, studio chair, curtain, and lamp filler. Favor cleaner large shapes, smoother tonal transitions, controlled material behavior, readable forms, and one clear representative subject, object, material, character, environment, or scene fragment. When a preset asks for people, the character plus environment requirement overrides object/material fallback: keep one clear character integrated with an environment/background, and vary age, body type, crop distance, pose, role, and render lineage across neighboring cards. For human figures, including anime only when explicitly requested, prioritize readable anatomy over spectacle: clean hand count, believable fingers, stable feet, clear joints, head-neck-shoulder alignment, no fused limbs, no melted hands, no tangled instruments, no extra limbs, and simplified secondary figures when action or ensemble staging becomes complex.';
export const defaultStudioLibraryDir = path.join(homeDir, DEFAULT_STUDIO_LIBRARY_FOLDER_NAME);
export const defaultCodexHome = path.join(homeDir, '.codex');

function withRecipeAssetExtension(filePath: string) {
  const parsed = path.parse(filePath);
  return path.join(parsed.dir, `${parsed.name}${RECIPE_ASSET_EXTENSION}`);
}

export function repoRelative(filePath: string) {
  return path.relative(rootDir, filePath).replaceAll(path.sep, '/');
}

// Recipe cards keep the provider resolution and every pixel (lossless WebP).
export const RECIPE_CARD_WEBP_OPTIONS = { lossless: true, effort: 6 } as const;

export async function writeRepoWebpAsset(
  sourcePath: string,
  destinationPath: string,
  options: { archive?: boolean; exclusive?: boolean } = {},
) {
  const finalDestination = withRecipeAssetExtension(destinationPath);
  const archive = options.archive ?? true;
  const archiveRoot =
    process.env.STYLE_DEFAULT_CARD_ARCHIVE_DIR ||
    path.join(rootDir, '.tmp', 'style-default-card-archive');
  const presetName = path.parse(finalDestination).name;
  const previousStats = await stat(finalDestination).catch(() => null);
  if (archive && previousStats?.size) {
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
    await sharp(sourcePath).webp(RECIPE_CARD_WEBP_OPTIONS).toFile(tempDestination);
    if (options.exclusive) {
      await copyFile(tempDestination, finalDestination, constants.COPYFILE_EXCL);
      await rm(tempDestination, { force: true });
    } else {
      await rm(finalDestination, { force: true });
      await rename(tempDestination, finalDestination);
    }
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

  if (archive) {
    const currentDir = path.join(archiveRoot, 'current');
    await mkdir(currentDir, { recursive: true });
    await copyFile(finalDestination, path.join(currentDir, `${presetName}.webp`));
  }

  return finalDestination;
}

export class HttpStatusError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpStatusError';
  }
}

export async function request<T>(
  pathName: string,
  init?: RequestInit,
  options: { attempts?: number } = {},
): Promise<T> {
  const apiBase = process.env.STUDIO_API_BASE || 'http://127.0.0.1:17223';
  const attempts = options.attempts ?? Number(process.env.STUDIO_API_RETRY_ATTEMPTS || 24);

  const send = async () => {
    const headers = new Headers(init?.headers);
    headers.set('Content-Type', 'application/json');

    const response = await fetch(`${apiBase}${pathName}`, {
      ...init,
      headers,
    });
    if (!response.ok) {
      throw new HttpStatusError(
        response.status,
        `${init?.method || 'GET'} ${pathName} failed: ${response.status} ${await response.text()}`,
      );
    }
    return response.json() as Promise<T>;
  };

  // A single-attempt job intake must preserve the HTTP status for definite
  // rejection handling; Effect.tryPromise wraps it in a FiberFailure.
  if (attempts === 1) return send();

  return runWithScriptRetry(() => Effect.tryPromise(send), {
    attempts,
    delayMs: 5_000,
  });
}

export function appendImagegenDenoiseDirective(
  prompt: string,
  denoiseSuffix = IMAGEGEN_DENOISE_SUFFIX,
) {
  return `${prompt.trim()}\n\nPOST-PROCESSING:\n${denoiseSuffix}\n\napply heavy denoise to the image`;
}
