/**
 * Runtime Catalog Entry thumbnails and reference WebP. Authoring cover-fit,
 * flatten, raw pixels, and SVG raster stay on `sharpAuthoringAdapter.ts`.
 */
export interface ResizeWebpOptions {
  maxEdge: number;
  quality: number;
}

export interface EncodedWebp {
  bytes: Uint8Array;
  width: number | null;
  height: number | null;
}

function getBunImage() {
  const Image = globalThis.Bun?.Image;
  if (typeof Image !== 'function') {
    throw new Error(
      'Bun.Image is required for Catalog Entry thumbnails and reference WebP conversion. Run local-server with Bun 1.3.14 or later.',
    );
  }
  return Image;
}

export async function encodeResizedWebpFromPath(
  sourcePath: string,
  destinationPath: string,
  options: ResizeWebpOptions,
) {
  const Image = getBunImage();
  await new Image(sourcePath)
    .resize(options.maxEdge, options.maxEdge, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: options.quality })
    .write(destinationPath);
}

export async function encodeResizedWebpFromBytes(
  bytes: Uint8Array,
  options: ResizeWebpOptions,
): Promise<EncodedWebp> {
  const Image = getBunImage();
  const image = new Image(bytes)
    .resize(options.maxEdge, options.maxEdge, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: options.quality });
  const encoded = await image.bytes();
  return {
    bytes: encoded,
    width: image.width ?? null,
    height: image.height ?? null,
  };
}

export async function readImageMetadata(bytes: Uint8Array) {
  const Image = getBunImage();
  return new Image(bytes).metadata();
}

export function isWebpPayload(bytes: Uint8Array) {
  return (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  );
}
