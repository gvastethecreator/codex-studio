import sharp from 'sharp';
import { describe, expect, it } from 'vite-plus/test';

import { encodeGif } from './animationGifEncoder';

function createGradientFrame(width: number, height: number, phase: number) {
  const rgba = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      rgba[offset] = Math.round((x / (width - 1)) * 255);
      rgba[offset + 1] = Math.round((y / (height - 1)) * 255);
      rgba[offset + 2] = (x * 7 + y * 13 + phase) % 256;
      rgba[offset + 3] = 255;
    }
  }
  return rgba;
}

describe('animationGifEncoder', () => {
  it('encodes multiple RGBA frames into a GIF89a buffer', () => {
    const red = new Uint8Array([255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255]);
    const blue = new Uint8Array([0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255]);

    const gif = encodeGif({
      width: 2,
      height: 2,
      loop: true,
      frames: [
        { rgba: red, delayCentiseconds: 8 },
        { rgba: blue, delayCentiseconds: 8 },
      ],
    });

    expect(gif.subarray(0, 6).toString('ascii')).toBe('GIF89a');
    expect(gif.includes(Buffer.from('NETSCAPE2.0', 'ascii'))).toBe(true);
    expect(gif[gif.length - 1]).toBe(0x3b);
  });

  it('encodes nontrivial frames that animated GIF decoders can read', async () => {
    const width = 48;
    const height = 32;
    const frameCount = 2;
    const gif = encodeGif({
      width,
      height,
      loop: true,
      frames: [
        { rgba: createGradientFrame(width, height, 0), delayCentiseconds: 8 },
        { rgba: createGradientFrame(width, height, 61), delayCentiseconds: 8 },
      ],
    });

    const metadata = await sharp(gif, { animated: true }).metadata();
    expect(metadata).toMatchObject({
      format: 'gif',
      width,
      pageHeight: height,
      pages: frameCount,
      loop: 0,
      delay: [80, 80],
    });

    const { data, info } = await sharp(gif, { animated: true })
      .raw()
      .toBuffer({ resolveWithObject: true });
    expect(info).toMatchObject({ width, height: height * frameCount });
    expect(data).toHaveLength(width * height * frameCount * info.channels);
  });
});
