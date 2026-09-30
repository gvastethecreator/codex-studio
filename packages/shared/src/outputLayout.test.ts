import { describe, expect, it } from 'vitest';
import { formatOutputRelativePath, promptFileSlug, styleFileSlug } from './outputLayout';

const createdAt = new Date(2026, 8, 28, 20, 44, 33);
const organization = { subfolderTokens: [], fileNameTemplate: '{date}_{style}_{prompt}' };

describe('output file names', () => {
  it('names a file by date, style and the meaningful words of the prompt', () => {
    expect(
      formatOutputRelativePath(organization, {
        jobId: 'job-1',
        promptText: 'A small wise owl perched on a brass lantern, woodcut ink',
        styleName: 'Kodak Portra 400 - Alec Soth River Portraits',
        createdAt,
        extension: '.png',
      }),
    ).toBe('2026-09-28_kodak-portra-400_small-wise-owl-perched-brass-lantern.png');
  });

  it('leaves no doubled separator when a token is empty', () => {
    expect(
      formatOutputRelativePath(organization, {
        jobId: 'job-1',
        promptText: 'Un búho sabio en la linterna',
        createdAt,
        extension: '.webp',
      }),
    ).toBe('2026-09-28_buho-sabio-linterna.webp');
    expect(
      formatOutputRelativePath(organization, { jobId: 'job-1', createdAt, extension: '.png' }),
    ).toBe('2026-09-28.png');
  });

  it('keeps style mixes and drops their reference artists', () => {
    expect(styleFileSlug('Studio Headshot - Peter Hurley + Film Noir - John Alton')).toBe(
      'studio-headshot+film-noir',
    );
    expect(promptFileSlug('')).toBe('');
    expect(promptFileSlug("A cozy artist's attic studio")).toBe('cozy-artists-attic-studio');
  });
});
