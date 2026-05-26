import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { resolveLibraryPathFromRoot } from './library';

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const METADATA_KEY = 'codex_imagegen_params';
const JPEG_SOI = Buffer.from([0xff, 0xd8]);
const JPEG_APP1 = 0xe1;
const EXIF_HEADER = Buffer.from('Exif\0\0', 'ascii');
const XMP_HEADER = Buffer.from('http://ns.adobe.com/xap/1.0/\0', 'ascii');

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

function parseMetadataText(value: string): ImageGenMetadata {
  const parsed = JSON.parse(value) as any;
  return {
    prompt: parsed.prompt,
    negativePrompt: parsed.negative_prompt ?? parsed.negativePrompt ?? null,
    aspectRatio: parsed.aspect_ratio ?? parsed.aspectRatio ?? null,
    imageSize: parsed.image_size ?? parsed.imageSize ?? null,
    model: parsed.model,
    recipe: parsed.recipe ?? null,
    batchId: parsed.batch_id ?? parsed.batchId ?? null,
    generatedAt: parsed.generated_at ?? parsed.generatedAt,
    studioVersion: parsed.studio_version ?? parsed.studioVersion,
    libraryId: parsed.library_id ?? parsed.libraryId ?? null,
    catalogId: parsed.catalog_id ?? parsed.catalogId ?? null,
  };
}

function xmpPacket(metadata: ImageGenMetadata) {
  const escape = (value: string | null | undefined) =>
    (value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return `<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:codex="http://codex.studio/ns/imagegen/1.0/"><rdf:Description><codex:prompt>${escape(metadata.prompt)}</codex:prompt><codex:negativePrompt>${escape(metadata.negativePrompt)}</codex:negativePrompt><codex:aspectRatio>${escape(metadata.aspectRatio)}</codex:aspectRatio><codex:imageSize>${escape(metadata.imageSize)}</codex:imageSize><codex:model>${escape(metadata.model)}</codex:model><codex:recipe>${escape(metadata.recipe)}</codex:recipe><codex:batchId>${escape(metadata.batchId)}</codex:batchId><codex:generatedAt>${escape(metadata.generatedAt)}</codex:generatedAt><codex:studioVersion>${escape(metadata.studioVersion)}</codex:studioVersion><codex:libraryId>${escape(metadata.libraryId)}</codex:libraryId><codex:catalogId>${escape(metadata.catalogId)}</codex:catalogId></rdf:Description></rdf:RDF></x:xmpmeta>`;
}

function jpegMarker(marker: number, payload: Buffer) {
  if (payload.length + 2 > 0xffff)
    throw new Error('JPEG metadata payload is too large for an APP marker');
  const segment = Buffer.alloc(payload.length + 4);
  segment[0] = 0xff;
  segment[1] = marker;
  segment.writeUInt16BE(payload.length + 2, 2);
  payload.copy(segment, 4);
  return segment;
}

function buildExifPayload(metadata: ImageGenMetadata) {
  const comment = Buffer.from(`ASCII\0\0\0${metadataText(metadata)}`, 'utf8');
  const tiffLength = 8 + 2 + 12 + 4 + 2 + 12 + 4 + comment.length;
  const tiff = Buffer.alloc(tiffLength);
  tiff.write('MM', 0, 'ascii');
  tiff.writeUInt16BE(42, 2);
  tiff.writeUInt32BE(8, 4);

  const firstIfd = 8;
  const exifIfd = 8 + 2 + 12 + 4;
  const commentOffset = exifIfd + 2 + 12 + 4;

  tiff.writeUInt16BE(1, firstIfd);
  tiff.writeUInt16BE(0x8769, firstIfd + 2);
  tiff.writeUInt16BE(4, firstIfd + 4);
  tiff.writeUInt32BE(1, firstIfd + 6);
  tiff.writeUInt32BE(exifIfd, firstIfd + 10);
  tiff.writeUInt32BE(0, firstIfd + 14);

  tiff.writeUInt16BE(1, exifIfd);
  tiff.writeUInt16BE(0x9286, exifIfd + 2);
  tiff.writeUInt16BE(7, exifIfd + 4);
  tiff.writeUInt32BE(comment.length, exifIfd + 6);
  tiff.writeUInt32BE(commentOffset, exifIfd + 10);
  tiff.writeUInt32BE(0, exifIfd + 14);
  comment.copy(tiff, commentOffset);

  return Buffer.concat([EXIF_HEADER, tiff]);
}

function buildXmpPayload(metadata: ImageGenMetadata) {
  return Buffer.concat([XMP_HEADER, Buffer.from(xmpPacket(metadata), 'utf8')]);
}

function isCodexJpegApp1(payload: Buffer) {
  return (
    (payload.subarray(0, XMP_HEADER.length).equals(XMP_HEADER) &&
      payload.includes(Buffer.from('codex.studio/ns/imagegen/1.0/', 'utf8'))) ||
    (payload.subarray(0, EXIF_HEADER.length).equals(EXIF_HEADER) &&
      payload.includes(Buffer.from(METADATA_KEY, 'utf8')))
  );
}

function embedPng(filePath: string, metadata: ImageGenMetadata): EmbedResult {
  const file = readFileSync(filePath);
  if (!file.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error('Invalid PNG signature');
  }

  const chunks: Buffer[] = [PNG_SIGNATURE];
  let offset = 8;
  let inserted = false;
  const textChunk = createPngChunk(
    'tEXt',
    Buffer.from(`${METADATA_KEY}\0${metadataText(metadata)}`, 'utf8'),
  );
  const xmpChunk = createPngChunk(
    'iTXt',
    Buffer.from(`XML:com.adobe.xmp\0\0\0\0\0${xmpPacket(metadata)}`, 'utf8'),
  );

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

function embedJpeg(filePath: string, metadata: ImageGenMetadata): EmbedResult {
  const file = readFileSync(filePath);
  if (!file.subarray(0, 2).equals(JPEG_SOI)) throw new Error('Invalid JPEG signature');

  const segments: Buffer[] = [JPEG_SOI];
  const metadataSegments = [
    jpegMarker(JPEG_APP1, buildExifPayload(metadata)),
    jpegMarker(JPEG_APP1, buildXmpPayload(metadata)),
  ];
  let offset = 2;
  let inserted = false;

  while (offset < file.length) {
    if (file[offset] !== 0xff) {
      if (!inserted) {
        segments.push(...metadataSegments);
        inserted = true;
      }
      segments.push(file.subarray(offset));
      break;
    }

    const marker = file[offset + 1];
    if (marker === 0xda || marker === 0xd9) {
      if (!inserted) {
        segments.push(...metadataSegments);
        inserted = true;
      }
      segments.push(file.subarray(offset));
      break;
    }

    const length = file.readUInt16BE(offset + 2);
    const fullSegment = file.subarray(offset, offset + 2 + length);
    const payload = file.subarray(offset + 4, offset + 2 + length);
    if (marker !== JPEG_APP1 || !isCodexJpegApp1(payload)) {
      segments.push(fullSegment);
    }
    offset += 2 + length;
  }

  const output = Buffer.concat(segments);
  writeFileSync(filePath, output);
  return { filePath, bytesWritten: output.length, format: 'jpeg' };
}

function riffChunk(type: string, data: Buffer) {
  const pad = data.length % 2 === 1 ? 1 : 0;
  const chunk = Buffer.alloc(8 + data.length + pad);
  chunk.write(type, 0, 'ascii');
  chunk.writeUInt32LE(data.length, 4);
  data.copy(chunk, 8);
  return chunk;
}

function isCodexWebpChunk(type: string, data: Buffer) {
  return (
    (type === 'EXIF' && data.includes(Buffer.from(METADATA_KEY, 'utf8'))) ||
    (type === 'XMP ' && data.includes(Buffer.from('codex.studio/ns/imagegen/1.0/', 'utf8')))
  );
}

function embedWebp(filePath: string, metadata: ImageGenMetadata): EmbedResult {
  const file = readFileSync(filePath);
  if (
    file.subarray(0, 4).toString('ascii') !== 'RIFF' ||
    file.subarray(8, 12).toString('ascii') !== 'WEBP'
  ) {
    throw new Error('Invalid WebP signature');
  }

  const chunks: Buffer[] = [];
  let offset = 12;
  while (offset + 8 <= file.length) {
    const type = file.subarray(offset, offset + 4).toString('ascii');
    const length = file.readUInt32LE(offset + 4);
    const data = file.subarray(offset + 8, offset + 8 + length);
    const paddedLength = length + (length % 2);
    const fullChunk = file.subarray(offset, offset + 8 + paddedLength);
    if (!isCodexWebpChunk(type, data)) {
      if (type === 'VP8X' && data.length >= 10) {
        const updated = Buffer.from(data);
        updated[0] |= 0x0c;
        chunks.push(riffChunk(type, updated));
      } else {
        chunks.push(fullChunk);
      }
    }
    offset += 8 + paddedLength;
  }
  chunks.push(
    riffChunk('EXIF', buildExifPayload(metadata)),
    riffChunk('XMP ', Buffer.from(xmpPacket(metadata), 'utf8')),
  );

  const body = Buffer.concat([Buffer.from('WEBP', 'ascii'), ...chunks]);
  const output = Buffer.alloc(8 + body.length);
  output.write('RIFF', 0, 'ascii');
  output.writeUInt32LE(body.length, 4);
  body.copy(output, 8);
  writeFileSync(filePath, output);
  return { filePath, bytesWritten: output.length, format: 'webp' };
}

export async function embedMetadata(
  filePath: string,
  metadata: ImageGenMetadata,
): Promise<EmbedResult> {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return embedPng(filePath, metadata);
  if (ext === '.jpg' || ext === '.jpeg') return embedJpeg(filePath, metadata);
  if (ext === '.webp') return embedWebp(filePath, metadata);
  throw new Error(`Unsupported image metadata format: ${ext}`);
}

function parseExifPayload(payload: Buffer): ImageGenMetadata | null {
  if (!payload.subarray(0, EXIF_HEADER.length).equals(EXIF_HEADER)) return null;
  const text = payload.toString('utf8');
  const marker = `ASCII\0\0\0`;
  const markerOffset = text.indexOf(marker);
  if (markerOffset === -1) return null;
  const start = markerOffset + marker.length;
  const end = text.indexOf('\0', start);
  const json = end === -1 ? text.slice(start) : text.slice(start, end);
  return parseMetadataText(json);
}

function extractJpegMetadata(file: Buffer): ImageGenMetadata | null {
  if (!file.subarray(0, 2).equals(JPEG_SOI)) return null;
  let offset = 2;
  while (offset + 4 <= file.length && file[offset] === 0xff) {
    const marker = file[offset + 1];
    if (marker === 0xda || marker === 0xd9) return null;
    const length = file.readUInt16BE(offset + 2);
    const payload = file.subarray(offset + 4, offset + 2 + length);
    if (marker === JPEG_APP1) {
      const parsed = parseExifPayload(payload);
      if (parsed) return parsed;
    }
    offset += 2 + length;
  }
  return null;
}

function extractWebpMetadata(file: Buffer): ImageGenMetadata | null {
  if (
    file.subarray(0, 4).toString('ascii') !== 'RIFF' ||
    file.subarray(8, 12).toString('ascii') !== 'WEBP'
  )
    return null;
  let offset = 12;
  while (offset + 8 <= file.length) {
    const type = file.subarray(offset, offset + 4).toString('ascii');
    const length = file.readUInt32LE(offset + 4);
    const data = file.subarray(offset + 8, offset + 8 + length);
    if (type === 'EXIF') {
      const parsed = parseExifPayload(data);
      if (parsed) return parsed;
    }
    offset += 8 + length + (length % 2);
  }
  return null;
}

export async function extractMetadata(filePath: string): Promise<ImageGenMetadata | null> {
  try {
    if (!existsSync(filePath)) return null;
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') return extractJpegMetadata(readFileSync(filePath));
    if (ext === '.webp') return extractWebpMetadata(readFileSync(filePath));
    if (ext !== '.png') return null;
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
          return parseMetadataText(text.slice(METADATA_KEY.length + 1));
        }
      }
      offset += 12 + length;
    }
    return null;
  } catch {
    return null;
  }
}

export async function embedJobAssets(
  jobId: string,
  metadata: ImageGenMetadata,
  libraryDir: string,
): Promise<EmbedResult[]> {
  const assetsDir = resolveLibraryPathFromRoot(libraryDir, 'assets');
  if (!existsSync(assetsDir)) return [];
  const results: EmbedResult[] = [];
  for (const entry of await Array.fromAsync(
    new Bun.Glob(`${jobId}*.*`).scan({ cwd: assetsDir, onlyFiles: true }),
  )) {
    const filePath = path.join(assetsDir, entry);
    try {
      results.push(await embedMetadata(filePath, metadata));
    } catch {
      // Bulk migration should keep going; callers can compare result counts.
    }
  }
  return results;
}
