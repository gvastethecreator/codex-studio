import { existsSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { resolveLibraryPath } from '../library';
import { resolvePlatformPath } from '../platformPaths';
import type { JsonRpcMessage } from './rpcClient';

export interface AssetSource {
  type: 'inline' | 'file';
  data?: Buffer;
  sourcePath?: string;
  mimeType: string;
  origin?: 'inline' | 'generated_item' | 'saved_path';
}

export interface AssetExtractionContext {
  threadId?: string | null;
  sinceMs?: number;
}

export interface AssetExtractor {
  extract(turnNotifications: JsonRpcMessage[], context?: AssetExtractionContext): Promise<AssetSource[]>;
}

function stripAnsi(value: string) {
  return value.replace(/\u001b\[[0-9;]*m/g, '');
}

function decodeJsonPath(value: string) {
  return value
    .replace(/\\\\/g, '\\')
    .replace(/\\u001b/g, '\u001b')
    .replace(/\\r|\\n/g, '')
    .trim();
}

function mimeForPath(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'image/png';
}

function isRecentEnough(filePath: string, sinceMs?: number) {
  if (!sinceMs) return true;
  return statSync(filePath).mtimeMs >= sinceMs - 1000;
}

function extractInline(notifications: JsonRpcMessage[], jobId: string): AssetSource[] {
  for (const message of notifications) {
    const raw = stripAnsi(JSON.stringify(message));
    const match = raw.match(/data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)/i);
    if (!match) continue;
    const format = match[1].toLowerCase();
    const ext = format === 'jpeg' ? 'jpg' : format;
    const outputPath = resolveLibraryPath('assets', `${jobId}-codex.${ext}`);
    writeFileSync(outputPath, Buffer.from(match[2], 'base64'));
    return [{ type: 'file', sourcePath: outputPath, mimeType: `image/${format}`, origin: 'inline' }];
  }
  return [];
}

function extractGeneratedItems(notifications: JsonRpcMessage[], context: AssetExtractionContext): AssetSource[] {
  const generatedDir = resolvePlatformPath('codex-generated-images');
  for (let index = notifications.length - 1; index >= 0; index -= 1) {
    const message = notifications[index];
    const item = message?.params?.item;
    const notificationThreadId = message?.params?.threadId ?? context.threadId;
    if (item?.type !== 'imageGeneration' || !item.id || !notificationThreadId) continue;
    const sourcePath = path.join(generatedDir, notificationThreadId, `${item.id}.png`);
    if (!existsSync(sourcePath) || !isRecentEnough(sourcePath, context.sinceMs)) continue;
    return [{ type: 'file', sourcePath, mimeType: 'image/png', origin: 'generated_item' }];
  }
  return [];
}

function extractSavedPaths(notifications: JsonRpcMessage[], context: AssetExtractionContext): AssetSource[] {
  const raw = stripAnsi(JSON.stringify(notifications));
  const generatedImagesDir = resolvePlatformPath('codex-generated-images');
  const matches = [
    ...raw.matchAll(/[A-Z]:\\\\(?:[^"'\\r\\n]|\\\\(?!r|n))+?\.(?:png|jpg|jpeg|webp)/gi),
    ...raw.matchAll(/[A-Z]:\\(?:[^"'\\r\\n]|\\(?!r|n))+?\.(?:png|jpg|jpeg|webp)/gi),
    ...raw.matchAll(/\/(?:[^"'\r\n])+?\.(?:png|jpg|jpeg|webp)/gi),
  ];

  const candidates = [...new Set(matches.map((match) => decodeJsonPath(match[0])))]
    .filter((filePath) => !/_image_id_\.(?:png|jpg|jpeg|webp)$/i.test(filePath))
    .filter((filePath) => filePath.includes(generatedImagesDir) || /(?:generated_images)/i.test(filePath))
    .filter((filePath) => existsSync(filePath) && isRecentEnough(filePath, context.sinceMs))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);

  const sourcePath = candidates[0];
  if (!sourcePath) return [];
  return [{ type: 'file', sourcePath, mimeType: mimeForPath(sourcePath), origin: 'saved_path' }];
}

export function createAssetExtractor(jobId = 'codex'): AssetExtractor {
  return {
    async extract(turnNotifications, context = {}) {
      const strategies = [
        () => extractInline(turnNotifications, jobId),
        () => extractGeneratedItems(turnNotifications, context),
        () => extractSavedPaths(turnNotifications, context),
      ];

      for (const strategy of strategies) {
        const assets = strategy();
        if (assets.length > 0) return assets;
      }

      return [];
    },
  };
}
