import React, { useRef, useState } from 'react';
import { Xmark as X } from 'iconoir-react';
import type { GeneratedImage } from '../types';
import {
  DEFAULT_IMAGE_CONVERSION_OPTIONS,
  type ImageConversionOptions,
  type ImageConversionRequest,
} from '../packages/shared/src/imageConversion';
import {
  convertCatalogImage,
  downloadConvertedCatalogImage,
} from '../services/studio-api/imageConversion';
import { useDialogFocus } from '../hooks/useDialogFocus';
import Slider from './ui/Slider';

type ConversionItem = {
  image: GeneratedImage;
  status: 'pending' | 'processing' | 'complete' | 'error';
  filename?: string;
  sourceBytes?: number;
  outputBytes?: number;
  blob?: Blob;
  error?: string;
};

function imageName(image: GeneratedImage) {
  return image.localPath?.split(/[\\/]/).pop() || image.id;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function sizeChange(source: number, output: number) {
  if (source <= 0) return formatBytes(output);
  const difference = output - source;
  const percent = Math.trunc((Math.abs(difference) / source) * 1000) / 10;
  const change =
    difference === 0
      ? 'same size'
      : `${percent === 0 ? '<0.1' : percent}% ${difference < 0 ? 'smaller' : 'larger'}`;
  return `${formatBytes(source)} → ${formatBytes(output)} (${change})`;
}

const fieldClass = 'studio-field min-h-10 w-full px-3 py-2 text-sm';
const buttonClass =
  'min-h-10 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed';

export default function ImageConversionModal({
  images,
  onClose,
}: {
  images: GeneratedImage[];
  onClose: () => void;
}) {
  const [options, setOptions] = useState<ImageConversionOptions>(() => ({
    ...DEFAULT_IMAGE_CONVERSION_OPTIONS,
  }));
  const [destination, setDestination] = useState<ImageConversionRequest['destination']>('library');
  const [items, setItems] = useState<ConversionItem[]>(() =>
    images.map((image) => ({ image, status: 'pending' })),
  );
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [preparingDownload, setPreparingDownload] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const runningRef = useRef(false);
  const stopRef = useRef(false);
  const close = () => {
    if (runningRef.current) {
      stopRef.current = true;
      setStopping(true);
    } else if (!preparingDownload) onClose();
  };
  const dialogRef = useDialogFocus(true, close, undefined, '[name="conversion-format"]');
  const completed = items.filter((item) => item.status === 'complete');
  const failed = items.filter((item) => item.status === 'error');
  const remaining = items.filter((item) => item.status !== 'complete');
  const patchItem = (id: string, patch: Partial<ConversionItem>) => {
    setItems((current) =>
      current.map((item) => (item.image.id === id ? { ...item, ...patch } : item)),
    );
  };

  const convert = async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    stopRef.current = false;
    setBusy(true);
    setStarted(true);
    setStopping(false);
    setDownloadError(null);
    try {
      for (const item of remaining) {
        if (stopRef.current) break;
        patchItem(item.image.id, { status: 'processing', error: undefined });
        try {
          const result =
            destination === 'library'
              ? await convertCatalogImage(item.image.id, options)
              : await downloadConvertedCatalogImage(item.image.id, options);
          patchItem(item.image.id, {
            status: 'complete',
            filename: result.filename,
            sourceBytes: result.sourceBytes,
            outputBytes: result.outputBytes,
            blob: 'blob' in result ? result.blob : undefined,
          });
        } catch (error) {
          patchItem(item.image.id, {
            status: 'error',
            error: error instanceof Error ? error.message : 'Could not convert this image.',
          });
        }
      }
    } finally {
      runningRef.current = false;
      setBusy(false);
      setStopping(false);
    }
  };

  const download = async () => {
    if (preparingDownload || !completed.length) return;
    setPreparingDownload(true);
    setDownloadError(null);
    try {
      const { saveAs } = await import('file-saver');
      if (completed.length === 1) {
        saveAs(completed[0].blob!, completed[0].filename!);
      } else {
        const { default: JSZip } = await import('jszip');
        const zip = new JSZip();
        // One folder per selection position preserves original filenames without ZIP collisions.
        completed.forEach((item) => {
          const position = items.findIndex((candidate) => candidate.image.id === item.image.id) + 1;
          zip.file(`${String(position).padStart(6, '0')}/${item.filename!}`, item.blob!);
        });
        saveAs(await zip.generateAsync({ type: 'blob' }), `converted-images-${Date.now()}.zip`);
      }
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Could not prepare the download.');
    } finally {
      setPreparingDownload(false);
    }
  };

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4 studio-scrim backdrop-blur-md">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="conversion-title"
        tabIndex={-1}
        className="studio-dialog flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden text-[color:var(--wb-ink)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[color:var(--wb-line)] p-6">
          <div>
            <h2 id="conversion-title" className="text-base font-semibold">
              Convert or compress images
            </h2>
            <p className="mt-2 text-sm text-[color:var(--wb-muted)]">
              {images.length} {images.length === 1 ? 'image' : 'images'} selected. Originals stay
              unchanged.
            </p>
          </div>
          <button
            type="button"
            aria-label={busy ? 'Stop after current image' : 'Close image conversion'}
            onClick={close}
            disabled={preparingDownload}
            className="rounded-[var(--wb-radius)] p-2 hover:bg-white/5"
          >
            <X width={18} height={18} />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto p-6 space-y-5">
          <fieldset disabled={started} className="space-y-5 disabled:opacity-70">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="block">Format</span>
                <select
                  name="conversion-format"
                  className={fieldClass}
                  value={options.format}
                  onChange={(event) =>
                    setOptions((current) => ({
                      ...current,
                      format: event.target.value as ImageConversionOptions['format'],
                    }))
                  }
                >
                  <option value="jpeg">JPG</option>
                  <option value="webp">WebP</option>
                  <option value="png">PNG</option>
                </select>
              </label>
              <label className="space-y-2 text-sm">
                <span className="block">Destination</span>
                <select
                  className={fieldClass}
                  value={destination}
                  onChange={(event) =>
                    setDestination(event.target.value as ImageConversionRequest['destination'])
                  }
                >
                  <option value="library">Save copies in Library</option>
                  <option value="download">Download</option>
                </select>
              </label>
            </div>
            {options.format === 'webp' && (
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={options.lossless}
                  onChange={(event) =>
                    setOptions((current) => ({ ...current, lossless: event.target.checked }))
                  }
                />{' '}
                Lossless WebP
              </label>
            )}
            {options.format === 'jpeg' || (options.format === 'webp' && !options.lossless) ? (
              <div className="space-y-2">
                <Slider
                  label="Image quality"
                  value={options.quality}
                  min={1}
                  max={100}
                  onChange={(quality) => setOptions((current) => ({ ...current, quality }))}
                />
                <p className="text-xs text-[color:var(--wb-muted)]">
                  Lower quality usually produces smaller files and changes image detail.
                </p>
              </div>
            ) : null}
            {options.format === 'png' && (
              <div className="space-y-2">
                <Slider
                  label="PNG compression"
                  value={options.pngCompressionLevel}
                  min={0}
                  max={9}
                  onChange={(pngCompressionLevel) =>
                    setOptions((current) => ({ ...current, pngCompressionLevel }))
                  }
                />
                <p className="text-xs text-[color:var(--wb-muted)]">
                  Lossless: preserves image detail and transparency. Level 9 uses more time to
                  compress. An already optimized PNG may not get smaller.
                </p>
              </div>
            )}
            {options.format === 'webp' && options.lossless && (
              <p className="text-xs text-[color:var(--wb-muted)]">
                Lossless WebP preserves image detail and transparency in 8-bit images. Choose PNG to
                preserve 16-bit images.
              </p>
            )}
            {options.format === 'jpeg' && (
              <label className="flex flex-wrap items-center gap-3 text-sm">
                <span>JPG background</span>
                <input
                  type="color"
                  aria-label="JPG background"
                  value={options.background}
                  onChange={(event) =>
                    setOptions((current) => ({ ...current, background: event.target.value }))
                  }
                  className="h-9 w-14 cursor-pointer rounded"
                />
                <span className="text-xs text-[color:var(--wb-muted)]">
                  Fills transparent areas. JPG does not support transparency.
                </span>
              </label>
            )}
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={options.preserveMetadata}
                onChange={(event) =>
                  setOptions((current) => ({ ...current, preserveMetadata: event.target.checked }))
                }
                className="mt-1"
              />
              <span>
                Preserve image metadata
                <span className="mt-1 block text-xs text-[color:var(--wb-muted)]">
                  Keeps the embedded prompt, model, EXIF and descriptive metadata when available.
                  Turn off to remove them. The color profile is always kept to preserve appearance.
                </span>
              </span>
            </label>
          </fieldset>
          {started && (
            <div className="space-y-3">
              <p role="status" className="text-sm">
                {stopping
                  ? 'Stopping after the current image…'
                  : busy
                    ? `Converting… ${completed.length} of ${items.length} complete.`
                    : `${completed.length} of ${items.length} ${destination === 'library' ? 'copies saved' : 'images ready to download'}.`}
              </p>
              <ul aria-label="Conversion results" className="space-y-3">
                {items.map((item) => (
                  <li
                    key={item.image.id}
                    className="rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] p-3 text-sm"
                  >
                    <p className="break-all font-medium">
                      {item.filename ?? imageName(item.image)}
                    </p>
                    {item.status === 'complete' ? (
                      <p className="mt-1 text-xs text-[color:var(--wb-muted)]">
                        {sizeChange(item.sourceBytes!, item.outputBytes!)}
                      </p>
                    ) : item.status === 'error' ? (
                      <p role="alert" className="mt-1 text-xs text-[color:var(--wb-danger)]">
                        {item.error}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-[color:var(--wb-muted)]">
                        {item.status === 'processing' ? 'Converting…' : 'Waiting'}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {downloadError && (
            <p role="alert" className="text-sm text-[color:var(--wb-danger)]">
              {downloadError}
            </p>
          )}
        </div>
        <div className="flex flex-wrap justify-end gap-3 border-t border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-6">
          <button
            type="button"
            onClick={close}
            disabled={stopping || preparingDownload}
            className={buttonClass}
          >
            {busy ? 'Stop after current' : started ? 'Done' : 'Cancel'}
          </button>
          {destination === 'download' && completed.length > 0 && !busy && (
            <button
              type="button"
              onClick={() => void download()}
              disabled={preparingDownload}
              className={buttonClass}
            >
              {preparingDownload
                ? 'Preparing download…'
                : completed.length === 1
                  ? 'Download image'
                  : `Download ${completed.length} images (ZIP)`}
            </button>
          )}
          {remaining.length > 0 && (
            <button
              type="button"
              onClick={() => void convert()}
              disabled={busy || preparingDownload}
              className={`${buttonClass} bg-accent-500/15 text-accent-100`}
            >
              {busy
                ? 'Converting…'
                : started
                  ? failed.length === remaining.length
                    ? 'Retry failed images'
                    : 'Continue conversion'
                  : destination === 'library'
                    ? images.length === 1
                      ? 'Save copy'
                      : 'Save copies'
                    : 'Convert for download'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
