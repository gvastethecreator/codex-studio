import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { inflateSync } from 'node:zlib';

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const METADATA_KEY = 'codex_imagegen_params';
const JPEG_SOI = Buffer.from([0xff, 0xd8]);
const JPEG_APP1 = 0xe1;
const EXIF_HEADER = Buffer.from('Exif\0\0', 'ascii');
const XMP_HEADER = Buffer.from('http://ns.adobe.com/xap/1.0/\0', 'ascii');
const XMP_NAMESPACE = 'http://codex.studio/ns/imagegen/1.0/';

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

function writeImage(filePath: string, contents: Buffer) {
  const temporary = `${filePath}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temporary, contents, { flag: 'wx' });
    renameSync(temporary, filePath);
  } finally {
    rmSync(temporary, { force: true });
  }
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

function parseMetadataText(value: string): ImageGenMetadata | null {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const generatedAt = parsed.generated_at ?? parsed.generatedAt;
  const studioVersion = parsed.studio_version ?? parsed.studioVersion;
  if (
    typeof parsed.prompt !== 'string' ||
    typeof parsed.model !== 'string' ||
    typeof generatedAt !== 'string' ||
    typeof studioVersion !== 'string'
  )
    return null;
  const optional = (value: unknown) => (typeof value === 'string' ? value : null);
  return {
    prompt: parsed.prompt,
    negativePrompt: optional(parsed.negative_prompt ?? parsed.negativePrompt),
    aspectRatio: optional(parsed.aspect_ratio ?? parsed.aspectRatio),
    imageSize: optional(parsed.image_size ?? parsed.imageSize),
    model: parsed.model,
    recipe: optional(parsed.recipe),
    batchId: optional(parsed.batch_id ?? parsed.batchId),
    generatedAt,
    studioVersion,
    libraryId: optional(parsed.library_id ?? parsed.libraryId),
    catalogId: optional(parsed.catalog_id ?? parsed.catalogId),
  };
}

function xmpDescription(metadata: ImageGenMetadata) {
  const escape = (value: string | null | undefined) =>
    (value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return `<rdf:Description xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:codex="${XMP_NAMESPACE}" rdf:about=""><codex:prompt>${escape(metadata.prompt)}</codex:prompt><codex:negativePrompt>${escape(metadata.negativePrompt)}</codex:negativePrompt><codex:aspectRatio>${escape(metadata.aspectRatio)}</codex:aspectRatio><codex:imageSize>${escape(metadata.imageSize)}</codex:imageSize><codex:model>${escape(metadata.model)}</codex:model><codex:recipe>${escape(metadata.recipe)}</codex:recipe><codex:batchId>${escape(metadata.batchId)}</codex:batchId><codex:generatedAt>${escape(metadata.generatedAt)}</codex:generatedAt><codex:studioVersion>${escape(metadata.studioVersion)}</codex:studioVersion><codex:libraryId>${escape(metadata.libraryId)}</codex:libraryId><codex:catalogId>${escape(metadata.catalogId)}</codex:catalogId></rdf:Description>`;
}

function xmpPacket(metadata: ImageGenMetadata, existing?: string) {
  const description = xmpDescription(metadata);
  if (!existing) {
    return `<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">${description}</rdf:RDF></x:xmpmeta>`;
  }
  // Edit only our flat properties; retain the surrounding packet and other namespaces.
  let packet = existing;
  const namespace = `xmlns:codex="${XMP_NAMESPACE}"`;
  const inheritedNamespace = existing.match(/<rdf:RDF\b[^>]*>/)?.[0].includes(namespace);
  if (existing.includes(namespace)) {
    packet = packet.replace(
      /(<rdf:Description\b[^>]*>)([\s\S]*?)(<\/rdf:Description>)/g,
      (whole, start: string, body: string, end: string) => {
        if (!start.includes(namespace) && !inheritedNamespace) return whole;
        const remaining = body.replace(/<codex:\w+>[^<]*<\/codex:\w+>/g, '');
        if (remaining === body) return whole;
        return remaining.trim() ? `${start}${remaining}${end}` : '';
      },
    );
  }
  const closing = /<\/([\w.-]+):RDF\s*>/;
  if (!closing.test(packet)) throw new Error('Cannot preserve the existing XMP packet');
  return packet.replace(closing, (closingTag) => `${description}${closingTag}`);
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
  // EXIF's ASCII designator requires ASCII bytes, including for multilingual prompts.
  const json = metadataText(metadata).replace(
    /[\u007f-\uffff]/g,
    (character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`,
  );
  const comment = Buffer.from(`ASCII\0\0\0${json}`, 'ascii');
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

function isOwnExif(payload: Buffer) {
  if (payload.length < 58 || !parseExifPayload(payload)) return false;
  // Only replace the minimal two-IFD packet this module writes, never a provider's EXIF.
  const tiff = payload.subarray(EXIF_HEADER.length);
  return (
    tiff.toString('ascii', 0, 2) === 'MM' &&
    tiff.readUInt16BE(2) === 42 &&
    tiff.readUInt32BE(4) === 8 &&
    tiff.readUInt16BE(8) === 1 &&
    tiff.readUInt16BE(10) === 0x8769 &&
    tiff.readUInt32BE(18) === 26 &&
    tiff.readUInt16BE(26) === 1 &&
    tiff.readUInt16BE(28) === 0x9286 &&
    tiff.readUInt32BE(36) === 44 &&
    tiff.length === 44 + tiff.readUInt32BE(32)
  );
}

function pngText(type: string, data: Buffer) {
  if (type !== 'tEXt' && type !== 'zTXt' && type !== 'iTXt') return null;
  const separator = data.indexOf(0);
  if (separator < 0) return null;
  const key = data.toString('latin1', 0, separator);
  if (key !== METADATA_KEY && key !== 'XML:com.adobe.xmp') return null;
  if (type === 'tEXt') return { key, text: data.toString('utf8', separator + 1) };
  if (type === 'zTXt') {
    if (data[separator + 1] !== 0) return null;
    return {
      key,
      text: inflateSync(data.subarray(separator + 2), {
        maxOutputLength: 16 * 1024 * 1024,
      }).toString('utf8'),
    };
  }
  if (data[separator + 1] > 1 || data[separator + 2] !== 0) return null;
  const languageEnd = data.indexOf(0, separator + 3);
  const translatedEnd = languageEnd < 0 ? -1 : data.indexOf(0, languageEnd + 1);
  if (translatedEnd < 0) return null;
  const text = data.subarray(translatedEnd + 1);
  return {
    key,
    text: (data[separator + 1] === 1
      ? inflateSync(text, { maxOutputLength: 16 * 1024 * 1024 })
      : text
    ).toString('utf8'),
  };
}

function embedPng(filePath: string, metadata: ImageGenMetadata): EmbedResult {
  const file = readFileSync(filePath);
  if (!file.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error('Invalid PNG signature');
  }

  const chunks: Buffer[] = [PNG_SIGNATURE];
  let offset = 8;
  let imageIndex: number | undefined;
  let hasEnd = false;
  const textChunk = createPngChunk(
    'iTXt',
    Buffer.from(`${METADATA_KEY}\0\0\0\0\0${metadataText(metadata)}`, 'utf8'),
  );
  let existingXmp: string | undefined;

  while (offset < file.length) {
    if (offset + 12 > file.length) throw new Error('Truncated PNG chunk');
    const length = file.readUInt32BE(offset);
    if (offset + 12 + length > file.length) throw new Error('Truncated PNG chunk');
    const type = file.subarray(offset + 4, offset + 8).toString('ascii');
    const fullChunk = file.subarray(offset, offset + 12 + length);
    if (type === 'IEND') hasEnd = true;
    if (type === 'IDAT') imageIndex ??= chunks.length;
    const text = pngText(type, file.subarray(offset + 8, offset + 8 + length));
    if (text?.key === 'XML:com.adobe.xmp' && existingXmp === undefined) {
      existingXmp = text.text;
    } else if (text?.key !== METADATA_KEY) {
      chunks.push(fullChunk);
    }
    offset += 12 + length;
  }
  if (!hasEnd || imageIndex === undefined) throw new Error('PNG has no image data or IEND chunk');
  // Readers can inspect metadata without decoding IDAT, so put it before image data.
  chunks.splice(
    imageIndex,
    0,
    textChunk,
    createPngChunk(
      'iTXt',
      Buffer.from(`XML:com.adobe.xmp\0\0\0\0\0${xmpPacket(metadata, existingXmp)}`, 'utf8'),
    ),
  );

  const output = Buffer.concat(chunks);
  writeImage(filePath, output);
  return { filePath, bytesWritten: output.length, format: 'png' };
}

function embedJpeg(filePath: string, metadata: ImageGenMetadata): EmbedResult {
  const file = readFileSync(filePath);
  if (!file.subarray(0, 2).equals(JPEG_SOI)) throw new Error('Invalid JPEG signature');

  const segments: Buffer[] = [JPEG_SOI];
  let offset = 2;
  let hasExif = false;
  let wroteXmp = false;
  let imageData: Buffer | undefined;

  while (offset < file.length) {
    if (file[offset] !== 0xff) throw new Error('Invalid JPEG marker');

    const marker = file[offset + 1];
    if (marker === 0xda || marker === 0xd9) {
      imageData = file.subarray(offset);
      break;
    }

    if (offset + 4 > file.length) throw new Error('Truncated JPEG marker');
    const length = file.readUInt16BE(offset + 2);
    if (length < 2 || offset + 2 + length > file.length)
      throw new Error('Invalid JPEG marker length');
    const fullSegment = file.subarray(offset, offset + 2 + length);
    const payload = file.subarray(offset + 4, offset + 2 + length);
    if (
      marker === JPEG_APP1 &&
      payload.subarray(0, XMP_HEADER.length).equals(XMP_HEADER) &&
      !wroteXmp
    ) {
      segments.push(
        jpegMarker(
          JPEG_APP1,
          Buffer.concat([
            XMP_HEADER,
            Buffer.from(
              xmpPacket(metadata, payload.subarray(XMP_HEADER.length).toString('utf8')),
              'utf8',
            ),
          ]),
        ),
      );
      wroteXmp = true;
    } else if (marker !== JPEG_APP1 || !isOwnExif(payload)) {
      segments.push(fullSegment);
      if (marker === JPEG_APP1 && payload.subarray(0, EXIF_HEADER.length).equals(EXIF_HEADER))
        hasExif = true;
    }
    offset += 2 + length;
  }
  if (!imageData) throw new Error('JPEG has no image data');
  if (!hasExif) segments.push(jpegMarker(JPEG_APP1, buildExifPayload(metadata)));
  if (!wroteXmp)
    segments.push(
      jpegMarker(JPEG_APP1, Buffer.concat([XMP_HEADER, Buffer.from(xmpPacket(metadata), 'utf8')])),
    );
  segments.push(imageData);

  const output = Buffer.concat(segments);
  writeImage(filePath, output);
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

function webpExtendedHeader(type: string, data: Buffer) {
  const header = Buffer.alloc(10);
  header[0] = 0x0c; // EXIF and XMP.
  let width: number;
  let height: number;
  if (type === 'VP8L' && data.length >= 5 && data[0] === 0x2f) {
    const bits = data.readUInt32LE(1);
    width = (bits & 0x3fff) + 1;
    height = ((bits >>> 14) & 0x3fff) + 1;
    if ((bits >>> 28) & 1) header[0] |= 0x10;
  } else if (
    type === 'VP8 ' &&
    data.length >= 10 &&
    data.subarray(3, 6).equals(Buffer.from([0x9d, 0x01, 0x2a]))
  ) {
    width = data.readUInt16LE(6) & 0x3fff;
    height = data.readUInt16LE(8) & 0x3fff;
  } else {
    throw new Error('Invalid WebP image header');
  }
  if (!width || !height) throw new Error('Invalid WebP dimensions');
  header.writeUIntLE(width - 1, 4, 3);
  header.writeUIntLE(height - 1, 7, 3);
  return header;
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
  let extendedHeader: Buffer | undefined;
  let hasExif = false;
  let wroteXmp = false;
  if (file.readUInt32LE(4) + 8 !== file.length) throw new Error('Invalid WebP RIFF length');
  while (offset + 8 <= file.length) {
    const type = file.subarray(offset, offset + 4).toString('ascii');
    const length = file.readUInt32LE(offset + 4);
    const data = file.subarray(offset + 8, offset + 8 + length);
    const paddedLength = length + (length % 2);
    if (offset + 8 + paddedLength > file.length) throw new Error('Truncated WebP chunk');
    const fullChunk = file.subarray(offset, offset + 8 + paddedLength);
    if (type === 'VP8X') {
      if (data.length !== 10) throw new Error('Invalid WebP VP8X header');
      extendedHeader = Buffer.from(data);
      extendedHeader[0] |= 0x0c;
    } else if (type === 'XMP ' && !wroteXmp) {
      chunks.push(riffChunk(type, Buffer.from(xmpPacket(metadata, data.toString('utf8')), 'utf8')));
      wroteXmp = true;
    } else if (type !== 'EXIF' || !isOwnExif(data)) {
      chunks.push(fullChunk);
      if (type === 'EXIF') hasExif = true;
      if (!extendedHeader && (type === 'VP8 ' || type === 'VP8L')) {
        extendedHeader = webpExtendedHeader(type, data);
      }
    }
    offset += 8 + paddedLength;
  }
  if (offset !== file.length || !extendedHeader) throw new Error('Invalid WebP chunks');
  chunks.unshift(riffChunk('VP8X', extendedHeader));
  if (!hasExif) chunks.push(riffChunk('EXIF', buildExifPayload(metadata)));
  if (!wroteXmp) chunks.push(riffChunk('XMP ', Buffer.from(xmpPacket(metadata), 'utf8')));

  const body = Buffer.concat([Buffer.from('WEBP', 'ascii'), ...chunks]);
  const output = Buffer.alloc(8 + body.length);
  output.write('RIFF', 0, 'ascii');
  output.writeUInt32LE(body.length, 4);
  body.copy(output, 8);
  writeImage(filePath, output);
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

function parseXmpMetadata(packet: string): ImageGenMetadata | null {
  if (!packet.includes(`xmlns:codex="${XMP_NAMESPACE}"`)) return null;
  const entities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  const read = (key: string) => {
    const match = packet.match(new RegExp(`<codex:${key}>([^<]*)</codex:${key}>`));
    return (
      match?.[1].replace(
        /&(amp|lt|gt|quot|apos);/g,
        (_, entity: string) => entities[entity] ?? '',
      ) ?? null
    );
  };
  return parseMetadataText(
    JSON.stringify({
      prompt: read('prompt'),
      model: read('model'),
      generatedAt: read('generatedAt'),
      studioVersion: read('studioVersion'),
      negativePrompt: read('negativePrompt') || null,
      aspectRatio: read('aspectRatio') || null,
      imageSize: read('imageSize') || null,
      recipe: read('recipe') || null,
      batchId: read('batchId') || null,
      libraryId: read('libraryId') || null,
      catalogId: read('catalogId') || null,
    }),
  );
}

function extractJpegMetadata(file: Buffer): ImageGenMetadata | null {
  if (!file.subarray(0, 2).equals(JPEG_SOI)) return null;
  let offset = 2;
  let exif: ImageGenMetadata | null = null;
  while (offset + 4 <= file.length && file[offset] === 0xff) {
    const marker = file[offset + 1];
    if (marker === 0xda || marker === 0xd9) break;
    const length = file.readUInt16BE(offset + 2);
    if (length < 2 || offset + 2 + length > file.length) return null;
    const payload = file.subarray(offset + 4, offset + 2 + length);
    if (marker === JPEG_APP1) {
      if (payload.subarray(0, XMP_HEADER.length).equals(XMP_HEADER)) {
        const xmp = parseXmpMetadata(payload.subarray(XMP_HEADER.length).toString('utf8'));
        if (xmp) return xmp;
      }
      exif ??= parseExifPayload(payload);
    }
    offset += 2 + length;
  }
  return exif;
}

function extractWebpMetadata(file: Buffer): ImageGenMetadata | null {
  if (
    file.subarray(0, 4).toString('ascii') !== 'RIFF' ||
    file.subarray(8, 12).toString('ascii') !== 'WEBP'
  )
    return null;
  let offset = 12;
  let exif: ImageGenMetadata | null = null;
  while (offset + 8 <= file.length) {
    const type = file.subarray(offset, offset + 4).toString('ascii');
    const length = file.readUInt32LE(offset + 4);
    const data = file.subarray(offset + 8, offset + 8 + length);
    if (type === 'EXIF') {
      exif ??= parseExifPayload(data);
    } else if (type === 'XMP ') {
      const xmp = parseXmpMetadata(data.toString('utf8'));
      if (xmp) return xmp;
    }
    offset += 8 + length + (length % 2);
  }
  return exif;
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
      const text = pngText(type, data);
      if (text?.key === METADATA_KEY) {
        return parseMetadataText(text.text);
      }
      offset += 12 + length;
    }
    return null;
  } catch {
    return null;
  }
}
