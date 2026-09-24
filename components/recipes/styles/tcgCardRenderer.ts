import { TCG_FINISHES } from './tcgComponentModel';
import type { TcgFinish, TcgLayout } from './tcgComponentModel';

export const TCG_CARD_WIDTH = 720;
export const TCG_CARD_HEIGHT = 1008;

export interface TcgCardDetails {
  name: string;
  type: string;
  rules: string;
}

export interface TcgArtworkSource extends TcgCardDetails {
  src: string | null;
}

export interface TcgRenderInput {
  layoutId: TcgLayout['id'];
  finishId: TcgFinish['id'];
  artwork: TcgArtworkSource[];
  masks: Record<string, string | undefined>;
  activeFace?: number;
  panoramaColumns?: 2 | 3;
}

export interface TcgRenderOutput {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  missingMaskKeys: string[];
  failedArtworkSlots: number[];
  failedMaskKeys: string[];
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Palette {
  paper: string;
  ink: string;
  muted: string;
  line: string;
  accent: string;
  artField: string;
}

const PALETTE: Palette = {
  paper: '#f4f1e9',
  ink: '#20252b',
  muted: '#646c73',
  line: '#9da3a6',
  accent: '#786342',
  artField: '#dce0e1',
};

const imageCache = new Map<string, Promise<HTMLImageElement | null>>();

export function getRequiredTcgMasks(
  finishId: TcgFinish['id'],
  layoutId: TcgLayout['id'],
): string[] {
  const finish = TCG_FINISHES.find((entry) => entry.id === finishId);
  const maskKeys = finish ? [...finish.masks] : [];
  if (layoutId === 'TCG-L005') maskKeys.push('subjectMask', 'occlusionMask');
  return [...new Set(maskKeys)];
}

export function getRequiredTcgArtworkCount(layoutId: TcgLayout['id']): number {
  if (layoutId === 'TCG-L006' || layoutId === 'TCG-L007' || layoutId === 'TCG-L009') return 2;
  if (layoutId === 'TCG-L008') return 4;
  return 1;
}

export async function renderTcgComposition(input: TcgRenderInput): Promise<TcgRenderOutput> {
  const { width, height } = getCompositionSize(input.layoutId, input.panoramaColumns ?? 2);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('No se pudo crear el lienzo de composición.');

  const requiredMaskKeys = getRequiredTcgMasks(input.finishId, input.layoutId);
  const missingMaskKeys = requiredMaskKeys.filter((key) => !input.masks[key]);
  const [artImages, loadedMasks] = await Promise.all([
    Promise.all(input.artwork.map((entry) => loadImage(entry.src))),
    Promise.all(
      requiredMaskKeys.map(
        async (key) => [key, await loadImage(input.masks[key] ?? null)] as const,
      ),
    ),
  ]);
  const failedArtworkSlots = input.artwork.flatMap((entry, index) =>
    entry.src && !artImages[index] ? [index] : [],
  );
  const maskImages = new Map(loadedMasks);
  const failedMaskKeys = requiredMaskKeys.filter((key) => input.masks[key] && !maskImages.get(key));

  drawLayout(context, input, artImages, maskImages, width, height);
  const finish = TCG_FINISHES.find((entry) => entry.id === input.finishId);
  if (finish && requiredMaskKeys.every((key) => maskImages.has(key))) {
    drawFinish(context, finish, maskImages, width, height);
  }

  return { canvas, width, height, missingMaskKeys, failedArtworkSlots, failedMaskKeys };
}

function getCompositionSize(layoutId: TcgLayout['id'], panoramaColumns: 2 | 3) {
  if (layoutId === 'TCG-L007') return { width: TCG_CARD_WIDTH * 2, height: TCG_CARD_HEIGHT };
  if (layoutId === 'TCG-L008') {
    const rows = Math.ceil(4 / panoramaColumns);
    return { width: TCG_CARD_WIDTH * panoramaColumns, height: TCG_CARD_HEIGHT * rows };
  }
  return { width: TCG_CARD_WIDTH, height: TCG_CARD_HEIGHT };
}

async function loadImage(src: string | null | undefined): Promise<HTMLImageElement | null> {
  if (!src) return null;
  const cacheable = !src.startsWith('data:') && !src.startsWith('blob:');
  const cached = cacheable ? imageCache.get(src) : undefined;
  if (cached) return cached;

  const promise = new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    if (cacheable) image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
    if (typeof image.decode === 'function') {
      image
        .decode()
        .then(() => resolve(image))
        .catch(() => undefined);
    }
  });

  if (cacheable) imageCache.set(src, promise);
  if (imageCache.size > 32) {
    const oldestKey = imageCache.keys().next().value;
    if (oldestKey) imageCache.delete(oldestKey);
  }
  const image = await promise;
  if (!image) imageCache.delete(src);
  return image;
}

function drawLayout(
  context: CanvasRenderingContext2D,
  input: TcgRenderInput,
  artwork: Array<HTMLImageElement | null>,
  masks: Map<string, HTMLImageElement | null>,
  width: number,
  height: number,
) {
  if (input.layoutId === 'TCG-L012') {
    drawImageOrPlaceholder(context, artwork[0] ?? null, { x: 0, y: 0, width, height });
    return;
  }

  if (input.layoutId === 'TCG-L006') {
    drawSplitNarrative(context, input.artwork, artwork, width, height);
    return;
  }

  if (input.layoutId === 'TCG-L007') {
    for (let index = 0; index < 2; index += 1) {
      drawSpreadCard(
        context,
        { x: index * TCG_CARD_WIDTH, y: 0, width: TCG_CARD_WIDTH, height: TCG_CARD_HEIGHT },
        artwork[index] ?? null,
        input.artwork[index],
        index,
      );
    }
    context.strokeStyle = '#464b4f';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(TCG_CARD_WIDTH, 24);
    context.lineTo(TCG_CARD_WIDTH, TCG_CARD_HEIGHT - 24);
    context.stroke();
    return;
  }

  if (input.layoutId === 'TCG-L008') {
    const columns = input.panoramaColumns ?? 2;
    for (let index = 0; index < 4; index += 1) {
      const column = index % columns;
      const row = Math.floor(index / columns);
      drawGridCard(
        context,
        {
          x: column * TCG_CARD_WIDTH,
          y: row * TCG_CARD_HEIGHT,
          width: TCG_CARD_WIDTH,
          height: TCG_CARD_HEIGHT,
        },
        artwork[index] ?? null,
        input.artwork[index],
      );
    }
    return;
  }

  const selectedFace = input.layoutId === 'TCG-L009' ? Math.min(input.activeFace ?? 0, 1) : 0;
  const art = artwork[selectedFace] ?? null;
  const details = input.artwork[selectedFace] ?? emptyDetails();

  if (input.layoutId === 'TCG-L005') {
    drawFrameBreak(context, art, details, artwork, masks, width, height);
    return;
  }

  drawSingleCard(context, input.layoutId, art, details, width, height);
}

function drawSingleCard(
  context: CanvasRenderingContext2D,
  layoutId: TcgLayout['id'],
  art: HTMLImageElement | null,
  details: TcgCardDetails,
  width: number,
  height: number,
) {
  context.fillStyle = PALETTE.paper;
  context.fillRect(0, 0, width, height);

  if (layoutId === 'TCG-L004') {
    drawImageOrPlaceholder(context, art, { x: 0, y: 0, width, height });
    drawGradient(
      context,
      0,
      0,
      width,
      height * 0.27,
      ['rgba(12,17,20,.88)', 'rgba(12,17,20,0)'],
      true,
    );
    drawGradient(
      context,
      0,
      height * 0.62,
      width,
      height * 0.38,
      ['rgba(12,17,20,0)', 'rgba(12,17,20,.9)'],
      true,
    );
    drawTitle(context, details.name, 42, 64, width - 84, 30, '#ffffff');
    drawTextBlock(context, details.type, 44, 112, width - 88, 20, '#f1f0ec', 1);
    drawTextBlock(context, details.rules, 44, height * 0.79, width - 88, 18, '#ffffff', 7);
    return;
  }

  const pad = 42;
  drawRoundedRect(context, 12, 12, width - 24, height - 24, 22, PALETTE.paper, '#31383d', 4);

  if (layoutId === 'TCG-L003') {
    drawImageOrPlaceholder(context, art, {
      x: 22,
      y: 22,
      width: width - 44,
      height: height * 0.68,
    });
    drawTitle(context, details.name, pad, height * 0.725, width - 2 * pad, 29, PALETTE.ink);
    drawTextBlock(
      context,
      details.type,
      pad,
      height * 0.775,
      width - 2 * pad,
      17,
      PALETTE.muted,
      1,
    );
    drawRulePanel(context, details.rules, pad, height * 0.82, width - 2 * pad, height * 0.13);
    return;
  }

  if (layoutId === 'TCG-L010') {
    drawTitle(context, details.name, pad, 48, width - 2 * pad, 30, PALETTE.ink);
    drawImageOrPlaceholder(context, art, {
      x: pad,
      y: 100,
      width: width - 2 * pad,
      height: height * 0.66,
    });
    drawTextBlock(context, details.type, pad, height * 0.79, width - 2 * pad, 18, PALETTE.muted, 1);
    drawRulePanel(context, details.rules, pad, height * 0.83, width - 2 * pad, height * 0.11);
    return;
  }

  if (layoutId === 'TCG-L011') {
    drawTitle(context, details.name, pad, 48, width - 2 * pad, 28, PALETTE.ink);
    const contentTop = 104;
    const contentHeight = height * 0.72;
    const artWidth = width * 0.59;
    drawImageOrPlaceholder(context, art, {
      x: pad,
      y: contentTop,
      width: artWidth,
      height: contentHeight,
    });
    const railX = pad + artWidth + 20;
    const railWidth = width - railX - pad;
    context.fillStyle = '#e8e6df';
    context.fillRect(railX, contentTop, railWidth, contentHeight);
    drawTextBlock(
      context,
      details.type,
      railX + 12,
      contentTop + 22,
      railWidth - 24,
      16,
      PALETTE.ink,
      5,
    );
    drawRulePanel(
      context,
      details.rules,
      pad,
      contentTop + contentHeight + 22,
      width - 2 * pad,
      height * 0.13,
    );
    return;
  }

  const headerHeight = layoutId === 'TCG-L002' ? 106 : 136;
  const artHeight = layoutId === 'TCG-L002' ? height * 0.64 : height * 0.56;
  drawTitle(context, details.name, pad, 47, width - 2 * pad, 29, PALETTE.ink);
  if (layoutId === 'TCG-L001') {
    drawTextBlock(context, details.type, pad, 88, width - 2 * pad, 16, PALETTE.muted, 1);
  }
  const artRect = { x: pad, y: headerHeight, width: width - 2 * pad, height: artHeight };
  drawImageOrPlaceholder(context, art, artRect);
  drawImageFrame(context, artRect);
  const footerTop = artRect.y + artRect.height + 23;
  if (layoutId === 'TCG-L002') {
    drawTextBlock(context, details.type, pad, footerTop, width - 2 * pad, 17, PALETTE.muted, 1);
    drawRulePanel(
      context,
      details.rules,
      pad,
      footerTop + 32,
      width - 2 * pad,
      height - footerTop - 64,
    );
  } else {
    drawRulePanel(context, details.rules, pad, footerTop, width - 2 * pad, height - footerTop - 42);
  }
}

function drawSplitNarrative(
  context: CanvasRenderingContext2D,
  details: TcgCardDetails[],
  artwork: Array<HTMLImageElement | null>,
  width: number,
  height: number,
) {
  context.fillStyle = PALETTE.paper;
  context.fillRect(0, 0, width, height);
  drawRoundedRect(context, 12, 12, width - 24, height - 24, 22, PALETTE.paper, '#31383d', 4);
  const pad = 38;
  const gap = 18;
  const columnWidth = (width - pad * 2 - gap) / 2;
  const artY = 116;
  const artHeight = height * 0.54;
  for (let index = 0; index < 2; index += 1) {
    const x = pad + index * (columnWidth + gap);
    drawImageOrPlaceholder(context, artwork[index] ?? null, {
      x,
      y: artY,
      width: columnWidth,
      height: artHeight,
    });
    drawImageFrame(context, { x, y: artY, width: columnWidth, height: artHeight });
    drawTitle(
      context,
      details[index]?.name ?? '',
      x + 10,
      artY + artHeight + 13,
      columnWidth - 20,
      18,
      PALETTE.ink,
    );
    drawTextBlock(
      context,
      details[index]?.type ?? '',
      x + 10,
      artY + artHeight + 42,
      columnWidth - 20,
      14,
      PALETTE.muted,
      1,
    );
    drawRulePanel(
      context,
      details[index]?.rules ?? '',
      x + 10,
      artY + artHeight + 72,
      columnWidth - 20,
      height - artY - artHeight - 116,
    );
  }
  context.strokeStyle = PALETTE.line;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(width / 2, artY);
  context.lineTo(width / 2, height - 38);
  context.stroke();
}

function drawSpreadCard(
  context: CanvasRenderingContext2D,
  rect: Rect,
  art: HTMLImageElement | null,
  details: TcgCardDetails | undefined,
  index: number,
) {
  const safeDetails = details ?? emptyDetails();
  context.fillStyle = PALETTE.paper;
  context.fillRect(rect.x, rect.y, rect.width, rect.height);
  const inset = 28;
  drawTitle(
    context,
    safeDetails.name,
    rect.x + inset,
    rect.y + 36,
    rect.width - inset * 2,
    27,
    PALETTE.ink,
  );
  drawTextBlock(
    context,
    safeDetails.type,
    rect.x + inset,
    rect.y + 78,
    rect.width - inset * 2,
    16,
    PALETTE.muted,
    1,
  );
  const artRect = {
    x: rect.x + inset,
    y: rect.y + 118,
    width: rect.width - inset * 2,
    height: rect.height * 0.62,
  };
  drawImageOrPlaceholder(context, art, artRect);
  drawImageFrame(context, artRect);
  drawRulePanel(
    context,
    safeDetails.rules,
    rect.x + inset,
    artRect.y + artRect.height + 23,
    rect.width - inset * 2,
    rect.height * 0.19,
  );
  if (index === 0) {
    context.strokeStyle = '#31383d';
    context.lineWidth = 5;
    context.strokeRect(rect.x + 8, rect.y + 8, rect.width - 8, rect.height - 16);
  } else {
    context.strokeStyle = '#31383d';
    context.lineWidth = 5;
    context.strokeRect(rect.x, rect.y + 8, rect.width - 8, rect.height - 16);
  }
}

function drawGridCard(
  context: CanvasRenderingContext2D,
  rect: Rect,
  art: HTMLImageElement | null,
  details: TcgCardDetails | undefined,
) {
  const safeDetails = details ?? emptyDetails();
  context.fillStyle = PALETTE.paper;
  context.fillRect(rect.x, rect.y, rect.width, rect.height);
  const inset = 28;
  drawRoundedRect(
    context,
    rect.x + 8,
    rect.y + 8,
    rect.width - 16,
    rect.height - 16,
    14,
    PALETTE.paper,
    '#31383d',
    4,
  );
  drawTitle(
    context,
    safeDetails.name,
    rect.x + inset,
    rect.y + 32,
    rect.width - inset * 2,
    24,
    PALETTE.ink,
  );
  drawTextBlock(
    context,
    safeDetails.type,
    rect.x + inset,
    rect.y + 68,
    rect.width - inset * 2,
    15,
    PALETTE.muted,
    1,
  );
  const artRect = {
    x: rect.x + inset,
    y: rect.y + 100,
    width: rect.width - inset * 2,
    height: rect.height * 0.59,
  };
  drawImageOrPlaceholder(context, art, artRect);
  drawImageFrame(context, artRect);
  drawRulePanel(
    context,
    safeDetails.rules,
    rect.x + inset,
    artRect.y + artRect.height + 17,
    rect.width - inset * 2,
    rect.height * 0.17,
  );
}

function drawFrameBreak(
  context: CanvasRenderingContext2D,
  art: HTMLImageElement | null,
  details: TcgCardDetails,
  artwork: Array<HTMLImageElement | null>,
  masks: Map<string, HTMLImageElement | null>,
  width: number,
  height: number,
) {
  context.fillStyle = PALETTE.paper;
  context.fillRect(0, 0, width, height);
  drawRoundedRect(context, 12, 12, width - 24, height - 24, 22, PALETTE.paper, '#31383d', 4);
  const artRect = { x: 52, y: 166, width: width - 104, height: height * 0.57 };
  drawImageOrPlaceholder(context, art, artRect);

  const subjectMask = masks.get('subjectMask');
  const occlusionMask = masks.get('occlusionMask');
  if (art && subjectMask && occlusionMask) {
    const maskedSubject = createCanvas(width, height);
    const maskedContext = maskedSubject.getContext('2d');
    if (maskedContext) {
      drawImageOrPlaceholder(maskedContext, artwork[0] ?? art, { x: 0, y: 0, width, height });
      applyAlphaMask(maskedContext, subjectMask, width, height, 'destination-in');
      applyAlphaMask(maskedContext, occlusionMask, width, height, 'destination-out');
      context.drawImage(maskedSubject, 0, 0);
    }
  }

  drawImageFrame(context, artRect, 9);
  context.strokeStyle = '#31383d';
  context.lineWidth = 8;
  context.strokeRect(24, 24, width - 48, height - 48);
  drawTitle(context, details.name, 48, 54, width - 96, 28, PALETTE.ink);
  drawTextBlock(context, details.type, 48, 98, width - 96, 17, PALETTE.muted, 1);
  drawRulePanel(context, details.rules, 48, height * 0.78, width - 96, height * 0.16);
}

function applyAlphaMask(
  context: CanvasRenderingContext2D,
  maskImage: HTMLImageElement | null,
  width: number,
  height: number,
  operation: GlobalCompositeOperation,
) {
  if (!maskImage) return;
  const maskCanvas = makeAlphaMask(maskImage, width, height);
  context.save();
  context.globalCompositeOperation = operation;
  context.drawImage(maskCanvas, 0, 0);
  context.restore();
}

function makeAlphaMask(image: HTMLImageElement, width: number, height: number): HTMLCanvasElement {
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  if (!context) return canvas;
  context.drawImage(image, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height);
  for (let index = 0; index < pixels.data.length; index += 4) {
    const luminance =
      pixels.data[index] * 0.2126 +
      pixels.data[index + 1] * 0.7152 +
      pixels.data[index + 2] * 0.0722;
    pixels.data[index] = 255;
    pixels.data[index + 1] = 255;
    pixels.data[index + 2] = 255;
    pixels.data[index + 3] = Math.round((luminance / 255) * pixels.data[index + 3]);
  }
  context.putImageData(pixels, 0, 0);
  return canvas;
}

function drawFinish(
  context: CanvasRenderingContext2D,
  finish: TcgFinish,
  masks: Map<string, HTMLImageElement | null>,
  width: number,
  height: number,
) {
  const requiredMasks = finish.masks
    .map((key) => masks.get(key))
    .filter((image): image is HTMLImageElement => !!image);
  if (requiredMasks.length !== finish.masks.length) return;
  const layer = createCanvas(width, height);
  const layerContext = layer.getContext('2d');
  if (!layerContext) return;
  drawFinishArtwork(layerContext, finish.id, masks, width, height);

  const combinedMask = makeCombinedAlphaMask(requiredMasks, width, height);
  layerContext.save();
  layerContext.globalCompositeOperation = 'destination-in';
  layerContext.drawImage(combinedMask, 0, 0);
  layerContext.restore();
  context.drawImage(layer, 0, 0);
}

function drawFinishArtwork(
  context: CanvasRenderingContext2D,
  finishId: TcgFinish['id'],
  masks: Map<string, HTMLImageElement | null>,
  width: number,
  height: number,
) {
  const diagonal = context.createLinearGradient(0, 0, width, height);
  const horizontal = context.createLinearGradient(0, 0, width, 0);
  const vertical = context.createLinearGradient(0, 0, 0, height);

  switch (finishId) {
    case 'TCG-F001':
      diagonal.addColorStop(0, 'rgba(255,72,114,.35)');
      diagonal.addColorStop(0.22, 'rgba(255,218,93,.39)');
      diagonal.addColorStop(0.46, 'rgba(91,233,205,.34)');
      diagonal.addColorStop(0.7, 'rgba(97,135,255,.4)');
      diagonal.addColorStop(1, 'rgba(227,97,255,.34)');
      context.fillStyle = diagonal;
      context.fillRect(0, 0, width, height);
      drawSheen(context, width, height, 'rgba(255,255,255,.38)', 0.16, 0.22);
      break;
    case 'TCG-F002':
      vertical.addColorStop(0, 'rgba(20,37,58,.48)');
      vertical.addColorStop(0.18, 'rgba(255,255,255,.32)');
      vertical.addColorStop(0.42, 'rgba(108,149,181,.23)');
      vertical.addColorStop(0.7, 'rgba(245,250,255,.43)');
      vertical.addColorStop(1, 'rgba(34,52,68,.4)');
      context.fillStyle = vertical;
      context.fillRect(0, 0, width, height);
      break;
    case 'TCG-F003':
      diagonal.addColorStop(0, 'rgba(81,45,5,.55)');
      diagonal.addColorStop(0.25, 'rgba(255,231,135,.8)');
      diagonal.addColorStop(0.5, 'rgba(186,126,24,.72)');
      diagonal.addColorStop(0.73, 'rgba(255,248,194,.83)');
      diagonal.addColorStop(1, 'rgba(108,62,9,.62)');
      context.fillStyle = diagonal;
      context.fillRect(0, 0, width, height);
      drawSheen(context, width, height, 'rgba(255,255,240,.58)', 0.09, 0.07);
      break;
    case 'TCG-F004':
      horizontal.addColorStop(0, 'rgba(39,48,57,.45)');
      horizontal.addColorStop(0.22, 'rgba(246,249,251,.75)');
      horizontal.addColorStop(0.44, 'rgba(133,148,157,.36)');
      horizontal.addColorStop(0.7, 'rgba(255,255,255,.72)');
      horizontal.addColorStop(1, 'rgba(51,61,69,.43)');
      context.fillStyle = horizontal;
      context.fillRect(0, 0, width, height);
      break;
    case 'TCG-F005':
      context.fillStyle = 'rgba(63,82,111,.2)';
      context.fillRect(0, 0, width, height);
      for (let index = 0; index < 190; index += 1) {
        const x = (((index * 131 + 47) % 997) / 997) * width;
        const y = (((index * 281 + 13) % 991) / 991) * height;
        const size = 3 + (index % 4) * 1.5;
        context.save();
        context.translate(x, y);
        context.rotate(((index % 2 ? 1 : -1) * Math.PI) / 4);
        context.fillStyle = ['#fff2bd', '#92e8e6', '#ffb3d0', '#b4c7ff'][index % 4];
        context.fillRect(-size, -size / 2, size * 2, size);
        context.restore();
      }
      break;
    case 'TCG-F006':
      diagonal.addColorStop(0, 'rgba(67,76,81,.38)');
      diagonal.addColorStop(0.3, 'rgba(232,237,236,.56)');
      diagonal.addColorStop(0.54, 'rgba(105,115,119,.41)');
      diagonal.addColorStop(0.78, 'rgba(250,251,245,.55)');
      diagonal.addColorStop(1, 'rgba(55,64,69,.37)');
      context.fillStyle = diagonal;
      context.fillRect(0, 0, width, height);
      drawHatch(context, width, height, 'rgba(35,49,55,.27)', 12, 0.9);
      break;
    case 'TCG-F007':
      horizontal.addColorStop(0, 'rgba(35,47,58,.42)');
      horizontal.addColorStop(0.28, 'rgba(226,242,246,.62)');
      horizontal.addColorStop(0.52, 'rgba(101,139,158,.37)');
      horizontal.addColorStop(0.8, 'rgba(250,255,255,.74)');
      horizontal.addColorStop(1, 'rgba(34,54,67,.4)');
      context.fillStyle = horizontal;
      context.fillRect(0, 0, width, height);
      drawHatch(context, width, height, 'rgba(255,255,255,.3)', 22, 1.5);
      break;
    case 'TCG-F008':
      diagonal.addColorStop(0, 'rgba(39,68,100,.4)');
      diagonal.addColorStop(0.24, 'rgba(114,224,230,.55)');
      diagonal.addColorStop(0.5, 'rgba(245,247,251,.38)');
      diagonal.addColorStop(0.76, 'rgba(175,119,245,.5)');
      diagonal.addColorStop(1, 'rgba(50,42,101,.42)');
      context.fillStyle = diagonal;
      context.fillRect(0, 0, width, height);
      drawSheen(context, width, height, 'rgba(255,255,255,.35)', 0.12, 0.2);
      break;
    case 'TCG-F009':
      context.fillStyle = 'rgba(255,255,255,.2)';
      context.fillRect(0, 0, width, height);
      drawSheen(context, width, height, 'rgba(255,255,255,.62)', 0.2, 0.09);
      break;
    case 'TCG-F010':
      context.fillStyle = 'rgba(248,253,255,.46)';
      context.fillRect(0, 0, width, height);
      drawSheen(context, width, height, 'rgba(255,255,255,.8)', 0.24, 0.075);
      drawHatch(context, width, height, 'rgba(39,54,70,.23)', 17, 1.4);
      break;
    case 'TCG-F011':
      vertical.addColorStop(0, 'rgba(75,85,89,.1)');
      vertical.addColorStop(0.48, 'rgba(255,255,255,.17)');
      vertical.addColorStop(1, 'rgba(75,85,89,.1)');
      context.fillStyle = vertical;
      context.fillRect(0, 0, width, height);
      break;
    case 'TCG-F012':
      vertical.addColorStop(0, 'rgba(40,46,50,.18)');
      vertical.addColorStop(0.26, 'rgba(255,255,255,.32)');
      vertical.addColorStop(0.52, 'rgba(167,178,183,.12)');
      vertical.addColorStop(0.77, 'rgba(255,255,255,.27)');
      vertical.addColorStop(1, 'rgba(47,56,63,.15)');
      context.fillStyle = vertical;
      context.fillRect(0, 0, width, height);
      break;
    case 'TCG-F013':
      diagonal.addColorStop(0, 'rgba(255,92,187,.26)');
      diagonal.addColorStop(0.28, 'rgba(87,229,220,.34)');
      diagonal.addColorStop(0.56, 'rgba(250,225,104,.3)');
      diagonal.addColorStop(0.8, 'rgba(113,129,255,.38)');
      diagonal.addColorStop(1, 'rgba(234,96,162,.28)');
      context.fillStyle = diagonal;
      context.fillRect(0, 0, width, height);
      drawHoloPattern(context, width, height);
      break;
    case 'TCG-F014':
      context.fillStyle = 'rgba(238,223,244,.2)';
      context.fillRect(0, 0, width, height);
      const pearl = context.createRadialGradient(
        width * 0.36,
        height * 0.33,
        12,
        width * 0.56,
        height * 0.45,
        width * 0.85,
      );
      pearl.addColorStop(0, 'rgba(255,245,252,.48)');
      pearl.addColorStop(0.42, 'rgba(184,241,236,.2)');
      pearl.addColorStop(0.72, 'rgba(238,194,242,.24)');
      pearl.addColorStop(1, 'rgba(255,255,255,0)');
      context.fillStyle = pearl;
      context.fillRect(0, 0, width, height);
      break;
    case 'TCG-F015':
      diagonal.addColorStop(0, 'rgba(86,48,8,.65)');
      diagonal.addColorStop(0.3, 'rgba(255,228,119,.9)');
      diagonal.addColorStop(0.52, 'rgba(174,107,15,.72)');
      diagonal.addColorStop(0.76, 'rgba(255,246,195,.9)');
      diagonal.addColorStop(1, 'rgba(71,48,17,.68)');
      context.fillStyle = diagonal;
      context.fillRect(0, 0, width, height);
      drawHatch(context, width, height, 'rgba(255,255,255,.4)', 18, 1.5);
      break;
    case 'TCG-F016':
      context.fillStyle = 'rgba(205,202,190,.18)';
      context.fillRect(0, 0, width, height);
      drawLinen(context, width, height);
      break;
    case 'TCG-F017':
      context.fillStyle = 'rgba(165,255,33,.64)';
      context.fillRect(0, 0, width, height);
      drawSheen(context, width, height, 'rgba(248,255,113,.76)', 0.13, 0.08);
      break;
    case 'TCG-F018':
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
      break;
  }

  const normal = masks.get('normalMap');
  if (normal && finishId === 'TCG-F007') {
    context.globalCompositeOperation = 'source-atop';
    context.globalAlpha = 0.16;
    context.drawImage(normal, 0, 0, width, height);
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';
  }
}

function makeCombinedAlphaMask(images: HTMLImageElement[], width: number, height: number) {
  const combined = createCanvas(width, height);
  const context = combined.getContext('2d');
  if (!context) return combined;
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.globalCompositeOperation = 'destination-in';
  for (const image of images) context.drawImage(makeAlphaMask(image, width, height), 0, 0);
  context.globalCompositeOperation = 'source-over';
  return combined;
}

function drawImageOrPlaceholder(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  rect: Rect,
) {
  context.save();
  context.beginPath();
  context.rect(rect.x, rect.y, rect.width, rect.height);
  context.clip();
  if (image) {
    drawImageCover(context, image, rect);
  } else {
    context.fillStyle = PALETTE.artField;
    context.fillRect(rect.x, rect.y, rect.width, rect.height);
    context.strokeStyle = '#b3b9ba';
    context.lineWidth = 1;
    const step = 28;
    for (let offset = -rect.height; offset < rect.width; offset += step) {
      context.beginPath();
      context.moveTo(rect.x + offset, rect.y);
      context.lineTo(rect.x + offset + rect.height, rect.y + rect.height);
      context.stroke();
    }
    context.fillStyle = '#444d53';
    context.font = '600 18px system-ui, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(
      'Cargar ilustración',
      rect.x + rect.width / 2,
      rect.y + rect.height / 2,
      rect.width - 24,
    );
  }
  context.restore();
}

function drawImageCover(context: CanvasRenderingContext2D, image: HTMLImageElement, rect: Rect) {
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  if (!imageWidth || !imageHeight) return;
  const scale = Math.max(rect.width / imageWidth, rect.height / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  context.drawImage(
    image,
    rect.x + (rect.width - width) / 2,
    rect.y + (rect.height - height) / 2,
    width,
    height,
  );
}

function drawImageFrame(context: CanvasRenderingContext2D, rect: Rect, lineWidth = 2) {
  context.strokeStyle = '#4d555a';
  context.lineWidth = lineWidth;
  context.strokeRect(rect.x, rect.y, rect.width, rect.height);
}

function drawRulePanel(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  context.fillStyle = '#e8e5dd';
  context.fillRect(x, y, width, height);
  context.fillStyle = PALETTE.accent;
  context.fillRect(x, y, 5, height);
  drawTextBlock(
    context,
    text,
    x + 16,
    y + 12,
    width - 32,
    16,
    PALETTE.ink,
    Math.max(1, Math.floor(height / 21)),
  );
}

function drawTitle(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  fontSize: number,
  color: string,
) {
  if (!text.trim()) return;
  context.save();
  context.font = `700 ${fontSize}px system-ui, sans-serif`;
  context.textAlign = 'left';
  context.textBaseline = 'top';
  context.fillStyle = color;
  context.fillText(text.trim(), x, y, width);
  context.restore();
}

function drawTextBlock(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  fontSize: number,
  color: string,
  maxLines: number,
) {
  if (!text.trim()) return;
  context.save();
  context.font = `400 ${fontSize}px system-ui, sans-serif`;
  context.textAlign = 'left';
  context.textBaseline = 'top';
  context.fillStyle = color;
  const lines = wrapText(context, text, width, maxLines);
  lines.forEach((line, index) => context.fillText(line, x, y + index * (fontSize + 5), width));
  context.restore();
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  width: number,
  maxLines: number,
): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = '';
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (line && context.measureText(next).width > width) {
        lines.push(line);
        line = word;
        if (lines.length >= maxLines) return ellipsizeLastLine(context, lines, width);
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
    if (lines.length >= maxLines) return ellipsizeLastLine(context, lines, width);
  }
  return lines;
}

function ellipsizeLastLine(context: CanvasRenderingContext2D, lines: string[], width: number) {
  const visible = lines.slice(0, Math.max(1, lines.length));
  let last = visible[visible.length - 1] ?? '';
  while (last && context.measureText(`${last}…`).width > width) last = last.slice(0, -1);
  if (visible.length > 0) visible[visible.length - 1] = `${last.trimEnd()}…`;
  return visible;
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string,
  stroke: string,
  lineWidth: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
  context.fillStyle = fill;
  context.fill();
  context.strokeStyle = stroke;
  context.lineWidth = lineWidth;
  context.stroke();
}

function drawGradient(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  colors: string[],
  vertical: boolean,
) {
  const gradient = vertical
    ? context.createLinearGradient(x, y, x, y + height)
    : context.createLinearGradient(x, y, x + width, y);
  colors.forEach((color, index) => gradient.addColorStop(index / (colors.length - 1), color));
  context.fillStyle = gradient;
  context.fillRect(x, y, width, height);
}

function drawSheen(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  center: number,
  span: number,
) {
  const gradient = context.createLinearGradient(
    width * (center - span),
    0,
    width * (center + span),
    height,
  );
  gradient.addColorStop(0, 'rgba(255,255,255,0)');
  gradient.addColorStop(0.5, color);
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function drawHatch(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  spacing: number,
  lineWidth: number,
) {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  for (let offset = -height; offset < width + height; offset += spacing) {
    context.beginPath();
    context.moveTo(offset, 0);
    context.lineTo(offset - height, height);
    context.stroke();
  }
  context.restore();
}

function drawHoloPattern(context: CanvasRenderingContext2D, width: number, height: number) {
  context.save();
  for (let y = -36; y < height + 36; y += 44) {
    for (let x = -36; x < width + 36; x += 44) {
      context.strokeStyle =
        ((x + y) / 44) % 2 === 0 ? 'rgba(255,255,255,.52)' : 'rgba(22,65,103,.38)';
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(x, y - 14);
      context.lineTo(x + 14, y);
      context.lineTo(x, y + 14);
      context.lineTo(x - 14, y);
      context.closePath();
      context.stroke();
    }
  }
  context.restore();
}

function drawLinen(context: CanvasRenderingContext2D, width: number, height: number) {
  context.save();
  for (let y = 0; y <= height; y += 8) {
    context.strokeStyle = y % 16 === 0 ? 'rgba(55,65,66,.22)' : 'rgba(255,255,255,.2)';
    context.lineWidth = 1.2;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  for (let x = 0; x <= width; x += 8) {
    context.strokeStyle = x % 16 === 0 ? 'rgba(255,255,255,.22)' : 'rgba(55,65,66,.18)';
    context.lineWidth = 1.2;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  context.restore();
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function emptyDetails(): TcgCardDetails {
  return { name: '', type: '', rules: '' };
}
