export interface GifRgbaFrame {
  rgba: Uint8Array;
  delayCentiseconds: number;
}

export interface EncodeGifOptions {
  width: number;
  height: number;
  frames: GifRgbaFrame[];
  loop: boolean;
  matteColor?: string;
  transparent?: boolean;
}

function parseHexColor(value: string | null | undefined) {
  const cleaned = value?.trim().replace(/^#/, '') ?? '';
  if (!/^[0-9a-f]{6}$/i.test(cleaned)) return { r: 11, g: 15, b: 20 };
  return {
    r: Number.parseInt(cleaned.slice(0, 2), 16),
    g: Number.parseInt(cleaned.slice(2, 4), 16),
    b: Number.parseInt(cleaned.slice(4, 6), 16),
  };
}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

// Colors are counted in 5-bit-per-channel bins; each bin keeps exact channel sums for its average.
const BIN_BITS = 5;
const BIN_COUNT = 1 << (BIN_BITS * 3);

function binOf(r: number, g: number, b: number) {
  return ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
}

/** Returns packed RGB, or -1 for a pixel that GIF transparency drops (alpha below 128). */
function readPixel(rgba: Uint8Array, offset: number, matte: Rgb, transparent: boolean) {
  const alpha = rgba[offset + 3]!;
  if (transparent && alpha < 128) return -1;
  const r = rgba[offset]!;
  const g = rgba[offset + 1]!;
  const b = rgba[offset + 2]!;
  if (transparent || alpha === 255) return (r << 16) | (g << 8) | b;
  const weight = alpha / 255;
  return (
    (Math.round(r * weight + matte.r * (1 - weight)) << 16) |
    (Math.round(g * weight + matte.g * (1 - weight)) << 8) |
    Math.round(b * weight + matte.b * (1 - weight))
  );
}

function buildHistogram(frames: GifRgbaFrame[], matte: Rgb, transparent: boolean) {
  const counts = new Float64Array(BIN_COUNT);
  const sums = new Float64Array(BIN_COUNT * 3);
  let hasTransparentPixels = false;
  for (const frame of frames) {
    for (let offset = 0; offset < frame.rgba.length; offset += 4) {
      const rgb = readPixel(frame.rgba, offset, matte, transparent);
      if (rgb < 0) {
        hasTransparentPixels = true;
        continue;
      }
      const r = rgb >> 16;
      const g = (rgb >> 8) & 0xff;
      const b = rgb & 0xff;
      const bin = binOf(r, g, b);
      counts[bin] += 1;
      sums[bin * 3] += r;
      sums[bin * 3 + 1] += g;
      sums[bin * 3 + 2] += b;
    }
  }
  return { counts, sums, hasTransparentPixels };
}

/** Median cut over the color bins. Images with few colors keep every color exactly. */
function medianCut(counts: Float64Array, sums: Float64Array, maxColors: number): Rgb[] {
  const channelOf = (bin: number, channel: number) => (bin >> ((2 - channel) * BIN_BITS)) & 31;
  const measure = (bins: number[]) => {
    let count = 0;
    let channel = 0;
    let range = 0;
    for (const bin of bins) count += counts[bin]!;
    for (let candidate = 0; candidate < 3; candidate += 1) {
      let min = 31;
      let max = 0;
      for (const bin of bins) {
        const value = channelOf(bin, candidate);
        if (value < min) min = value;
        if (value > max) max = value;
      }
      if (max - min > range) {
        range = max - min;
        channel = candidate;
      }
    }
    return { bins, count, channel, score: bins.length > 1 ? count * range : 0 };
  };

  const used: number[] = [];
  for (let bin = 0; bin < BIN_COUNT; bin += 1) if (counts[bin]! > 0) used.push(bin);
  if (used.length === 0) return [];
  const boxes = [measure(used)];
  while (boxes.length < maxColors) {
    let target = 0;
    for (let index = 1; index < boxes.length; index += 1) {
      if (boxes[index]!.score > boxes[target]!.score) target = index;
    }
    const box = boxes[target]!;
    if (box.score === 0) break;
    const sorted = box.bins.toSorted(
      (left, right) => channelOf(left, box.channel) - channelOf(right, box.channel),
    );
    let split = 1;
    for (let seen = counts[sorted[0]!]!; split < sorted.length - 1; split += 1) {
      if (seen >= box.count / 2) break;
      seen += counts[sorted[split]!]!;
    }
    boxes.splice(target, 1, measure(sorted.slice(0, split)), measure(sorted.slice(split)));
  }

  return boxes.map(({ bins, count }) => {
    let r = 0;
    let g = 0;
    let b = 0;
    for (const bin of bins) {
      r += sums[bin * 3]!;
      g += sums[bin * 3 + 1]!;
      b += sums[bin * 3 + 2]!;
    }
    return { r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) };
  });
}

function mapBinsToPalette(counts: Float64Array, sums: Float64Array, colors: Rgb[]) {
  const lookup = new Uint8Array(BIN_COUNT);
  for (let bin = 0; bin < BIN_COUNT; bin += 1) {
    const count = counts[bin]!;
    if (count === 0) continue;
    const r = sums[bin * 3]! / count;
    const g = sums[bin * 3 + 1]! / count;
    const b = sums[bin * 3 + 2]! / count;
    let best = 0;
    let bestDistance = Infinity;
    for (const [index, color] of colors.entries()) {
      const distance = (color.r - r) ** 2 + (color.g - g) ** 2 + (color.b - b) ** 2;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    }
    lookup[bin] = best;
  }
  return lookup;
}

function indexFrame(
  frame: GifRgbaFrame,
  matte: Rgb,
  transparent: boolean,
  lookup: Uint8Array,
  paletteOffset: number,
) {
  const indexes = new Uint8Array(frame.rgba.length / 4);
  for (let source = 0, target = 0; source < frame.rgba.length; source += 4, target += 1) {
    const rgb = readPixel(frame.rgba, source, matte, transparent);
    indexes[target] =
      rgb < 0 ? 0 : paletteOffset + lookup[binOf(rgb >> 16, (rgb >> 8) & 0xff, rgb & 0xff)]!;
  }
  return indexes;
}

function lzwEncode(indices: Uint8Array, minCodeSize = 8) {
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  const resetDictionary = () => {
    const dictionary = new Map<string, number>();
    for (let index = 0; index < clearCode; index += 1) {
      dictionary.set(String(index), index);
    }
    return dictionary;
  };

  let dictionary = resetDictionary();
  let nextCode = endCode + 1;
  let codeSize = minCodeSize + 1;
  const bytes: number[] = [];
  let bitBuffer = 0;
  let bitCount = 0;

  const writeCode = (code: number) => {
    bitBuffer |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      bytes.push(bitBuffer & 0xff);
      bitBuffer >>= 8;
      bitCount -= 8;
    }
  };

  const reset = () => {
    dictionary = resetDictionary();
    nextCode = endCode + 1;
    codeSize = minCodeSize + 1;
  };

  writeCode(clearCode);
  let prefix = String(indices[0] ?? 0);

  for (let offset = 1; offset < indices.length; offset += 1) {
    const value = indices[offset];
    const joined = `${prefix},${value}`;
    if (dictionary.has(joined)) {
      prefix = joined;
      continue;
    }

    writeCode(dictionary.get(prefix) ?? 0);
    if (nextCode < 4096) {
      dictionary.set(joined, nextCode);
      nextCode += 1;
      // The decoder adds a dictionary entry after reading the next emitted code,
      // so keep the current width for one more code at each size boundary.
      if (nextCode > 1 << codeSize && codeSize < 12) {
        codeSize += 1;
      }
    } else {
      writeCode(clearCode);
      reset();
    }
    prefix = String(value);
  }

  writeCode(dictionary.get(prefix) ?? 0);
  writeCode(endCode);
  if (bitCount > 0) bytes.push(bitBuffer & 0xff);
  return bytes;
}

function pushAscii(bytes: number[], value: string) {
  for (let index = 0; index < value.length; index += 1) {
    bytes.push(value.charCodeAt(index));
  }
}

function pushU16(bytes: number[], value: number) {
  bytes.push(value & 0xff, (value >> 8) & 0xff);
}

function pushSubBlocks(bytes: number[], data: number[]) {
  for (let offset = 0; offset < data.length; offset += 255) {
    const chunk = data.slice(offset, offset + 255);
    bytes.push(chunk.length, ...chunk);
  }
  bytes.push(0);
}

export function encodeGif({
  width,
  height,
  frames,
  loop,
  matteColor,
  transparent = false,
}: EncodeGifOptions) {
  if (width <= 0 || height <= 0) throw new Error('GIF width and height must be positive.');
  if (frames.length === 0) throw new Error('GIF export requires at least one frame.');

  const expectedBytes = width * height * 4;
  for (const frame of frames) {
    if (frame.rgba.length !== expectedBytes) {
      throw new Error('GIF frame dimensions do not match the export dimensions.');
    }
  }

  const matte = parseHexColor(matteColor);
  const { counts, sums, hasTransparentPixels } = buildHistogram(frames, matte, transparent);
  // Transparency gets its own palette slot, and only when a frame actually has a dropped pixel.
  const useTransparency = transparent && hasTransparentPixels;
  const paletteOffset = useTransparency ? 1 : 0;
  const colors = medianCut(counts, sums, 256 - paletteOffset);
  const lookup = mapBinsToPalette(counts, sums, colors);
  const palette = new Array<number>(256 * 3).fill(0);
  for (const [index, color] of colors.entries()) {
    palette.splice((index + paletteOffset) * 3, 3, color.r, color.g, color.b);
  }

  const bytes: number[] = [];
  pushAscii(bytes, 'GIF89a');
  pushU16(bytes, width);
  pushU16(bytes, height);
  bytes.push(0xf7, 0x00, 0x00);
  bytes.push(...palette);

  if (loop) {
    bytes.push(0x21, 0xff, 0x0b);
    pushAscii(bytes, 'NETSCAPE2.0');
    bytes.push(0x03, 0x01);
    pushU16(bytes, 0);
    bytes.push(0x00);
  }

  for (const frame of frames) {
    bytes.push(0x21, 0xf9, 0x04, useTransparency ? 0x09 : 0x00);
    pushU16(bytes, Math.max(1, Math.round(frame.delayCentiseconds)));
    bytes.push(0x00, 0x00);
    bytes.push(0x2c);
    pushU16(bytes, 0);
    pushU16(bytes, 0);
    pushU16(bytes, width);
    pushU16(bytes, height);
    bytes.push(0x00);
    bytes.push(0x08);
    pushSubBlocks(
      bytes,
      lzwEncode(indexFrame(frame, matte, transparent, lookup, paletteOffset), 8),
    );
  }

  bytes.push(0x3b);
  return Buffer.from(bytes);
}
