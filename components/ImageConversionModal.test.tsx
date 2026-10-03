/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { GeneratedImage } from '../types';
import ImageConversionModal from './ImageConversionModal';
import { DEFAULT_IMAGE_CONVERSION_OPTIONS } from '../packages/shared/src/imageConversion';

const { convert, download, saveAs } = vi.hoisted(() => ({
  convert: vi.fn(),
  download: vi.fn(),
  saveAs: vi.fn(),
}));
vi.mock('../services/studio-api/imageConversion', () => ({
  convertCatalogImage: convert,
  downloadConvertedCatalogImage: download,
}));
vi.mock('file-saver', () => ({ saveAs }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const images: GeneratedImage[] = ['one', 'two'].map((id) => ({
  id,
  src: `/library/${id}.png`,
  localPath: `${id}.png`,
  mimeType: 'image/png',
  batchId: 'batch',
  createdAt: 1,
}));
const result = { image: {}, filename: 'copy.webp', sourceBytes: 2000, outputBytes: 1000 };

describe('ImageConversionModal', () => {
  it('exposes format controls and sends the chosen settings for a library copy', async () => {
    convert.mockResolvedValue(result);
    render(<ImageConversionModal images={[images[0]]} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Lossless WebP' }));
    expect(screen.queryByRole('slider', { name: 'Image quality' })).toBeNull();
    fireEvent.change(screen.getByRole('combobox', { name: 'Format' }), {
      target: { value: 'png' },
    });
    expect(screen.queryByRole('slider', { name: 'Image quality' })).toBeNull();
    expect(screen.getByRole('slider', { name: 'PNG compression' }).getAttribute('max')).toBe('9');
    fireEvent.change(screen.getByRole('combobox', { name: 'Format' }), {
      target: { value: 'jpeg' },
    });
    fireEvent.change(screen.getByRole('slider', { name: 'Image quality' }), {
      target: { value: '72' },
    });
    fireEvent.change(screen.getByLabelText('JPG background'), { target: { value: '#ff0000' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /Preserve image metadata/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Save copy' }));
    await screen.findByText('2.0 KB → 1000 B (50% smaller)');
    expect(convert).toHaveBeenCalledWith('one', {
      ...DEFAULT_IMAGE_CONVERSION_OPTIONS,
      format: 'jpeg',
      lossless: true,
      quality: 72,
      background: '#ff0000',
      preserveMetadata: false,
    });
  });

  it('converts sequentially and retries failures without creating completed copies again', async () => {
    let finishFirst!: (value: typeof result) => void;
    convert
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishFirst = resolve;
          }),
      )
      .mockRejectedValueOnce(new Error('Source image is missing.'))
      .mockResolvedValueOnce({ ...result, outputBytes: 3000 });
    render(<ImageConversionModal images={images} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save copies' }));
    expect(convert).toHaveBeenCalledTimes(1);
    await act(async () => finishFirst(result));
    await screen.findByRole('alert');
    expect(screen.getByRole('alert').textContent).toBe('Source image is missing.');
    fireEvent.click(screen.getByRole('button', { name: 'Retry failed images' }));
    await screen.findByText('2.0 KB → 2.9 KB (50% larger)');
    expect(convert.mock.calls.map(([id]) => id)).toEqual(['one', 'two', 'two']);
    expect(screen.queryByRole('button', { name: 'Retry failed images' })).toBeNull();
  });

  it('offers the converted download without saving a library copy', async () => {
    const blob = new Blob(['converted'], { type: 'image/webp' });
    download.mockResolvedValue({ ...result, blob });
    render(<ImageConversionModal images={[images[0]]} onClose={vi.fn()} />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Destination' }), {
      target: { value: 'download' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Convert for download' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Download image' }));
    await waitFor(() => expect(saveAs).toHaveBeenCalledWith(blob, 'copy.webp'));
    expect(convert).not.toHaveBeenCalled();
  });
});
