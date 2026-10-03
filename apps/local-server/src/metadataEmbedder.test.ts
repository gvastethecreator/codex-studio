import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { embedMetadata, extractMetadata, type ImageGenMetadata } from './metadataEmbedder';

const metadata: ImageGenMetadata = {
  prompt: 'Un café junto al mar — 日本語 🦊 & <luz> $&',
  model: 'image-model-test',
  negativePrompt: 'sin letras',
  generatedAt: '2026-10-03T12:00:00.000Z',
  studioVersion: '0.0.0',
};
const foreignDescription =
  '<rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:creator>Original artist</dc:creator></rdf:Description>';
const foreignXmp = `<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">${foreignDescription}</rdf:RDF></x:xmpmeta>`;

function image() {
  return sharp({ create: { width: 13, height: 9, channels: 3, background: '#765432' } });
}

describe('image generation metadata', () => {
  let directory: string;
  beforeEach(() => {
    directory = mkdtempSync(path.join(os.tmpdir(), 'studio-metadata-'));
  });
  afterEach(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  it.each(['png', 'jpeg', 'webp'] as const)(
    'embeds Unicode in %s without changing pixels or duplicating metadata',
    async (format) => {
      const filePath = path.join(directory, `image.${format}`);
      await image().toFormat(format).toFile(filePath);
      const pixels = await sharp(readFileSync(filePath)).raw().toBuffer();
      await embedMetadata(filePath, metadata);
      expect(await extractMetadata(filePath)).toMatchObject(metadata);
      const decoded = await sharp(readFileSync(filePath)).metadata();
      expect(decoded.xmpAsString).toContain(
        '<codex:prompt>Un café junto al mar — 日本語 🦊 &amp; &lt;luz&gt; $&amp;</codex:prompt>',
      );
      expect(decoded.xmpAsString).toContain(`<codex:model>${metadata.model}</codex:model>`);
      expect(await sharp(readFileSync(filePath)).raw().toBuffer()).toEqual(pixels);

      const replacement = { ...metadata, prompt: 'Segundo café 🐈' };
      await embedMetadata(filePath, replacement);
      const written = readFileSync(filePath);
      await embedMetadata(filePath, replacement);
      expect(readFileSync(filePath)).toEqual(written);
      expect(await extractMetadata(filePath)).toMatchObject(replacement);
      expect(await sharp(readFileSync(filePath)).raw().toBuffer()).toEqual(pixels);
      expect(written.toString('utf8').match(/<codex:prompt>/g)).toHaveLength(1);
      if (format === 'png') {
        expect(written.toString('utf8')).toContain('iTXtcodex_imagegen_params\0\0\0\0\0');
      } else {
        const exif = (await sharp(readFileSync(filePath)).metadata()).exif!;
        const start = exif.indexOf(Buffer.from('ASCII\0\0\0')) + 8;
        expect(start).toBeGreaterThan(7);
        expect([...exif.subarray(start)].every((byte) => byte < 128)).toBe(true);
        expect(JSON.parse(exif.subarray(start).toString('ascii')).prompt).toBe(replacement.prompt);
        expect(written.toString('ascii').match(/ASCII\0\0\0/g)).toHaveLength(1);
      }
    },
  );

  it('adds the extended WebP header for lossless transparent images', async () => {
    const filePath = path.join(directory, 'transparent.webp');
    await sharp({ create: { width: 7, height: 11, channels: 4, background: '#12345678' } })
      .webp({ lossless: true })
      .toFile(filePath);
    const pixels = await sharp(readFileSync(filePath)).raw().toBuffer();
    expect(readFileSync(filePath).toString('ascii', 12, 16)).toBe('VP8L');
    await embedMetadata(filePath, metadata);
    const decoded = await sharp(readFileSync(filePath)).metadata();
    expect(decoded).toMatchObject({ width: 7, height: 11, hasAlpha: true });
    expect(decoded.xmpAsString).toContain(`<codex:model>${metadata.model}</codex:model>`);
    expect(await sharp(readFileSync(filePath)).raw().toBuffer()).toEqual(pixels);
  });

  it.each(['png', 'jpeg', 'webp'] as const)(
    'preserves existing EXIF and XMP in %s',
    async (format) => {
      const filePath = path.join(directory, `provider.${format}`);
      await image()
        .withExif({ IFD0: { Artist: 'Original artist' } })
        .withXmp(foreignXmp)
        .toFormat(format)
        .toFile(filePath);
      const before = await sharp(readFileSync(filePath)).metadata();
      const pixels = await sharp(readFileSync(filePath)).raw().toBuffer();
      await embedMetadata(filePath, metadata);
      const replacement = { ...metadata, prompt: 'Otra versión 🦋' };
      await embedMetadata(filePath, replacement);
      const after = await sharp(readFileSync(filePath)).metadata();
      expect(after.exif).toEqual(before.exif);
      expect(after.xmpAsString).toContain(foreignDescription);
      expect(after.xmpAsString?.match(/<codex:prompt>/g)).toHaveLength(1);
      expect(await extractMetadata(filePath)).toMatchObject(replacement);
      expect(await sharp(readFileSync(filePath)).raw().toBuffer()).toEqual(pixels);
    },
  );

  it('still reads the legacy PNG text payload', async () => {
    const filePath = path.join(directory, 'legacy.png');
    await image().png().toFile(filePath);
    const original = readFileSync(filePath);
    // The old writer stored UTF-8 JSON in tEXt; keep its reader for existing images.
    const text = Buffer.from(`codex_imagegen_params\0${JSON.stringify(metadata)}`, 'utf8');
    const chunk = Buffer.alloc(text.length + 12);
    chunk.writeUInt32BE(text.length);
    chunk.write('tEXt', 4, 'ascii');
    text.copy(chunk, 8);
    writeFileSync(
      filePath,
      Buffer.concat([original.subarray(0, -12), chunk, original.subarray(-12)]),
    );
    expect(await extractMetadata(filePath)).toMatchObject(metadata);
  });
});
