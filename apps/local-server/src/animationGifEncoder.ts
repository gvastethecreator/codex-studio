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

function buildPalette() {
  const palette: number[] = [];
  for (let index = 0; index < 256; index += 1) {
    const r = (index >> 5) & 0x07;
    const g = (index >> 2) & 0x07;
    const b = index & 0x03;
    palette.push(Math.round((r / 7) * 255));
    palette.push(Math.round((g / 7) * 255));
    palette.push(Math.round((b / 3) * 255));
  }
  return palette;
}

function quantizeFrame(frame: GifRgbaFrame, matteColor: string | null | undefined) {
  const matte = parseHexColor(matteColor);
  const indexes = new Uint8Array(frame.rgba.length / 4);
  for (let source = 0, target = 0; source < frame.rgba.length; source += 4, target += 1) {
    const alpha = frame.rgba[source + 3] / 255;
    const r = Math.round(frame.rgba[source] * alpha + matte.r * (1 - alpha));
    const g = Math.round(frame.rgba[source + 1] * alpha + matte.g * (1 - alpha));
    const b = Math.round(frame.rgba[source + 2] * alpha + matte.b * (1 - alpha));
    const r3 = Math.round((r / 255) * 7) & 0x07;
    const g3 = Math.round((g / 255) * 7) & 0x07;
    const b2 = Math.round((b / 255) * 3) & 0x03;
    indexes[target] = (r3 << 5) | (g3 << 2) | b2;
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

export function encodeGif({ width, height, frames, loop, matteColor }: EncodeGifOptions) {
  if (width <= 0 || height <= 0) throw new Error('GIF width and height must be positive.');
  if (frames.length === 0) throw new Error('GIF export requires at least one frame.');

  const expectedBytes = width * height * 4;
  for (const frame of frames) {
    if (frame.rgba.length !== expectedBytes) {
      throw new Error('GIF frame dimensions do not match the export dimensions.');
    }
  }

  const bytes: number[] = [];
  pushAscii(bytes, 'GIF89a');
  pushU16(bytes, width);
  pushU16(bytes, height);
  bytes.push(0xf7, 0x00, 0x00);
  bytes.push(...buildPalette());

  if (loop) {
    bytes.push(0x21, 0xff, 0x0b);
    pushAscii(bytes, 'NETSCAPE2.0');
    bytes.push(0x03, 0x01);
    pushU16(bytes, 0);
    bytes.push(0x00);
  }

  for (const frame of frames) {
    bytes.push(0x21, 0xf9, 0x04, 0x00);
    pushU16(bytes, Math.max(1, Math.round(frame.delayCentiseconds)));
    bytes.push(0x00, 0x00);
    bytes.push(0x2c);
    pushU16(bytes, 0);
    pushU16(bytes, 0);
    pushU16(bytes, width);
    pushU16(bytes, height);
    bytes.push(0x00);
    bytes.push(0x08);
    pushSubBlocks(bytes, lzwEncode(quantizeFrame(frame, matteColor), 8));
  }

  bytes.push(0x3b);
  return Buffer.from(bytes);
}
