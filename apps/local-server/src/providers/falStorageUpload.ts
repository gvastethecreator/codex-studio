import { readFileSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { fal } from '@fal-ai/client';
import type { ProviderAssetInputRef } from './externalProviderInputs';
import type { FalAssetUploadLocalFile } from './falAssetInputs';

type ReadLocalFile = (path: string) => Uint8Array;
type UploadBlob = (file: Blob) => Promise<string>;

export interface FalLocalAssetUploaderDependencies {
  apiKey: string;
  readFile?: ReadLocalFile;
  upload?: UploadBlob;
}

const MIME_BY_EXTENSION: Record<string, string> = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

function inferMimeType(filePath: string) {
  return MIME_BY_EXTENSION[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
}

function asArrayBuffer(bytes: Uint8Array) {
  const arrayBuffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(arrayBuffer).set(bytes);
  return arrayBuffer;
}

function createFileFromLocalAsset(asset: ProviderAssetInputRef, readFile: ReadLocalFile) {
  if (!asset.localPath) {
    throw new Error(`fal.ai asset "${asset.name}" does not have a local path to upload.`);
  }

  const bytes = readFile(asset.localPath);
  return new File([asArrayBuffer(bytes)], asset.name || basename(asset.localPath), {
    type: inferMimeType(asset.localPath),
  });
}

export function createFalLocalAssetUploader({
  apiKey,
  readFile = readFileSync,
  upload,
}: FalLocalAssetUploaderDependencies): FalAssetUploadLocalFile {
  return async function uploadLocalFalAsset(asset) {
    const file = createFileFromLocalAsset(asset, readFile);

    if (upload) {
      return upload(file);
    }

    fal.config({ credentials: apiKey });
    return fal.storage.upload(file);
  };
}
