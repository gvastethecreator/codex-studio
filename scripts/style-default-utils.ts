import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import yaml from 'js-yaml';
import type { StylePack, StylePresetDef } from '../components/recipes/styles/types';
import { styleCategoryImageKey } from '../lib/recipeAssetKeys';

export const rootDir = process.cwd();
export const recipeAssetsDir = path.join(rootDir, 'assets', 'recipes');
export const recipeCardsDir = path.join(recipeAssetsDir, 'cards');
export const recipeStylesDir = path.join(recipeAssetsDir, 'styles');
export const packsDir = path.join(rootDir, 'components', 'recipes', 'styles', 'packs');
export const categoryBasesDir = path.join(recipeStylesDir, 'category-bases');
export const defaultsDir = path.join(recipeStylesDir, 'defaults');
export const previewsDir = path.join(recipeStylesDir, 'previews');
export const RECIPE_ASSET_EXTENSION = '.webp';

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
  await sharp(sourcePath).webp({ quality: 92, effort: 6 }).toFile(finalDestination);

  const destinationStats = await stat(finalDestination).catch(() => null);
  if (!destinationStats || destinationStats.size <= 0) {
    throw new Error(
      `WebP asset copy failed for ${path.basename(finalDestination)} from ${sourcePath}`,
    );
  }

  return finalDestination;
}

export function sanitizeCategory(category?: string) {
  return category || 'General';
}

export function valueOf(style: StylePresetDef['style'], ...keys: string[]) {
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

export async function loadPacks() {
  const glob = new Bun.Glob('*.yaml');
  const packs: StylePack[] = [];
  for await (const fileName of glob.scan(packsDir)) {
    const fullPath = path.join(packsDir, fileName);
    const parsed = yaml.load(await readFile(fullPath, 'utf8')) as StylePack[];
    packs.push(...parsed);
  }
  return packs.sort((a, b) => a.id.localeCompare(b.id));
}

export async function request<T>(pathName: string, init?: RequestInit): Promise<T> {
  const apiBase = process.env.STUDIO_API_BASE || 'http://localhost:4317';
  const attempts = Number(process.env.STUDIO_API_RETRY_ATTEMPTS || 24);
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
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
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      await Bun.sleep(5000);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export function dataUrlFromBytes(bytes: Uint8Array, mimeType = 'image/png') {
  return `data:${mimeType};base64,${Buffer.from(bytes).toString('base64')}`;
}
