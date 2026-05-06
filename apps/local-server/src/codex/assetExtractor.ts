import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { resolveLibraryPath } from '../library';
import { resolvePlatformPath } from '../platformPaths';

export interface AssetSource {
  type: 'inline' | 'file';
  data?: Buffer;
  sourcePath?: string;
  mimeType: string;
}

export interface AssetExtractor {
  extract(turnNotifications: unknown[], threadId: string): Promise<AssetSource[]>;
}

function extractInline(notifications: unknown[], jobId: string): AssetSource[] {
  for (const message of notifications) {
    const raw = JSON.stringify(message);
    const match = raw.match(/data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)/);
    if (!match) continue;
    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const outputPath = resolveLibraryPath('assets', `${jobId}-codex.${ext}`);
    writeFileSync(outputPath, Buffer.from(match[2], 'base64'));
    return [{ type: 'file', sourcePath: outputPath, mimeType: `image/${match[1]}` }];
  }
  return [];
}

function extractGeneratedItems(notifications: any[], threadId: string): AssetSource[] {
  const generatedDir = resolvePlatformPath('codex-generated-images');
  for (let index = notifications.length - 1; index >= 0; index -= 1) {
    const item = notifications[index]?.params?.item;
    const notificationThreadId = notifications[index]?.params?.threadId ?? threadId;
    if (item?.type !== 'imageGeneration' || !item.id || !notificationThreadId) continue;
    const sourcePath = path.join(generatedDir, notificationThreadId, `${item.id}.png`);
    if (existsSync(sourcePath)) return [{ type: 'file', sourcePath, mimeType: 'image/png' }];
  }
  return [];
}

function extractSavedPaths(notifications: unknown[]): AssetSource[] {
  const raw = JSON.stringify(notifications);
  const matches = [
    ...raw.matchAll(/[A-Z]:\\\\(?:[^"'\\r\\n]|\\\\(?!r|n))+?\.(?:png|jpg|jpeg|webp)/gi),
    ...raw.matchAll(/[A-Z]:\\(?:[^"'\\r\\n]|\\(?!r|n))+?\.(?:png|jpg|jpeg|webp)/gi),
    ...raw.matchAll(/\/(?:[^"'\r\n])+?\.(?:png|jpg|jpeg|webp)/gi),
  ];
  for (const match of matches) {
    const sourcePath = match[0].replace(/\\\\/g, '\\');
    if (!existsSync(sourcePath)) continue;
    const ext = path.extname(sourcePath).toLowerCase();
    return [{ type: 'file', sourcePath, mimeType: ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'image/png' }];
  }
  return [];
}

export function createAssetExtractor(jobId = 'codex'): AssetExtractor {
  return {
    async extract(turnNotifications, threadId) {
      return extractInline(turnNotifications, jobId)[0]
        ? extractInline(turnNotifications, jobId)
        : extractGeneratedItems(turnNotifications as any[], threadId)[0]
          ? extractGeneratedItems(turnNotifications as any[], threadId)
          : extractSavedPaths(turnNotifications);
    },
  };
}
