import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const METADATA_KEY = 'codex_imagegen_params';

export interface ImageGenMetadata {
  prompt: string;
  negativePrompt?: string | null;
  aspectRatio?: string | null;
  imageSize?: string | null;
  model: string;
  recipe?: string | null;
  batchId?: string | null;
  generatedAt: string;
  studioVersion: string;
  libraryId?: string | null;
  catalogId?: string | null;
}

export interface EmbedResult {
  filePath: string;
  bytesWritten: number;
  format: 'png' | 'jpeg' | 'webp';
}

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createPngChunk(type: string, data: Buffer) {
  const typeBytes = Buffer.from(type, 'ascii');
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  typeBytes.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])), 8 + data.length);
  return chunk;
}

function metadataText(metadata: ImageGenMetadata) {
  return JSON.stringify({
    prompt: metadata.prompt,
    negative_prompt: metadata.negativePrompt ?? null,
    aspect_ratio: metadata.aspectRatio ?? null,
    image_size: metadata.imageSize ?? null,
    model: metadata.model,
    recipe: metadata.recipe ?? null,
    batch_id: metadata.batchId ?? null,
    generated_at: metadata.generatedAt,
    studio_version: metadata.studioVersion,
    library_id: metadata.libraryId ?? null,
    catalog_id: metadata.catalogId ?? null,
  });
}

function xmpPacket(metadata: ImageGenMetadata) {
  const escape = (value: string | null | undefined) =>
    (value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return `<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:codex="http://codex.studio/ns/imagegen/1.0/"><rdf:Description><codex:prompt>${escape(metadata.prompt)}</codex:prompt><codex:negativePrompt>${escape(metadata.negativePrompt)}</codex:negativePrompt><codex:aspectRatio>${escape(metadata.aspectRatio)}</codex:aspectRatio><codex:imageSize>${escape(metadata.imageSize)}</codex:imageSize><codex:model>${escape(metadata.model)}</codex:model><codex:recipe>${escape(metadata.recipe)}</codex:recipe><codex:batchId>${escape(metadata.batchId)}</codex:batchId><codex:generatedAt>${escape(metadata.generatedAt)}</codex:generatedAt><codex:studioVersion>${escape(metadata.studioVersion)}</codex:studioVersion><codex:libraryId>${escape(metadata.libraryId)}</codex:libraryId><codex:catalogId>${escape(metadata.catalogId)}</codex:catalogId></rdf:Description></rdf:RDF></x:xmpmeta>`;
}

function embedPng(filePath: string, metadata: ImageGenMetadata): EmbedResult {
  const file = readFileSync(filePath);
  if (!file.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error('Invalid PNG signature');
  }

  const chunks: Buffer[] = [PNG_SIGNATURE];
  let offset = 8;
  let inserted = false;
  const textChunk = createPngChunk('tEXt', Buffer.from(`${METADATA_KEY}\0${metadataText(metadata)}`, 'utf8'));
  const xmpChunk = createPngChunk('iTXt', Buffer.from(`XML:com.adobe.xmp\0\0\0\0\0${xmpPacket(metadata)}`, 'utf8'));

  while (offset < file.length) {
    const length = file.readUInt32BE(offset);
    const type = file.subarray(offset + 4, offset + 8).toString('ascii');
    const fullChunk = file.subarray(offset, offset + 12 + length);
    if (!inserted && type === 'IEND') {
      chunks.push(textChunk, xmpChunk);
      inserted = true;
    }
    if (type !== 'tEXt' && type !== 'iTXt') {
      chunks.push(fullChunk);
    } else {
      const text = fullChunk.toString('utf8');
      if (!text.includes(METADATA_KEY) && !text.includes('XML:com.adobe.xmp')) {
        chunks.push(fullChunk);
      }
    }
    offset += 12 + length;
  }

  const output = Buffer.concat(chunks);
  writeFileSync(filePath, output);
  return { filePath, bytesWritten: output.length, format: 'png' };
}

function sidecarPath(filePath: string) {
  return `${filePath}.codex-meta.json`;
}

function embedSidecar(filePath: string, metadata: ImageGenMetadata, format: 'jpeg' | 'webp'): EmbedResult {
  writeFileSync(sidecarPath(filePath), `${metadataText(metadata)}\n`, 'utf8');
  return { filePath, bytesWritten: readFileSync(filePath).length, format };
}

export async function embedMetadata(filePath: string, metadata: ImageGenMetadata): Promise<EmbedResult> {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return embedPng(filePath, metadata);
  if (ext === '.jpg' || ext === '.jpeg') return embedSidecar(filePath, metadata, 'jpeg');
  if (ext === '.webp') return embedSidecar(filePath, metadata, 'webp');
  throw new Error(`Unsupported image metadata format: ${ext}`);
}

export async function extractMetadata(filePath: string): Promise<ImageGenMetadata | null> {
  try {
    if (!existsSync(filePath)) return null;
    const ext = path.extname(filePath).toLowerCase();
    if (ext !== '.png') {
      const sidecar = sidecarPath(filePath);
      if (!existsSync(sidecar)) return null;
      return JSON.parse(readFileSync(sidecar, 'utf8')) as ImageGenMetadata;
    }
    const file = readFileSync(filePath);
    if (!file.subarray(0, 8).equals(PNG_SIGNATURE)) return null;
    let offset = 8;
    while (offset < file.length) {
      const length = file.readUInt32BE(offset);
      const type = file.subarray(offset + 4, offset + 8).toString('ascii');
      const data = file.subarray(offset + 8, offset + 8 + length);
      if (type === 'tEXt') {
        const text = data.toString('utf8');
        if (text.startsWith(`${METADATA_KEY}\0`)) {
          return JSON.parse(text.slice(METADATA_KEY.length + 1)) as ImageGenMetadata;
        }
      }
      offset += 12 + length;
    }
    return null;
  } catch {
    return null;
  }
}

export async function embedJobAssets(jobId: string, metadata: ImageGenMetadata, libraryDir: string): Promise<EmbedResult[]> {
  const assetsDir = path.join(libraryDir, 'assets');
  if (!existsSync(assetsDir)) return [];
  const results: EmbedResult[] = [];
  for (const entry of await Array.fromAsync(new Bun.Glob(`${jobId}*.*`).scan({ cwd: assetsDir, onlyFiles: true }))) {
    const filePath = path.join(assetsDir, entry);
    try {
      results.push(await embedMetadata(filePath, metadata));
    } catch {
      // Bulk migration should keep going; callers can compare result counts.
    }
  }
  return results;
}
