import { describe, expect, it } from 'vitest';
import { formatOutputRelativePath, promptFileSlug, styleFileSlug } from './outputLayout';
import { createDefaultEditableStudioSettings } from './studioSettings';

const createdAt = new Date(2026, 8, 28, 20, 44, 33);
const organization = { subfolderTokens: [], fileNameTemplate: '{date}_{style}_{prompt}' };

describe('output file names', () => {
  it('sorts the default names by date, time and queued generation before prompt or style', () => {
    const layout = createDefaultEditableStudioSettings().outputOrganization;
    const queuedAt = new Date('2026-09-28T20:44:33Z');
    const inputs = [
      { generationNumber: 9, createdAt: queuedAt, promptText: 'Zebra' },
      { generationNumber: 10, createdAt: queuedAt, promptText: 'Apple' },
      { generationNumber: 11, createdAt: new Date('2026-09-28T20:44:34Z'), promptText: 'Bee' },
      { generationNumber: 12, createdAt: new Date('2026-09-29T00:00:00Z'), promptText: 'Ant' },
    ];
    const names = inputs.map((input) =>
      formatOutputRelativePath(layout, {
        ...input,
        jobId: `job-${input.generationNumber}`,
        extension: '.png',
      }),
    );
    expect(names[0]).toBe('2026-09-28_204433Z_000009_zebra.png');
    expect(names[1]).toBe('2026-09-28_204433Z_000010_apple.png');
    expect(names.toReversed().sort()).toEqual(names);
    const beforeClockRollback = formatOutputRelativePath(layout, {
      jobId: 'before-dst',
      generationNumber: 13,
      createdAt: new Date('2026-11-01T01:59:00-04:00'),
      extension: '.png',
    });
    const afterClockRollback = formatOutputRelativePath(layout, {
      jobId: 'after-dst',
      generationNumber: 14,
      createdAt: new Date('2026-11-01T01:01:00-05:00'),
      extension: '.png',
    });
    expect(beforeClockRollback).toBe('2026-11-01_055900Z_000013.png');
    expect(afterClockRollback).toBe('2026-11-01_060100Z_000014.png');
    expect(beforeClockRollback < afterClockRollback).toBe(true);
    expect(() => formatOutputRelativePath(layout, { jobId: 'missing', extension: '.png' })).toThrow(
      'generation number',
    );
  });
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
