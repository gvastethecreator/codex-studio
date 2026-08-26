/**
 * Authoring-only sharp. Catalog Entry thumbnails and reference WebP use
 * `imagePipeline.ts` / Bun.Image. Do not import this module from that hot path.
 */
import sharp, { type OutputInfo, type OverlayOptions } from 'sharp';

export { sharp as authoringSharp };
export type { OutputInfo, OverlayOptions };

export interface AuthoringCoverFitOptions {
  width: number;
  height: number;
  matteColor: string;
}

export async function writeCoverFitFlattenedPng(
  sourcePath: string,
  destinationPath: string,
  options: AuthoringCoverFitOptions,
) {
  return sharp(sourcePath)
    .rotate()
    .resize(options.width, options.height, { fit: 'cover' })
    .flatten({ background: options.matteColor })
    .png()
    .toFile(destinationPath);
}

export async function readCoverFitFlattenedRgba(
  sourcePath: string,
  options: AuthoringCoverFitOptions,
) {
  const { data } = await sharp(sourcePath)
    .resize(options.width, options.height, { fit: 'cover' })
    .flatten({ background: options.matteColor })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return data;
}

export async function writePngFromSvg(svg: string, destinationPath: string) {
  await sharp(Buffer.from(svg)).png().toFile(destinationPath);
}
